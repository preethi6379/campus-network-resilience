"""
Campus Network Resilience Visualizer - Flask API Server
========================================================
Author: Avanish Ayyappan (Backend & Integration Lead)
API Contract Reference: Section 5 of Project Blueprint
"""

import os
from flask import Flask, jsonify, request
from backend.config import Config
from backend.services.network_service import NetworkService
from backend.db.repository import NetworkRepository
from backend.algorithms.graph_model import NetworkNode, NetworkLink

app = Flask(__name__)
app.config.from_object(Config)

# Manual CORS header handler (no external dependency needed)
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@app.route("/api/health", methods=["GET"])
def health_check():
    """Check backend and DB availability."""
    return jsonify({
        "status": "HEALTHY",
        "database": Config.DB_TYPE,
        "lct_engine": "ACTIVE"
    }), 200

@app.route("/api/network", methods=["GET"])
def get_network():
    """Load nodes, links, services and current status."""
    service = NetworkService.get_instance()
    state = service.get_network_state()
    return jsonify({
        "nodes": state["network"]["nodes"],
        "links": state["network"]["links"],
        "services": state["network"]["services"],
        "services_status": state["services_status"]
    }), 200

@app.route("/api/nodes", methods=["POST"])
def create_node():
    """Create a new campus node."""
    data = request.get_json() or {}
    node_id = data.get("node_id") or data.get("id")
    name = data.get("name")
    node_type = data.get("node_type", "SWITCH")
    building_id = data.get("building_id")
    x_pos = int(data.get("x_pos", 300))
    y_pos = int(data.get("y_pos", 300))

    if not node_id or not name:
        return jsonify({"error": "node_id and name are required."}), 400

    service = NetworkService.get_instance()
    node = NetworkNode(node_id, name, node_type, building_id, x_pos, y_pos)
    service.graph.add_node(node)
    NetworkRepository.insert_node(node_id, name, node_type, building_id, x_pos, y_pos)

    return jsonify({
        "message": "Node created successfully",
        "node": node.to_dict()
    }), 201

@app.route("/api/links", methods=["POST"])
def create_link():
    """Create a valid network link."""
    data = request.get_json() or {}
    link_id = data.get("link_id") or data.get("id")
    source = data.get("source") or data.get("source_node_id")
    target = data.get("target") or data.get("target_node_id")
    latency = float(data.get("latency_ms", 5.0))
    cost = int(data.get("cost", 10))
    is_tree = bool(data.get("is_tree_edge", True))

    if not link_id or not source or not target:
        return jsonify({"error": "link_id, source, and target are required."}), 400

    service = NetworkService.get_instance()
    try:
        link = NetworkLink(link_id, source, target, latency, cost, status="ACTIVE", is_tree_edge=is_tree)
        service.graph.add_link(link)
        NetworkRepository.insert_link(link_id, source, target, latency, cost, "ACTIVE", link.is_tree_edge)
        return jsonify({
            "message": "Link created successfully",
            "link": link.to_dict(),
            "updated_network": service.graph.to_dict()
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/links/<link_id>/fail", methods=["POST"])
def fail_link(link_id):
    """Fail a link; update LCT dynamic forest and persist event."""
    service = NetworkService.get_instance()
    try:
        data = request.get_json() or {}
        severity = data.get("severity", "HIGH")
        notes = data.get("notes", "Simulated failure via UI")
        response_data = service.fail_link(link_id, severity, notes)
        return jsonify(response_data), 200
    except KeyError:
        return jsonify({"error": f"Link {link_id} not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/links/<link_id>/restore", methods=["POST"])
def restore_link(link_id):
    """Restore the original link."""
    service = NetworkService.get_instance()
    try:
        response_data = service.restore_link(link_id)
        return jsonify(response_data), 200
    except KeyError:
        return jsonify({"error": f"Link {link_id} not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/recovery/plan", methods=["POST"])
def recovery_plan():
    """Return valid alternative-link candidates."""
    service = NetworkService.get_instance()
    plan = service.plan_recovery()
    return jsonify(plan), 200

@app.route("/api/recovery/apply", methods=["POST"])
def recovery_apply():
    """Apply selected valid recovery action."""
    service = NetworkService.get_instance()
    data = request.get_json() or {}
    link_id = data.get("link_id")
    if not link_id:
        return jsonify({"error": "link_id is required."}), 400

    try:
        response_data = service.apply_recovery(link_id)
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/history", methods=["GET"])
def get_history():
    """Return paginated/ordered events."""
    limit = int(request.args.get("limit", 50))
    history_data = NetworkRepository.get_history(limit)
    return jsonify(history_data), 200

@app.route("/api/operations/undo", methods=["POST"])
def undo_operation():
    """Undo latest supported action."""
    service = NetworkService.get_instance()
    res = service.undo_last_operation()
    return jsonify(res), 200

@app.route("/api/operations/redo", methods=["POST"])
def redo_operation():
    """Redo latest undone action."""
    service = NetworkService.get_instance()
    res = service.redo_last_operation()
    return jsonify(res), 200

@app.route("/api/lct/trace/<int:operation_id>", methods=["GET"])
def get_lct_trace(operation_id):
    """Return stored educational trace for operation."""
    service = NetworkService.get_instance()
    trace = service.operation_traces.get(operation_id, [])
    return jsonify({
        "operation_id": operation_id,
        "steps": trace,
        "total_steps": len(trace)
    }), 200

@app.route("/api/connectivity", methods=["GET"])
def check_connectivity():
    """Direct query for path and connectivity between two nodes in O(log V)."""
    source = request.args.get("source")
    target = request.args.get("target")
    if not source or not target:
        return jsonify({"error": "source and target query parameters required."}), 400

    service = NetworkService.get_instance()
    connected = service.graph.is_connected(source, target)
    path_info = None
    if connected:
        path_info = service.graph.lct.query_path(source, target)

    return jsonify({
        "source": source,
        "target": target,
        "connected": connected,
        "path_metrics": path_info
    }), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
