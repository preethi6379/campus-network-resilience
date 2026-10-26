/**
 * 3D Isometric Campus Buildings SVG Definitions
 * Replaces circles with detailed 3D architectural models.
 * Palette: #561C24 (Wine), #6D2932 (Plum), #C7B7A3 (Sand/Taupe), #E8D8C4 (Cream)
 */

// Helper to encode SVG into valid Cytoscape data URI
function encodeSvg(svgString) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

// 1. 3D Telecom & ISP Gateway Tower (Antenna mast with 3D transceiver shelter)
export const SVG_3D_GATEWAY = encodeSvg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="tw1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8D8C4"/>
      <stop offset="100%" stop-color="#C7B7A3"/>
    </linearGradient>
    <linearGradient id="baseRoof" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8F3D4A"/>
      <stop offset="100%" stop-color="#6D2932"/>
    </linearGradient>
  </defs>
  <!-- 3D Base Building -->
  <!-- Top Roof -->
  <polygon points="50,48 78,60 50,72 22,60" fill="url(#baseRoof)" stroke="#E8D8C4" stroke-width="1.2"/>
  <!-- Front Right Face -->
  <polygon points="50,72 78,60 78,76 50,88" fill="#561C24" stroke="#E8D8C4" stroke-width="1"/>
  <!-- Front Left Face -->
  <polygon points="22,60 50,72 50,88 22,76" fill="#6D2932" stroke="#E8D8C4" stroke-width="1"/>
  <!-- Windows on base -->
  <polygon points="30,68 38,72 38,77 30,73" fill="#E8D8C4" opacity="0.9"/>
  <polygon points="62,72 70,68 70,73 62,77" fill="#C7B7A3" opacity="0.9"/>

  <!-- 3D Tower Lattice Truss -->
  <line x1="50" y1="12" x2="50" y2="52" stroke="url(#tw1)" stroke-width="2.5"/>
  <line x1="38" y1="52" x2="50" y2="12" stroke="#C7B7A3" stroke-width="1.8"/>
  <line x1="62" y1="52" x2="50" y2="12" stroke="#C7B7A3" stroke-width="1.8"/>
  <!-- Cross Bracing -->
  <line x1="42" y1="42" x2="58" y2="42" stroke="#E8D8C4" stroke-width="1.4"/>
  <line x1="45" y1="30" x2="55" y2="30" stroke="#E8D8C4" stroke-width="1.2"/>
  <line x1="42" y1="42" x2="55" y2="30" stroke="#C7B7A3" stroke-width="1"/>
  <line x1="58" y1="42" x2="45" y2="30" stroke="#C7B7A3" stroke-width="1"/>

  <!-- Parabolic Microwave Dish -->
  <ellipse cx="50" cy="24" rx="7" ry="4" fill="#E8D8C4" stroke="#561C24" stroke-width="1"/>
  <!-- Glowing Beacon Light -->
  <circle cx="50" cy="11" r="3.5" fill="#F43F5E" stroke="#FFFFFF" stroke-width="1"/>
