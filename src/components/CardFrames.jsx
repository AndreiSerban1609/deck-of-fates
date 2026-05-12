import React from "react";

const P = 20;
const S = { position: "absolute", top: -P, left: -P, pointerEvents: "none", zIndex: 4 };

const rrect = (w, h, r = 14) =>
  `M${r} 0H${w - r}Q${w} 0 ${w} ${r}V${h - r}Q${w} ${h} ${w - r} ${h}H${r}Q0 ${h} 0 ${h - r}V${r}Q0 0 ${r} 0Z`;

function Frame({ w, h, children }) {
  return (
    <svg style={S} width={w + P * 2} height={h + P * 2} viewBox={`0 0 ${w + P * 2} ${h + P * 2}`} fill="none">
      <g transform={`translate(${P},${P})`}>{children}</g>
    </svg>
  );
}

// ═══════════════════════════════════
//  BASE CARD FRAMES
// ═══════════════════════════════════

export function SteelCriticalFrame({ color = "#8b9dc3", w = 200, h = 290 }) {
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="3" />
      <path d={rrect(w - 8, h - 8, 10)} stroke={color} strokeWidth="0.8" opacity="0.4" transform="translate(4,4)" />
      {[[14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="5.5" stroke={color} strokeWidth="1.8" fill="none" opacity="0.7" />
          <circle cx={cx} cy={cy} r="2" fill={color} opacity="0.6" />
        </g>
      ))}
      {[w * 0.35, w * 0.5, w * 0.65].map((x, i) => (
        <g key={`t${i}`}>
          <line x1={x - 8} y1="1" x2={x + 8} y2="1" stroke={color} strokeWidth="4" opacity="0.4" />
          <line x1={x - 8} y1={h - 1} x2={x + 8} y2={h - 1} stroke={color} strokeWidth="4" opacity="0.4" />
        </g>
      ))}
      {[h * 0.3, h * 0.5, h * 0.7].map((y, i) => (
        <g key={`s${i}`}>
          <line x1="1" y1={y - 8} x2="1" y2={y + 8} stroke={color} strokeWidth="4" opacity="0.4" />
          <line x1={w - 1} y1={y - 8} x2={w - 1} y2={y + 8} stroke={color} strokeWidth="4" opacity="0.4" />
        </g>
      ))}
    </Frame>
  );
}

export function EnergyCriticalFrame({ color = "#b44aed", w = 200, h = 290 }) {
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="2.5" />
      <path d={`M${w * 0.18} 0 L${w * 0.2} -8 L${w * 0.24} 3 L${w * 0.27} -7 L${w * 0.3} 0`} stroke={color} strokeWidth="2.5" opacity="0.8" />
      <path d={`M${w * 0.58} 0 L${w * 0.62} -9 L${w * 0.65} 2 L${w * 0.69} -6 L${w * 0.73} 0`} stroke={color} strokeWidth="2.5" opacity="0.7" />
      <path d={`M${w * 0.28} ${h} L${w * 0.32} ${h + 8} L${w * 0.35} ${h - 2} L${w * 0.39} ${h + 6} L${w * 0.42} ${h}`} stroke={color} strokeWidth="2.5" opacity="0.8" />
      <path d={`M${w * 0.62} ${h} L${w * 0.65} ${h + 9} L${w * 0.69} ${h - 2} L${w * 0.72} ${h + 5} L${w * 0.76} ${h}`} stroke={color} strokeWidth="2.5" opacity="0.7" />
      <path d={`M0 ${h * 0.2} L-7 ${h * 0.24} L2 ${h * 0.28} L-6 ${h * 0.32} L0 ${h * 0.36}`} stroke={color} strokeWidth="2.5" opacity="0.7" />
      <path d={`M${w} ${h * 0.55} L${w + 7} ${h * 0.59} L${w - 2} ${h * 0.63} L${w + 6} ${h * 0.67} L${w} ${h * 0.71}`} stroke={color} strokeWidth="2.5" opacity="0.7" />
      {[[16, 16], [w - 16, 16], [16, h - 16], [w - 16, h - 16]].map(([cx, cy], i) => (
        <g key={i}><circle cx={cx} cy={cy} r="4" fill={color} opacity="0.25" /><circle cx={cx} cy={cy} r="1.5" fill={color} opacity="0.7" /></g>
      ))}
      <path d={rrect(w - 6, h - 6, 11)} stroke={color} strokeWidth="0.8" opacity="0.3" transform="translate(3,3)" strokeDasharray="8 4" />
    </Frame>
  );
}

