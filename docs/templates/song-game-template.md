# Song (`song.mp3`) & Optional Mini-Game Spec Template

> **Owner:** `music-games` · **Music Engine (Option C):** `Gemini Lyria 3.5` (Auto) or `Suno` (Prompt + Manual `.mp3` upload gate)

## 1. Background Song (`song.mp3`) Spec

Played globally via `.song-banner` across the compiled reader:

- **Title:** `<Book Song Title>`
- **Duration Target:** 90–150 seconds, loop-friendly calm ending
- **Style Tags (Lyria / Suno):**
  - *Bedtime mode:* `warm acoustic lullaby, soft celesta, gentle fingerpicked guitar, muted strings, airy ambient pad, 76 BPM, soothe vocals`
  - *Adventure mode:* `heroic orchestral fantasy, Celtic flute, warm strings, soft brass swell, hopeful melody, 108 BPM`
- **Negative Prompt / Avoid:** `harsh distortion, sudden loud drums, screaming, abrupt cut-off`
- **Lyrics Source (`poem.html`):** Adapt verses cleanly from the approved `poem.html` stanzas so the song reinforces the story's refrain.

### Suno Fallback Workflow (When `music_engine == "suno"`)
1. `music-games` prepares the exact style prompt and `poem.html` lyrics in Gate G5 `upload_slot.prompt`.
2. Operator copies the prompt into Suno, downloads the finished track, and uploads it in one tap via LifeOS Gate G5 (`POST /api/checkpoints/{id}/upload`), saving directly as `song.mp3`.

## 2. Optional Combat / Enemy Config (`enemy_metadata.json`)

Skip creating `enemy_metadata.json` when the `Ideas & Concept Brief` sets Combat to `skip`. When combat is `enable`, place encounters only on images explicitly intended as interactive creatures, using **exact Magic Circle element names**:
`Water`, `Trees`, `Earth`, `Sun`, `Wind`, `Fire`, `Storm`, `Life`, `Darkness`, `Undead`.

```json
{
  "images/ch03_mist_sprite.jpg": {
    "name": "Stormcloud Sprite",
    "description": "A mischievous spark-wisp tangling the rain clouds above Silver Peaks.",
    "magicType": ["Wind", "Storm"],
    "physicality": "Light",
    "magicConfig": {
      "strengthsCompound": false,
      "weaknessesCompound": true,
      "givesBonus": [true, false],
      "givesWeakness": [true, true]
    }
  }
}
```
- Notice `interactive_book.css` requires `.magic-circle-container` to preserve `aspect-ratio: 1 / 1` and the 10-node Magic Circle array in `scripts/magic_combat_system.js` must remain unmodified.
- Standalone non-combat games in `contents/` are automatically synced from `scripts/contents/` when running `generate_books.py`.
