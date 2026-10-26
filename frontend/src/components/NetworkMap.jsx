/**
 * High-Fidelity Campus Architectural Network Map
 * Author: Preetika & Avanish Ayyappan
 */

import React, { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  CheckCircle,
  Zap,
  Activity,
  Layers,
  RefreshCw
} from "lucide-react";

// Building Icons & Blueprint Definitions
const BUILDINGS = [
  { id: "BLD_GATEWAY", label: "📡 Telecom & ISP Gateway Tower", color: "#6366f1" },
  { id: "BLD_MAIN", label: "🏛️ Main Academic Core Block", color: "#3b82f6" },
  { id: "BLD_DC", label: "🏢 Cloud Data Center & Vault", color: "#10b981" },
  { id: "BLD_CSE", label: "💻 Computer Science Department", color: "#f59e0b" },
  { id: "BLD_ADMIN", label: "🏢 Administrative Headquarters", color: "#06b6d4" },
  { id: "BLD_LIB", label: "📚 Central University Library", color: "#ec4899" }
];

const NODE_COLORS = {
  GATEWAY: "#818cf8",
  CORE_ROUTER: "#60a5fa",
  SWITCH: "#22d3ee",
  SERVER: "#34d399",
  LAB: "#fbbf24",
  DEFAULT: "#94a3b8"
};