export function NeutralFrame({ color = "#7a7568", w = 200, h = 290 }) {
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="2" />
      <path d={rrect(w - 10, h - 10, 9)} stroke={color} strokeWidth="0.8" opacity="0.35" transform="translate(5,5)" />
      <rect x={w / 2 - 5} y="1" width="10" height="3" rx="1.5" fill={color} opacity="0.5" />
      <rect x={w / 2 - 5} y={h - 4} width="10" height="3" rx="1.5" fill={color} opacity="0.5" />
      <rect x="1" y={h / 2 - 5} width="3" height="10" rx="1.5" fill={color} opacity="0.5" />
      <rect x={w - 4} y={h / 2 - 5} width="3" height="10" rx="1.5" fill={color} opacity="0.5" />
    </Frame>
  );
}

export function EncounterFrame({ color = "#d4622a", w = 200, h = 290 }) {
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="2.5" />
      {[0.1, 0.28, 0.46, 0.64, 0.82].map((p, i) => (
        <path key={i} d={`M${w * p} ${h} Q${w * p + 3} ${h - 14 - i * 3} ${w * p + 8} ${h - 22 - i * 4} Q${w * p + 12} ${h - 10 - i * 2} ${w * p + 16} ${h}`} fill={color} opacity={0.2 + i * 0.03} />
      ))}
      <circle cx={w * 0.22} cy={h - 34} r="2.5" fill={color} opacity="0.5" />
      <circle cx={w * 0.55} cy={h - 40} r="2" fill={color} opacity="0.45" />
      <circle cx={w * 0.78} cy={h - 28} r="2.2" fill={color} opacity="0.4" />
      <line x1="4" y1="20" x2="11" y2="10" stroke={color} strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      <line x1="7" y1="26" x2="13" y2="16" stroke={color} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      <line x1={w - 4} y1="20" x2={w - 11} y2="10" stroke={color} strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      <line x1={w - 7} y1="26" x2={w - 13} y2="16" stroke={color} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
    </Frame>
  );
}

export function StatFrame({ color = "#2a9cd4", w = 200, h = 290 }) {
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="2" />
      {[[14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14]].map(([cx, cy], i) => (
        <g key={i}><circle cx={cx} cy={cy} r="7" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" /><circle cx={cx} cy={cy} r="3" fill={color} opacity="0.5" /></g>
      ))}
      {[[w / 2, 0], [w / 2, h], [0, h / 2], [w, h / 2]].map(([cx, cy], i) => (
        <circle key={`m${i}`} cx={cx} cy={cy} r="4" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
      ))}
      <path d={rrect(w - 12, h - 12, 8)} stroke={color} strokeWidth="0.7" opacity="0.25" strokeDasharray="4 6" transform="translate(6,6)" />
    </Frame>
  );
}

// ═══════════════════════════════════
//  CLASS FRAMES
// ═══════════════════════════════════

export function MusicianFrame({ color = "#c4587a", w = 200, h = 290 }) {
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="2.5" />
      {/* Lute emerging from behind top-left */}
      <ellipse cx="18" cy="-4" rx="10" ry="7" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.15" opacity="0.7" />
      <ellipse cx="18" cy="-4" rx="5" ry="3" fill={color} opacity="0.25" />
      <line x1="18" y1="-11" x2="18" y2="-20" stroke={color} strokeWidth="2.5" opacity="0.7" strokeLinecap="round" />
      <line x1="15" y1="-18" x2="21" y2="-18" stroke={color} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
      <line x1="15" y1="-15" x2="21" y2="-15" stroke={color} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      {/* Lute emerging from behind top-right */}
      <ellipse cx={w - 18} cy="-4" rx="10" ry="7" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.15" opacity="0.7" />
      <ellipse cx={w - 18} cy="-4" rx="5" ry="3" fill={color} opacity="0.25" />
      <line x1={w - 18} y1="-11" x2={w - 18} y2="-20" stroke={color} strokeWidth="2.5" opacity="0.7" strokeLinecap="round" />
      <line x1={w - 21} y1="-18" x2={w - 15} y2="-18" stroke={color} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
      <line x1={w - 21} y1="-15" x2={w - 15} y2="-15" stroke={color} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      {/* Musical wave along bottom */}
      <path d={`M${w * 0.1} ${h - 2} Q${w * 0.25} ${h - 14} ${w * 0.4} ${h - 2} Q${w * 0.55} ${h + 10} ${w * 0.7} ${h - 2} Q${w * 0.85} ${h - 12} ${w * 0.95} ${h - 2}`} stroke={color} strokeWidth="2" opacity="0.45" fill="none" />
      {/* Note dots on sides */}
      {[0.25, 0.45, 0.65, 0.85].map((p, i) => (
        <g key={i}>
          <circle cx={i % 2 === 0 ? 3 : w - 3} cy={h * p} r="2.5" fill={color} opacity="0.25" />
          <line x1={i % 2 === 0 ? 3 : w - 3} y1={h * p - 2.5} x2={i % 2 === 0 ? 3 : w - 3} y2={h * p - 10} stroke={color} strokeWidth="1.5" opacity="0.3" />
        </g>
      ))}
    </Frame>
  );
}