</svg>
`);

// 2. 3D Main Academic Core Block (Colonnade, 3D tiers, portico dome)
export const SVG_3D_MAIN_BLOCK = encodeSvg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8D8C4"/>
      <stop offset="100%" stop-color="#C7B7A3"/>
    </linearGradient>
    <linearGradient id="domeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8D8C4"/>
      <stop offset="100%" stop-color="#8F3D4A"/>
    </linearGradient>
  </defs>
  <!-- Lower Floor Isometric Box -->
  <!-- Top Face -->
  <polygon points="50,40 85,55 50,70 15,55" fill="url(#roofGrad)" stroke="#E8D8C4" stroke-width="1.2"/>
  <!-- Left Face -->
  <polygon points="15,55 50,70 50,90 15,75" fill="#6D2932" stroke="#E8D8C4" stroke-width="1"/>
  <!-- Right Face -->
  <polygon points="50,70 85,55 85,75 50,90" fill="#561C24" stroke="#E8D8C4" stroke-width="1"/>

  <!-- Windows Left Face -->
  <polygon points="22,61 30,65 30,70 22,66" fill="#E8D8C4" opacity="0.9"/>
  <polygon points="36,67 44,71 44,76 36,72" fill="#E8D8C4" opacity="0.9"/>
  <polygon points="22,70 30,74 30,79 22,75" fill="#E8D8C4" opacity="0.9"/>
  <polygon points="36,76 44,80 44,85 36,81" fill="#E8D8C4" opacity="0.9"/>

  <!-- Windows Right Face -->
  <polygon points="56,71 64,67 64,72 56,76" fill="#C7B7A3" opacity="0.9"/>
  <polygon points="70,65 78,61 78,66 70,70" fill="#C7B7A3" opacity="0.9"/>
  <polygon points="56,80 64,76 64,81 56,85" fill="#C7B7A3" opacity="0.9"/>
  <polygon points="70,74 78,70 78,75 70,79" fill="#C7B7A3" opacity="0.9"/>

  <!-- Upper Tier Academic Hall -->
  <polygon points="50,28 72,38 50,48 28,38" fill="url(#roofGrad)" stroke="#C7B7A3" stroke-width="1"/>
  <polygon points="28,38 50,48 50,56 28,46" fill="#8F3D4A" stroke="#C7B7A3" stroke-width="1"/>
  <polygon points="50,48 72,38 72,46 50,56" fill="#6D2932" stroke="#C7B7A3" stroke-width="1"/>

  <!-- Academic Center Dome & Flag -->
  <ellipse cx="50" cy="24" rx="10" ry="8" fill="url(#domeGrad)" stroke="#E8D8C4" stroke-width="1"/>
  <line x1="50" y1="16" x2="50" y2="7" stroke="#E8D8C4" stroke-width="1.8"/>
  <polygon points="50,7 57,10 50,13" fill="#F59E0B"/>
</svg>
`);

// 3. 3D Cloud Data Center & Server Vault (High-tech cube with cooling units and LED server blades)
export const SVG_3D_DATA_CENTER = encodeSvg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="dcRoof" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C7B7A3"/>
      <stop offset="100%" stop-color="#8F3D4A"/>
    </linearGradient>
  </defs>
  <!-- Main Isometric Data Vault -->
  <polygon points="50,30 86,47 50,64 14,47" fill="url(#dcRoof)" stroke="#E8D8C4" stroke-width="1.4"/>
  <polygon points="14,47 50,64 50,88 14,71" fill="#561C24" stroke="#E8D8C4" stroke-width="1.2"/>
  <polygon points="50,64 86,47 86,71 50,88" fill="#421219" stroke="#E8D8C4" stroke-width="1.2"/>

  <!-- Rooftop Industrial HVAC Cooling Chillers -->
  <polygon points="36,36 48,42 42,46 30,40" fill="#E8D8C4" stroke="#561C24" stroke-width="1"/>
  <polygon points="30,40 42,46 42,50 30,44" fill="#6D2932"/>
  <polygon points="42,46 48,42 48,46 42,50" fill="#561C24"/>
  <circle cx="39" cy="41" r="2.5" fill="#561C24"/>

  <!-- Server Blades & Glowing Fiber LED Channels -->
  <!-- Left Side Server Racks -->
  <line x1="22" y1="55" x2="42" y2="65" stroke="#10B981" stroke-width="2"/>
  <line x1="22" y1="62" x2="42" y2="72" stroke="#10B981" stroke-width="2"/>
  <line x1="22" y1="69" x2="42" y2="79" stroke="#10B981" stroke-width="2"/>
  <circle cx="20" cy="54" r="1.5" fill="#34D399"/>
  <circle cx="20" cy="61" r="1.5" fill="#34D399"/>
  <circle cx="20" cy="68" r="1.5" fill="#34D399"/>

  <!-- Right Side High-Speed Fiber Ingress -->
  <line x1="58" y1="66" x2="78" y2="56" stroke="#E8D8C4" stroke-width="2"/>
  <line x1="58" y1="73" x2="78" y2="63" stroke="#E8D8C4" stroke-width="2"/>
  <circle cx="80" cy="55" r="1.8" fill="#F59E0B"/>
  <circle cx="80" cy="62" r="1.8" fill="#F59E0B"/>
