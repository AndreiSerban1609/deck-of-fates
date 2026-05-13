import React, { useState, useCallback, useEffect } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { buildDeck, shuffle, drawCard, getEffectiveDeckSize } from "../lib/deck.js";
import { EXTENSION_ID, META, CARD_TYPES } from "../lib/constants.js";
import { CardFace, CardBack } from "./CardArt.jsx";

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
  const [currentDeck, setCurrentDeck] = useState(null);
  const [fullDeck, setFullDeck] = useState(null);
  const [drawnCard, setDrawnCard] = useState(null);
  const [phase, setPhase] = useState("select"); // "select" | "ready" | "drawn"
  const [redrawing, setRedrawing] = useState(false);
  const [drawCount, setDrawCount] = useState(0);
  const [redrawsUsed, setRedrawsUsed] = useState(0);
  const [showDeckInfo, setShowDeckInfo] = useState(false);

  const proficiency = selectedPlayer
    ? (playerConfigs[selectedPlayer.id]?.proficiency || 0)
    : 0;
  const redrawsLeft = Math.max(0, proficiency - redrawsUsed);
  const cardsRemaining = currentDeck ? currentDeck.length : null;

  const selectPlayer = (member) => {
    setSelectedPlayer(member);
    setPhase("ready");
    setDrawnCard(null);
    setCurrentDeck(null);
    setFullDeck(null);
    setRedrawsUsed(0);
  };

  const doDraw = useCallback((isRedraw = false) => {
    let deck = currentDeck;

    if (!deck) {
      const cfg = playerConfigs[selectedPlayer.id] || {};
      const built = buildDeck(deckTemplate, cfg.classCards || [], cfg.excludedCards || null);
      setFullDeck(built);
      deck = shuffle(built);
    }

    const { drawnCard: card, remaining } = drawCard(deck);
    const newRedrawsUsed = isRedraw ? redrawsUsed + 1 : 0;

    setDrawCount((c) => c + 1);
    setDrawnCard(card);
    setCurrentDeck(remaining);
    setPhase("drawn");
    setRedrawsUsed(newRedrawsUsed);

    // Persist + broadcast to table if visibility is "table"
    if (settings.visibility === "table" && card) {
      const drawData = {
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.name,
        card,
        redrawsUsed: newRedrawsUsed,
        proficiency,
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
  }, [currentDeck, selectedPlayer, deckTemplate, playerConfigs, settings, redrawsUsed, proficiency]);

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
    setDrawnCard(null);
    setCurrentDeck(null);
    setFullDeck(null);
    setPhase("select");
    setRedrawsUsed(0);
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

  // --- Ready / Drawn ---
  const canGMRedraw = cardsRemaining > 0;
  const canPlayerRedraw = redrawsLeft > 0 && cardsRemaining > 0;

  return (
    <div className="draw-panel">
      {/* Player header */}
      <div className="draw-header">
        <button className="btn-ghost" onClick={backToSelect}>← Players</button>
        <div className="draw-player-name">
          <div className="player-dot" style={{ background: selectedPlayer?.color }} />
          {selectedPlayer?.name}
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
          <div className={`drawn-card-area${redrawing ? " card-redraw-out" : ""}`}>
            <CardFace key={drawCount} card={drawnCard} size={200} animating={true} />
          </div>
        )}
      </div>

      {/* Actions */}
      {phase === "drawn" && (
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
