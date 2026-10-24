/**
 * Cytoscape.js Campus Network Graph Visualizer
 * Author: Preetika (Frontend Lead)
 */

import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

const NODE_COLORS = {
  GATEWAY: "#8b5cf6",     // Purple
  CORE_ROUTER: "#3b82f6", // Blue
  SWITCH: "#06b6d4",      // Cyan
  SERVER: "#10b981",      // Emerald
  LAB: "#f59e0b",         // Amber
  DEFAULT: "#6b7280"
};

export default function NetworkGraph({
  nodes = [],
  links = [],
  selectedLinkId = null,
  onSelectLink,
  onSelectNode
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Build Cytoscape elements
    const elements = [];

    // Nodes
    nodes.forEach((n) => {
      elements.push({
        group: "nodes",
        data: {
          id: n.id,
          label: n.name,
          nodeType: n.node_type,
          bgColor: NODE_COLORS[n.node_type] || NODE_COLORS.DEFAULT
        },
        position: {
          x: n.x_pos || 300,
          y: n.y_pos || 300
        }
      });
    });

    // Edges
    links.forEach((l) => {
      elements.push({
        group: "edges",
        data: {
          id: l.id,
          source: l.source,
          target: l.target,
          latency: `${l.latency_ms}ms`,
          status: l.status,
          isTree: l.is_tree_edge,
          isSelected: l.id === selectedLinkId
        }
      });
    });

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      layout: {
        name: "preset",
        fit: true,
        padding: 40
      },
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "background-color": "data(bgColor)",
            "color": "#f3f4f6",
            "font-size": "11px",
            "font-weight": 600,
            "text-valign": "bottom",
            "text-margin-y": 8,
            "width": 38,
            "height": 38,
            "border-width": 2,
            "border-color": "#ffffff",
            "text-wrap": "wrap",
            "text-max-width": "110px",
            "transition-property": "background-color, border-color, width, height",
            "transition-duration": "0.3s"
          }
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "#ec4899",
            "border-width": 4,
            "width": 44,
            "height": 44
          }
        },
        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            "width": 3,
            "line-color": "#0284c7",
            "opacity": 0.9,
            "label": "data(latency)",
            "color": "#94a3b8",
            "font-size": "10px",
            "text-background-color": "#0f172a",
            "text-background-opacity": 0.8,
            "text-background-padding": 2,
            "text-background-shape": "roundrectangle"
          }
        },
        // Edge Statuses
        {
          selector: 'edge[status = "ACTIVE"]',
          style: {
            "line-color": "#06b6d4",
            "line-style": "solid",
            "width": 3.5
          }
        },
        {
          selector: 'edge[status = "FAILED"]',
          style: {
            "line-color": "#ef4444",
            "line-style": "dashed",
            "width": 3.5,
            "opacity": 0.95
          }
        },
        {
          selector: 'edge[status = "RECOVERED"]',
          style: {
            "line-color": "#10b981",
            "line-style": "solid",
            "width": 4
          }
        },
        {
          selector: 'edge[status = "STANDBY"]',
          style: {
            "line-color": "#64748b",
            "line-style": "dotted",
            "width": 2,
            "opacity": 0.6
          }
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "#f59e0b",
            "width": 5
          }
        }
      ],
      userZoomingEnabled: true,
      userPanningEnabled: true
    });

    // Event handlers
    cy.on("tap", "edge", (evt) => {
      const edge = evt.target;
      if (onSelectLink) onSelectLink(edge.id());
    });

    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      if (onSelectNode) onSelectNode(node.id());
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, links, selectedLinkId]);

  const fitView = () => {
    if (cyRef.current) {
      cyRef.current.fit(null, 40);
    }
  };

  return (
    <div className="relative w-full h-[540px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Legend & Controls overlay */}
      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1.5 pointer-events-auto">
        <div className="font-bold text-slate-100 mb-1">Topology Legend</div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
          <span>Gateway ISP Router</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          <span>Campus Core</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
          <span>Distribution Switch</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Campus Server (LMS / Portal)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>Academic Lab</span>
        </div>
        <div className="border-t border-slate-800 pt-1 mt-1 space-y-1">
          <div className="flex items-center space-x-2 text-cyan-400">
            <span className="w-4 h-0.5 bg-cyan-400 inline-block" />
            <span>Active LCT Backbone</span>
          </div>
          <div className="flex items-center space-x-2 text-red-400">
            <span className="w-4 h-0.5 border-t border-dashed border-red-500 inline-block" />
            <span>Severed Link (Failed)</span>
          </div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <span className="w-4 h-0.5 bg-emerald-400 inline-block" />
            <span>Activated Recovery</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="w-4 h-0.5 border-t border-dotted border-slate-500 inline-block" />
            <span>Standby Redundant</span>
          </div>
        </div>
      </div>

      <button
        onClick={fitView}
        className="absolute bottom-3 right-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-md border border-slate-700 transition"
      >
        Reset Camera View
      </button>
    </div>
  );
}
