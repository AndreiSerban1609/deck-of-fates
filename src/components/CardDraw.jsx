import React, { useState, useCallback, useEffect, useRef } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { buildDeck, shuffle, drawCard, getEffectiveDeckSize, getStatModifierForCheck } from "../lib/deck.js";
import { EXTENSION_ID, META, CARD_TYPES, SKILL_CHECKS, SKILL_TO_ABILITY, ABILITY_LABELS } from "../lib/constants.js";
import { CardFace, CardBack, SkillIcon } from "./CardArt.jsx";
import { DiceRoll } from "./DiceRoll.jsx";
import { ResultBreakdown } from "./ResultBreakdown.jsx";

const SKIP_DELAY = 2500;

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
  const [phase, setPhase] = useState("select");
  const [redrawing, setRedrawing] = useState(false);
  const [skipReason, setSkipReason] = useState(null); // null | "wrong-check" | "redraw-effect"
  const [drawCount, setDrawCount] = useState(0);
  const [redrawsUsed, setRedrawsUsed] = useState(0);
  const [showDeckInfo, setShowDeckInfo] = useState(false);
  const [d10Result, setD10Result] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [statModifier, setStatModifier] = useState(null);
  const [redrawBonuses, setRedrawBonuses] = useState([]);
  const skipTimerRef = useRef(null);

  const diceEnabled = settings.diceRoll === true;

  const proficiency = selectedPlayer
    ? (playerConfigs[selectedPlayer.id]?.proficiency || 0)
    : 0;
  const redrawsLeft = Math.max(0, proficiency - redrawsUsed);
  const cardsRemaining = currentDeck ? currentDeck.length : null;

  const broadcast = useCallback((eventType, data) => {
    if (settings.visibility !== "table") return;
    try {
      if (eventType === "drawn") {
        OBR.room.setMetadata({
          [META.CURRENT_DRAW]: data,
          [META.CURRENT_DECK]: data._remaining || null,
        });
      }
      const { _remaining, ...broadcastData } = data;
      OBR.broadcast.sendMessage(`${EXTENSION_ID}/card${eventType === "drawn" ? "Drawn" : "Resolved"}`, broadcastData);
    } catch (e) {
      console.warn("[DeckOfFates] Broadcast failed:", e);
    }
  }, [settings.visibility]);

  const selectPlayer = (member) => {
    setSelectedPlayer(member);
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

    if (settings.visibility === "table") {
      try {
        OBR.broadcast.sendMessage(`${EXTENSION_ID}/diceRolled`, {
          playerId: selectedPlayer.id,
          playerName: selectedPlayer.name,
          d10Result: result,
        });
      } catch (e) {
        console.warn("[DeckOfFates] Dice broadcast failed:", e);
      }
    }
  };

  const onRollComplete = useCallback(() => {
    setRolling(false);
    setPhase("rolled");
  }, []);

  const doDraw = useCallback((isRedraw = false, deckOverride = null, isSkipRedraw = false, accBonuses = []) => {
    let deck = deckOverride || currentDeck;

    if (!deck) {
      const cfg = playerConfigs[selectedPlayer.id] || {};
      const built = buildDeck(deckTemplate, cfg.classCards || [], cfg.excludedCards || null);
      setFullDeck(built);
      deck = shuffle(built);
    }

    const { drawnCard: card, remaining } = drawCard(deck);
    if (!card) return;

    // Wrong-check skip (takes priority over redraw effect)
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

      broadcast("drawn", {
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.name,
        card,
        skipReason: "wrong-check",
        redrawBonuses: accBonuses,
        _remaining: remaining,
      });

      skipTimerRef.current = setTimeout(() => {
        setSkipReason(null);
        doDraw(false, remaining, true, accBonuses);
      }, SKIP_DELAY);
      return;
    }

    // Redraw effect — class card with redrawModifier triggers auto-redraw
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

      broadcast("drawn", {
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.name,
        card,
        skipReason: "redraw-effect",
        redrawBonuses: newBonuses,
        _remaining: remaining,
      });

      skipTimerRef.current = setTimeout(() => {
        setSkipReason(null);
        doDraw(false, remaining, true, newBonuses);
      }, SKIP_DELAY);
      return;
    }

    // Normal draw — final card
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
    setSkipReason(null);
    setStatModifier(computedStatMod);
    setRedrawBonuses(accBonuses);

    broadcast("drawn", {
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      card,
      redrawsUsed: finalRedrawsUsed,
      proficiency,
      d10Result: diceEnabled ? d10Result : null,
      selectedCheck,
      statModifier: computedStatMod,
      redrawBonuses: accBonuses,
      _remaining: remaining,
    });
  }, [currentDeck, selectedPlayer, deckTemplate, playerConfigs, settings, redrawsUsed, proficiency, diceEnabled, d10Result, selectedCheck, broadcast]);

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

  // --- Ready / Rolling / Rolled / Drawn ---
  const canGMRedraw = cardsRemaining > 0;

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
        <button
          className={`btn-icon btn-deck-info${showDeckInfo ? " active" : ""}`}
          onClick={() => setShowDeckInfo(!showDeckInfo)}
          title="Deck breakdown"
        >
          ⓘ
        </button>
      </div>

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

      <div className="card-stage">
        {phase === "ready" && !drawnCard && !diceEnabled && (
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