export default function NetworkMap({
  nodes = [],
  links = [],
  selectedLinkId,
  onSelectLink,
  onFailLink,
  onRestoreLink,
  onApplyRecovery,
  recoveryCandidates = [],
  loading = false
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [clickedLink, setClickedLink] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = [];

    // 1. Campus Buildings as Compound Parent Enclosures
    BUILDINGS.forEach((bld) => {
      elements.push({
        group: "nodes",
        data: {
          id: bld.id,
          label: bld.label,
          isBuilding: true,
          borderColor: bld.color
        }
      });
    });

    // 2. Hardware Nodes inside Buildings
    nodes.forEach((n) => {
      elements.push({
        group: "nodes",
        data: {
          id: n.id,
          label: n.name,
          parent: n.building_id, // attaches node inside building box
          nodeType: n.node_type,
          bgColor: NODE_COLORS[n.node_type] || NODE_COLORS.DEFAULT
        },
        position: {
          x: n.x_pos || 400,
          y: n.y_pos || 300
        }
      });
    });

    // 3. Fiber Optic Links
    links.forEach((l) => {
      elements.push({
        group: "edges",
        data: {
          id: l.id,
          source: l.source,
          target: l.target,
          label: `${l.latency_ms}ms`,
          status: l.status,
          isTree: l.is_tree_edge,
          cost: l.cost
        }
      });
    });

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      boxSelectionEnabled: false,
      autounselectify: false,
      layout: {
        name: "preset",
        fit: true,
        padding: 50
      },
      style: [
        // Building Enclosure Styling
        {
          selector: "node[isBuilding]",
          style: {
            "label": "data(label)",
            "background-color": "#090d16",
            "background-opacity": 0.75,
            "border-width": 2,
            "border-style": "dashed",
            "border-color": "data(borderColor)",
            "border-opacity": 0.8,
            "color": "#e2e8f0",
            "font-size": "13px",
            "font-weight": "bold",
            "text-valign": "top",
            "text-halign": "center",
            "text-margin-y": -12,
            "padding": "32px",
            "shape": "roundrectangle",
            "corner-radius": "16px"
          }
        },
        // Individual Network Device Node Styling
        {
          selector: "node[!isBuilding]",
          style: {
            "label": "data(label)",
            "background-color": "data(bgColor)",
            "color": "#f8fafc",
            "font-size": "11px",
            "font-weight": 600,
            "text-valign": "bottom",
            "text-margin-y": 8,
            "width": 38,
            "height": 38,
            "border-width": 3,
            "border-color": "#ffffff",
            "text-wrap": "wrap",
            "text-max-width": "120px",
            "text-background-color": "#030712",
            "text-background-opacity": 0.85,
            "text-background-padding": 3,
            "text-background-shape": "roundrectangle",
            "shadow-blur": 15,
            "shadow-color": "data(bgColor)",
            "shadow-opacity": 0.6
          }
        },
        {
          selector: "node[!isBuilding]:selected",
          style: {
            "border-color": "#38bdf8",
            "border-width": 5,
            "width": 46,
            "height": 46
          }
        },
        // Edge Base Styling
        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            "label": "data(label)",
            "color": "#cbd5e1",
            "font-size": "10px",
            "font-weight": 600,
            "text-background-color": "#030712",
            "text-background-opacity": 0.9,
            "text-background-padding": 3,
            "text-background-shape": "roundrectangle",
            "width": 4
          }
        },
        // Edge Status Colors
        {
          selector: 'edge[status = "ACTIVE"]',
          style: {
            "line-color": "#06b6d4",
            "line-style": "solid",
            "shadow-blur": 12,
            "shadow-color": "#06b6d4",
            "shadow-opacity": 0.5
          }
        },
        {
          selector: 'edge[status = "FAILED"]',
          style: {
            "line-color": "#f43f5e",
            "line-style": "dashed",
            "width": 5,
            "shadow-blur": 20,
            "shadow-color": "#f43f5e",
            "shadow-opacity": 0.8
          }
        },
        {
          selector: 'edge[status = "RECOVERED"]',
          style: {
            "line-color": "#10b981",
            "line-style": "solid",
            "width": 5,
            "shadow-blur": 15,
            "shadow-color": "#10b981",
            "shadow-opacity": 0.7
          }
        },
        {
          selector: 'edge[status = "STANDBY"]',
          style: {
            "line-color": "#64748b",
            "line-style": "dotted",
            "width": 3,
            "opacity": 0.6
          }
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "#fbbf24",
            "width": 6
          }
        }
      ]
    });

    // Map Tap Handlers
    cy.on("tap", "edge", (evt) => {
      const edge = evt.target;
      const linkData = links.find((l) => l.id === edge.id());
      if (linkData) {
        setClickedLink(linkData);
        if (onSelectLink) onSelectLink(linkData.id);
      }
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        setClickedLink(null);
      }
    });

    cyRef.current = cy;
    setTimeout(() => {
      cy.resize();
      cy.fit(null, 40);
    }, 150);

    return () => {
      cy.destroy();
    };
  }, [nodes, links, selectedLinkId]);

  const activeCount = links.filter((l) => l.status === "ACTIVE" || l.status === "RECOVERED").length;
  const failedCount = links.filter((l) => l.status === "FAILED").length;
  const healthPercent = links.length > 0 ? Math.round(((links.length - failedCount) / links.length) * 100) : 100;

  return (
    <div className="space-y-4">
      {/* Top Map HUD Bar */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Health Gauge */}
          <div className="flex items-center gap-3 bg-slate-950/70 px-4 py-2 rounded-xl border border-slate-800">
            <div className={failedCount === 0 ? "led-pulse-green" : "led-pulse-red"} />
            <div>
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Campus Health</div>
              <div className={`text-base font-bold font-mono ${failedCount === 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {healthPercent}% {failedCount === 0 ? "Normal" : "Degraded"}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Active Links: <strong className="text-white">{activeCount}</strong>
            </span>
            {failedCount > 0 && (
              <span className="flex items-center gap-1.5 bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-900/50 text-rose-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                Severed Links: <strong>{failedCount}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Camera Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)}
            title="Zoom In"
            className="btn-action-outline p-2"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
            title="Zoom Out"
            className="btn-action-outline p-2"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => cyRef.current?.fit(null, 40)}
            title="Reset Camera"
            className="btn-action-outline"
          >
            <Maximize2 className="w-3.5 h-3.5 mr-1" /> Reset View
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl blueprint-grid" style={{ height: "600px" }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 glass-panel p-3 text-[11px] space-y-1.5 border border-slate-800/80 pointer-events-auto">
          <div className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Campus Infrastructure
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Gateway ISP Tower
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 ml-2" /> Core Router
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ml-2" /> Switch
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ml-2" /> Server
          </div>
          <div className="flex items-center gap-2 text-slate-400 pt-1 border-t border-slate-800/80">
            <span className="w-4 h-0.5 bg-cyan-400 inline-block" /> Active
            <span className="w-4 h-0.5 border-t border-dashed border-rose-500 inline-block ml-2" /> Failed
            <span className="w-4 h-0.5 bg-emerald-400 inline-block ml-2" /> Recovered
            <span className="w-4 h-0.5 border-t border-dotted border-slate-500 inline-block ml-2" /> Standby
          </div>
        </div>

        {/* Floating Quick Action Card on Link Click */}
        {clickedLink && (
          <div className="absolute top-4 right-4 glass-panel-glow p-4 w-80 space-y-3 z-30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-cyan-400">{clickedLink.id}</span>
              <button
                onClick={() => setClickedLink(null)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Route:</span>
                <span className="font-semibold text-white">{clickedLink.source} ➔ {clickedLink.target}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Latency:</span>
                <span>{clickedLink.latency_ms} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Operational Status:</span>
                <span className={`font-bold ${clickedLink.status === 'ACTIVE' ? 'text-cyan-400' : clickedLink.status === 'FAILED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {clickedLink.status}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              {clickedLink.status !== "FAILED" ? (
                <button
                  onClick={() => {
                    onFailLink(clickedLink.id, "HIGH");
                    setClickedLink(null);
                  }}
                  disabled={loading}
                  className="btn-action-danger flex-1 text-xs justify-center"
                >
                  <Zap className="w-3.5 h-3.5" /> Cut Fiber
                </button>
              ) : (
                <button
                  onClick={() => {
                    onRestoreLink(clickedLink.id);
                    setClickedLink(null);
                  }}
                  disabled={loading}
                  className="btn-action-primary flex-1 text-xs justify-center"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Restore Cable
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
