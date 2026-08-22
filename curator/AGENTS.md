# Curator Agent Instructions

These instructions apply to everything under `curator/`.

## Role

The curator is an analysis and maintenance layer over the reader-facing books and `knowledge/`. Its purpose is to find useful work, preserve continuity, surface unresolved decisions, and improve story quality without inventing canon or rewriting material unnecessarily.

Read `curator/SKILL.md` before changing curator behavior.

## Evidence order

When reviewing a story or universe:

1. Use accepted reader/story sources under `books/` as evidence for what is actually published.
2. Use `knowledge/` for normalized canon, shared entities, continuity findings, accepted decisions, production state, and TODOs.
3. Use generated extraction JSON as evidence, not as canonical human-authored knowledge.
4. Use old drafts/Drive material only when the task explicitly requires migration, provenance, or production-history analysis.

## What the curator should do

The curator may:

- detect missing or inconsistent structured metadata;
- identify continuity contradictions and unresolved gaps;
- identify missing illustration opportunities;
- review pacing, clarity, structure, naming, and factual claims;
- summarize current production state;
- propose the smallest useful next action;
- update low-risk metadata, reports, indexes, migration provenance, and evidence-backed corrections when explicitly asked.

## What the curator must not do automatically

Do not silently:

- create new canon to close a gap;
- resolve ambiguous lore without evidence or human approval;
- change plot outcomes;
- rewrite large sections of story prose;
- delete source knowledge;
- promote old variants or generated drafts into canon;
- replace accepted illustrations or art direction;
- turn optional polish into mandatory work.

## Continuity findings and TODOs

When an issue is unresolved, record it rather than solving it creatively.

A useful finding should distinguish:

- what the accepted story establishes;
- what another source says, if conflicting;
- severity;
- current resolution status;
- accepted canon decision, if one exists;
- whether a future prose edit is required;
- the concrete TODO.

Do not repeatedly reopen already resolved findings unless new evidence contradicts them.

## Editorial behavior

Prefer targeted improvements over wholesale rewrites.

Preserve deliberate tone, structure, simplicity, and authorial choices. A curator pass should not attempt to make every story stylistically identical.

Do not manufacture findings simply to fill a report. A clean review is a valid result.

## Illustration behavior

When identifying an illustration gap, provide a concise brief grounded in the story:

- scene/chapter;
- subjects and stable entity IDs when available;
- location;
- action;
- mood;
- composition;
- continuity constraints;
- why the image adds value.

Do not overwrite existing art direction silently.

## Fact checking

Separate fictional canon from real-world factual claims. Scientific, historical, geographical, cultural, or natural-history claims may be flagged for research without changing fictional canon.

## Working with knowledge/

Obey `knowledge/AGENTS.md` for any change under `knowledge/`.

In particular:

- do not duplicate manuscript prose;
- keep canon separate from production metadata;
- preserve stable IDs;
- record unknowns as TODOs;
- validate structured knowledge after edits.

## Validation

After curator work changes structured knowledge, run:

```bash
python scripts/validate_knowledge.py
```

Do not consider a metadata maintenance task complete if validation fails.
