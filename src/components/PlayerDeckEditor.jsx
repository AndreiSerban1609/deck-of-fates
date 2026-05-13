import React, { useState, useRef } from "react";
import { CLASS_LIST } from "../lib/classThemes.js";
import { SKILL_CHECKS } from "../lib/constants.js";
import { getEffectiveDeckSize } from "../lib/deck.js";

export function PlayerDeckEditor({ playerId, playerName, deckTemplate, playerConfig, onSave, onBack }) {
  const [config, setConfig] = useState({ ...playerConfig });
  const fileInputRef = useRef(null);

  const exc = config.excludedCards || {};
  const effectiveNeutrals = Math.max(0, (deckTemplate.neutralCount || 0) - (exc.neutralExcludeCount || 0));
  const effectiveStats = Math.max(0, (deckTemplate.statCount || 0) - (exc.statExcludeCount || 0));
  const totalCards = getEffectiveDeckSize(deckTemplate, config);

  const save = (updated) => {
    setConfig(updated);
    onSave(updated);
  };

  // --- Exclusions ---

  const updateExclusion = (key, value) => {
    save({
      ...config,
      excludedCards: { ...exc, [key]: value },
    });
  };

  const toggleEncounterExclusion = (idx) => {
    const current = new Set(exc.encounters || []);
    if (current.has(idx)) current.delete(idx);
    else current.add(idx);
    updateExclusion("encounters", [...current]);
  };

  // --- Proficiency ---

  const updateProficiency = (value) => {
    save({ ...config, proficiency: Math.max(0, value) });
  };

  // --- Class Cards ---

  const classCards = config.classCards || [];

  const addClassCard = () => {
    save({
      ...config,
      classCards: [...classCards, {
        name: "New Class Card",
        modifier: 1,
        description: "Describe...",
        classTheme: CLASS_LIST[0].id,
      }],
    });
  };

  const updateClassCard = (idx, field, value) => {
    const cards = [...classCards];
    cards[idx] = { ...cards[idx], [field]: (field === "modifier" || field === "redrawModifier") ? Number(value) : value };
    if (field === "redrawModifier" && (value === "" || value === undefined)) {
      delete cards[idx].redrawModifier;
      delete cards[idx].redrawDescription;
    }
    if (field === "redrawDescription" && !value) delete cards[idx].redrawDescription;
    if (field === "checkType" && !value) delete cards[idx].checkType;
    save({ ...config, classCards: cards });
  };

  const removeClassCard = (idx) => {
    const cards = [...classCards];
    cards.splice(idx, 1);
    save({ ...config, classCards: cards });
  };

  // --- Export / Import ---

  const exportConfig = () => {
    const data = {
      version: 1,
      playerName,
      classCards: config.classCards || [],
      excludedCards: config.excludedCards || {},
      proficiency: config.proficiency || 0,
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

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.classCards || !Array.isArray(data.classCards)) {
          alert("Invalid deck file — missing classCards array.");
          return;
        }
        save({
          ...config,
          classCards: [...classCards, ...data.classCards],
          ...(data.excludedCards ? { excludedCards: data.excludedCards } : {}),
          ...(data.proficiency != null ? { proficiency: data.proficiency } : {}),
        });
      } catch (err) {
        alert("Failed to parse deck file.");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="editor-panel">
      <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImportFile} />

      <div className="editor-header">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <h2>My Deck</h2>
      </div>

      <div className="deck-summary">
        Your deck: <strong>{totalCards}</strong> cards
      </div>

      {/* ── Proficiency ── */}
      <div className="field-row" style={{ marginBottom: 8 }}>
        <label>Proficiency (redraws)</label>
        <div className="stepper">
          <button onClick={() => updateProficiency((config.proficiency || 0) - 1)}>−</button>
          <span>{config.proficiency || 0}</span>
          <button onClick={() => updateProficiency((config.proficiency || 0) + 1)}>+</button>
        </div>
      </div>

      {/* ── Base Deck Customization ── */}
      <div className="subsection-header">
        <span>Base Deck</span>
      </div>

      <div className="editor-section">
        {/* Crits — locked */}
        <div className="field-row" style={{ opacity: 0.5 }}>
          <label>Critical Cards</label>
          <span style={{ fontSize: 11, color: "#9a9688" }}>2 (locked)</span>
        </div>

        {/* Neutrals */}
        <div className="field-row">
          <label>Neutral Cards</label>
          <div className="stepper">
            <button onClick={() => updateExclusion("neutralExcludeCount", Math.min((deckTemplate.neutralCount || 0), (exc.neutralExcludeCount || 0) + 1))} disabled={effectiveNeutrals <= 0}>−</button>
            <span>{effectiveNeutrals} / {deckTemplate.neutralCount || 0}</span>
            <button onClick={() => updateExclusion("neutralExcludeCount", Math.max(0, (exc.neutralExcludeCount || 0) - 1))} disabled={(exc.neutralExcludeCount || 0) <= 0}>+</button>
          </div>
        </div>

        {/* Stats */}
        <div className="field-row">
          <label>Stat Cards</label>
          <div className="stepper">
            <button onClick={() => updateExclusion("statExcludeCount", Math.min((deckTemplate.statCount || 0), (exc.statExcludeCount || 0) + 1))} disabled={effectiveStats <= 0}>−</button>
            <span>{effectiveStats} / {deckTemplate.statCount || 0}</span>
            <button onClick={() => updateExclusion("statExcludeCount", Math.max(0, (exc.statExcludeCount || 0) - 1))} disabled={(exc.statExcludeCount || 0) <= 0}>+</button>
          </div>
        </div>

        {/* Encounters — individual toggles */}
        {(deckTemplate.encounterCards || []).length > 0 && (
          <>
            <div className="subsection-header" style={{ marginTop: 8 }}>
              <span>Encounter Cards</span>
            </div>
            {(deckTemplate.encounterCards || []).map((enc, idx) => {
              const excluded = (exc.encounters || []).includes(idx);
              return (
                <div key={idx} className="field-row" style={{ alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: excluded ? "#5e5c54" : "#d4c9a8", textDecoration: excluded ? "line-through" : "none" }}>
                      {enc.name} ({enc.modifier >= 0 ? "+" : ""}{enc.modifier})
                    </div>
                    <div style={{ fontSize: 10, color: "#6e6c64", fontStyle: "italic" }}>{enc.description}</div>
                  </div>
                  <button
                    className={`btn-tiny ${excluded ? "btn-tiny-danger" : ""}`}
                    onClick={() => toggleEncounterExclusion(idx)}
                    style={{ minWidth: 50 }}
                  >
                    {excluded ? "Off" : "On"}
                  </button>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* ── Class Cards ── */}
      <div className="subsection-header" style={{ marginTop: 12 }}>
        <span>Class Cards</span>
        <button className="btn-small" onClick={addClassCard}>+ Add</button>
      </div>

      <div className="player-actions-row">
        <button className="btn-tiny" onClick={exportConfig} title="Export deck as JSON">↓ Export</button>
        <button className="btn-tiny" onClick={() => fileInputRef.current?.click()} title="Import cards from JSON">↑ Import</button>
        {classCards.length > 0 && (
          <button className="btn-tiny btn-tiny-danger" onClick={() => save({ ...config, classCards: [] })} title="Remove all class cards">✕ Clear</button>
        )}
      </div>

      <div className="editor-section">
        {classCards.length === 0 && (
          <div className="empty-hint">No class cards yet</div>
        )}
        {classCards.map((cls, idx) => (
          <div key={idx} className="card-edit-block">
            <div className="card-edit-row">
              <select
                value={cls.classTheme || ""}
                onChange={(e) => updateClassCard(idx, "classTheme", e.target.value)}
                className="input-class-select"
                title="Class theme"
              >
                <option value="" disabled>Class...</option>
                {CLASS_LIST.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <button className="btn-remove" onClick={() => removeClassCard(idx)}>✕</button>
            </div>
            <div className="card-edit-row">
              <input type="text" value={cls.name} onChange={(e) => updateClassCard(idx, "name", e.target.value)} placeholder="Card name" className="input-name" />
              <input type="number" value={cls.modifier} onChange={(e) => updateClassCard(idx, "modifier", e.target.value)} className="input-modifier" />
            </div>
            <textarea value={cls.description} onChange={(e) => updateClassCard(idx, "description", e.target.value)} placeholder="Flavor text / bonus effects..." className="input-description" rows={2} />
            <div className="card-edit-row" style={{ gap: 8, alignItems: "center" }}>
              <select
                value={cls.checkType || ""}
                onChange={(e) => updateClassCard(idx, "checkType", e.target.value)}
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
                onChange={(e) => updateClassCard(idx, "redrawModifier", e.target.value)}
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
                onChange={(e) => updateClassCard(idx, "redrawDescription", e.target.value)}
                placeholder="Redraw effect description (shown on hover)..."
                className="input-name"
                style={{ fontSize: 11 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
