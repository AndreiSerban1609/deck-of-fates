import React, { useState, useCallback, useEffect } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { buildDeck, shuffle, drawCard } from "../lib/deck.js";
import { EXTENSION_ID, META } from "../lib/constants.js";
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
  const [redrawing, setRedrawing] = useState(false);
  const [drawCount, setDrawCount] = useState(0);
  const [redrawsUsed, setRedrawsUsed] = useState(0);

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
    setRedrawsUsed(0);
  };

  const doDraw = useCallback((isRedraw = false) => {
    let deck = currentDeck;

    if (!deck) {
      const classCards = playerConfigs[selectedPlayer.id]?.classCards || [];
      const fullDeck = buildDeck(deckTemplate, classCards);
      deck = shuffle(fullDeck);
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
        doRedraw();
      }
    );

    return () => unsub();
  }, [phase, selectedPlayer, doRedraw]);

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
  const canRedraw = redrawsLeft > 0 && cardsRemaining > 0;

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
          <button className="btn-redraw" onClick={doRedraw} disabled={!canRedraw}>
            ↻ Redraw
            {proficiency > 0 && (
              <span className="remaining-badge">{redrawsLeft}/{proficiency}</span>
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
