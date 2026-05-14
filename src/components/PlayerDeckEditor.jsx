import React, { useState, useEffect, useRef } from "react";
import { CLASS_LIST } from "../lib/classThemes.js";
import { SKILL_CHECKS, ABILITY_SCORES, ABILITY_LABELS } from "../lib/constants.js";
import { getAbilityModifier } from "../lib/deck.js";

export function PlayerDeckEditor({ playerId, playerName, deckTemplate, playerConfig, onSave, onBack }) {
  const [config, setConfig] = useState({
    classCards: playerConfig?.classCards || [],
    proficiency: playerConfig?.proficiency || 0,
    excludedCards: playerConfig?.excludedCards || {},
    stats: playerConfig?.stats || {},
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!playerConfig) return;
    setConfig((prev) => {
      const incoming = {
        classCards: playerConfig.classCards || [],
        proficiency: playerConfig.proficiency || 0,
        excludedCards: playerConfig.excludedCards || {},
        stats: playerConfig.stats || {},
      };
      if (JSON.stringify(prev) === JSON.stringify(incoming)) return prev;
      return incoming;
    });
  }, [playerConfig]);

  const exc = config.excludedCards || {};
  const neutralCards = deckTemplate?.neutralCards || [];
  const statCount = deckTemplate?.statCount || 0;
  const encounterCards = deckTemplate?.encounterCards || [];
  const excludedNeuSet = new Set(exc.neutrals || []);
  const effectiveNeutrals = neutralCards.filter(function(_, i) { return !excludedNeuSet.has(i); }).length;
  const effectiveStats = Math.max(0, statCount - (exc.statExcludeCount || 0));
  const excludedEncSet = new Set(exc.encounters || []);
  const effectiveEncounters = encounterCards.filter(function(_, i) { return !excludedEncSet.has(i); }).length;
  const classCards = config.classCards || [];
  const totalCards = 2 + effectiveNeutrals + effectiveStats + effectiveEncounters + classCards.length;

  function save(updated) {
    setConfig(updated);
    if (typeof onSave === "function") onSave(updated);
  }

  function updateExclusion(key, value) {
    save({
      ...config,
      excludedCards: { ...exc, [key]: value },
    });
  }

  function toggleNeutralExclusion(idx) {
    const current = new Set(exc.neutrals || []);
    if (current.has(idx)) current.delete(idx);
    else current.add(idx);
    updateExclusion("neutrals", Array.from(current));
  }

  function toggleEncounterExclusion(idx) {
    const current = new Set(exc.encounters || []);
    if (current.has(idx)) current.delete(idx);
    else current.add(idx);
    updateExclusion("encounters", Array.from(current));
  }

  function updateProficiency(value) {
    save({ ...config, proficiency: Math.max(0, value) });
  }

  function updateStat(stat, value) {
    const stats = { ...(config.stats || {}) };
    stats[stat] = Math.max(1, Math.min(30, value));
    save({ ...config, stats });
  }

  function addClassCard() {
    save({
      ...config,
      classCards: [].concat(classCards, [{
        name: "New Class Card",
        modifier: 1,
        description: "Describe...",
        classTheme: CLASS_LIST[0].id,
      }]),
    });
  }

  function updateClassCard(idx, field, value) {
    var cards = classCards.slice();
    cards[idx] = Object.assign({}, cards[idx], { [field]: (field === "modifier" || field === "redrawModifier") ? Number(value) : value });
    if (field === "redrawModifier" && (value === "" || value === undefined)) {
      delete cards[idx].redrawModifier;
      delete cards[idx].redrawDescription;
    }
    if (field === "redrawDescription" && !value) delete cards[idx].redrawDescription;
    if (field === "checkType" && !value) delete cards[idx].checkType;
    save({ ...config, classCards: cards });
  }

  function removeClassCard(idx) {
    var cards = classCards.slice();
    cards.splice(idx, 1);
    save({ ...config, classCards: cards });
  }

  function exportConfig() {
    var data = {
      version: 1,
      playerName: playerName,
      classCards: config.classCards || [],
      excludedCards: config.excludedCards || {},
      proficiency: config.proficiency || 0,
      exportedAt: new Date().toISOString(),
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "deck-of-fates-" + (playerName || "player").toLowerCase().replace(/\s+/g, "-") + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var data = JSON.parse(ev.target.result);
        if (!data.classCards || !Array.isArray(data.classCards)) {
          alert("Invalid deck file.");
          return;
        }
        save({
          ...config,
          classCards: [].concat(classCards, data.classCards),
        });
      } catch (err) {
        alert("Failed to parse deck file.");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  function handleBack() {
    if (typeof onBack === "function") onBack();
  }

  return (
    <div className="editor-panel">
      <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImportFile} />

      <div className="editor-header">
        <button className="btn-ghost" onClick={handleBack}>← Back</button>
        <h2>My Deck</h2>
      </div>

      <div className="deck-summary">
        Your deck: <strong>{totalCards}</strong> cards
      </div>

      <div className="field-row" style={{ marginBottom: 8 }}>
        <label>Proficiency (redraws)</label>
        <div className="stepper">
          <button onClick={function() { updateProficiency((config.proficiency || 0) - 1); }}>−</button>
          <span>{config.proficiency || 0}</span>
          <button onClick={function() { updateProficiency((config.proficiency || 0) + 1); }}>+</button>
        </div>
      </div>

      <div className="subsection-header">
        <span>Ability Scores</span>
      </div>
      <div className="editor-section" style={{ paddingTop: 8, paddingBottom: 8 }}>
        {ABILITY_SCORES.map(function(stat) {
          var score = config.stats && config.stats[stat] || 10;
          var mod = getAbilityModifier(score);
          var modStr = mod >= 0 ? "+" + mod : "" + mod;
          return (
            <div key={stat} className="field-row" style={{ marginBottom: 2 }}>
              <label style={{ fontSize: 11 }}>{ABILITY_LABELS[stat]}</label>
              <div className="stepper">
                <button onClick={function() { updateStat(stat, score - 1); }}>−</button>
                <span style={{ fontSize: 11 }}>{score} <span style={{ color: "#9a9688", fontSize: 10 }}>({modStr})</span></span>
                <button onClick={function() { updateStat(stat, score + 1); }}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="subsection-header">
        <span>Base Deck</span>
      </div>

      <div className="editor-section">
        <div className="field-row" style={{ opacity: 0.5 }}>
          <label>Critical Cards</label>
          <span style={{ fontSize: 11, color: "#9a9688" }}>2 (locked)</span>
        </div>

        {neutralCards.length > 0 && (
          <React.Fragment>
            <div className="subsection-header" style={{ marginTop: 8 }}>
              <span>Neutral Cards</span>
            </div>
            {neutralCards.map(function(neu, idx) {
              var excluded = excludedNeuSet.has(idx);
              return (
                <div key={idx} className="field-row" style={{ alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: excluded ? "#5e5c54" : "#d4c9a8", textDecoration: excluded ? "line-through" : "none" }}>
                      {neu.name} ({neu.modifier >= 0 ? "+" : ""}{neu.modifier})
                    </div>
                    <div style={{ fontSize: 10, color: "#6e6c64", fontStyle: "italic" }}>{neu.description}</div>
                  </div>
                  <button
                    className={"btn-tiny" + (excluded ? " btn-tiny-danger" : "")}
                    onClick={function() { toggleNeutralExclusion(idx); }}
                    style={{ minWidth: 50 }}
                  >
                    {excluded ? "Off" : "On"}
                  </button>
                </div>
              );
            })}
          </React.Fragment>
        )}

        <div className="field-row">
          <label>Stat Cards</label>
          <div className="stepper">
            <button onClick={function() { updateExclusion("statExcludeCount", Math.min(statCount, (exc.statExcludeCount || 0) + 1)); }} disabled={effectiveStats <= 0}>−</button>
            <span>{effectiveStats} / {statCount}</span>
            <button onClick={function() { updateExclusion("statExcludeCount", Math.max(0, (exc.statExcludeCount || 0) - 1)); }} disabled={(exc.statExcludeCount || 0) <= 0}>+</button>
          </div>
        </div>

        {encounterCards.length > 0 && (
          <React.Fragment>
            <div className="subsection-header" style={{ marginTop: 8 }}>
              <span>Encounter Cards</span>
            </div>
            {encounterCards.map(function(enc, idx) {
              var excluded = excludedEncSet.has(idx);
              return (
                <div key={idx} className="field-row" style={{ alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: excluded ? "#5e5c54" : "#d4c9a8", textDecoration: excluded ? "line-through" : "none" }}>
                      {enc.name} ({enc.modifier >= 0 ? "+" : ""}{enc.modifier})
                    </div>
                    <div style={{ fontSize: 10, color: "#6e6c64", fontStyle: "italic" }}>{enc.description}</div>
                  </div>
                  <button
                    className={"btn-tiny" + (excluded ? " btn-tiny-danger" : "")}
                    onClick={function() { toggleEncounterExclusion(idx); }}
                    style={{ minWidth: 50 }}
                  >
                    {excluded ? "Off" : "On"}
                  </button>
                </div>
              );
            })}
          </React.Fragment>
        )}
      </div>

      <div className="subsection-header" style={{ marginTop: 12 }}>
        <span>Class Cards</span>
        <button className="btn-small" onClick={addClassCard}>+ Add</button>
      </div>

      <div className="player-actions-row">
        <button className="btn-tiny" onClick={exportConfig} title="Export deck as JSON">↓ Export</button>
        <button className="btn-tiny" onClick={function() { if (fileInputRef.current) fileInputRef.current.click(); }} title="Import cards from JSON">↑ Import</button>
        {classCards.length > 0 && (
          <button className="btn-tiny btn-tiny-danger" onClick={function() { save({ ...config, classCards: [] }); }} title="Remove all class cards">✕ Clear</button>
        )}
      </div>

      <div className="editor-section">
        {classCards.length === 0 && (
          <div className="empty-hint">No class cards yet</div>
        )}
        {classCards.map(function(cls, idx) {
          return (
            <div key={idx} className="card-edit-block">
              <div className="card-edit-row">
                <select
                  value={cls.classTheme || ""}
                  onChange={function(e) { updateClassCard(idx, "classTheme", e.target.value); }}
                  className="input-class-select"
                  title="Class theme"
                >
                  <option value="" disabled>Class...</option>
                  {CLASS_LIST.map(function(c) {
                    return <option key={c.id} value={c.id}>{c.label}</option>;
                  })}
                </select>
                <button className="btn-remove" onClick={function() { removeClassCard(idx); }}>✕</button>
              </div>
              <div className="card-edit-row">
                <input type="text" value={cls.name} onChange={function(e) { updateClassCard(idx, "name", e.target.value); }} placeholder="Card name" className="input-name" />
                <input type="number" value={cls.modifier} onChange={function(e) { updateClassCard(idx, "modifier", e.target.value); }} className="input-modifier" />
              </div>
              <textarea value={cls.description} onChange={function(e) { updateClassCard(idx, "description", e.target.value); }} placeholder="Flavor text / bonus effects..." className="input-description" rows={2} />
              <div className="card-edit-row" style={{ gap: 8, alignItems: "center" }}>
                <select
                  value={cls.checkType || ""}
                  onChange={function(e) { updateClassCard(idx, "checkType", e.target.value); }}
                  className="input-class-select"
                  style={{ flex: 1 }}
                  title="Skill check type"
                >
                  <option value="">No check type</option>
                  {SKILL_CHECKS.map(function(sk) {
                    return <option key={sk} value={sk}>{sk}</option>;
                  })}
                </select>
                <input
                  type="number"
                  value={cls.redrawModifier != null ? cls.redrawModifier : ""}
                  onChange={function(e) { updateClassCard(idx, "redrawModifier", e.target.value); }}
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
                  onChange={function(e) { updateClassCard(idx, "redrawDescription", e.target.value); }}
                  placeholder="Redraw effect description (shown on hover)..."
                  className="input-name"
                  style={{ fontSize: 11 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