export function DiscipleFrame({ color = "#e0c040", w = 200, h = 290 }) {
  const hw = w / 2;
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="2.5" />
      {/* Prominent sun rays from top center */}
      <line x1={hw} y1="0" x2={hw} y2="-18" stroke={color} strokeWidth="3" opacity="0.7" strokeLinecap="round" />
      <line x1={hw - 12} y1="1" x2={hw - 20} y2="-14" stroke={color} strokeWidth="2.5" opacity="0.6" strokeLinecap="round" />
      <line x1={hw + 12} y1="1" x2={hw + 20} y2="-14" stroke={color} strokeWidth="2.5" opacity="0.6" strokeLinecap="round" />
      <line x1={hw - 22} y1="3" x2={hw - 30} y2="-6" stroke={color} strokeWidth="2" opacity="0.45" strokeLinecap="round" />
      <line x1={hw + 22} y1="3" x2={hw + 30} y2="-6" stroke={color} strokeWidth="2" opacity="0.45" strokeLinecap="round" />
      {/* Sun disc at top */}
      <circle cx={hw} cy="0" r="6" fill={color} opacity="0.15" />
      {/* Corner radiance */}
      <line x1="3" y1="3" x2="16" y2="16" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <line x1="3" y1="12" x2="12" y2="16" stroke={color} strokeWidth="1.2" opacity="0.3" />
      <line x1={w - 3} y1="3" x2={w - 16} y2="16" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <line x1={w - 3} y1="12" x2={w - 12} y2="16" stroke={color} strokeWidth="1.2" opacity="0.3" />
      {/* Inner glow border */}
      <path d={rrect(w - 8, h - 8, 10)} stroke={color} strokeWidth="0.7" opacity="0.2" transform="translate(4,4)" />
      {/* Bottom radiance (no cross) */}
      <circle cx={hw} cy={h} r="4" fill={color} opacity="0.15" />
      <line x1={hw - 14} y1={h - 2} x2={hw - 6} y2={h - 2} stroke={color} strokeWidth="1.5" opacity="0.3" />
      <line x1={hw + 6} y1={h - 2} x2={hw + 14} y2={h - 2} stroke={color} strokeWidth="1.5" opacity="0.3" />
    </Frame>
  );
}

export function WildbornFrame({ color = "#4aaa6a", w = 200, h = 290 }) {
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="2.5" />
      {/* Thick vine left side - encroaching onto card */}
      <path d={`M-4 ${h * 0.1} Q12 ${h * 0.18} 6 ${h * 0.28} Q-6 ${h * 0.38} 8 ${h * 0.48} Q18 ${h * 0.56} 4 ${h * 0.66} Q-8 ${h * 0.76} 6 ${h * 0.86} Q14 ${h * 0.92} 2 ${h}`} stroke={color} strokeWidth="3" opacity="0.6" strokeLinecap="round" />
      {/* Leaves on left vine */}
      <ellipse cx="10" cy={h * 0.22} rx="8" ry="4" fill={color} opacity="0.3" transform={`rotate(-35 10 ${h * 0.22})`} />
      <ellipse cx="2" cy={h * 0.42} rx="7" ry="3.5" fill={color} opacity="0.25" transform={`rotate(30 2 ${h * 0.42})`} />
      <ellipse cx="12" cy={h * 0.6} rx="8" ry="4" fill={color} opacity="0.3" transform={`rotate(-25 12 ${h * 0.6})`} />
      <ellipse cx="4" cy={h * 0.8} rx="7" ry="3" fill={color} opacity="0.25" transform={`rotate(20 4 ${h * 0.8})`} />
      {/* Vine right side */}
      <path d={`M${w + 4} ${h * 0.2} Q${w - 10} ${h * 0.3} ${w - 4} ${h * 0.4} Q${w + 8} ${h * 0.5} ${w - 6} ${h * 0.6} Q${w - 14} ${h * 0.68} ${w - 2} ${h * 0.78}`} stroke={color} strokeWidth="3" opacity="0.5" strokeLinecap="round" />
      <ellipse cx={w - 8} cy={h * 0.35} rx="7" ry="3.5" fill={color} opacity="0.25" transform={`rotate(30 ${w - 8} ${h * 0.35})`} />
      <ellipse cx={w - 2} cy={h * 0.55} rx="8" ry="3.5" fill={color} opacity="0.3" transform={`rotate(-20 ${w - 2} ${h * 0.55})`} />
      {/* Vine tendrils at top */}
      <path d={`M${w * 0.3} 0 Q${w * 0.32} -6 ${w * 0.28} -10`} stroke={color} strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      <path d={`M${w * 0.7} 0 Q${w * 0.72} -8 ${w * 0.68} -12`} stroke={color} strokeWidth="2" opacity="0.4" strokeLinecap="round" />
    </Frame>
  );
}

