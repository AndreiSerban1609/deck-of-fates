import React, { useState, useCallback, useEffect, useRef } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { buildDeck, shuffle, drawCard, getEffectiveDeckSize, getStatModifierForCheck } from "../lib/deck.js";
import { EXTENSION_ID, META, CARD_TYPES, SKILL_CHECKS, SKILL_TO_ABILITY, ABILITY_LABELS } from "../lib/constants.js";
import { CardFace, CardBack, SkillIcon } from "./CardArt.jsx";

const TYPE_LABELS = {
  [CARD_TYPES.STEEL_CRITICAL]: "Crit",
  [CARD_TYPES.MIGHT_CRITICAL]: "Crit",
  [CARD_TYPES.NEUTRAL]: "Neutral",
  [CARD_TYPES.STAT]: "Stat",
  [CARD_TYPES.ENCOUNTER]: "Encounter",
  [CARD_TYPES.CLASS]: "Class",
};

const TYPE_ORDER = [
  CARD_TYPES.STEEL_CRITICAL, CARD_TYPES.MIGHT_CRITICAL,
  CARD_TYPES.NEUTRAL, CARD_TYPES.STAT, CARD_TYPES.ENCOUNTER, CARD_TYPES.CLASS,
];

function DeckInfoPanel({ fullDeck, currentDeck, onClose }) {
  const remainingIds = currentDeck ? new Set(currentDeck.map((c) => c.id)) : null;

  const sorted = [...fullDeck].sort(
    (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
  );

  const totalCount = fullDeck.length;
  const leftCount = currentDeck ? currentDeck.length : totalCount;

  return (
    <div className="deck-info-overlay" onClick={onClose}>
      <div className="deck-info-panel" onClick={(e) => e.stopPropagation()}>
        <div className="deck-info-header">
          <span>Deck — {leftCount}/{totalCount} remaining</span>
          <button className="btn-ghost deck-info-close" onClick={onClose}>✕</button>
        </div>
        <div className="deck-info-list">
          {sorted.map((card) => {
            const drawn = remainingIds !== null && !remainingIds.has(card.id);
            return (
              <div key={card.id} className={`deck-info-card${drawn ? " drawn" : ""}`}>
                <span className={`deck-info-type deck-info-type--${card.type.toLowerCase()}`}>
                  {TYPE_LABELS[card.type]}
                </span>
                <span className="deck-info-name">{card.name}</span>
                {card.modifier != null && (
                  <span className="deck-info-mod">
                    {card.modifier >= 0 ? "+" : ""}{card.modifier}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CardDraw({
  deckTemplate,
  playerConfigs,
  partyMembers,
  settings,
  isGM,
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [fullDeck, setFullDeck] = useState(null);
  const [drawnCard, setDrawnCard] = useState(null);
  const [phase, setPhase] = useState("select"); // "select" | "check" | "ready" | "drawn"
  const [redrawing, setRedrawing] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [drawCount, setDrawCount] = useState(0);
  const [redrawsUsed, setRedrawsUsed] = useState(0);
  const [showDeckInfo, setShowDeckInfo] = useState(false);
  const [statModifier, setStatModifier] = useState(null);
  const skipTimerRef = useRef(null);

  const proficiency = selectedPlayer
    ? (playerConfigs[selectedPlayer.id]?.proficiency || 0)
    : 0;
  const redrawsLeft = Math.max(0, proficiency - redrawsUsed);
  const cardsRemaining = currentDeck ? currentDeck.length : null;

  const selectPlayer = (member) => {
    setSelectedPlayer(member);
    setPhase("check");
    setSelectedCheck(null);
    setDrawnCard(null);
    setCurrentDeck(null);
    setFullDeck(null);
    setRedrawsUsed(0);
    setStatModifier(null);
    setSkipping(false);
  };

  const selectCheck = (check) => {
    setSelectedCheck(check);
    setPhase("ready");
  };

  const doDraw = useCallback((isRedraw = false, deckOverride = null, isSkipRedraw = false) => {
    let deck = deckOverride || currentDeck;

    if (!deck) {
      const cfg = playerConfigs[selectedPlayer.id] || {};
      const built = buildDeck(deckTemplate, cfg.classCards || [], cfg.excludedCards || null);
      setFullDeck(built);
      deck = shuffle(built);
    }

    const { drawnCard: card, remaining } = drawCard(deck);
    if (!card) return;

    const newRedrawsUsed = isRedraw ? redrawsUsed + 1 : redrawsUsed;

    // Check if this class card should be auto-skipped
    if (
      selectedCheck &&
      card.type === CARD_TYPES.CLASS &&
      card.checkType &&
      card.checkType !== selectedCheck &&
      remaining.length > 0
    ) {
      setDrawCount((c) => c + 1);
      setDrawnCard(card);
      setCurrentDeck(remaining);
      setPhase("drawn");
      setSkipping(true);
      setStatModifier(null);
      skipTimerRef.current = setTimeout(() => {
        setSkipping(false);
        doDraw(false, remaining, true);
      }, 600);
      return;
    }

    // Compute stat modifier if Stat card + check selected
    let computedStatMod = null;
    if (card.type === CARD_TYPES.STAT && selectedCheck) {
      const cfg = playerConfigs[selectedPlayer.id] || {};
      computedStatMod = getStatModifierForCheck(selectedCheck, cfg.stats);
    }

    const finalRedrawsUsed = isRedraw ? redrawsUsed + 1 : isSkipRedraw ? redrawsUsed : 0;

    setDrawCount((c) => c + 1);
    setDrawnCard(card);
    setCurrentDeck(remaining);
    setPhase("drawn");
    setRedrawsUsed(finalRedrawsUsed);
    setSkipping(false);
    setStatModifier(computedStatMod);

    if (settings.visibility === "table" && card) {
      const drawData = {
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.name,
        card,
        redrawsUsed: finalRedrawsUsed,
        proficiency,
        selectedCheck,
        statModifier: computedStatMod,
      };
      try {
        OBR.room.setMetadata({
          [META.CURRENT_DRAW]: drawData,
          [META.CURRENT_DECK]: remaining,
        });
        OBR.broadcast.sendMessage(`${EXTENSION_ID}/cardDrawn`, drawData);
      } catch (e) {
        console.warn("[DeckOfFates] Broadcast failed:", e);
      }
    }
  }, [currentDeck, selectedPlayer, deckTemplate, playerConfigs, settings, redrawsUsed, proficiency, selectedCheck]);

  const doRedraw = useCallback(() => {
    setRedrawing(true);
    setTimeout(() => {
      doDraw(true);
      setRedrawing(false);
    }, 350);
  }, [doDraw]);

  const resolve = () => {
    setDrawnCard(null);
    setCurrentDeck(null);
    setFullDeck(null);
    setPhase("ready");
    setRedrawsUsed(0);
    setStatModifier(null);
    setSkipping(false);
    clearTimeout(skipTimerRef.current);

    if (settings.visibility === "table") {
      try {
        OBR.room.setMetadata({
          [META.CURRENT_DRAW]: null,
          [META.CURRENT_DECK]: null,
        });
        OBR.broadcast.sendMessage(`${EXTENSION_ID}/cardResolved`, {
          playerId: selectedPlayer.id,
        });
      } catch (e) {
        console.warn("[DeckOfFates] Broadcast failed:", e);
      }
    }
  };

  const backToSelect = () => {
    setSelectedPlayer(null);
    setSelectedCheck(null);
    setDrawnCard(null);
    setCurrentDeck(null);
    setFullDeck(null);
    setPhase("select");
    setRedrawsUsed(0);
    setStatModifier(null);
    setSkipping(false);
    clearTimeout(skipTimerRef.current);
  };

  const backToCheck = () => {
    setSelectedCheck(null);
    setDrawnCard(null);
    setCurrentDeck(null);
    setFullDeck(null);
    setPhase("check");
    setRedrawsUsed(0);
    setStatModifier(null);
    setSkipping(false);
    clearTimeout(skipTimerRef.current);
  };

  // Listen for player-triggered redraws
  useEffect(() => {
    if (!OBR.isAvailable) return;

    const unsub = OBR.broadcast.onMessage(
      `${EXTENSION_ID}/playerRedraw`,
      (event) => {
        if (phase !== "drawn" || !selectedPlayer) return;
        if (event.data.playerId !== selectedPlayer.id) return;
        if (redrawsLeft <= 0 || cardsRemaining <= 0) return;
        doRedraw();
      }
    );

    return () => unsub();
  }, [phase, selectedPlayer, doRedraw, redrawsLeft, cardsRemaining]);

  // --- Player Select ---
  if (phase === "select") {
    return (
      <div className="draw-panel">
        <h3 className="section-title">Draw for Player</h3>
        <div className="player-list">
          {partyMembers.length === 0 && (
            <div className="empty-state">No players in the room yet.</div>
          )}
          {partyMembers.map((member) => (
            <button
              key={member.id}
              className="player-select-btn"
              onClick={() => selectPlayer(member)}
            >
              <div className="player-dot" style={{ background: member.color }} />
              <span>{member.name}</span>
              <span className="player-cards-badge">
                {getEffectiveDeckSize(deckTemplate, playerConfigs[member.id] || {})} cards
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Check Selection ---
  if (phase === "check") {
    const grouped = {};
    for (const skill of SKILL_CHECKS) {
      const ability = SKILL_TO_ABILITY[skill];
      if (!grouped[ability]) grouped[ability] = [];
      grouped[ability].push(skill);
    }
    const abilityOrder = ["str", "dex", "con", "int", "wis", "cha", "will"];

    return (
      <div className="draw-panel">
        <div className="draw-header">
          <button className="btn-ghost" onClick={backToSelect}>← Players</button>
          <div className="draw-player-name">
            <div className="player-dot" style={{ background: selectedPlayer?.color }} />
            {selectedPlayer?.name}
          </div>
          <div style={{ width: 32 }} />
        </div>
        <h3 className="section-title">Select Check</h3>
        <button
          className="check-btn check-btn-general"
          onClick={() => selectCheck(null)}
        >
          General Draw
        </button>
        <div className="check-grid-container">
          {abilityOrder.filter((a) => grouped[a]).map((ability) => (
            <div key={ability} className="check-group">
              <div className="check-group-label">{ABILITY_LABELS[ability]}</div>
              <div className="check-grid">
                {grouped[ability].map((skill) => (
                  <button
                    key={skill}
                    className="check-btn"
                    onClick={() => selectCheck(skill)}
                  >
                    <SkillIcon skill={skill} color="#e0a040" size={14} />
                    <span>{skill}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Ready / Drawn ---
  const canGMRedraw = cardsRemaining > 0;
  const canPlayerRedraw = redrawsLeft > 0 && cardsRemaining > 0;

  return (
    <div className="draw-panel">
      {/* Player header */}
      <div className="draw-header">
        <button className="btn-ghost" onClick={backToCheck}>← Check</button>
        <div className="draw-player-name">
          <div className="player-dot" style={{ background: selectedPlayer?.color }} />
          {selectedPlayer?.name}
          {selectedCheck && (
            <span className="draw-check-badge">
              <SkillIcon skill={selectedCheck} color="#e0a040" size={12} />
              {selectedCheck}
            </span>
          )}
        </div>
        <button
          className={`btn-icon btn-deck-info${showDeckInfo ? " active" : ""}`}
          onClick={() => setShowDeckInfo(!showDeckInfo)}
          title="Deck breakdown"
        >
          ⓘ
        </button>
      </div>

      {/* Deck info slide-out */}
      {showDeckInfo && (() => {
        const deck = fullDeck || (() => {
          const cfg = playerConfigs[selectedPlayer.id] || {};
          return buildDeck(deckTemplate, cfg.classCards || [], cfg.excludedCards || null);
        })();
        return (
          <DeckInfoPanel
            fullDeck={deck}
            currentDeck={currentDeck}
            onClose={() => setShowDeckInfo(false)}
          />
        );
      })()}

      {/* Card area */}
      <div className="card-stage">
        {phase === "ready" && !drawnCard && (
          <div className="card-draw-prompt" onClick={() => doDraw(false)}>
            <CardBack size={180} />
            <div className="draw-hint">Tap to draw</div>
          </div>
        )}

        {phase === "drawn" && drawnCard && (
          <div className={`drawn-card-area${redrawing ? " card-redraw-out" : ""}${skipping ? " card-skipping" : ""}`}>
            <CardFace key={drawCount} card={drawnCard} size={200} animating={true} />
            {skipping && (
              <div className="skip-overlay">
                <span className="skip-label">Wrong check — skipping</span>
              </div>
            )}
            {statModifier != null && !skipping && (
              <div className="stat-modifier-display">
                <span className="stat-mod-label">{ABILITY_LABELS[SKILL_TO_ABILITY[selectedCheck]]}</span>
                <span className="stat-mod-value">
                  {statModifier >= 0 ? `+${statModifier}` : statModifier}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {phase === "drawn" && !skipping && (
        <div className="draw-actions">
          <button className="btn-redraw" onClick={doRedraw} disabled={!canGMRedraw}>
            ↻ Redraw
          </button>
          {proficiency > 0 && (
            <span className="player-redraws-label">
              Player: {redrawsLeft}/{proficiency}
            </span>
          )}
          <button className="btn-accept" onClick={resolve}>
            ✓ Accept
          </button>
        </div>
      )}
    </div>
  );
}
