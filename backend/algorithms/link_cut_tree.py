"""
Link-Cut Tree (LCT) Dynamic Forest Implementation
=================================================
Author: Avanish Ayyappan (Algorithm & Backend Lead)
Course: Advanced Data Structures / Campus Network Resilience Visualizer

Mathematical & Complexity Foundation:
-------------------------------------
- Based on Sleator & Tarjan (1983): "A Data Structure for Dynamic Trees"
- Represents a dynamically changing forest of rooted trees via Auxiliary Splay Trees.
- Auxiliary Splay Trees partition each represented tree into disjoint "preferred paths"
  keyed by their depth in the represented tree.
- Time Complexity:
  * make_root(u):       Amortized O(log V)
  * find_root(u):       Amortized O(log V)
  * connected(u, v):    Amortized O(log V)  (vs Naive Graph BFS/DFS which is O(V + E))
  * link(u, v):         Amortized O(log V)
  * cut(u, v):          Amortized O(log V)
  * query_path(u, v):   Amortized O(log V)

Amortized Analysis Proof (Potential Method):
--------------------------------------------
Define potential function:
    Φ = sum_{v in V} log2(size(v))
where size(v) is the number of nodes in the auxiliary subtree rooted at v.
By the Access Lemma:
    The amortized cost of splaying node x in an auxiliary tree with root t is at most:
        3 * (rank(t) - rank(x)) + 1
During access(u), we traverse at most O(log V) preferred child changes (since any path
from root to u contains at most log2(V) light edges). Each transition amortizes to O(1),
yielding overall Amortized Time Complexity of O(log V) per operation.
"""

from typing import Dict, List, Optional, Any, Tuple


class LCTNode:
    """A node inside an auxiliary Splay Tree representing a vertex in the Link-Cut Tree."""

    def __init__(self, node_id: str, val: float = 0.0):
        self.id: str = node_id
        self.val: float = val                  # Latency or weight associated with node
        self.sub_sum: float = val              # Path sum aggregate
        self.sub_max: float = val              # Path maximum aggregate
        self.size: int = 1                     # Subtree size for potential analysis

        # Tree pointers
        self.left: Optional['LCTNode'] = None
        self.right: Optional['LCTNode'] = None
        self.parent: Optional['LCTNode'] = None

        # Lazy tag for path reversal (used in make_root)
        self.reversed: bool = False

    def is_root(self) -> bool:
        """
        Returns True if this node is the root of an auxiliary Splay tree.
        Note: A node is a splay root if it has no parent, OR if its parent does
        not point back to it as a left or right child (i.e. parent is a path-parent).
        """
        if self.parent is None:
            return True
        return self.parent.left != self and self.parent.right != self

    def push_up(self) -> None:
        """Recomputes subtree aggregates (sum, max, size) from children."""
        self.sub_sum = self.val
        self.sub_max = self.val
        self.size = 1

        if self.left is not None:
            self.sub_sum += self.left.sub_sum
            self.sub_max = max(self.sub_max, self.left.sub_max)
            self.size += self.left.size

        if self.right is not None:
            self.sub_sum += self.right.sub_sum
            self.sub_max = max(self.sub_max, self.right.sub_max)
            self.size += self.right.size

    def push_down(self) -> None:
        """Pushes down lazy reversal tag to children."""
        if self.reversed:
            # Swap left and right children
            self.left, self.right = self.right, self.left
            if self.left is not None:
                self.left.reversed = not self.left.reversed
            if self.right is not None:
                self.right.reversed = not self.right.reversed
            self.reversed = False


