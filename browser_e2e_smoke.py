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

    # theme shell
    try:
        btn_count = await page.locator('[data-theme-cycle]').count()
        await page.locator('[data-theme-cycle]').click()
        pref = await page.evaluate('__LS.getItem("trainer_theme")')
        results.append(ScenarioResult(f'{file_name}: theme toggle', btn_count > 0 and pref == 'light', f'buttons={btn_count}, pref={pref}'))
    except Exception as exc:
        results.append(ScenarioResult(f'{file_name}: theme toggle', False, str(exc)))

    # wave23 accessibility shell
    try:
        payload = await page.evaluate(
            """
            (() => ({
              skip: !!document.getElementById('wave23-skip-link'),
              live: !!document.getElementById('wave23-live'),
              mainRole: !!document.querySelector('[role=\"main\"]'),
              bannerRole: !!document.querySelector('header[role=\"banner\"]')
            }))
            """
        )
        ok = bool(payload.get('skip')) and bool(payload.get('live')) and bool(payload.get('mainRole')) and bool(payload.get('bannerRole'))
        results.append(ScenarioResult(f'{file_name}: accessibility shell', ok, json.dumps(payload, ensure_ascii=False)))
    except Exception as exc:
        results.append(ScenarioResult(f'{file_name}: accessibility shell', False, str(exc)))

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

    # wave21 progress UX
    try:
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
        progress_text = await page.locator('#wave21-session-slot').inner_text()
        ok = 'Вопрос' in progress_text
        details = progress_text.replace('\n', ' ')[:160]
        results.append(ScenarioResult(f'{file_name}: progress UX shell', ok, details))
    except Exception as exc:
        results.append(ScenarioResult(f'{file_name}: progress UX shell', False, str(exc)))

    try:
        await page.evaluate(
            """
            (() => {
              const subj = SUBJ.find(s => !s.locked) || SUBJ[0];
              openSubj(subj.id);
              cT = cS.tops[0];
              curTheory = cT.th;
              go('theory');
              if(typeof wave21ToggleFavorite === 'function') wave21ToggleFavorite();
              go('main');
              refreshMain && refreshMain();
            })()
            """
        )
        fav_count = await page.locator('#wave21-favs .wave21-favbtn').count()
        main_text = await page.locator('#wave21-main-actions').inner_text()
        ok = fav_count >= 1 and ('Продолжить тему' in main_text or 'Избранные темы' in main_text)
        details = f"fav_count={fav_count}; text={main_text[:120].replace(chr(10), ' ')}"
        results.append(ScenarioResult(f'{file_name}: favourites and continue', ok, details))
    except Exception as exc:
        results.append(ScenarioResult(f'{file_name}: favourites and continue', False, str(exc)))

    try:
        await page.evaluate(
            """
            (() => {
              const subj = SUBJ.find(s => !s.locked) || SUBJ[0];
              openSubj(subj.id);
              cT = cS.tops[0];
              curTheory = cT.th;
              mix = false; globalMix = false; rushMode = false; diagMode = false;
              startQuiz();
              for(let i=0;i<3;i++){
                const idx = prob.options.indexOf(prob.answer);
                ans(idx);
                if(i < 2) nextQ();
              }
              if(typeof wave21ForceSnapshot === 'function') wave21ForceSnapshot();
            })()
            """
        )
        snap = await page.evaluate("__LS.getItem('trainer_session_snapshot_%d')" % grade)
        ok = bool(snap)
        details = f'snapshot={bool(snap)}'
        results.append(ScenarioResult(f'{file_name}: session snapshot', ok, details))
    except Exception as exc:
        results.append(ScenarioResult(f'{file_name}: session snapshot', False, str(exc)))

    # accessibility dialog and escape
    try:
        await page.evaluate("showHallOfFame && showHallOfFame()")
        await page.wait_for_timeout(80)
        before = await page.locator('[role=\"dialog\"][aria-modal=\"true\"]').count()
        payload = await page.evaluate(
            """
            (() => {
              const dialog = document.querySelector('[role=\"dialog\"][aria-modal=\"true\"]:last-of-type') || Array.from(document.querySelectorAll('[role=\"dialog\"][aria-modal=\"true\"]')).pop();
              return { hasDialog: !!dialog, labelled: !!(dialog && (dialog.getAttribute('aria-labelledby') || dialog.getAttribute('aria-label')))};
            })()
            """
        )
        await page.keyboard.press('Escape')
        await page.wait_for_timeout(80)
        after = await page.locator('[role=\"dialog\"][aria-modal=\"true\"]').count()
        closed = after < before
        ok = bool(payload.get('hasDialog')) and bool(payload.get('labelled')) and closed
        details = json.dumps({**payload, 'before': before, 'after': after, 'closed': closed}, ensure_ascii=False)
        results.append(ScenarioResult(f'{file_name}: accessibility dialog', ok, details))
    except Exception as exc:
        results.append(ScenarioResult(f'{file_name}: accessibility dialog', False, str(exc)))

    # back navigation inside SPA
    try:
        await page.evaluate(
            """
            (() => {
              const subj = SUBJ.find(s => !s.locked) || SUBJ[0];
              openSubj(subj.id);
            })()
            """
        )
        await page.wait_for_timeout(80)
        topic_count = await page.locator('#tl .tbtn').count()
        await page.go_back()
        await page.wait_for_timeout(120)
        subject_count = await page.locator('#sg .scard').count()
        ok = topic_count > 0 and subject_count > 0
        details = f'topics={topic_count}, subjects_after_back={subject_count}'
        results.append(ScenarioResult(f'{file_name}: browser back', ok, details))
    except Exception as exc:
        results.append(ScenarioResult(f'{file_name}: browser back', False, str(exc)))

    # backup export/import flow
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
    try:
        await page.evaluate(
            """
            (() => {
              const subj = SUBJ.find(s => !s.locked) || SUBJ[0];
              openSubj(subj.id);
              cT = cS.tops[0];
              curTheory = cT.th;
              mix = false; globalMix = false; rushMode = false; diagMode = false;
              startQuiz();
              window.dispatchEvent(new PopStateEvent('popstate', { state: { trainerApp: true, screen: 'subj' } }));
            })()
            """
        )
        await page.wait_for_timeout(120)
        screen_id = await page.evaluate("document.querySelector('.scr.on') && document.querySelector('.scr.on').id")
        ok = screen_id in {'s-result', 's-subj', 's-main'}
        results.append(ScenarioResult(f'{file_name}: back during session', ok, f'screen={screen_id}'))
    except Exception as exc:
        results.append(ScenarioResult(f'{file_name}: back during session', False, str(exc)))


    if grade in {5, 6, 7}:
        try:
            payload = await page.evaluate(
                """
                (() => {
                  const subj = SUBJ.find(s => !s.locked && s.id !== 'eng') || SUBJ[0];
                  openSubj(subj.id);
                  const topic = cS.tops[0];
                  cT = topic;
                  const html = topic.th || '';
                  return { subject: subj.id, topic: topic.id, len: String(html).replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim().length, hasFm: /class=\"fm\"/.test(html), hasEx: /class=\"ex\"/.test(html) };
                })()
                """
            )
            ok = int(payload.get('len') or 0) >= 220 and bool(payload.get('hasFm')) and bool(payload.get('hasEx'))
            details = f"{payload.get('subject')}/{payload.get('topic')} len={payload.get('len')} fm={payload.get('hasFm')} ex={payload.get('hasEx')}"
            results.append(ScenarioResult(f'{file_name}: rich theory', ok, details))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: rich theory', False, str(exc)))

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
    if grade in (2, 3, 4, 5, 6, 7, 8, 9):
        try:
            payload = await page.evaluate(
                """
                (() => {
                  const eng = SUBJ.find(s => s.id === 'eng');
                  if(!eng) return { ok:false, topics:[], q:'' };
                  openSubj('eng');
                  const toolbar = document.getElementById('eng-extra-tools');
                  cT = eng.tops[0];
                  curTheory = cT.th;
                  mix = false; globalMix = false; rushMode = false; diagMode = false;
                  startQuiz();
                  return { ok:true, topics: eng.tops.map(t => t.id), toolbar: !!toolbar, toolButtons: toolbar ? toolbar.querySelectorAll('button').length : 0, level: window.getEnglishLevelSummary ? window.getEnglishLevelSummary().level : null };
                })()
                """
            )
            topics = payload.get('topics') or []
            qtext = await page.locator('#qb').inner_text()
            need = 2 if grade in (2, 3, 4) else 4 if grade in (5, 6) else 6 if grade == 7 else 8
            await page.wait_for_timeout(60)
            qlang = await page.evaluate("document.getElementById('qb') && document.getElementById('qb').getAttribute('lang')")
            ok = payload.get('ok') and len(topics) >= need and bool(qtext.strip())
            details = f"topics={len(topics)}; need={need}; toolbar={payload.get('toolbar')}; buttons={payload.get('toolButtons')}; level={payload.get('level')}; q={qtext[:40]}; lang={qlang}"
            results.append(ScenarioResult(f'{file_name}: english vertical', ok, details))
            results.append(ScenarioResult(f'{file_name}: english lang', qlang == 'en', f'lang={qlang}'))
            toolbar_need = 1 if grade in (2,3,4) else 5
            toolbar_ok = payload.get('toolbar') and int(payload.get('toolButtons') or 0) >= toolbar_need and bool(payload.get('level'))
            results.append(ScenarioResult(f'{file_name}: english infra', toolbar_ok, f"buttons={payload.get('toolButtons')}; need={toolbar_need}; level={payload.get('level')}"))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: english vertical', False, str(exc)))
            results.append(ScenarioResult(f'{file_name}: english infra', False, str(exc)))


    if grade in (1, 2, 3, 4):
        try:
            payload = await page.evaluate(
                """
                (() => {
                  const names = SUBJ.map(s => s.nm);
                  const read = SUBJ.find(s => s.nm === 'Литературное чтение');
                  const world = SUBJ.find(s => s.id === 'world' || s.id === 'okr');
                  return { names, readTopics: read ? read.tops.length : 0, worldTopics: world ? world.tops.length : 0 };
                })()
                """
            )
            need_world = 6 if grade == 3 else 5
            ok = 'Литературное чтение' in (payload.get('names') or []) and int(payload.get('readTopics') or 0) >= 3 and int(payload.get('worldTopics') or 0) >= need_world
            details = f"read={payload.get('readTopics')}; world={payload.get('worldTopics')}; names={','.join(payload.get('names') or [])}"
            results.append(ScenarioResult(f'{file_name}: primary mesh', ok, details))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: primary mesh', False, str(exc)))

    if grade in (5, 6):
        try:
            payload = await page.evaluate(
                """
                (() => {
                  const names = SUBJ.map(s => s.nm);
                  const lit = SUBJ.find(s => s.nm === 'Литература');
                  return { names, topics: lit ? lit.tops.length : 0 };
                })()
                """
            )
            ok = 'Литература' in (payload.get('names') or []) and int(payload.get('topics') or 0) >= 3
            results.append(ScenarioResult(f'{file_name}: literature mesh', ok, f"topics={payload.get('topics')}; names={','.join(payload.get('names') or [])}"))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: literature mesh', False, str(exc)))

    if grade == 7:
        try:
            payload = await page.evaluate(
                """
                (() => {
                  const names = SUBJ.map(s => s.nm);
                  const ids = ['lit', 'bio', 'geog', 'inf'];
                  const counts = Object.fromEntries(ids.map(id => [id, (SUBJ.find(s => s.id === id) || { tops: [] }).tops.length]));
                  openSubj('inf');
                  cT = cS.tops[0];
                  curTheory = cT.th;
                  mix = false; globalMix = false; rushMode = false; diagMode = false;
                  startQuiz();
                  return { names, counts };
                })()
                """
            )
            qtext = await page.locator('#qb').inner_text()
            need_names = {'Литература', 'Биология', 'География', 'Информатика'}
            ok = need_names.issubset(set(payload.get('names') or [])) and all(int((payload.get('counts') or {}).get(k, 0)) >= 3 for k in ('lit','bio','geog','inf')) and bool(qtext.strip())
            details = f"counts={payload.get('counts')}; q={qtext[:40]}"
            results.append(ScenarioResult(f'{file_name}: mesh extensions', ok, details))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: mesh extensions', False, str(exc)))

    if grade in (10, 11):
        try:
            payload = await page.evaluate(
                """
                (() => {
                  const eng = SUBJ.find(s => s.id === 'eng');
                  if(!eng) return { ok:false, toolbar:false, toolButtons:0, level:null };
                  openSubj('eng');
                  const toolbar = document.getElementById('eng-extra-tools');
                  return { ok:true, toolbar: !!toolbar, toolButtons: toolbar ? toolbar.querySelectorAll('button').length : 0, level: window.getEnglishLevelSummary ? window.getEnglishLevelSummary().level : null, topics: eng.tops.length };
                })()
                """
            )
            toolbar_ok = payload.get('ok') and payload.get('toolbar') and int(payload.get('toolButtons') or 0) >= 5 and bool(payload.get('level'))
            results.append(ScenarioResult(f'{file_name}: english infra', toolbar_ok, f"topics={payload.get('topics')}; buttons={payload.get('toolButtons')}; level={payload.get('level')}"))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: english infra', False, str(exc)))

    if grade == 10:
        try:
            topics = await page.evaluate("SUBJ.find(s=>s.id==='eng').tops.map(t=>t.id)")
            ok = 'phrasal' in topics and 'essay' in topics
            results.append(ScenarioResult(f'{file_name}: english extensions', ok, ','.join(topics)))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: english extensions', False, str(exc)))

    if grade in (8, 9, 11):
        try:
            target = {8: 'chem', 9: 'chem', 11: 'prob'}[grade]
            payload = await page.evaluate(
                """
                (target) => {
                  const ids = SUBJ.map(s => s.id);
                  const needMap = {
                    8: ['chem','bio','geog','lit'],
                    9: ['chem','bio','geog','lit'],
                    11: ['prob','chem','bio','geog','lit']
                  };
                  const currentGrade = Number(window.GRADE_NUM || 0);
                  const missing = (needMap[currentGrade] || []).filter(id => !ids.includes(id));
                  const subj = SUBJ.find(s => s.id === target) || SUBJ.find(s => s.id === 'chem') || SUBJ[0];
                  openSubj(subj.id);
                  cT = subj.tops[0];
                  curTheory = cT.th;
                  mix = false; globalMix = false; rushMode = false; diagMode = false;
                  startQuiz();
                  return { ids, missing, target: subj.id, topics: subj.tops.length };
                }
                """,
                target,
            )
            qtext = await page.locator('#qb').inner_text()
            ok = not payload.get('missing') and int(payload.get('topics') or 0) >= 2 and bool(qtext.strip())
            details = f"target={payload.get('target')}; topics={payload.get('topics')}; missing={payload.get('missing')}; q={qtext[:40]}"
            results.append(ScenarioResult(f'{file_name}: wave19 subject mesh', ok, details))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: wave19 subject mesh', False, str(exc)))

    if grade == 1:
        try:
            payload = await page.evaluate(
                """
                (async () => {
                  if(typeof registerPlayer === 'function') registerPlayer('Тест', null);
                  if(typeof saveRushBest === 'function') saveRushBest(3, 77);
                  if(typeof showRushRecords === 'function') await showRushRecords();
                  const text = document.body.innerText || '';
                  return {
                    hasLocalOnly: text.includes('общий рейтинг пока не подключён') || text.includes('Локальный рейтинг уже работает'),
                    hasDeviceLabel: text.includes('Это устройство')
                  };
                })()
                """
            )
            ok = bool(payload.get('hasLocalOnly')) and bool(payload.get('hasDeviceLabel'))
            results.append(ScenarioResult(f'{file_name}: rush local fallback', ok, json.dumps(payload, ensure_ascii=False)))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: rush local fallback', False, str(exc)))

    if grade == 10:
        try:
            payload = await page.evaluate(
                """
                (async () => {
                  if(typeof registerPlayer === 'function') registerPlayer('Тест', null);
                  if(typeof setRushPublishMode === 'function') setRushPublishMode(true);
                  if(typeof saveRushBest === 'function') saveRushBest(3, 88);
                  if(typeof showRushRecords === 'function') await showRushRecords();
                  const text = document.body.innerText || '';
                  const mounted = typeof getRushPublishMode === 'function';
                  return {
                    mounted,
                    enabled: mounted ? getRushPublishMode() : false,
                    hasGlobalBlock: text.includes('Публиковать в общий рейтинг') || text.includes('Не публиковать в общий рейтинг') || text.includes('Общий рейтинг · 3 мин') || text.includes('Общий рейтинг · 5 мин')
                  };
                })()
                """
            )
            ok = bool(payload.get('mounted')) and bool(payload.get('enabled')) and bool(payload.get('hasGlobalBlock'))
            results.append(ScenarioResult(f'{file_name}: rush cloud split', ok, json.dumps(payload, ensure_ascii=False)))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: rush cloud split', False, str(exc)))

    if grade == 11:
        try:
            payload = await page.evaluate(
                """
                (() => {
                  const eng = SUBJ.find(s => s.id === 'eng');
                  if(!eng) return { ok:false, topics:[], q:'' };
                  openSubj('eng');
                  cT = eng.tops[0];
                  curTheory = cT.th;
                  mix = false; globalMix = false; rushMode = false; diagMode = false;
                  startQuiz();
                  return { ok:true, topics: eng.tops.map(t => t.id) };
                })()
                """
            )
            topics = payload.get('topics') or []
            qtext = await page.locator('#qb').inner_text()
            ok = payload.get('ok') and len(topics) >= 12 and bool(qtext.strip())
            details = f"topics={len(topics)}; first={topics[0] if topics else '-'}; q={qtext[:40]}"
            results.append(ScenarioResult(f'{file_name}: english vertical', ok, details))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: english vertical', False, str(exc)))
        try:
            payload = await page.evaluate(
                """
                (() => {
                  showHallOfFame();
                  const text = document.body.innerText || '';
                  const has = text.includes('English level');
                  const chip = text.includes('🇬🇧');
                  return { has, chip };
                })()
                """
            )
            results.append(ScenarioResult(f'{file_name}: english profile modal', bool(payload.get('has')) and bool(payload.get('chip')), json.dumps(payload, ensure_ascii=False)))
        except Exception as exc:
            results.append(ScenarioResult(f'{file_name}: english profile modal', False, str(exc)))

    return results




