#!/usr/bin/env python3
"""Validate Interactive Library knowledge JSON.

Checks:
- every knowledge JSON file parses;
- every object carrying both ``id`` and ``type`` validates against the shared schema;
- duplicate (type, id) records are rejected;
- explicit *_id / *_ids references resolve when their target type is known;
- story reader_source paths exist;
- normalized_data file references exist relative to the story directory.
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
KNOWLEDGE = ROOT / "knowledge"
SCHEMA_PATH = KNOWLEDGE / "schema" / "library.schema.json"

REFERENCE_TYPES = {
    "universe_id": "universe",
    "series_id": "series",
    "story_id": "story",
    "story_ids": "story",
}


def walk_objects(value: Any, source: Path) -> Iterable[tuple[dict[str, Any], Path]]:
    if isinstance(value, dict):
        yield value, source
        for child in value.values():
            yield from walk_objects(child, source)
    elif isinstance(value, list):
        for child in value:
            yield from walk_objects(child, source)


def iter_paths(value: Any) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            if isinstance(item, str):
                yield item
    elif isinstance(value, dict):
        for item in value.values():
            if isinstance(item, str):
                yield item


def main() -> int:
    errors: list[str] = []
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema)

    parsed: dict[Path, Any] = {}
    records: list[tuple[dict[str, Any], Path]] = []
    index: dict[tuple[str, str], list[Path]] = defaultdict(list)

    for path in sorted(KNOWLEDGE.rglob("*.json")):
        if path == SCHEMA_PATH:
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            parsed[path] = data
        except Exception as exc:
            errors.append(f"{path.relative_to(ROOT)}: invalid JSON: {exc}")
            continue

        for obj, source in walk_objects(data, path):
            if "id" in obj and "type" in obj:
                records.append((obj, source))
                for error in validator.iter_errors(obj):
                    where = ".".join(str(p) for p in error.absolute_path) or "<record>"
                    errors.append(
                        f"{source.relative_to(ROOT)} [{obj.get('type')}:{obj.get('id')}] {where}: {error.message}"
                    )
                if isinstance(obj.get("id"), str) and isinstance(obj.get("type"), str):
                    index[(obj["type"], obj["id"])].append(source)

    for key, sources in sorted(index.items()):
        if len(sources) > 1:
            unique_sources = sorted({str(p.relative_to(ROOT)) for p in sources})
            # The same entity may be mentioned inline more than once in one registry only if it
            # is not intended as a durable record. Durable duplicate definitions are rejected.
            if len(unique_sources) > 1 or len(sources) > 1:
                errors.append(f"duplicate record {key[0]}:{key[1]} in {', '.join(unique_sources)}")

    for obj, source in records:
        for field, target_type in REFERENCE_TYPES.items():
            if field not in obj:
                continue
            values = obj[field] if isinstance(obj[field], list) else [obj[field]]
            for ref in values:
                if not isinstance(ref, str):
                    errors.append(f"{source.relative_to(ROOT)}: {field} must contain string IDs")
                elif (target_type, ref) not in index:
                    errors.append(
                        f"{source.relative_to(ROOT)} [{obj.get('type')}:{obj.get('id')}]: "
                        f"broken {field} reference -> {target_type}:{ref}"
                    )

        if obj.get("type") == "story":
            reader_source = obj.get("reader_source")
            if reader_source and not (ROOT / reader_source).exists():
                errors.append(
                    f"{source.relative_to(ROOT)} [{obj.get('id')}]: missing reader_source {reader_source}"
                )
            normalized_data = obj.get("normalized_data")
            if normalized_data is not None:
                for rel in iter_paths(normalized_data):
                    if not (source.parent / rel).exists():
                        errors.append(
                            f"{source.relative_to(ROOT)} [{obj.get('id')}]: missing normalized_data file {rel}"
                        )

    if errors:
        print(f"Knowledge validation failed with {len(errors)} error(s):")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Knowledge validation passed: {len(parsed)} JSON files, {len(records)} typed records.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
