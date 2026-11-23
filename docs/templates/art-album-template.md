# Illustrations & Art Album Template (`cover.jpg` & `images/*.jpg`)

> **Owner:** `illustrator` · **Engine:** Gemini Image API (host-side adapter, zero secrets in repo) or approved manual `.jpg` drop

## 1. Character, Creature & Architecture Visual Lock Sheet

Lock every recurring hero, companion, antagonist, faction crest, and setting palette before generating any plate:

- **Art Style Lock (`heroic-saga` / `elemental-wonder` default):** Rich **painterly high-fantasy RPG illustration** — crisp forged armor, weathered stone and timber, distinct facial proportions, dramatic chiaroscuro lighting (warm firelight/amber torches vs. deep cobalt cavern shadows or sunlit valley greens). **Zero embedded text, zero signatures, zero watermarks, zero neon sci-fi glow.** *(Use warm storybook gouache only when preset is `shorter-kids-tale`.)*
- **Hero & Companion Lock:** e.g. *Alaric — battle-worn silver steel plate with red dragon crest on chest/pauldrons, practical dark leather cloak; Vaelor — lean sapphire-blue dragon with broad leathery wings and golden-amber eyes.*
- **Allies & Factions Lock:** e.g. *Dwarven warriors of Khazad-Throm — stout proportions, heavy iron/bronze engraved pauldrons, braided copper or white beards bound with iron rings; elven envoys — silver-filigree robes of forest blue.*
- **Cover Framing (`cover.jpg`):** Portrait/square high-drama centerpiece (iconic villain on stone throne, dragon-knight silhouette before burning ruins, or glowing arcane tome/artifact). Leave the top `20–25%` clean of busy detail with **zero text overlays**.
- **Format Standard:** Save directly as `.jpg` inside `books/<Book_Dir>/images/` (`generate_books.py` converts stray `.png` against white backgrounds).

## 2. Chapter Scene Shot List (`2–5` plates/ch for `heroic-saga`; `4–8` for `elemental-wonder`)

| Filename | Chapter | Action & Composition | Continuity Lock |
|---|---|---|---|
| `cover.jpg` | Cover | Iconic dramatic cover composition (2–3 candidate options at Gate) | Zero text/watermarks; top margin clean |
| `images/ch01_council_arrival.jpg` | Ch. 1 | Knights in Dragon Crest armor seated with envoy around Castle Tarn hall | Matching crests, stained glass, torches |
| `images/ch02_mountain_gate.jpg` | Ch. 2 | Dwarven king welcoming knights and elf envoy inside crystal-lit obsidian halls | Consistent armor/robes & rune doorway |
| `images/ch04_chasm_strike.jpg` | Ch. 4 | Sapphire dragon plunging into subterranean chasm over narrow stone bridges | Consistent Vaelor scale color & dwarf shield wall |

## 3. Cover Selection Mockup Gate
- Generate **2–3 distinct cover candidates** (`cover_A.jpg`, `cover_B.jpg`, `cover_C.jpg`) before finalizing `cover.jpg` so the operator can pick the winner in one tap from LifeOS `Runs` / `Today`.
- Any operator tweak feedback saves automatically into Illustrator's persistent `memory.md` corrections.
