import React, { useState, useRef } from "react";
import { CLASS_LIST } from "../lib/classThemes.js";
import { SKILL_CHECKS, ABILITY_SCORES, ABILITY_LABELS } from "../lib/constants.js";
import { getAbilityModifier } from "../lib/deck.js";

export function DeckEditor({ deckTemplate, playerConfigs, partyMembers, onSaveTemplate, onSavePlayerConfigs, onBack }) {
  const [tab, setTab] = useState("base");
  const [template, setTemplate] = useState({ ...deckTemplate });
  const [configs, setConfigs] = useState({ ...playerConfigs });
  const fileInputRef = useRef(null);
  const [expandedPlayers, setExpandedPlayers] = useState({});

  const togglePlayer = (id) => {
    setExpandedPlayers((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const [importTarget, setImportTarget] = useState(null);

  // --- Base Template ---

  const updateTemplate = (key, value) => {
    const updated = { ...template, [key]: value };
    setTemplate(updated);
    onSaveTemplate(updated);
  };

  const addNeutralCard = () => {
    const neu = [...(template.neutralCards || [])];
    neu.push({ name: "Neutral", modifier: 0, description: "No twist of fate." });
    updateTemplate("neutralCards", neu);
  };

  const updateNeutralCard = (idx, field, value) => {
    const neu = [...(template.neutralCards || [])];
    neu[idx] = { ...neu[idx], [field]: field === "modifier" ? Number(value) : value };
    updateTemplate("neutralCards", neu);
  };

  const removeNeutralCard = (idx) => {
    const neu = [...(template.neutralCards || [])];
    neu.splice(idx, 1);
    const updatedTemplate = { ...template, neutralCards: neu };
    setTemplate(updatedTemplate);
    const updatedConfigs = { ...configs };
    for (const [pid, cfg] of Object.entries(updatedConfigs)) {
      const excNeu = cfg.excludedCards?.neutrals;
      if (!excNeu?.length) continue;
      updatedConfigs[pid] = {
        ...cfg,
        excludedCards: {
          ...cfg.excludedCards,
          neutrals: excNeu
            .filter((i) => i !== idx)
            .map((i) => (i > idx ? i - 1 : i)),
        },
      };
    }
    setConfigs(updatedConfigs);
    onSaveTemplate(updatedTemplate);
    onSavePlayerConfigs(updatedConfigs);
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
    const updatedTemplate = { ...template, encounterCards: enc };
    setTemplate(updatedTemplate);
    // Reindex player encounter exclusions
    const updatedConfigs = { ...configs };
    for (const [pid, cfg] of Object.entries(updatedConfigs)) {
      const excEnc = cfg.excludedCards?.encounters;
      if (!excEnc?.length) continue;
      updatedConfigs[pid] = {
        ...cfg,
        excludedCards: {
          ...cfg.excludedCards,
          encounters: excEnc
            .filter((i) => i !== idx)
            .map((i) => (i > idx ? i - 1 : i)),
        },
      };
    }
    setConfigs(updatedConfigs);
    onSaveTemplate(updatedTemplate);
    onSavePlayerConfigs(updatedConfigs);
  };

  // --- Player Class Cards ---

  const getPlayerConfig = (id) => configs[id] || { classCards: [], proficiency: 0, excludedCards: {} };

  const updateExclusion = (playerId, key, value) => {
    const cfg = getPlayerConfig(playerId);
    const updated = {
      ...configs,
      [playerId]: {
        ...cfg,
        excludedCards: { ...(cfg.excludedCards || {}), [key]: value },
      },
    };
    setConfigs(updated);
    onSavePlayerConfigs(updated);
  };

  const toggleNeutralExclusion = (playerId, idx) => {
    const cfg = getPlayerConfig(playerId);
    const current = new Set(cfg.excludedCards?.neutrals || []);
    if (current.has(idx)) current.delete(idx);
    else current.add(idx);
    updateExclusion(playerId, "neutrals", [...current]);
  };

  const toggleEncounterExclusion = (playerId, idx) => {
    const cfg = getPlayerConfig(playerId);
    const current = new Set(cfg.excludedCards?.encounters || []);
    if (current.has(idx)) current.delete(idx);
    else current.add(idx);
    updateExclusion(playerId, "encounters", [...current]);
  };

  const resetExclusions = (playerId) => {
    const cfg = getPlayerConfig(playerId);
    const updated = {
      ...configs,
      [playerId]: { ...cfg, excludedCards: {} },
    };
    setConfigs(updated);
    onSavePlayerConfigs(updated);
  };

  const updateProficiency = (playerId, value) => {
    const cfg = getPlayerConfig(playerId);
    const updated = { ...configs, [playerId]: { ...cfg, proficiency: Math.max(0, value) } };
    setConfigs(updated);
    onSavePlayerConfigs(updated);
  };

  const updateStat = (playerId, stat, value) => {
    const cfg = getPlayerConfig(playerId);
    const stats = { ...(cfg.stats || {}) };
    stats[stat] = Math.max(1, Math.min(30, value));
    const updated = { ...configs, [playerId]: { ...cfg, stats } };
    setConfigs(updated);
    onSavePlayerConfigs(updated);
  };

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

  const totalCards = 2 + (template.neutralCards || []).length + (template.statCount || 0) + (template.encounterCards || []).length;

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
          Player Decks
        </button>
      </div>

      {/* ── Base Deck Tab ── */}
      {tab === "base" && (
        <div className="editor-section">
          <div className="deck-summary">
            Base deck: <strong>{totalCards}</strong> cards
            <span className="deck-breakdown">
              (2 crit + {(template.neutralCards || []).length} neutral + {template.statCount} stat + {(template.encounterCards || []).length} encounter)
            </span>
          </div>

          <div className="subsection-header">
            <span>Neutral Cards</span>
            <button className="btn-small" onClick={addNeutralCard}>+ Add</button>
          </div>

          {(template.neutralCards || []).map((neu, idx) => (
            <div key={idx} className="card-edit-block">
              <div className="card-edit-row">
                <input type="text" value={neu.name} onChange={(e) => updateNeutralCard(idx, "name", e.target.value)} placeholder="Card name" className="input-name" />
                <input type="number" value={neu.modifier} onChange={(e) => updateNeutralCard(idx, "modifier", e.target.value)} className="input-modifier" />
                <button className="btn-remove" onClick={() => removeNeutralCard(idx)}>✕</button>
              </div>
              <textarea value={neu.description} onChange={(e) => updateNeutralCard(idx, "description", e.target.value)} placeholder="Neutral description..." className="input-description" rows={2} />
            </div>
          ))}

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
            const expanded = expandedPlayers[member.id] ?? false;
            const cardCount = cfg.classCards.length;
            return (
              <div key={member.id} className="player-config-block">
                <div className="player-config-header" onClick={() => togglePlayer(member.id)} style={{ cursor: "pointer" }}>
                  <span className="player-collapse-icon">{expanded ? "▾" : "▸"}</span>
                  <div className="player-dot" style={{ background: member.color }} />
                  <span className="player-name">{member.name}</span>
                  <span style={{ fontSize: 10, color: "#6e6c64", marginLeft: "auto" }}>
                    {cardCount} card{cardCount !== 1 ? "s" : ""} · Prof {cfg.proficiency || 0}
                  </span>
                </div>

                {!expanded ? null : <>
                <div className="field-row" style={{ marginTop: 4, marginBottom: 4, justifyContent: "flex-end" }}>
                  <button className="btn-small" onClick={() => addClassCard(member.id)}>+ Card</button>
                </div>
                <div className="field-row" style={{ marginBottom: 4 }}>
                  <label style={{ fontSize: 11 }}>Proficiency (redraws)</label>
                  <div className="stepper">
                    <button onClick={() => updateProficiency(member.id, (cfg.proficiency || 0) - 1)}>−</button>
                    <span>{cfg.proficiency || 0}</span>
                    <button onClick={() => updateProficiency(member.id, (cfg.proficiency || 0) + 1)}>+</button>
                  </div>
                </div>

                {/* Ability Scores */}
                <div style={{ marginBottom: 6, padding: "4px 0", borderBottom: "1px solid #2a2a3a" }}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: "#5e5c54", letterSpacing: 1, textTransform: "uppercase" }}>Ability Scores</span>
                  </div>
                  {ABILITY_SCORES.map((stat) => {
                    const score = cfg.stats?.[stat] || 10;
                    const mod = getAbilityModifier(score);
                    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                    return (
                      <div key={stat} className="field-row" style={{ marginBottom: 2 }}>
                        <label style={{ fontSize: 11 }}>{ABILITY_LABELS[stat]}</label>
                        <div className="stepper">
                          <button onClick={() => updateStat(member.id, stat, score - 1)}>−</button>
                          <span style={{ fontSize: 11 }}>{score} <span style={{ color: "#9a9688", fontSize: 10 }}>({modStr})</span></span>
                          <button onClick={() => updateStat(member.id, stat, score + 1)}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Deck exclusions */}
                {(() => {
                  const exc = cfg.excludedCards || {};
                  const effStats = Math.max(0, (template.statCount || 0) - (exc.statExcludeCount || 0));
                  const hasExclusions = (exc.neutrals || []).length > 0 || (exc.statExcludeCount || 0) > 0 || (exc.encounters || []).length > 0;
                  return (
                    <div style={{ marginBottom: 6, padding: "4px 0", borderBottom: "1px solid #2a2a3a" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: "#5e5c54", letterSpacing: 1, textTransform: "uppercase" }}>Base Deck Overrides</span>
                        {hasExclusions && (
                          <button className="btn-tiny" onClick={() => resetExclusions(member.id)} title="Reset to full base deck">Reset</button>
                        )}
                      </div>
                      <div className="field-row" style={{ marginBottom: 2 }}>
                        <label style={{ fontSize: 11 }}>Stats</label>
                        <div className="stepper">
                          <button onClick={() => updateExclusion(member.id, "statExcludeCount", Math.min(template.statCount || 0, (exc.statExcludeCount || 0) + 1))} disabled={effStats <= 0}>−</button>
                          <span style={{ fontSize: 11 }}>{effStats}/{template.statCount || 0}</span>
                          <button onClick={() => updateExclusion(member.id, "statExcludeCount", Math.max(0, (exc.statExcludeCount || 0) - 1))} disabled={(exc.statExcludeCount || 0) <= 0}>+</button>
                        </div>
                      </div>
                      {(template.neutralCards || []).map((neu, idx) => {
                        const excluded = (exc.neutrals || []).includes(idx);
                        return (
                          <div key={idx} className="field-row" style={{ marginBottom: 1 }}>
                            <label style={{ fontSize: 11, color: excluded ? "#5e5c54" : "#d4c9a8", textDecoration: excluded ? "line-through" : "none" }}>
                              {neu.name} ({neu.modifier >= 0 ? "+" : ""}{neu.modifier})
                            </label>
                            <button className={`btn-tiny ${excluded ? "btn-tiny-danger" : ""}`} onClick={() => toggleNeutralExclusion(member.id, idx)} style={{ minWidth: 36 }}>
                              {excluded ? "Off" : "On"}
                            </button>
                          </div>
                        );
                      })}
                      {(template.encounterCards || []).map((enc, idx) => {
                        const excluded = (exc.encounters || []).includes(idx);
                        return (
                          <div key={idx} className="field-row" style={{ marginBottom: 1 }}>
                            <label style={{ fontSize: 11, color: excluded ? "#5e5c54" : "#d4c9a8", textDecoration: excluded ? "line-through" : "none" }}>
                              {enc.name} ({enc.modifier >= 0 ? "+" : ""}{enc.modifier})
                            </label>
                            <button className={`btn-tiny ${excluded ? "btn-tiny-danger" : ""}`} onClick={() => toggleEncounterExclusion(member.id, idx)} style={{ minWidth: 36 }}>
                              {excluded ? "Off" : "On"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

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
                </>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
