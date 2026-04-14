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
    if 'wave12_english.js' not in text and 'wave12_boosters.js' not in text:
        errors.append('grade11_v2.html: wave12 English layer is not connected')
    if not (ROOT / 'wave12_english.js').exists() and not (ROOT / 'wave12_boosters.js').exists():
        errors.append('wave12 English layer is missing')
    return errors



def check_wave13_hooks() -> list[str]:
    errors: list[str] = []
    for grade_name in ('grade8_v2.html', 'grade9_v2.html'):
        html_file = ROOT / grade_name
        if not html_file.exists():
            errors.append(f'{grade_name} is missing')
            continue
        text = html_file.read_text(encoding='utf-8', errors='ignore')
        if 'wave13_english.js' not in text:
            errors.append(f'{grade_name}: wave13_english.js is not connected')
    if not (ROOT / 'wave13_english.js').exists():
        errors.append('wave13_english.js is missing')
    return errors

def check_wave14_hooks() -> list[str]:
    errors: list[str] = []
    for grade_name in ('grade5_v2.html', 'grade6_v2.html', 'grade7_v2.html'):
        html_file = ROOT / grade_name
        if not html_file.exists():
            errors.append(f'{grade_name} is missing')
            continue
        text = html_file.read_text(encoding='utf-8', errors='ignore')
        if 'wave14_english.js' not in text:
            errors.append(f'{grade_name}: wave14_english.js is not connected')
    if not (ROOT / 'wave14_english.js').exists():
        errors.append('wave14_english.js is missing')
    return errors

def check_wave15_hooks() -> list[str]:
    errors: list[str] = []
    for grade_name in ('grade2_v2.html', 'grade3_v2.html', 'grade4_v2.html'):
        html_file = ROOT / grade_name
        if not html_file.exists():
            errors.append(f'{grade_name} is missing')
            continue
        text = html_file.read_text(encoding='utf-8', errors='ignore')
        if 'wave15_english.js' not in text:
            errors.append(f'{grade_name}: wave15_english.js is not connected')
    if not (ROOT / 'wave15_english.js').exists():
        errors.append('wave15_english.js is missing')
    return errors



def check_wave16_hooks() -> list[str]:
    errors: list[str] = []
    for grade_name in ('grade5_v2.html', 'grade6_v2.html', 'grade7_v2.html'):
        html_file = ROOT / grade_name
        if not html_file.exists():
            errors.append(f'{grade_name} is missing')
            continue
        text = html_file.read_text(encoding='utf-8', errors='ignore')
        if 'wave16_theory.js' not in text:
            errors.append(f'{grade_name}: wave16_theory.js is not connected')
    if not (ROOT / 'wave16_theory.js').exists():
        errors.append('wave16_theory.js is missing')
    return errors


def check_theory_debt_audit() -> list[str]:
    script = ROOT / 'theory_debt_audit.js'
    if not script.exists():
        return ['theory_debt_audit.js is missing']
    proc = subprocess.run(['node', str(script)], capture_output=True, text=True, cwd=ROOT)
    if proc.returncode == 0:
        expected = [ROOT / 'THEORY_DEBT_AUDIT.md', ROOT / 'THEORY_DEBT.json']
        missing = [str(p.name) for p in expected if not p.exists()]
        return [f'missing theory audit artifact: {name}' for name in missing]
    return [line for line in proc.stdout.splitlines() + proc.stderr.splitlines() if line.strip()]


