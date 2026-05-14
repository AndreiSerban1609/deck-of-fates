import React, { useState, useCallback, useRef } from "react";
import { buildDeck, shuffle, drawCard, getEffectiveDeckSize, getStatModifierForCheck } from "../lib/deck.js";
import { DEFAULT_DECK_TEMPLATE, CARD_TYPES, SKILL_CHECKS, SKILL_TO_ABILITY, ABILITY_LABELS } from "../lib/constants.js";
import { CardFace, CardBack, SkillIcon } from "./CardArt.jsx";
import { DiceRoll } from "./DiceRoll.jsx";
import { ResultBreakdown } from "./ResultBreakdown.jsx";

const SKIP_DELAY = 2500;

const MOCK_PLAYERS = [
  {
    id: "p1", name: "Alaric", color: "#e04030",
    classCards: [
      { name: "Shadow Step", modifier: 3, description: "Vanish into darkness.", classTheme: "rogue", checkType: "Stealth", redrawModifier: 2, redrawDescription: "Shadow lingers — +2 to next draw" },
      { name: "Backstab", modifier: 4, description: "Strike from the shadows.", classTheme: "rogue" },
    ],
    proficiency: 2,
    stats: { str: 8, dex: 16, con: 10, int: 12, wis: 10, cha: 14, will: 10 },
  },
  {
    id: "p2", name: "Sera", color: "#60c0f0",
    classCards: [
      { name: "Arcane Surge", modifier: 4, description: "Raw magic bends to your will.", classTheme: "wizard", redrawModifier: 1, redrawDescription: "Arcane residue — +1 to next draw" },
    ],
    proficiency: 1,
    stats: { str: 8, dex: 10, con: 10, int: 18, wis: 14, cha: 12, will: 10 },
  },
  {
    id: "p3", name: "Thorne", color: "#3a8b5c",
    classCards: [
      { name: "Berserker Rage", modifier: 4, description: "Pain fuels your strength.", classTheme: "warrior", checkType: "Athletics" },
    ],
    proficiency: 0,
    stats: { str: 18, dex: 10, con: 16, int: 8, wis: 10, cha: 8, will: 12 },
  },
];

function RedrawBonuses({ bonuses }) {
  if (!bonuses || bonuses.length === 0) return null;
  const total = bonuses.reduce((sum, b) => sum + b.modifier, 0);
  return (
    <div className="redraw-bonuses">
      {bonuses.map((b, i) => (
        <div key={i} className="redraw-bonus-row">
          <span className="redraw-bonus-name">{b.name}</span>
          <span className="redraw-bonus-mod">
            {b.modifier >= 0 ? `+${b.modifier}` : b.modifier}
          </span>
        </div>
      ))}
      {bonuses.length > 1 && (
        <div className="redraw-bonus-total">
          Total bonus: {total >= 0 ? `+${total}` : total}
        </div>
      )}
    </div>
  );
}

