# Knowledge Base Agent Instructions

These instructions apply to everything under `knowledge/`.

## Purpose

`knowledge/` is the structured story/world knowledge layer of Interactive Library. It exists so humans and AI agents can reason about universes, stories, characters, locations, factions, creatures, deities, artifacts, timelines, decisions, continuity, research, and production state without reconstructing everything from prose.

## Sources of truth

Use this precedence when resolving story knowledge:

1. Published/accepted story content under `books/...`, especially `story_by_chapters.json` and the accepted source manuscript represented by the reader build.
2. Explicit accepted canon decisions in `knowledge/`.
3. Current accepted outlines/breakdowns for production intent only.
4. Older drafts, evaluations, generated rewrites, alternate variants, and superseded documents as production history only.

Google Drive material may be used as migration/provenance input, but after migration the repository is the canonical structured knowledge source. Do not require Drive documents for routine reasoning when their useful structured information has already been normalized here.

## Canon and production metadata

Never collapse these concepts.

- **Canon**: facts currently accepted as true in the fictional universe.
- **Production metadata**: outlines, alternatives, rejected ideas, summaries, prompts, editorial notes, research, TODOs, illustration requests, migration provenance, and design decisions.

A production idea is not canon merely because it appears in a source document.

When evidence conflicts, record the inconsistency in the relevant `continuity.json`. Do not silently choose a creative answer unless the accepted story or an explicit human decision resolves it.

## Do not invent missing canon

If a name, event, relationship, chronology, motivation, location detail, or world rule is not established, keep it unknown or create an explicit TODO.

Good examples:

- `status: open-todo`
- technical IDs such as `elven-forest-city` until a display name is chosen
- `age: null` when chronology is not stated
- a continuity finding describing the missing information

Do not manufacture connective lore merely to make the graph look complete.

## Published prose

Do not alter story prose while performing normalization, cataloging, migration, or continuity review unless the task explicitly requests prose changes.

If canon is resolved but the published story needs a later correction, record a TODO such as `story_edit_status: pending` and describe the required edit.

## IDs and shared entities

- Use stable lowercase kebab-case IDs.
- Define durable shared entities once at the universe level where practical.
- Reference existing IDs instead of creating duplicate definitions.
- Preserve an existing stable ID when wording or presentation changes.
- Do not reuse the same ID for different entities.

Stories may have technical placeholders for unnamed locations/entities. Technical IDs are not automatically canonical display names.

## Story structure

For normalized stories, prefer the established layout:

```text
knowledge/universes/<universe>/
├── universe.json
├── series/
├── characters/
├── locations/
├── factions/
├── creatures/
├── deities/
├── artifacts/
├── facts/
├── relationships/
├── magic/                 # when relevant
└── stories/<story-id>/
    ├── story.json
    ├── chapters.json
    ├── summary.json
    ├── timeline.json
    ├── continuity.json
    ├── production.json
    ├── migration.json
    └── decisions.json     # when useful
```

Do not create empty files merely for symmetry.

## Migration from Drive or other sources

Migrate useful semantics, not documents.

Do not copy whole Google Docs, PDFs, evaluations, or old manuscript versions into `knowledge/`.

Extract only useful structured information such as:

- canon facts and relationships;
- story/chapter summaries;
- chronology;
- production intent;
- accepted decisions;
- unresolved continuity issues;
- editorial signals;
- research provenance;
- migration/source roles.

Keep alternatives and superseded material clearly non-canonical.

## Cross-story reasoning

Later stories can confirm earlier ambiguities. When this happens, update the relevant continuity/canon metadata rather than duplicating the conclusion in prose.

Do not assume that similar names refer to the same place/entity without evidence. Record cross-story identity questions as TODOs when necessary.

## Schema and registries

`knowledge/schema/library.schema.json` applies to standalone knowledge records that use the shared record model.

Compact registry entries may use domain-specific `type` values such as `human`, `elf`, `river`, `fortress`, `goddess`, or continuity classifications. Do not force every nested registry object into the standalone schema ontology.

When adding new standalone record classes, update the schema deliberately rather than bypassing validation.

## Validation

After changing structured knowledge, run:

```bash
python scripts/validate_knowledge.py
```

The validator should remain green. Fix parsing errors, broken structural references, invalid standalone schema records, duplicate standalone records, and missing story files before merging.

## Creative authority

Agents may automatically perform low-risk normalization, indexing, provenance cleanup, and clearly evidence-backed consistency fixes.

Do not silently decide:

- new canon names;
- plot outcomes;
- character deaths/survival not established by evidence;
- new relationships;
- explanations for unexplained events;
- major world rules;
- retcons.

Record them as TODOs or proposed decisions for human review.
