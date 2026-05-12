import { CARD_TYPES } from "./constants.js";

let cardIdCounter = 0;

function makeCard(type, name, modifier, description = "", extra = null) {
  const card = {
    id: `card-${++cardIdCounter}-${Date.now()}`,
    type,
    name,
    modifier,
    description,
  };
  if (extra) {
    if (extra.classTheme) card.classTheme = extra.classTheme;
    if (extra.checkType) card.checkType = extra.checkType;
    if (extra.redrawModifier != null) card.redrawModifier = extra.redrawModifier;
    if (extra.redrawDescription) card.redrawDescription = extra.redrawDescription;
  }
  return card;
}

export function buildDeck(template, classCards = []) {
  cardIdCounter = 0;
  const cards = [];

  cards.push(
    makeCard(CARD_TYPES.STEEL_CRITICAL, "Steel Critical", null)
  );
  cards.push(
    makeCard(CARD_TYPES.MIGHT_CRITICAL, "Might Critical", null)
  );

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

  for (const cls of classCards) {
    cards.push(
      makeCard(CARD_TYPES.CLASS, cls.name, cls.modifier, cls.description, {
        classTheme: cls.classTheme,
        checkType: cls.checkType,
        redrawModifier: cls.redrawModifier,
        redrawDescription: cls.redrawDescription,
      })
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
    card.type === CARD_TYPES.MIGHT_CRITICAL
  ) {
    return "CRITICAL";
  }
  if (card.type === CARD_TYPES.NEUTRAL) {
    return "";
  }
  if (card.type === CARD_TYPES.STAT) {
    return "STAT";
  }
  if (card.modifier === null || card.modifier === undefined) return "?";
  if (card.modifier === 0) return "±0";
  if (card.modifier > 0) return `+${card.modifier}`;
  return `${card.modifier}`;
}
