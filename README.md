# Deck of Fates — Owlbear Rodeo Extension

A card-based modifier system for D&D that replaces traditional `+stat` modifiers with a deck draw mechanic. The DM draws cards on behalf of players, adding a layer of tension and narrative surprise to every ability check.

## Card Types

| Type | Modifier | Description |
|------|----------|-------------|
| **Steel Critical** | DM decides | One of two criticals — players see the steel art but don't know if it's success or failure |
| **Energy Critical** | DM decides | The other critical — glowing arcane energy. DM assigns meaning per-draw |
| **Neutral** | ±0 | No modifier, the roll stands as-is |
| **Encounter** | -1 (customizable) | Negative modifier + narrative flavor the DM riffs on |
| **Stat** | DM applies mentally | Signals the character's ability modifier applies |
| **Class** | Custom (+/-) | Per-player cards layered on top of the base deck (e.g., Paladin's "Hand of God" +5) |

## Flow

1. Player needs a check → rolls a d10 externally (Discord, physical dice, etc.)
2. DM opens Deck of Fates → selects the player → draws a card
3. Card is revealed (DM-only or visible to table, based on toggle)
4. If the player is proficient, they can request a **redraw** (gamble-style — forfeits the current card)
5. DM confirms redraw → new card drawn → repeat until player accepts or stops
6. DM narrates the outcome → deck fully reshuffles for the next check

## Setup & Development

```bash
npm install
npm run dev
```

This starts a local Vite dev server (usually `http://localhost:5173`).

### Install in Owlbear Rodeo (dev)

1. Go to your Owlbear Rodeo profile
2. Click **Add Extension**
3. Paste: `http://localhost:5173/manifest.json`
4. Create/enter a room and enable the extension

## Deploy

Build the project and host the `dist/` folder on any static hosting (GitHub Pages, Vercel, Netlify, Render, etc.):

```bash
npm run build
```

Then update the manifest URLs if your hosting uses a base path.

### Deploy to GitHub Pages (example)

1. Push the repo to GitHub
2. In `vite.config.js`, set `base: '/<repo-name>/'`
3. Use GitHub Actions or manually deploy `dist/`
4. Extension install link: `https://<user>.github.io/<repo>/manifest.json`

## Architecture

```
src/
├── App.jsx                 # Main app — routes GM vs Player views
├── main.jsx                # React entry point
├── styles.css              # Dark fantasy themed styles
├── hooks/
│   └── useOBR.js           # OBR SDK integration (party, metadata, theme)
├── lib/
│   ├── constants.js        # Extension ID, metadata keys, defaults
│   └── deck.js             # Core deck logic (build, shuffle, draw)
├── components/
│   ├── CardArt.jsx         # SVG card face & back visuals
│   ├── CardDraw.jsx        # DM draw/redraw interface
│   ├── DeckEditor.jsx      # Base deck template + class card editor
│   └── PlayerView.jsx      # Player-facing view (broadcast listener)
public/
├── manifest.json           # OBR extension manifest
└── icon.svg                # Extension icon
```

### State Management

- **Room metadata** stores the deck template, per-player class card configs, and visibility settings (synced to all players via OBR)
- **Deck instances** are ephemeral React state — built fresh for each check, shuffled, drawn from, then discarded
- **Broadcast** sends card draw events to players when visibility is set to "table"

## Phase 2 Ideas

- [ ] Integrated d10 roll within the extension (toggleable)
- [ ] Character sheet integration for auto-applying stat modifiers
- [ ] Draw history / session log
- [ ] Custom card art uploads
- [ ] Sound effects on draw
