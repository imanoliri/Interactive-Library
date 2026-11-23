# Interactive Library — Story Bible & Storybook Studio Contract

This document defines canonical story boundaries, story presets, authentic craft benchmarks, and the **Storybook Studio** production workflow for adding new books to `Interactive-Library`.

## 1. Source-of-Truth & Canon Hierarchy

Follow `knowledge/AGENTS.md` and `curator/SKILL.md` strictly when resolving universe facts:

1. **Published books (`books/`)** — Accepted `.html` source manuscripts, `story_by_chapters.json`, `poem.html`, and book `meta.json` files are authoritative.
2. **Structured Canon (`knowledge/`)** — Universes, series, characters, locations, magic rules, timelines, and unresolved continuity `TODO` entries under `knowledge/universes/<universe>/`.
3. **Production Metadata (`docs/templates/`, outlines, breakdowns, variant matrices)** — Non-canonical working blueprints. Never treat an unbuilt outline or alternate variant as canonical fact until published or recorded as an accepted canon decision.
4. **Never invent missing canon silently** — If chronology, lineage, or world rules are unestablished, check `knowledge/` first, record an open question for the Team Lead (`editor`), and preserve existing continuity.

---

## 2. Active Story Universes & Series

### Valley of Dragons (`books/Valley_of_Dragons/`, `knowledge/universes/valley-of-dragons/`)
- **Published order (`books/Valley_of_Dragons/meta.json` `children_order`):**
  1. `Attack_of_the_Dark_God` (*Valley of Dragons I: Attack of the Dark God*)
  2. `Winter_of_Wolves` (*Valley of Dragons II: Winter of Wolves*)
  3. `Clash_Under_the_Mountain` (*Valley of Dragons III: Clash Under the Mountain*)
- **Core world & tone:** Humans, elves, dragons, and allied realms (including the dwarven Kingdom of Khazad-Throm) coexisting as free peoples; Dragon Rider Knights sworn to defend freedom, legitimate authority by consent, honor, tactical courage, and lasting diplomacy.
- **Adding installments:** Append the new folder slug to `books/Valley_of_Dragons/meta.json` `children_order` *before* running `generate_books.py`; standalone tales belong directly under `books/<Book_Slug>/`.

### The Paths of Magic (`books/Paths_of_Magic/`, `knowledge/universes/paths-of-magic/`)
- **Core magic principle:** Deeper mastery and observation of an element's real essence and natural laws unlock stronger magic (seven core paths studied by Magnus: Water, Trees, Earth, Sun, Wind, Fire, Lightning).
- **10-Node Combat Magic Circle (`scripts/magic_combat_system.js`):**
  - Exact invariant order: `['Water', 'Trees', 'Earth', 'Sun', 'Wind', 'Fire', 'Storm', 'Life', 'Darkness', 'Undead']`.
  - **Never reorder these 10 nodes** or alter `magic_combat_system.js` vector geometry; per-book encounters configure only `enemy_metadata.json`.

---

## 3. Extensible Story Presets (`ideas-brief-template.md`)

Every new book declares a **Story Preset** in `Ideas & Concept Brief` (`ideas`). Start from one of the calibrated presets below or define a new named saga preset in the brief using the same 7 columns so all downstream roles stay aligned:

| Preset ID | Chapters & Words | Prose & Dialogue Voice | Theme / Educational Spine | Visual Style & Plates | Music Genre (`song.mp3`) | Combat (`enemy_metadata.json`) |
|---|---|---|---|---|---|---|
| `heroic-saga` | `8–11` ch · `8,000–12,000` words (`~750–1,200` w/ch + extra budget for battles/climaxes) | Accessible simple/medium 3rd-person; crisp purposeful dialogue (`30–45%` of paras); short punchy beats at turns; tactical & political clarity | Explicit **Commandment**, **Metaphysical Rule**, and **Message**; civic/cultural/military depth (alliances, logistics, crafts, diplomacy) | Painterly high-fantasy RPG illustration; dramatic torch/crystal/forge/sun lighting; iconic cover + `2–5` plates/ch (`20–40` total) | Epic symphonic / melodic power-metal fantasy anthem (war drums, guitars, brass, baritone + war choir) | Usually `skip` (or `enable` for key bosses) |
| `elemental-wonder` | `8–10` ch · `8,000–10,000` words (`~900–1,100` w/ch + special scene budget) | Wonder-driven 3rd-person chronicle; observation & discovery; light dialogue (`5–15%`) | Curiosity, observation & mastery through understanding; real-world natural phenomena woven into magic | Painterly high-fantasy RPG / arcane discovery plates; glowing artifacts & creatures; `4–8` plates/ch (`40–80` total) | Mystical bardic harp / Celtic-fantasy folk ballad (plucked harp, strings, clear tenor) | Often `enable` (`enemy_metadata.json` elemental roster) |
| `shorter-kids-tale` | `4–6` ch · `2,500–4,500` words (`~500–750` w/ch) | Simple warm read-aloud 3rd-person; clear emotional arc and dialogue (`25–40%`) | Gentle moral takeaway, curiosity, teamwork, hopeful resolution | Painterly storybook illustration or soft gouache/watercolor; `2–3` plates/ch (`10–15` total) | Warm acoustic storybook folk / gentle lullaby (fingerpicked guitar, celesta, flute) | `skip` (or friendly non-lethal trials) |