def check_theory_debt_guards() -> list[str]:
    payload = ROOT / 'THEORY_DEBT.json'
    if not payload.exists():
        return ['THEORY_DEBT.json is missing']
    try:
        import json
        data = json.loads(payload.read_text(encoding='utf-8'))
    except Exception as exc:
        return [f'failed to read THEORY_DEBT.json: {exc}']
    errors: list[str] = []
    weak = [row for row in data.get('rows') or [] if row.get('status') != 'ok']
    if weak:
        preview = ', '.join(f"{r.get('grade')}:{r.get('subject')} / {r.get('topic')}={r.get('status')}" for r in weak[:8])
        errors.append(f'theory debt remains in 5–7 rich cheat sheets: {preview}')
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
    grade2 = rows.get('2')
    grade3 = rows.get('3')
    grade4 = rows.get('4')
    grade5 = rows.get('5')
    grade6 = rows.get('6')
    grade7 = rows.get('7')
    grade8 = rows.get('8')
    grade9 = rows.get('9')
    grade10 = rows.get('10')
    grade11 = rows.get('11')
    if not grade2 or int(grade2.get('currentTopics') or 0) < 2:
        errors.append('english vertical regression: grade 2 has fewer than 2 topics')
    if not grade3 or int(grade3.get('currentTopics') or 0) < 2:
        errors.append('english vertical regression: grade 3 has fewer than 2 topics')
    if not grade4 or int(grade4.get('currentTopics') or 0) < 2:
        errors.append('english vertical regression: grade 4 has fewer than 2 topics')
    if not grade5 or int(grade5.get('currentTopics') or 0) < 4:
        errors.append('english vertical regression: grade 5 has fewer than 4 topics')
    if not grade6 or int(grade6.get('currentTopics') or 0) < 4:
        errors.append('english vertical regression: grade 6 has fewer than 4 topics')
    if not grade7 or int(grade7.get('currentTopics') or 0) < 6:
        errors.append('english vertical regression: grade 7 has fewer than 6 topics')
    if not grade8 or int(grade8.get('currentTopics') or 0) < 8:
        errors.append('english vertical regression: grade 8 has fewer than 8 topics')
    if not grade9 or int(grade9.get('currentTopics') or 0) < 8:
        errors.append('english vertical regression: grade 9 has fewer than 8 topics')
    if not grade10 or int(grade10.get('currentTopics') or 0) < 6:
        errors.append('english vertical regression: grade 10 has fewer than 6 topics')
    if not grade11 or int(grade11.get('currentTopics') or 0) < 12:
        errors.append('english vertical regression: grade 11 has fewer than 12 topics')
    return errors



def check_wave17_hooks() -> list[str]:
    errors: list[str] = []
    needed = [f'grade{g}_v2.html' for g in range(2, 12)]
    for name in needed:
        path = ROOT / name
        if not path.exists():
            errors.append(f'{name} is missing')
            continue
        text = path.read_text(encoding='utf-8', errors='ignore')
        if 'wave17_english_infra.js' not in text:
            errors.append(f'{name}: wave17_english_infra.js is not connected')
    diag = ROOT / 'diagnostic.html'
    if not diag.exists():
        errors.append('diagnostic.html is missing')
    else:
        text = diag.read_text(encoding='utf-8', errors='ignore')
        if 'wave17_english_diag.js' not in text:
            errors.append('diagnostic.html: wave17_english_diag.js is not connected')
    if not (ROOT / 'wave17_english_infra.js').exists():
        errors.append('wave17_english_infra.js is missing')
    if not (ROOT / 'wave17_english_diag.js').exists():
        errors.append('wave17_english_diag.js is missing')
    return errors


def check_english_infra_audit() -> list[str]:
    script = ROOT / 'english_infra_audit.js'
    if not script.exists():
        return ['english_infra_audit.js is missing']
    proc = subprocess.run(['node', str(script)], capture_output=True, text=True, cwd=ROOT)
    if proc.returncode == 0:
        expected = [ROOT / 'ENGLISH_INFRA_AUDIT.md', ROOT / 'ENGLISH_INFRA_AUDIT.json']
        missing = [str(p.name) for p in expected if not p.exists()]
        return [f'missing English infra audit artifact: {name}' for name in missing]
    return [line for line in proc.stdout.splitlines() + proc.stderr.splitlines() if line.strip()]


