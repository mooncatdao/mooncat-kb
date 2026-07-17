# ChainStation Web compact source audit

This directory preserves a small, reproducible evidence set from the public MoonCatRescue ChainStation Web repository. `SNAPSHOT.json` pins the reviewed `master` revision, acquisition commands, license observation, and every copied evidence file's source path, SHA-256 digest, byte size, and full-file line range.

The `evidence/` directory contains exact copies of 28 selected files from commit `5df03ab465d46f59f3e4d4a05e4e85fc90abdc0a`. It is intentionally not a full repository copy: it excludes dependencies, output/cache directories, environment values, the complete trait data table, and unreviewed application paths. The evidence is checked offline by `python scripts/validate-upstream-snapshots.py` and `python scripts/validate-chainstation-surfaces.py`.

Use `data/chainstation-surfaces.json` for the compact indexed map and `docs/chainstation-surfaces.md` for the evidence boundary. This snapshot proves only what was observed in source at the pinned commit. It does not prove a production deployment, live API response, current chain state, user data, or behavior added after the snapshot.
