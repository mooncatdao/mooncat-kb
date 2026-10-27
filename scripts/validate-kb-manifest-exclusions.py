#!/usr/bin/env python3
"""Regression checks for volatile output exclusions and maintained-file drift."""

from __future__ import annotations

import contextlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("kb_manifest_generator", ROOT / "scripts/generate-kb-manifest.py")
assert spec and spec.loader
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)


class ManifestExclusionTests(unittest.TestCase):
    def setUp(self) -> None:
        # Own only a disposable fixture under the project; never touch real runs.
        scratch = ROOT / ".chatgpt"
        scratch.mkdir(exist_ok=True)
        self.temporary = tempfile.TemporaryDirectory(prefix="manifest-test-", dir=scratch)
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.output = self.root / "data/kb-manifest.json"
        self.output.parent.mkdir()
        for name in ("agent-index", "task-recipes", "sources", "upstream-snapshot-manifest"):
            (self.root / "data" / f"{name}.json").write_text("{}\n", encoding="utf-8")
        self.document = self.root / "docs/fixture.md"
        self.document.parent.mkdir()
        self.document.write_text("# Maintained fixture\n", encoding="utf-8")
        for name, value in (("ROOT", self.root), ("OUTPUT", self.output)):
            patcher = patch.object(generator, name, value)
            patcher.start()
            self.addCleanup(patcher.stop)
        self.output.touch()
        self.output.write_text(generator.render(), encoding="utf-8")

    def check_manifest(self) -> tuple[int, str]:
        output = io.StringIO()
        with patch.object(sys, "argv", ["generate-kb-manifest.py", "--check"]), contextlib.redirect_stdout(output):
            status = generator.main()
        return status, output.getvalue()

    def test_new_benchmark_run_does_not_change_manifest(self) -> None:
        before = self.output.read_text(encoding="utf-8")
        for run in ("existing-run", "another-run"):
            artifact = self.root / ".factual-retrieval-runs" / run / "nested/results.json"
            artifact.parent.mkdir(parents=True)
            artifact.write_text("{}\n", encoding="utf-8")
            self.assertEqual(generator.render(), before)
            self.assertEqual(self.check_manifest()[0], 0)
        self.assertEqual(self.output.read_text(encoding="utf-8"), before)

    def test_maintained_content_change_is_detected(self) -> None:
        baseline = json.loads(self.output.read_text(encoding="utf-8"))
        self.document.write_text("# Changed maintained fixture\n", encoding="utf-8")
        current = generator.build_manifest()
        old_entry = next(item for item in baseline["entries"] if item["path"] == "docs/fixture.md")
        new_entry = next(item for item in current["entries"] if item["path"] == "docs/fixture.md")
        self.assertNotEqual(old_entry["sha256"], new_entry["sha256"])
        status, output = self.check_manifest()
        self.assertEqual(status, 1)
        self.assertIn("stale", output)

    def test_new_maintained_document_is_included(self) -> None:
        document = self.root / "docs/new-document.md"
        document.write_text("# New maintained document\n", encoding="utf-8")
        paths = {item["path"] for item in generator.build_manifest()["entries"]}
        self.assertIn("docs/new-document.md", paths)
        self.assertEqual(self.check_manifest()[0], 1)

    def test_unclassified_file_is_rejected(self) -> None:
        # A similar visible directory must not inherit the hidden-run exclusion.
        unexpected = self.root / "factual-retrieval-runs/unexpected.txt"
        unexpected.parent.mkdir()
        unexpected.write_text("Unclassified maintained content\n", encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "no explicit manifest classification rule.*factual-retrieval-runs/unexpected.txt"):
            self.check_manifest()


if __name__ == "__main__":
    unittest.main()
