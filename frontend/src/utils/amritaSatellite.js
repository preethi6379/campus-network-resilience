/**
 * Amrita Vishwa Vidyapeetham Satellite Campus Map Texture
 * Realistic aerial satellite imagery background for Tab 1.
 */

export const AMRITA_SATELLITE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <!-- Campus Forest & Foliage Pattern -->
    <radialGradient id="forest1" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#1b2e1f"/>
      <stop offset="100%" stop-color="#121e15"/>
    </radialGradient>
    <radialGradient id="lawn1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2a442e"/>
      <stop offset="100%" stop-color="#1c3021"/>
    </radialGradient>
    <linearGradient id="road" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2d332d"/>
      <stop offset="100%" stop-color="#222822"/>
    </linearGradient>
    <linearGradient id="lake" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1b3944"/>
      <stop offset="100%" stop-color="#12252d"/>
    </linearGradient>
  </defs>

  <!-- Base Terrain -->
  <rect width="1200" height="800" fill="url(#forest1)"/>

  <!-- Western Ghats Mountain Foothills Texture (North & West) -->
  <path d="M0,0 Q300,120 600,40 T1200,80 L1200,0 Z" fill="#0d180f" opacity="0.8"/>
  <path d="M0,0 Q200,200 0,500 L0,0 Z" fill="#0d180f" opacity="0.6"/>

  <!-- Campus Lawns & Academic Quadrangles -->
  <rect x="360" y="160" width="280" height="260" rx="40" fill="url(#lawn1)" opacity="0.7"/>
  <rect x="740" y="160" width="340" height="300" rx="40" fill="url(#lawn1)" opacity="0.65"/>
  <rect x="60" y="360" width="280" height="380" rx="40" fill="url(#lawn1)" opacity="0.65"/>
  <rect x="360" y="480" width="460" height="260" rx="40" fill="url(#lawn1)" opacity="0.7"/>

  <!-- Campus Lake / Water Reservoir -->
  <ellipse cx="1100" cy="580" rx="70" ry="45" fill="url(#lake)"/>

  <!-- Athletics Ground & Running Track (Oval) -->
  <ellipse cx="200" cy="180" rx="100" ry="60" fill="#2d382d" stroke="#5a6857" stroke-width="2"/>
  <ellipse cx="200" cy="180" rx="80" ry="45" fill="#384738" stroke="#6b7c68" stroke-dasharray="4,4"/>

  <!-- Campus Arterial Roads & Avenues -->
  <!-- North-South Main Spine -->
  <path d="M500,20 L500,780" stroke="url(#road)" stroke-width="22" stroke-linecap="round"/>
  <path d="M500,20 L500,780" stroke="#756956" stroke-width="1.5" stroke-dasharray="10,12" opacity="0.7"/>

  <!-- Central Academic Circular Loop Road -->
  <circle cx="500" cy="330" r="140" fill="none" stroke="url(#road)" stroke-width="18"/>
  <circle cx="500" cy="330" r="140" fill="none" stroke="#756956" stroke-width="1.5" stroke-dasharray="8,10" opacity="0.6"/>

  <!-- East-West Cross Campus Avenues -->
  <path d="M80,480 Q300,460 500,480 T950,480 T1180,480" fill="none" stroke="url(#road)" stroke-width="18"/>
  <path d="M500,320 L920,320" stroke="url(#road)" stroke-width="18"/>
  <path d="M500,620 L800,620" stroke="url(#road)" stroke-width="16"/>

  <!-- Satellite Coordinate Graticule Overlay -->
  <line x1="0" y1="200" x2="1200" y2="200" stroke="#ffffff" stroke-width="0.4" stroke-dasharray="2,6" opacity="0.15"/>
  <line x1="0" y1="400" x2="1200" y2="400" stroke="#ffffff" stroke-width="0.4" stroke-dasharray="2,6" opacity="0.15"/>
  <line x1="0" y1="600" x2="1200" y2="600" stroke="#ffffff" stroke-width="0.4" stroke-dasharray="2,6" opacity="0.15"/>
  <line x1="300" y1="0" x2="300" y2="800" stroke="#ffffff" stroke-width="0.4" stroke-dasharray="2,6" opacity="0.15"/>
  <line x1="600" y1="0" x2="600" y2="800" stroke="#ffffff" stroke-width="0.4" stroke-dasharray="2,6" opacity="0.15"/>
  <line x1="900" y1="0" x2="900" y2="800" stroke="#ffffff" stroke-width="0.4" stroke-dasharray="2,6" opacity="0.15"/>

  <!-- Watermark / Satellite Metadata Label in corner -->
  <text x="30" y="780" fill="#a3b899" font-family="monospace" font-size="11" opacity="0.6">
    🛰️ AMRITA VISHWA VIDYAPEETHAM • SATELLITE RADAR 10.9001° N, 76.9026° E • ALT 412M
  </text>
</svg>
`)}`;