</svg>
`);

// 4. 3D Computer Science Department (Modern glass facade tech wing with labs)
export const SVG_3D_CSE_DEPT = encodeSvg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="cseGlass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8D8C4"/>
      <stop offset="100%" stop-color="#C7B7A3"/>
    </linearGradient>
  </defs>
  <!-- Lower Lab Wing -->
  <polygon points="50,38 88,54 50,70 12,54" fill="#C7B7A3" stroke="#E8D8C4" stroke-width="1.2"/>
  <polygon points="12,54 50,70 50,90 12,74" fill="#6D2932" stroke="#E8D8C4" stroke-width="1"/>
  <polygon points="50,70 88,54 88,74 50,90" fill="#561C24" stroke="#E8D8C4" stroke-width="1"/>

  <!-- Glass Curtain Windows -->
  <polygon points="20,59 42,68 42,82 20,73" fill="url(#cseGlass)" opacity="0.85" stroke="#561C24" stroke-width="0.8"/>
  <polygon points="58,68 80,59 80,73 58,82" fill="url(#cseGlass)" opacity="0.85" stroke="#561C24" stroke-width="0.8"/>
  <line x1="31" y1="63" x2="31" y2="78" stroke="#561C24" stroke-width="0.8"/>
  <line x1="69" y1="64" x2="69" y2="78" stroke="#561C24" stroke-width="0.8"/>

  <!-- Upper Tech Atrium Tower -->
  <polygon points="50,22 74,33 50,44 26,33" fill="#E8D8C4" stroke="#8F3D4A" stroke-width="1.2"/>
  <polygon points="26,33 50,44 50,54 26,43" fill="#8F3D4A" stroke="#E8D8C4" stroke-width="1"/>
  <polygon points="50,44 74,33 74,43 50,54" fill="#6D2932" stroke="#E8D8C4" stroke-width="1"/>

  <!-- Rooftop Solar / Satellite Dishes -->
  <ellipse cx="42" cy="28" rx="4" ry="2.5" fill="#561C24" stroke="#E8D8C4" stroke-width="0.8"/>
  <ellipse cx="58" cy="28" rx="4" ry="2.5" fill="#561C24" stroke="#E8D8C4" stroke-width="0.8"/>
</svg>
`);

// 5. 3D Central University Library (Arched windows, reading rotunda, tiered book repository)
export const SVG_3D_LIBRARY = encodeSvg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="libRoof" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8D8C4"/>
      <stop offset="100%" stop-color="#C7B7A3"/>
    </linearGradient>
  </defs>
  <!-- Base Building -->
  <polygon points="50,38 84,54 50,70 16,54" fill="url(#libRoof)" stroke="#E8D8C4" stroke-width="1.2"/>
  <polygon points="16,54 50,70 50,90 16,74" fill="#6D2932" stroke="#E8D8C4" stroke-width="1"/>
  <polygon points="50,70 84,54 84,74 50,90" fill="#561C24" stroke="#E8D8C4" stroke-width="1"/>

  <!-- Grand Arched Reading Hall Windows -->
  <!-- Left Side -->
  <path d="M22 68 Q26 62 30 68 L30 76 L22 73 Z" fill="#E8D8C4" stroke="#561C24" stroke-width="0.8"/>
  <path d="M34 73 Q38 67 42 73 L42 81 L34 78 Z" fill="#E8D8C4" stroke="#561C24" stroke-width="0.8"/>

  <!-- Right Side -->
  <path d="M58 73 Q62 67 66 73 L66 78 L58 81 Z" fill="#C7B7A3" stroke="#561C24" stroke-width="0.8"/>
  <path d="M70 68 Q74 62 78 68 L78 73 L70 76 Z" fill="#C7B7A3" stroke="#561C24" stroke-width="0.8"/>

  <!-- Tiered Skylight Rotunda on Roof -->
  <polygon points="50,24 68,33 50,42 32,33" fill="#E8D8C4" stroke="#6D2932" stroke-width="1"/>
  <polygon points="32,33 50,42 50,48 32,39" fill="#8F3D4A"/>
  <polygon points="50,42 68,33 68,39 50,48" fill="#6D2932"/>
  <circle cx="50" cy="30" r="5" fill="#F59E0B" opacity="0.9"/>
