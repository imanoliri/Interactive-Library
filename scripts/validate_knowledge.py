#!/usr/bin/env python3
"""Validate Interactive Library structured knowledge."""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
KNOWLEDGE = ROOT / "knowledge"
SCHEMA_PATH = KNOWLEDGE / "schema" / "library.schema.json"
ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
REFERENCE_TYPES = {"universe_id": "universe", "series_id": "series", "story_id": "story", "story_ids": "story"}
REGISTRY_KIND_BY_DIR = {
    "characters": "character", "locations": "location", "deities": "deity",
    "factions": "faction", "creatures": "creature", "artifacts": "artifact",
}


def walk_objects(value: Any) -> Iterable[dict[str, Any]]:
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk_objects(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_objects(child)


def iter_paths(value: Any) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        yield from (x for x in value if isinstance(x, str))
    elif isinstance(value, dict):
        yield from (x for x in value.values() if isinstance(x, str))


def main() -> int:
    errors: list[str] = []
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema)
    schema_types = set(schema["properties"]["type"]["enum"])

    parsed_count = 0
    standalone: list[tuple[dict[str, Any], Path]] = []
    typed_index: dict[tuple[str, str], Path] = {}
    registry_index: dict[tuple[str, str, str], list[Path]] = defaultdict(list)

    for path in sorted(KNOWLEDGE.rglob("*.json")):
        if path == SCHEMA_PATH:
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            parsed_count += 1
        except Exception as exc:
            errors.append(f"{path.relative_to(ROOT)}: invalid JSON: {exc}")
            continue

        # Standalone schema records use the schema's record-class type vocabulary.
        if isinstance(data, dict) and data.get("type") in schema_types and "id" in data:
            standalone.append((data, path))
            for error in validator.iter_errors(data):
                where = ".".join(str(p) for p in error.absolute_path) or "<record>"
                errors.append(f"{path.relative_to(ROOT)} [{data.get('type')}:{data.get('id')}] {where}: {error.message}")
            key = (str(data.get("type")), str(data.get("id")))
            if key in typed_index:
                errors.append(f"duplicate standalone record {key[0]}:{key[1]} in {typed_index[key].relative_to(ROOT)} and {path.relative_to(ROOT)}")
            else:
                typed_index[key] = path

        # Compact entity registries use `type` as a domain subtype (human, river, goddess...).
        # Validate their durable IDs and detect duplicate definitions by inferred registry class.
        parts = set(path.parts)
        registry_kind = next((kind for dirname, kind in REGISTRY_KIND_BY_DIR.items() if dirname in parts), None)
        if registry_kind:
            universe = path.parts[path.parts.index("universes") + 1] if "universes" in path.parts else "unknown"
            for obj in walk_objects(data):
                entity_id = obj.get("id")
                if isinstance(entity_id, str):
                    if not ID_RE.fullmatch(entity_id):
                        errors.append(f"{path.relative_to(ROOT)}: invalid entity id {entity_id!r}")
                    registry_index[(universe, registry_kind, entity_id)].append(path)

    for key, paths in sorted(registry_index.items()):
        unique = sorted({str(p.relative_to(ROOT)) for p in paths})
        if len(unique) > 1:
            errors.append(f"duplicate {key[1]} definition {key[2]} in {', '.join(unique)}")

    for obj, source in standalone:
        for field, target_type in REFERENCE_TYPES.items():
            if field not in obj:
                continue
            values = obj[field] if isinstance(obj[field], list) else [obj[field]]
            for ref in values:
                if not isinstance(ref, str):
                    errors.append(f"{source.relative_to(ROOT)}: {field} must contain string IDs")
                elif (target_type, ref) not in typed_index:
                    errors.append(f"{source.relative_to(ROOT)} [{obj.get('type')}:{obj.get('id')}]: broken {field} -> {target_type}:{ref}")

        if obj.get("type") == "story":
            reader_source = obj.get("reader_source")
            if reader_source and not (ROOT / reader_source).exists():
                errors.append(f"{source.relative_to(ROOT)} [{obj.get('id')}]: missing reader_source {reader_source}")
            for rel in iter_paths(obj.get("normalized_data")):
                if not (source.parent / rel).exists():
                    errors.append(f"{source.relative_to(ROOT)} [{obj.get('id')}]: missing normalized_data file {rel}")

    if errors:
        print(f"Knowledge validation failed with {len(errors)} error(s):")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Knowledge validation passed: {parsed_count} JSON files, {len(standalone)} standalone records.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
