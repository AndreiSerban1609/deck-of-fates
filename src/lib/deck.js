import { CARD_TYPES } from "./constants.js";

let cardIdCounter = 0;

function makeCard(type, name, modifier, description = "", classTheme = null) {
  const card = {
    id: `card-${++cardIdCounter}-${Date.now()}`,
    type,
    name,
    modifier,
    description,
  };
  if (classTheme) card.classTheme = classTheme;
  return card;
}

/**
 * Build a full deck from a template + player class cards.
 * Always includes exactly 2 criticals (1 Steel, 1 Energy).
 */
export function buildDeck(template, classCards = []) {
  cardIdCounter = 0;
  const cards = [];

  // Always 2 criticals
  cards.push(
    makeCard(CARD_TYPES.STEEL_CRITICAL, "Steel Critical", null, "Forged in iron resolve.")
  );
  cards.push(
    makeCard(CARD_TYPES.ENERGY_CRITICAL, "Energy Critical", null, "Pure arcane surge.")
  );

  // Neutral cards
  for (let i = 0; i < (template.neutralCount || 0); i++) {
    cards.push(makeCard(CARD_TYPES.NEUTRAL, "Neutral", 0, "No twist of fate."));
  }

  // Stat cards
  for (let i = 0; i < (template.statCount || 0); i++) {
    cards.push(
      makeCard(CARD_TYPES.STAT, "Stat", null, "Your ability shapes the outcome.")
    );
  }

  // Encounter cards (each is unique with its own name/modifier/description)
  for (const enc of template.encounterCards || []) {
    cards.push(
      makeCard(CARD_TYPES.ENCOUNTER, enc.name, enc.modifier, enc.description)
    );
  }

  // Class-specific cards
  for (const cls of classCards) {
    cards.push(
      makeCard(CARD_TYPES.CLASS, cls.name, cls.modifier, cls.description, cls.classTheme)
    );
  }

  return cards;
}

/**
 * Fisher-Yates shuffle. Returns a new array.
 */
export function shuffle(cards) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Draw the top card from a shuffled deck.
 * Returns { drawnCard, remaining }.
 */
export function drawCard(deck) {
  if (!deck || deck.length === 0) return { drawnCard: null, remaining: [] };
  const [drawnCard, ...remaining] = deck;
  return { drawnCard, remaining };
}

/**
 * Get a human-readable modifier string for a card.
 */
export function getModifierDisplay(card) {
  if (!card) return "";
  if (
    card.type === CARD_TYPES.STEEL_CRITICAL ||
    card.type === CARD_TYPES.ENERGY_CRITICAL
  ) {
    return "CRITICAL";
  }
  if (card.type === CARD_TYPES.STAT) {
    return "STAT MOD";
  }
  if (card.modifier === null || card.modifier === undefined) return "?";
  if (card.modifier === 0) return "±0";
  if (card.modifier > 0) return `+${card.modifier}`;
  return `${card.modifier}`;
}
