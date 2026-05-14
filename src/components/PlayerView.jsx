import React, { useState, useEffect, useRef, useCallback } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { EXTENSION_ID, META, ABILITY_LABELS, SKILL_TO_ABILITY } from "../lib/constants.js";
import { CardFace, CardBack } from "./CardArt.jsx";
import { DiceRoll } from "./DiceRoll.jsx";
import { ResultBreakdown } from "./ResultBreakdown.jsx";

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

export function PlayerView({ settings, playerId }) {
  const [lastDraw, setLastDraw] = useState(null);
  const [drawKey, setDrawKey] = useState(0);
  const [redrawing, setRedrawing] = useState(false);
  const [dicePhase, setDicePhase] = useState(null); // null | "rolling" | "done"
  const [diceResult, setDiceResult] = useState(null);
  const [dicePlayerName, setDicePlayerName] = useState(null);
  const redrawTimer = useRef(null);
  const pendingDrawRef = useRef(null);
  const dicePhaseRef = useRef(null);

  const applyDraw = useCallback((data) => {
    setRedrawing(false);
    clearTimeout(redrawTimer.current);

    const isRedraw = (data.redrawsUsed || 0) > 0 || data.skipReason;

    if (!isRedraw && dicePhaseRef.current === "rolling") {
      pendingDrawRef.current = data;
      return;
    }

    setDrawKey((k) => k + 1);
    setLastDraw(data);
    if (data.d10Result != null) {
      setDicePhase("done");
      dicePhaseRef.current = "done";
      setDiceResult(data.d10Result);
    }
  }, []);

  const rollSafetyRef = useRef(null);

  const startDiceRoll = useCallback((data) => {
    setDiceResult(data.d10Result);
    setDicePlayerName(data.playerName);
    setDicePhase("rolling");
    dicePhaseRef.current = "rolling";
    setLastDraw(null);
    pendingDrawRef.current = null;

    clearTimeout(rollSafetyRef.current);
    rollSafetyRef.current = setTimeout(() => {
      if (dicePhaseRef.current === "rolling") {
        dicePhaseRef.current = "done";
        setDicePhase("done");
        if (pendingDrawRef.current) {
          setDrawKey((k) => k + 1);
          setLastDraw(pendingDrawRef.current);
          pendingDrawRef.current = null;
        }
      }
    }, 2000);
  }, []);

  const onPlayerRollComplete = useCallback(() => {
    setDicePhase("done");
    dicePhaseRef.current = "done";
    if (pendingDrawRef.current) {
      setDrawKey((k) => k + 1);
      setLastDraw(pendingDrawRef.current);
      pendingDrawRef.current = null;
    }
  }, []);

  const clearDraw = useCallback(() => {
    setRedrawing(false);
    clearTimeout(redrawTimer.current);
    clearTimeout(rollSafetyRef.current);
    setLastDraw(null);
    setDicePhase(null);
    dicePhaseRef.current = null;
    setDiceResult(null);
    setDicePlayerName(null);
    pendingDrawRef.current = null;
  }, []);

  useEffect(() => {
    if (!OBR.isAvailable) return;

    let unsubMeta = null;

    OBR.onReady(async () => {
      try {
        const meta = await OBR.room.getMetadata();
        const persisted = meta[META.CURRENT_DRAW];
        if (persisted) setLastDraw(persisted);
      } catch (e) {
        console.warn("[DeckOfFates] Failed to read current draw:", e);
      }

      unsubMeta = OBR.room.onMetadataChange((meta) => {
        const current = meta[META.CURRENT_DRAW];
        if (current) {
          applyDraw(current);
        } else {
          clearDraw();
        }
      });
    });

    const unsubDraw = OBR.broadcast.onMessage(
      `${EXTENSION_ID}/cardDrawn`,
      (event) => applyDraw(event.data)
    );

    const unsubResolve = OBR.broadcast.onMessage(
      `${EXTENSION_ID}/cardResolved`,
      () => clearDraw()
    );

    const unsubDice = OBR.broadcast.onMessage(
      `${EXTENSION_ID}/diceRolled`,
      (event) => startDiceRoll(event.data)
    );

    return () => {
      unsubDraw();
      unsubResolve();
      unsubDice();
      unsubMeta?.();
      clearTimeout(redrawTimer.current);
    };
  }, [applyDraw, clearDraw, startDiceRoll]);

  const requestRedraw = async () => {
    if (!lastDraw) return;
    setRedrawing(true);
    redrawTimer.current = setTimeout(() => setRedrawing(false), 3000);
    try {
      await OBR.broadcast.sendMessage(`${EXTENSION_ID}/playerRedraw`, {
        playerId: lastDraw.playerId,
      });
    } catch (e) {
      setRedrawing(false);
      clearTimeout(redrawTimer.current);
      console.warn("[DeckOfFates] Redraw request failed:", e);
    }
  };

  if (settings.visibility === "dm-only") {
    return (
      <div className="player-view">
        <div className="player-view-center">
          <CardBack size={140} />
          <p className="player-waiting-text">The DM holds the deck.</p>
          <p className="player-sub-text">Card draws are hidden from players.</p>
        </div>
      </div>
    );
  }

  const redrawsUsed = lastDraw?.redrawsUsed || 0;
  const proficiency = lastDraw?.proficiency || 0;
  const redrawsLeft = Math.max(0, proficiency - redrawsUsed);
  const skipReason = lastDraw?.skipReason || null;
  const redrawBonuses = lastDraw?.redrawBonuses || [];

  return (
    <div className="player-view">
      <div className="player-view-center">
        {!lastDraw && !dicePhase && (
          <>
            <CardBack size={140} />
            <p className="player-waiting-text">Awaiting the next draw...</p>
          </>
        )}

        {(dicePhase === "rolling" || dicePhase === "done") && diceResult != null && !lastDraw && (
          <>
            <div className="player-draw-label">
              {dicePlayerName}'s roll:
            </div>
            <div className="dice-and-card-area">
              <DiceRoll
                key={drawKey}
                result={diceResult}
                rolling={dicePhase === "rolling"}
                size={120}
                onRollComplete={onPlayerRollComplete}
              />
              {dicePhase === "done" && (
                <p className="player-waiting-text" style={{ marginTop: 8 }}>Awaiting the draw...</p>
              )}
            </div>
          </>
        )}

        {lastDraw && (
          <>
            <div className="player-draw-label">
              {lastDraw.playerName}'s draw:
            </div>
            {dicePhase === "done" && diceResult != null && (
              <div style={{ marginBottom: 8 }}>
                <DiceRoll result={diceResult} rolling={false} size={80} />
              </div>
            )}
            <div className={`drawn-card-area${redrawing ? " card-redraw-out" : ""}${skipReason ? " card-skipping" : ""}`}>
              <CardFace key={drawKey} card={lastDraw.card} size={200} animating={true} />
              {skipReason === "wrong-check" && (
                <div className="skip-overlay">
                  <span className="skip-label">Wrong check — skipping</span>
                </div>
              )}
              {skipReason === "redraw-effect" && (
                <div className="skip-overlay skip-overlay-effect">
                  <span className="skip-effect-name">{lastDraw.card.name}</span>
                  {lastDraw.card.redrawDescription && (
                    <span className="skip-effect-desc">{lastDraw.card.redrawDescription}</span>
                  )}
                  <span className="skip-effect-mod">
                    {lastDraw.card.redrawModifier >= 0 ? "+" : ""}{lastDraw.card.redrawModifier} bonus applied
                  </span>
                </div>
              )}
              {lastDraw.statModifier != null && !skipReason && (
                <div className="stat-modifier-display">
                  <span className="stat-mod-label">
                    {ABILITY_LABELS[SKILL_TO_ABILITY[lastDraw.selectedCheck]]}
                  </span>
                  <span className="stat-mod-value">
                    {lastDraw.statModifier >= 0 ? `+${lastDraw.statModifier}` : lastDraw.statModifier}
                  </span>
                </div>
              )}
            </div>
            {!skipReason && redrawBonuses.length > 0 && (
              <RedrawBonuses bonuses={redrawBonuses} />
            )}
            {diceResult != null && !skipReason && (
              <ResultBreakdown
                key={`rb-${drawKey}`}
                roll={diceResult}
                card={lastDraw.card}
                isRedraw={redrawsUsed > 0}
                statModifier={lastDraw.statModifier}
                redrawBonuses={redrawBonuses}
              />
            )}
            {proficiency > 0 && !skipReason && playerId === lastDraw.playerId && (
              <div className="draw-actions" style={{ marginTop: 12 }}>
                <button
                  className="btn-redraw"
                  onClick={requestRedraw}
                  disabled={redrawsLeft <= 0 || redrawing}
                >
                  ↻ Redraw
                  <span className="remaining-badge">{redrawsLeft}/{proficiency}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
