# Deck of Fates — Owlbear Rodeo Extension

A card-based modifier system for a custom TTRPG that replaces traditional `+stat` modifiers with a deck draw mechanic. Draws add tension and narrative surprise to every ability check.

## Card Types

| Type | Modifier | Description |
|------|----------|-------------|
| **Steel Critical** | DM decides | One of two criticals — ambiguous success or failure |
| **Might Critical** | DM decides | The other critical — red/fury themed |
| **Neutral** | Customizable (±0, ±1, ±2) | No twist of fate by default, but can carry small modifiers |
| **Encounter** | -1 (customizable) | Negative modifier + narrative flavor text |
| **Stat** | Player's ability modifier | Auto-applies the relevant ability score when a skill check is selected |
| **Class** | Custom (+/-) | Per-player themed cards with optional skill check restrictions and redraw effects |

## Game Flow

1. Player rolls a d10 externally (or via the integrated d10 animation, if enabled by the GM)
2. DM opens Deck of Fates → selects a player → selects the skill check type (or "General Draw")
3. Card is drawn and revealed (DM-only or visible to table, based on toggle)
4. **Auto-skip**: Class cards restricted to a different check type are briefly shown, then automatically skipped without consuming redraws
5. **Redraw effects**: Class cards with a redraw modifier are shown briefly, their bonus is applied, and the next card is drawn automatically. Multiple effects stack.
6. If the player has proficiency, either the player or GM can **redraw** (gamble-style — forfeits the current card)
7. DM narrates the outcome, deck fully reshuffles for the next check

### D10 Dice Roll (Optional)

The GM can toggle an integrated d10 roll animation (🎲 button). When enabled:
- The draw flow becomes: **Roll → Draw → Result Breakdown**
- A hexagonal die animates and settles on the result
- The result breakdown shows: `Roll | Card modifier | Stat | Bonus | = Total`
- The same roll persists across redraws

## Skill Checks & Ability Scores

### Check Selection
Before drawing, the DM picks the skill check from a grid grouped by ability score. This enables:
- **Auto-skip** of class cards tied to a different check
- **Stat card auto-apply** — when a Stat card is drawn, the player's relevant ability modifier is computed and displayed

### Ability Scores
Each player has 7 ability scores (STR, DEX, CON, INT, WIS, CHA, WILL) configured in the deck editor. Modifiers follow the standard formula: `floor((score - 10) / 2)`.

### Skill → Ability Mapping
| Ability | Skills |
|---------|--------|
| Strength | Lifting, Athletics |
| Dexterity | Thievery, Reflex, Stealth |
| Intelligence | Knowledge, Arcana, Investigation |
| Wisdom | Medicine, Perception, Survival, Animal Handling, Insight |
| Charisma | Seduction, Performance, Persuasion, Deception, Intimidation |
| Will | Religion |

## Player Deck Customization

Players can open the deck editor (gear icon) to customize their own deck:

- **Base deck adjustments** — toggle individual neutral and encounter cards on or off, adjust stat card count. Critical cards are always locked in.
- **Class cards** — add custom cards with a class theme (11 classes), modifier, flavor text, optional skill check restriction, and optional redraw effects
- **Ability scores** — set STR, DEX, CON, INT, WIS, CHA, WILL for Stat card auto-apply
- **Proficiency** — set the number of redraws allowed per draw
- **Import/Export** — save and load class card configurations as JSON

The GM defines the base deck template. Player customizations layer on top — when the GM updates the base deck, changes auto-propagate to all players. The GM retains full override access to any player's config.

## Classes

Musician, Disciple, Wildborn, Warrior, Monk, Archer, Rogue, Corruptor, Wizard, Wraith Hunter, Battlemage

Each class has a unique visual theme (colors, card frame) and matching SVG border art.

## Setup & Development

```bash
npm install
npm run dev
```

Starts a local Vite dev server at `http://localhost:5173/deck-of-fates/`. Without OBR connected, a standalone mode renders after 2s with a card preview gallery and a mock draw flow for testing the full draw experience (including d10, check selection, auto-skip, and redraw effects).

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
├── App.jsx                  # Main app — GM/Player/Preview routing + standalone mode
├── main.jsx                 # React entry point
├── styles.css               # Dark fantasy themed styles (Cinzel + Crimson Text)
├── hooks/
│   └── useOBR.js            # OBR SDK integration (party, metadata, theme)
├── lib/
│   ├── constants.js         # Card types, ability scores, skill mappings, defaults
│   ├── deck.js              # Core deck logic (build, shuffle, draw, stat modifiers)
│   └── classThemes.js       # 11 class visual themes
├── components/
│   ├── CardArt.jsx          # Card face/back rendering, skill check icons, SVG frames
│   ├── CardFrames.jsx       # 16 SVG border frame components
│   ├── CardDraw.jsx         # DM draw interface (check select, auto-skip, redraw effects)
│   ├── DeckEditor.jsx       # GM deck editor (base deck + per-player overrides + stats)
│   ├── PlayerDeckEditor.jsx # Player-facing deck customization + ability scores
│   ├── PlayerView.jsx       # Player view (drawn card, skip/effect overlays, redraw)
│   ├── CardPreview.jsx      # Standalone preview gallery (no OBR needed)
│   ├── DiceRoll.jsx         # D10 dice roll animation component
│   ├── ResultBreakdown.jsx  # Roll + card + stat + bonus = total display
│   └── MockDrawFlow.jsx     # Standalone mock draw flow for testing
public/
├── manifest.json            # OBR extension manifest
└── icon.svg                 # Extension icon
```

### State Management

- **Room metadata** stores the deck template, per-player configs (class cards, ability scores, proficiency, base deck exclusions), visibility/dice settings, and the current drawn card — all synced via OBR
- **Deck instances** are ephemeral React state — built fresh per check, shuffled, drawn from, then discarded
- **Broadcast** sends draw/skip/effect/resolve events to players in real-time when visibility is set to "table"

## Future Ideas

- [ ] Draw history / session log
- [ ] Custom card art uploads
- [ ] Sound effects on draw
