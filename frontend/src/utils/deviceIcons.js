/**
 * Device SVG Graphics for Cytoscape.js Nodes
 * Replaces plain dots with authentic network hardware illustrations.
 */

// Colors matching user's requested palette:
// #561C24, #6D2932, #C7B7A3, #E8D8C4
const PALETTE = {
  wine: "#561C24",
  plum: "#6D2932",
  sand: "#C7B7A3",
  cream: "#E8D8C4",
  gold: "#F59E0B",
  emerald: "#10B981"
};

// 1. Gateway ISP Telecom Tower
const SVG_GATEWAY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23E8D8C4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2" fill="%23C7B7A3"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19.1"/><path d="M12 14v8"/><path d="M9 22h6"/></svg>`;

// 2. Core Enterprise Router
const SVG_ROUTER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23E8D8C4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="14" rx="2" fill="%23561C24"/><path d="M6 18h.01"/><path d="M10 18h.01"/><path d="M15 10v4"/><path d="M17.8 11.8 15 9l-2.8 2.8"/><path d="M9 10v4"/><path d="M6.2 11.8 9 9l2.8 2.8"/><path d="M12 2v4"/><circle cx="12" cy="2" r="1" fill="%23C7B7A3"/></svg>`;

// 3. Distribution Switch
const SVG_SWITCH = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23E8D8C4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2" fill="%236D2932"/><path d="M6 10h.01"/><path d="M10 10h.01"/><path d="M14 10h.01"/><path d="M18 10h.01"/><path d="m7 14 3-2-3-2"/><path d="m17 14-3-2 3-2"/></svg>`;

// 4. Rack Server (LMS & Portal)
const SVG_SERVER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23E8D8C4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" fill="%23561C24"/><rect width="20" height="8" x="2" y="14" rx="2" fill="%236D2932"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/><line x1="10" x2="18" y1="6" y2="6"/><line x1="10" x2="18" y1="18" y2="18"/></svg>`;

// 5. Academic Lab Workstation / PC
const SVG_LAB = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23E8D8C4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" fill="%23561C24"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/><circle cx="12" cy="10" r="2" fill="%23C7B7A3"/></svg>`;

export function getNodeImage(nodeType) {
  switch (nodeType) {
    case "GATEWAY":
      return SVG_GATEWAY;
    case "CORE_ROUTER":
      return SVG_ROUTER;
    case "SWITCH":
      return SVG_SWITCH;
    case "SERVER":
      return SVG_SERVER;
    case "LAB":
      return SVG_LAB;
    default:
      return SVG_ROUTER;
  }
}
