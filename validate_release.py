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




def check_flow_smoke() -> list[str]:
    smoke = ROOT / 'flow_smoke_check.js'
    if not smoke.exists():
        return ['flow_smoke_check.js is missing']
    proc = subprocess.run(['node', str(smoke)], capture_output=True, text=True, cwd=ROOT)
    if proc.returncode == 0:
        return []
    return [line for line in proc.stdout.splitlines() + proc.stderr.splitlines() if line.strip()]


def check_topic_coverage_audit() -> list[str]:
    script = ROOT / 'topic_coverage_audit.js'
    if not script.exists():
        return ['topic_coverage_audit.js is missing']
    proc = subprocess.run(['node', str(script)], capture_output=True, text=True, cwd=ROOT)
    if proc.returncode == 0:
        expected = [ROOT / 'TOPIC_COVERAGE_AUDIT.md', ROOT / 'TOPIC_COVERAGE.json']
        missing = [str(p.name) for p in expected if not p.exists()]
        return [f'missing coverage artifact: {name}' for name in missing]
    return [line for line in proc.stdout.splitlines() + proc.stderr.splitlines() if line.strip()]


def check_topic_coverage_guards() -> list[str]:
    payload = ROOT / 'TOPIC_COVERAGE.json'
    if not payload.exists():
        return ['TOPIC_COVERAGE.json is missing']
    try:
        import json
        data = json.loads(payload.read_text(encoding='utf-8'))
    except Exception as exc:
        return [f'failed to read TOPIC_COVERAGE.json: {exc}']

    errors: list[str] = []
    for row in data.get('rows') or []:
        if int(row.get('errors') or 0) > 0:
            errors.append(f"coverage sampler errors in grade {row.get('grade')} {row.get('subject')} / {row.get('topic')}")

    boosted = data.get('boosted') or []
    weak_boosted = [row for row in boosted if int(row.get('uniq') or 0) < 10]
    if weak_boosted:
        preview = ', '.join(f"{r.get('grade')}:{r.get('subject')} / {r.get('topic')}={r.get('uniq')}" for r in weak_boosted[:8])
        errors.append(f'boosted topics still too shallow (<10): {preview}')

    priority = {(1,'rus','jishi'),(1,'rus','syllable'),(2,'rus','bezud'),(2,'rus','pair'),(2,'world','animals'),(5,'bio','cell'),(5,'bio','plant'),(5,'geo5','earth'),(5,'geo5','map'),(5,'his','egypt'),(5,'his','greece'),(5,'his','rome'),(6,'bio','anim'),(6,'bio','class'),(6,'geo6','litho'),(6,'geo6','hydro'),(6,'his','med'),(6,'his','byz'),(6,'his','rmed'),(6,'rus','adj'),(6,'rus','num'),(7,'geo','par'),(7,'rus','adv'),(7,'alg','func'),(9,'his','ussr'),(9,'his','world20'),(9,'rus','ssp'),(11,'geo','angles'),(11,'rus','orth')}
    priority_rows = [row for row in data.get('rows') or [] if (int(row.get('grade') or 0), str(row.get('subjectId')), str(row.get('topicId'))) in priority]
    weak_priority = [row for row in priority_rows if int(row.get('uniq') or 0) < 10]
    if weak_priority:
        preview = ', '.join(f"{r.get('grade')}:{r.get('subject')} / {r.get('topic')}={r.get('uniq')}" for r in weak_priority[:8])
        errors.append(f'priority weak topics still below 10 unique questions: {preview}')

    below_ten = [row for row in data.get('rows') or [] if int(row.get('uniq') or 0) < 10]
    if below_ten:
        preview = ', '.join(f"{r.get('grade')}:{r.get('subject')} / {r.get('topic')}={r.get('uniq')}" for r in below_ten[:8])
        errors.append(f'topic coverage regression: below 10 unique questions remain: {preview}')

    return errors
def check_curriculum_audit() -> list[str]:
    script = ROOT / 'curriculum_audit.js'
    if not script.exists():
        return ['curriculum_audit.js is missing']
    proc = subprocess.run(['node', str(script)], capture_output=True, text=True, cwd=ROOT)
    if proc.returncode == 0:
        expected = [ROOT / 'CURRICULUM_AUDIT.md', ROOT / 'CURRICULUM_MESH.json']
        missing = [str(p.name) for p in expected if not p.exists()]
        return [f'missing audit artifact: {name}' for name in missing]
    return [line for line in proc.stdout.splitlines() + proc.stderr.splitlines() if line.strip()]



def check_curriculum_guards() -> list[str]:
    mesh_path = ROOT / 'CURRICULUM_MESH.json'
    if not mesh_path.exists():
        return ['CURRICULUM_MESH.json is missing']
    try:
        import json
        mesh = json.loads(mesh_path.read_text(encoding='utf-8'))
    except Exception as exc:
        return [f'failed to read CURRICULUM_MESH.json: {exc}']

    errors: list[str] = []

    thin = mesh.get('thinBlocks') or []
    if thin:
        errors.append(f'thin subject blocks remain: {len(thin)}')

    for grade in mesh.get('grades') or []:
        missing = grade.get('missingTheory') or []
        if missing:
            errors.append(f"{grade.get('file')}: missing theory for {', '.join(missing)}")

    for bank in mesh.get('diagnostics') or []:
        if bank.get('subject') != 'mathall' and int(bank.get('count') or 0) < 30:
            errors.append(f"diagnostic bank too small (<30): {bank.get('subject')} -> {bank.get('count')}")

    # Index card counts should match audited topic counts.
    index_html = (ROOT / 'index.html').read_text(encoding='utf-8', errors='ignore')
    import re
    index_counts = {int(g): int(c) for g, c in re.findall(r'href="grade(\d+)_v2\.html"[\s\S]*?<span class="ct">(\d+) тем</span>', index_html)}
    audited_counts = {int(g['grade']): int(g['topics']) for g in mesh.get('grades') or [] if str(g.get('grade','')).isdigit()}
    for grade_num, expected in audited_counts.items():
        shown = index_counts.get(grade_num)
        if shown is None:
            errors.append(f'index.html: missing card count for grade {grade_num}')
        elif shown != expected:
            errors.append(f'index.html: grade {grade_num} shows {shown} topics, expected {expected}')

    return errors



