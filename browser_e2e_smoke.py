from __future__ import annotations

import asyncio
import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent
LOCAL_SCRIPT_RE = re.compile(r'<script\s+src="([^"]+)"\s*></script>', re.I)
LOCAL_STYLE_RE = re.compile(r'<link\s+rel="stylesheet"\s+href="([^"]+)"\s*/?>', re.I)
INLINE_SCRIPT_RE = re.compile(r'<script>([\s\S]*?)</script>', re.I)
FONT_LINK_RE = re.compile(r'<link[^>]+fonts\.googleapis\.com[^>]*>', re.I)
MANIFEST_DATA_RE = re.compile(r'<link\s+rel="manifest"[^>]*>', re.I)

PRELUDE = """
<script>
var __STORE = {};
var __LS = {
  getItem:function(k){return Object.prototype.hasOwnProperty.call(__STORE,k)?__STORE[k]:null;},
  setItem:function(k,v){__STORE[k]=String(v);},
  removeItem:function(k){delete __STORE[k];},
  clear:function(){for(var k in __STORE) delete __STORE[k];}
};
window.__STORE = __STORE;
window.__LS = __LS;
window.alert = function(){};
window.confirm = function(){ return true; };
window.fetch = async function(url, opts){
  return {
    ok:true,
    status:200,
    text: async function(){ return JSON.stringify({players:{},records:[]}); },
    json: async function(){ return {players:{},records:[]}; }
  };
};
try{ navigator.vibrate = function(){}; }catch(e){}
try{ navigator.clipboard = { writeText: async function(){} }; }catch(e){}
try{ navigator.share = null; }catch(e){}
try{ navigator.serviceWorker = { register: function(){ return Promise.resolve(); } }; }catch(e){}
</script>
""".strip()


@dataclass
class ScenarioResult:
    scenario: str
    ok: bool
    details: str


def _inline_assets(html: str, page_file: Path) -> str:
    def replace_style(match: re.Match[str]) -> str:
        href = match.group(1)
        if href.startswith('http://') or href.startswith('https://'):
            return ''
        path = (page_file.parent / href).resolve()
        if not path.exists():
            return ''
        return f'<style>{path.read_text(encoding="utf-8")}</style>'

    def replace_script(match: re.Match[str]) -> str:
        src = match.group(1)
        if src.startswith('http://') or src.startswith('https://'):
            return ''
        path = (page_file.parent / src).resolve()
        if not path.exists():
            return ''
        code = path.read_text(encoding='utf-8')
        code = re.sub(r'\blocalStorage\b', '__LS', code)
        return f'<script>{code}</script>'

    html = FONT_LINK_RE.sub('', html)
    html = MANIFEST_DATA_RE.sub('', html)
    html = LOCAL_STYLE_RE.sub(replace_style, html)
    html = LOCAL_SCRIPT_RE.sub(replace_script, html)
    html = INLINE_SCRIPT_RE.sub(lambda m: f'<script>{re.sub(r"\\blocalStorage\\b", "__LS", m.group(1))}</script>', html)
    html = html.replace('<head>', '<head>' + PRELUDE, 1)
    return html


async def load_page(page, file_name: str) -> None:
    html_path = ROOT / file_name
    html = html_path.read_text(encoding='utf-8')
    html = _inline_assets(html, html_path)
    await page.set_content(html, wait_until='load')
    await page.wait_for_timeout(50)


