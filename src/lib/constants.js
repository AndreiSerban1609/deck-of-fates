export const EXTENSION_ID = "com.deckoffates.modifier";

// Metadata keys for OBR storage
export const META = {
  DECK_TEMPLATE: `${EXTENSION_ID}/deckTemplate`,
  PLAYER_CONFIGS: `${EXTENSION_ID}/playerConfigs`,
  SETTINGS: `${EXTENSION_ID}/settings`,
  CURRENT_DRAW: `${EXTENSION_ID}/currentDraw`,
  CURRENT_DECK: `${EXTENSION_ID}/currentDeck`,
};

export const CARD_TYPES = {
  STEEL_CRITICAL: "STEEL_CRITICAL",
  MIGHT_CRITICAL: "MIGHT_CRITICAL",
  NEUTRAL: "NEUTRAL",
  ENCOUNTER: "ENCOUNTER",
  STAT: "STAT",
  CLASS: "CLASS",
};

export const DEFAULT_DECK_TEMPLATE = {
  neutralCards: [
    { name: "Neutral", modifier: 0, description: "No twist of fate." },
    { name: "Neutral", modifier: 0, description: "No twist of fate." },
    { name: "Neutral", modifier: 0, description: "No twist of fate." },
    { name: "Neutral", modifier: 0, description: "No twist of fate." },
    { name: "Neutral", modifier: 0, description: "No twist of fate." },
  ],
  statCount: 4,
  encounterCards: [
    {
      name: "Stumble",
      modifier: -1,
      description: "You lose your footing at the worst moment.",
    },
    {
      name: "Distraction",
      modifier: -1,
      description: "Something pulls your focus away.",
    },
    {
      name: "Bad Luck",
      modifier: -1,
      description: "Fate frowns upon this attempt.",
    },
  ],
};

export const SKILL_CHECKS = [
  "Lifting", "Athletics", "Thievery", "Reflex", "Stealth",
  "Knowledge", "Arcana", "Investigation", "Medicine", "Perception",
  "Survival", "Animal Handling", "Insight", "Religion",
  "Seduction", "Performance", "Persuasion", "Deception", "Intimidation",
];

export const DEFAULT_SETTINGS = {
  visibility: "dm-only", // "dm-only" | "table"
  diceRoll: false,
};
