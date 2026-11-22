# Book Build & High-Level QA Checklist

> **Owner:** `builder` (compilation & automated checks) + `editor` (Gate G6 high-level review vs. original `Ideas & Concept Brief`)

## 1. Required Baseline Files (`books/<Book_Dir>/`)
- [ ] Single source story file `<Book_Slug>.html` (not named `index.html`), structured cleanly with `<h1>` / `<h2>` chapters and `<p>` blocks
- [ ] `cover.jpg` (landscape/portrait JPEG, uncluttered upper title zone)
- [ ] `images/` directory exists (even if empty before scene plates are added)
- [ ] `contents/` directory exists (auto-synced from `scripts/contents/` when running `generate_books.py`)
- [ ] `poem.html` (`<strong>` title + short stanzas)
- [ ] `song.mp3` (verified playable audio track from Gemini Lyria 3.5 or Suno upload)
- [ ] `meta.json` (`title`, `author`, `tags[]`, `blurb`, `children_order[]`)
- [ ] Series `meta.json` updated (`children_order` includes the new `<Book_Dir>` slug if inside a series directory)

## 2. Automated Build & Validation Commands

Never edit any compiled `books/*/index.html` by hand — regenerate via the canonical scripts:

```powershell
# 1. Compile HTML books, convert PNG->JPG, sync scripts/contents/, and regenerate books/manifest.json
.\.venv\Scripts\python.exe generate_books.py

# 2. (Optional standalone) Refresh books/manifest.json
.\.venv\Scripts\python.exe scripts\generate_manifest.py

# 3. Validate knowledge/ JSON schema & entity integrity
.\.venv\Scripts\python.exe scripts\validate_knowledge.py
```

## 3. Compiled Output & Mobile Viewport Checks
- [ ] Generated outputs exist: `index.html`, `story_by_chapters.json`, `interactive_book_images.json`, `interactive_book_media.json`, `interactive_book_parapragh_texts.json`, `interactive_book_word_count.json`, `contents/`
- [ ] Zero leftover `.zip` archives or stray `.png` images inside `books/<Book_Dir>/`
- [ ] Compiled `index.html` includes `#readingProgressBar`, `.song-banner`, `.poem-btn`, chapter tabs, and links `interactive_book.css` (`touch-action: manipulation`, `@media (orientation: portrait)` mobile rules)
- [ ] If combat is enabled: `.magic-circle-container` remains `aspect-ratio: 1 / 1` and all `enemy_metadata.json` image keys match `images/*.jpg` paths verbatim
- [ ] `books/manifest.json` lists the new book in the expected series position

## 4. High-Level Editor Sign-Off (Gate G6)
- [ ] Reading level, tone, and chapter flow match the original `ideas-brief-template.md` pitch
- [ ] Any new canonical characters/locations/decisions are recorded in `knowledge/` without inventively altering prior stories