export function WarriorFrame({ color = "#c43030", w = 200, h = 290 }) {
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="3" />
      {/* Sword hilt left - prominent protrusion */}
      <line x1="24" y1="6" x2="24" y2="-16" stroke={color} strokeWidth="3.5" opacity="0.8" strokeLinecap="round" />
      <path d={`M24 -16 L21 -20 L24 -24 L27 -20 Z`} fill={color} opacity="0.7" /> {/* pommel */}
      <line x1="14" y1="3" x2="34" y2="3" stroke={color} strokeWidth="3" opacity="0.7" strokeLinecap="round" /> {/* crossguard */}
      <circle cx="14" cy="3" r="2" fill={color} opacity="0.5" />
      <circle cx="34" cy="3" r="2" fill={color} opacity="0.5" />
      {/* Sword hilt right */}
      <line x1={w - 24} y1="6" x2={w - 24} y2="-16" stroke={color} strokeWidth="3.5" opacity="0.8" strokeLinecap="round" />
      <path d={`M${w - 24} -16 L${w - 27} -20 L${w - 24} -24 L${w - 21} -20 Z`} fill={color} opacity="0.7" />
      <line x1={w - 34} y1="3" x2={w - 14} y2="3" stroke={color} strokeWidth="3" opacity="0.7" strokeLinecap="round" />
      <circle cx={w - 14} cy="3" r="2" fill={color} opacity="0.5" />
      <circle cx={w - 34} cy="3" r="2" fill={color} opacity="0.5" />
      {/* Battle scratches */}
      <line x1="6" y1={h * 0.3} x2="3" y2={h * 0.3 + 28} stroke={color} strokeWidth="2" opacity="0.45" strokeLinecap="round" />
      <line x1="10" y1={h * 0.3 + 5} x2="7" y2={h * 0.3 + 25} stroke={color} strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
      <line x1={w - 5} y1={h * 0.6} x2={w - 3} y2={h * 0.6 + 22} stroke={color} strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      <circle cx="5" cy={h * 0.55} r="3" fill={color} opacity="0.2" />
    </Frame>
  );
}

export function MonkFrame({ color = "#40b8a8", w = 200, h = 290 }) {
  const hw = w / 2;
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="2" />
      {/* Prominent lotus top center */}
      <path d={`M${hw - 10} 0 Q${hw} -16 ${hw + 10} 0`} stroke={color} strokeWidth="2.5" opacity="0.65" fill="none" />
      <path d={`M${hw - 16} 0 Q${hw} -10 ${hw + 16} 0`} stroke={color} strokeWidth="2" opacity="0.45" fill="none" />
      <path d={`M${hw - 6} 0 Q${hw} -20 ${hw + 6} 0`} stroke={color} strokeWidth="2" opacity="0.55" fill="none" />
      <circle cx={hw} cy="-4" r="3" fill={color} opacity="0.3" />
      {/* Bold geometric corners */}
      {[[6, 6, 1, 1], [w - 6, 6, -1, 1], [6, h - 6, 1, -1], [w - 6, h - 6, -1, -1]].map(([x, y, dx, dy], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x + dx * 20} y2={y} stroke={color} strokeWidth="1.8" opacity="0.5" />
          <line x1={x} y1={y} x2={x} y2={y + dy * 20} stroke={color} strokeWidth="1.8" opacity="0.5" />
          <line x1={x + dx * 6} y1={y + dy * 6} x2={x + dx * 16} y2={y + dy * 6} stroke={color} strokeWidth="1.2" opacity="0.35" />
          <line x1={x + dx * 6} y1={y + dy * 6} x2={x + dx * 6} y2={y + dy * 16} stroke={color} strokeWidth="1.2" opacity="0.35" />
        </g>
      ))}
      {/* Edge circles */}
      <circle cx={hw} cy={h} r="4" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" opacity="0.4" />
      <circle cx={0} cy={h / 2} r="4" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" opacity="0.4" />
      <circle cx={w} cy={h / 2} r="4" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" opacity="0.4" />
    </Frame>
  );
}