def check_english_infra_guards() -> list[str]:
    payload = ROOT / 'ENGLISH_INFRA_AUDIT.json'
    if not payload.exists():
        return ['ENGLISH_INFRA_AUDIT.json is missing']
    try:
        import json
        data = json.loads(payload.read_text(encoding='utf-8'))
    except Exception as exc:
        return [f'failed to read ENGLISH_INFRA_AUDIT.json: {exc}']
    errors: list[str] = []
    if int(data.get('hookedGradesCount') or 0) < 10:
        errors.append(f"English infra regression: only {data.get('hookedGradesCount')} grade pages hooked")
    if int(data.get('sharedGuideCount') or 0) < 4:
        errors.append(f"English infra regression: only {data.get('sharedGuideCount')} shared guides found")
    if not data.get('hasLevelSummary'):
        errors.append('English infra regression: no English level summary hook')
    if not data.get('hasGuideButtons'):
        errors.append('English infra regression: no English subject toolbar hook')
    if not data.get('hasHallPatch'):
        errors.append('English infra regression: Hall of Fame patch missing')
    if int(data.get('diagnosticEnglishCount') or 0) < 30:
        errors.append(f"Diagnostic English bank too small: {data.get('diagnosticEnglishCount')}")
    grade_range = data.get('diagnosticGradeRange') or {}
    if int(grade_range.get('min') or 99) > 2 or int(grade_range.get('max') or 0) < 11:
        errors.append(f"Diagnostic English grade range incomplete: {grade_range}")
    if not data.get('hasConfigs'):
        errors.append('Diagnostic English configs missing')
    if not data.get('hasDiagHook'):
        errors.append('diagnostic.html hook for wave17 missing')
    if not data.get('hasEngLevelBlock'):
        errors.append('Diagnostic English result block missing')
    return errors


def check_wave18_hooks() -> list[str]:
    errors: list[str] = []
    for grade_name in [f'grade{g}_v2.html' for g in range(1, 12)]:
        html_file = ROOT / grade_name
        if not html_file.exists():
            errors.append(f'{grade_name} is missing')
            continue
        text = html_file.read_text(encoding='utf-8', errors='ignore')
        if 'wave18_cleanup.js' not in text:
            errors.append(f'{grade_name}: wave18_cleanup.js is not connected')
    if not (ROOT / 'wave18_cleanup.js').exists():
        errors.append('wave18_cleanup.js is missing')
    return errors


def check_rush_cleanup_audit() -> list[str]:
    script = ROOT / 'rush_cleanup_audit.js'
    if not script.exists():
        return ['rush_cleanup_audit.js is missing']
    proc = subprocess.run(['node', str(script)], capture_output=True, text=True, cwd=ROOT)
    if proc.returncode == 0:
        expected = [ROOT / 'RUSH_CLEANUP_AUDIT.md', ROOT / 'RUSH_CLEANUP_AUDIT.json']
        missing = [str(p.name) for p in expected if not p.exists()]
        return [f'missing rush cleanup artifact: {name}' for name in missing]
    return [line for line in proc.stdout.splitlines() + proc.stderr.splitlines() if line.strip()]


def check_rush_cleanup_guards() -> list[str]:
    payload = ROOT / 'RUSH_CLEANUP_AUDIT.json'
    if not payload.exists():
        return ['RUSH_CLEANUP_AUDIT.json is missing']
    try:
        import json
        data = json.loads(payload.read_text(encoding='utf-8'))
    except Exception as exc:
        return [f'failed to read RUSH_CLEANUP_AUDIT.json: {exc}']
    errors: list[str] = []
    if int(data.get('hookedGrades') or 0) < 11:
        errors.append(f'wave18 cleanup regression: only {data.get("hookedGrades")} grade pages hooked')
    if not data.get('hasSeparateRushSetting'):
        errors.append('wave18 cleanup regression: separate rush publish setting missing')
    if not data.get('hasLocalOnlyCopy'):
        errors.append('wave18 cleanup regression: no local-only leaderboard copy')
    if not data.get('hasCloudPrivacySplit'):
        errors.append('wave18 cleanup regression: cloud/privacy split copy missing')
    if not data.get('indexLinksTests') or not data.get('testsPageHasPortrait'):
        errors.append('tests.html routing/content regression')
    return errors



