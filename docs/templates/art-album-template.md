# Illustrations & Art Album Template (`cover.jpg` & `images/*.jpg`)

> **Owner:** `illustrator` · **Engine:** Gemini Image API (host-side adapter, zero secrets in repo) or approved manual `.jpg` drop

## 1. Character & Style Lock Sheet

Copy and fill per protagonist before generating any spread so all frames share one silhouette and palette:

- **Protagonist Lock:** e.g. *Pip — small round-snouted cloud-dragon, soft sky-blue scales (`#7DB8E8`), warm amber wingtips and tail lantern (`#F0AE52`), expressive gentle eyes.*
- **Visual Style:** Soft storybook watercolor & gouache wash, rounded shapes, diffused warm light, zero harsh black ink shadows, zero neon gradients, no embedded text inside images.
- **Aspect & Framing:**
  - `cover.jpg`: Portrait storybook ratio (e.g. `3:4` or `1000×1333` JPEG), leaving **clean open sky/breathing space in the top 25%** for library card title overlays.
  - Scene plates (`images/chNN_*.jpg`): Standardized `.jpg` (avoid `.png`; `generate_books.py` / `images_png_to_jpg()` strips transparency to white JPEG).

## 2. Scene Shot List (Traceable to Breakdown `[IMG:]` Cues)

| Filename | Chapter | Action & Composition | Continuity Lock |
|---|---|---|---|
| `cover.jpg` | Cover | Wide heroic/cozy cover portrait with protagonist in lower-middle third | Sky/top 25% uncluttered |
| `images/ch01_nest.jpg` | Ch. 1 | Hero peeking from fluffy cloud blanket under dawn mist | Matches Ch. 1 Breakdown props |
| `images/ch02_valley.jpg` | Ch. 2 | Rain clouds drifting peacefully above blooming valley flowers | Consistent scale & colors |

## 3. Cover Selection Mockup Gate (Gate G5)
- Generate **2–3 distinct cover candidates** (`cover_A.jpg`, `cover_B.jpg`, `cover_C.jpg`) before finalizing `cover.jpg` so the operator can pick the winner in one tap from LifeOS `Runs` / `Today`.
- Any operator tweak feedback is saved automatically into Illustrator's persistent corrections memory.
