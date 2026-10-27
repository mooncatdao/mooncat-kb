#!/usr/bin/env python3
"""Exercise ADR Markdown/asset inventory validation in isolated project fixtures."""

from __future__ import annotations

import contextlib
import importlib.util
import io
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = Path("references/upstream/mooncatrescue-dev-environment-adr")
sys.dont_write_bytecode = True


def load_validator(name: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / f"{name}.py")
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


architecture = load_validator("validate-architecture-decisions")
provenance = load_validator("validate-upstream-snapshots")


class SnapshotInventoryTests(unittest.TestCase):
    def setUp(self) -> None:
        scratch = ROOT / ".chatgpt"
        scratch.mkdir(exist_ok=True)
        temporary = tempfile.TemporaryDirectory(prefix="adr-inventory-test-", dir=scratch)
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        shutil.copytree(ROOT / SNAPSHOT, self.root / SNAPSHOT)
        index = json.loads((ROOT / "data/architecture-decisions.json").read_text())
        source_data = json.loads((ROOT / "data/sources.json").read_text())
        manifest = json.loads((ROOT / "data/upstream-snapshot-manifest.json").read_text())
        manifest["entries"] = [item for item in manifest["entries"] if item["key"] == "mooncatrescue-dev-environment-adr-corpus"]
        source_data["sources"] = [item for item in source_data["sources"] if item["id"] in manifest["entries"][0]["sourceRefs"]]
        related = {path for decision in index["decisions"] for path in decision["relatedFiles"]}
        related.update(manifest["entries"][0]["dependentFiles"])
        for relative in related:
            destination = self.root / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / relative, destination)
        self.write_json("data/architecture-decisions.json", index)
        self.write_json("data/sources.json", source_data)
        self.write_json("data/upstream-snapshot-manifest.json", manifest)
        for module, values in (
            (architecture, {"ROOT": self.root, "INDEX": self.root / "data/architecture-decisions.json", "SOURCES": self.root / "data/sources.json"}),
            (provenance, {"ROOT": self.root, "MANIFEST": self.root / "data/upstream-snapshot-manifest.json", "SOURCES": self.root / "data/sources.json"}),
        ):
            for name, value in values.items():
                patcher = patch.object(module, name, value)
                patcher.start()
                self.addCleanup(patcher.stop)

    def write_json(self, relative: str, data: dict) -> None:
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")

    def assert_rejected(self, validator, message: str) -> None:
        errors = io.StringIO()
        with contextlib.redirect_stderr(errors), self.assertRaises(SystemExit) as failure:
            validator.main()
        self.assertEqual(failure.exception.code, 1)
        self.assertIn(message, errors.getvalue())

    def test_complete_snapshot_passes_both_validators(self) -> None:
        for validator in (architecture, provenance):
            with self.subTest(validator=validator.__name__), contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(validator.main(), 0)

    def test_missing_images_are_rejected(self) -> None:
        for name in ("accessory-palette.png", "dither-patterns.png"):
            path = self.root / SNAPSHOT / name
            original = path.read_bytes()
            path.unlink()
            try:
                for validator in (architecture, provenance):
                    with self.subTest(asset=name, validator=validator.__name__):
                        self.assert_rejected(validator, "snapshot")
            finally:
                path.write_bytes(original)

    def test_modified_images_are_rejected(self) -> None:
        for name in ("accessory-palette.png", "dither-patterns.png"):
            path = self.root / SNAPSHOT / name
            original = path.read_bytes()
            # Same-size corruption ensures the hash check is exercised.
            path.write_bytes(bytes([original[0] ^ 1]) + original[1:])
            try:
                for validator in (architecture, provenance):
                    with self.subTest(asset=name, validator=validator.__name__):
                        self.assert_rejected(validator, "snapshot inventory drift")
            finally:
                path.write_bytes(original)

    def test_extra_nested_file_is_rejected(self) -> None:
        path = self.root / SNAPSHOT / "unexpected/extra.png"
        path.parent.mkdir()
        path.write_bytes(b"extra")
        for validator in (architecture, provenance):
            with self.subTest(validator=validator.__name__):
                self.assert_rejected(validator, "snapshot")

    def test_missing_markdown_is_rejected(self) -> None:
        (self.root / SNAPSHOT / "0015-nft-pools.md").unlink()
        for validator in (architecture, provenance):
            with self.subTest(validator=validator.__name__):
                self.assert_rejected(validator, "snapshot")

    def test_modified_markdown_is_rejected(self) -> None:
        path = self.root / SNAPSHOT / "0018-moment-design-specs.md"
        path.write_bytes(path.read_bytes() + b"changed")
        for validator in (architecture, provenance):
            with self.subTest(validator=validator.__name__):
                self.assert_rejected(validator, "snapshot inventory drift")

    def test_incorrect_counts_are_rejected(self) -> None:
        relative = str(SNAPSHOT / "SNAPSHOT.json")
        original = json.loads((self.root / relative).read_text())
        for field in ("decisionFileCount", "nonDecisionFileCount", "inventoryFileCount"):
            metadata = json.loads(json.dumps(original))
            metadata["counts"][field] += 1
            self.write_json(relative, metadata)
            with self.subTest(field=field):
                self.assert_rejected(architecture, field)

    def test_status_mismatch_is_rejected(self) -> None:
        relative = "data/architecture-decisions.json"
        index = json.loads((self.root / relative).read_text())
        for number in ("0005", "0008", "0015"):
            decision = next(item for item in index["decisions"] if item["number"] == number)
            original = decision["decisionStatus"]
            decision["decisionStatus"] = "accepted" if original != "accepted" else "proposed"
            self.write_json(relative, index)
            with self.subTest(number=number):
                self.assert_rejected(architecture, "decisionStatus does not match source ADR")
            decision["decisionStatus"] = original

    def test_image_cannot_be_a_decision(self) -> None:
        relative = str(SNAPSHOT / "SNAPSHOT.json")
        metadata = json.loads((self.root / relative).read_text())
        next(item for item in metadata["inventory"] if item["path"] == "dither-patterns.png")["role"] = "decision"
        self.write_json(relative, metadata)
        self.assert_rejected(architecture, "role mismatch")


if __name__ == "__main__":
    unittest.main()
