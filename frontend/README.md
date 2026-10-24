# Frontend — Campus Network Resilience Visualizer

**Owner:** Preetika (`preetikaapreetikaa80@gmail.com`)  
**Stack:** React 19, Cytoscape.js, Lucide Icons, Vite

---

## 1. Overview
The frontend provides:
1. **Interactive Cytoscape.js Network Graph (`NetworkGraph.jsx`):**
   - Renders campus topology (Gateway ISP router, Campus Core, Switches, Servers, Labs).
   - Dynamic edge color coding: Active LCT backbone (cyan), Severed/Failed (dashed red), Recovered (green), Standby Redundant (dotted gray).
   - Interactive link selection and node inspection.
2. **Resilience & Failure Control Center (`ControlPanel.jsx`):**
   - Simulate link failure (triggers LCT cut).
   - Restore original link.
   - Scan for candidate redundant backup links and activate them with 1 click.
   - Undo and Redo operations.
   - Dynamic $O(\log V)$ path connectivity query and latency aggregate inspector.
3. **Service Impact Panel (`ImpactPanel.jsx`):**
   - Real-time status for campus services (LMS, Digital Library, External Internet, ERP).
   - Displays offline warnings and missing node dependencies.
4. **Educational LCT Stepper (`LCTViewer.jsx`):**
   - Step-by-step viewer for Splay Tree rotations, path exposures, and component reroots.
   - Auto-play and manual navigation.
5. **Persistent Event Timeline (`HistoryTimeline.jsx`):**
   - MySQL audit trail of failure and recovery events.
6. **Time Complexity Analysis View:**
   - Formal mathematical proof of amortized $O(\log V)$ complexity.

---

## 2. Setup & Running

### Installation
```bash
cd frontend
npm install
```

### Configuration
Create `.env` based on `.env.example`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Start Development Server
```bash
npm run dev
```
The app will be accessible at `http://localhost:5173`.

### Production Build
```bash
npm run build
```