async def run_grade_flow(page, grade: int) -> list[ScenarioResult]:
    file_name = f'grade{grade}_v2.html'
    await load_page(page, file_name)
    results: list[ScenarioResult] = []

    # registration + quiz flow
    try:
        await page.evaluate("registerPlayer('Тест', null)")
        await page.evaluate("refreshMain && refreshMain()")
        count = await page.locator('#sg .scard').count()
        ok = count > 0
        details = f'{count} subject cards'
        if ok:
            await page.evaluate(
                """
                (() => {
                  const subj = SUBJ.find(s => !s.locked) || SUBJ[0];
                  openSubj(subj.id);
                  cT = cS.tops[0];
                  curTheory = cT.th;
                  mix = false; globalMix = false; rushMode = false; diagMode = false;
                  startQuiz();
                })()
                """
            )
            question = await page.locator('#qb').inner_text()
            ok = bool(question.strip())
            details += '; question rendered' if ok else '; question empty'
            if ok:
                await page.evaluate(
                    """
                    (() => {
                      const idx = prob.options.indexOf(prob.answer);
                      ans(idx);
                      endSession();
                    })()
                    """
                )
                keys = await page.evaluate("Object.keys(window.__STORE)")
                needed = {f'trainer_progress_{grade}', f'trainer_daily_{grade}', f'trainer_streak_{grade}'}
                ok = needed.issubset(set(keys))
                details += f'; storage keys={len(keys)}'
        results.append(ScenarioResult(f'{file_name}: quiz flow', ok, details))
    except Exception as exc:
        results.append(ScenarioResult(f'{file_name}: quiz flow', False, str(exc)))

    # backup export/import flow
    try:
        await page.evaluate(
            """
            (() => {
              window.__backupCode = encodeTransferPayload(getBackupSnapshot());
              const before = STR.totalQs || 0;
              resetProgress();
              window.__afterReset = STR.totalQs || 0;
              applyBackupSnapshot(parseTransferPayload(window.__backupCode));
              window.__afterImport = STR.totalQs || 0;
            })()
            """
        )
        after_reset = await page.evaluate('window.__afterReset')
        after_import = await page.evaluate('window.__afterImport')
        ok = after_reset == 0 and after_import > 0
        details = f'after_reset={after_reset}, after_import={after_import}'
        results.append(ScenarioResult(f'{file_name}: backup export/import', ok, details))
    except Exception as exc:
        results.append(ScenarioResult(f'{file_name}: backup export/import', False, str(exc)))

    # targeted checks
    if grade == 1:
        try:
            uniq = await page.evaluate(
                """
                (() => {
                  const s = new Set();
                  for(let i=0;i<80;i++) s.add(genCount().question);
                  return s.size;
                })()
                """
            )
            results.append(ScenarioResult(f'{file_name}: genCount variety', uniq >= 12, f'unique={uniq}'))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: genCount variety', False, str(exc)))
    if grade == 2:
        try:
            uniq = await page.evaluate(
                """
                (() => {
                  const s = new Set();
                  for(let i=0;i<80;i++) s.add(genMeasure().question);
                  return s.size;
                })()
                """
            )
            results.append(ScenarioResult(f'{file_name}: genMeasure variety', uniq >= 7, f'unique={uniq}'))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: genMeasure variety', False, str(exc)))
    if grade == 10:
        try:
            topics = await page.evaluate("SUBJ.find(s=>s.id==='eng').tops.map(t=>t.id)")
            ok = 'phrasal' in topics and 'essay' in topics
            results.append(ScenarioResult(f'{file_name}: english extensions', ok, ','.join(topics)))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: english extensions', False, str(exc)))

    return results


async def run_diagnostic_flow(page) -> ScenarioResult:
    try:
        await load_page(page, 'diagnostic.html')
        await page.evaluate(
            """
            (() => {
              startDiag('mathall');
              const first = questions.length;
              const btn = document.createElement('button');
              selectOpt(btn, window._curAnswer, window._curAnswer, window._curHint);
              nextQ();
              skipQ();
              window.__diagState = { len: first, qIndex, grade: questions[qIndex] ? questions[qIndex].g : null };
            })()
            """
        )
        state = await page.evaluate('window.__diagState')
        ok = int(state['len']) >= 20 and int(state['qIndex']) >= 2
        return ScenarioResult('diagnostic.html: adaptive flow', ok, json.dumps(state, ensure_ascii=False))
    except Exception as exc:
        return ScenarioResult('diagnostic.html: adaptive flow', False, str(exc))


async def main() -> int:
    results: list[ScenarioResult] = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path='/usr/bin/chromium')
        context = await browser.new_context(ignore_https_errors=True)
        for grade in (1, 2, 5, 10):
            page = await context.new_page()
            results.extend(await run_grade_flow(page, grade))
            await page.close()
        page = await context.new_page()
        results.append(await run_diagnostic_flow(page))
        await page.close()
        await browser.close()

    md_lines = ['# Browser E2E smoke', '', '| Scenario | Status | Details |', '|---|---|---|']
    failed = False
    for row in results:
        status = '✅' if row.ok else '❌'
        failed = failed or (not row.ok)
        details = row.details.replace('|', '\\|').replace('\n', ' ')
        md_lines.append(f'| {row.scenario} | {status} | {details} |')
    (ROOT / 'BROWSER_E2E_REPORT.md').write_text('\n'.join(md_lines) + '\n', encoding='utf-8')

    if failed:
        print('BROWSER_E2E_FAIL')
        for row in results:
            print(('OK   ' if row.ok else 'FAIL ') + row.scenario + ' :: ' + row.details)
        return 1

    print('BROWSER_E2E_OK')
    for row in results:
        print('OK   ' + row.scenario + ' :: ' + row.details)
    return 0


if __name__ == '__main__':
    raise SystemExit(asyncio.run(main()))
