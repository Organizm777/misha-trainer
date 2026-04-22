/* --- wave86n_progress_tools.js --- */
(function(){
  if (typeof window === 'undefined' || window.wave86nProgressTools) return;

  var VERSION = 'wave86n';
  var STYLE_ID = 'wave86n-progress-tools-style';
  var OBSERVER_FLAG = '__wave86nProgressToolsObserver';

  function grade(){ return String(window.GRADE_NUM || '10'); }
  function subjects(){ return Array.isArray(window.SUBJ) ? window.SUBJ : []; }
  function esc(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function toNum(value){ return Number(value || 0) || 0; }
  function pct(ok, total){ return total > 0 ? Math.round((ok / total) * 100) : 0; }
  function localDateISO(date){
    var d = date instanceof Date ? date : new Date(date);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function addDays(date, delta){
    var d = date instanceof Date ? new Date(date.getTime()) : new Date(date);
    d.setDate(d.getDate() + delta);
    return d;
  }
  function fmtRuDate(iso){
    try { return new Date(iso + 'T12:00:00').toLocaleDateString('ru-RU', { day:'numeric', month:'short' }).replace('.', ''); }
    catch (_) { return iso; }
  }
  function readJSON(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (_) {
      return fallback;
    }
  }
  function progress(){
    var data = readJSON('trainer_progress_' + grade(), {});
    return data && typeof data === 'object' ? data : {};
  }
  function streakState(){
    var data = readJSON('trainer_streak_' + grade(), {});
    return data && typeof data === 'object' ? data : {};
  }
  function dailyState(){
    var data = readJSON('trainer_daily_' + grade(), null);
    return data && typeof data === 'object' ? data : null;
  }
  function activityRows(){
    var list = readJSON('trainer_activity_' + grade(), []);
    if (!Array.isArray(list)) list = [];
    var byDate = {};
    list.forEach(function(row){
      if (row && row.date) byDate[String(row.date)] = Object.assign({}, row);
    });
    var today = dailyState();
    if (today && today.date) {
      byDate[String(today.date)] = Object.assign({}, byDate[String(today.date)] || {}, {
        date: String(today.date),
        ok: toNum(today.ok),
        err: toNum(today.err),
        pure: toNum(today.pure),
        mixErr: toNum(today.mixErr),
        total: toNum(today.ok) + toNum(today.err)
      });
    }
    return Object.keys(byDate).sort().map(function(date){ return byDate[date]; });
  }
  function isDayDone(row){
    if (!row) return false;
    var total = toNum(row.total != null ? row.total : toNum(row.ok) + toNum(row.err));
    var ok = toNum(row.ok);
    var pure = toNum(row.pure);
    var mixErr = toNum(row.mixErr);
    return (pure >= 20 && mixErr === 0) || (total >= 100 && ok / Math.max(1, total) >= 0.75);
  }
  function dayLevel(row){
    if (!row) return 0;
    var total = toNum(row.total != null ? row.total : toNum(row.ok) + toNum(row.err));
    if (isDayDone(row)) return 3;
    if (total >= 20 || toNum(row.pure) >= 10) return 2;
    if (total > 0 || toNum(row.pure) > 0) return 1;
    return 0;
  }
  function topicStats(subjId, topicId){
    var prog = progress();
    var row = prog[subjId] && prog[subjId][topicId] ? prog[subjId][topicId] : {};
    var ok = toNum(row.ok);
    var err = toNum(row.err);
    return { ok: ok, err: err, total: ok + err, pct: pct(ok, ok + err), last: row.last || '' };
  }
  function starsForStats(stats){
    var total = toNum(stats && stats.total);
    var value = toNum(stats && stats.pct);
    if (total >= 10 && value >= 85) return 3;
    if (total >= 6 && value >= 70) return 2;
    if (total >= 3 && value >= 50) return 1;
    return 0;
  }
  function starText(count){
    count = Math.max(0, Math.min(3, toNum(count)));
    return '★'.repeat(count) + '☆'.repeat(3 - count);
  }
  function subjectStats(subj){
    var ok = 0;
    var err = 0;
    var stars = 0;
    var mastered = 0;
    var topics = Array.isArray(subj && subj.tops) ? subj.tops : [];
    topics.forEach(function(topic){
      var s = topicStats(subj.id, topic.id);
      ok += s.ok;
      err += s.err;
      var st = starsForStats(s);
      stars += st;
      if (st === 3) mastered += 1;
    });
    var total = ok + err;
    return {
      ok: ok,
      err: err,
      total: total,
      pct: pct(ok, total),
      topics: topics.length,
      stars: stars,
      maxStars: topics.length * 3,
      mastered: mastered
    };
  }
  function findSubjectByName(text){
    text = String(text || '').toLowerCase().replace(/ё/g, 'е').trim();
    if (!text) return null;
    var list = subjects();
    for (var i = 0; i < list.length; i++) {
      var name = String(list[i].nm || '').toLowerCase().replace(/ё/g, 'е').trim();
      if (text.indexOf(name) === 0 || name.indexOf(text) === 0) return list[i];
    }
    return null;
  }
  function currentSubject(){
    var hdr = document.getElementById('hdr');
    var text = hdr ? hdr.textContent : '';
    return findSubjectByName(String(text || '').toLowerCase());
  }
  function findTopicByName(subj, text){
    if (!subj || !Array.isArray(subj.tops)) return null;
    var needle = String(text || '').toLowerCase().replace(/ё/g, 'е').trim();
    if (!needle) return null;
    for (var i = 0; i < subj.tops.length; i++) {
      var topic = subj.tops[i];
      var name = String(topic.nm || '').toLowerCase().replace(/ё/g, 'е').trim();
      if (name === needle || needle.indexOf(name) === 0 || name.indexOf(needle) === 0) return topic;
    }
    return null;
  }
  function ensureStyles(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave86n-subject-progress{margin-top:7px;height:6px;border-radius:999px;background:rgba(107,107,126,.16);overflow:hidden}',
      '.wave86n-subject-progress span{display:block;height:100%;border-radius:999px;background:currentColor;transition:width .18s ease}',
      '.wave86n-subject-meta{margin-top:4px;font-size:10px;line-height:1.35;color:var(--muted);font-weight:700}',
      '.wave86n-topic-stars{margin-left:auto;margin-right:8px;font:900 11px/1 JetBrains Mono,monospace;color:#f59e0b;letter-spacing:-1px;white-space:nowrap}',
      '.wave86n-tool-btn{border:none;border-radius:10px;padding:8px 10px;font:800 11px/1.1 Golos Text,system-ui,sans-serif;cursor:pointer;background:rgba(37,99,235,.1);color:#2563eb}',
      '.wave86n-tool-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}',
      '.wave86n-export-row{display:flex;gap:8px;margin:10px 0 14px;flex-wrap:wrap}',
      '.wave86n-export-row button{flex:1;min-width:132px;border:1px solid var(--border);border-radius:12px;padding:10px 12px;background:var(--card);color:var(--text);font:800 12px/1 Golos Text,system-ui,sans-serif;cursor:pointer}',
      '.wave86n-modal{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.52);display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto}',
      '.wave86n-card{width:min(440px,100%);max-height:88vh;overflow:auto;background:var(--card,#fff);color:var(--text,#1a1a2e);border:1px solid var(--border,#e2e0d8);border-radius:18px;padding:20px;box-shadow:0 18px 50px rgba(0,0,0,.24)}',
      '.wave86n-card h3{margin:0 0 10px;font-family:Unbounded,system-ui,sans-serif;font-size:16px;font-weight:900;text-align:center}',
      '.wave86n-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:12px}',
      '.wave86n-day{aspect-ratio:1;border-radius:10px;display:flex;align-items:center;justify-content:center;font:800 11px/1 JetBrains Mono,monospace;border:1px solid rgba(107,107,126,.16);background:rgba(107,107,126,.08);color:var(--muted)}',
      '.wave86n-day[data-level="1"]{background:#dbeafe;color:#1d4ed8}',
      '.wave86n-day[data-level="2"]{background:#fef3c7;color:#92400e}',
      '.wave86n-day[data-level="3"]{background:#dcfce7;color:#15803d}',
      '.wave86n-card .close{width:100%;margin-top:14px;border:none;border-radius:12px;padding:12px;background:var(--text,#1a1a2e);color:var(--bg,#fff);font:800 13px/1 Golos Text,system-ui,sans-serif;cursor:pointer}',
      '.wave86n-summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}',
      '.wave86n-summary-grid div{border:1px solid var(--border,#e2e0d8);border-radius:12px;padding:9px;text-align:center}',
      '.wave86n-summary-grid b{display:block;font-size:18px;margin-bottom:2px}',
      '.wave86n-summary-grid span{font-size:10px;color:var(--muted)}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }
  function decorateSubjectCards(){
    var cards = document.querySelectorAll('#sg .scard');
    cards.forEach(function(card){
      var nameNode = card.querySelector('.nm');
      if (!nameNode) return;
      var raw = nameNode.childNodes && nameNode.childNodes.length ? nameNode.childNodes[0].textContent : nameNode.textContent;
      var subj = findSubjectByName(raw);
      if (!subj) return;
      var box = card.children && card.children[1] ? card.children[1] : nameNode.parentElement;
      if (!box || box.querySelector('.wave86n-subject-progress')) return;
      var stats = subjectStats(subj);
      var color = stats.total ? (stats.pct >= 80 ? 'var(--green)' : stats.pct >= 50 ? 'var(--orange)' : 'var(--red)') : 'var(--muted)';
      var progress = document.createElement('div');
      progress.className = 'wave86n-subject-progress';
      progress.style.color = color;
      progress.setAttribute('aria-label', 'Прогресс предмета ' + stats.pct + '%');
      progress.innerHTML = '<span style="width:' + (stats.total ? stats.pct : 0) + '%"></span>';
      var meta = document.createElement('div');
      meta.className = 'wave86n-subject-meta';
      meta.textContent = stats.total ? ('⭐ ' + stats.stars + '/' + stats.maxStars + ' · освоено тем: ' + stats.mastered + '/' + stats.topics) : ('⭐ 0/' + stats.maxStars + ' · начни первую тему');
      box.appendChild(progress);
      box.appendChild(meta);
    });
  }
  function decorateTopicButtons(){
    var subj = currentSubject();
    if (!subj) return;
    var buttons = document.querySelectorAll('#tl .tbtn');
    buttons.forEach(function(btn){
      if (btn.querySelector('.wave86n-topic-stars')) return;
      var labelNode = btn.querySelector('span[style*="flex:1"]') || btn.children[1];
      if (!labelNode) return;
      var label = String(labelNode.textContent || '').trim();
      if (!label || /вперемешку|диагностика/i.test(label)) return;
      var topic = findTopicByName(subj, label);
      if (!topic) return;
      var stats = topicStats(subj.id, topic.id);
      var stars = starsForStats(stats);
      var node = document.createElement('span');
      node.className = 'wave86n-topic-stars';
      node.textContent = starText(stars);
      node.title = stats.total ? ('Звёзды темы: ' + stars + '/3 · ' + stats.pct + '% · ' + stats.total + ' ответов') : 'Звёзды темы: 0/3 · ещё нет ответов';
      node.setAttribute('aria-label', node.title);
      var pctNode = btn.querySelector('.tpct');
      btn.insertBefore(node, pctNode || null);
    });
  }
  function ensureDailyTools(){
    var host = document.querySelector('#daily-meter .dm');
    if (!host || host.querySelector('.wave86n-tool-row')) return;
    var row = document.createElement('div');
    row.className = 'wave86n-tool-row';
    row.innerHTML = '<button type="button" class="wave86n-tool-btn" onclick="wave86nProgressTools.showStreakCalendar()">📆 Календарь серии</button><button type="button" class="wave86n-tool-btn" onclick="wave86nProgressTools.exportParentProgress(\'csv\')">⬇️ CSV</button><button type="button" class="wave86n-tool-btn" onclick="wave86nProgressTools.exportParentProgress(\'json\')">⬇️ JSON</button>';
    host.appendChild(row);
  }
  function ensureProgressExportRow(){
    var content = document.getElementById('prog-content');
    if (!content || document.getElementById('wave86n-export-row')) return;
    var row = document.createElement('div');
    row.id = 'wave86n-export-row';
    row.className = 'wave86n-export-row';
    row.innerHTML = '<button type="button" onclick="wave86nProgressTools.exportParentProgress(\'csv\')">⬇️ CSV для родителя</button><button type="button" onclick="wave86nProgressTools.exportParentProgress(\'json\')">⬇️ JSON прогресса</button><button type="button" onclick="wave86nProgressTools.showStreakCalendar()">📆 Календарь серии</button>';
    content.parentNode.insertBefore(row, content.nextSibling);
  }
  function buildSnapshot(){
    var streak = streakState();
    var rows = [];
    var totals = { ok:0, err:0, topics:0, mastered:0, stars:0, maxStars:0 };
    subjects().forEach(function(subj){
      (subj.tops || []).forEach(function(topic){
        var stats = topicStats(subj.id, topic.id);
        var stars = starsForStats(stats);
        rows.push({
          grade: grade(),
          subjectId: subj.id,
          subject: subj.nm,
          topicId: topic.id,
          topic: topic.nm,
          ok: stats.ok,
          err: stats.err,
          total: stats.total,
          accuracyPct: stats.pct,
          stars: stars,
          last: stats.last || ''
        });
        totals.ok += stats.ok;
        totals.err += stats.err;
        totals.topics += 1;
        totals.stars += stars;
        totals.maxStars += 3;
        if (stars === 3) totals.mastered += 1;
      });
    });
    var activity = activityRows();
    var activeDays = activity.filter(function(row){ return toNum(row.total) > 0 || toNum(row.pure) > 0; }).length;
    var doneDays = activity.filter(isDayDone).length;
    return {
      app: 'trainer3',
      wave: VERSION,
      generatedAt: new Date().toISOString(),
      grade: grade(),
      summary: {
        ok: totals.ok,
        err: totals.err,
        total: totals.ok + totals.err,
        accuracyPct: pct(totals.ok, totals.ok + totals.err),
        topics: totals.topics,
        masteredTopics: totals.mastered,
        stars: totals.stars,
        maxStars: totals.maxStars,
        activeDays: activeDays,
        doneDays: doneDays,
        currentStreak: toNum(streak.current),
        bestStreak: toNum(streak.best)
      },
      topics: rows,
      activity: activity
    };
  }
  function csvEscape(value){
    var s = String(value == null ? '' : value);
    return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function snapshotToCSV(snapshot){
    var header = ['grade','subject','topic','ok','err','total','accuracyPct','stars','last'];
    var lines = [header.join(';')];
    snapshot.topics.forEach(function(row){
      lines.push(header.map(function(key){ return csvEscape(row[key]); }).join(';'));
    });
    lines.push('');
    lines.push(['summary','total',snapshot.summary.total,'accuracyPct',snapshot.summary.accuracyPct,'stars',snapshot.summary.stars + '/' + snapshot.summary.maxStars].map(csvEscape).join(';'));
    lines.push(['summary','activeDays',snapshot.summary.activeDays,'doneDays',snapshot.summary.doneDays,'currentStreak',snapshot.summary.currentStreak,'bestStreak',snapshot.summary.bestStreak].map(csvEscape).join(';'));
    return lines.join('\n');
  }
  function downloadFile(filename, mime, content){
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(function(){ URL.revokeObjectURL(url); link.remove(); }, 0);
  }
  function exportParentProgress(format){
    var snapshot = buildSnapshot();
    var stamp = localDateISO(new Date());
    if (format === 'json') {
      downloadFile('trainer_grade' + grade() + '_progress_' + stamp + '.json', 'application/json;charset=utf-8', JSON.stringify(snapshot, null, 2));
    } else {
      downloadFile('trainer_grade' + grade() + '_progress_' + stamp + '.csv', 'text/csv;charset=utf-8', '\ufeff' + snapshotToCSV(snapshot));
    }
  }
  function calendarRows(){
    var rows = activityRows();
    var byDate = {};
    rows.forEach(function(row){ if (row && row.date) byDate[String(row.date)] = row; });
    var today = new Date();
    var out = [];
    for (var i = 41; i >= 0; i--) {
      var date = addDays(today, -i);
      var iso = localDateISO(date);
      var row = byDate[iso] || { date: iso, ok:0, err:0, total:0, pure:0 };
      out.push(row);
    }
    return out;
  }
  function showStreakCalendar(){
    ensureStyles();
    var rows = calendarRows();
    var streak = streakState();
    var active = rows.filter(function(row){ return toNum(row.total) > 0 || toNum(row.pure) > 0; }).length;
    var done = rows.filter(isDayDone).length;
    var html = '<div class="wave86n-card" onclick="event.stopPropagation()">' +
      '<h3>📆 Календарь серии</h3>' +
      '<div style="font-size:12px;color:var(--muted);line-height:1.5;text-align:center">Последние 42 дня. Зелёный день — дневная норма или рывок 20/20.</div>' +
      '<div class="wave86n-summary-grid"><div><b>' + esc(toNum(streak.current)) + '</b><span>текущая серия</span></div><div><b>' + esc(toNum(streak.best)) + '</b><span>рекорд</span></div><div><b>' + esc(done) + '/' + esc(active || 0) + '</b><span>дней закрыто</span></div></div>' +
      '<div class="wave86n-cal">' + rows.map(function(row){
        var level = dayLevel(row);
        var total = toNum(row.total != null ? row.total : toNum(row.ok) + toNum(row.err));
        var label = fmtRuDate(row.date) + ': ' + (total ? (toNum(row.ok) + '/' + total + ' верно') : 'нет занятий') + (isDayDone(row) ? ' · норма выполнена' : '');
        return '<div class="wave86n-day" data-level="' + level + '" title="' + esc(label) + '">' + esc(String(Number(row.date.slice(-2)))) + '</div>';
      }).join('') + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:12px;font-size:11px;color:var(--muted);justify-content:center;flex-wrap:wrap"><span>□ нет</span><span>🟦 старт</span><span>🟨 активно</span><span>🟩 закрыто</span></div>' +
      '<button type="button" class="close" onclick="this.closest(\'.wave86n-modal\').remove()">Закрыть</button>' +
      '</div>';
    var modal = document.createElement('div');
    modal.className = 'wave86n-modal';
    modal.innerHTML = html;
    modal.onclick = function(){ modal.remove(); };
    document.body.appendChild(modal);
  }
  function enhance(){
    ensureStyles();
    decorateSubjectCards();
    decorateTopicButtons();
    ensureDailyTools();
    ensureProgressExportRow();
  }
  var scheduled = false;
  function scheduleEnhance(){
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function(){ scheduled = false; enhance(); });
  }
  function initObserver(){
    if (window[OBSERVER_FLAG] || !document.body || typeof MutationObserver === 'undefined') return;
    window[OBSERVER_FLAG] = true;
    var observer = new MutationObserver(scheduleEnhance);
    observer.observe(document.body, { childList:true, subtree:true });
  }

  window.wave86nProgressTools = {
    version: VERSION,
    buildSnapshot: buildSnapshot,
    exportParentProgress: exportParentProgress,
    showStreakCalendar: showStreakCalendar,
    enhance: enhance
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ enhance(); initObserver(); });
  } else {
    enhance();
    initObserver();
  }
})();