def check_browser_e2e() -> list[str]:
    script = ROOT / "browser_e2e_smoke.py"
    report = ROOT / "BROWSER_E2E_REPORT.md"
    if not script.exists():
        return ["browser_e2e_smoke.py is missing"]
    if not report.exists():
        return ["BROWSER_E2E_REPORT.md is missing; run browser_e2e_smoke.py first"]
    text = report.read_text(encoding='utf-8', errors='ignore')
    return [] if '❌' not in text else ['BROWSER_E2E_REPORT.md contains failed scenarios']


def check_wave9_hooks() -> list[str]:
    errors: list[str] = []
    for html_file in HTML_FILES:
        text = html_file.read_text(encoding='utf-8', errors='ignore')
        if 'wave9_ui.js' not in text:
            errors.append(f'{html_file.name}: wave9_ui.js is not connected')
        if 'trainer_theme' not in text:
            errors.append(f'{html_file.name}: no early theme bootstrap in head')
    script = ROOT / 'wave9_ui.js'
    if not script.exists():
        errors.append('wave9_ui.js is missing')
    return errors



def check_wave10_hooks() -> list[str]:
    errors: list[str] = []
    for html_file in HTML_FILES:
        if not html_file.name.startswith('grade'):
            continue
        text = html_file.read_text(encoding='utf-8', errors='ignore')
        if 'wave10_boosters.js' not in text:
            errors.append(f'{html_file.name}: wave10_boosters.js is not connected')
    if not (ROOT / 'wave10_boosters.js').exists():
        errors.append('wave10_boosters.js is missing')
    return errors

def check_wave11_hooks() -> list[str]:
    errors: list[str] = []
    for html_file in HTML_FILES:
        if not html_file.name.startswith('grade'):
            continue
        text = html_file.read_text(encoding='utf-8', errors='ignore')
        if 'wave11_boosters.js' not in text:
            errors.append(f'{html_file.name}: wave11_boosters.js is not connected')
    if not (ROOT / 'wave11_boosters.js').exists():
        errors.append('wave11_boosters.js is missing')
    return errors


def check_wave12_hooks() -> list[str]:
    errors: list[str] = []
    grade11 = ROOT / 'grade11_v2.html'
    if not grade11.exists():
        return ['grade11_v2.html is missing']
    text = grade11.read_text(encoding='utf-8', errors='ignore')
    if 'wave12_english.js' not in text:
        errors.append('grade11_v2.html: wave12_english.js is not connected')
    if not (ROOT / 'wave12_english.js').exists():
        errors.append('wave12_english.js is missing')
    return errors


def check_english_vertical_audit() -> list[str]:
    script = ROOT / 'english_vertical_audit.js'
    if not script.exists():
        return ['english_vertical_audit.js is missing']
    proc = subprocess.run(['node', str(script)], capture_output=True, text=True, cwd=ROOT)
    if proc.returncode == 0:
        expected = [ROOT / 'ENGLISH_VERTICAL_AUDIT.md', ROOT / 'ENGLISH_VERTICAL.json']
        missing = [str(p.name) for p in expected if not p.exists()]
        return [f'missing English audit artifact: {name}' for name in missing]
    return [line for line in proc.stdout.splitlines() + proc.stderr.splitlines() if line.strip()]


def check_english_vertical_guards() -> list[str]:
    payload = ROOT / 'ENGLISH_VERTICAL.json'
    if not payload.exists():
        return ['ENGLISH_VERTICAL.json is missing']
    try:
        import json
        data = json.loads(payload.read_text(encoding='utf-8'))
    except Exception as exc:
        return [f'failed to read ENGLISH_VERTICAL.json: {exc}']

    rows = {str(r.get('grade')): r for r in data.get('rows') or []}
    errors: list[str] = []
    grade10 = rows.get('10')
    grade11 = rows.get('11')
    if not grade10 or int(grade10.get('currentTopics') or 0) < 4:
        errors.append('english vertical regression: grade 10 has fewer than 4 topics')
    if not grade11 or int(grade11.get('currentTopics') or 0) < 12:
        errors.append('english vertical regression: grade 11 has fewer than 12 topics')
    return errors

def main() -> int:
    errors = []
    errors.extend(check_js_files())
    errors.extend(check_inline_scripts())
    errors.extend(check_sw_assets())
    errors.extend(check_legacy_links())
    errors.extend(check_runtime_smoke())
    errors.extend(check_flow_smoke())
    errors.extend(check_browser_e2e())
    errors.extend(check_wave9_hooks())
    errors.extend(check_wave10_hooks())
    errors.extend(check_wave11_hooks())
    errors.extend(check_wave12_hooks())
    errors.extend(check_curriculum_audit())
    errors.extend(check_english_vertical_audit())
    errors.extend(check_topic_coverage_audit())
    errors.extend(check_curriculum_guards())
    errors.extend(check_topic_coverage_guards())
    errors.extend(check_english_vertical_guards())

    if errors:
        print('FAIL')
        print('-----')
        for error in errors:
            print(error)
        return 1

    print('OK: syntax, SW assets, legacy links, runtime + flow + browser E2E smoke, curriculum + coverage + English vertical audit, wave 9/10/11/12 hooks and content guards passed')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
