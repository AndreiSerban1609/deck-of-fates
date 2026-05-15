import React from "react";
import { CARD_TYPES } from "../lib/constants.js";
import { CLASS_THEMES } from "../lib/classThemes.js";
import { getModifierDisplay } from "../lib/deck.js";
import { getFrameComponent } from "./CardFrames.jsx";

// ── Skill check icons (14x14 SVG silhouettes) ──
export function SkillIcon({ skill, color, size = 14 }) {
  const p = { fill: color, fillRule: "evenodd" };
  const s = { fill: "none", stroke: color, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    // Dumbbell (horizontal)
    Lifting: <g><rect x="3" y="5.5" width="8" height="3" rx="1" {...p}/><rect x="0.5" y="3.5" width="3" height="7" rx="0.8" {...p}/><rect x="10.5" y="3.5" width="3" height="7" rx="0.8" {...p}/></g>,
    // Running figure — torso and limbs as one clean shape
    Athletics: <g><circle cx="9" cy="2" r="1.8" {...p}/><path d="M4 13 L6.5 8 L5 6.5 L7 4.5 L9.5 7 L12 5.5" {...s} strokeWidth="1.6"/><path d="M7 4.5 L7 8 L9 13" {...s} strokeWidth="1.6"/></g>,
    // Lockpick and keyhole
    Thievery: <g><rect x="3" y="5" width="8" height="7" rx="1.5" {...s} strokeWidth="1.4"/><path d="M7 2 Q7 0.5 8.5 0.5 Q10 0.5 10 2 L10 5" {...s} strokeWidth="1.4"/><circle cx="7" cy="8.5" r="1.2" {...p}/><rect x="6.5" y="9.5" width="1" height="1.5" {...p}/></g>,
    // Lightning bolt
    Reflex: <g><path d="M8.5 0.5 L5 6.5 L7.5 6.5 L5.5 13.5 L10 6 L7.5 6 L9.5 0.5 Z" {...p}/></g>,
    // Eye with slash through it
    Stealth: <g><path d="M1 7 Q4 2.5 7 2.5 Q10 2.5 13 7 Q10 11.5 7 11.5 Q4 11.5 1 7 Z" {...s} strokeWidth="1.3"/><circle cx="7" cy="7" r="2.2" {...p}/><line x1="2" y1="12" x2="12" y2="2" stroke={color} strokeWidth="1.6" strokeLinecap="round"/></g>,
    // Open book
    Knowledge: <g><path d="M7 3 L7 12" {...s} strokeWidth="1"/><path d="M7 3 Q4 2 1.5 3 L1.5 12 Q4 11 7 12" {...s} strokeWidth="1.3"/><path d="M7 3 Q10 2 12.5 3 L12.5 12 Q10 11 7 12" {...s} strokeWidth="1.3"/></g>,
    // Arcane rune circle
    Arcana: <g><circle cx="7" cy="7" r="5.5" {...s} strokeWidth="1.3"/><circle cx="7" cy="7" r="2.5" {...s} strokeWidth="1.1"/><line x1="7" y1="1.5" x2="7" y2="4.5" {...s} strokeWidth="1.1"/><line x1="7" y1="9.5" x2="7" y2="12.5" {...s} strokeWidth="1.1"/><line x1="1.5" y1="7" x2="4.5" y2="7" {...s} strokeWidth="1.1"/><line x1="9.5" y1="7" x2="12.5" y2="7" {...s} strokeWidth="1.1"/></g>,
    // Magnifying glass
    Investigation: <g><circle cx="6" cy="6" r="4" {...s} strokeWidth="1.6"/><line x1="9" y1="9.5" x2="13" y2="13" {...s} strokeWidth="2.2"/></g>,
    // Medical cross
    Medicine: <g><rect x="5" y="1.5" width="4" height="11" rx="0.8" {...p}/><rect x="1.5" y="5" width="11" height="4" rx="0.8" {...p}/></g>,
    // Open eye
    Perception: <g><path d="M1 7 Q4 2.5 7 2.5 Q10 2.5 13 7 Q10 11.5 7 11.5 Q4 11.5 1 7 Z" {...s} strokeWidth="1.3"/><circle cx="7" cy="7" r="2.2" {...p}/></g>,
    // Campfire
    Survival: <g><path d="M7 1 Q9 4 8 6 Q9 5 9.5 3 Q11 6 9 9 L5 9 Q3 6 4.5 3 Q5 5 6 6 Q5 4 7 1 Z" {...p}/><line x1="3" y1="12" x2="5" y2="9" {...s} strokeWidth="1.4"/><line x1="11" y1="12" x2="9" y2="9" {...s} strokeWidth="1.4"/><line x1="7" y1="9" x2="7" y2="12.5" {...s} strokeWidth="1.4"/></g>,
    // Paw print
    "Animal Handling": <g><ellipse cx="7" cy="9" rx="3" ry="2.5" {...p}/><circle cx="4" cy="5.5" r="1.3" {...p}/><circle cx="10" cy="5.5" r="1.3" {...p}/><circle cx="5.5" cy="3.5" r="1.2" {...p}/><circle cx="8.5" cy="3.5" r="1.2" {...p}/></g>,
    // Third eye / inner eye
    Insight: <g><path d="M1 7 Q4 3 7 3 Q10 3 13 7 Q10 11 7 11 Q4 11 1 7 Z" {...s} strokeWidth="1.2"/><circle cx="7" cy="7" r="2" {...s} strokeWidth="1.2"/><circle cx="7" cy="7" r="0.8" {...p}/><line x1="7" y1="0.5" x2="7" y2="3" {...s} strokeWidth="1.2"/></g>,
    // Ankh / holy symbol
    Religion: <g><circle cx="7" cy="3.5" r="2.5" {...s} strokeWidth="1.5"/><line x1="7" y1="6" x2="7" y2="13" {...s} strokeWidth="1.8"/><line x1="4" y1="8.5" x2="10" y2="8.5" {...s} strokeWidth="1.8"/></g>,
    // Heart
    Seduction: <g><path d="M7 12 Q1 7 1 4.5 Q1 2 3.5 2 Q5.5 2 7 4.5 Q8.5 2 10.5 2 Q13 2 13 4.5 Q13 7 7 12 Z" {...p}/></g>,
    // Music note
    Performance: <g><circle cx="4.5" cy="10.5" r="2.2" {...p}/><line x1="6.7" y1="10.5" x2="6.7" y2="1.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><path d="M6.7 1.5 L12 0.5 L12 4.5 L6.7 5.5" {...p}/></g>,
    // Two speech bubbles overlapping (dialogue)
    Persuasion: <g><rect x="1" y="1" width="8" height="6" rx="1.5" {...s} strokeWidth="1.3"/><rect x="5" y="5" width="8" height="6" rx="1.5" {...s} strokeWidth="1.3"/><path d="M3 7 L2 9.5" {...s} strokeWidth="1.3"/><path d="M11 11 L12 13" {...s} strokeWidth="1.3"/></g>,
    // Theatre mask (half smile half frown)
    Deception: <g><circle cx="7" cy="6" r="5.5" {...s} strokeWidth="1.3"/><circle cx="5" cy="5" r="1" {...p}/><circle cx="9" cy="5" r="1" {...p}/><path d="M4.5 8 Q5.5 9.5 7 8 Q8.5 6.5 9.5 8" {...s} strokeWidth="1.2"/></g>,
    // Skull
    Intimidation: <g><path d="M3 7 Q3 1.5 7 1.5 Q11 1.5 11 7 L11 9 Q11 10 10 10 L4 10 Q3 10 3 9 Z" {...p}/><circle cx="5.5" cy="6" r="1.3" fill="#0e0e14"/><circle cx="8.5" cy="6" r="1.3" fill="#0e0e14"/><rect x="6" y="8.5" width="0.7" height="1.5" fill="#0e0e14"/><rect x="7.3" y="8.5" width="0.7" height="1.5" fill="#0e0e14"/><rect x="5.5" y="10" width="3" height="3" rx="0.3" {...p}/><line x1="6.5" y1="10" x2="6.5" y2="13" stroke="#0e0e14" strokeWidth="0.6"/><line x1="7.5" y1="10" x2="7.5" y2="13" stroke="#0e0e14" strokeWidth="0.6"/></g>,
  };
  const icon = icons[skill];
  if (!icon) return null;
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none">{icon}</svg>;
}

