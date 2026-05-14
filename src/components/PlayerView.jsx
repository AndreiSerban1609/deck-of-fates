import React, { useState, useEffect, useRef } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { EXTENSION_ID, META, ABILITY_LABELS, SKILL_TO_ABILITY } from "../lib/constants.js";
import { CardFace, CardBack } from "./CardArt.jsx";
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

export function PlayerView({ settings }) {
  const [lastDraw, setLastDraw] = useState(null);
  const [drawKey, setDrawKey] = useState(0);
  const [redrawing, setRedrawing] = useState(false);
  const redrawTimer = useRef(null);

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
          setRedrawing(false);
          clearTimeout(redrawTimer.current);
          setDrawKey((k) => k + 1);
          setLastDraw(current);
        } else {
          setLastDraw(null);
        }
      });
    });

    const unsubDraw = OBR.broadcast.onMessage(
      `${EXTENSION_ID}/cardDrawn`,
      (event) => {
        setRedrawing(false);
        clearTimeout(redrawTimer.current);
        setDrawKey((k) => k + 1);
        setLastDraw(event.data);
      }
    );

    const unsubResolve = OBR.broadcast.onMessage(
      `${EXTENSION_ID}/cardResolved`,
      () => {
        setRedrawing(false);
        clearTimeout(redrawTimer.current);
        setLastDraw(null);
      }
    );

    return () => {
      unsubDraw();
      unsubResolve();
      unsubMeta?.();
      clearTimeout(redrawTimer.current);
    };
  }, []);

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
        {!lastDraw && (
          <>
            <CardBack size={140} />
            <p className="player-waiting-text">Awaiting the next draw...</p>
          </>
        )}
        {lastDraw && (
          <>
            <div className="player-draw-label">
              {lastDraw.playerName}'s draw:
            </div>
            <div className={`${redrawing ? "card-redraw-out" : ""}${skipReason ? " card-skipping" : ""}`} style={{ position: "relative" }}>
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
            {lastDraw.d10Result != null && !skipReason && (
              <ResultBreakdown
                key={`rb-${drawKey}`}
                roll={lastDraw.d10Result}
                card={lastDraw.card}
                isRedraw={redrawsUsed > 0}
                statModifier={lastDraw.statModifier}
                redrawBonuses={redrawBonuses}
              />
            )}
            {proficiency > 0 && !skipReason && (
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
