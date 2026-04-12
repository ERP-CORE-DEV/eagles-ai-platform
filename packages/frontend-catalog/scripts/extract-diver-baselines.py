#!/usr/bin/env python3
"""
Extract frontend-catalog baseline JSONL records from diver task transcripts.

Why this exists: the 8 frontend-catalog "web divers" (researcher subagents) were
launched without a Write tool, so they embedded their final JSONL output inside
fenced ```jsonl blocks in their final assistant message. This script parses
each task .output transcript, extracts the fenced blocks, infers the layer
from the `layer` field in the records, and writes one batch-NNN.jsonl per
block under baselines/divings-raw/L{N}/.

Usage:
    python extract-diver-baselines.py [--dry-run]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

TASKS_DIR = Path(
    r"C:/Users/hatim/AppData/Local/Temp/claude/"
    r"c--rh-optimerp-sourcing-candidate-attraction/"
    r"77f00ca4-2c6e-4af6-ab28-2d51a2f37e97/tasks"
)
OUT_ROOT = Path(
    r"C:/RH-OptimERP/eagles-ai-platform/packages/frontend-catalog/baselines/divings-raw"
)

# Match any fenced block: ```[optional-lang]\n<body>\n```
# We'll validate each body as JSONL and accept only ones that parse cleanly.
FENCE_RE = re.compile(r"```([a-zA-Z0-9_+-]*)\s*\n(.*?)```", re.DOTALL)


def last_substantive_text(events: list) -> str | None:
    """Return the text of the last assistant event with a substantive text block."""
    result: str | None = None
    for ev in events:
        if not isinstance(ev, dict):
            continue
        if ev.get("type") != "assistant":
            continue
        msg = ev.get("message", {})
        if not isinstance(msg, dict):
            continue
        content = msg.get("content", [])
        if not isinstance(content, list):
            continue
        for block in content:
            if not isinstance(block, dict):
                continue
            if block.get("type") != "text":
                continue
            txt = block.get("text", "")
            if isinstance(txt, str) and len(txt) > 500:
                result = txt
    return result


def load_events(path: Path) -> list[dict]:
    events: list[dict] = []
    with path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    return events


def _parse_fence_body(body: str) -> list[dict]:
    records: list[dict] = []
    parse_failures = 0
    for raw in body.splitlines():
        raw = raw.strip()
        if not raw:
            continue
        try:
            obj = json.loads(raw)
            if isinstance(obj, dict) and ("url" in obj or "layer" in obj):
                records.append(obj)
            else:
                parse_failures += 1
        except json.JSONDecodeError:
            parse_failures += 1
    if records and len(records) >= parse_failures:
        return records
    return []


def extract_fenced_jsonl(text: str) -> list[list[dict]]:
    """Return a list of batches, each batch is a list of parsed JSON records.

    Prefers ```jsonl-tagged fences. Only falls back to plain ``` fences when
    NO ```jsonl fences are present (prevents double-counting when divers paste
    the same records twice).
    """
    tagged: list[list[dict]] = []
    untagged: list[list[dict]] = []
    for match in FENCE_RE.finditer(text):
        lang = match.group(1).lower()
        body = match.group(2)

        if lang and lang not in {"jsonl", "json", "ndjson", ""}:
            continue

        records = _parse_fence_body(body)
        if not records:
            continue

        if lang == "jsonl":
            tagged.append(records)
        else:
            untagged.append(records)

    return tagged if tagged else untagged


def infer_layer(records: list[dict]) -> int | None:
    """Infer layer number from the `layer` field of the first valid record."""
    for rec in records:
        layer = rec.get("layer")
        if isinstance(layer, int) and 1 <= layer <= 8:
            return layer
        if isinstance(layer, str) and layer.strip().isdigit():
            n = int(layer.strip())
            if 1 <= n <= 8:
                return n
    return None


def scan_existing_max(layer_dir: Path) -> int:
    if not layer_dir.exists():
        return 0
    nums = []
    for p in layer_dir.glob("batch-*.jsonl"):
        m = re.match(r"batch-(\d+)\.jsonl", p.name)
        if m:
            nums.append(int(m.group(1)))
    return max(nums) if nums else 0


# in-memory counter per layer so multiple batches in one run don't collide
_layer_counters: dict[int, int] = {}


def next_batch_number(layer: int) -> int:
    if layer not in _layer_counters:
        layer_dir = OUT_ROOT / f"L{layer}"
        _layer_counters[layer] = scan_existing_max(layer_dir)
    _layer_counters[layer] += 1
    return _layer_counters[layer]


def write_batch(layer: int, records: list[dict], dry_run: bool) -> Path:
    layer_dir = OUT_ROOT / f"L{layer}"
    if not dry_run:
        layer_dir.mkdir(parents=True, exist_ok=True)
    num = next_batch_number(layer)
    out_path = layer_dir / f"batch-{num:03d}.jsonl"
    if dry_run:
        return out_path
    with out_path.open("w", encoding="utf-8") as fh:
        for rec in records:
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
    return out_path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Do not write files")
    args = parser.parse_args()

    if not TASKS_DIR.exists():
        print(f"error: tasks dir not found: {TASKS_DIR}", file=sys.stderr)
        return 2

    output_files = sorted(TASKS_DIR.glob("*.output"))
    print(f"found {len(output_files)} .output files in tasks cache")

    total_batches = 0
    total_records = 0
    per_layer: dict[int, int] = {}

    for out_file in output_files:
        events = load_events(out_file)
        text = last_substantive_text(events)
        if not text:
            continue
        batches = extract_fenced_jsonl(text)
        if not batches:
            continue

        # Infer layer from first batch's first record
        first_records = next((b for b in batches if b), None)
        if first_records is None:
            continue
        layer = infer_layer(first_records)
        if layer is None:
            print(f"  {out_file.name}: could not infer layer, skipping")
            continue

        print(f"  {out_file.name} -> L{layer} ({len(batches)} batches, "
              f"{sum(len(b) for b in batches)} records)")
        for records in batches:
            path = write_batch(layer, records, args.dry_run)
            verb = "would write" if args.dry_run else "wrote"
            print(f"    {verb} {path.name} ({len(records)} records)")
            total_batches += 1
            total_records += len(records)
            per_layer[layer] = per_layer.get(layer, 0) + len(records)

    print()
    print(f"summary: {total_batches} batches, {total_records} records total")
    for layer in sorted(per_layer):
        print(f"  L{layer}: {per_layer[layer]} records")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