export function MockDrawFlow() {
  const [diceEnabled, setDiceEnabled] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [fullDeck, setFullDeck] = useState(null);
  const [drawnCard, setDrawnCard] = useState(null);
  const [phase, setPhase] = useState("select");
  const [redrawing, setRedrawing] = useState(false);
  const [skipReason, setSkipReason] = useState(null);
  const [drawCount, setDrawCount] = useState(0);
  const [redrawsUsed, setRedrawsUsed] = useState(0);
  const [d10Result, setD10Result] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [statModifier, setStatModifier] = useState(null);
  const [redrawBonuses, setRedrawBonuses] = useState([]);
  const skipTimerRef = useRef(null);

  const playerConfig = selectedPlayer
    ? MOCK_PLAYERS.find((p) => p.id === selectedPlayer.id)
    : null;
  const proficiency = playerConfig?.proficiency || 0;
  const redrawsLeft = Math.max(0, proficiency - redrawsUsed);
  const cardsRemaining = currentDeck ? currentDeck.length : null;

  const selectPlayer = (player) => {
    setSelectedPlayer(player);
    setPhase("check");
    setSelectedCheck(null);
    setDrawnCard(null);
    setCurrentDeck(null);
    setFullDeck(null);
    setRedrawsUsed(0);
    setD10Result(null);
    setRolling(false);
    setStatModifier(null);
    setSkipReason(null);
    setRedrawBonuses([]);
  };

  const selectCheck = (check) => {
    setSelectedCheck(check);
    setPhase("ready");
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

  const doDraw = useCallback((isRedraw = false, deckOverride = null, isSkipRedraw = false, accBonuses = []) => {
    let deck = deckOverride || currentDeck;

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
    if (!card) return;

    // Wrong-check skip
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
      setSkipReason("wrong-check");
      setStatModifier(null);
      setRedrawBonuses(accBonuses);

      skipTimerRef.current = setTimeout(() => {
        setSkipReason(null);
        doDraw(false, remaining, true, accBonuses);
      }, SKIP_DELAY);
      return;
    }

    // Redraw effect
    if (
      card.type === CARD_TYPES.CLASS &&
      card.redrawModifier != null &&
      remaining.length > 0
    ) {
      const newBonuses = [...accBonuses, {
        name: card.name,
        modifier: card.redrawModifier,
        description: card.redrawDescription || "",
      }];

      setDrawCount((c) => c + 1);
      setDrawnCard(card);
      setCurrentDeck(remaining);
      setPhase("drawn");
      setSkipReason("redraw-effect");
      setStatModifier(null);
      setRedrawBonuses(newBonuses);

      skipTimerRef.current = setTimeout(() => {
        setSkipReason(null);
        doDraw(false, remaining, true, newBonuses);
      }, SKIP_DELAY);
      return;
    }

    // Normal draw
    let computedStatMod = null;
    if (card.type === CARD_TYPES.STAT && selectedCheck) {
      computedStatMod = getStatModifierForCheck(selectedCheck, playerConfig?.stats);
    }

    const finalRedrawsUsed = isRedraw ? redrawsUsed + 1 : isSkipRedraw ? redrawsUsed : 0;

    setDrawCount((c) => c + 1);
    setDrawnCard(card);
    setCurrentDeck(remaining);
    setPhase("drawn");
    setRedrawsUsed(finalRedrawsUsed);
    setSkipReason(null);
    setStatModifier(computedStatMod);
    setRedrawBonuses(accBonuses);
  }, [currentDeck, playerConfig, redrawsUsed, selectedCheck]);

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
    setStatModifier(null);
    setSkipReason(null);
    setRedrawBonuses([]);
    clearTimeout(skipTimerRef.current);
  };

  const backToSelect = () => {
    setSelectedPlayer(null);
    setSelectedCheck(null);
    setDrawnCard(null);
    setCurrentDeck(null);
    setFullDeck(null);
    setPhase("select");
    setRedrawsUsed(0);
    setD10Result(null);
    setRolling(false);
    setStatModifier(null);
    setSkipReason(null);
    setRedrawBonuses([]);
    clearTimeout(skipTimerRef.current);
  };

  const backToCheck = () => {
    setSelectedCheck(null);
    setDrawnCard(null);
    setCurrentDeck(null);
    setFullDeck(null);
    setPhase("check");
    setRedrawsUsed(0);
    setD10Result(null);
    setRolling(false);
    setStatModifier(null);
    setSkipReason(null);
    setRedrawBonuses([]);
    clearTimeout(skipTimerRef.current);
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

  return (
    <div className="draw-panel">
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
          <div className={`drawn-card-area${redrawing ? " card-redraw-out" : ""}${skipReason ? " card-skipping" : ""}`}>
            <CardFace key={drawCount} card={drawnCard} size={200} animating={true} />
            {skipReason === "wrong-check" && (
              <div className="skip-overlay">
                <span className="skip-label">Wrong check — skipping</span>
              </div>
            )}
            {skipReason === "redraw-effect" && (
              <div className="skip-overlay skip-overlay-effect">
                <span className="skip-effect-name">{drawnCard.name}</span>
                {drawnCard.redrawDescription && (
                  <span className="skip-effect-desc">{drawnCard.redrawDescription}</span>
                )}
                <span className="skip-effect-mod">
                  {drawnCard.redrawModifier >= 0 ? "+" : ""}{drawnCard.redrawModifier} bonus applied
                </span>
              </div>
            )}
            {statModifier != null && !skipReason && (
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

      {phase === "drawn" && !skipReason && redrawBonuses.length > 0 && (
        <RedrawBonuses bonuses={redrawBonuses} />
      )}

      {phase === "drawn" && diceEnabled && d10Result != null && drawnCard && !skipReason && (
        <ResultBreakdown
          key={`rb-${drawCount}`}
          roll={d10Result}
          card={drawnCard}
          isRedraw={redrawsUsed > 0}
          statModifier={statModifier}
          redrawBonuses={redrawBonuses}
        />
      )}

      {phase === "drawn" && !skipReason && (
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
