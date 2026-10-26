"""
Network Orchestration Service
==============================
Author: Avanish Ayyappan (Backend & Integration Lead)

Coordinates the in-memory Link-Cut Tree with persistent database records.
Reconstructs dynamic forest state on startup and ensures transactions stay consistent.
"""

from typing import Dict, Any, List, Optional
from backend.algorithms.graph_model import CampusGraphModel, NetworkNode, NetworkLink
from backend.db.repository import NetworkRepository
from backend.db.connection import DatabaseConnection


class NetworkService:
    _instance: Optional['NetworkService'] = None

    def __init__(self):
        self.graph = CampusGraphModel()
        self.operation_traces: Dict[int, List[Dict[str, Any]]] = {}
        self.initialize_engine_from_db()

    @classmethod
    def get_instance(cls) -> 'NetworkService':
        if cls._instance is None:
            cls._instance = NetworkService()
        return cls._instance

    def initialize_engine_from_db(self) -> None:
        """Reconstructs the Link-Cut Tree in memory from database rows."""
        DatabaseConnection.init_db()

        self.graph = CampusGraphModel()

        # Load buildings
        db_buildings = NetworkRepository.get_all_buildings()
        for b in db_buildings:
            self.graph.add_building(b)

        # Load nodes
        db_nodes = NetworkRepository.get_all_nodes()
        for n in db_nodes:
            node_obj = NetworkNode(
                node_id=n["node_id"],
                name=n["name"],
                node_type=n["node_type"],
                building_id=n.get("building_id"),
                x_pos=n.get("x_pos", 0),
                y_pos=n.get("y_pos", 0)
            )
            self.graph.add_node(node_obj)

        # Load links
        db_links = NetworkRepository.get_all_links()
        for l in db_links:
            link_obj = NetworkLink(
                link_id=l["link_id"],
                source_id=l["source_node_id"],
                target_id=l["target_node_id"],
                latency_ms=float(l["latency_ms"]),
                cost=int(l["cost"]),
                status=l["status"],
                is_tree_edge=bool(l["is_tree_edge"])
            )
            self.graph.add_link(link_obj)

        # Load services and dependencies
        db_services = NetworkRepository.get_all_services()
        for s in db_services:
            self.graph.register_service(
                service_id=s["service_id"],
                name=s["name"],
                description=s["description"],
                required_nodes=s["dependencies"]
            )

    def get_network_state(self) -> Dict[str, Any]:
        """Returns the current network snapshot and live service availability."""
        network_dict = self.graph.to_dict()
        impact = self.graph.compute_service_impact("NODE_GW")
        return {
            "network": network_dict,
            "services_status": impact
        }

    def fail_link(self, link_id: str, severity: str = "HIGH", notes: str = "") -> Dict[str, Any]:
        """Fails a link in LCT and persists the failure event in the database."""
        result = self.graph.fail_link(link_id)
        NetworkRepository.update_link_status(link_id, "FAILED")

        event_id = NetworkRepository.log_failure_event(link_id, severity, notes)
        op_id = NetworkRepository.log_operation("FAIL_LINK", {
            "link_id": link_id,
            "event_id": event_id,
            "was_tree_edge": result["was_tree_edge"]
        })

        self.operation_traces[op_id] = result["trace"]
        impact = self.graph.compute_service_impact("NODE_GW")

        return {
            "event": {"event_id": event_id, "link_id": link_id, "status": "FAILED", "operation_id": op_id},
            "network": self.graph.to_dict(),
            "impacted_services": impact["impacted"],
            "available_services": impact["available"],
            "lct_trace": result["trace"]
        }

    def restore_link(self, link_id: str) -> Dict[str, Any]:
        """Restores a failed original link in LCT and updates DB."""
        result = self.graph.restore_link(link_id)
        NetworkRepository.update_link_status(link_id, "ACTIVE", is_tree=True)

        rec_id = NetworkRepository.log_recovery_event(
            failure_event_id=None,
            action_type="RESTORE_ORIGINAL",
            link_id=link_id,
            cost=0,
            outcome="SUCCESS"
        )
        op_id = NetworkRepository.log_operation("RESTORE_LINK", {
            "link_id": link_id,
            "recovery_id": rec_id
        })

        self.operation_traces[op_id] = result["trace"]
        impact = self.graph.compute_service_impact("NODE_GW")

        return {
            "link": {"link_id": link_id, "status": "ACTIVE"},
            "network": self.graph.to_dict(),
            "recovered_services": [s["name"] for s in impact["available"]],
            "impacted_services": impact["impacted"],
            "lct_trace": result["trace"],
            "operation_id": op_id
        }

    def plan_recovery(self) -> Dict[str, Any]:
        """Finds valid candidate alternative backup links."""
        candidates = self.graph.find_replacement_candidates()
        return {
            "candidates": candidates,
            "criteria": "Ranked by minimal latency (ms) and operational activation cost.",
            "limitations": "Only joins currently partitioned campus network subtrees."
        }

    def apply_recovery(self, link_id: str, failure_event_id: Optional[int] = None) -> Dict[str, Any]:
        """Applies chosen recovery link to reconnect network components."""
        result = self.graph.apply_recovery_link(link_id)
        if not result["success"]:
            raise ValueError(f"Recovery link {link_id} could not be activated (cycle or invalid endpoints).")

        NetworkRepository.update_link_status(link_id, "RECOVERED", is_tree=True)
        rec_id = NetworkRepository.log_recovery_event(
            failure_event_id=failure_event_id,
            action_type="ACTIVATE_REDUNDANT",
            link_id=link_id,
            cost=self.graph.links[link_id].cost,
            outcome="SUCCESS"
        )
        op_id = NetworkRepository.log_operation("APPLY_RECOVERY", {
            "link_id": link_id,
            "recovery_id": rec_id
        })

        self.operation_traces[op_id] = result["trace"]
        impact = self.graph.compute_service_impact("NODE_GW")

        return {
            "result": "SUCCESS",
            "recovery_id": rec_id,
            "operation_id": op_id,
            "activated_link": link_id,
            "network": self.graph.to_dict(),
            "impacted_services": impact["impacted"],
            "available_services": impact["available"],
            "lct_trace": result["trace"]
        }

    def undo_last_operation(self) -> Dict[str, Any]:
        """Undoes the latest operation."""
        last_op = NetworkRepository.get_latest_active_operation()
        if not last_op:
            return {"result": "NO_OPERATION_TO_UNDO", "network": self.graph.to_dict(), "lct_trace": []}

        op_id = last_op["operation_id"]
        action = last_op["action_type"]
        payload = last_op["payload"]

        trace = []
        if action == "FAIL_LINK":
            # Inverse of fail is restore
            link_id = payload["link_id"]
            res = self.graph.restore_link(link_id)
            NetworkRepository.update_link_status(link_id, "ACTIVE", is_tree=payload.get("was_tree_edge", True))
            trace = res["trace"]
        elif action in ("RESTORE_LINK", "APPLY_RECOVERY"):
            # Inverse is fail / disconnect
            link_id = payload["link_id"]
            res = self.graph.fail_link(link_id)
            NetworkRepository.update_link_status(link_id, "STANDBY" if action == "APPLY_RECOVERY" else "FAILED", is_tree=False)
            trace = res["trace"]

        NetworkRepository.mark_operation_undone(op_id)
        return {
            "result": "UNDONE",
            "undone_action": action,
            "network": self.graph.to_dict(),
            "lct_trace": trace
        }

    def redo_last_operation(self) -> Dict[str, Any]:
        """Redoes the latest undone operation."""
        last_undone = NetworkRepository.get_latest_undone_operation()
        if not last_undone:
            return {"result": "NO_OPERATION_TO_REDO", "network": self.graph.to_dict(), "lct_trace": []}

        op_id = last_undone["operation_id"]
        action = last_undone["action_type"]
        payload = last_undone["payload"]

        trace = []
        if action == "FAIL_LINK":
            link_id = payload["link_id"]
            res = self.graph.fail_link(link_id)
            NetworkRepository.update_link_status(link_id, "FAILED")
            trace = res["trace"]
        elif action == "RESTORE_LINK":
            link_id = payload["link_id"]
            res = self.graph.restore_link(link_id)
            NetworkRepository.update_link_status(link_id, "ACTIVE", is_tree=True)
            trace = res["trace"]
        elif action == "APPLY_RECOVERY":
            link_id = payload["link_id"]
            res = self.graph.apply_recovery_link(link_id)
            NetworkRepository.update_link_status(link_id, "RECOVERED", is_tree=True)
            trace = res["trace"]

        NetworkRepository.mark_operation_redone(op_id)
        return {
            "result": "REDONE",
            "redone_action": action,
            "network": self.graph.to_dict(),
            "lct_trace": trace
        }
