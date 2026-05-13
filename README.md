# Deck of Fates — Owlbear Rodeo Extension

A card-based modifier system for a custom TTRPG that replaces traditional `+stat` modifiers with a deck draw mechanic. Draws add tension and narrative surprise to every ability check.

## Card Types

| Type | Modifier | Description |
|------|----------|-------------|
| **Steel Critical** | DM decides | One of two criticals — ambiguous success or failure |
| **Might Critical** | DM decides | The other critical — red/fury themed |
| **Neutral** | none | No modifier, the roll stands as-is |
| **Encounter** | -1 (customizable) | Negative modifier + narrative flavor text |
| **Stat** | DM applies mentally | Character's ability modifier applies |
| **Class** | Custom (+/-) | Per-player themed cards with optional skill check icons and redraw effects |

## Game Flow

1. Player rolls a d10 externally (Discord, physical dice, etc.)
2. DM opens Deck of Fates, selects the player, draws a card
3. Card is revealed (DM-only or visible to table, based on toggle)
4. If the player has proficiency, either the player or GM can **redraw** (gamble-style — forfeits the current card), limited by the player's proficiency stat
5. DM narrates the outcome, deck fully reshuffles for the next check

## Player Deck Customization

Players can open the deck editor (gear icon) to customize their own deck:

- **Base deck adjustments** — reduce the number of neutral/stat cards, toggle individual encounter cards on or off. Critical cards are always locked in.
- **Class cards** — add custom cards with a class theme (11 classes), skill check icon, modifier, flavor text, and optional redraw effects
- **Proficiency** — set the number of redraws allowed per draw

The GM defines the base deck template. Player customizations layer on top — when the GM updates the base deck, changes auto-propagate to all players. The GM retains full override access to any player's config.

## Classes

Musician, Disciple, Wildborn, Warrior, Monk, Archer, Rogue, Corruptor, Wizard, Wraith Hunter, Battlemage

Each class has a unique visual theme (colors, card frame) and matching SVG border art.

## Skill Check Icons

Cards can display a skill check icon from 19 available types: Lifting, Athletics, Thievery, Reflex, Stealth, Knowledge, Arcana, Investigation, Medicine, Perception, Survival, Animal Handling, Insight, Religion, Seduction, Performance, Persuasion, Deception, Intimidation.

## Setup & Development

```bash
npm install
npm run dev
```

Starts a local Vite dev server at `http://localhost:5173/deck-of-fates/`. Without OBR connected, a standalone card preview gallery renders after 2s.

### Install in Owlbear Rodeo (dev)

1. Go to your Owlbear Rodeo profile
2. Click **Add Extension**
3. Paste: `http://localhost:5173/deck-of-fates/manifest.json`
4. Create/enter a room and enable the extension

## Deploy

```bash
npm run build
```

Builds to `dist/`. Deployed via GitHub Pages at `https://andreiserban1609.github.io/deck-of-fates/`. GitHub Actions auto-deploys on push to `main`.

## Architecture

```
src/
├── App.jsx                  # Main app — GM/Player/Preview routing
├── main.jsx                 # React entry point
├── styles.css               # Dark fantasy themed styles (Cinzel + Crimson Text)
├── hooks/
│   └── useOBR.js            # OBR SDK integration (party, metadata, theme)
├── lib/
│   ├── constants.js         # Extension ID, metadata keys, card types, defaults
│   ├── deck.js              # Core deck logic (build, shuffle, draw, exclusions)
│   └── classThemes.js       # 11 class visual themes
├── components/
│   ├── CardArt.jsx          # Card face/back rendering, skill check icons, SVG frames
│   ├── CardFrames.jsx       # 16 SVG border frame components
│   ├── CardDraw.jsx         # DM draw/redraw interface with proficiency limits
│   ├── DeckEditor.jsx       # GM deck editor (base deck + per-player overrides)
│   ├── PlayerDeckEditor.jsx # Player-facing deck customization
│   ├── PlayerView.jsx       # Player view (drawn card + redraw button)
│   └── CardPreview.jsx      # Standalone preview gallery (no OBR needed)
public/
├── manifest.json            # OBR extension manifest
└── icon.svg                 # Extension icon
```

### State Management

- **Room metadata** stores the deck template, per-player configs (class cards, proficiency, base deck exclusions), visibility settings, and the current drawn card — all synced via OBR
- **Deck instances** are ephemeral React state — built fresh per check, shuffled, drawn from, then discarded
- **Broadcast** sends draw/redraw/resolve events to players in real-time when visibility is set to "table"

## Phase 2 Ideas

- [ ] Integrated d10 roll within the extension
- [ ] Draw history / session log
- [ ] Custom card art uploads
- [ ] Sound effects on draw
