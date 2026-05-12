import React from "react";

/**
 * Each corner component renders a small SVG icon.
 * Props: color (accent color), size (default 22)
 */

// ── Base Card Corners ──

export function SteelCorner({ color = "#c0cde8", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield / diamond shape */}
      <path d="M12 2 L20 8 L12 22 L4 8 Z" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M12 6 L16 9.5 L12 17 L8 9.5 Z" fill={color} opacity="0.25" />
    </svg>
  );
}

export function MightCorner({ color = "#f08060", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1 L14 9 L22 12 L14 15 L12 23 L10 15 L2 12 L10 9 Z" fill={color} opacity="0.3" />
      <path d="M12 5 L13 10 L18 12 L13 14 L12 19 L11 14 L6 12 L11 10 Z" fill={color} opacity="0.5" />
      <circle cx="12" cy="12" r="2" fill={color} opacity="0.7" />
    </svg>
  );
}

export function NeutralCorner({ color = "#a8a090", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Simple geometric dot */}
      <rect x="8" y="8" width="8" height="8" rx="1" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
      <rect x="10.5" y="10.5" width="3" height="3" fill={color} opacity="0.4" />
    </svg>
  );
}

export function EncounterCorner({ color = "#f0a060", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Flame shape */}
      <path d="M12 2 C12 2 16 8 16 13 C16 16 14.5 18 12 20 C9.5 18 8 16 8 13 C8 8 12 2 12 2Z" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M12 8 C12 8 14 11 14 13.5 C14 15 13.2 16 12 17 C10.8 16 10 15 10 13.5 C10 11 12 8 12 8Z" fill={color} opacity="0.3" />
    </svg>
  );
}

export function StatCorner({ color = "#60c0f0", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ability orb with ring */}
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
      <circle cx="12" cy="12" r="4" fill={color} opacity="0.3" />
      <circle cx="12" cy="12" r="2" fill={color} opacity="0.6" />
    </svg>
  );
}

// ── Class Corners ──

export function MusicianCorner({ color = "#f0a0be", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Lyre / musical note */}
      <path d="M9 4 C5 6 5 12 9 14" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M15 4 C19 6 19 12 15 14" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
      <line x1="9" y1="14" x2="15" y2="14" stroke={color} strokeWidth="1.5" opacity="0.6" />
      <line x1="12" y1="4" x2="12" y2="14" stroke={color} strokeWidth="1" opacity="0.4" />
      <circle cx="12" cy="18" r="2.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.3" />
      <line x1="14.5" y1="18" x2="14.5" y2="6" stroke={color} strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

export function DiscipleCorner({ color = "#f5e088", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Radiant sun / holy symbol */}
      <circle cx="12" cy="12" r="4" fill={color} opacity="0.35" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
      {/* Rays */}
      <line x1="12" y1="2" x2="12" y2="6" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="12" y1="18" x2="12" y2="22" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="2" y1="12" x2="6" y2="12" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="18" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="5" y1="5" x2="8" y2="8" stroke={color} strokeWidth="1" opacity="0.35" />
      <line x1="16" y1="16" x2="19" y2="19" stroke={color} strokeWidth="1" opacity="0.35" />
      <line x1="19" y1="5" x2="16" y2="8" stroke={color} strokeWidth="1" opacity="0.35" />
      <line x1="5" y1="19" x2="8" y2="16" stroke={color} strokeWidth="1" opacity="0.35" />
    </svg>
  );
}

export function WildbornCorner({ color = "#80d0a0", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Vine with lightning */}
      <path d="M4 20 C6 16 8 14 10 12 C12 10 10 8 12 4" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" />
      {/* Small leaves */}
      <path d="M7 16 C9 15 9 17 7 16" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.3" />
      <path d="M10 10 C12 9 12 11 10 10" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.3" />
      {/* Lightning bolt */}
      <path d="M16 3 L14 10 L17 10 L13 21" stroke="#60a8d0" strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WarriorCorner({ color = "#f07070", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Crossed battle axes */}
      {/* Axe 1 */}
      <line x1="5" y1="19" x2="19" y2="5" stroke={color} strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      <path d="M16 4 C19 3 21 5 20 8 L16 4Z" fill={color} opacity="0.4" />
      {/* Axe 2 */}
      <line x1="19" y1="19" x2="5" y2="5" stroke={color} strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      <path d="M4 8 C3 5 5 3 8 4 L4 8Z" fill={color} opacity="0.4" />
    </svg>
  );
}