class LinkCutTree:
    """
    Splay-Tree based Link-Cut Tree supporting dynamic forest operations
    with educational trace logging for UI visualization.
    """

    def __init__(self):
        self.nodes: Dict[str, LCTNode] = {}
        self.trace: List[Dict[str, Any]] = []

    def get_or_create_node(self, node_id: str, val: float = 0.0) -> LCTNode:
        """Retrieves or instantiates an LCT node."""
        if node_id not in self.nodes:
            self.nodes[node_id] = LCTNode(node_id, val)
        return self.nodes[node_id]

    def clear_trace(self) -> None:
        """Resets operation trace logs."""
        self.trace = []

    def _log_step(self, op: str, target: str, explanation: str, details: Optional[Dict[str, Any]] = None) -> None:
        """Records a granular step in the educational operation trace."""
        step_record = {
            "step": len(self.trace) + 1,
            "operation": op,
            "target": target,
            "explanation": explanation,
            "details": details or {}
        }
        self.trace.append(step_record)

    def _push_all_from_root(self, u: LCTNode) -> None:
        """Recursively flushes all lazy reversal tags from the splay root down to u."""
        stack = []
        curr: Optional[LCTNode] = u
        while curr is not None and not curr.is_root():
            stack.append(curr)
            curr = curr.parent
        if curr is not None:
            stack.append(curr)

        while stack:
            stack.pop().push_down()

    def _rotate(self, x: LCTNode) -> None:
        """
        Performs a single tree rotation (Left or Right) on node x.
        Preserves the binary search tree invariant of the auxiliary splay tree.
        Complexity: O(1).
        """
        p = x.parent
        if p is None:
            return
        g = p.parent

        is_x_left = (p.left == x)
        y = x.right if is_x_left else x.left

        # Transfer subtree y to p
        if is_x_left:
            p.left = y
        else:
            p.right = y
        if y is not None:
            y.parent = p

        # Connect x to grandparent g (preserving path-parent if p was splay root)
        x.parent = g
        if not p.is_root():
            if g is not None:
                if g.left == p:
                    g.left = x
                else:
                    g.right = x

        # Put p as child of x
        if is_x_left:
            x.right = p
        else:
            x.left = p
        p.parent = x

        p.push_up()
        x.push_up()

    def _splay(self, x: LCTNode) -> None:
        """
        Splays node x to the root of its auxiliary tree using standard Zig-Zig and Zig-Zag rotations.
        Amortized Time Complexity: O(log V).
        """
        self._push_all_from_root(x)

        while not x.is_root():
            p = x.parent
            if p is None:
                break
            if not p.is_root():
                g = p.parent
                if g is not None:
                    # Zig-Zig vs Zig-Zag check
                    is_zig_zig = (p.left == x) == (g.left == p)
                    if is_zig_zig:
                        self._rotate(p) # Rotate parent first in zig-zig
                    else:
                        self._rotate(x) # Rotate self in zig-zag
            self._rotate(x)

        x.push_up()

    def access(self, u_id: str) -> LCTNode:
        """
        The fundamental primitive of Link-Cut Trees.
        Makes the path from the root of the represented tree down to u a preferred path.
        Upon return, u is the root of the auxiliary splay tree representing this path.
        Amortized Time Complexity: O(log V).
        """
        u = self.get_or_create_node(u_id)
        last: Optional[LCTNode] = None
        curr: Optional[LCTNode] = u

        self._log_step(
            op="access_start",
            target=u_id,
            explanation=f"Initiating access({u_id}) to create a preferred path from tree root to {u_id}."
        )

        step_idx = 0
        while curr is not None:
            step_idx += 1
            self._splay(curr)
            # Switch preferred child: disconnect current right child (lower depth)
            # and attach 'last' as new preferred child
            curr.right = last
            curr.push_up()

            self._log_step(
                op="access_splay_splice",
                target=curr.id,
                explanation=f"Splayed {curr.id} and spliced preferred path to child {last.id if last else 'None'}.",
                details={"splay_root": curr.id, "preferred_child": last.id if last else None}
            )

            last = curr
            curr = curr.parent

        self._splay(u)
        self._log_step(
            op="access_complete",
            target=u_id,
            explanation=f"access({u_id}) complete. {u_id} is now root of auxiliary tree with entire path as left sub-chain."
        )
        return u

    def make_root(self, u_id: str) -> LCTNode:
        """
        Reroots the represented tree so that u becomes the root of its component.
        Amortized Time Complexity: O(log V).
        """
        self._log_step(
            op="make_root_start",
            target=u_id,
            explanation=f"make_root({u_id}): Making {u_id} the root of its represented tree."
        )
        u = self.access(u_id)
        u.reversed = not u.reversed
        u.push_down()
        self._log_step(
            op="make_root_reverse",
            target=u_id,
            explanation=f"Reversed auxiliary path. {u_id} has become the minimum depth node (tree root)."
        )
        return u

    def find_root(self, u_id: str) -> str:
        """
        Finds the root of the represented tree containing u.
        Used to determine connected components.
        Amortized Time Complexity: O(log V).
        """
        u = self.access(u_id)
        u.push_down()
        curr = u
        while curr.left is not None:
            curr = curr.left
            curr.push_down()
        self._splay(curr)
        self._log_step(
            op="find_root",
            target=u_id,
            explanation=f"find_root({u_id}) resolved to component root '{curr.id}'.",
            details={"root_id": curr.id}
        )
        return curr.id

    def connected(self, u_id: str, v_id: str) -> bool:
        """
        Determines whether u and v belong to the same connected component.
        Amortized Time Complexity: O(log V) -- strictly optimal compared to O(V+E) BFS/DFS.
        """
        if u_id == v_id:
            return True
        if u_id not in self.nodes or v_id not in self.nodes:
            return False
        root_u = self.find_root(u_id)
        root_v = self.find_root(v_id)
        is_conn = (root_u == root_v)
        self._log_step(
            op="connectivity_query",
            target=f"{u_id}<->{v_id}",
            explanation=f"Checking connectivity: root({u_id})='{root_u}', root({v_id})='{root_v}'. Connected={is_conn}.",
            details={"u": u_id, "v": v_id, "root_u": root_u, "root_v": root_v, "connected": is_conn}
        )
        return is_conn

    def link(self, u_id: str, v_id: str, edge_val: float = 0.0) -> bool:
        """
        Adds an undirected edge between u and v in the represented forest.
        Fails if adding the edge would introduce a cycle.
        Amortized Time Complexity: O(log V).
        """
        self._log_step(
            op="link_request",
            target=f"{u_id}--{v_id}",
            explanation=f"Attempting to link({u_id}, {v_id}) with latency {edge_val}ms."
        )

        if u_id == v_id:
            self._log_step("link_rejected", f"{u_id}--{v_id}", "Self-loops are rejected.")
            return False

        self.get_or_create_node(u_id)
        self.get_or_create_node(v_id)

        # Check if already connected (prevents cyclic dynamic forest violations)
        if self.connected(u_id, v_id):
            self._log_step(
                op="link_rejected",
                target=f"{u_id}--{v_id}",
                explanation=f"Cycle detected! {u_id} and {v_id} are already in the same tree."
            )
            return False

        # Make u the root of its represented tree
        u = self.make_root(u_id)
        # Attach u as a child of v via path-parent pointer
        u.parent = self.get_or_create_node(v_id)

        self._log_step(
            op="link_success",
            target=f"{u_id}--{v_id}",
            explanation=f"Successfully linked {u_id} to {v_id} in dynamic forest in O(log V) time."
        )
        return True

    def cut(self, u_id: str, v_id: str) -> bool:
        """
        Removes the undirected edge between u and v in the represented forest.
        Amortized Time Complexity: O(log V).
        """
        self._log_step(
            op="cut_request",
            target=f"{u_id}--{v_id}",
            explanation=f"Attempting cut({u_id}, {v_id}) to simulate link failure."
        )

        if u_id not in self.nodes or v_id not in self.nodes:
            self._log_step("cut_failed", f"{u_id}--{v_id}", "One or both nodes do not exist.")
            return False

        # Reroot at u, then access v
        self.make_root(u_id)
        v = self.access(v_id)

        # In auxiliary tree rooted at v, u must be the direct left child of v,
        # with no right child of u (meaning depth(u) + 1 == depth(v))
        u = self.nodes[u_id]
        if v.left == u and u.right is None:
            v.left = None
            u.parent = None
            v.push_up()
            self._log_step(
                op="cut_success",
                target=f"{u_id}--{v_id}",
                explanation=f"Edge ({u_id}, {v_id}) severed in dynamic forest in O(log V) time."
            )
            return True

        self._log_step(
            op="cut_failed",
            target=f"{u_id}--{v_id}",
            explanation=f"Edge ({u_id}, {v_id}) is not a direct tree edge in the current forest."
        )
        return False

    def query_path(self, u_id: str, v_id: str) -> Optional[Dict[str, float]]:
        """
        Queries aggregated metrics (latency sum, bottleneck max) along the path between u and v.
        Returns None if u and v are disconnected.
        Amortized Time Complexity: O(log V).
        """
        if not self.connected(u_id, v_id):
            return None

        self.make_root(u_id)
        v = self.access(v_id)

        return {
            "path_latency_sum": v.sub_sum,
            "path_max_latency": v.sub_max,
            "path_node_count": float(v.size)
        }
