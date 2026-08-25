# Factual retrieval empirical baselines

This directory is the publication surface for completed, reviewed empirical
baseline results. It is not storage for in-progress answer bundles, hidden
rubrics, raw model sessions, or incomplete grades.

Completed raw runs are archival evidence: keep the run-local
`benchmark-snapshot.json`, `run-metadata.json`, copied required files, hidden
reviewer material, answers, and grades together. The validator pins the
snapshot and preparation-time required-file hashes, so later changes to the
current KB do not invalidate an otherwise intact historical run. Use
`--report-current-drift` when you want a separate informational comparison
with the current benchmark and source files.

For a finalized run, use a run-specific directory containing:

- `report.md`: the human-readable report emitted by
  `scripts/summarize-factual-retrieval-baseline.py`.
- `result.json.md`: the same summarizer's raw machine-readable JSON output.
  The `.json.md` suffix keeps the JSON document inside the repository's
  maintained documentation path policy; its contents remain plain JSON and
  can be parsed directly.

For example, after all answers have been preserved and reviewer grades pass
the validator:

```sh
python scripts/summarize-factual-retrieval-baseline.py \
  --run-dir .factual-retrieval-runs/2026-09-01-model-name \
  --output-json docs/benchmark-baselines/2026-09-01-model-name/result.json.md \
  --output-markdown docs/benchmark-baselines/2026-09-01-model-name/report.md
```

Review both outputs before publication. Confirm that the report identifies the
exact model/version, provider/client, reasoning setting, run date, source KB
commit, benchmark SHA-256, required-files-only isolation, and network/tool
policy. Do not publish a synthetic harness fixture as an empirical result, and
do not copy hidden reviewer rubrics into this directory.

Published scores remain model- and configuration-specific observations. They
are not canonical MoonCat facts, benchmark case-definition validation, or
inputs to the deterministic zero-network KB audit.