export function ArcherFrame({ color = "#5aaa40", w = 200, h = 290 }) {
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="2.5" />
      {/* Bow along left side */}
      <path d={`M-2 ${h * 0.15} Q-16 ${h * 0.5} -2 ${h * 0.85}`} stroke={color} strokeWidth="3" opacity="0.6" fill="none" strokeLinecap="round" />
      {/* Bowstring */}
      <line x1="-2" y1={h * 0.15} x2="-2" y2={h * 0.85} stroke={color} strokeWidth="1.5" opacity="0.4" />
      {/* Arrow across top - nocked */}
      <line x1={w * 0.15} y1="-3" x2={w * 0.85} y2="-3" stroke={color} strokeWidth="2.5" opacity="0.65" strokeLinecap="round" />
      {/* Arrowhead */}
      <path d={`M${w * 0.85} -3 L${w * 0.85 + 10} -3`} stroke={color} strokeWidth="2.5" opacity="0.65" strokeLinecap="round" />
      <path d={`M${w * 0.85 + 6} -8 L${w * 0.85 + 12} -3 L${w * 0.85 + 6} 2`} fill={color} opacity="0.5" />
      {/* Fletching */}
      <line x1={w * 0.17} y1="-3" x2={w * 0.13} y2="-9" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <line x1={w * 0.17} y1="-3" x2={w * 0.13} y2="3" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <line x1={w * 0.21} y1="-3" x2={w * 0.18} y2="-8" stroke={color} strokeWidth="1.2" opacity="0.35" />
      <line x1={w * 0.21} y1="-3" x2={w * 0.18} y2="2" stroke={color} strokeWidth="1.2" opacity="0.35" />
      {/* Small arrows on right edge */}
      <line x1={w - 2} y1={h * 0.3} x2={w - 2} y2={h * 0.3 + 20} stroke={color} strokeWidth="1.5" opacity="0.3" />
      <path d={`M${w - 5} ${h * 0.3 + 3} L${w - 2} ${h * 0.3} L${w + 1} ${h * 0.3 + 3}`} stroke={color} strokeWidth="1.2" opacity="0.4" fill="none" />
      <line x1={w - 2} y1={h * 0.6} x2={w - 2} y2={h * 0.6 + 20} stroke={color} strokeWidth="1.5" opacity="0.3" />
      <path d={`M${w - 5} ${h * 0.6 + 3} L${w - 2} ${h * 0.6} L${w + 1} ${h * 0.6 + 3}`} stroke={color} strokeWidth="1.2" opacity="0.4" fill="none" />
    </Frame>
  );
}

export function RogueFrame({ color = "#8068a0", w = 200, h = 290 }) {
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="2" />
      {/* LEFT DAGGER - prominent, clear blade shape */}
      <path d={`M26 8 L29 -6 L30 -18 L28 -18 L26 8`} fill={color} opacity="0.5" /> {/* blade */}
      <line x1="28" y1="8" x2="29" y2="-18" stroke={color} strokeWidth="1" opacity="0.8" /> {/* center line */}
      <path d={`M29 -18 L28 -22 L30 -22 Z`} fill={color} opacity="0.7" /> {/* tip */}
      <line x1="20" y1="5" x2="36" y2="5" stroke={color} strokeWidth="3" opacity="0.7" strokeLinecap="round" /> {/* crossguard */}
      <rect x="26" y="6" width="5" height="8" rx="1" fill={color} opacity="0.3" /> {/* grip */}
      {/* RIGHT DAGGER */}
      <path d={`M${w - 26} 8 L${w - 29} -6 L${w - 30} -18 L${w - 28} -18 L${w - 26} 8`} fill={color} opacity="0.5" />
      <line x1={w - 28} y1="8" x2={w - 29} y2="-18" stroke={color} strokeWidth="1" opacity="0.8" />
      <path d={`M${w - 29} -18 L${w - 28} -22 L${w - 30} -22 Z`} fill={color} opacity="0.7" />
      <line x1={w - 20} y1="5" x2={w - 36} y2="5" stroke={color} strokeWidth="3" opacity="0.7" strokeLinecap="round" />
      <rect x={w - 31} y="6" width="5" height="8" rx="1" fill={color} opacity="0.3" />
      {/* Shadow wisps */}
      <path d={`M0 ${h * 0.3} Q-10 ${h * 0.4} -3 ${h * 0.48} Q6 ${h * 0.56} 0 ${h * 0.65}`} stroke={color} strokeWidth="2" opacity="0.3" />
      <path d={`M${w} ${h * 0.4} Q${w + 8} ${h * 0.5} ${w + 2} ${h * 0.58} Q${w - 5} ${h * 0.66} ${w} ${h * 0.75}`} stroke={color} strokeWidth="2" opacity="0.25" />
    </Frame>
  );
}

