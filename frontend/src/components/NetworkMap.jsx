/**
 * High-Fidelity Architectural Campus Network Map
 * With Device SVG Pictures, Animated Moving Signals, and Coffee Palette
 * Authors: Preetika & Avanish Ayyappan
 */

import React, { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  Zap,
  RefreshCw,
  Layers,
  Activity
} from "lucide-react";
import { getNodeImage } from "../utils/deviceIcons";

// Campus Architectural Building Enclosures
const BUILDINGS = [
  { id: "BLD_GATEWAY", label: "📡 Campus Gate & Telecom Tower", color: "#C7B7A3" },
  { id: "BLD_MAIN", label: "🏛️ Main Academic Core Block", color: "#E8D8C4" },
  { id: "BLD_DC", label: "🏢 Cloud Data Center & Vault", color: "#C7B7A3" },
  { id: "BLD_CSE", label: "💻 Computer Science Department", color: "#C7B7A3" },
  { id: "BLD_ADMIN", label: "🏢 Administrative Headquarters", color: "#C7B7A3" },
  { id: "BLD_LIB", label: "📚 Central University Library", color: "#C7B7A3" }
];

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
  const animFrameRef = useRef(null);
  const [clickedLink, setClickedLink] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = [];

    // 1. Campus Buildings as Parent Compound Enclosures
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

    // 2. Network Hardware Nodes with SVG Illustrations
    nodes.forEach((n) => {
      elements.push({
        group: "nodes",
        data: {
          id: n.id,
          label: n.name,
          parent: n.building_id,
          nodeType: n.node_type,
          nodeImg: getNodeImage(n.node_type)
        },
        position: {
          x: n.x_pos || 500,
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
        padding: 60
      },
      style: [
        // Building Enclosure Styling (Coffee Palette)
        {
          selector: "node[isBuilding]",
          style: {
            "label": "data(label)",
            "background-color": "#220b0f",
            "background-opacity": 0.65,
            "border-width": 2,
            "border-style": "dashed",
            "border-color": "#c7b7a3",
            "border-opacity": 0.6,
            "color": "#e8d8c4",
            "font-size": "13px",
            "font-weight": "bold",
            "text-valign": "top",
            "text-halign": "center",
            "text-margin-y": -14,
            "padding": "34px",
            "shape": "roundrectangle",
            "corner-radius": "18px"
          }
        },
        // Hardware Device Nodes with SVG Pictures
        {
          selector: "node[!isBuilding]",
          style: {
            "label": "data(label)",
            "background-image": "data(nodeImg)",
            "background-fit": "contain",
            "background-clip": "none",
            "background-color": "#2e0f14",
            "width": 50,
            "height": 50,
            "border-width": 2.5,
            "border-color": "#c7b7a3",
            "border-opacity": 0.9,
            "color": "#f8fafc",
            "font-size": "11px",
            "font-weight": 600,
            "text-valign": "bottom",
            "text-margin-y": 10,
            "text-wrap": "wrap",
            "text-max-width": "120px",
            "text-background-color": "#150608",
            "text-background-opacity": 0.9,
            "text-background-padding": 3,
            "text-background-shape": "roundrectangle"
          }
        },
        {
          selector: "node[!isBuilding]:selected",
          style: {
            "border-color": "#e8d8c4",
            "border-width": 4,
            "width": 56,
            "height": 56
          }
        },
        // Edge Base Styling
        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            "label": "data(label)",
            "color": "#e8d8c4",
            "font-size": "10px",
            "font-weight": 600,
            "text-background-color": "#150608",
            "text-background-opacity": 0.95,
            "text-background-padding": 3,
            "text-background-shape": "roundrectangle",
            "width": 4.5
          }
        },
        // Active Links with Animated Signal Dash
        {
          selector: 'edge[status = "ACTIVE"]',
          style: {
            "line-color": "#c7b7a3",
            "line-style": "dashed",
            "line-dash-pattern": [10, 6],
            "shadow-blur": 10,
            "shadow-color": "#e8d8c4",
            "shadow-opacity": 0.4
          }
        },
        // Failed / Severed Links
        {
          selector: 'edge[status = "FAILED"]',
          style: {
            "line-color": "#f43f5e",
            "line-style": "solid",
            "width": 5,
            "shadow-blur": 20,
            "shadow-color": "#f43f5e",
            "shadow-opacity": 0.9
          }
        },
        // Recovered Backup Links
        {
          selector: 'edge[status = "RECOVERED"]',
          style: {
            "line-color": "#10b981",
            "line-style": "dashed",
            "line-dash-pattern": [12, 6],
            "width": 5,
            "shadow-blur": 15,
            "shadow-color": "#10b981",
            "shadow-opacity": 0.7
          }
        },
        // Standby Redundant Links
        {
          selector: 'edge[status = "STANDBY"]',
          style: {
            "line-color": "#6d2932",
            "line-style": "dotted",
            "width": 3,
            "opacity": 0.7
          }
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "#e8d8c4",
            "width": 6
          }
        }
      ]
    });

    // Map Click Handlers
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

    // Moving Signal Animation Loop along active lines!
    let offset = 0;
    const animateSignalFlow = () => {
      offset = (offset - 0.7) % 32;
      try {
        const activeEdges = cy.edges('[status = "ACTIVE"], [status = "RECOVERED"]');
        if (activeEdges.length > 0) {
          activeEdges.style("line-dash-offset", offset);
        }
      } catch (e) {
        // Safe catch if destroyed
      }
      animFrameRef.current = requestAnimationFrame(animateSignalFlow);
    };
    animFrameRef.current = requestAnimationFrame(animateSignalFlow);

    cyRef.current = cy;
    setTimeout(() => {
      cy.resize();
      cy.fit(null, 50);
    }, 150);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      cy.destroy();
    };
  }, [nodes, links, selectedLinkId]);

  const activeCount = links.filter((l) => l.status === "ACTIVE" || l.status === "RECOVERED").length;
  const failedCount = links.filter((l) => l.status === "FAILED").length;
  const healthPercent = links.length > 0 ? Math.round(((links.length - failedCount) / links.length) * 100) : 100;

  return (
    <div className="space-y-4">
      {/* Top Map HUD Bar with Coffee Palette */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-[#1e0a0d] px-4 py-2 rounded-xl border border-[rgba(199,183,163,0.3)]">
            <div className={failedCount === 0 ? "led-pulse-green" : "led-pulse-red"} />
            <div>
              <div className="text-[10px] text-[#c7b7a3] font-semibold uppercase tracking-wider">Campus Signal Status</div>
              <div className={`text-base font-bold font-mono ${failedCount === 0 ? "text-[#e8d8c4]" : "text-rose-400"}`}>
                {healthPercent}% {failedCount === 0 ? "Optimal (Transmitting)" : "Degraded (Partitioned)"}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-[#e8d8c4]">
            <span className="flex items-center gap-1.5 bg-[#220b0f] px-3 py-1.5 rounded-lg border border-[rgba(199,183,163,0.2)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c7b7a3]" />
              Active Signal Cables: <strong className="text-white">{activeCount}</strong>
            </span>
            {failedCount > 0 && (
              <span className="flex items-center gap-1.5 bg-[#561c24] px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-200">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                Severed Lines: <strong>{failedCount}</strong>
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
            onClick={() => cyRef.current?.fit(null, 50)}
            title="Reset Camera"
            className="btn-action-outline"
          >
            <Maximize2 className="w-3.5 h-3.5 mr-1" /> Reset View
          </button>
        </div>
      </div>

      {/* Main Canvas with Moving Signal Animation */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-[rgba(199,183,163,0.3)] shadow-2xl blueprint-grid"
        style={{ height: "640px" }}
      >
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 glass-panel p-3 text-[11px] space-y-1.5 border border-[rgba(199,183,163,0.3)] pointer-events-auto">
          <div className="text-xs font-bold text-[#e8d8c4] mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#c7b7a3]" /> Campus Hardware Legend
          </div>
          <div className="flex items-center gap-2 text-[#c7b7a3]">
            <span>📡 Tower</span>
            <span className="ml-2">🔀 Router</span>
            <span className="ml-2">📶 Switch</span>
            <span className="ml-2">🗄️ Server</span>
            <span className="ml-2">💻 PC Lab</span>
          </div>
          <div className="flex items-center gap-2 text-[#e8d8c4] pt-1 border-t border-[rgba(199,183,163,0.2)]">
            <span className="w-4 h-0.5 bg-[#c7b7a3] inline-block" /> Live Signal (Flowing)
            <span className="w-4 h-0.5 bg-rose-500 inline-block ml-2" /> Cut/Severed
            <span className="w-4 h-0.5 bg-emerald-400 inline-block ml-2" /> Recovered
            <span className="w-4 h-0.5 border-t border-dotted border-[#6d2932] inline-block ml-2" /> Standby
          </div>
        </div>

        {/* Floating Quick Action Card on Link Click */}
        {clickedLink && (
          <div className="absolute top-4 right-4 glass-panel-glow p-4 w-80 space-y-3 z-30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[rgba(199,183,163,0.2)] pb-2">
              <span className="text-xs font-mono font-bold text-[#e8d8c4]">{clickedLink.id}</span>
              <button
                onClick={() => setClickedLink(null)}
                className="text-[#c7b7a3] hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs text-[#c7b7a3]">
              <div className="flex justify-between">
                <span className="text-slate-400">Endpoints:</span>
                <span className="font-semibold text-white">{clickedLink.source} ➔ {clickedLink.target}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Latency:</span>
                <span className="text-[#e8d8c4] font-semibold">{clickedLink.latency_ms} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Line Status:</span>
                <span className={`font-bold ${clickedLink.status === 'ACTIVE' ? 'text-[#c7b7a3]' : clickedLink.status === 'FAILED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {clickedLink.status} {clickedLink.status === 'ACTIVE' && '(Transmitting)'}
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
                  <Zap className="w-3.5 h-3.5" /> Cut Cable
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