def check_wave19_hooks() -> list[str]:
    errors: list[str] = []
    for grade_name in ('grade8_v2.html', 'grade9_v2.html', 'grade11_v2.html'):
        html_file = ROOT / grade_name
        if not html_file.exists():
            errors.append(f'{grade_name} is missing')
            continue
        text = html_file.read_text(encoding='utf-8', errors='ignore')
        if 'wave19_mesh_8911.js' not in text:
            errors.append(f'{grade_name}: wave19_mesh_8911.js is not connected')
    if not (ROOT / 'wave19_mesh_8911.js').exists():
        errors.append('wave19_mesh_8911.js is missing')
    return errors


def check_wave19_mesh_audit() -> list[str]:
    script = ROOT / 'wave19_mesh_audit.js'
    if not script.exists():
        return ['wave19_mesh_audit.js is missing']
    proc = subprocess.run(['node', str(script)], capture_output=True, text=True, cwd=ROOT)
    if proc.returncode == 0:
        expected = [ROOT / 'WAVE19_MESH_AUDIT.md', ROOT / 'WAVE19_MESH_AUDIT.json']
        missing = [str(p.name) for p in expected if not p.exists()]
        return [f'missing wave19 mesh artifact: {name}' for name in missing]
    return [line for line in proc.stdout.splitlines() + proc.stderr.splitlines() if line.strip()]


def check_wave19_mesh_guards() -> list[str]:
    payload = ROOT / 'WAVE19_MESH_AUDIT.json'
    if not payload.exists():
        return ['WAVE19_MESH_AUDIT.json is missing']
    try:
        import json
        data = json.loads(payload.read_text(encoding='utf-8'))
    except Exception as exc:
        return [f'failed to read WAVE19_MESH_AUDIT.json: {exc}']
    errors: list[str] = []
    rows = {str(r.get('grade')): r for r in data.get('rows') or []}
    for grade, need_subjects, need_topics in (('8', 12, 46), ('9', 12, 46), ('11', 13, 53)):
        row = rows.get(grade) or {}
        if (row.get('missing') or []):
            errors.append(f'wave19 mesh regression: grade {grade} missing {", ".join(row.get("missing") or [])}')
        if int(row.get('subjects') or 0) < need_subjects:
            errors.append(f'wave19 mesh regression: grade {grade} has only {row.get("subjects")} subjects')
        if int(row.get('topics') or 0) < need_topics:
            errors.append(f'wave19 mesh regression: grade {grade} has only {row.get("topics")} topics')
    return errors


def check_wave20_hooks() -> list[str]:
    errors: list[str] = []
    for grade_name in ('grade1_v2.html', 'grade2_v2.html', 'grade3_v2.html', 'grade4_v2.html', 'grade5_v2.html', 'grade6_v2.html', 'grade7_v2.html'):
        html_file = ROOT / grade_name
        if not html_file.exists():
            errors.append(f'{grade_name} is missing')
            continue
        text = html_file.read_text(encoding='utf-8', errors='ignore')
        if 'wave20_mesh_567primary.js' not in text:
            errors.append(f'{grade_name}: wave20_mesh_567primary.js is not connected')
    if not (ROOT / 'wave20_mesh_567primary.js').exists():
        errors.append('wave20_mesh_567primary.js is missing')
    return errors