async def run_dashboard_flow(page) -> list[ScenarioResult]:
    results: list[ScenarioResult] = []
    try:
        await load_page(page, 'dashboard.html')
        await page.evaluate("(() => { try{ Object.defineProperty(window,'localStorage',{value:window.__LS, configurable:true}); }catch(e){} })()")
        await page.evaluate(
            """
            (() => {
              function makeActivity(days, base, spread){
                const rows = [];
                for(let i=days-1;i>=0;i--){
                  const d = new Date();
                  d.setDate(d.getDate() - i);
                  const total = Math.max(0, base + ((i * 3) % spread) - Math.floor(spread / 3));
                  const ok = Math.max(0, total - (i % 4));
                  rows.push({ date: d.toISOString().slice(0,10), total, ok, err: Math.max(0, total - ok), pure: ok >= total ? ok : 0 });
                }
                return rows;
              }
              __LS.setItem('trainer_player_name', 'Ученик');
              __LS.setItem('trainer_streak_3', JSON.stringify({ totalQs: 120, totalOk: 96, best: 7, totalDone: 8 }));
              __LS.setItem('trainer_progress_3', JSON.stringify({ math:{mult:{ok:12,err:2},tasks:{ok:6,err:3}}, rus:{pair:{ok:8,err:4}}, eng:{letters:{ok:5,err:1}}, world:{weather:{ok:4,err:2}} }));
              __LS.setItem('trainer_journal_3', JSON.stringify([{tag:'Таблица умножения'},{tag:'Парные согласные'}]));
              __LS.setItem('trainer_activity_3', JSON.stringify(makeActivity(120, 8, 10)));
              __LS.setItem('trainer_daily_3', JSON.stringify({ date: new Date().toISOString().slice(0,10), ok: 9, err: 1, pure: 4, subjs:{math:{ok:5,err:1},rus:{ok:2,err:0},eng:{ok:2,err:0}} }));

              __LS.setItem('trainer_streak_10', JSON.stringify({ totalQs: 340, totalOk: 272, best: 11, totalDone: 16 }));
              __LS.setItem('trainer_progress_10', JSON.stringify({ alg:{trig:{ok:16,err:4},pow:{ok:11,err:3}}, rus:{orth:{ok:15,err:6},punct:{ok:12,err:2}}, eng:{tenses:{ok:18,err:5},grammar:{ok:10,err:4},phrasal:{ok:7,err:3}}, phy:{kin:{ok:14,err:4}}, chem:{atom:{ok:9,err:5}} }));
              __LS.setItem('trainer_journal_10', JSON.stringify([{tag:'Пунктуация'},{tag:'Тригонометрия'},{tag:'Английский: времена'}]));
              __LS.setItem('trainer_activity_10', JSON.stringify(makeActivity(120, 14, 16)));
              __LS.setItem('trainer_daily_10', JSON.stringify({ date: new Date().toISOString().slice(0,10), ok: 11, err: 3, pure: 2, subjs:{alg:{ok:5,err:1},rus:{ok:3,err:1},eng:{ok:3,err:1}} }));

              ['grades','weak','activity','wave22-insights','wave22-heatmap','wave22-radar','wave22-trend','wave22-subjects'].forEach(id => {
                const el = document.getElementById(id); if(el) el.innerHTML = '';
              });
              init();
            })()
            """
        )
        await page.wait_for_timeout(120)
        payload = await page.evaluate(
            """
            (() => ({
              heat: document.querySelectorAll('.heat-cell').length,
              subjectCards: document.querySelectorAll('.subject-card').length,
              chartSvgs: document.querySelectorAll('.chart-svg').length,
              insights: (document.getElementById('wave22-insights') || {}).innerText || '',
              csvFn: typeof downloadDashboardCSV === 'function',
              pngFn: typeof downloadDashboardPNG === 'function'
            }))
            """
        )
        ok = int(payload.get('heat') or 0) >= 150 and int(payload.get('subjectCards') or 0) >= 4 and int(payload.get('chartSvgs') or 0) >= 2 and payload.get('csvFn') and payload.get('pngFn')
        details = json.dumps(payload, ensure_ascii=False)
        results.append(ScenarioResult('dashboard.html: analytics 2.0', ok, details))
    except Exception as exc:
        results.append(ScenarioResult('dashboard.html: analytics 2.0', False, str(exc)))

    return results