### Registering Future Saga Presets
When launching a new series or tone (e.g., maritime/pirate swashbuckling, Nordic sea voyage, frontier mystery), `editor` adds a new row to the Ideas Brief and `STORY_BIBLE.md` specifying:
1. Chapter count, word budget per chapter, and climax extra word allowance.
2. Language register (`simple` or `medium`), dialogue target, and ending type (`triumphant resolution` or `open continuation`).
3. Moral spine (`Commandment`, `Metaphysical Rule`, `Message`) + educational/cultural focus.
4. Art direction lock, plate density, and Suno/Lyria music genre tags.

---

## 4. Signature Craft DNA (Calibrated to Published Books)

1. **Moral & Thematic Spine:** Stories feel grounded when driven by a crisp **Commandment** (e.g., *"Help good people"*, *"Resist tyranny"*), a **Metaphysical Rule** (e.g., *"True authority comes from consent of the governed"*), and a lived **Message** proven through action rather than speeches.
2. **Cultural, Civic & Tactical Authenticity:** Ground scenes in how worlds actually work — river trade, smithing, logistics, map-table strategy, chokepoint defenses, terrain constraints (e.g., dragons adapting to caverns), alliances, and post-victory treaties.
3. **Earned Emotion & Unhurried Climaxes:** Pair tactical plot progression with brief character reflection, camaraderie, and genuine back-and-forth struggle in decisive duels — never rush an endgame battle into two summary paragraphs.
4. **HTML Reader Parser Requirement (`scripts/interactive_book_from_html.py`):**
   - Always place a brief **Intro block** (Title + premise paragraph + numbered `<ol>` chapter list + target scale/tone line) *before* the first `<h1>Chapter 1: ...</h1>` tag so `parse_html_book()` creates the `Intro` tab and maps `Chapter 1..N` cleanly into `story_by_chapters.json` without dropping Chapter 1.
5. **Heroic Ballad (`poem.html`) + Verbatim Song (`song.mp3`):**
   - Write `poem.html` as `<strong>Title</strong>` followed by `5–6` four-line rhyming stanzas (`AABB` or `AABB`/`ABAB` ballad meter) retelling the entire story from opening peace to climax and final triumph.
   - `song.mp3` adapts `poem.html` verbatim into Suno / Lyria lyrics so reader music and poem match seamlessly.

---

## 5. Storybook Studio 6-Role Team & Skills Map

| Role | ID | Access | Skill (`SKILL.md`) | Responsibility |
|---|---|---|---|---|
| **Editor (Lead)** | `editor` | Read/Write (`docs`, `books`, `knowledge`) | `.agents/skills/story-direction/SKILL.md`, `curator/SKILL.md` | Owns `Ideas & Concept Brief`, presets, moral spine, variant testing, canon/continuity checks, Lead-only operator checkpoints, and Gate G6 sign-off. |
| **Writer** | `writer` | Read/Write (`books`) | `.agents/skills/heroic-fantasy-prose/SKILL.md` | Drafts `1. Outline` → `2. Chapter Breakdown` → `3. Final Prose` (`<Book>.html`, `poem.html`, `meta.json`) chapter-by-chapter to preset word budgets. |
| **Reviewer** | `reviewer` | **Read-Only** | `.agents/skills/story-chapter-critique/SKILL.md`, `curator/SKILL.md` | Scores Outline, Breakdown, and Prose on the 6–7 dimension rubric (1–10), audits `knowledge/` continuity, and catches rushed pacing without editing files. |
| **Illustrator** | `illustrator` | Read/Write (`books`) | `.agents/skills/fantasy-art-direction/SKILL.md` | Locks character/faction/world visuals, creates 2–3 cover candidates (`cover.jpg`), and renders cohesive painterly RPG scene plates (`images/*.jpg`). |
| **Music & Games** | `music-games` | Read/Write (`books`) | `.agents/skills/ballad-music-combat/SKILL.md` | Outputs structured `Style:` + verbatim `poem.html` lyrics for Suno / Lyria (`song.mp3`) and optional `enemy_metadata.json` encounters. |
| **Book Builder** | `builder` | Read/Write (`books`, `scripts`) | `.agents/skills/interactive-book-build/SKILL.md` | Runs `generate_books.py`, `scripts/generate_manifest.py`, and `scripts/validate_knowledge.py`; verifies mobile UX, assets, and PR build; never edits `books/*/index.html`. |