// ── Base card themes (non-class) ──
const CARD_THEMES = {
  [CARD_TYPES.STEEL_CRITICAL]: {
    bg: "linear-gradient(135deg, #2a2d3e 0%, #4a4d5e 40%, #6b7094 60%, #3a3d4e 100%)",
    border: "#8b9dc3",
    glow: "rgba(139, 157, 195, 0.6)",
    accent: "#c0cde8",
    symbol: "⚔",
    labelBg: "#4a5068",
  },
  [CARD_TYPES.MIGHT_CRITICAL]: {
    bg: "linear-gradient(135deg, #2e0a0a 0%, #6b1515 40%, #8b2020 60%, #2e0a0a 100%)",
    border: "#e04030",
    glow: "rgba(224, 64, 48, 0.6)",
    accent: "#f08060",
    symbol: "✦",
    labelBg: "#6b1515",
  },
  [CARD_TYPES.NEUTRAL]: {
    bg: "linear-gradient(135deg, #2a2a28 0%, #3d3b35 50%, #2a2a28 100%)",
    border: "#7a7568",
    glow: "rgba(122, 117, 104, 0.3)",
    accent: "#a8a090",
    symbol: "◆",
    labelBg: "#3d3a34",
  },
  [CARD_TYPES.ENCOUNTER]: {
    bg: "linear-gradient(135deg, #2e1a0a 0%, #5c2a0e 40%, #8b3a12 60%, #2e1a0a 100%)",
    border: "#d4622a",
    glow: "rgba(212, 98, 42, 0.5)",
    accent: "#f0a060",
    symbol: "☠",
    labelBg: "#5c2a0e",
  },
  [CARD_TYPES.STAT]: {
    bg: "linear-gradient(135deg, #0a1a2e 0%, #0e3a5c 40%, #126a8b 60%, #0a1a2e 100%)",
    border: "#2a9cd4",
    glow: "rgba(42, 156, 212, 0.5)",
    accent: "#60c0f0",
    symbol: "◈",
    labelBg: "#0e3a5c",
  },
  // Fallback for CLASS when no classTheme is set
  [CARD_TYPES.CLASS]: {
    bg: "linear-gradient(135deg, #2e2a0a 0%, #5c4a0e 40%, #8b7a12 60%, #2e2a0a 100%)",
    border: "#d4b22a",
    glow: "rgba(212, 178, 42, 0.5)",
    accent: "#f0d860",
    symbol: "★",
    labelBg: "#5c4a0e",
  },
};

