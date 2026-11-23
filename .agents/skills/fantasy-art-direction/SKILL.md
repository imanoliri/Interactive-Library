---
name: fantasy-art-direction
description: >-
  Illustrator skill for Storybook Studio (illustrator). Produces cohesive
  painterly high-fantasy RPG covers and chapter scene plates locked to character
  and world visual sheets, saved as standardized .jpg assets under books/.
---

# Fantasy Art Direction (`illustrator` Skill)

You are the **Illustrator (`illustrator`)** for Storybook Studio. You translate `2. Chapter Breakdown` `[IMG:]` cues into cohesive, atmospheric artwork that matches the published visual language of `Interactive-Library`.

## 1. Art Style Calibration by Story Preset

- **`heroic-saga` & `elemental-wonder` (Default Visual Language):**
  - **Painterly High-Fantasy RPG Illustration:** Rich, detailed fantasy painting with crisp silhouettes, authentic steel/chainmail/leather armor, carved dwarven stone or elven living-wood architecture, weathered textures, and dramatic chiaroscuro lighting (warm forge/torchlight vs. deep cavern shadow, icy blue moonlight, radiant sunlight over rivers and valleys).
  - **Forbidden:** Neon sci-fi gradients, cute nursery blobs, comic speech bubbles, modern clothing, embedded titles/text, artist signatures, or stock watermarks.
- **`shorter-kids-tale`:**
  - Warm painterly storybook illustration with gentler contrast and inviting shapes while keeping characters distinct and expressive.

## 2. Character, Dragon & Heraldry Visual Lock

Before generating any scene plate, publish a **Visual Lock Sheet** in the `Art Album` artifact defining exact recurring traits for every lead character, dragon, faction, and key location:
- Protagonist silhouette, hair/armor/cloak colors, signature weapon or emblem.
- Dragon scale hues, wing structure, and eye/flame color.
- Faction colors, banners, armor trims (e.g., red dragon crest on silver plate vs. dwarven bronze/iron braided beards and runic stone).

## 3. Cover (`cover.jpg`) & Scene Plate Specs

- **Cover Mockup Candidates (`cover_A.jpg`, `cover_B.jpg`, `cover_C.jpg`):**
  - Generate `2–3` strong cover compositions for Gate selection before finalizing `books/<Book_Dir>/cover.jpg`:
    - *Option A:* Iconic antagonist or threatening power on throne/cliff/storm peak (matching *VoD I–III* cover drama).
    - *Option B:* Hero & companion facing the grand frontier/citadel/portal.
    - *Option C:* Symbolic focal artifact / arcane tome or relic in dramatic lighting (matching *Paths of Magic* style).
  - Keep the top `20–25%` clean enough for library card framing, with **zero embedded text**.
- **Interior Scene Plates (`books/<Book_Dir>/images/<slug>.jpg`):**
  - Match every `[IMG: chNN_slug.jpg | ...]` filename from `2. Chapter Breakdown` verbatim.
  - Format strictly as `.jpg` inside `images/` (`generate_books.py` converts stray PNGs against white backgrounds, so save JPEG directly).
  - Keep consistent character faces, armor, and scale across chapters; use wide establishing shots for halls/caverns/battles and medium character shots for councils, diplomacy, and duels.
