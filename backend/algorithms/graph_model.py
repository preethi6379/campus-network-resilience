"""
Graph Model & Forest-Boundary Management
=========================================
Author: Avanish Ayyappan (Backend & Algorithm Lead)

Distinguishes between:
1. High-level Campus Network Graph (Nodes, Links, Services, Redundant Non-Tree Edges)
2. In-Memory Link-Cut Tree Forest (Spanning Tree Backbone maintaining O(log V) dynamic connectivity)

Handles the General Graph vs Dynamic Forest boundary:
- Maintains non-tree edges separately.
- Implements replacement-edge detection when a tree edge fails.
"""

from typing import Dict, List, Optional, Any, Set, Tuple
from backend.algorithms.link_cut_tree import LinkCutTree


class NetworkNode:
    def __init__(self, node_id: str, name: str, node_type: str, building_id: Optional[str] = None, x_pos: int = 0, y_pos: int = 0):
        self.id = node_id
        self.name = name
        self.node_type = node_type
        self.building_id = building_id
        self.x_pos = x_pos
        self.y_pos = y_pos

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "node_type": self.node_type,
            "building_id": self.building_id,
            "x_pos": self.x_pos,
            "y_pos": self.y_pos
        }


class NetworkLink:
    def __init__(self, link_id: str, source_id: str, target_id: str, latency_ms: float = 5.0, cost: int = 10, status: str = "ACTIVE", is_tree_edge: bool = True):
        self.id = link_id
        self.source_id = source_id
        self.target_id = target_id
        self.latency_ms = latency_ms
        self.cost = cost
        self.status = status          # 'ACTIVE', 'FAILED', 'RECOVERED', 'STANDBY'
        self.is_tree_edge = is_tree_edge  # True if part of primary LCT spanning forest

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "source": self.source_id,
            "target": self.target_id,
            "latency_ms": self.latency_ms,
            "cost": self.cost,
            "status": self.status,
            "is_tree_edge": self.is_tree_edge
        }