export function CorruptorFrame({ color = "#8a40c0", w = 200, h = 290 }) {
  const gc = "#50b050";
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="2.5" />
      {/* Tentacle from top-left wrapping around */}
      <path d={`M-6 ${h * 0.05} Q-14 ${h * 0.12} -8 ${h * 0.2} Q4 ${h * 0.28} -4 ${h * 0.36} Q-12 ${h * 0.44} -2 ${h * 0.5}`} stroke={color} strokeWidth="4" opacity="0.55" strokeLinecap="round" />
      <path d={`M-2 ${h * 0.5} Q8 ${h * 0.54} 12 ${h * 0.5}`} stroke={color} strokeWidth="3" opacity="0.4" strokeLinecap="round" /> {/* tendril onto card */}
      {/* Tentacle from right wrapping */}
      <path d={`M${w + 6} ${h * 0.3} Q${w + 12} ${h * 0.38} ${w + 4} ${h * 0.46} Q${w - 6} ${h * 0.54} ${w + 2} ${h * 0.62} Q${w + 10} ${h * 0.7} ${w + 2} ${h * 0.78}`} stroke={color} strokeWidth="4" opacity="0.5" strokeLinecap="round" />
      <path d={`M${w + 2} ${h * 0.62} Q${w - 8} ${h * 0.64} ${w - 14} ${h * 0.6}`} stroke={color} strokeWidth="3" opacity="0.35" strokeLinecap="round" />
      {/* Tentacle from bottom */}
      <path d={`M${w * 0.3} ${h + 6} Q${w * 0.28} ${h + 14} ${w * 0.35} ${h + 16} Q${w * 0.42} ${h + 12} ${w * 0.38} ${h + 18}`} stroke={gc} strokeWidth="3" opacity="0.4" strokeLinecap="round" />
      <path d={`M${w * 0.6} ${h + 4} Q${w * 0.65} ${h + 12} ${w * 0.58} ${h + 16}`} stroke={gc} strokeWidth="3" opacity="0.35" strokeLinecap="round" />
      <path d={`M${w * 0.8} ${h + 2} Q${w * 0.84} ${h + 10} ${w * 0.78} ${h + 14}`} stroke={gc} strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
      {/* Suction cups / nodes on tentacles */}
      <circle cx="-6" cy={h * 0.28} r="3" fill={color} opacity="0.25" />
      <circle cx="-10" cy={h * 0.13} r="2.5" fill={color} opacity="0.2" />
      <circle cx={w + 8} cy={h * 0.46} r="3" fill={color} opacity="0.2" />
      <circle cx={w + 6} cy={h * 0.7} r="2.5" fill={color} opacity="0.2" />
      {/* Green corruption veins on edges */}
      <path d={`M0 ${h * 0.7} Q6 ${h * 0.74} 3 ${h * 0.8} Q-2 ${h * 0.86} 2 ${h * 0.92}`} stroke={gc} strokeWidth="2" opacity="0.35" />
    </Frame>
  );
}

