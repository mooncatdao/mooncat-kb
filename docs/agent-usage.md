# Coding-agent workflow

For the full human explanation and prompt examples, see
[`mooncat-kb-guide.md`](mooncat-kb-guide.md). This file is the concise operating
sequence for coding agents.

1. Read `AGENTS.md`.
2. Select the narrowest task in `data/agent-index.json` and load its primary
   files first.
3. Use the matching `data/task-recipes.json` entry when the work needs ordered
   steps, outputs, guardrails, or stop conditions.
4. For a covered coding task, load the generated
   `data/agent-context-packs.json` record whose `caseId` matches the task. Load
   only its listed files; the pack references evidence rather than replacing it.
5. Check `data/agent-coding-patterns.json` for an existing tested example or
   validator before creating a new implementation pattern.
6. Preserve warnings, forbidden claims, identifier scope, provenance limits,
   and stop conditions. Stop when the answer needs missing evidence,
   unsupported conversion, unreviewed source, or live/current state.
7. Make a small scoped change and run the task-specific validation commands.

Context packs are generated from query cases, routes, recipes, and registered
sources. They contain no source snapshots, model calls, universal full-KB
prompt, or subjective answer score. The factual-retrieval benchmark is a
separate provenance constraint suite.

After changing a routed file, route, recipe, benchmark case, or context policy:

```text
python scripts/generate-agent-context-packs.py
python scripts/generate-agent-context-packs.py --check
python scripts/validate-agent-routing.py
python scripts/generate-kb-manifest.py
python scripts/generate-kb-manifest.py --check
python scripts/validate-kb-manifest.py
python scripts/validate-kb.py
python scripts/audit-kb.py
```

Use a focused validator before this sequence when a domain artifact changes.
Generated packs, the manifest, and the audit report should be regenerated only
when their inputs changed.
