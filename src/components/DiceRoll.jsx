import React, { useState, useEffect, useRef } from "react";

export function DiceRoll({ result, rolling, size = 120, onRollComplete }) {
  const [displayNumber, setDisplayNumber] = useState(result || 1);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!rolling) return;

    let elapsed = 0;
    const totalDuration = 1200;
    let delay = 50;

    function tick() {
      elapsed += delay;
      if (elapsed >= totalDuration) {
        setDisplayNumber(result);
        if (onRollComplete) onRollComplete();
        return;
      }
      setDisplayNumber(Math.floor(Math.random() * 10) + 1);
      delay = 50 + (elapsed / totalDuration) * 200;
      intervalRef.current = setTimeout(tick, delay);
    }

    intervalRef.current = setTimeout(tick, delay);

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [rolling, result, onRollComplete]);

  useEffect(() => {
    if (!rolling && result != null) {
      setDisplayNumber(result);
    }
  }, [rolling, result]);

  const s = size;
  const settled = !rolling && result != null;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
    }}>
      <div style={{
        width: s,
        height: s,
        clipPath: "polygon(50% 0%, 95% 30%, 95% 70%, 50% 100%, 5% 70%, 5% 30%)",
        background: rolling
          ? "linear-gradient(135deg, #1a1a2e 0%, #2a1a0a 50%, #1a1a2e 100%)"
          : "linear-gradient(135deg, #2e1a0a 0%, #5c3a10 40%, #8b6a20 60%, #2e1a0a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        transition: "background 0.3s ease",
        animation: rolling ? "diceJitter 0.1s ease-in-out infinite" : "none",
      }}>
        <div style={{
          position: "absolute",
          inset: 3,
          clipPath: "polygon(50% 0%, 95% 30%, 95% 70%, 50% 100%, 5% 70%, 5% 30%)",
          border: "1px solid",
          borderColor: settled ? "#e0a040" : "#7a6830",
          background: "transparent",
          transition: "border-color 0.3s ease",
          pointerEvents: "none",
        }} />
        <span style={{
          fontSize: s * 0.4,
          fontWeight: 700,
          color: settled ? "#fff" : "#d4c9a8",
          fontFamily: "'Cinzel', 'Palatino', serif",
          textShadow: settled
            ? "0 0 20px rgba(224, 160, 64, 0.8), 0 0 40px rgba(224, 160, 64, 0.4)"
            : "none",
          transition: "text-shadow 0.3s ease, color 0.3s ease",
          zIndex: 2,
          animation: settled ? "diceSettle 0.4s ease-out" : "none",
        }}>
          {displayNumber}
        </span>
      </div>
    </div>
  );
}
