import React, { useState, useEffect } from "react";
import { useOBR, useRoomMetadata } from "./hooks/useOBR.js";
import { CardDraw } from "./components/CardDraw.jsx";
import { DeckEditor } from "./components/DeckEditor.jsx";
import { PlayerView } from "./components/PlayerView.jsx";
import { PlayerDeckEditor } from "./components/PlayerDeckEditor.jsx";
import { CardPreview } from "./components/CardPreview.jsx";

export default function App() {
  const { ready, isGM, playerId, playerName, partyMembers, theme } = useOBR();
  const {
    deckTemplate,
    playerConfigs,
    settings,
    saveDeckTemplate,
    savePlayerConfigs,
    saveSettings,
  } = useRoomMetadata();

  const [view, setView] = useState("draw");
  const [playerView, setPlayerView] = useState("waiting");
  const [showPreview, setShowPreview] = useState(false);

  // If OBR doesn't connect within 2s, show standalone card preview
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!ready) setShowPreview(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [ready]);

  if (!ready && !showPreview) {
    return (
      <div className="app loading">
        <div className="loading-spinner" />
        <p>Connecting to Owlbear Rodeo...</p>
      </div>
    );
  }

  // Standalone preview mode (no OBR)
  if (!ready && showPreview) {
    return <CardPreview />;
  }

  // Player view
  if (!isGM) {
    return (
      <div className="app" data-theme={theme?.mode || "DARK"}>
        <div className="app-header">
          <h1 className="app-title">Deck of Fates</h1>
          <div className="header-actions">
            <button
              className="btn-icon"
              onClick={() => setPlayerView(playerView === "editor" ? "waiting" : "editor")}
              title="Edit My Deck"
            >
              ⚙
            </button>
          </div>
        </div>
        {playerView === "waiting" && <PlayerView settings={settings} />}
        {playerView === "editor" && (
          <PlayerDeckEditor
            playerId={playerId}
            playerName={playerName}
            deckTemplate={deckTemplate}
            playerConfig={playerConfigs[playerId] || { classCards: [], proficiency: 0 }}
            onSave={(cfg) => savePlayerConfigs({ ...playerConfigs, [playerId]: cfg })}
            onBack={() => setPlayerView("waiting")}
          />
        )}
      </div>
    );
  }

  // GM views
  return (
    <div className="app" data-theme={theme?.mode || "DARK"}>
      <div className="app-header">
        <h1 className="app-title">Deck of Fates</h1>
        <div className="header-actions">
          {view === "draw" && (
            <>
              <button
                className="btn-icon"
                onClick={() => setView("editor")}
                title="Edit Deck"
              >
                ⚙
              </button>
              <button
                className={`btn-icon btn-visibility ${settings.visibility === "table" ? "active" : ""}`}
                onClick={() =>
                  saveSettings({
                    ...settings,
                    visibility: settings.visibility === "table" ? "dm-only" : "table",
                  })
                }
                title={settings.visibility === "table" ? "Visible to table" : "DM only"}
              >
                {settings.visibility === "table" ? "👁" : "🙈"}
              </button>
            </>
          )}
        </div>
      </div>

      {view === "draw" && (
        <div className={`visibility-bar ${settings.visibility}`}>
          {settings.visibility === "table"
            ? "Draws visible to all players"
            : "Draws hidden — DM only"}
        </div>
      )}

      {view === "draw" && (
        <CardDraw
          deckTemplate={deckTemplate}
          playerConfigs={playerConfigs}
          partyMembers={partyMembers}
          settings={settings}
          isGM={isGM}
        />
      )}

      {view === "editor" && (
        <DeckEditor
          deckTemplate={deckTemplate}
          playerConfigs={playerConfigs}
          partyMembers={partyMembers}
          onSaveTemplate={saveDeckTemplate}
          onSavePlayerConfigs={savePlayerConfigs}
          onBack={() => setView("draw")}
        />
      )}
    </div>
  );
}
