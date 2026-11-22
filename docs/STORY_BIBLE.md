# Interactive Library — Story Bible & Storybook Studio Contract

This document defines canonical story boundaries, continuity rules, and the **Storybook Studio** production workflow for adding new books to `Interactive-Library`.

## 1. Source-of-Truth & Canon Hierarchy

Follow `knowledge/AGENTS.md` and `curator/AGENTS.md` strictly when resolving universe facts:

1. **Published books (`books/`)** — Accepted `.html` source manuscripts, `story_by_chapters.json`, `poem.html`, and book `meta.json` files are authoritative.
2. **Structured Canon (`knowledge/`)** — Universes, series, characters, locations, magic rules, timelines, and unresolved continuity `TODO` entries under `knowledge/universes/<universe>/`.
3. **Production Metadata (`docs/templates/`, outlines, breakdowns)** — Non-canonical working blueprints. Never treat an unbuilt outline or brainstorm as canonical fact until published or recorded as an accepted canon decision.
4. **Never invent missing canon silently** — If chronology, lineage, or magic mechanics are unestablished, check `knowledge/` first, record an open question for the Team Lead (`editor`), and preserve existing continuity.

## 2. Active Story Universes & Series

### Valley of Dragons (`books/Valley_of_Dragons/`, `knowledge/universes/valley-of-dragons/`)
- **Published order (`books/Valley_of_Dragons/meta.json` `children_order`):**
  1. `Attack_of_the_Dark_God` (*Valley of Dragons I: Attack of the Dark God*)
  2. `Winter_of_Wolves` (*Valley of Dragons II: Winter of Wolves*)
  3. `Clash_Under_the_Mountain` (*Valley of Dragons III: Clash Under the Mountain*)
- **Core themes & tone:** Dragon Rider Knights, alliances between humans, dragons, elves, and dwarves, courageous hope, and age-appropriate wonder. Bedtime or younger-reader entries can omit combat encounters while preserving serene dragon lore and world landmarks.
- **Standalone / Spin-offs:** When adding a fourth series installment, append its folder slug to `books/Valley_of_Dragons/meta.json` `children_order` *before* running `scripts/generate_manifest.py`; standalone tales belong directly under `books/<Book_Slug>/`.

### The Paths of Magic (`books/Paths_of_Magic/`, `knowledge/universes/paths-of-magic/`)
- **Core magic principle:** Deeper mastery of an element's structure and behavior unlocks stronger spells (seven core paths studied by Magnus: Water, Trees, Earth, Sun, Wind, Fire, Lightning).
- **10-Node Combat Magic Circle (`scripts/magic_combat_system.js`):**
  - Exact invariant order: `['Water', 'Trees', 'Earth', 'Sun', 'Wind', 'Fire', 'Storm', 'Life', 'Darkness', 'Undead']`.
  - **Never reorder these 10 nodes** or alter `magic_combat_system.js` vector geometry; per-book encounters configure only `enemy_metadata.json`.

## 3. Storybook Studio 6-Role Team Workflow

The LifeOS **Storybook Studio** team routes every new book through one Lead entry point (`editor`), three tiered writing/critique stages, parallel media production, automated compilation, and high-level sign-off:

| Role | ID | Access | Responsibility |
|---|---|---|---|
| **Editor (Lead)** | `editor` | Read/Write (`docs`, `books`) | Owns `Ideas & Concept Brief`, resolves `STORY_BIBLE.md` / `knowledge/` checks, batches open questions into Lead-only operator checkpoints, and performs final QA sign-off. |
| **Writer** | `writer` | Read/Write (`books`) | Drafts all 3 progressive writing artifacts: `1. Outline` → `2. Chapter Breakdown` → `3. Final Prose` (`<Book>.html`, `poem.html`, `meta.json`). |
| **Reviewer** | `reviewer` | **Read-Only** | Evaluates continuity, pacing, and target age fit at each writing level (`Outline`, `Breakdown`, chapter-by-chapter `Final Prose`) without editing files. |
| **Illustrator** | `illustrator` | Read/Write (`books/*/images`, `cover.jpg`) | Generates consistent `cover.jpg` and scene `.jpg` assets aligned with Breakdown `[IMG:]` cues via Gemini Image (`Option C`). |
| **Music & Games** | `music-games` | Read/Write (`books`) | Produces `song.mp3` (via Gemini Lyria 3.5 or `Suno` upload slot at Gate G5) matching `poem.html`, plus optional `enemy_metadata.json` when combat is enabled. |
| **Book Builder** | `builder` | Read/Write (`books`, `scripts`) | Runs `generate_books.py`, `scripts/generate_manifest.py`, and `scripts/validate_knowledge.py`; never edits compiled `books/*/index.html` by hand. |

## 4. Three-Level Writing Progression & Templates

All artifacts follow editable templates under [`docs/templates/`](templates/):

1. [`ideas-brief-template.md`](templates/ideas-brief-template.md) — Target audience, series slot, premise, canon guardrails, and optional combat mode.
2. [`outline-template.md`](templates/outline-template.md) — **Level 1 (Layout):** Book act structure, chapter list, thematic arc.
3. [`breakdown-template.md`](templates/breakdown-template.md) — **Level 2 (Chapter Breakdown):** Explicit **Locations**, **Characters**, **Key Events**, **Tone Cap**, and **`[IMG:]` illustration cues** per chapter.
4. [`prose-example.md`](templates/prose-example.md) — **Level 3 (Final Prose):** Source HTML (`<h1>`/`<h2>` chapter tags + `<p>` + `<img src="images/scene_NN.jpg">`), 4-line stanza `poem.html`, and `meta.json`.
5. [`art-album-template.md`](templates/art-album-template.md) — Character visual lock, palette guide, cover composition, and JPG sizing spec.
6. [`song-game-template.md`](templates/song-game-template.md) — Option C audio brief (`Gemini Lyria 3.5` / `Suno` prompt + lyrics) and optional `enemy_metadata.json` combat schema.
7. [`book-qa-checklist.md`](templates/book-qa-checklist.md) — Automated build, manifest, mobile 390px viewport, Magic Circle integrity, and Editor sign-off checklist.
