# Book Build, Evaluation Rubric & High-Level QA Checklist

> **Owner:** `builder` (compilation & automated checks) + `reviewer` (read-only rubric audit) + `editor` (Gate G6 sign-off vs. original `Ideas & Concept Brief`)

## 1. Required Baseline Files (`books/<Book_Dir>/`)
- [ ] Single source HTML `<Book_Slug>.html` (not `index.html`) containing the **Intro block before `<h1>Chapter 1: ...</h1>`** plus `<h1>` chapters, `<p>`, and `<img src="images/...">`
- [ ] `cover.jpg` (verified JPEG, zero embedded text/watermarks)
- [ ] `images/` directory with all scene `.jpg` assets referenced by HTML (zero `.png` or `.zip` leftovers)
- [ ] `poem.html` (`<strong>` title + 5–6 rhyming 4-line stanzas)
- [ ] `song.mp3` (verified playable audio track from Suno upload or Lyria)
- [ ] `meta.json` (`title`, `author`, `tags[]`, `blurb`, `children_order[]`) and updated series `meta.json` `children_order` if inside a series

## 2. Automated Build & Validation Commands

Never edit compiled `books/*/index.html` or `books/manifest.json` by hand:

```bash
# 1. Compile interactive books, sync scripts/contents/, and regenerate books/manifest.json
python3 generate_books.py

# 2. Validate knowledge/ JSON schema & entity integrity
python3 scripts/validate_knowledge.py
```

## 3. Compiled Output & Technical QA Checks (`builder`)
- [ ] Generated outputs exist: `index.html`, `story_by_chapters.json`, `interactive_book_images.json`, `interactive_book_media.json`, `interactive_book_parapragh_texts.json`, `interactive_book_word_count.json`, `contents/`
- [ ] **`story_by_chapters.json` contains Chapter 1 through Chapter N** (confirm Intro block prevented Chapter 1 from being sliced off!)
- [ ] Compiled `index.html` links `#readingProgressBar`, `.song-banner`, `.poem-btn`, chapter selector, and `interactive_book.css` (`touch-action: manipulation`, portrait mobile scaling)
- [ ] If combat is enabled: `.magic-circle-container` remains `aspect-ratio: 1 / 1` and all `enemy_metadata.json` keys match `images/*.jpg` verbatim
- [ ] `books/manifest.json` lists the new book in the expected series position

## 4. Reviewer 6–7 Dimension Chapter Rubric (`1–10` Audit)
Record scores and concrete notes across every chapter before passing Gate G6:

| Dimension | Score (`1–10`) | Evaluation Check |
|---|---|---|
| **World-Building** | — | Sensory geography, architecture, guild/civic/natural texture |
| **Theme & Message** | — | `Commandment / Metaphysical Rule` proven by choices & consequences |
| **Character Development** | — | Agency, internal weight/reflection, authentic camaraderie |
| **Conflict & Resolution** | — | Smart enemy counter-moves, unhurried multi-beat climax |
| **Magic / Tactical System** | — | Coherent elemental logic or terrain/battlefield maneuvering |
| **Pacing & Structure** | — | Meets preset word budget; breathing space between action spikes |
| **Educational / Cultural Value** | — | Natural laws (`elemental-wonder`) or civic/historical craft (`heroic-saga`) |

## 5. High-Level Editor Sign-Off (Gate G6)
- [ ] Preset scale, dialogue balance, prose voice, art style, and music genre match the approved `Ideas & Concept Brief`
- [ ] Any new canonical characters, locations, factions, or series entries are recorded in `knowledge/` cleanly without retconning published books