def check_wave20_mesh_audit() -> list[str]:
    script = ROOT / 'wave20_mesh_audit.js'
    if not script.exists():
        return ['wave20_mesh_audit.js is missing']
    proc = subprocess.run(['node', str(script)], capture_output=True, text=True, cwd=ROOT)
    if proc.returncode == 0:
        expected = [ROOT / 'WAVE20_MESH_AUDIT.md', ROOT / 'WAVE20_MESH_AUDIT.json']
        missing = [str(p.name) for p in expected if not p.exists()]
        return [f'missing wave20 mesh artifact: {name}' for name in missing]
    return [line for line in proc.stdout.splitlines() + proc.stderr.splitlines() if line.strip()]


def check_wave20_mesh_guards() -> list[str]:
    payload = ROOT / 'WAVE20_MESH_AUDIT.json'
    if not payload.exists():
        return ['WAVE20_MESH_AUDIT.json is missing']
    try:
        import json
        data = json.loads(payload.read_text(encoding='utf-8'))
    except Exception as exc:
        return [f'failed to read WAVE20_MESH_AUDIT.json: {exc}']
    errors: list[str] = []
    rows = {str(r.get('grade')): r for r in data.get('rows') or []}
    need = {
        '1': (4, 18, ('Литературное чтение', 'Окружающий мир')),
        '2': (5, 19, ('Литературное чтение', 'Окружающий мир')),
        '3': (5, 18, ('Литературное чтение', 'Окружающий мир')),
        '4': (5, 18, ('Литературное чтение', 'Окружающий мир')),
        '5': (7, 23, ('Литература',)),
        '6': (7, 23, ('Литература',)),
        '7': (10, 34, ('Литература', 'Биология', 'География', 'Информатика')),
    }
    for grade, (min_subj, min_topics, req_names) in need.items():
        row = rows.get(grade) or {}
        if (row.get('missing') or []):
            errors.append(f'wave20 mesh regression: grade {grade} missing {", ".join(row.get("missing") or [])}')
        if (row.get('countProblems') or []):
            errors.append(f'wave20 mesh regression: grade {grade} low topic counts in {", ".join(row.get("countProblems") or [])}')
        if int(row.get('subjects') or 0) < min_subj:
            errors.append(f'wave20 mesh regression: grade {grade} has only {row.get("subjects")} subjects')
        if int(row.get('topics') or 0) < min_topics:
            errors.append(f'wave20 mesh regression: grade {grade} has only {row.get("topics")} topics')
        topic_map = row.get('requiredTopics') or {}
        for name in req_names:
            if int(topic_map.get(name) or 0) <= 0:
                errors.append(f'wave20 mesh regression: grade {grade} missing required subject {name}')
    return errors



def check_wave21_hooks() -> list[str]:
    errors: list[str] = []
    for grade_name in (
        'grade1_v2.html','grade2_v2.html','grade3_v2.html','grade4_v2.html','grade5_v2.html','grade6_v2.html','grade7_v2.html','grade8_v2.html','grade9_v2.html','grade10_v2.html','grade11_v2.html'
    ):
        html_file = ROOT / grade_name
        if not html_file.exists():
            errors.append(f'{grade_name} is missing')
            continue
        text = html_file.read_text(encoding='utf-8', errors='ignore')
        if 'wave21_progress.js' not in text:
            errors.append(f'{grade_name}: wave21_progress.js is not connected')
    if not (ROOT / 'wave21_progress.js').exists():
        errors.append('wave21_progress.js is missing')
    return errors


def check_wave21_progress_audit() -> list[str]:
    script = ROOT / 'wave21_progress_audit.js'
    if not script.exists():
        return ['wave21_progress_audit.js is missing']
    proc = subprocess.run(['node', str(script)], capture_output=True, text=True, cwd=ROOT)
    if proc.returncode == 0:
        expected = [ROOT / 'WAVE21_PROGRESS_AUDIT.md', ROOT / 'WAVE21_PROGRESS_AUDIT.json']
        missing = [str(p.name) for p in expected if not p.exists()]
        return [f'missing wave21 progress artifact: {name}' for name in missing]
    return [line for line in proc.stdout.splitlines() + proc.stderr.splitlines() if line.strip()]