async def run_diagnostic_flow(page) -> list[ScenarioResult]:
    results: list[ScenarioResult] = []
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
        results.append(ScenarioResult('diagnostic.html: adaptive flow', ok, json.dumps(state, ensure_ascii=False)))
    except Exception as exc:
        results.append(ScenarioResult('diagnostic.html: adaptive flow', False, str(exc)))

    try:
        await load_page(page, 'diagnostic.html')
        payload = await page.evaluate(
            """
            (() => {
              startDiag('english');
              const total = questions.length;
              for(let i=0;i<questions.length;i++){
                const q = questions[qIndex];
                const btn = document.createElement('button');
                selectOpt(btn, q.a, q.a, q.hint);
                if(i < questions.length - 1) nextQ();
              }
              showResult();
              return {
                count: (window.__engDiagMeta && window.__engDiagMeta.count) || 0,
                minGrade: window.__engDiagMeta && window.__engDiagMeta.minGrade,
                maxGrade: window.__engDiagMeta && window.__engDiagMeta.maxGrade,
                levelBlock: !!document.getElementById('eng-level-block'),
                total
              };
            })()
            """
        )
        await page.wait_for_timeout(60)
        lang = await page.evaluate("(document.getElementById('q-txt') && document.getElementById('q-txt').getAttribute('lang')) || (document.getElementById('opts') && document.getElementById('opts').getAttribute('lang'))")
        ok = int(payload.get('count') or 0) >= 30 and bool(payload.get('levelBlock')) and int(payload.get('total') or 0) >= 20
        results.append(ScenarioResult('diagnostic.html: english diagnostics', ok, json.dumps(payload, ensure_ascii=False)))
        results.append(ScenarioResult('diagnostic.html: english lang', lang == 'en', f'lang={lang}'))
    except Exception as exc:
        results.append(ScenarioResult('diagnostic.html: english diagnostics', False, str(exc)))

    return results


async def main() -> int:
    results: list[ScenarioResult] = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path='/usr/bin/chromium')
        context = await browser.new_context(ignore_https_errors=True)
        for grade in (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11):
            page = await context.new_page()
            results.extend(await run_grade_flow(page, grade))
            await page.close()
        page = await context.new_page()
        results.extend(await run_dashboard_flow(page))
        await page.close()
        page = await context.new_page()
        results.extend(await run_diagnostic_flow(page))
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