/**
 * Resolve the visual theme for a card.
 * CLASS cards with a classTheme get class-specific colors.
 */
function resolveTheme(card) {
  if (card.type === CARD_TYPES.CLASS && card.classTheme && CLASS_THEMES[card.classTheme]) {
    const ct = CLASS_THEMES[card.classTheme];
    return {
      bg: ct.bg,
      border: ct.border,
      glow: ct.glow,
      accent: ct.accent,
      symbol: "★",
      labelBg: ct.labelBg,
    };
  }
  return CARD_THEMES[card.type] || CARD_THEMES[CARD_TYPES.NEUTRAL];
}

/**
 * Resolve the label text for the top badge.
 */
function resolveLabel(card) {
  if (card.type === CARD_TYPES.CLASS && card.classTheme && CLASS_THEMES[card.classTheme]) {
    return CLASS_THEMES[card.classTheme].label;
  }
  const labels = {
    [CARD_TYPES.STEEL_CRITICAL]: "Steel",
    [CARD_TYPES.MIGHT_CRITICAL]: "Might",
    [CARD_TYPES.NEUTRAL]: "Neutral",
    [CARD_TYPES.ENCOUNTER]: "Encounter",
    [CARD_TYPES.STAT]: "Stat",
    [CARD_TYPES.CLASS]: "Class",
  };
  return labels[card.type] || "Unknown";
}