def check_wave21_progress_guards() -> list[str]:
    payload = ROOT / 'WAVE21_PROGRESS_AUDIT.json'
    if not payload.exists():
        return ['WAVE21_PROGRESS_AUDIT.json is missing']
    try:
        import json
        data = json.loads(payload.read_text(encoding='utf-8'))
    except Exception as exc:
        return [f'failed to read WAVE21_PROGRESS_AUDIT.json: {exc}']
    errors: list[str] = []
    if int(data.get('hookedCount') or 0) < int(data.get('totalPages') or 0):
        errors.append('wave21 progress regression: not all grade pages are hooked')
    feats = data.get('features') or {}
    for key in ('hasResume','hasFavorites','hasContinue','hasRandom','hasRepeatErrors','hasSnapshot','hasProgressBar'):
        if not feats.get(key):
            errors.append(f'wave21 progress regression: {key} is missing')
    return errors



def check_wave22_hooks() -> list[str]:
    errors: list[str] = []
    html = ROOT / 'dashboard.html'
    if not html.exists():
        return ['dashboard.html is missing']
    text = html.read_text(encoding='utf-8', errors='ignore')
    for snippet in ('wave22_dashboard.js', 'wave22-insights', 'wave22-heatmap', 'wave22-radar', 'wave22-trend', 'wave22-subjects'):
        if snippet not in text:
            errors.append(f'dashboard.html: missing wave22 analytics hook {snippet}')
    if not (ROOT / 'wave22_dashboard.js').exists():
        errors.append('wave22_dashboard.js is missing')
    return errors


def check_wave22_dashboard_audit() -> list[str]:
    script = ROOT / 'wave22_dashboard_audit.js'
    if not script.exists():
        return ['wave22_dashboard_audit.js is missing']
    proc = subprocess.run(['node', str(script)], capture_output=True, text=True, cwd=ROOT)
    if proc.returncode == 0:
        expected = [ROOT / 'WAVE22_DASHBOARD_AUDIT.md', ROOT / 'WAVE22_DASHBOARD_AUDIT.json']
        missing = [str(p.name) for p in expected if not p.exists()]
        return [f'missing wave22 dashboard artifact: {name}' for name in missing]
    return [line for line in proc.stdout.splitlines() + proc.stderr.splitlines() if line.strip()]


def check_wave22_dashboard_guards() -> list[str]:
    payload = ROOT / 'WAVE22_DASHBOARD_AUDIT.json'
    if not payload.exists():
        return ['WAVE22_DASHBOARD_AUDIT.json is missing']
    try:
        import json
        data = json.loads(payload.read_text(encoding='utf-8'))
    except Exception as exc:
        return [f'failed to read WAVE22_DASHBOARD_AUDIT.json: {exc}']
    errors: list[str] = []
    if int((data.get('summary') or {}).get('placeholdersOk') or 0) < 5:
        errors.append('wave22 dashboard regression: analytics placeholders are incomplete')
    if int((data.get('summary') or {}).get('buttonsOk') or 0) < 4:
        errors.append('wave22 dashboard regression: export buttons are incomplete')
    hooks = data.get('hooks') or {}
    for key in ('dashboardScript','swHook','activity365','stateEvent','csvFn','pngFn'):
        if not hooks.get(key):
            errors.append(f'wave22 dashboard regression: {key} is missing')
    return errors



def check_wave23_hooks() -> list[str]:
    errors: list[str] = []
    for html_file in HTML_FILES:
        text = html_file.read_text(encoding='utf-8', errors='ignore')
        if 'wave23_accessibility.js' not in text:
            errors.append(f'{html_file.name}: wave23_accessibility.js is not connected')
    if not (ROOT / 'wave23_accessibility.js').exists():
        errors.append('wave23_accessibility.js is missing')
    return errors


