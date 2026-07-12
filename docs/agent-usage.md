# Coding-Agent Context Packs

Start with `data/agent-index.json`, choose the narrowest task route, then load the generated pack in `data/agent-context-packs.json` whose `caseId` matches the work. A pack lists local files to load in priority order, explicit terminology, required facts and warnings, forbidden claims, stop conditions, validation commands, and file/byte size metrics.

Packs are generated from `data/agent-query-cases.json`, `data/agent-index.json`, `data/task-recipes.json`, and `data/sources.json`. They contain references and guardrails only; they never inline source files, upstream snapshots, or a universal full-KB prompt.

Use optional files only when the case explicitly names them. If a needed claim is absent, the case's stop condition wins: preserve the uncertainty, identify the missing source or current-state dependency, and do not invent a conversion, palette, ownership state, accessory wear state, or renderer result.

Before implementing, run the pack's validation commands. After changing routing or a benchmark case, run:

```text
python scripts/generate-agent-context-packs.py --check
python scripts/validate-agent-routing.py
python scripts/validate-kb.py
```

The benchmark checks routing/context contracts only. It does not call an LLM or network service and does not score subjective model-answer quality.
