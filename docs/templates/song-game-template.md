# Song (`song.mp3`) & Optional Mini-Game Spec Template

> **Owner:** `music-games` · **Music Engine (Option C):** `Suno` (default — prompt & `.mp3` upload at Gate G5) or `Gemini Lyria 3.5` (Auto)

## 1. Background Song (`song.mp3`) Output Contract

Played globally via `.song-banner` across the compiled reader. **Always begin your artifact with an exact `Style:` line** followed by `[Verse]` / `[Chorus]` lyrics adapted verbatim from `poem.html` so `lifeos-agent-engine` populates Gate G5's Suno `upload_slot` without falling back to defaults:

```markdown
Style: epic symphonic power metal fantasy anthem, thunderous war drums, driving electric guitars, orchestral brass, soaring male baritone lead and heroic war choir, 136 BPM

[Verse 1]
Peace rested bright in the Valley’s sky,
Till a dwarf came with a worried eye,
“Khazad-Throm is bleeding—help us, or we die.”

[Chorus]
Through wind-cut passes and secret stone,
A rune awoke, and gates groaned,
To lava-lit halls where iron shone,
And dwarven songs like anvils droned.
```

### Preset Style Tags (Select Matching Preset from `Ideas & Concept Brief`)
- **`heroic-saga` (Valley of Dragons signature):**
  `epic symphonic power metal fantasy anthem, thunderous war drums, driving electric guitars, orchestral brass, soaring male baritone lead and heroic war choir, 136 BPM`
- **`elemental-wonder` (Paths of Magic signature):**
  `mystical bardic harp fantasy folk ballad, plucked Celtic harp arpeggios, warm atmospheric strings, gentle frame drum, clear expressive tenor vocals, 92 BPM`
- **`shorter-kids-tale`:**
  `warm acoustic storybook folk ballad, fingerpicked acoustic guitar, soft celesta, light flute, clear friendly vocals, 84 BPM`
- **Avoid / Negative Tags:** `muffled vocals, modern hip-hop trap beat, harsh static, abrupt cut-off`
- **Duration Target:** `110–180` seconds covering all `5–6` stanzas of `poem.html`.

### Suno Workflow (Default `music_engine == "suno"`)
1. `music-games` places the `Style:` line and verbatim `poem.html` lyrics into the `song` artifact.
2. `lifeos-agent-engine` attaches `upload_slot.suno_style` and `upload_slot.suno_lyrics` at Gate G5.
3. Operator generates the track in Suno and uploads the `.mp3` in one tap via LifeOS (`POST /api/checkpoints/{id}/upload`), saving directly as `song.mp3`.

## 2. Optional Combat / Enemy Config (`enemy_metadata.json`)

Skip creating `enemy_metadata.json` when the `Ideas & Concept Brief` sets Combat to `skip`. When `enable`, map encounters strictly to interior `images/*.jpg` files using exact Magic Circle element names (`Water`, `Trees`, `Earth`, `Sun`, `Wind`, `Fire`, `Storm`/`Lightning`, `Life`, `Darkness`, `Undead`):

```json
{
  "images/ch03_stone_golem.jpg": {
    "name": "Deep Cavern Golem",
    "description": "Animated granite and magma-veined stone guarding the collapsed mine shaft.",
    "magicType": ["Earth", "Fire"],
    "physicality": "Heavy",
    "lives": 2,
    "powerBonus": 1,
    "magicConfig": {
      "strengthsCompound": false,
      "weaknessesCompound": true,
      "givesBonus": [true, false],
      "givesWeakness": [true, true]
    }
  }
}
```
- Preserve `.magic-circle-container` `aspect-ratio: 1 / 1` in `interactive_book.css` and **never modify** the 10-node Magic Circle array in `scripts/magic_combat_system.js`.
- Standalone mini-games in `contents/` sync automatically from `scripts/contents/` when running `generate_books.py`.