export function MonkCorner({ color = "#80e0d0", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Lotus flower */}
      <ellipse cx="12" cy="14" rx="3" ry="6" fill={color} opacity="0.2" />
      <ellipse cx="8" cy="14" rx="2.5" ry="5" fill={color} opacity="0.15" transform="rotate(-20 8 14)" />
      <ellipse cx="16" cy="14" rx="2.5" ry="5" fill={color} opacity="0.15" transform="rotate(20 16 14)" />
      <ellipse cx="12" cy="15" rx="2" ry="4" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M6 18 Q12 14 18 18" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}

export function ArcherCorner({ color = "#90d870", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Crossed arrows */}
      <line x1="4" y1="20" x2="20" y2="4" stroke={color} strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      <path d="M17 4 L20 4 L20 7" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="20" y1="20" x2="4" y2="4" stroke={color} strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      <path d="M4 7 L4 4 L7 4" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RogueCorner({ color = "#b8a0d8", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Twin daggers */}
      {/* Dagger 1 */}
      <line x1="7" y1="20" x2="14" y2="6" stroke={color} strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      <path d="M13 8 L14 6 L15.5 7.5" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8.5" y1="15" x2="11" y2="14" stroke={color} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      {/* Dagger 2 */}
      <line x1="17" y1="20" x2="10" y2="6" stroke={color} strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      <path d="M11 8 L10 6 L8.5 7.5" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="15.5" y1="15" x2="13" y2="14" stroke={color} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
}

export function CorruptorCorner({ color = "#c080f0", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Eldritch eye */}
      <path d="M3 12 Q12 4 21 12 Q12 20 3 12Z" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
      <circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.2" />
      <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.6" />
      {/* Sickly green drips */}
      <line x1="8" y1="18" x2="8" y2="22" stroke="#60c060" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      <line x1="16" y1="18" x2="16" y2="21" stroke="#60c060" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
    </svg>
  );
}

export function WizardCorner({ color = "#80a0f0", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rune circle with star */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1" fill="none" opacity="0.35" />
      <circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1" fill="none" opacity="0.25" strokeDasharray="3 2" />
      {/* Five-pointed star */}
      <path d="M12 4 L13.8 9.5 L19.5 9.5 L14.8 13 L16.5 18.5 L12 15 L7.5 18.5 L9.2 13 L4.5 9.5 L10.2 9.5 Z" fill={color} opacity="0.3" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

export function WraithHunterCorner({ color = "#b8d0e0", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Runic ward sigil — angular protective rune */}
      <path d="M12 3 L19 8 L19 16 L12 21 L5 16 L5 8 Z" stroke={color} strokeWidth="1.5" fill="none" opacity="0.45" />
      <line x1="12" y1="3" x2="12" y2="21" stroke={color} strokeWidth="1" opacity="0.3" />
      <line x1="5" y1="8" x2="19" y2="16" stroke={color} strokeWidth="1" opacity="0.3" />
      <line x1="19" y1="8" x2="5" y2="16" stroke={color} strokeWidth="1" opacity="0.3" />
      <circle cx="12" cy="12" r="2" fill={color} opacity="0.4" />
    </svg>
  );
}

export function BattlemageCorner({ color = "#c890e0", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sword wreathed in energy */}
      <line x1="12" y1="2" x2="12" y2="19" stroke={color} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
      {/* Crossguard */}
      <line x1="7" y1="15" x2="17" y2="15" stroke={color} strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      {/* Pommel */}
      <circle cx="12" cy="21" r="1.5" fill={color} opacity="0.5" />
      {/* Energy wreath */}
      <path d="M8 6 Q6 10 8 14" stroke="#6080f0" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M16 6 Q18 10 16 14" stroke="#f06060" strokeWidth="1" fill="none" opacity="0.4" />
    </svg>
  );
}

// ── Corner Resolver ──

const BASE_CORNERS = {
  STEEL_CRITICAL: SteelCorner,
  MIGHT_CRITICAL: MightCorner,
  NEUTRAL: NeutralCorner,
  ENCOUNTER: EncounterCorner,
  STAT: StatCorner,
};

const CLASS_CORNERS = {
  musician: MusicianCorner,
  disciple: DiscipleCorner,
  wildborn: WildbornCorner,
  warrior: WarriorCorner,
  monk: MonkCorner,
  archer: ArcherCorner,
  rogue: RogueCorner,
  corruptor: CorruptorCorner,
  wizard: WizardCorner,
  wraith_hunter: WraithHunterCorner,
  battlemage: BattlemageCorner,
};

/**
 * Returns the correct corner component for a given card.
 * For CLASS cards, uses classTheme; for base cards, uses card type.
 */
export function getCornerComponent(cardType, classThemeId) {
  if (cardType === "CLASS" && classThemeId) {
    return CLASS_CORNERS[classThemeId] || null;
  }
  return BASE_CORNERS[cardType] || null;
}
