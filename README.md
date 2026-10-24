# 🌐 Campus Network Resilience Visualizer
### Dynamic Forest Simulation via Link-Cut Trees in Amortized $O(\log V)$ Time

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-lightgrey.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-3.34-green.svg)](https://js.cytoscape.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%20%7C%20SQLite-orange.svg)](https://www.mysql.com/)

---

## 👥 Project Team & Work Split

| Member | Role | Core Contributions |
|---|---|---|
| **Preetika** (`preetikaapreetikaa80@gmail.com`) | **Frontend & Visualization Lead** | Interactive Cytoscape.js graph layout, failure simulation & recovery controls, live service impact panel, step-by-step LCT educational stepper, undo/redo timeline, and REST API integration. |
| **Avanish Ayyappan** (`avanishayyappan2007@gmail.com`) | **Backend, Algorithm & Persistence Lead** | Sleator & Tarjan Splay-Tree based Link-Cut Tree (`link_cut_tree.py`) with amortized $O(\log V)$ operations, campus graph model with non-tree redundant edge evaluation, MySQL schema & seed scripts, Flask REST endpoints, and test suites. |

---

## ⚡ Algorithmic Time Complexity Analysis ($O(\log V)$)
*(See [TIME_COMPLEXITY.md](TIME_COMPLEXITY.md) for full mathematical proof)*

Standard graph algorithms (BFS/DFS) take **$O(V + E)$** on every single link failure, restoration, or connectivity query. In a production campus network with thousands of nodes, repeated traversals cause significant overhead.

Our system implements a **Link-Cut Tree (LCT)** using Auxiliary Splay Trees with the Potential Function $\Phi = \sum_{v \in V} \log_2(\text{size}(v))$.

| Operation | Naive Graph (BFS/DFS) | Link-Cut Tree (Splay-based) | Speedup for $V=10,000$ |
|---|---|---|---|
| **Dynamic Connectivity** (`connected(u, v)`) | $O(V + E)$ | **Amortized $O(\log V)$** | $\approx 1,500\times$ faster |
| **Simulated Link Cut** (`cut(u, v)`) | $O(V + E)$ (graph traversal) | **Amortized $O(\log V)$** | $\approx 1,500\times$ faster |
| **Recovery Activation** (`link(u, v)`) | $O(V)$ (cycle search) | **Amortized $O(\log V)$** | $\approx 700\times$ faster |
| **Path Latency Aggregate** (`query_path(u, v)`) | $O(V)$ | **Amortized $O(\log V)$** | $\approx 700\times$ faster |

---

## 🏛️ Repository Architecture

```text
campus-network-resilience/
├── frontend/                     # React + Cytoscape.js UI
│   ├── src/
│   │   ├── api/client.js         # API integration client
│   │   ├── components/
│   │   │   ├── NetworkGraph.jsx  # Interactive Cytoscape network canvas
│   │   │   ├── ControlPanel.jsx  # Failure, recovery & connectivity controls
│   │   │   ├── ImpactPanel.jsx   # Live campus service reachability
│   │   │   ├── LCTViewer.jsx     # Step-by-step Splay/LCT educational trace
│   │   │   └── HistoryTimeline.jsx # MySQL audit log timeline
│   │   ├── App.jsx               # Main visualizer application
│   │   └── App.css
│   ├── package.json
│   └── README.md
├── backend/                      # Python Flask & Dynamic Forest Engine
│   ├── algorithms/
│   │   ├── link_cut_tree.py      # Splay-tree based Link-Cut Tree (O(log V))
│   │   └── graph_model.py        # Campus graph model & redundant edge logic
│   ├── db/
│   │   ├── connection.py         # MySQL connection & SQLite auto-fallback
│   │   └── repository.py         # Parameterized SQL query layer
│   ├── services/
│   │   └── network_service.py    # Orchestrates LCT + DB persistence
│   ├── tests/                    # Automated test suites
│   │   ├── test_lct.py           # Unit tests for LCT invariants & operations
│   │   ├── test_graph_model.py   # Unit tests for graph & recovery engine
│   │   └── test_api.py           # Integration tests for Flask endpoints
│   ├── app.py                    # Flask REST API server
│   ├── config.py                 # Configuration loader
│   ├── requirements.txt
│   └── README.md
├── database/
│   ├── schema.sql                # MySQL 8.0+ DDL schema
│   └── seed.sql                  # Fictional campus network topology
├── PROJECT_SPEC.md               # Architecture and contract specification
├── TIME_COMPLEXITY.md            # Detailed mathematical proofs and bounds
└── README.md
```

---

## 🚀 Quickstart & Setup Guide

### 1. Start Backend API Server
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\Activate.ps1
# On Linux / macOS:
source .venv/bin/activate

pip install -r requirements.txt

# Run the API server (runs with SQLite fallback or MySQL)
python app.py
```
Backend API will start at: `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

### 2. Start Frontend UI
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Running Automated Tests
Run all unit and integration tests across algorithms, graph model, and API routes:
```bash
cd backend
python -m unittest discover -s tests
```
*Expected output: All 18 tests passing.*

---

## 🎬 End-to-End Acceptance Demonstration
1. **Load Campus Topology:** Open `http://localhost:5173`. Cytoscape renders campus buildings (Gateway, Core Router, CSE Lab, Library, Data Center, LMS Server).
2. **Verify Baseline Connectivity:** Check service impact panel: all services (`SRV_LMS`, `SRV_LIB`, `SRV_INTERNET`, `SRV_ERP`) are **Active / Online**.
3. **Simulate Critical Link Failure:**
   - Select bridge link `LINK_CORE_DC` (connects Core Router to Data Center Switch).
   - Click **Fail Link (Cut LCT)**.
   - Dynamic forest performs `cut` in $O(\log V)$.
   - Observe `NODE_LMS_SRV` becomes isolated. Service impact panel updates: **LMS Server is Down**.
4. **Inspect LCT Trace:**
   - Switch to the **LCT Step-by-Step Stepper** tab.
   - Step through the splay rotations and preferred child reconfigurations that executed during the cut.
5. **Activate Redundant Backup Link:**
   - Click **Find Recovery Routes**. System identifies standby link `LINK_BACKUP_CSE_DC` or `LINK_BACKUP_GW_DC`.
   - Click **Activate Backup**.
   - Dynamic forest executes `link` in $O(\log V)$ to rejoin partitioned components.
   - LMS service turns back **Online**.
6. **Verify MySQL Persistence:**
   - Open **MySQL Audit Timeline** tab.
   - Inspect failure events and recovery records stored persistently in the database.
