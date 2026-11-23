# Ideas & Concept Brief Template

Use this brief when pitching a new book to **Editor (`editor`)** before writing starts.

## Story Identity & Preset
- **Story Preset:** `heroic-saga` | `elemental-wonder` | `shorter-kids-tale` | `<new-saga-preset>` (see `docs/STORY_BIBLE.md`)
- **Working Title:** e.g. *Valley of Dragons: Siege of the Iron Citadel* (or standalone title)
- **Folder Slug (`books/`):** e.g. `Valley_of_Dragons/<Book_Slug>` (or top-level `books/<Book_Slug>`)
- **Universe / Series:** `Valley of Dragons` | `Paths of Magic` | `Standalone`
- **Series Order (`children_order`):** Append after existing books in series `meta.json`, or `standalone`
- **Chapter & Word Budget:** e.g. `8–11 chapters · ~800–1,100 words/ch + 1,000 extra climax battle words (~9,000–12,000 words total)`
- **Language & Ending:** e.g. `Simple/medium accessible English · 3rd person · Epic & tactical tone · Triumphant alliance ending` (or `Wonder-driven open continuation`)

## Moral & Thematic Spine
- **Commandment:** Crisp imperative driving the heroes' choices (e.g., *"Help good people"*, *"Resist tyranny"*, *"Seek true understanding"*).
- **Metaphysical Rule:** Truth about how power, authority, or nature works in this world (e.g., *"Helping other good people builds rightful allies against darkness"*, *"Understanding an element's essence unlocks mastery"*).
- **Message:** What the reader experiences proven through action and dilemma.

## Educational & Cultural Pillars
- List 2–3 real-world principles, historical/civic institutions, crafts, or natural phenomena showcased (e.g., *chokepoint fortifications & flanking tactics; mountain mining, smithing & trade treaties; currents, thermal drafts & crystal refraction*).

## Premise & Narrative Arc
- **Opening Hook:** Starting peace or curiosity, and the envoy/omen/discovery that sets the journey in motion.
- **Escalation & Turning Point:** Mid-story obstacles where familiar advantages are constrained (e.g., open-sky flyers forced into narrow tunnels or unknown civic rules).
- **Climax & Aftermath:** Decisive unhurried confrontation plus the lasting treaty, legacy, or wider horizon restored afterward.

## Optional Variants Matrix (Recommended for Complex Plots)
When comparing alternative moral or perspective framings before locking the outline, record a quick table (non-canonical until chosen):

| Variant | Moral Premise / Who Is Right | POV & Major Difference | Decision (`chosen` / `rejected`) |
|---|---|---|---|
| Variant A | `<e.g. Alliance aids besieged free realm>` | `<e.g. Heroes partner with defenders>` | `chosen` |
| Variant B | `<e.g. Aggressors hide greed behind plea>` | `<e.g. Mid-book perspective flip>` | `rejected` |

## Canon Anchors (`knowledge/`)
- List established `knowledge/` entity IDs referenced (characters, dragons, locations, factions, magic rules) or explicitly note `"Original standalone realm"`.
- Record open lore questions for **Editor** review at Gate G1 instead of inventing unverified canon.

## Production Switches
- **Combat Mini-Game (`enemy_metadata.json`):** `skip` | `enable` (for creature/elemental encounters)
- **Music Mode (`song.mp3`):** `suno` (default — genre-matched Style + `poem.html` lyrics at Gate G5) | `gemini_lyria`
- **Music Style Preset:** `heroic-saga` (Power Metal Anthem) | `elemental-wonder` (Bardic Harp Ballad) | `shorter-kids-tale` (Acoustic Folk) | `<custom tags>`
