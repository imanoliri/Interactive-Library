# Interactive Library Knowledge Base

This directory stores structured knowledge that sits underneath the rendered interactive books.

## Purpose

The library has two surfaces:

1. **Reader surface** — rendered books, images, audio, games, and navigation.
2. **Knowledge surface** — canon, universes, story structure, summaries, decisions, research, maps, entities, and production state.

The knowledge surface exists so humans and AI agents can reason about the collection without having to reconstruct context from prose every time.

## Core rule: canon vs production

Never mix accepted fictional truth with brainstorming or process notes.

- `canon/` contains facts currently accepted as true in a universe.
- `production/` contains outlines, summaries, alternatives, decisions, prompts, TODOs, research notes, illustration plans, and rejected ideas.

A rejected or superseded production idea must never be treated as canon unless a later accepted decision promotes it.

## Entity hierarchy

```text
Universe
├── Series
│   └── Story
│       ├── Chapters
│       ├── Decisions
│       ├── Summaries
│       ├── Illustrations
│       └── Research
├── Characters
├── Locations
├── Deities
├── Factions
├── Creatures
├── Events
├── Timeline
├── Maps
└── Facts
```

## IDs and references

All durable entities should have stable lowercase kebab-case IDs. Cross-links should reference IDs instead of duplicating full objects.

Example:

```json
{
  "id": "thor",
  "type": "deity",
  "universe_id": "sons-of-the-fjords",
  "name": "Thor",
  "domains": ["thunder", "strength", "protection"]
}
```

A story can then reference `thor` in its `deity_ids` array.

## Relationship to books/

The existing `books/` tree remains the reader-facing library. Knowledge files may reference a book by `book_path`, and future tooling may progressively generate or validate knowledge records from the book sources.

Generated extraction JSON such as chapter text, images, media, and word counts remains build output. Human-authored knowledge in this directory should be treated as source data unless explicitly marked generated.
