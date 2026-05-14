import React, { useState, useEffect, useRef } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { EXTENSION_ID, META } from "../lib/constants.js";
import { CardFace, CardBack } from "./CardArt.jsx";
import { ResultBreakdown } from "./ResultBreakdown.jsx";

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
            <div className={redrawing ? "card-redraw-out" : ""}>
              <CardFace key={drawKey} card={lastDraw.card} size={200} animating={true} />
            </div>
            {lastDraw.d10Result != null && (
              <ResultBreakdown
                key={`rb-${drawKey}`}
                roll={lastDraw.d10Result}
                card={lastDraw.card}
                isRedraw={redrawsUsed > 0}
              />
            )}
            {proficiency > 0 && (
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