export function WizardFrame({ color = "#4060d4", w = 200, h = 290 }) {
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="2" />
      {/* Large glyphs along top */}
      {[0.15, 0.3, 0.45, 0.6, 0.75, 0.85].map((p, i) => {
        const x = w * p;
        return i % 3 === 0 ? (
          <g key={i}>
            <line x1={x} y1="3" x2={x} y2="12" stroke={color} strokeWidth="2" opacity="0.5" />
            <line x1={x - 4} y1="7" x2={x + 4} y2="7" stroke={color} strokeWidth="1.8" opacity="0.45" />
          </g>
        ) : i % 3 === 1 ? (
          <circle key={i} cx={x} cy="7" r="4" stroke={color} strokeWidth="1.5" fill="none" opacity="0.45" />
        ) : (
          <g key={i}>
            <path d={`M${x - 3} 4 L${x} 12 L${x + 3} 4`} stroke={color} strokeWidth="1.5" fill="none" opacity="0.45" />
          </g>
        );
      })}
      {/* Glyphs along bottom */}
      {[0.2, 0.38, 0.56, 0.74, 0.9].map((p, i) => {
        const x = w * p;
        return i % 2 === 0 ? (
          <g key={`b${i}`}>
            <line x1={x - 5} y1={h - 7} x2={x + 5} y2={h - 7} stroke={color} strokeWidth="2" opacity="0.45" />
            <line x1={x} y1={h - 3} x2={x} y2={h - 12} stroke={color} strokeWidth="2" opacity="0.45" />
          </g>
        ) : (
          <circle key={`b${i}`} cx={x} cy={h - 7} r="3.5" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
        );
      })}
      {/* Glyphs along sides */}
      {[0.2, 0.4, 0.6, 0.8].map((p, i) => (
        <g key={`l${i}`}>
          <line x1="3" y1={h * p} x2="10" y2={h * p} stroke={color} strokeWidth="1.5" opacity="0.35" />
          <line x1="6" y1={h * p - 4} x2="6" y2={h * p + 4} stroke={color} strokeWidth="1.5" opacity="0.35" />
          <line x1={w - 3} y1={h * p + 14} x2={w - 10} y2={h * p + 14} stroke={color} strokeWidth="1.5" opacity="0.35" />
          <line x1={w - 6} y1={h * p + 10} x2={w - 6} y2={h * p + 18} stroke={color} strokeWidth="1.5" opacity="0.35" />
        </g>
      ))}
      {/* Arcane arcs at corners */}
      <path d="M4 24 A20 20 0 0 1 24 4" stroke={color} strokeWidth="2" opacity="0.5" strokeDasharray="4 3" />
      <path d={`M${w - 4} 24 A20 20 0 0 0 ${w - 24} 4`} stroke={color} strokeWidth="2" opacity="0.5" strokeDasharray="4 3" />
      <path d={`M4 ${h - 24} A20 20 0 0 0 24 ${h - 4}`} stroke={color} strokeWidth="2" opacity="0.5" strokeDasharray="4 3" />
      <path d={`M${w - 4} ${h - 24} A20 20 0 0 1 ${w - 24} ${h - 4}`} stroke={color} strokeWidth="2" opacity="0.5" strokeDasharray="4 3" />
      <circle cx="14" cy="14" r="2" fill={color} opacity="0.6" />
      <circle cx={w - 14} cy="14" r="2" fill={color} opacity="0.6" />
      <circle cx="14" cy={h - 14} r="2" fill={color} opacity="0.6" />
      <circle cx={w - 14} cy={h - 14} r="2" fill={color} opacity="0.6" />
    </Frame>
  );
}

export function WraithHunterFrame({ color = "#90a8b8", w = 200, h = 290 }) {
  const hw = w / 2;
  return (
    <Frame w={w} h={h}>
      <path d={rrect(w, h)} stroke={color} strokeWidth="2.5" />
      {/* Silver medallion hanging from top center */}
      <circle cx={hw} cy="-10" r="8" stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.12" opacity="0.75" />
      <circle cx={hw} cy="-10" r="4" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
      <circle cx={hw} cy="-10" r="1.5" fill={color} opacity="0.6" />
      {/* Chain connecting medallion to card */}
      <line x1={hw} y1="-2" x2={hw} y2="0" stroke={color} strokeWidth="2" opacity="0.6" />
      {/* Runic chains left side */}
      {[0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84].map((p, i) => (
        <g key={`l${i}`}>
          <ellipse cx="1" cy={h * p} rx="5" ry="7" stroke={color} strokeWidth="1.8" fill="none" opacity={0.35 + (i % 2) * 0.1} />
          {i % 3 === 0 && <line x1="5" y1={h * p} x2="9" y2={h * p} stroke={color} strokeWidth="1.5" opacity="0.3" />}
        </g>
      ))}
      {/* Runic chains right side */}
      {[0.18, 0.3, 0.42, 0.54, 0.66, 0.78, 0.9].map((p, i) => (
        <g key={`r${i}`}>
          <ellipse cx={w - 1} cy={h * p} rx="5" ry="7" stroke={color} strokeWidth="1.8" fill="none" opacity={0.35 + (i % 2) * 0.1} />
          {i % 3 === 0 && <line x1={w - 5} y1={h * p} x2={w - 9} y2={h * p} stroke={color} strokeWidth="1.5" opacity="0.3" />}
        </g>
      ))}
      {/* Silver inner trim */}
      <path d={rrect(w - 10, h - 10, 9)} stroke={color} strokeWidth="0.7" opacity="0.2" transform="translate(5,5)" />
    </Frame>
  );
}