class CampusGraphModel:
    """
    Manages the campus network graph and synchronizes state with the Link-Cut Tree.
    """

    def __init__(self):
        self.nodes: Dict[str, NetworkNode] = {}
        self.links: Dict[str, NetworkLink] = {}
        self.services: Dict[str, Dict[str, Any]] = {}
        self.service_dependencies: Dict[str, Set[str]] = {} # service_id -> set of required node_ids
        self.lct: LinkCutTree = LinkCutTree()

    def add_node(self, node: NetworkNode) -> None:
        self.nodes[node.id] = node
        self.lct.get_or_create_node(node.id, val=0.0)

    def add_link(self, link: NetworkLink) -> bool:
        if link.source_id not in self.nodes or link.target_id not in self.nodes:
            raise ValueError(f"Invalid endpoints: {link.source_id} or {link.target_id} does not exist.")
        if link.source_id == link.target_id:
            raise ValueError("Self-loops are not permitted.")

        self.links[link.id] = link

        # If it's designated as an active tree edge, link it in the LCT
        if link.is_tree_edge and link.status in ("ACTIVE", "RECOVERED"):
            linked = self.lct.link(link.source_id, link.target_id, edge_val=link.latency_ms)
            if not linked:
                # If linking in LCT failed (e.g. introduces cycle), demote to non-tree redundant edge
                link.is_tree_edge = False
                link.status = "STANDBY"
                return False
        return True

    def register_service(self, service_id: str, name: str, description: str, required_nodes: List[str]) -> None:
        self.services[service_id] = {
            "id": service_id,
            "name": name,
            "description": description,
            "dependencies": required_nodes
        }
        self.service_dependencies[service_id] = set(required_nodes)

    def is_connected(self, u_id: str, v_id: str) -> bool:
        """Evaluates dynamic connectivity using LCT in O(log V) time."""
        return self.lct.connected(u_id, v_id)

    def fail_link(self, link_id: str) -> Dict[str, Any]:
        """
        Simulates link failure:
        - If tree edge: cuts from LCT in O(log V).
        - Changes status to FAILED.
        - Returns failure trace and disconnected components.
        """
        if link_id not in self.links:
            raise KeyError(f"Link {link_id} not found.")

        link = self.links[link_id]
        if link.status == "FAILED":
            return {"link_id": link_id, "already_failed": True, "trace": []}

        self.lct.clear_trace()
        was_tree = link.is_tree_edge

        if was_tree:
            cut_success = self.lct.cut(link.source_id, link.target_id)
        else:
            cut_success = True
            self.lct._log_step(
                op="cut_non_tree_link",
                target=link_id,
                explanation=f"Severed non-tree redundant backup link {link_id} ({link.source_id} - {link.target_id})."
            )

        link.status = "FAILED"
        trace = list(self.lct.trace)

        return {
            "link_id": link_id,
            "was_tree_edge": was_tree,
            "cut_success": cut_success,
            "trace": trace
        }

    def restore_link(self, link_id: str) -> Dict[str, Any]:
        """
        Restores a failed original link.
        - Reconnects in LCT in O(log V).
        - Sets status to ACTIVE / RECOVERED.
        """
        if link_id not in self.links:
            raise KeyError(f"Link {link_id} not found.")

        link = self.links[link_id]
        self.lct.clear_trace()

        linked = False
        if link.is_tree_edge:
            linked = self.lct.link(link.source_id, link.target_id, edge_val=link.latency_ms)

        link.status = "ACTIVE"
        trace = list(self.lct.trace)

        return {
            "link_id": link_id,
            "restored": True,
            "lct_linked": linked,
            "trace": trace
        }

    def find_replacement_candidates(self) -> List[Dict[str, Any]]:
        """
        Finds candidate non-tree / standby redundant links that can bridge
        currently disconnected components.
        """
        candidates = []
        for link in self.links.values():
            if link.status in ("STANDBY", "INACTIVE"):
                # Check if this link joins two currently disconnected components
                if not self.lct.connected(link.source_id, link.target_id):
                    candidates.append({
                        "link_id": link.id,
                        "source": link.source_id,
                        "target": link.target_id,
                        "source_name": self.nodes.get(link.source_id, NetworkNode(link.source_id, link.source_id, "UNKNOWN")).name,
                        "target_name": self.nodes.get(link.target_id, NetworkNode(link.target_id, link.target_id, "UNKNOWN")).name,
                        "latency_ms": link.latency_ms,
                        "cost": link.cost,
                        "reconnects": True,
                        "score": round(100.0 / (link.latency_ms * link.cost + 1), 2)
                    })

        # Rank candidates by lowest latency & cost (highest score)
        candidates.sort(key=lambda c: (c["latency_ms"], c["cost"]))
        return candidates

    def apply_recovery_link(self, link_id: str) -> Dict[str, Any]:
        """
        Activates a candidate recovery link in the LCT to restore partition connectivity.
        """
        if link_id not in self.links:
            raise KeyError(f"Recovery link {link_id} does not exist.")

        link = self.links[link_id]
        self.lct.clear_trace()

        # Link in LCT
        linked = self.lct.link(link.source_id, link.target_id, edge_val=link.latency_ms)
        if linked:
            link.status = "RECOVERED"
            link.is_tree_edge = True

        trace = list(self.lct.trace)
        return {
            "link_id": link_id,
            "success": linked,
            "trace": trace
        }

    def compute_service_impact(self, gateway_id: str = "NODE_GW") -> Dict[str, Any]:
        """
        Evaluates which campus services are online or impacted.
        A service is impacted if ANY of its dependent server/switch nodes
        are disconnected from the primary Gateway Router (NODE_GW).
        Complexity: O(S * D * log V) using LCT connectivity queries!
        """
        available_services = []
        impacted_services = []

        for s_id, s_info in self.services.items():
            deps = self.service_dependencies.get(s_id, set())
            is_operational = True
            missing_nodes = []

            for node_id in deps:
                if not self.lct.connected(gateway_id, node_id):
                    is_operational = False
                    missing_nodes.append(self.nodes[node_id].name if node_id in self.nodes else node_id)

            service_data = {
                "id": s_id,
                "name": s_info["name"],
                "description": s_info["description"],
                "dependencies": list(deps),
                "operational": is_operational,
                "missing_nodes": missing_nodes
            }

            if is_operational:
                available_services.append(service_data)
            else:
                impacted_services.append(service_data)

        return {
            "gateway_node": gateway_id,
            "total_services": len(self.services),
            "available_count": len(available_services),
            "impacted_count": len(impacted_services),
            "available": available_services,
            "impacted": impacted_services
        }

    def to_dict(self) -> Dict[str, Any]:
        """Returns the full network snapshot for API consumption."""
        return {
            "nodes": [n.to_dict() for n in self.nodes.values()],
            "links": [l.to_dict() for l in self.links.values()],
            "services": list(self.services.values())
        }
