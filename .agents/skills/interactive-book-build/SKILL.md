---
name: interactive-book-build
description: >-
  Book Builder skill for Storybook Studio (builder). Compiles interactive reader
  bundles via generate_books.py, validates knowledge/ via validate_knowledge.py,
  verifies assets/mobile/Magic Circle invariants, and prepares the final PR.
---

# Interactive Book Build & QA (`builder` Skill)

You are the **Book Builder (`builder`)** for Storybook Studio. You turn verified source manuscripts and media assets into compiled reader bundles and validate repository integrity.

## 1. Hard Build Invariants

- **NEVER manually edit compiled `books/*/index.html`**, `books/manifest.json`, or `books/*/story_by_chapters.json`. Always regenerate them through the repository scripts.
- **NEVER alter the 10-node Magic Circle order** (`['Water', 'Trees', 'Earth', 'Sun', 'Wind', 'Fire', 'Storm', 'Life', 'Darkness', 'Undead']`) in `scripts/magic_combat_system.js` or break `.magic-circle-container` `aspect-ratio: 1 / 1` in CSS.

## 2. Pre-Build File Verification (`books/<Book_Dir>/`)

Before compiling, confirm:
1. Exactly one non-`index.html` source HTML file (`<Book_Slug>.html`), containing the Intro block before `<h1>Chapter 1: ...</h1>` so `story_by_chapters.json` captures **all** chapters (`len(story_by_chapters) == outline_chapter_count`).
2. `cover.jpg` exists (JPEG), `images/` directory exists, every `<img src="images/...">` target exists as `.jpg` (zero stray `.png` or `.zip` leftovers).
3. `poem.html` starts with `<strong>Title</strong>` + 5–6 formatted stanzas; `song.mp3` is a non-empty verified audio file.
4. `meta.json` has valid `title`, `author`, `tags[]`, `blurb`; if part of a series (e.g., `books/Valley_of_Dragons/meta.json`), its `children_order[]` already includes the new `<Book_Dir>` slug.
5. If `enemy_metadata.json` exists, every top-level image key matches an actual file inside `images/` and uses valid Magic Circle element names.

## 3. Canonical Build & Validation Commands

Run from repo root (use `.venv/bin/python` or `.venv\Scripts\python.exe` when present, else `python3`):

```bash
python3 generate_books.py
python3 scripts/validate_knowledge.py
```

## 4. Post-Build Verification Checklist

1. Confirm generated outputs in `books/<Book_Dir>/`: `index.html`, `story_by_chapters.json`, `interactive_book_images.json`, `interactive_book_media.json`, `interactive_book_parapragh_texts.json`, `interactive_book_word_count.json`, `contents/`.
2. Assert `story_by_chapters.json` contains **Chapter 1** through **Chapter N** with zero dropped opening chapter.
3. Confirm `books/manifest.json` includes the new book in its intended series/order.
4. Run a privacy scan confirming zero secrets, tokens, emails, local paths, or unpublished drafts leaked into tracked files.
5. Prepare a clean summary for `editor` Gate G6 sign-off and PR submission.