export function BattlemageFrame({ color = "#a040c0", w = 200, h = 290 }) {
  const m = "#d04040";
  const a = "#4060d0";
  const hw = w / 2;
  return (
    <Frame w={w} h={h}>
      {/* Split border */}
      <path d={`M14 0 H${hw}`} stroke={m} strokeWidth="3" opacity="0.85" />
      <path d={`M${hw} 0 H${w - 14} Q${w} 0 ${w} 14`} stroke={a} strokeWidth="3" opacity="0.85" />
      <path d={`M0 14 Q0 0 14 0`} stroke={m} strokeWidth="3" opacity="0.85" />
      <path d={`M0 14 V${h - 14} Q0 ${h} 14 ${h}`} stroke={m} strokeWidth="3" opacity="0.85" />
      <path d={`M${w} 14 V${h - 14} Q${w} ${h} ${w - 14} ${h}`} stroke={a} strokeWidth="3" opacity="0.85" />
      <path d={`M14 ${h} H${hw}`} stroke={m} strokeWidth="3" opacity="0.85" />
      <path d={`M${hw} ${h} H${w - 14}`} stroke={a} strokeWidth="3" opacity="0.85" />
      {/* Shield on left side */}
      <path d={`M-4 ${h * 0.3} L-12 ${h * 0.32} L-14 ${h * 0.5} L-8 ${h * 0.65} L-2 ${h * 0.6} L-4 ${h * 0.3} Z`} stroke={m} strokeWidth="2.5" fill={m} fillOpacity="0.15" opacity="0.65" strokeLinejoin="round" />
      <line x1="-9" y1={h * 0.38} x2="-6" y2={h * 0.55} stroke={m} strokeWidth="1.5" opacity="0.4" />
      <line x1="-11" y1={h * 0.45} x2="-5" y2={h * 0.5} stroke={m} strokeWidth="1.5" opacity="0.35" />
      {/* Magic staff on right side */}
      <line x1={w + 4} y1={h * 0.2} x2={w + 4} y2={h * 0.72} stroke={a} strokeWidth="3" opacity="0.6" strokeLinecap="round" />
      {/* Staff orb */}
      <circle cx={w + 4} cy={h * 0.2} r="6" stroke={a} strokeWidth="2" fill={a} fillOpacity="0.15" opacity="0.6" />
      <circle cx={w + 4} cy={h * 0.2} r="2.5" fill={a} opacity="0.5" />
      {/* Staff base */}
      <circle cx={w + 4} cy={h * 0.72} r="2" fill={a} opacity="0.4" />
      {/* Convergence at top */}
      <line x1={hw - 14} y1="3" x2={hw} y2="3" stroke={m} strokeWidth="2.5" opacity="0.5" />
      <line x1={hw} y1="3" x2={hw + 14} y2="3" stroke={a} strokeWidth="2.5" opacity="0.5" />
      <circle cx={hw} cy="3" r="3.5" fill={color} opacity="0.55" />
    </Frame>
  );
}

// ═══════════════════════════════════
//  RESOLVER
// ═══════════════════════════════════

const BASE_FRAMES = { STEEL_CRITICAL: SteelCriticalFrame, ENERGY_CRITICAL: EnergyCriticalFrame, NEUTRAL: NeutralFrame, ENCOUNTER: EncounterFrame, STAT: StatFrame };
const CLASS_FRAMES = { musician: MusicianFrame, disciple: DiscipleFrame, wildborn: WildbornFrame, warrior: WarriorFrame, monk: MonkFrame, archer: ArcherFrame, rogue: RogueFrame, corruptor: CorruptorFrame, wizard: WizardFrame, wraith_hunter: WraithHunterFrame, battlemage: BattlemageFrame };

export function getFrameComponent(cardType, classThemeId) {
  if (cardType === "CLASS" && classThemeId) return CLASS_FRAMES[classThemeId] || null;
  return BASE_FRAMES[cardType] || NeutralFrame;
}
