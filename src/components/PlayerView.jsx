import React, { useState, useEffect } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { EXTENSION_ID, META } from "../lib/constants.js";
import { CardFace, CardBack } from "./CardArt.jsx";

export function PlayerView({ settings }) {
  const [lastDraw, setLastDraw] = useState(null);
  const [drawKey, setDrawKey] = useState(0);

  useEffect(() => {
    if (!OBR.isAvailable) return;

    const unsubReady = OBR.onReady(async () => {
      // Load persisted draw so late joiners see the current card
      try {
        const meta = await OBR.room.getMetadata();
        const persisted = meta[META.CURRENT_DRAW];
        if (persisted) setLastDraw(persisted);
      } catch (e) {
        console.warn("[DeckOfFates] Failed to read current draw:", e);
      }
    });

    // Live updates via broadcast (triggers animation)
    const unsubDraw = OBR.broadcast.onMessage(
      `${EXTENSION_ID}/cardDrawn`,
      (event) => {
        setDrawKey((k) => k + 1);
        setLastDraw(event.data);
      }
    );

    const unsubResolve = OBR.broadcast.onMessage(
      `${EXTENSION_ID}/cardResolved`,
      () => {
        setLastDraw(null);
      }
    );

    // Metadata changes as fallback (e.g. player joins mid-draw, or broadcast missed)
    const unsubMeta = OBR.room.onMetadataChange((meta) => {
      const current = meta[META.CURRENT_DRAW];
      setLastDraw(current || null);
    });

    return () => {
      unsubReady();
      unsubDraw();
      unsubResolve();
      unsubMeta();
    };
  }, []);

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
            <CardFace key={drawKey} card={lastDraw.card} size={200} animating={true} />
          </>
        )}
      </div>
    </div>
  );
}
