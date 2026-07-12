#!/usr/bin/env python3
"""Validate the checked-in MoonCat human-facing color-label policy."""

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
POLICY = ROOT / "data/color-classification.json"
SOURCES = ROOT / "data/sources.json"


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def classify(hue_int: int, hue_name: str, pale: bool, genesis: bool, policy: dict) -> dict:
    for category in policy["specialClassification"]["genesisCategories"]:
        values = category["requiredRawValues"]
        if genesis == values["genesis"] and hue_int == values["hueInt"] and hue_name == values["hueName"]:
            return {"kind": "genesis-special", "key": category["key"], "label": category["label"], "pale": pale}
    if hue_int in {1000, 2000}:
        return {"kind": "unresolved-special-sentinel", "key": "unresolved-special-sentinel", "label": None, "pale": pale}
    hue = hue_int % 360
    for bucket in policy["normalHueClassification"]["buckets"]:
        if any(start <= hue < end for start, end in bucket["intervals"]):
            return {"kind": "circular-hue", "key": bucket["key"], "label": bucket["label"], "pale": pale}
    fail(f"unclassified hue {hue_int}")


def main() -> int:
    policy = json.loads(POLICY.read_text())
    source_ids = {item["id"] for item in json.loads(SOURCES.read_text())["sources"]}
    if policy.get("version") != 1 or policy.get("scheme", {}).get("version") != 1:
        fail("unexpected policy or scheme version")
    if not set(policy.get("sourceRefs", [])) <= source_ids:
        fail("policy has unresolved sourceRefs")
    buckets = policy["normalHueClassification"]["buckets"]
    seen = []
    for bucket in buckets:
        if not bucket["intervals"]:
            fail(f"bucket {bucket['key']} has no interval")
        for start, end in bucket["intervals"]:
            if not (0 <= start < end <= 360):
                fail(f"invalid half-open interval for {bucket['key']}")
            seen.extend(range(start, end))
    if sorted(seen) != list(range(360)) or len(seen) != 360:
        fail("normal buckets must cover each normalized integer hue exactly once")
    expected_boundaries = {
        0: "red", 15: "red", 16: "orange", 45: "orange", 46: "yellow", 75: "yellow",
        76: "chartreuse", 105: "chartreuse", 106: "green", 135: "green", 136: "teal",
        165: "teal", 166: "cyan", 195: "cyan", 196: "sky-blue", 225: "sky-blue",
        226: "blue", 255: "blue", 256: "purple", 285: "purple", 286: "magenta",
        315: "magenta", 316: "fuchsia", 345: "fuchsia", 346: "red", 359: "red",
    }
    for hue, expected in expected_boundaries.items():
        actual = classify(hue, expected.replace("-", ""), False, False, policy)["key"]
        if actual != expected:
            fail(f"boundary hue {hue} classified as {actual}, expected {expected}")
    if classify(360, "red", False, False, policy)["key"] != "red" or classify(-1, "red", False, False, policy)["key"] != "red":
        fail("modulo wrap behavior is not deterministic")
    if classify(1000, "black", False, True, policy)["key"] != "genesis-black":
        fail("Genesis black sentinel is not classified")
    if classify(2000, "white", True, True, policy)["key"] != "genesis-white":
        fail("Genesis white sentinel is not classified")
    if classify(1000, "black", False, False, policy)["kind"] != "unresolved-special-sentinel":
        fail("non-Genesis sentinel must not fall through circular hue classification")
    normal = classify(76, "chartreuse", True, False, policy)
    if normal["label"] != "Chartreuse" or normal["pale"] is not True:
        fail("pale must remain a separate modifier without changing the label")
    print("OK: color policy boundaries, wrap, Genesis sentinels, pale handling, and version are valid")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
