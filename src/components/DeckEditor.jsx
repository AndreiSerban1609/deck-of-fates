import React, { useState, useRef } from "react";
import { CLASS_LIST } from "../lib/classThemes.js";
import { SKILL_CHECKS } from "../lib/constants.js";

export function DeckEditor({ deckTemplate, playerConfigs, partyMembers, onSaveTemplate, onSavePlayerConfigs, onBack }) {
  const [tab, setTab] = useState("base");
  const [template, setTemplate] = useState({ ...deckTemplate });
  const [configs, setConfigs] = useState({ ...playerConfigs });
  const fileInputRef = useRef(null);
  const [importTarget, setImportTarget] = useState(null);

  // --- Base Template ---

  const updateTemplate = (key, value) => {
    const updated = { ...template, [key]: value };
    setTemplate(updated);
    onSaveTemplate(updated);
  };

  const addEncounterCard = () => {
    const enc = [...(template.encounterCards || [])];
    enc.push({ name: "New Encounter", modifier: -1, description: "Describe the encounter..." });
    updateTemplate("encounterCards", enc);
  };

  const updateEncounterCard = (idx, field, value) => {
    const enc = [...(template.encounterCards || [])];
    enc[idx] = { ...enc[idx], [field]: field === "modifier" ? Number(value) : value };
    updateTemplate("encounterCards", enc);
  };

  const removeEncounterCard = (idx) => {
    const enc = [...(template.encounterCards || [])];
    enc.splice(idx, 1);
    updateTemplate("encounterCards", enc);
  };

  // --- Player Class Cards ---

  const getPlayerConfig = (id) => configs[id] || { classCards: [] };

  const addClassCard = (playerId) => {
    const cfg = getPlayerConfig(playerId);
    const updated = {
      ...configs,
      [playerId]: {
        ...cfg,
        classCards: [...cfg.classCards, {
          name: "New Class Card",
          modifier: 1,
          description: "Describe...",
          classTheme: CLASS_LIST[0].id,
        }],
      },
    };
    setConfigs(updated);
    onSavePlayerConfigs(updated);
  };

  const updateClassCard = (playerId, idx, field, value) => {
    const cfg = getPlayerConfig(playerId);
    const cards = [...cfg.classCards];
    cards[idx] = { ...cards[idx], [field]: (field === "modifier" || field === "redrawModifier") ? Number(value) : value };
    if (field === "redrawModifier" && (value === "" || value === undefined)) {
      delete cards[idx].redrawModifier;
      delete cards[idx].redrawDescription;
    }
    if (field === "redrawDescription" && !value) delete cards[idx].redrawDescription;
    if (field === "checkType" && !value) delete cards[idx].checkType;
    const updated = { ...configs, [playerId]: { ...cfg, classCards: cards } };
    setConfigs(updated);
    onSavePlayerConfigs(updated);
  };

  const removeClassCard = (playerId, idx) => {
    const cfg = getPlayerConfig(playerId);
    const cards = [...cfg.classCards];
    cards.splice(idx, 1);
    const updated = { ...configs, [playerId]: { ...cfg, classCards: cards } };
    setConfigs(updated);
    onSavePlayerConfigs(updated);
  };

  // --- Export / Import ---

  const exportPlayerConfig = (playerId, playerName) => {
    const cfg = getPlayerConfig(playerId);
    const data = {
      version: 1,
      playerName,
      classCards: cfg.classCards,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deck-of-fates-${playerName.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerImport = (playerId) => {
    setImportTarget(playerId);
    fileInputRef.current?.click();
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !importTarget) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.classCards || !Array.isArray(data.classCards)) {
          alert("Invalid deck file — missing classCards array.");
          return;
        }
        const cfg = getPlayerConfig(importTarget);
        const updated = {
          ...configs,
          [importTarget]: {
            ...cfg,
            classCards: [...cfg.classCards, ...data.classCards],
          },
        };
        setConfigs(updated);
        onSavePlayerConfigs(updated);
      } catch (err) {
        alert("Failed to parse deck file.");
      }
      // Reset
      setImportTarget(null);
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const clearPlayerCards = (playerId) => {
    const updated = { ...configs, [playerId]: { classCards: [] } };
    setConfigs(updated);
    onSavePlayerConfigs(updated);
  };

  const totalCards = 2 + (template.neutralCount || 0) + (template.statCount || 0) + (template.encounterCards || []).length;

  return (
    <div className="editor-panel">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleImportFile}
      />

      <div className="editor-header">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <h2>Deck Editor</h2>
      </div>

      <div className="tab-row">
        <button className={`tab-btn ${tab === "base" ? "active" : ""}`} onClick={() => setTab("base")}>
          Base Deck
        </button>
        <button className={`tab-btn ${tab === "players" ? "active" : ""}`} onClick={() => setTab("players")}>
          Class Cards
        </button>
      </div>

      {/* ── Base Deck Tab ── */}
      {tab === "base" && (
        <div className="editor-section">
          <div className="deck-summary">
            Base deck: <strong>{totalCards}</strong> cards
            <span className="deck-breakdown">
              (2 crit + {template.neutralCount} neutral + {template.statCount} stat + {(template.encounterCards || []).length} encounter)
            </span>
          </div>

          <div className="field-row">
            <label>Neutral Cards (±0)</label>
            <div className="stepper">
              <button onClick={() => updateTemplate("neutralCount", Math.max(0, (template.neutralCount || 0) - 1))}>−</button>
              <span>{template.neutralCount || 0}</span>
              <button onClick={() => updateTemplate("neutralCount", (template.neutralCount || 0) + 1)}>+</button>
            </div>
          </div>

          <div className="field-row">
            <label>Stat Cards</label>
            <div className="stepper">
              <button onClick={() => updateTemplate("statCount", Math.max(0, (template.statCount || 0) - 1))}>−</button>
              <span>{template.statCount || 0}</span>
              <button onClick={() => updateTemplate("statCount", (template.statCount || 0) + 1)}>+</button>
            </div>
          </div>

          <div className="subsection-header">
            <span>Encounter Cards</span>
            <button className="btn-small" onClick={addEncounterCard}>+ Add</button>
          </div>

          {(template.encounterCards || []).map((enc, idx) => (
            <div key={idx} className="card-edit-block">
              <div className="card-edit-row">
                <input type="text" value={enc.name} onChange={(e) => updateEncounterCard(idx, "name", e.target.value)} placeholder="Card name" className="input-name" />
                <input type="number" value={enc.modifier} onChange={(e) => updateEncounterCard(idx, "modifier", e.target.value)} className="input-modifier" />
                <button className="btn-remove" onClick={() => removeEncounterCard(idx)}>✕</button>
              </div>
              <textarea value={enc.description} onChange={(e) => updateEncounterCard(idx, "description", e.target.value)} placeholder="Encounter description..." className="input-description" rows={2} />
            </div>
          ))}
        </div>
      )}

      {/* ── Class Cards Tab ── */}
      {tab === "players" && (
        <div className="editor-section">
          {partyMembers.length === 0 && (
            <div className="empty-state">No players connected. Class cards will appear when players join the room.</div>
          )}
          {partyMembers.map((member) => {
            const cfg = getPlayerConfig(member.id);
            return (
              <div key={member.id} className="player-config-block">
                <div className="player-config-header">
                  <div className="player-dot" style={{ background: member.color }} />
                  <span className="player-name">{member.name}</span>
                  <button className="btn-small" onClick={() => addClassCard(member.id)}>+ Card</button>
                </div>

                {/* Export / Import / Clear row */}
                <div className="player-actions-row">
                  <button className="btn-tiny" onClick={() => exportPlayerConfig(member.id, member.name)} title="Export cards as JSON">
                    ↓ Export
                  </button>
                  <button className="btn-tiny" onClick={() => triggerImport(member.id)} title="Import cards from JSON (appends)">
                    ↑ Import
                  </button>
                  {cfg.classCards.length > 0 && (
                    <button className="btn-tiny btn-tiny-danger" onClick={() => clearPlayerCards(member.id)} title="Remove all class cards">
                      ✕ Clear
                    </button>
                  )}
                </div>

                {cfg.classCards.length === 0 && (
                  <div className="empty-hint">No class cards — using base deck only</div>
                )}
                {cfg.classCards.map((cls, idx) => (
                  <div key={idx} className="card-edit-block">
                    <div className="card-edit-row">
                      <select
                        value={cls.classTheme || ""}
                        onChange={(e) => updateClassCard(member.id, idx, "classTheme", e.target.value)}
                        className="input-class-select"
                        title="Class theme"
                      >
                        <option value="" disabled>Class...</option>
                        {CLASS_LIST.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                      <button className="btn-remove" onClick={() => removeClassCard(member.id, idx)}>✕</button>
                    </div>
                    <div className="card-edit-row">
                      <input type="text" value={cls.name} onChange={(e) => updateClassCard(member.id, idx, "name", e.target.value)} placeholder="Card name" className="input-name" />
                      <input type="number" value={cls.modifier} onChange={(e) => updateClassCard(member.id, idx, "modifier", e.target.value)} className="input-modifier" />
                    </div>
                    <textarea value={cls.description} onChange={(e) => updateClassCard(member.id, idx, "description", e.target.value)} placeholder="Flavor text / bonus effects..." className="input-description" rows={2} />
                    <div className="card-edit-row" style={{ gap: 8, alignItems: "center" }}>
                      <select
                        value={cls.checkType || ""}
                        onChange={(e) => updateClassCard(member.id, idx, "checkType", e.target.value)}
                        className="input-class-select"
                        style={{ flex: 1 }}
                        title="Skill check type"
                      >
                        <option value="">No check type</option>
                        {SKILL_CHECKS.map((sk) => (
                          <option key={sk} value={sk}>{sk}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={cls.redrawModifier ?? ""}
                        onChange={(e) => updateClassCard(member.id, idx, "redrawModifier", e.target.value)}
                        placeholder="↻ mod"
                        className="input-modifier"
                        title="Redraw modifier (optional)"
                        style={{ width: 56 }}
                      />
                    </div>
                    {cls.redrawModifier != null && (
                      <input
                        type="text"
                        value={cls.redrawDescription || ""}
                        onChange={(e) => updateClassCard(member.id, idx, "redrawDescription", e.target.value)}
                        placeholder="Redraw effect description (shown on hover)..."
                        className="input-name"
                        style={{ fontSize: 11 }}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