</svg>
`);

// 6. 3D Administrative Headquarters (Clock tower, executive portico)
export const SVG_3D_ADMIN_BLOCK = encodeSvg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="adminRoof" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8D8C4"/>
      <stop offset="100%" stop-color="#C7B7A3"/>
    </linearGradient>
  </defs>
  <!-- Lower Admin Wing -->
  <polygon points="50,42 84,56 50,70 16,56" fill="url(#adminRoof)" stroke="#E8D8C4" stroke-width="1.2"/>
  <polygon points="16,56 50,70 50,90 16,76" fill="#6D2932" stroke="#E8D8C4" stroke-width="1"/>
  <polygon points="50,70 84,56 84,76 50,90" fill="#561C24" stroke="#E8D8C4" stroke-width="1"/>

  <!-- Windows & Grand Portico Entrance -->
  <polygon points="24,64 32,67 32,74 24,71" fill="#E8D8C4"/>
  <polygon points="68,67 76,64 76,71 68,74" fill="#C7B7A3"/>
  <!-- Entrance Doors -->
  <polygon points="44,78 50,81 50,88 44,85" fill="#E8D8C4"/>
  <polygon points="50,81 56,78 56,85 50,88" fill="#E8D8C4"/>

  <!-- Administrative Central Clock Tower -->
  <polygon points="50,18 64,25 50,32 36,25" fill="#E8D8C4" stroke="#8F3D4A" stroke-width="1"/>
  <polygon points="36,25 50,32 50,46 36,39" fill="#8F3D4A" stroke="#E8D8C4" stroke-width="0.8"/>
  <polygon points="50,32 64,25 64,39 50,46" fill="#6D2932" stroke="#E8D8C4" stroke-width="0.8"/>

  <!-- Clock Face -->
  <circle cx="43" cy="35" r="3.5" fill="#E8D8C4" stroke="#561C24" stroke-width="0.8"/>
  <circle cx="57" cy="35" r="3.5" fill="#C7B7A3" stroke="#561C24" stroke-width="0.8"/>
  <!-- Spire -->
  <line x1="50" y1="18" x2="50" y2="8" stroke="#E8D8C4" stroke-width="2"/>
  <circle cx="50" cy="7" r="2" fill="#F59E0B"/>
</svg>
`);

export function getBuilding3DImage(nodeId, nodeType) {
  if (nodeId.includes("GW")) return SVG_3D_GATEWAY;
  if (nodeId.includes("CORE")) return SVG_3D_MAIN_BLOCK;
  if (nodeId.includes("DC") || nodeId.includes("LMS") || nodeId.includes("LIB_PORTAL")) return SVG_3D_DATA_CENTER;
  if (nodeId.includes("CSE")) return SVG_3D_CSE_DEPT;
  if (nodeId.includes("ADMIN")) return SVG_3D_ADMIN_BLOCK;
  if (nodeId.includes("LIB")) return SVG_3D_LIBRARY;

  switch (nodeType) {
    case "GATEWAY": return SVG_3D_GATEWAY;
    case "CORE_ROUTER": return SVG_3D_MAIN_BLOCK;
    case "SERVER": return SVG_3D_DATA_CENTER;
    case "LAB": return SVG_3D_CSE_DEPT;
    case "SWITCH": return SVG_3D_ADMIN_BLOCK;
    default: return SVG_3D_MAIN_BLOCK;
  }
}