// ── Card Back ──

export function CardBack({ size = 160 }) {
  const w = size;
  const h = size * 1.45;
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 12,
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)",
        border: "2px solid #e0a040",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 24px rgba(224, 160, 64, 0.2)",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 8, left: 8, color: "#e0a040", fontSize: 14, opacity: 0.5, fontFamily: "serif" }}>✧</div>
      <div style={{ position: "absolute", top: 8, right: 8, color: "#e0a040", fontSize: 14, opacity: 0.5, fontFamily: "serif" }}>✧</div>
      <div style={{ position: "absolute", bottom: 8, left: 8, color: "#e0a040", fontSize: 14, opacity: 0.5, fontFamily: "serif" }}>✧</div>
      <div style={{ position: "absolute", bottom: 8, right: 8, color: "#e0a040", fontSize: 14, opacity: 0.5, fontFamily: "serif" }}>✧</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ color: "#e0a040", fontSize: 28, lineHeight: 1 }}>◆</div>
        <div style={{ color: "#e0a040", fontSize: 11, fontFamily: "'Cinzel', 'Palatino', serif", letterSpacing: 3, textTransform: "uppercase", opacity: 0.7 }}>Fate</div>
        <div style={{ color: "#e0a040", fontSize: 28, lineHeight: 1, transform: "rotate(180deg)" }}>◆</div>
      </div>
    </div>
  );
}

// ── Card Face ──