def check_wave23_accessibility_audit() -> list[str]:
    script = ROOT / 'wave23_accessibility_audit.js'
    if not script.exists():
        return ['wave23_accessibility_audit.js is missing']
    proc = subprocess.run(['node', str(script)], capture_output=True, text=True, cwd=ROOT)
    if proc.returncode == 0:
        expected = [ROOT / 'WAVE23_ACCESSIBILITY_AUDIT.md', ROOT / 'WAVE23_ACCESSIBILITY_AUDIT.json']
        missing = [str(p.name) for p in expected if not p.exists()]
        return [f'missing wave23 accessibility artifact: {name}' for name in missing]
    return [line for line in proc.stdout.splitlines() + proc.stderr.splitlines() if line.strip()]


def check_wave23_accessibility_guards() -> list[str]:
    payload = ROOT / 'WAVE23_ACCESSIBILITY_AUDIT.json'
    if not payload.exists():
        return ['WAVE23_ACCESSIBILITY_AUDIT.json is missing']
    try:
        import json
        data = json.loads(payload.read_text(encoding='utf-8'))
    except Exception as exc:
        return [f'failed to read WAVE23_ACCESSIBILITY_AUDIT.json: {exc}']
    errors: list[str] = []
    summary = data.get('summary') or {}
    if int(summary.get('hookedPages') or 0) < int(summary.get('totalPages') or 0):
        errors.append('wave23 accessibility regression: not all HTML pages are hooked')
    for key in ('hasSkipLink','hasLiveRegion','hasDialogRole','hasDialogTrap','hasKeyboardProxy','hasScreenAria','hasEnglishLang','hasReducedMotion','hasHighContrast','hasMainLandmark','hasBannerLandmark'):
        if not summary.get(key):
            errors.append(f'wave23 accessibility regression: {key} is missing')
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
    errors.extend(check_wave13_hooks())
    errors.extend(check_wave14_hooks())
    errors.extend(check_wave15_hooks())
    errors.extend(check_wave16_hooks())
    errors.extend(check_wave17_hooks())
    errors.extend(check_wave18_hooks())
    errors.extend(check_wave19_hooks())
    errors.extend(check_wave20_hooks())
    errors.extend(check_wave21_hooks())
    errors.extend(check_wave22_hooks())
    errors.extend(check_wave23_hooks())
    errors.extend(check_curriculum_audit())
    errors.extend(check_theory_debt_audit())
    errors.extend(check_english_vertical_audit())
    errors.extend(check_english_infra_audit())
    errors.extend(check_rush_cleanup_audit())
    errors.extend(check_wave19_mesh_audit())
    errors.extend(check_wave20_mesh_audit())
    errors.extend(check_wave21_progress_audit())
    errors.extend(check_wave22_dashboard_audit())
    errors.extend(check_wave23_accessibility_audit())
    errors.extend(check_topic_coverage_audit())
    errors.extend(check_curriculum_guards())
    errors.extend(check_topic_coverage_guards())
    errors.extend(check_theory_debt_guards())
    errors.extend(check_english_vertical_guards())
    errors.extend(check_english_infra_guards())
    errors.extend(check_rush_cleanup_guards())
    errors.extend(check_wave19_mesh_guards())
    errors.extend(check_wave20_mesh_guards())
    errors.extend(check_wave21_progress_guards())
    errors.extend(check_wave22_dashboard_guards())
    errors.extend(check_wave23_accessibility_guards())

    if errors:
        print('FAIL')
        print('-----')
        for error in errors:
            print(error)
        return 1

    print('OK: syntax, SW assets, legacy links, runtime + flow + browser E2E smoke, curriculum + coverage + English vertical + English infra + theory debt audit, wave 9/10/11/12/13/14/15/16/17/18/19/20/21/22/23 hooks and content guards passed')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
