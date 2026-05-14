import { CARD_TYPES, SKILL_TO_ABILITY } from "./constants.js";

export function getAbilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

export function getStatModifierForCheck(checkName, playerStats) {
  if (!checkName || !playerStats) return null;
  const ability = SKILL_TO_ABILITY[checkName];
  if (!ability) return null;
  const score = playerStats[ability];
  if (score == null) return null;
  return getAbilityModifier(score);
}

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

export function buildDeck(template, classCards = [], exclusions = null) {
  cardIdCounter = 0;
  const cards = [];

  cards.push(
    makeCard(CARD_TYPES.STEEL_CRITICAL, "Steel Critical", null)
  );
  cards.push(
    makeCard(CARD_TYPES.MIGHT_CRITICAL, "Might Critical", null)
  );

  const neutralCards = template.neutralCards
    || Array.from({ length: template.neutralCount || 0 }, () => ({ name: "Neutral", modifier: 0, description: "No twist of fate." }));
  const excludedNeutrals = new Set(exclusions?.neutrals || []);
  for (let i = 0; i < neutralCards.length; i++) {
    if (excludedNeutrals.has(i)) continue;
    const n = neutralCards[i];
    cards.push(makeCard(CARD_TYPES.NEUTRAL, n.name, n.modifier, n.description));
  }

  const effectiveStats = Math.max(0,
    (template.statCount || 0) - (exclusions?.statExcludeCount || 0)
  );
  for (let i = 0; i < effectiveStats; i++) {
    cards.push(
      makeCard(CARD_TYPES.STAT, "Stat", null, "Your ability shapes the outcome.")
    );
  }

  const excludedEncounters = new Set(exclusions?.encounters || []);
  for (let i = 0; i < (template.encounterCards || []).length; i++) {
    if (excludedEncounters.has(i)) continue;
    const enc = template.encounterCards[i];
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

export function getEffectiveDeckSize(template, config = {}) {
  const exc = config.excludedCards || {};
  const neutralCards = template.neutralCards
    || Array.from({ length: template.neutralCount || 0 }, () => ({ name: "Neutral", modifier: 0, description: "No twist of fate." }));
  const excludedNeu = new Set(exc.neutrals || []);
  const neutrals = neutralCards.filter((_, i) => !excludedNeu.has(i)).length;
  const stats = Math.max(0, (template.statCount || 0) - (exc.statExcludeCount || 0));
  const excludedEnc = new Set(exc.encounters || []);
  const encounters = (template.encounterCards || []).filter((_, i) => !excludedEnc.has(i)).length;
  const classCount = (config.classCards || []).length;
  return 2 + neutrals + stats + encounters + classCount;
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
    if (card.modifier === 0) return "±0";
    if (card.modifier > 0) return `+${card.modifier}`;
    if (card.modifier < 0) return `${card.modifier}`;
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
