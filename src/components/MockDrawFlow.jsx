import React, { useState, useCallback } from "react";
import { buildDeck, shuffle, drawCard, getEffectiveDeckSize } from "../lib/deck.js";
import { DEFAULT_DECK_TEMPLATE, CARD_TYPES } from "../lib/constants.js";
import { CardFace, CardBack } from "./CardArt.jsx";
import { DiceRoll } from "./DiceRoll.jsx";
import { ResultBreakdown } from "./ResultBreakdown.jsx";

const MOCK_PLAYERS = [
  { id: "p1", name: "Alaric", color: "#e04030", classCards: [
    { name: "Shadow Step", modifier: 3, description: "Vanish into darkness.", classTheme: "rogue", checkType: "Stealth", redrawModifier: 2, redrawDescription: "On redraw: +2 to stealth" },
    { name: "Backstab", modifier: 4, description: "Strike from the shadows.", classTheme: "rogue" },
  ], proficiency: 2 },
  { id: "p2", name: "Sera", color: "#60c0f0", classCards: [
    { name: "Arcane Surge", modifier: 4, description: "Raw magic bends to your will.", classTheme: "wizard" },
  ], proficiency: 1 },
  { id: "p3", name: "Thorne", color: "#3a8b5c", classCards: [
    { name: "Berserker Rage", modifier: 4, description: "Pain fuels your strength.", classTheme: "warrior", checkType: "Athletics" },
  ], proficiency: 0 },
];

export function MockDrawFlow() {
  const [diceEnabled, setDiceEnabled] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [fullDeck, setFullDeck] = useState(null);
  const [drawnCard, setDrawnCard] = useState(null);
  const [phase, setPhase] = useState("select");
  const [redrawing, setRedrawing] = useState(false);
  const [drawCount, setDrawCount] = useState(0);
  const [redrawsUsed, setRedrawsUsed] = useState(0);
  const [d10Result, setD10Result] = useState(null);
  const [rolling, setRolling] = useState(false);

  const playerConfig = selectedPlayer
    ? MOCK_PLAYERS.find((p) => p.id === selectedPlayer.id)
    : null;
  const proficiency = playerConfig?.proficiency || 0;
  const redrawsLeft = Math.max(0, proficiency - redrawsUsed);
  const cardsRemaining = currentDeck ? currentDeck.length : null;

  const selectPlayer = (player) => {
    setSelectedPlayer(player);
    setPhase("ready");
    setDrawnCard(null);
    setCurrentDeck(null);
    setFullDeck(null);
    setRedrawsUsed(0);
    setD10Result(null);
    setRolling(false);
  };

  const startRoll = () => {
    const result = Math.floor(Math.random() * 10) + 1;
    setD10Result(result);
    setRolling(true);
    setPhase("rolling");
  };

  const onRollComplete = useCallback(() => {
    setRolling(false);
    setPhase("rolled");
  }, []);

  const doDraw = useCallback((isRedraw = false) => {
    let deck = currentDeck;

    if (!deck) {
      const built = buildDeck(
        DEFAULT_DECK_TEMPLATE,
        playerConfig?.classCards || [],
        null
      );
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
  }, [currentDeck, playerConfig, redrawsUsed]);

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
    setD10Result(null);
    setRolling(false);
  };

  const backToSelect = () => {
    setSelectedPlayer(null);
    setDrawnCard(null);
    setCurrentDeck(null);
    setFullDeck(null);
    setPhase("select");
    setRedrawsUsed(0);
    setD10Result(null);
    setRolling(false);
  };

  const canGMRedraw = cardsRemaining > 0;

  if (phase === "select") {
    return (
      <div className="draw-panel">
        <h3 className="section-title">Draw for Player</h3>
        <div className="player-list">
          {MOCK_PLAYERS.map((player) => (
            <button
              key={player.id}
              className="player-select-btn"
              onClick={() => selectPlayer(player)}
            >
              <div className="player-dot" style={{ background: player.color }} />
              <span>{player.name}</span>
              <span className="player-cards-badge">
                {getEffectiveDeckSize(DEFAULT_DECK_TEMPLATE, { classCards: player.classCards })} cards
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

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

      <div className="card-stage">
        {phase === "ready" && !diceEnabled && (
          <div className="card-draw-prompt" onClick={() => doDraw(false)}>
            <CardBack size={180} />
            <div className="draw-hint">Tap to draw</div>
          </div>
        )}

        {phase === "ready" && diceEnabled && (
          <div className="card-draw-prompt" onClick={startRoll}>
            <DiceRoll result={null} rolling={false} size={120} />
            <div className="draw-hint">Tap to roll</div>
          </div>
        )}

        {(phase === "rolling" || phase === "rolled") && diceEnabled && (
          <div className="dice-and-card-area">
            <DiceRoll result={d10Result} rolling={rolling} size={120} onRollComplete={onRollComplete} />
            {phase === "rolled" && (
              <div className="card-draw-prompt" onClick={() => doDraw(false)} style={{ marginTop: 12 }}>
                <CardBack size={140} />
                <div className="draw-hint">Tap to draw</div>
              </div>
            )}
          </div>
        )}

        {phase === "drawn" && drawnCard && (
          <div className={`drawn-card-area${redrawing ? " card-redraw-out" : ""}`}>
            <CardFace key={drawCount} card={drawnCard} size={200} animating={true} />
          </div>
        )}
      </div>

      {phase === "drawn" && diceEnabled && d10Result != null && drawnCard && (
        <ResultBreakdown
          key={`rb-${drawCount}`}
          roll={d10Result}
          card={drawnCard}
          isRedraw={redrawsUsed > 0}
        />
      )}

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
