from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HTML_FILES = sorted(ROOT.glob('*.html'))
JS_FILES = sorted(ROOT.glob('*.js'))


def node_check(path: Path) -> tuple[bool, str]:
    proc = subprocess.run(['node', '--check', str(path)], capture_output=True, text=True)
    return proc.returncode == 0, proc.stderr.strip()


def extract_inline_scripts(html: str) -> list[str]:
    return re.findall(r'<script[^>]*>(.*?)</script>', html, flags=re.S | re.I)


def check_inline_scripts() -> list[str]:
    errors: list[str] = []
    for html_file in HTML_FILES:
        html = html_file.read_text(encoding='utf-8')
        scripts = extract_inline_scripts(html)
        for i, script in enumerate(scripts):
            temp = ROOT / f'__check_{html_file.stem}_{i}.js'
            temp.write_text(script, encoding='utf-8')
            ok, err = node_check(temp)
            temp.unlink(missing_ok=True)
            if not ok:
                errors.append(f'{html_file.name}: inline script #{i} has syntax error\n{err}')
    return errors


def check_js_files() -> list[str]:
    errors: list[str] = []
    for js_file in JS_FILES:
        ok, err = node_check(js_file)
        if not ok:
            errors.append(f'{js_file.name}: syntax error\n{err}')
    return errors


def parse_sw_assets() -> list[str]:
    sw = (ROOT / 'sw.js').read_text(encoding='utf-8')
    match = re.search(r'const ASSETS = \[(.*?)\];', sw, flags=re.S)
    if not match:
        return []
    return re.findall(r"'([^']+)'", match.group(1))


def check_sw_assets() -> list[str]:
    errors: list[str] = []
    for asset in parse_sw_assets():
        if asset == './':
            continue
        path = ROOT / asset.replace('./', '')
        if not path.exists():
            errors.append(f'sw.js references missing asset: {asset}')
    return errors


def check_legacy_links() -> list[str]:
    errors: list[str] = []
    legacy = ['grade1.html', 'grade2.html', 'grade3.html', 'grade4.html', 'grade5.html', 'grade6.html', 'grade7.html', 'grade8.html', 'grade9.html', 'grade10.html', 'grade11.html', 'engine.js', 'engine.css']
    for path in list(HTML_FILES) + list(JS_FILES):
        text = path.read_text(encoding='utf-8', errors='ignore')
        for item in legacy:
            if item in text:
                errors.append(f'{path.name}: contains legacy reference {item}')
    return errors


def check_runtime_smoke() -> list[str]:
    smoke = ROOT / 'runtime_smoke_check.js'
    if not smoke.exists():
        return ['runtime_smoke_check.js is missing']
    proc = subprocess.run(['node', str(smoke)], capture_output=True, text=True, cwd=ROOT)
    if proc.returncode == 0:
        return []
    return [line for line in proc.stdout.splitlines() + proc.stderr.splitlines() if line.strip()]


def main() -> int:
    errors = []
    errors.extend(check_js_files())
    errors.extend(check_inline_scripts())
    errors.extend(check_sw_assets())
    errors.extend(check_legacy_links())
    errors.extend(check_runtime_smoke())

    if errors:
        print('FAIL')
        print('-----')
        for error in errors:
            print(error)
        return 1

    print('OK: syntax, SW assets, legacy links and runtime smoke checks passed')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
