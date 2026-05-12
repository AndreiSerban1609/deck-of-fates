export const EXTENSION_ID = "com.deckoffates.modifier";

// Metadata keys for OBR storage
export const META = {
  DECK_TEMPLATE: `${EXTENSION_ID}/deckTemplate`,
  PLAYER_CONFIGS: `${EXTENSION_ID}/playerConfigs`,
  SETTINGS: `${EXTENSION_ID}/settings`,
};

export const CARD_TYPES = {
  STEEL_CRITICAL: "STEEL_CRITICAL",
  ENERGY_CRITICAL: "ENERGY_CRITICAL",
  NEUTRAL: "NEUTRAL",
  ENCOUNTER: "ENCOUNTER",
  STAT: "STAT",
  CLASS: "CLASS",
};

export const DEFAULT_DECK_TEMPLATE = {
  neutralCount: 5,
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

export const DEFAULT_SETTINGS = {
  visibility: "dm-only", // "dm-only" | "table"
};
