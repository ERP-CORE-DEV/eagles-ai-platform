#!/usr/bin/env python3
"""
Wave 3 Consolidator 1 — dedupe + cluster.

Reads all batch-*.jsonl files under baselines/divings-raw/L{1..8}/,
dedupes records by URL (keeping the record with the highest quality_score
when duplicates exist), clusters by category within each layer, and writes
one consolidated file per layer at baselines/consolidated/L{N}.jsonl.
"""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(r"C:/RH-OptimERP/eagles-ai-platform/packages/frontend-catalog/baselines")
RAW = ROOT / "divings-raw"
OUT = ROOT / "consolidated"


def quality(rec: dict) -> int:
    q = rec.get("quality_score", 0)
    if isinstance(q, (int, float)):
        return int(q)
    return 0


def category(rec: dict) -> str:
    return str(rec.get("category", "uncategorized"))


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    summary: dict[int, dict] = {}

    for layer in range(1, 9):
        layer_dir = RAW / f"L{layer}"
        if not layer_dir.exists():
            continue

        by_url: dict[str, dict] = {}
        total_in = 0

        for batch in sorted(layer_dir.glob("batch-*.jsonl")):
            with batch.open("r", encoding="utf-8") as fh:
                for line in fh:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        rec = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    total_in += 1
                    url = rec.get("url")
                    if not url:
                        continue
                    existing = by_url.get(url)
                    if existing is None or quality(rec) > quality(existing):
                        by_url[url] = rec

        clustered = sorted(
            by_url.values(),
            key=lambda r: (category(r), -quality(r), r.get("url", "")),
        )

        out_path = OUT / f"L{layer}.jsonl"
        with out_path.open("w", encoding="utf-8") as fh:
            for rec in clustered:
                fh.write(json.dumps(rec, ensure_ascii=False) + "\n")

        cat_counts: dict[str, int] = defaultdict(int)
        for r in clustered:
            cat_counts[category(r)] += 1

        summary[layer] = {
            "in": total_in,
            "unique": len(clustered),
            "duplicates": total_in - len(clustered),
            "categories": dict(cat_counts),
        }

        print(
            f"L{layer}: {total_in} in -> {len(clustered)} unique "
            f"({total_in - len(clustered)} dupes), "
            f"{len(cat_counts)} categories"
        )

    index_path = OUT / "index.json"
    with index_path.open("w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=2)

    total_in = sum(s["in"] for s in summary.values())
    total_unique = sum(s["unique"] for s in summary.values())
    print()
    print(f"TOTAL: {total_in} in -> {total_unique} unique ({total_in - total_unique} dupes)")
    print(f"wrote {len(summary)} consolidated layer files + index.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
