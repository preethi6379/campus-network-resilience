# Campus Network Resilience Visualizer — Project Specification

## 1. Project Goal & Overview
The **Campus Network Resilience Visualizer** is a database-backed web application that models a university campus computer network, simulates link failures, evaluates service impacts in real time, and demonstrates how a **Link-Cut Tree (LCT)** maintains dynamic forest operations in **amortized $O(\log V)$** time. It also computes optimal recovery options using redundant links and records audit events in MySQL.

### Core Principle
- **Link-Cut Tree (LCT):** In-memory dynamic data structure maintaining the forest topology, path latency aggregates, and connectivity queries in $O(\log V)$ amortized time.
- **MySQL:** Persistent source of truth for topology metadata, service dependencies, failure/recovery logs, and undo/redo operation history.

---

## 2. Team Split & Ownership

| Member | Primary Ownership | Responsibilities |
|---|---|---|
| **Preetika** (`preetikaapreetikaa80@gmail.com`) | `frontend/` (React + Cytoscape.js) | Interactive network graph layout, controls for failure/restoration, live service impact visualizer, educational LCT step-by-step trace viewer, history timeline, API integration. |
| **Avanish Ayyappan** (`avanishayyappan2007@gmail.com`) | `backend/` & `database/` | Link-Cut Tree with Splay Trees ($O(\log V)$), graph model with redundant edge management, MySQL schema/seed, Flask REST API endpoints, automated unit/integration tests. |

---

## 3. Algorithmic Complexity Analysis (Link-Cut Tree)

| Operation | Naive Graph (BFS/DFS) | Link-Cut Tree (Splay-based) | Mathematical Analysis |
|---|---|---|---|
| **Connectivity Query** (`connected(u, v)`) | $O(V + E)$ | **Amortized $O(\log V)$** | Verified by comparing tree roots (`find_root(u) == find_root(v)`). |
| **Link Insertion** (`link(u, v)`) | $O(1)$ edge add, $O(V+E)$ validation | **Amortized $O(\log V)$** | Root reversal via `make_root(u)` followed by attaching parent pointer to $v$. |
| **Link Deletion / Cut** (`cut(u, v)`) | $O(1)$ remove, $O(V+E)$ reachability | **Amortized $O(\log V)$** | Isolates edge $(u, v)$ in auxiliary splay tree via `make_root(u)` and `access(v)`, then cuts left child. |
| **Path Latency Aggregate** | $O(V)$ traversal | **Amortized $O(\log V)$** | Subtree aggregate maintained at each splay node; exposed in $O(\log V)$ via `access(v)`. |

### Potential Method Proof Summary
Using Sleator & Tarjan's potential function:
$$\Phi = \sum_{v \in V} \log(\text{size}(v))$$
Every splay rotation takes amortized $O(1)$ plus charge on heavy-light edge transitions. Because any path has at most $\log_2(V)$ light edges, `access(u)` changes at most $O(\log V)$ preferred edges. Hence, all dynamic tree operations run in **amortized $O(\log V)$ time**.

---

## 4. Shared REST API Contract

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check verifying Flask backend and database availability. |
| `GET` | `/api/network` | Returns full campus topology (nodes, links, services, current link statuses). |
| `POST` | `/api/nodes` | Adds a new campus node (Router, Switch, Server, Building). |
| `POST` | `/api/links` | Adds a new connection (latency, cost, is_tree_edge). |
| `POST` | `/api/links/<id>/fail` | Simulates link failure: cuts LCT edge, persists event, recomputes service impact and educational trace. |
| `POST` | `/api/links/<id>/restore` | Restores failed link: links LCT edge, marks recovered, updates DB. |
| `POST` | `/api/recovery/plan` | Evaluates candidate redundant/alternative links to restore partition connectivity. |
| `POST` | `/api/recovery/apply` | Applies chosen recovery link to reconnect network components. |
| `GET` | `/api/history` | Returns paginated failure/recovery and operation audit logs. |
| `POST` | `/api/operations/undo` | Undoes latest supported action (restores previous state). |
| `POST` | `/api/operations/redo` | Redoes latest undone action. |
| `GET` | `/api/lct/trace/<op_id>` | Returns step-by-step educational trace of splay rotations and LCT transitions. |

---

## 5. Database Schema Overview
1. `buildings` (`building_id`, `name`, `building_type`, `location_label`)
2. `network_nodes` (`node_id`, `name`, `node_type`, `building_id`, `x_pos`, `y_pos`)
3. `network_links` (`link_id`, `source_node_id`, `target_node_id`, `latency_ms`, `cost`, `status`, `is_tree_edge`)
4. `services` (`service_id`, `name`, `description`)
5. `service_dependencies` (`service_id`, `node_id`)
6. `failure_events` (`event_id`, `link_id`, `severity`, `occurred_at`, `status`, `notes`)
7. `recovery_events` (`recovery_id`, `failure_event_id`, `action_type`, `link_id`, `cost_used`, `recovered_at`, `outcome`)
8. `operation_history` (`operation_id`, `action_type`, `payload_json`, `created_at`, `undone_at`)
