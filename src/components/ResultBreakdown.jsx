import React from "react";
import { CARD_TYPES } from "../lib/constants.js";

export function ResultBreakdown({ roll, card, isRedraw }) {
  if (!card || roll == null) return null;

  const isCrit = card.type === CARD_TYPES.STEEL_CRITICAL || card.type === CARD_TYPES.MIGHT_CRITICAL;
  const isStat = card.type === CARD_TYPES.STAT;

  if (isCrit) {
    return (
      <div className="result-breakdown result-slide-in">
        <span className="rb-segment">
          <span className="rb-label">Roll</span>
          <span className="rb-value">{roll}</span>
        </span>
        <span className="rb-divider">|</span>
        <span className="rb-segment">
          <span className="rb-value rb-special">CRITICAL</span>
        </span>
      </div>
    );
  }

  if (isStat) {
    return (
      <div className="result-breakdown result-slide-in">
        <span className="rb-segment">
          <span className="rb-label">Roll</span>
          <span className="rb-value">{roll}</span>
        </span>
        <span className="rb-divider">|</span>
        <span className="rb-segment">
          <span className="rb-value rb-special">STAT</span>
        </span>
      </div>
    );
  }

  const cardMod = card.modifier ?? 0;
  const redrawMod = isRedraw && card.redrawModifier != null ? card.redrawModifier : 0;
  const total = roll + cardMod + redrawMod;

  const formatMod = (n) => {
    if (n === 0) return "±0";
    if (n > 0) return `+${n}`;
    return `${n}`;
  };

  return (
    <div className="result-breakdown result-slide-in">
      <span className="rb-segment">
        <span className="rb-label">Roll</span>
        <span className="rb-value">{roll}</span>
      </span>
      <span className="rb-divider">|</span>
      <span className="rb-segment">
        <span className="rb-label">Card</span>
        <span className="rb-value">{formatMod(cardMod)}</span>
      </span>
      {isRedraw && card.redrawModifier != null && (
        <>
          <span className="rb-divider">|</span>
          <span className="rb-segment">
            <span className="rb-label">Redraw</span>
            <span className="rb-value">{formatMod(redrawMod)}</span>
          </span>
        </>
      )}
      <span className="rb-divider">=</span>
      <span className="rb-segment">
        <span className="rb-value rb-total">{total}</span>
      </span>
    </div>
  );
}
