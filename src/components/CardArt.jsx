import React from "react";
import { CARD_TYPES } from "../lib/constants.js";
import { CLASS_THEMES } from "../lib/classThemes.js";
import { getModifierDisplay } from "../lib/deck.js";
import { getFrameComponent } from "./CardFrames.jsx";

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
  [CARD_TYPES.ENERGY_CRITICAL]: {
    bg: "linear-gradient(135deg, #1a0a2e 0%, #2d1b69 40%, #5b2d8e 60%, #1a0a2e 100%)",
    border: "#b44aed",
    glow: "rgba(180, 74, 237, 0.6)",
    accent: "#d89cf5",
    symbol: "✦",
    labelBg: "#3d1d6e",
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
    [CARD_TYPES.ENERGY_CRITICAL]: "Energy",
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
  const isCrit = card.type === CARD_TYPES.STEEL_CRITICAL || card.type === CARD_TYPES.ENERGY_CRITICAL;
  const isSteel = card.type === CARD_TYPES.STEEL_CRITICAL;

  // Border frame
  const FrameComponent = getFrameComponent(card.type, card.classTheme);

  // Unique animation name per crit type
  const glowName = isSteel ? "pulseGlowSteel" : "pulseGlowEnergy";

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
                  : "linear-gradient(90deg, transparent 0%, rgba(216,156,245,0.2) 40%, rgba(255,255,255,0.3) 50%, rgba(216,156,245,0.2) 60%, transparent 100%)",
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
              : "radial-gradient(ellipse at center, rgba(180,74,237,0.15) 0%, transparent 70%)",
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
          {card.description && (
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
