# Interactive Library

A static web-based interactive library that combines rendered storybooks with structured story/world knowledge and curator tooling.

## Project Overview

The repository has three complementary layers:

1. **Reader surface** — browsable interactive books, images, audio, games, navigation, and reading progress.
2. **Knowledge base** — structured universes, stories, characters, locations, deities, factions, creatures, events, maps, facts, summaries, decisions, research, and illustration plans.
3. **Curator** — reusable AI-facing procedures for continuity review, editorial checks, illustration planning, fact checking, catalog maintenance, and progress review.

The goal is to preserve not only the final stories but also the internal logic and development context needed to maintain and extend them consistently.

## Key Features

- **Single Page Interface:** Browse and search the library dynamically.
- **Interactive Books:** Convert story HTML into a richer reading experience with media and game systems.
- **Structured Story Knowledge:** Represent universes, stories, entities, canon, and production metadata as machine-readable data.
- **Canon / Production Separation:** Keep accepted fictional truth separate from outlines, alternatives, TODOs, and rejected ideas.
- **Curator Skill:** Review continuity, editorial quality, illustration coverage, facts, and production state using repository evidence.
- **Automated Tooling:** Python scripts standardise and compile source HTML and generate derived per-book JSON.
- **Static Deployment:** The reader remains deployable on a static host such as GitHub Pages.

## Repository Architecture

```text
Interactive-Library/
├── books/                 # Reader-facing source books and generated book artifacts
├── scripts/               # Compilation and interactive-book engine
├── knowledge/             # Canon + structured story/world/production knowledge
│   ├── schema/
│   └── examples/
├── curator/               # AI curator skill and reusable review prompts
│   ├── SKILL.md
│   └── prompts/
├── generate_books.py
├── interactive_library.js
├── interactive_library.css
└── index.html
```

### Reader Surface

`interactive_library.js` loads the generated manifest and renders the library hub. Individual books are generated from their source HTML and supporting assets. Generated `books/*/index.html` files are build artifacts and should not be edited manually.

### Knowledge Base

`knowledge/` contains human- or agent-maintained source knowledge. Durable entities use stable IDs so stories can reference shared characters, locations, deities, maps, factions, creatures, and events without duplicating definitions.

The most important rule is the distinction between:

- **Canon:** accepted facts in the fictional universe.
- **Production metadata:** outlines, summaries, decisions, alternatives, research, TODOs, prompts, and illustration plans.

Production ideas do not become canon merely because they exist in the repository.

See `knowledge/README.md` and `knowledge/schema/library.schema.json`.

### Curator

`curator/SKILL.md` defines how an AI curator should reason over the reader surface and knowledge base. Its responsibilities include:

- catalog and metadata maintenance;
- canon and continuity checks;
- targeted editorial review;
- missing-illustration identification and image briefs;
- production decision tracking;
- factual/research review;
- progress and next-action recommendations.

Reusable scheduled-review prompts live under `curator/prompts/`.

## Existing Build Pipeline

The Python build process scans `books/`, compiles source HTML into interactive books, and serializes useful derived data such as chapter text, media, image references, and word counts. This generated material can serve as evidence for curator reviews but should remain distinct from human-authored canon and production knowledge.

## How to Add a New Book

1. Download the Google Doc story as zipped HTML.
2. Create a directory for the story under `books/` in the appropriate series/category.
3. Unzip the source there and remove the zip file.
4. Add required supporting assets such as `cover.jpg`, `poem.html`, and `song.mp3`.
5. Add or update the directory's `meta.json`.
6. Run the book generation pipeline.
7. Add structured knowledge for the story/universe when useful, referencing stable entity IDs rather than duplicating shared facts.

## Development Reference

See `AGENTS.md` for detailed build instructions, interactive-book engine behavior, combat logic, keyboard controls, responsive design rules, and other implementation constraints.
