# Backend & Dynamic Forest Engine

**Owner:** Avanish Ayyappan (`avanishayyappan2007@gmail.com`)  
**Stack:** Python 3.10+, Flask, Link-Cut Trees (Splay Trees), MySQL / SQLite

---

## 1. Overview
The backend provides:
1. **Dynamic Forest Engine (`backend/algorithms/link_cut_tree.py`):**
   - Implements Sleator & Tarjan's Link-Cut Tree with Splay Trees.
   - Executes dynamic tree operations (`link`, `cut`, `make_root`, `find_root`, `connected`, `query_path`) in **amortized $O(\log V)$** time.
   - Logs deterministic educational traces for step-by-step visual display.
2. **Campus Graph Model (`backend/algorithms/graph_model.py`):**
   - Manages campus topology (Gateway, Core Routers, Switches, Labs, Servers).
   - Handles forest vs cyclic graph boundaries by maintaining redundant non-tree edges and evaluating replacement candidates.
   - Computes service reachability (LMS, Library Portal, Internet, ERP).
3. **Persistence Layer (`backend/db/`):**
   - MySQL 8.0 support with parameterized SQL queries.
   - Automatic SQLite fallback for zero-dependency local testing.
   - Full event logging (`failure_events`, `recovery_events`, `operation_history`).
4. **Flask REST API (`backend/app.py`):**
   - Clean JSON endpoints matching the project specification.

---

## 2. Setup & Execution

### Prerequisites
- Python 3.10+
- (Optional) MySQL Server 8.0+

### Installation
```bash
cd backend
python -m venv .venv

# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### Configuration
Copy `.env.example` to `.env`:
```env
FLASK_APP=app.py
FLASK_DEBUG=True
PORT=5000
DB_TYPE=sqlite   # change to 'mysql' to use MySQL Server
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=campus_resilience
```

### Running Tests
```bash
python -m unittest discover -s tests
```

### Running the API Server
```bash
python app.py
```
The server starts at `http://localhost:5000`.
Health check: `http://localhost:5000/api/health`
