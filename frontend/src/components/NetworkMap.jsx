/**
 * High-Fidelity Architectural Campus Network Map
 * With 3D Isometric Buildings, Amrita Satellite Imagery Background,
 * Animated Signal Motion, and Zero-Overlap Layout.
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
  Satellite
} from "lucide-react";
import { getBuilding3DImage } from "../utils/buildingIcons3D";
import { AMRITA_SATELLITE_SVG } from "../utils/amritaSatellite";

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

    // 1. Campus 3D Isometric Buildings
    nodes.forEach((n) => {
      elements.push({
        group: "nodes",
        data: {
          id: n.id,
          label: n.name,
          nodeType: n.node_type,
          nodeImg: getBuilding3DImage(n.id, n.node_type)
        },
        position: {
          x: n.x_pos || 500,
          y: n.y_pos || 300
        }
      });
    });

    // 2. Fiber Optic Links
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

    // Initialize Cytoscape with 3D Models
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      boxSelectionEnabled: false,
      autounselectify: false,
      layout: {
        name: "preset",
        fit: true,
        padding: 70
      },
      style: [
        // 3D Isometric Building Nodes
        {
          selector: "node",
          style: {
            "label": "data(label)",
            "background-image": "data(nodeImg)",
            "background-fit": "contain",
            "background-clip": "none",
            "background-color": "transparent",
            "background-opacity": 0,
            "width": 78,
            "height": 78,
            "border-width": 0,
            "color": "#fdfbf7",
            "font-size": "11px",
            "font-weight": 700,
            "text-valign": "bottom",
            "text-margin-y": 14,
            "text-wrap": "wrap",
            "text-max-width": "140px",
            "text-background-color": "rgba(23, 7, 10, 0.9)",
            "text-background-opacity": 0.95,
            "text-background-padding": 4,
            "text-background-shape": "roundrectangle",
            "text-border-color": "#c7b7a3",
            "text-border-width": 1,
            "text-border-opacity": 0.5
          }
        },
        {
          selector: "node:selected",
          style: {
            "width": 88,
            "height": 88,
            "text-border-color": "#e8d8c4",
            "text-border-width": 2
          }
        },
        // Edge Base Styling
        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            "label": "data(label)",
            "color": "#fdfbf7",
            "font-size": "10px",
            "font-weight": 700,
            "text-background-color": "#17070a",
            "text-background-opacity": 0.95,
            "text-background-padding": 3,
            "text-background-shape": "roundrectangle",
            "text-border-color": "#6d2932",
            "text-border-width": 1,
            "width": 4.5
          }
        },
        // Active Fiber with Moving Signal Motion
        {
          selector: 'edge[status = "ACTIVE"]',
          style: {
            "line-color": "#E8D8C4",
            "line-style": "dashed",
            "line-dash-pattern": [10, 6],
            "width": 5.5,
            "shadow-blur": 25,
            "shadow-color": "#FFE8D0",
            "shadow-opacity": 0.85
          }
        },
        // Failed / Severed Fiber Lines - Neon Red Laser Glow
        {
          selector: 'edge[status = "FAILED"]',
          style: {
            "line-color": "#FF0055",
            "line-style": "solid",
            "width": 7,
            "shadow-blur": 40,
            "shadow-color": "#FF0055",
            "shadow-opacity": 1
          }
        },
        // Recovered Backup Fiber - Radiant Electric Neon Green Glow
        {
          selector: 'edge[status = "RECOVERED"]',
          style: {
            "line-color": "#00FF88",
            "line-style": "dashed",
            "line-dash-pattern": [14, 6],
            "width": 7.5,
            "shadow-blur": 45,
            "shadow-color": "#00FF88",
            "shadow-opacity": 1
          }
        },
        // Standby Redundant Links
        {
          selector: 'edge[status = "STANDBY"]',
          style: {
            "line-color": "#B85D6E",
            "line-style": "dotted",
            "width": 3.5,
            "opacity": 0.75
          }
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "#FFF",
            "width": 8,
            "shadow-blur": 50,
            "shadow-color": "#00FF88"
          }
        }
      ]
    });

    // Tap on Link
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

    // Moving Signal Animation along active cables!
    let offset = 0;
    const animateSignal = () => {
      offset = (offset - 1.2) % 40;
      try {
        const activeEdges = cy.edges('[status = "ACTIVE"], [status = "RECOVERED"]');
        if (activeEdges.length > 0) {
          activeEdges.style("line-dash-offset", offset);
        }
      } catch (e) {
        // Safe catch
      }
      animFrameRef.current = requestAnimationFrame(animateSignal);
    };
    animFrameRef.current = requestAnimationFrame(animateSignal);

    cyRef.current = cy;
    setTimeout(() => {
      cy.resize();
      cy.fit(null, 60);
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
      {/* Top HUD Controls */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-[#230b0f] px-4 py-2 rounded-xl border border-[rgba(199,183,163,0.3)]">
            <div className={failedCount === 0 ? "led-pulse-green" : "led-pulse-red"} />
            <div>
              <div className="text-[10px] text-[#c7b7a3] font-semibold uppercase tracking-wider">Campus Signal Status</div>
              <div className={`text-base font-bold font-mono ${failedCount === 0 ? "text-[#e8d8c4]" : "text-rose-400"}`}>
                {healthPercent}% {failedCount === 0 ? "Optimal (Transmitting)" : "Degraded (Partitioned)"}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-[#e8d8c4]">
            <span className="flex items-center gap-1.5 bg-[#230b0f] px-3 py-1.5 rounded-lg border border-[rgba(199,183,163,0.2)]">
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
            onClick={() => cyRef.current?.fit(null, 60)}
            title="Reset Camera"
            className="btn-action-outline"
          >
            <Maximize2 className="w-3.5 h-3.5 mr-1" /> Reset View
          </button>
        </div>
      </div>

      {/* Main Amrita Satellite Imagery Canvas with 3D Buildings */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-[rgba(199,183,163,0.35)] shadow-2xl"
        style={{
          height: "660px",
          backgroundImage: `url("${AMRITA_SATELLITE_SVG}")`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        {/* Satellite Map Attribution Pill */}
        <div className="absolute top-3 left-3 bg-[#150608]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[rgba(199,183,163,0.3)] text-[11px] text-[#e8d8c4] flex items-center gap-1.5 font-mono">
          <Satellite className="w-3.5 h-3.5 text-[#c7b7a3]" />
          Amrita Campus Satellite Aerial View
        </div>

        {/* Floating Action Card when Link is Clicked */}
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
