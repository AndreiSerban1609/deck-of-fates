import React, { useState, useCallback } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { buildDeck, shuffle, drawCard } from "../lib/deck.js";
import { EXTENSION_ID } from "../lib/constants.js";
import { CardFace, CardBack } from "./CardArt.jsx";

export function CardDraw({
  deckTemplate,
  playerConfigs,
  partyMembers,
  settings,
  isGM,
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [drawnCard, setDrawnCard] = useState(null);
  const [phase, setPhase] = useState("select"); // "select" | "ready" | "drawn"
  const [animating, setAnimating] = useState(false);

  const selectPlayer = (member) => {
    setSelectedPlayer(member);
    setPhase("ready");
    setDrawnCard(null);
    setCurrentDeck(null);
  };

  const doDraw = useCallback(() => {
    let deck = currentDeck;

    // First draw: build and shuffle a fresh deck
    if (!deck) {
      const classCards = playerConfigs[selectedPlayer.id]?.classCards || [];
      const fullDeck = buildDeck(deckTemplate, classCards);
      deck = shuffle(fullDeck);
    }

    const { drawnCard: card, remaining } = drawCard(deck);

    setAnimating(true);
    setDrawnCard(card);
    setCurrentDeck(remaining);
    setPhase("drawn");

    // Broadcast to table if visibility is "table"
    if (settings.visibility === "table" && card) {
      try {
        OBR.broadcast.sendMessage(`${EXTENSION_ID}/cardDrawn`, {
          playerId: selectedPlayer.id,
          playerName: selectedPlayer.name,
          card,
        });
      } catch (e) {
        console.warn("[DeckOfFates] Broadcast failed:", e);
      }
    }

    setTimeout(() => setAnimating(false), 500);
  }, [currentDeck, selectedPlayer, deckTemplate, playerConfigs, settings]);

  const doRedraw = useCallback(() => {
    // Gamble-style: forfeit current card, draw next from remaining deck
    doDraw();
  }, [doDraw]);

  const resolve = () => {
    // Clear draw state, deck will be rebuilt fresh next time
    setDrawnCard(null);
    setCurrentDeck(null);
    setPhase("ready");

    // Broadcast resolution
    if (settings.visibility === "table") {
      try {
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
    setPhase("select");
  };

  const cardsRemaining = currentDeck ? currentDeck.length : null;

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
                {2 +
                  (deckTemplate.neutralCount || 0) +
                  (deckTemplate.statCount || 0) +
                  (deckTemplate.encounterCards || []).length +
                  (playerConfigs[member.id]?.classCards?.length || 0)}{" "}
                cards
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Ready / Drawn ---
  return (
    <div className="draw-panel">
      {/* Player header */}
      <div className="draw-header">
        <button className="btn-ghost" onClick={backToSelect}>← Players</button>
        <div className="draw-player-name">
          <div className="player-dot" style={{ background: selectedPlayer?.color }} />
          {selectedPlayer?.name}
        </div>
      </div>

      {/* Card area */}
      <div className="card-stage">
        {phase === "ready" && !drawnCard && (
          <div className="card-draw-prompt" onClick={doDraw}>
            <CardBack size={180} />
            <div className="draw-hint">Tap to draw</div>
          </div>
        )}

        {phase === "drawn" && drawnCard && (
          <div className="drawn-card-area">
            <CardFace card={drawnCard} size={200} animating={animating} />
          </div>
        )}
      </div>

      {/* Actions */}
      {phase === "drawn" && (
        <div className="draw-actions">
          <button className="btn-redraw" onClick={doRedraw} disabled={cardsRemaining === 0}>
            ↻ Redraw
            {cardsRemaining !== null && (
              <span className="remaining-badge">{cardsRemaining} left</span>
            )}
          </button>
          <button className="btn-accept" onClick={resolve}>
            ✓ Accept
          </button>
        </div>
      )}
    </div>
  );
}
