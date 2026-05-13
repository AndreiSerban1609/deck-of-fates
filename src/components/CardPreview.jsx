import React from "react";
import { CARD_TYPES } from "../lib/constants.js";
import { CardFace, CardBack, SkillIcon } from "./CardArt.jsx";

const SKILL_CHECKS = [
  "Lifting", "Athletics", "Thievery", "Reflex", "Stealth", "Knowledge",
  "Arcana", "Investigation", "Medicine", "Perception", "Survival",
  "Animal Handling", "Insight", "Religion", "Seduction", "Performance",
  "Persuasion", "Deception", "Intimidation",
];

const PREVIEW_CARDS = [
  // Base cards
  { type: CARD_TYPES.STEEL_CRITICAL, name: "Steel Critical", modifier: null },
  { type: CARD_TYPES.MIGHT_CRITICAL, name: "Might Critical", modifier: null },
  { type: CARD_TYPES.NEUTRAL, name: "Neutral", modifier: 0, description: "No twist of fate." },
  { type: CARD_TYPES.ENCOUNTER, name: "Stumble", modifier: -1, description: "You lose your footing at the worst moment." },
  { type: CARD_TYPES.STAT, name: "Stat", modifier: null, description: "Your ability shapes the outcome." },
  // Class cards
  { type: CARD_TYPES.CLASS, name: "Encore", modifier: 3, description: "The crowd roars — play it again.", classTheme: "musician" },
  { type: CARD_TYPES.CLASS, name: "Hand of God", modifier: 5, description: "Divine intervention guides your hand.", classTheme: "disciple" },
  { type: CARD_TYPES.CLASS, name: "Storm Call", modifier: 2, description: "Thunder answers your fury.", classTheme: "wildborn" },
  { type: CARD_TYPES.CLASS, name: "Berserker Rage", modifier: 4, description: "Pain fuels your strength.", classTheme: "warrior", checkType: "Athletics" },
  { type: CARD_TYPES.CLASS, name: "Inner Peace", modifier: 2, description: "Stillness becomes your weapon.", classTheme: "monk" },
  { type: CARD_TYPES.CLASS, name: "True Shot", modifier: 3, description: "The arrow finds its mark.", classTheme: "archer" },
  { type: CARD_TYPES.CLASS, name: "Shadow Step", modifier: 3, description: "Vanish into darkness.", classTheme: "rogue", checkType: "Stealth", redrawModifier: 3, redrawDescription: "Apply +3 modifier, then draw another card from the deck" },
  { type: CARD_TYPES.CLASS, name: "Patron's Price", modifier: -3, description: "Power demands its toll.", classTheme: "corruptor" },
  { type: CARD_TYPES.CLASS, name: "Arcane Surge", modifier: 4, description: "Raw magic bends to your will.", classTheme: "wizard" },
  { type: CARD_TYPES.CLASS, name: "Silver Ward", modifier: 2, description: "Runes flare against the unholy.", classTheme: "wraith_hunter" },
  { type: CARD_TYPES.CLASS, name: "Spellstrike", modifier: 3, description: "Steel and sorcery as one.", classTheme: "battlemage" },
];

export function CardPreview() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0e0e14",
      padding: "32px 24px",
      fontFamily: "'Cinzel', 'Palatino', serif",
    }}>
      <h1 style={{
        textAlign: "center",
        color: "#e0a040",
        fontSize: 20,
        letterSpacing: 4,
        textTransform: "uppercase",
        marginBottom: 8,
      }}>
        Deck of Fates — Card Preview
      </h1>
      <p style={{
        textAlign: "center",
        color: "#9a9688",
        fontSize: 13,
        marginBottom: 32,
        fontFamily: "'Crimson Text', Georgia, serif",
        fontStyle: "italic",
      }}>
        Standalone preview · Not connected to Owlbear Rodeo
      </p>

      {/* Card Back */}
      <SectionLabel>Card Back</SectionLabel>
      <div style={gridStyle}>
        <CardSlot label="Deck back">
          <CardBack size={180} />
        </CardSlot>
      </div>

      {/* Base Cards */}
      <SectionLabel>Base Cards</SectionLabel>
      <div style={gridStyle}>
        {PREVIEW_CARDS.slice(0, 5).map((card, i) => (
          <CardSlot key={i} label={card.name}>
            <CardFace card={{ ...card, id: `preview-${i}` }} size={180} />
          </CardSlot>
        ))}
      </div>

      {/* Class Cards */}
      <SectionLabel>Class Cards</SectionLabel>
      <div style={gridStyle}>
        {PREVIEW_CARDS.slice(5).map((card, i) => (
          <CardSlot key={i} label={`${card.classTheme} · ${card.name}`}>
            <CardFace card={{ ...card, id: `preview-class-${i}` }} size={180} />
          </CardSlot>
        ))}
      </div>

      {/* Skill Check Icons */}
      <SectionLabel>Skill Check Icons</SectionLabel>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 4,
        maxWidth: 600,
        margin: "0 auto",
      }}>
        {SKILL_CHECKS.map((skill) => (
          <div key={skill} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            padding: "12px 10px",
            background: "#1a1a24",
            borderRadius: 8,
            border: "1px solid #2a2a3a",
            width: 80,
          }}>
            <SkillIcon skill={skill} color="#e0a040" size={28} />
            <span style={{
              fontSize: 9,
              color: "#9a9688",
              letterSpacing: 0.5,
              textAlign: "center",
              fontFamily: "'Crimson Text', Georgia, serif",
            }}>
              {skill}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      textAlign: "center",
      color: "#5e5c54",
      fontSize: 11,
      letterSpacing: 3,
      textTransform: "uppercase",
      margin: "28px 0 12px",
      borderBottom: "1px solid #2a2a3a",
      paddingBottom: 6,
    }}>
      {children}
    </div>
  );
}

function CardSlot({ children, label }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      padding: 20,
    }}>
      {children}
      <span style={{
        fontSize: 10,
        color: "#9a9688",
        letterSpacing: 1,
        textTransform: "uppercase",
        textAlign: "center",
        maxWidth: 160,
      }}>
        {label}
      </span>
    </div>
  );
}

const gridStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: 8,
};
