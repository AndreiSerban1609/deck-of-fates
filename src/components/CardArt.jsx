import React from "react";
import { CARD_TYPES } from "../lib/constants.js";
import { CLASS_THEMES } from "../lib/classThemes.js";
import { getModifierDisplay } from "../lib/deck.js";
import { getFrameComponent } from "./CardFrames.jsx";

// ── Skill check icons (14x14 SVG silhouettes) ──
function SkillIcon({ skill, color, size = 14 }) {
  const p = { fill: color, fillRule: "evenodd" };
  const s = { fill: "none", stroke: color, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    Lifting: <g><path d="M5 3 Q7 1 9 3" {...s} strokeWidth="1.8"/><line x1="7" y1="5" x2="7" y2="9" {...s} strokeWidth="1.5"/><line x1="5" y1="9" x2="9" y2="9" {...s} strokeWidth="1.5"/><path d="M3 5 Q3 3 5 3" {...s} strokeWidth="1.5"/><circle cx="9" cy="3" r="1" {...p}/></g>,
    Athletics: <g><circle cx="8" cy="2.5" r="1.5" {...p}/><path d="M5 5 L8 4.5 L10 6 L9 9 L10.5 12" {...s} strokeWidth="1.5"/><path d="M8 4.5 L6 7 L4 8" {...s} strokeWidth="1.5"/><path d="M7.5 7.5 L5.5 12" {...s} strokeWidth="1.5"/></g>,
    Thievery: <g><rect x="4" y="6" width="6" height="5" rx="1" {...s} strokeWidth="1.3"/><path d="M7 3 Q7 1 9 1 Q11 1 11 3 L11 6" {...s} strokeWidth="1.3"/><circle cx="7" cy="9" r="1" {...p}/></g>,
    Reflex: <g><path d="M8 1 L5 5.5 L7.5 5.5 L5 13 L10 6.5 L7.5 6.5 L10 1 Z" {...p} opacity="0.9"/></g>,
    Stealth: <g><ellipse cx="7" cy="7" rx="5.5" ry="3.5" {...s} strokeWidth="1.3"/><circle cx="7" cy="7" r="2" {...p}/><line x1="2" y1="12" x2="12" y2="2" {...s} strokeWidth="1.5"/></g>,
    Knowledge: <g><path d="M2 3 L7 1 L12 3 L12 11 L7 13 L2 11 Z" {...s} strokeWidth="1.2"/><line x1="7" y1="1" x2="7" y2="13" {...s} strokeWidth="1.2"/><line x1="4" y1="5" x2="6" y2="4.5" {...s} strokeWidth="0.8"/><line x1="4" y1="7" x2="6" y2="6.5" {...s} strokeWidth="0.8"/><line x1="8" y1="4.5" x2="10" y2="5" {...s} strokeWidth="0.8"/><line x1="8" y1="6.5" x2="10" y2="7" {...s} strokeWidth="0.8"/></g>,
    Arcana: <g><path d="M7 0.5 L8.2 4.5 L12.5 4.5 L9 7.2 L10 11.5 L7 8.8 L4 11.5 L5 7.2 L1.5 4.5 L5.8 4.5 Z" {...p} opacity="0.85"/></g>,
    Investigation: <g><circle cx="6" cy="6" r="4" {...s} strokeWidth="1.5"/><line x1="9" y1="9" x2="12.5" y2="12.5" {...s} strokeWidth="2"/></g>,
    Medicine: <g><rect x="5.5" y="2" width="3" height="10" rx="0.5" {...p}/><rect x="2" y="5.5" width="10" height="3" rx="0.5" {...p}/></g>,
    Perception: <g><ellipse cx="7" cy="7" rx="5.5" ry="3.5" {...s} strokeWidth="1.3"/><circle cx="7" cy="7" r="2" {...p}/></g>,
    Survival: <g><path d="M7 2 L4 9 L2 12 L7 10 L12 12 L10 9 Z" {...s} strokeWidth="1.2" fill={color} fillOpacity="0.15"/><path d="M5 8 Q7 4 9 8" {...s} strokeWidth="1"/><circle cx="7" cy="6" r="0.8" {...p}/></g>,
    "Animal Handling": <g><circle cx="5" cy="4.5" r="1.5" {...p}/><circle cx="9" cy="4.5" r="1.5" {...p}/><circle cx="3.5" cy="8" r="1.5" {...p}/><circle cx="7" cy="9" r="2" {...p}/><circle cx="10.5" cy="8" r="1.5" {...p}/></g>,
    Insight: <g><circle cx="7" cy="4" r="3.5" {...s} strokeWidth="1.5"/><path d="M5.8 3 Q7 1.5 8.2 3 Q8.5 4 7.5 5" {...s} strokeWidth="1.3"/><circle cx="7" cy="6.5" r="0.7" {...p}/><line x1="7" y1="9" x2="7" y2="12" {...s} strokeWidth="2.5"/></g>,
    Religion: <g><circle cx="7" cy="3.5" r="2.5" {...s} strokeWidth="1.2"/><line x1="7" y1="1" x2="7" y2="-0.5" {...s} strokeWidth="1.2"/><line x1="4.5" y1="1.5" x2="3.5" y2="0" {...s} strokeWidth="1"/><line x1="9.5" y1="1.5" x2="10.5" y2="0" {...s} strokeWidth="1"/><line x1="7" y1="6" x2="7" y2="13" {...s} strokeWidth="1.5"/><line x1="4" y1="9" x2="10" y2="9" {...s} strokeWidth="1.5"/></g>,
    Seduction: <g><path d="M7 12 Q1 7 1 4.5 Q1 2 3.5 2 Q5.5 2 7 4.5 Q8.5 2 10.5 2 Q13 2 13 4.5 Q13 7 7 12 Z" {...p} opacity="0.85"/></g>,
    Performance: <g><circle cx="5" cy="10" r="2.5" {...s} strokeWidth="1.3" fill={color} fillOpacity="0.15"/><line x1="7.5" y1="10" x2="7.5" y2="2" {...s} strokeWidth="1.5"/><path d="M7.5 2 L12 1 L12 5 L7.5 6" {...p}/></g>,
    Persuasion: <g><path d="M3 7 Q1 5 3 4 L5 5" {...s} strokeWidth="1.3"/><path d="M11 7 Q13 5 11 4 L9 5" {...s} strokeWidth="1.3"/><path d="M5 5 L6 7 L8 7 L9 5" {...s} strokeWidth="1.3"/><path d="M5 7 L4 9 L5 10" {...s} strokeWidth="1.2"/><path d="M9 7 L10 9 L9 10" {...s} strokeWidth="1.2"/></g>,
    Deception: <g><path d="M7 4 L6 7.5 L5 6" {...s} strokeWidth="1.5"/><path d="M7 4 L8 7.5 L9 6" {...s} strokeWidth="1.5"/><ellipse cx="7" cy="4" rx="1.5" ry="1" {...p}/><path d="M4 10 Q7 13 10 10" {...s} strokeWidth="1.3"/><line x1="7" y1="7.5" x2="7" y2="10" {...s} strokeWidth="1.2"/></g>,
    Intimidation: <g><circle cx="7" cy="5" r="4" {...s} strokeWidth="1.2"/><rect x="4.5" y="6" width="5" height="3" rx="0.5" {...p} opacity="0.3"/><rect x="5.5" y="7" width="1" height="1.5" rx="0.3" {...p}/><rect x="7.5" y="7" width="1" height="1.5" rx="0.3" {...p}/><circle cx="5.5" cy="4" r="1" {...p}/><circle cx="8.5" cy="4" r="1" {...p}/></g>,
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
              fontSize: 9,
              color: "rgba(255,255,255,0.5)",
              fontStyle: "italic",
              lineHeight: 1.3,
              maxHeight: 24,
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
