import { useState, useEffect, useCallback, useRef } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { META, DEFAULT_DECK_TEMPLATE, DEFAULT_SETTINGS } from "../lib/constants.js";

export function useOBR() {
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState("PLAYER");
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [partyMembers, setPartyMembers] = useState([]);
  const [theme, setTheme] = useState(null);
  const unsubs = useRef([]);

  useEffect(() => {
    if (!OBR.isAvailable) return;

    OBR.onReady(async () => {
      const [r, id, name, t, party] = await Promise.all([
        OBR.player.getRole(),
        OBR.player.getId(),
        OBR.player.getName(),
        OBR.theme.getTheme(),
        OBR.party.getPlayers(),
      ]);

      setRole(r);
      setPlayerId(id);
      setPlayerName(name);
      setTheme(t);
      setPartyMembers(party);
      setReady(true);

      unsubs.current.push(
        OBR.party.onChange((p) => setPartyMembers(p)),
        OBR.theme.onChange((t) => setTheme(t))
      );
    });

    return () => {
      unsubs.current.forEach((fn) => fn());
      unsubs.current = [];
    };
  }, []);

  const isGM = role === "GM";

  return { ready, isGM, role, playerId, playerName, partyMembers, theme };
}

export function useRoomMetadata() {
  const [deckTemplate, setDeckTemplate] = useState(DEFAULT_DECK_TEMPLATE);
  const [playerConfigs, setPlayerConfigs] = useState({});
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const unsub = useRef(null);

  useEffect(() => {
    if (!OBR.isAvailable) return;

    OBR.onReady(async () => {
      try {
        const meta = await OBR.room.getMetadata();
        if (meta[META.DECK_TEMPLATE]) setDeckTemplate(meta[META.DECK_TEMPLATE]);
        if (meta[META.PLAYER_CONFIGS]) setPlayerConfigs(meta[META.PLAYER_CONFIGS]);
        if (meta[META.SETTINGS]) setSettings(meta[META.SETTINGS]);
      } catch (e) {
        console.error("[DeckOfFates] Failed to load room metadata:", e);
      }

      unsub.current = OBR.room.onMetadataChange((meta) => {
        if (meta[META.DECK_TEMPLATE]) setDeckTemplate(meta[META.DECK_TEMPLATE]);
        if (meta[META.PLAYER_CONFIGS]) setPlayerConfigs(meta[META.PLAYER_CONFIGS]);
        if (meta[META.SETTINGS]) setSettings(meta[META.SETTINGS]);
      });
    });

    return () => {
      unsub.current?.();
    };
  }, []);

  const saveDeckTemplate = useCallback(async (template) => {
    setDeckTemplate(template);
    await OBR.room.setMetadata({ [META.DECK_TEMPLATE]: template });
  }, []);

  const savePlayerConfigs = useCallback(async (configs) => {
    setPlayerConfigs(configs);
    await OBR.room.setMetadata({ [META.PLAYER_CONFIGS]: configs });
  }, []);

  const saveSettings = useCallback(async (s) => {
    setSettings(s);
    await OBR.room.setMetadata({ [META.SETTINGS]: s });
  }, []);

  return {
    deckTemplate,
    playerConfigs,
    settings,
    saveDeckTemplate,
    savePlayerConfigs,
    saveSettings,
  };
}
