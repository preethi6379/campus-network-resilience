"""
Database Repository Layer
=========================
Author: Avanish Ayyappan (Backend & Integration Lead)

Provides safe, parameterized SQL methods for all persistence operations.
"""

import json
from typing import List, Dict, Any, Optional
from backend.db.connection import DatabaseConnection


class NetworkRepository:

    @staticmethod
    def get_all_nodes() -> List[Dict[str, Any]]:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT node_id, name, node_type, building_id, x_pos, y_pos FROM network_nodes")
        rows = cursor.fetchall()
        result = [dict(r) for r in rows]
        conn.close()
        return result

    @staticmethod
    def get_all_links() -> List[Dict[str, Any]]:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT link_id, source_node_id, target_node_id, latency_ms, cost, status, is_tree_edge FROM network_links")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["is_tree_edge"] = bool(d["is_tree_edge"])
            result.append(d)
        conn.close()
        return result

    @staticmethod
    def get_all_services() -> List[Dict[str, Any]]:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT service_id, name, description FROM services")
        services = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT service_id, node_id FROM service_dependencies")
        deps = cursor.fetchall()

        dep_map = {}
        for d in deps:
            s_id = d["service_id"] if isinstance(d, dict) else d[0]
            n_id = d["node_id"] if isinstance(d, dict) else d[1]
            dep_map.setdefault(s_id, []).append(n_id)

        for s in services:
            s_id = s["service_id"]
            s["dependencies"] = dep_map.get(s_id, [])

        conn.close()
        return services

    @staticmethod
    def insert_node(node_id: str, name: str, node_type: str, building_id: Optional[str], x_pos: int, y_pos: int):
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO network_nodes (node_id, name, node_type, building_id, x_pos, y_pos) VALUES (?, ?, ?, ?, ?, ?)",
            (node_id, name, node_type, building_id, x_pos, y_pos)
        )
        conn.commit()
        conn.close()

    @staticmethod
    def insert_link(link_id: str, source: str, target: str, latency: float, cost: int, status: str, is_tree: bool):
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO network_links (link_id, source_node_id, target_node_id, latency_ms, cost, status, is_tree_edge) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (link_id, source, target, latency, cost, status, 1 if is_tree else 0)
        )
        conn.commit()
        conn.close()

    @staticmethod
    def update_link_status(link_id: str, status: str, is_tree: Optional[bool] = None):
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        if is_tree is not None:
            cursor.execute(
                "UPDATE network_links SET status = ?, is_tree_edge = ? WHERE link_id = ?",
                (status, 1 if is_tree else 0, link_id)
            )
        else:
            cursor.execute(
                "UPDATE network_links SET status = ? WHERE link_id = ?",
                (status, link_id)
            )
        conn.commit()
        conn.close()

    @staticmethod
    def log_failure_event(link_id: str, severity: str = "HIGH", notes: str = "") -> int:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO failure_events (link_id, severity, status, notes) VALUES (?, ?, 'OPEN', ?)",
            (link_id, severity, notes)
        )
        event_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return event_id

    @staticmethod
    def log_recovery_event(failure_event_id: Optional[int], action_type: str, link_id: str, cost: int, outcome: str = "SUCCESS") -> int:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO recovery_events (failure_event_id, action_type, link_id, cost_used, outcome) VALUES (?, ?, ?, ?, ?)",
            (failure_event_id, action_type, link_id, cost, outcome)
        )
        rec_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return rec_id

    @staticmethod
    def log_operation(action_type: str, payload: Dict[str, Any]) -> int:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        payload_str = json.dumps(payload)
        cursor.execute(
            "INSERT INTO operation_history (action_type, payload_json) VALUES (?, ?)",
            (action_type, payload_str)
        )
        op_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return op_id

    @staticmethod
    def get_latest_active_operation() -> Optional[Dict[str, Any]]:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM operation_history WHERE undone_at IS NULL ORDER BY operation_id DESC LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        if row:
            d = dict(row)
            d["payload"] = json.loads(d["payload_json"])
            return d
        return None

    @staticmethod
    def mark_operation_undone(operation_id: int):
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE operation_history SET undone_at = CURRENT_TIMESTAMP WHERE operation_id = ?", (operation_id,))
        conn.commit()
        conn.close()

    @staticmethod
    def get_latest_undone_operation() -> Optional[Dict[str, Any]]:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM operation_history WHERE undone_at IS NOT NULL ORDER BY operation_id DESC LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        if row:
            d = dict(row)
            d["payload"] = json.loads(d["payload_json"])
            return d
        return None

    @staticmethod
    def mark_operation_redone(operation_id: int):
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE operation_history SET undone_at = NULL WHERE operation_id = ?", (operation_id,))
        conn.commit()
        conn.close()

    @staticmethod
    def get_history(limit: int = 50) -> Dict[str, Any]:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM failure_events ORDER BY event_id DESC LIMIT ?", (limit,))
        failures = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT * FROM recovery_events ORDER BY recovery_id DESC LIMIT ?", (limit,))
        recoveries = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT * FROM operation_history ORDER BY operation_id DESC LIMIT ?", (limit,))
        operations = []
        for r in cursor.fetchall():
            d = dict(r)
            try:
                d["payload"] = json.loads(d["payload_json"])
            except Exception:
                d["payload"] = {}
            operations.append(d)

        conn.close()
        return {
            "failure_events": failures,
            "recovery_events": recoveries,
            "operations": operations
        }
