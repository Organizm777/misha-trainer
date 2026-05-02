#!/usr/bin/env python3
"""Wave92s release gate for the static Trainer3 artifact.

Checks the runtime crash guard, CSP, SRI, integrity manifest and Brotli mirrors.
Run from the unpacked site root:

    python3 tools/wave92s_ci_gate.py
"""
from __future__ import annotations

import base64
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Iterable

try:
    import brotli  # type: ignore
except Exception:  # pragma: no cover - optional in external CI images
    brotli = None

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def fail(message: str) -> None:
    errors.append(message)


def sha384_sri(data: bytes) -> str:
    return "sha384-" + base64.b64encode(hashlib.sha384(data).digest()).decode("ascii")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def iter_json_strings(value) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for item in value.values():
            yield from iter_json_strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from iter_json_strings(item)


def check_core_runtime() -> None:
    manifest_path = ROOT / "assets" / "asset-manifest.json"
    core_rel = ""
    if manifest_path.exists():
        manifest = json.loads(read_text(manifest_path))
        core_rel = manifest.get("assets", {}).get("assets/js/bundle_grade_runtime_core_wave87n.js", "") or manifest.get("files", {}).get("assets/js/bundle_grade_runtime_core_wave87n.js", "")
    candidates = [ROOT / core_rel] if core_rel else []
    candidates += sorted((ROOT / "assets/js").glob("bundle_grade_runtime_core_wave87n.*.js"))
    core = next((p for p in candidates if p.exists() and p.is_file()), None)
    if not core:
        fail("core runtime bundle not found")
        return
    text = read_text(core)

    required = {
        "a11y querySelectorAll fix": "const nodes = [...document.querySelectorAll('.scr')];",
        "a11y init guard": "window.__wave92sSafeCall('a11y init', init)",
        "scheduled a11y refresh guard": "[a11y] refresh failed",
        "direct action guard": "window.__wave92sSafeCall('wave87n bindDirectActions', bindDirectActions)",
        "block guards": "[wave92s block]",
    }
    for label, needle in required.items():
        if needle not in text:
            fail(f"core runtime missing {label}: {needle}")

    forbidden = {
        "cross-scope $('.scr')": "const nodes = $('.scr');",
        "raw else init()": "else init();",
        "raw bindDirectActions() boot": "bindDirectActions();",
        "raw setTimeout(boot, ...)": "setTimeout(boot",
    }
    for label, needle in forbidden.items():
        if needle in text:
            fail(f"core runtime still has {label}: {needle}")

    raw_dom = re.search(r"DOMContentLoaded['\"]\s*,\s*(init|boot|patchFunctions|renderDashboardCard)\b", text)
    if raw_dom:
        fail(f"raw DOMContentLoaded callback is not guarded: {raw_dom.group(0)}")
    raw_else = re.search(r"\belse\s+(init|boot|patchFunctions|renderDashboardCard)\s*\(", text)
    if raw_else:
        fail(f"raw immediate boot call is not guarded: {raw_else.group(0)}")
    if text.count("[wave92s block]") < 15:
        fail("expected at least 15 top-level IIFE block guards in core runtime")


def check_csp() -> None:
    for html in sorted(ROOT.glob("*.html")):
        text = read_text(html)
        if "style-src-attr 'none'" in text:
            fail(f"{rel(html)} has forbidden style-src-attr 'none'")
        if "Content-Security-Policy" in text and "style-src-attr 'unsafe-inline'" not in text:
            fail(f"{rel(html)} is missing style-src-attr 'unsafe-inline'")


def check_sri_in_html() -> None:
    tag_re = re.compile(r"<(script|link)\b[^>]*\bintegrity=\"(sha384-[^\"]+)\"[^>]*>", re.I)
    attr_re = re.compile(r"\b(?:src|href)=\"([^\"]+)\"")
    checked = 0
    for html in sorted(ROOT.glob("*.html")):
        text = read_text(html)
        for match in tag_re.finditer(text):
            tag = match.group(0)
            integrity = match.group(2)
            attr = attr_re.search(tag)
            if not attr:
                fail(f"{rel(html)} has integrity tag without src/href")
                continue
            href = attr.group(1)
            if href.startswith(("http://", "https://", "//", "data:")):
                continue
            asset = (ROOT / href.lstrip("./")).resolve()
            if not str(asset).startswith(str(ROOT.resolve())):
                fail(f"{rel(html)} references asset outside root: {href}")
                continue
            if not asset.exists():
                fail(f"{rel(html)} references missing asset: {href}")
                continue
            actual = sha384_sri(asset.read_bytes())
            checked += 1
            if actual != integrity:
                fail(f"SRI mismatch in {rel(html)} for {href}: expected {actual}, found {integrity}")
    if checked == 0:
        fail("no SRI-bearing local assets found in HTML")


def check_runtime_integrity_manifest() -> None:
    path = ROOT / "assets/data/runtime_integrity_wave92r.json"
    if not path.exists():
        fail("runtime integrity manifest not found")
        return
    data = json.loads(read_text(path))
    entries = data.get("entries", {})
    if not isinstance(entries, dict):
        fail("runtime integrity manifest entries is not an object")
        return
    for asset_rel, meta in entries.items():
        asset = ROOT / asset_rel
        if not asset.exists():
            fail(f"runtime integrity references missing asset: {asset_rel}")
            continue
        raw = asset.read_bytes()
        expected_sha = sha384_sri(raw)
        expected_bytes = len(raw)
        if meta.get("sha384") != expected_sha:
            fail(f"runtime integrity sha384 mismatch for {asset_rel}")
        if meta.get("bytes") != expected_bytes:
            fail(f"runtime integrity bytes mismatch for {asset_rel}: expected {expected_bytes}, found {meta.get('bytes')}")


def check_asset_manifests() -> None:
    for path in [ROOT / "asset-manifest.json", ROOT / "assets/asset-manifest.json"]:
        if not path.exists():
            fail(f"missing {rel(path)}")
            continue
        data = json.loads(read_text(path))
        for value in iter_json_strings(data):
            if value.startswith("assets/") and not (ROOT / value).exists():
                fail(f"{rel(path)} references missing asset: {value}")


def check_brotli_mirrors() -> None:
    if brotli is None:
        return
    for br in sorted(ROOT.rglob("*.br")):
        original = Path(str(br)[:-3])
        if not original.exists():
            fail(f"Brotli mirror has no original: {rel(br)}")
            continue
        try:
            decoded = brotli.decompress(br.read_bytes())
        except Exception as exc:
            fail(f"Brotli mirror is not decodable: {rel(br)}: {exc}")
            continue
        if decoded != original.read_bytes():
            fail(f"Brotli mirror differs from original: {rel(br)}")


def main() -> int:
    check_core_runtime()
    check_csp()
    check_sri_in_html()
    check_runtime_integrity_manifest()
    check_asset_manifests()
    check_brotli_mirrors()
    if errors:
        for item in errors:
            print("FAIL", item, file=sys.stderr)
        print(f"wave92s CI gate failed: {len(errors)} issue(s)", file=sys.stderr)
        return 1
    print("wave92s CI gate passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