export function CardFace({ card, size = 200, animating = false }) {
  if (!card) return null;

  const theme = resolveTheme(card);
  const label = resolveLabel(card);
  const modDisplay = getModifierDisplay(card);
  const w = size;
  const h = size * 1.45;
  const isCrit = card.type === CARD_TYPES.STEEL_CRITICAL || card.type === CARD_TYPES.MIGHT_CRITICAL;
  const isSteel = card.type === CARD_TYPES.STEEL_CRITICAL;

  // Border frame
  const FrameComponent = getFrameComponent(card.type, card.classTheme);

  // Unique animation name per crit type
  const glowName = isSteel ? "pulseGlowSteel" : "pulseGlowMight";

  return (
    <>
      {isCrit && (
        <style>{`
          @keyframes ${glowName} {
            0%, 100% {
              box-shadow: 0 4px 32px ${theme.glow}, 0 0 48px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.08);
            }
            50% {
              box-shadow: 0 4px 48px ${theme.glow}, 0 0 72px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.12);
            }
          }
          @keyframes shimmerSweep {
            0% { transform: translateX(-150%); }
            100% { transform: translateX(150%); }
          }
        `}</style>
      )}

      <div
        className={animating ? "card-flip-in" : ""}
        style={{
          width: w,
          height: h,
          borderRadius: 14,
          background: theme.bg,
          border: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: `0 4px 32px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
          position: "relative",
          overflow: "visible",
          padding: "16px 12px",
          animation: isCrit ? `${glowName} 2s ease-in-out infinite` : "none",
        }}
      >
        {/* ── SVG Border Frame ── */}
        {FrameComponent && <FrameComponent color={theme.border} w={w} h={h} />}

        {/* ── Shimmer overlay (crits only, loops) ── */}
        {isCrit && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              pointerEvents: "none",
              borderRadius: 12,
              zIndex: 2,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "60%",
                height: "100%",
                background: isSteel
                  ? "linear-gradient(90deg, transparent 0%, rgba(192,205,232,0.25) 40%, rgba(255,255,255,0.35) 50%, rgba(192,205,232,0.25) 60%, transparent 100%)"
                  : "linear-gradient(90deg, transparent 0%, rgba(240,128,96,0.2) 40%, rgba(255,255,255,0.3) 50%, rgba(240,128,96,0.2) 60%, transparent 100%)",
                animation: "shimmerSweep 2.5s ease-in-out infinite",
              }}
            />
          </div>
        )}

        {/* ── Atmospheric overlay ── */}
        {isCrit && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: isSteel
              ? "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(139,157,195,0.04) 8px, rgba(139,157,195,0.04) 16px)"
              : "radial-gradient(ellipse at center, rgba(224,64,48,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
        )}

        {/* ── Top label ── */}
        <div style={{
          background: theme.labelBg,
          borderRadius: 6,
          padding: "3px 10px",
          fontSize: 10,
          color: theme.accent,
          fontFamily: "'Cinzel', 'Palatino', serif",
          letterSpacing: 2,
          textTransform: "uppercase",
          border: `1px solid ${theme.border}44`,
          zIndex: 5,
        }}>
          {label}
        </div>

        {/* ── Center symbol + modifier ── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          zIndex: 5,
        }}>
          <div style={{
            fontSize: isCrit ? 48 : 36,
            color: theme.accent,
            textShadow: `0 0 20px ${theme.glow}`,
            lineHeight: 1,
          }}>
            {theme.symbol}
          </div>
          <div style={{
            fontSize: isCrit ? 22 : 28,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "'Cinzel', 'Palatino', serif",
            textShadow: `0 0 12px ${theme.glow}`,
            letterSpacing: isCrit ? 3 : 1,
          }}>
            {modDisplay}
          </div>
        </div>

        {/* ── Icon slots (CLASS cards only) — above name ── */}
        {card.type === CARD_TYPES.CLASS && (card.checkType || card.redrawModifier != null) && (
          <div style={{
            display: "flex",
            justifyContent: card.checkType && card.redrawModifier != null ? "space-between" : card.checkType ? "flex-start" : "flex-end",
            alignItems: "center",
            width: "100%",
            padding: "0 4px",
            zIndex: 6,
          }}>
            {card.checkType ? (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: `${theme.border}18`,
                border: `1px solid ${theme.border}30`,
                borderRadius: 4,
                padding: "3px 6px",
              }} title={card.checkType}>
                <SkillIcon skill={card.checkType} color={theme.accent} size={12} />
                <span style={{
                  fontSize: 7,
                  color: theme.accent,
                  opacity: 0.6,
                  fontFamily: "'Cinzel', 'Palatino', serif",
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}>
                  {card.checkType}
                </span>
              </div>
            ) : <div />}
            {card.redrawModifier != null && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                background: `${theme.border}18`,
                border: `1px solid ${theme.border}30`,
                borderRadius: 4,
                padding: "3px 6px",
                cursor: card.redrawDescription ? "help" : "default",
              }} title={card.redrawDescription || `Redraw: ${card.redrawModifier >= 0 ? "+" : ""}${card.redrawModifier}`}>
                <span style={{
                  fontSize: 10,
                  color: theme.accent,
                  opacity: 0.6,
                  fontFamily: "'Cinzel', 'Palatino', serif",
                }}>
                  ↻{card.redrawModifier >= 0 ? "+" : ""}{card.redrawModifier}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Bottom: name + description ── */}
        <div style={{ textAlign: "center", zIndex: 5, maxWidth: "100%" }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: theme.accent,
            fontFamily: "'Cinzel', 'Palatino', serif",
            marginBottom: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {card.name}
          </div>
          {!isCrit && card.description && (
            <div style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              fontStyle: "italic",
              lineHeight: 1.3,
              maxHeight: 30,
              overflow: "hidden",
            }}>
              {card.description}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
