import React, { useState, useCallback, useEffect } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { buildDeck, shuffle, drawCard, getEffectiveDeckSize } from "../lib/deck.js";
import { EXTENSION_ID, META, CARD_TYPES } from "../lib/constants.js";
import { CardFace, CardBack } from "./CardArt.jsx";

function DeckInfoPanel({ fullDeck, currentDeck, drawnCard }) {
  const counts = (cards) => {
    const c = { crit: 0, neutral: 0, stat: 0, encounter: 0, class: 0 };
    for (const card of cards) {
      if (card.type === CARD_TYPES.STEEL_CRITICAL || card.type === CARD_TYPES.MIGHT_CRITICAL) c.crit++;
      else if (card.type === CARD_TYPES.NEUTRAL) c.neutral++;
      else if (card.type === CARD_TYPES.STAT) c.stat++;
      else if (card.type === CARD_TYPES.ENCOUNTER) c.encounter++;
      else if (card.type === CARD_TYPES.CLASS) c.class++;
    }
    return c;
  };

  const total = counts(fullDeck);
  const remaining = currentDeck ? counts(currentDeck) : total;
  const hasDrawn = currentDeck !== null;

  const rows = [
    { label: "Crits", key: "crit" },
    { label: "Neutral", key: "neutral" },
    { label: "Stat", key: "stat" },
    { label: "Encounter", key: "encounter" },
    { label: "Class", key: "class" },
  ];

  return (
    <div className="deck-info-panel">
      <div className="deck-info-header">Deck Breakdown</div>
      <div className="deck-info-grid">
        <span className="deck-info-label" />
        <span className="deck-info-col-header">Total</span>
        {hasDrawn && <span className="deck-info-col-header">Left</span>}
        {rows.map((r) => (
          <React.Fragment key={r.key}>
            <span className="deck-info-label">{r.label}</span>
            <span className="deck-info-value">{total[r.key]}</span>
            {hasDrawn && (
              <span className={`deck-info-value${remaining[r.key] < total[r.key] ? " deck-info-changed" : ""}`}>
                {remaining[r.key]}
              </span>
            )}
          </React.Fragment>
        ))}
        <React.Fragment>
          <span className="deck-info-label deck-info-total">Total</span>
          <span className="deck-info-value deck-info-total">{fullDeck.length}</span>
          {hasDrawn && (
            <span className="deck-info-value deck-info-total deck-info-changed">
              {currentDeck.length}
            </span>
          )}
        </React.Fragment>
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

      {/* Deck info panel */}
      {showDeckInfo && fullDeck && (
        <DeckInfoPanel fullDeck={fullDeck} currentDeck={currentDeck} drawnCard={drawnCard} />
      )}

      {/* Build deck preview before first draw */}
      {showDeckInfo && !fullDeck && selectedPlayer && (() => {
        const cfg = playerConfigs[selectedPlayer.id] || {};
        const preview = buildDeck(deckTemplate, cfg.classCards || [], cfg.excludedCards || null);
        return <DeckInfoPanel fullDeck={preview} currentDeck={null} drawnCard={null} />;
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
