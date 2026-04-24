/* wave87n grade runtime services bundle: report/profile/cloud sync. */

;/* ---- bundle_sharing.js ---- */
/* --- wave29_sharing.js --- */
(function(){
  if(window.wave29Debug) return;

  var VERSION = 'wave29';
  var REPORT_HASH_KEY = 'pr';
  var QR_CHUNK = 300;
  var QR_PROVIDER = 'https://api.qrserver.com/v1/create-qr-code/';
  var SHARED_FLAG = '__wave29SharedReport';
  var STYLE_ID = 'wave29-style';

  function toNum(v){ return Number(v || 0) || 0; }
  function pct(ok, total){ return total > 0 ? Math.round(ok / total * 100) : 0; }
  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function hasFn(fn){ return typeof fn === 'function'; }
  function safeJSON(key, fallback){ try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch(e){ return fallback; } }
  function gradeKey(){ try { return hasFn(window.currentGradeKey) ? currentGradeKey() : String(window.GRADE_NUM || '10'); } catch(e){ return String(window.GRADE_NUM || '10'); } }
  function gradeTitle(){ return window.GRADE_TITLE || (gradeKey() + ' класс'); }
  function nowTs(){ return Date.now(); }
  function formatDate(ts, opts){ try { return new Date(ts || nowTs()).toLocaleDateString('ru-RU', opts || { day:'numeric', month:'long', year:'numeric' }); } catch(e){ return ''; } }
  function formatShortDate(ts){ try { return new Date(ts || nowTs()).toLocaleDateString('ru-RU', { day:'numeric', month:'short' }).replace('.', ''); } catch(e){ return ''; } }
  function formatMonthLabel(isoMonth){
    try {
      var parts = String(isoMonth || '').split('-');
      var d = new Date(Number(parts[0] || 0), Math.max(0, Number(parts[1] || 1) - 1), 1);
      return d.toLocaleDateString('ru-RU', { month:'short' }).replace('.', '');
    } catch(e){ return String(isoMonth || ''); }
  }
  function decl(n, one, few, many){ return hasFn(window.declNum) ? declNum(n, one, few, many) : (Math.abs(n)%10 === 1 && Math.abs(n)%100 !== 11 ? one : ([2,3,4].indexOf(Math.abs(n)%10) !== -1 && [12,13,14].indexOf(Math.abs(n)%100) === -1 ? few : many)); }

  function isGradePage(){ return typeof window.GRADE_NUM !== 'undefined' && !!document.getElementById('s-main'); }
  function isDashboardPage(){ return !!document.getElementById('grades') && !!document.getElementById('activity'); }

  function readHashParam(key){
    try {
      var hash = String(location.hash || '').replace(/^#/, '');
      if(!hash) return '';
      var parts = hash.split('&');
      for(var i=0;i<parts.length;i++){
        var pair = parts[i].split('=');
        if(pair[0] === key) return pair.slice(1).join('=');
      }
    } catch(e){}
    return '';
  }

  function stripUrl(){
    try {
      return String(location.href || '').replace(/[?#].*$/, '');
    } catch(e){
      return '';
    }
  }

  function base64UrlEncode(value){
    var text = typeof value === 'string' ? value : JSON.stringify(value);
    try {
      return btoa(unescape(encodeURIComponent(text))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    } catch(e){
      return text;
    }
  }

  function base64UrlDecode(text){
    var raw = String(text || '').replace(/-/g,'+').replace(/_/g,'/');
    while(raw.length % 4) raw += '=';
    try {
      return decodeURIComponent(escape(atob(raw)));
    } catch(e){
      return raw;
    }
  }

  function hashText(text){
    var str = String(text || '');
    var h = 2166136261;
    for(var i=0;i<str.length;i++){
      h ^= str.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return (h >>> 0).toString(36);
  }

  function getLastDates(count){
    var out = [];
    var now = new Date();
    for(var i=count-1;i>=0;i--){
      var d = new Date(now);
      d.setHours(0,0,0,0);
      d.setDate(now.getDate() - i);
      out.push(d.toISOString().slice(0,10));
    }
    return out;
  }

  function collectActivityMap(){
    var map = {};
    var activity = Array.isArray(window.ACTIVITY) ? window.ACTIVITY : safeJSON('trainer_activity_' + gradeKey(), []);
    activity.forEach(function(row){
      if(!row || !row.date) return;
      map[row.date] = {
        total: toNum(row.total || (toNum(row.ok) + toNum(row.err))),
        ok: toNum(row.ok),
        err: toNum(row.err),
        pure: toNum(row.pure)
      };
    });
    var daily = (window.DAILY && window.DAILY.date) ? window.DAILY : safeJSON('trainer_daily_' + gradeKey(), null);
    if(daily && daily.date){
      map[daily.date] = {
        total: toNum(daily.ok) + toNum(daily.err),
        ok: toNum(daily.ok),
        err: toNum(daily.err),
        pure: toNum(daily.pure)
      };
    }
    return map;
  }

  function summarizeRecent(activityMap, days){
    var dates = getLastDates(days);
    var total = 0, ok = 0, err = 0, active = 0, pure = 0;
    dates.forEach(function(date){
      var row = activityMap[date] || { total:0, ok:0, err:0, pure:0 };
      total += toNum(row.total);
      ok += toNum(row.ok);
      err += toNum(row.err);
      pure += toNum(row.pure);
      if(toNum(row.total) > 0) active += 1;
    });
    return { total: total, ok: ok, err: err, active: active, pure: pure, pct: pct(ok, total) };
  }

  function weekBuckets(activityMap, weeks){
    var dates = getLastDates(weeks * 7);
    var buckets = [];
    for(var i=0;i<weeks;i++){
      var slice = dates.slice(i*7, i*7 + 7);
      var total = 0, ok = 0, err = 0, active = 0;
      slice.forEach(function(date){
        var row = activityMap[date] || { total:0, ok:0, err:0 };
        total += toNum(row.total);
        ok += toNum(row.ok);
        err += toNum(row.err);
        if(toNum(row.total) > 0) active += 1;
      });
      buckets.push({
        label: formatShortDate(slice[0]),
        total: total,
        ok: ok,
        err: err,
        active: active,
        pct: pct(ok, total)
      });
    }
    return buckets;
  }

  function monthBuckets(activityMap, months){
    var now = new Date();
    var list = [];
    for(var i=months-1;i>=0;i--){
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      var key = d.toISOString().slice(0,7);
      list.push({ key: key, label: formatMonthLabel(key), total: 0, ok: 0, err: 0, active: 0, pct: 0 });
    }
    Object.keys(activityMap || {}).forEach(function(date){
      var key = String(date || '').slice(0,7);
      for(var i=0;i<list.length;i++){
        if(list[i].key !== key) continue;
        var row = activityMap[date] || {};
        list[i].total += toNum(row.total);
        list[i].ok += toNum(row.ok);
        list[i].err += toNum(row.err);
        if(toNum(row.total) > 0) list[i].active += 1;
      }
    });
    list.forEach(function(row){ row.pct = pct(row.ok, row.total); });
    return list;
  }

  function collectReviewSummary(){
    var key = 'trainer_review_' + gradeKey();
    var review = safeJSON(key, { items:{} });
    if(!review || typeof review !== 'object' || !review.items) review = { items:{} };
    var items = Object.keys(review.items).map(function(k){ return review.items[k]; }).filter(Boolean);
    var due = 0, sticky = 0, mastered = 0;
    var ts = nowTs();
    items.forEach(function(item){
      if(toNum(item.dueAt) <= ts) due += 1;
      if(item.sticky) sticky += 1;
      if(!item.sticky && toNum(item.step) >= 3) mastered += 1;
    });
    return { total: items.length, due: due, sticky: sticky, mastered: mastered };
  }

  function collectSubjectRows(){
    var rows = [];
    var allWeak = [];
    (window.SUBJ || []).forEach(function(subj){
      if(!subj || subj.locked) return;
      var ok = 0, err = 0, started = 0, strong = 0, weak = 0, topics = [];
      (subj.tops || []).forEach(function(topic){
        var stat = hasFn(window.getTP) ? getTP(subj.id, topic.id) : { ok:0, err:0 };
        var tOk = toNum(stat.ok), tErr = toNum(stat.err), total = tOk + tErr;
        if(total > 0){
          var tPct = pct(tOk, total);
          started += 1;
          if(total >= 3 && tPct >= 80) strong += 1;
          if(total >= 3 && tPct < 60){ weak += 1; allWeak.push({ label: subj.nm + ' → ' + topic.nm, count: tErr || 1, pct: tPct, total: total }); }
          topics.push({ name: topic.nm, pct: tPct, total: total, err: tErr });
        }
        ok += tOk;
        err += tErr;
      });
      var total = ok + err;
      if(!total) return;
      rows.push({
        id: subj.id,
        ic: subj.ic,
        name: subj.nm,
        color: subj.cl || '#2563eb',
        bg: subj.bg || '#dbeafe',
        ok: ok,
        err: err,
        total: total,
        pct: pct(ok, total),
        started: started,
        strong: strong,
        weak: weak,
        topics: topics
      });
    });
    rows.sort(function(a,b){ return b.total - a.total || a.pct - b.pct || a.name.localeCompare(b.name, 'ru'); });
    allWeak.sort(function(a,b){ return b.count - a.count || a.pct - b.pct; });
    return { rows: rows, weakTopics: allWeak };
  }

  function collectJournalWeakTopics(){
    var rows = [];
    try {
      var journal = hasFn(window.loadJournal) ? loadJournal() : safeJSON('trainer_journal_' + gradeKey(), []);
      var grouped = {};
      (Array.isArray(journal) ? journal : []).forEach(function(item){
        var label = item && item.tag ? String(item.tag) : 'Без темы';
        if(!grouped[label]) grouped[label] = { label: label, count: 0 };
        grouped[label].count += 1;
      });
      rows = Object.keys(grouped).map(function(key){ return grouped[key]; }).sort(function(a,b){ return b.count - a.count || a.label.localeCompare(b.label, 'ru'); });
    } catch(e){}
    return rows;
  }

  function buildGradeSnapshot(){
    var subjectPack = collectSubjectRows();
    var subjects = subjectPack.rows;
    var activityMap = collectActivityMap();
    var review = collectReviewSummary();
    var recent7 = summarizeRecent(activityMap, 7);
    var recent30 = summarizeRecent(activityMap, 30);
    var weeks = weekBuckets(activityMap, 4);
    var months = monthBuckets(activityMap, 4);
    var totalQs = toNum(window.STR && STR.totalQs) || subjects.reduce(function(sum, row){ return sum + row.total; }, 0);
    var totalOk = toNum(window.STR && STR.totalOk) || subjects.reduce(function(sum, row){ return sum + row.ok; }, 0);
    var weakJournal = collectJournalWeakTopics();
    var weakFallback = subjectPack.weakTopics.map(function(row){ return { label: row.label, count: row.count, pct: row.pct }; });
    var weak = (weakJournal.length ? weakJournal : weakFallback).slice(0, 6);
    var daily = (window.DAILY && window.DAILY.date) ? window.DAILY : safeJSON('trainer_daily_' + gradeKey(), { date:'', ok:0, err:0, pure:0 });
    var status = hasFn(window.dailyDone) ? dailyDone() : null;
    return {
      version: 1,
      kind: 'grade-parent',
      grade: gradeKey(),
      gradeTitle: gradeTitle(),
      name: hasFn(window.getPlayerName) ? getPlayerName() : 'Ученик',
      generatedAt: nowTs(),
      totalQs: totalQs,
      totalPct: pct(totalOk, totalQs),
      currentStreak: toNum(window.STR && STR.current),
      bestStreak: toNum(window.STR && STR.best),
      doneDays: toNum(window.STR && STR.totalDone),
      today: { total: toNum(daily.ok) + toNum(daily.err), ok: toNum(daily.ok), err: toNum(daily.err), pure: toNum(daily.pure), status: status || '' },
      last7: recent7,
      last30: recent30,
      weeks: weeks,
      months: months,
      review: review,
      subjects: subjects.slice(0, 8),
      weak: weak
    };
  }

  function compactGradeSnapshot(snapshot){
    return {
      v: 1,
      k: 'g',
      g: snapshot.grade,
      gt: snapshot.gradeTitle,
      n: snapshot.name,
      ts: snapshot.generatedAt,
      q: snapshot.totalQs,
      p: snapshot.totalPct,
      cs: snapshot.currentStreak,
      bs: snapshot.bestStreak,
      dd: snapshot.doneDays,
      td: [snapshot.today.total, snapshot.today.ok, snapshot.today.err, snapshot.today.pure, snapshot.today.status || ''],
      d7: [snapshot.last7.total, snapshot.last7.active, snapshot.last7.pct, snapshot.last7.pure || 0],
      d30: [snapshot.last30.total, snapshot.last30.active, snapshot.last30.pct, snapshot.last30.pure || 0],
      w: (snapshot.weeks || []).map(function(row){ return [row.label, row.total, row.pct, row.active || 0]; }),
      m: (snapshot.months || []).map(function(row){ return [row.label, row.total, row.pct, row.active || 0]; }),
      r: [snapshot.review.total, snapshot.review.due, snapshot.review.sticky, snapshot.review.mastered],
      s: (snapshot.subjects || []).slice(0, 6).map(function(row){ return [row.ic, row.name, row.total, row.pct, row.weak, row.strong, row.started, row.color || '#2563eb']; }),
      wk: (snapshot.weak || []).slice(0, 6).map(function(row){ return [row.label, row.count, toNum(row.pct)]; })
    };
  }

  function normalizeGradeSnapshot(payload){
    if(!payload || payload.k !== 'g') throw new Error('Не тот формат отчёта');
    return {
      version: payload.v || 1,
      kind: 'grade-parent',
      grade: String(payload.g || ''),
      gradeTitle: payload.gt || '',
      name: payload.n || 'Ученик',
      generatedAt: toNum(payload.ts) || nowTs(),
      totalQs: toNum(payload.q),
      totalPct: toNum(payload.p),
      currentStreak: toNum(payload.cs),
      bestStreak: toNum(payload.bs),
      doneDays: toNum(payload.dd),
      today: { total: toNum((payload.td || [])[0]), ok: toNum((payload.td || [])[1]), err: toNum((payload.td || [])[2]), pure: toNum((payload.td || [])[3]), status: String((payload.td || [])[4] || '') },
      last7: { total: toNum((payload.d7 || [])[0]), active: toNum((payload.d7 || [])[1]), pct: toNum((payload.d7 || [])[2]), pure: toNum((payload.d7 || [])[3]) },
      last30: { total: toNum((payload.d30 || [])[0]), active: toNum((payload.d30 || [])[1]), pct: toNum((payload.d30 || [])[2]), pure: toNum((payload.d30 || [])[3]) },
      weeks: (payload.w || []).map(function(row){ return { label: row[0], total: toNum(row[1]), pct: toNum(row[2]), active: toNum(row[3]) }; }),
      months: (payload.m || []).map(function(row){ return { label: row[0], total: toNum(row[1]), pct: toNum(row[2]), active: toNum(row[3]) }; }),
      review: { total: toNum((payload.r || [])[0]), due: toNum((payload.r || [])[1]), sticky: toNum((payload.r || [])[2]), mastered: toNum((payload.r || [])[3]) },
      subjects: (payload.s || []).map(function(row){ return { ic: row[0], name: row[1], total: toNum(row[2]), pct: toNum(row[3]), weak: toNum(row[4]), strong: toNum(row[5]), started: toNum(row[6]), color: row[7] || '#2563eb' }; }),
      weak: (payload.wk || []).map(function(row){ return { label: row[0], count: toNum(row[1]), pct: toNum(row[2]) }; })
    };
  }

  function encodeGradeSnapshot(snapshot){ return base64UrlEncode(compactGradeSnapshot(snapshot)); }
  function decodeGradeSnapshot(text){ return normalizeGradeSnapshot(JSON.parse(base64UrlDecode(text))); }
  function buildReportLink(snapshot){ return stripUrl() + '#' + REPORT_HASH_KEY + '=' + encodeGradeSnapshot(snapshot); }
  function parseReportLink(url){
    var text = String(url || '');
    var match = text.match(new RegExp('#' + REPORT_HASH_KEY + '=([^&]+)'));
    return match ? decodeGradeSnapshot(match[1]) : null;
  }

  function buildGradeReportText(snapshot){
    var lines = [
      '📊 Отчёт для родителя — ' + snapshot.name,
      snapshot.gradeTitle + ' · ' + formatDate(snapshot.generatedAt),
      '━━━━━━━━━━━━━━━',
      '🔢 Всего задач: ' + snapshot.totalQs,
      '🎯 Средняя точность: ' + snapshot.totalPct + '%',
      '🔥 Текущая серия: ' + snapshot.currentStreak + ' ' + decl(snapshot.currentStreak, 'день', 'дня', 'дней'),
      '🏆 Лучший рекорд: ' + snapshot.bestStreak,
      '📆 Активных дней: ' + snapshot.doneDays,
      '🗓 За 7 дней: ' + snapshot.last7.total + ' задач · ' + snapshot.last7.active + ' активных дней · ' + snapshot.last7.pct + '%',
      '🗓 За 30 дней: ' + snapshot.last30.total + ' задач · ' + snapshot.last30.active + ' активных дней · ' + snapshot.last30.pct + '%'
    ];
    if(snapshot.review && snapshot.review.total){
      lines.push('🔁 Повторение: ' + snapshot.review.due + ' на сегодня · ' + snapshot.review.sticky + ' сложных · ' + snapshot.review.mastered + ' закреплено');
    }
    if(snapshot.subjects && snapshot.subjects.length){
      lines.push('━━━━━━━━━━━━━━━', 'По предметам:');
      snapshot.subjects.slice(0, 6).forEach(function(row){
        lines.push(row.ic + ' ' + row.name + ': ' + row.pct + '% · ' + row.total + ' задач');
      });
    }
    if(snapshot.weak && snapshot.weak.length){
      lines.push('━━━━━━━━━━━━━━━', 'Зоны роста:');
      snapshot.weak.slice(0, 5).forEach(function(row){
        lines.push('• ' + row.label + ': ' + row.count + ' ' + decl(row.count, 'ошибка', 'ошибки', 'ошибок') + (row.pct ? ' · ' + row.pct + '%' : ''));
      });
    }
    return lines.join('\n');
  }

  function appendTarget(){
    if(document.head && typeof document.head.appendChild === 'function') return document.head;
    if(document.body && typeof document.body.appendChild === 'function') return document.body;
    if(document.documentElement && typeof document.documentElement.appendChild === 'function') return document.documentElement;
    return null;
  }

  function ensureStyles(){
    if(document.getElementById && document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave29-overlay{position:fixed;inset:0;z-index:16000;background:rgba(0,0,0,.58);display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto}',
      '.wave29-overlay[hidden]{display:none!important}',
      '.wave29-card{background:var(--card,#fff);color:var(--text,#1a1a2e);border:1px solid var(--border,#e5e7eb);border-radius:22px;box-shadow:0 24px 44px rgba(0,0,0,.24);width:min(100%,760px);max-height:92vh;overflow:auto}',
      '.wave29-head{padding:20px 20px 14px;border-bottom:1px solid var(--border,#e5e7eb)}',
      '.wave29-kicker{font-size:11px;font-weight:700;color:var(--muted,#6b7280);text-transform:uppercase;letter-spacing:.06em}',
      '.wave29-title{font:800 20px/1.15 "Unbounded",system-ui,sans-serif;margin-top:6px}',
      '.wave29-sub{margin-top:8px;font-size:13px;line-height:1.45;color:var(--muted,#6b7280)}',
      '.wave29-body{padding:16px 20px 20px}',
      '.wave29-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}',
      '.wave29-metric{background:linear-gradient(180deg,var(--bg,#f5f3ee),var(--card,#fff));border:1px solid var(--border,#e5e7eb);border-radius:16px;padding:12px 10px;text-align:center}',
      '.wave29-metric .n{font:900 22px/1 "Unbounded",system-ui,sans-serif}',
      '.wave29-metric .l{margin-top:6px;font-size:10px;color:var(--muted,#6b7280);text-transform:uppercase;letter-spacing:.05em;font-weight:700}',
      '.wave29-section{margin-top:14px;background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:18px;padding:14px}',
      '.wave29-section h4{font:800 13px/1.2 "Unbounded",system-ui,sans-serif;margin-bottom:10px}',
      '.wave29-note{font-size:12px;line-height:1.5;color:var(--muted,#6b7280)}',
      '.wave29-pillrow{display:flex;flex-wrap:wrap;gap:6px}',
      '.wave29-pill{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:999px;background:var(--bg,#f5f3ee);border:1px solid var(--border,#e5e7eb);font-size:11px;color:var(--muted,#6b7280)}',
      '.wave29-bars{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;align-items:end}',
      '.wave29-bar{display:flex;flex-direction:column;gap:6px;align-items:center}',
      '.wave29-barbox{width:100%;height:88px;display:flex;align-items:flex-end}',
      '.wave29-barfill{width:100%;border-radius:10px 10px 6px 6px;background:var(--accent,#2563eb);min-height:8px}',
      '.wave29-barlbl{font-size:10px;color:var(--muted,#6b7280);text-align:center}',
      '.wave29-barval{font-size:10px;font-weight:700;color:var(--muted,#6b7280)}',
      '.wave29-subjects{display:grid;gap:8px}',
      '.wave29-subject{border:1px solid var(--border,#e5e7eb);border-radius:14px;padding:10px 12px;background:var(--bg,#f5f3ee)}',
      '.wave29-subject-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}',
      '.wave29-subject-name{font-size:13px;font-weight:800}',
      '.wave29-subject-meta{margin-top:4px;font-size:11px;color:var(--muted,#6b7280)}',
      '.wave29-subject-pct{font:800 16px/1 "JetBrains Mono",monospace}',
      '.wave29-track{height:8px;background:var(--border,#e5e7eb);border-radius:999px;overflow:hidden;margin-top:8px}',
      '.wave29-fill{height:100%;border-radius:999px}',
      '.wave29-weaklist{display:grid;gap:6px}',
      '.wave29-weak{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:9px 10px;border-radius:12px;background:var(--bg,#f5f3ee);border:1px solid var(--border,#e5e7eb)}',
      '.wave29-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}',
      '.wave29-btn{flex:1 1 calc(33.333% - 6px);min-width:150px;min-height:42px;border:none;border-radius:12px;padding:10px 12px;font:800 12px/1.2 "Golos Text",system-ui,sans-serif;cursor:pointer}',
      '.wave29-btn.dark{background:var(--text,#1a1a2e);color:var(--bg,#fff)}',
      '.wave29-btn.light{background:var(--bg,#f5f3ee);color:var(--text,#1a1a2e);border:1px solid var(--border,#e5e7eb)}',
      '.wave29-btn.accent{background:var(--accent,#2563eb);color:#fff}',
      '.wave29-close{position:absolute;top:12px;right:12px;width:36px;height:36px;border:none;border-radius:999px;background:rgba(255,255,255,.14);color:inherit;font-size:18px;cursor:pointer}',
      '.wave29-card-wrap{position:relative}',
      '.wave29-qr-wrap{display:grid;grid-template-columns:260px 1fr;gap:14px;align-items:start}',
      '.wave29-qr-box{background:#fff;border:1px solid var(--border,#e5e7eb);border-radius:18px;padding:12px;display:flex;align-items:center;justify-content:center;min-height:284px}',
      '.wave29-qr-box img{display:block;width:100%;max-width:240px;height:auto;image-rendering:pixelated}',
      '.wave29-qr-meta{font-size:12px;line-height:1.55;color:var(--muted,#6b7280)}',
      '.wave29-code{width:100%;min-height:112px;padding:10px;border:1px solid var(--border,#e5e7eb);border-radius:12px;background:var(--bg,#f5f3ee);color:var(--text,#1a1a2e);font:600 11px/1.45 "JetBrains Mono",monospace;resize:vertical}',
      '.wave29-scan{display:grid;gap:10px}',
      '.wave29-video{width:100%;aspect-ratio:3/4;background:#000;border-radius:16px;border:1px solid var(--border,#e5e7eb);object-fit:cover}',
      '.wave29-scan-status{font-size:12px;line-height:1.5;color:var(--muted,#6b7280)}',
      '.wave29-banner{margin-top:12px;padding:10px 12px;border-radius:14px;background:var(--abg,#eef2ff);color:var(--accent,#2563eb);font-size:12px;line-height:1.5;font-weight:600}',
      '.wave29-dash-summary{margin-bottom:14px}',
      '.wave29-mini-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
      '.wave29-mini-card{background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:16px;padding:12px}',
      '.wave29-mini-card .k{font-size:10px;color:var(--muted,#6b7280);text-transform:uppercase;font-weight:700;letter-spacing:.05em}',
      '.wave29-mini-card .v{margin-top:6px;font:900 20px/1 "Unbounded",system-ui,sans-serif}',
      '.wave29-mini-card .s{margin-top:6px;font-size:11px;color:var(--muted,#6b7280);line-height:1.45}',
      '.wave29-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
      '.wave29-badge{display:inline-flex;align-items:center;padding:5px 8px;border-radius:999px;background:var(--bg,#f5f3ee);border:1px solid var(--border,#e5e7eb);font-size:10px;color:var(--muted,#6b7280)}',
      '.wave29-empty{padding:18px 10px;text-align:center;color:var(--muted,#6b7280);font-size:12px}',
      '@media (max-width:720px){.wave29-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.wave29-qr-wrap{grid-template-columns:1fr}.wave29-btn{flex:1 1 calc(50% - 4px)}}',
      '@media (max-width:520px){.wave29-bars{grid-template-columns:repeat(2,minmax(0,1fr))}.wave29-mini-grid{grid-template-columns:1fr}.wave29-btn{flex:1 1 100%}}',
      '@media print{body.wave29-print-mode > *:not(.wave29-print-host){display:none!important}body.wave29-print-mode{background:#fff!important;color:#111!important}body.wave29-print-mode .wave29-print-host{position:static!important;inset:auto!important;background:#fff!important;padding:0!important;display:block!important;overflow:visible!important}body.wave29-print-mode .wave29-card{box-shadow:none!important;border:none!important;border-radius:0!important;width:100%!important;max-height:none!important}body.wave29-print-mode .wave29-no-print{display:none!important}}'
    ].join('');
    var target = appendTarget();
    if(target) target.appendChild(style);
  }
  ensureStyles();

  function overlayCard(title, subtitle){
    var overlay = document.createElement('div');
    overlay.className = 'wave29-overlay wave29-print-host';
    overlay.addEventListener('click', function(){ overlay.remove(); });
    var wrap = document.createElement('div');
    wrap.className = 'wave29-card wave29-card-wrap';
    wrap.addEventListener('click', function(ev){ ev.stopPropagation(); });
    if(title || subtitle){
      var head = document.createElement('div');
      head.className = 'wave29-head';
      head.innerHTML = '<div class="wave29-kicker">Wave 29</div><div class="wave29-title">' + esc(title || '') + '</div>' + (subtitle ? '<div class="wave29-sub">' + esc(subtitle) + '</div>' : '');
      wrap.appendChild(head);
    }
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'wave29-close wave29-no-print';
    close.innerHTML = '×';
    close.addEventListener('click', function(){ overlay.remove(); });
    wrap.appendChild(close);
    overlay.appendChild(wrap);
    document.body.appendChild(overlay);
    return { overlay: overlay, card: wrap };
  }

  function colorForPct(value){
    return value >= 80 ? 'var(--green,#16a34a)' : value >= 60 ? 'var(--orange,#ea580c)' : 'var(--red,#dc2626)';
  }

  function subjectBar(row){
    var fill = clamp(row.pct || 0, 0, 100);
    var color = row.color || colorForPct(fill);
    return '<div class="wave29-subject">' +
      '<div class="wave29-subject-head"><div><div class="wave29-subject-name">' + esc((row.ic ? row.ic + ' ' : '') + row.name) + '</div><div class="wave29-subject-meta">' + row.total + ' задач · ' + row.started + ' тем · сильных ' + row.strong + ' · зон роста ' + row.weak + '</div></div><div class="wave29-subject-pct" style="color:' + esc(color) + '">' + row.pct + '%</div></div>' +
      '<div class="wave29-track"><div class="wave29-fill" style="width:' + fill + '%;background:' + esc(color) + '"></div></div>' +
    '</div>';
  }

  function weekBars(rows){
    var max = Math.max(1, (rows || []).reduce(function(m, row){ return Math.max(m, toNum(row.total)); }, 0));
    if(!(rows || []).length) return '<div class="wave29-empty">Пока мало данных</div>';
    return '<div class="wave29-bars">' + rows.map(function(row){
      var height = row.total ? Math.max(10, Math.round(row.total / max * 88)) : 8;
      return '<div class="wave29-bar"><div class="wave29-barval">' + row.total + '</div><div class="wave29-barbox"><div class="wave29-barfill" style="height:' + height + 'px;background:' + colorForPct(row.pct) + '"></div></div><div class="wave29-barlbl">' + esc(row.label) + '<br>' + row.pct + '%</div></div>';
    }).join('') + '</div>';
  }

  function buildParentPngCanvas(snapshot){
    var canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1500;
    var ctx = canvas.getContext('2d');
    if(!ctx) return canvas;

    function rr(x, y, w, h, r){
      var rr = Math.min(r, w/2, h/2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }
    function card(x, y, w, h, label, value, sub){
      ctx.fillStyle = '#ffffff'; rr(x,y,w,h,24); ctx.fill();
      ctx.fillStyle = '#6b7280'; ctx.font = '700 24px sans-serif'; ctx.fillText(label, x+22, y+34);
      ctx.fillStyle = '#111827'; ctx.font = '900 52px sans-serif'; ctx.fillText(String(value), x+22, y+92);
      ctx.fillStyle = '#4b5563'; ctx.font = '500 20px sans-serif'; ctx.fillText(sub, x+22, y+126);
    }

    ctx.fillStyle = '#f5f3ee';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '900 54px sans-serif';
    ctx.fillText('Отчёт для родителя', 64, 82);
    ctx.font = '700 26px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText((snapshot.name || 'Ученик') + ' · ' + (snapshot.gradeTitle || ''), 64, 120);
    ctx.fillText(formatDate(snapshot.generatedAt), 840, 82);

    card(64, 156, 250, 148, 'Задач', snapshot.totalQs, 'за всё время');
    card(330, 156, 250, 148, 'Точность', snapshot.totalPct + '%', 'средний результат');
    card(596, 156, 250, 148, 'Серия', snapshot.currentStreak, 'текущая серия');
    card(862, 156, 274, 148, '30 дней', snapshot.last30.total, snapshot.last30.active + ' активных дней');

    ctx.fillStyle = '#1a1a2e';
    ctx.font = '800 32px sans-serif';
    ctx.fillText('Неделя и месяц', 64, 366);
    ctx.fillStyle = '#4b5563';
    ctx.font = '500 24px sans-serif';
    ctx.fillText('7 дней: ' + snapshot.last7.total + ' задач · ' + snapshot.last7.pct + '% · ' + snapshot.last7.active + ' активных дней', 64, 408);
    ctx.fillText('30 дней: ' + snapshot.last30.total + ' задач · ' + snapshot.last30.pct + '% · ' + snapshot.last30.active + ' активных дней', 64, 442);

    ctx.fillStyle = '#1a1a2e';
    ctx.font = '800 32px sans-serif';
    ctx.fillText('Предметы', 64, 514);
    (snapshot.subjects || []).slice(0, 6).forEach(function(row, idx){
      var y = 560 + idx * 118;
      ctx.fillStyle = '#ffffff'; rr(64, y, 1072, 86, 20); ctx.fill();
      ctx.fillStyle = row.color || '#2563eb'; rr(64, y, 12, 86, 8); ctx.fill();
      ctx.fillStyle = '#111827'; ctx.font = '800 28px sans-serif'; ctx.fillText((row.ic || '') + ' ' + row.name, 96, y + 32);
      ctx.fillStyle = '#6b7280'; ctx.font = '500 20px sans-serif'; ctx.fillText(row.total + ' задач · тем ' + row.started + ' · зон роста ' + row.weak, 96, y + 62);
      ctx.fillStyle = row.color || '#2563eb'; ctx.font = '900 36px sans-serif'; ctx.fillText(row.pct + '%', 1000, y + 52);
      ctx.fillStyle = '#e5e7eb'; rr(726, y + 58, 250, 10, 5); ctx.fill();
      ctx.fillStyle = row.color || '#2563eb'; rr(726, y + 58, Math.max(12, Math.round(250 * clamp(row.pct, 0, 100) / 100)), 10, 5); ctx.fill();
    });

    ctx.fillStyle = '#1a1a2e';
    ctx.font = '800 32px sans-serif';
    ctx.fillText('Зоны роста', 64, 1300);
    ctx.fillStyle = '#4b5563';
    ctx.font = '600 22px sans-serif';
    (snapshot.weak || []).slice(0, 5).forEach(function(row, idx){
      ctx.fillText('• ' + row.label + ' — ' + row.count + ' ош.' + (row.pct ? ' · ' + row.pct + '%' : ''), 64, 1344 + idx * 32);
    });

    ctx.fillStyle = '#6b7280';
    ctx.font = '500 22px sans-serif';
    ctx.fillText('Сформировано в тренажёре · wave 29', 64, 1452);
    return canvas;
  }

  function downloadBlob(filename, blob){
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 600);
  }

  function downloadParentPng(snapshot){
    var canvas = buildParentPngCanvas(snapshot);
    if(!canvas || !canvas.toBlob) return;
    canvas.toBlob(function(blob){
      if(!blob) return;
      var stamp = new Date(snapshot.generatedAt || nowTs()).toISOString().slice(0,10);
      downloadBlob('parent_report_grade' + (snapshot.grade || 'x') + '_' + stamp + '.png', blob);
    }, 'image/png');
  }

  function printParentReport(overlay){
    var cleanup = function(){ document.body.classList.remove('wave29-print-mode'); try { window.removeEventListener('afterprint', cleanup); } catch(e){} };
    document.body.classList.add('wave29-print-mode');
    try { window.addEventListener('afterprint', cleanup); } catch(e){}
    try { window.print(); } catch(e){ cleanup(); }
    setTimeout(cleanup, 1600);
  }

  function renderParentReport(snapshot, opts){
    opts = opts || {};
    var ui = overlayCard('📊 Отчёт для родителя', snapshot.gradeTitle + ' · ' + snapshot.name + ' · ' + formatDate(snapshot.generatedAt));
    var banner = opts.shared ? '<div class="wave29-banner">Это ссылка-отчёт со снимком прогресса. Она только показывает состояние на момент создания и не меняет данные на устройстве.</div>' : '';
    var body = document.createElement('div');
    body.className = 'wave29-body';
    body.innerHTML =
      banner +
      '<div class="wave29-grid">' +
        '<div class="wave29-metric"><div class="n">' + snapshot.totalQs + '</div><div class="l">задач</div></div>' +
        '<div class="wave29-metric"><div class="n">' + snapshot.totalPct + '%</div><div class="l">точность</div></div>' +
        '<div class="wave29-metric"><div class="n">🔥' + snapshot.currentStreak + '</div><div class="l">текущая серия</div></div>' +
        '<div class="wave29-metric"><div class="n">' + snapshot.doneDays + '</div><div class="l">активных дней</div></div>' +
      '</div>' +
      '<div class="wave29-section"><h4>🗓 Неделя и месяц</h4><div class="wave29-mini-grid"><div class="wave29-mini-card"><div class="k">7 дней</div><div class="v">' + snapshot.last7.total + '</div><div class="s">' + snapshot.last7.active + ' активных дней · ' + snapshot.last7.pct + '% точность</div></div><div class="wave29-mini-card"><div class="k">30 дней</div><div class="v">' + snapshot.last30.total + '</div><div class="s">' + snapshot.last30.active + ' активных дней · ' + snapshot.last30.pct + '% точность</div></div></div><div class="wave29-note" style="margin-top:10px">Сегодня: ' + snapshot.today.total + ' задач' + (snapshot.today.status ? ' · статус: ' + esc(snapshot.today.status) : '') + (snapshot.today.pure ? ' · без подсказок: ' + snapshot.today.pure : '') + '</div></div>' +
      '<div class="wave29-section"><h4>📈 По неделям</h4>' + weekBars(snapshot.weeks || []) + '</div>' +
      '<div class="wave29-section"><h4>🗓 По месяцам</h4><div class="wave29-pillrow">' + (snapshot.months || []).map(function(row){ return '<span class="wave29-pill">' + esc(row.label) + ' · ' + row.total + ' задач · ' + row.pct + '%</span>'; }).join('') + '</div></div>' +
      '<div class="wave29-section"><h4>🔁 Повторение ошибок</h4><div class="wave29-pillrow"><span class="wave29-pill">в журнале: ' + snapshot.review.total + '</span><span class="wave29-pill">на сегодня: ' + snapshot.review.due + '</span><span class="wave29-pill">сложные: ' + snapshot.review.sticky + '</span><span class="wave29-pill">закреплены: ' + snapshot.review.mastered + '</span></div></div>' +
      '<div class="wave29-section"><h4>📚 Предметы</h4><div class="wave29-subjects">' + ((snapshot.subjects || []).length ? snapshot.subjects.map(subjectBar).join('') : '<div class="wave29-empty">Пока мало данных по предметам</div>') + '</div></div>' +
      '<div class="wave29-section"><h4>🎯 Зоны роста</h4><div class="wave29-weaklist">' + ((snapshot.weak || []).length ? snapshot.weak.map(function(row){ return '<div class="wave29-weak"><div><b>' + esc(row.label) + '</b>' + (row.pct ? '<div class="wave29-note">точность: ' + row.pct + '%</div>' : '') + '</div><div style="font-weight:900;color:' + colorForPct(row.pct || 0) + '">' + row.count + ' ' + decl(row.count, 'ошибка', 'ошибки', 'ошибок') + '</div></div>'; }).join('') : '<div class="wave29-empty">Ошибок пока нет — отлично!</div>') + '</div></div>';

    var actions = document.createElement('div');
    actions.className = 'wave29-actions wave29-no-print';
    var link = buildReportLink(snapshot);
    window.__wave29LastReportLink = link;
    window.__wave29LastReportText = buildGradeReportText(snapshot);
    actions.innerHTML =
      '<button type="button" class="wave29-btn accent" id="wave29-report-share">💬 Отправить</button>' +
      '<button type="button" class="wave29-btn light" id="wave29-report-link">🔗 Ссылка</button>' +
      '<button type="button" class="wave29-btn light" id="wave29-report-qr">📱 QR</button>' +
      '<button type="button" class="wave29-btn light" id="wave29-report-png">🖼 PNG</button>' +
      '<button type="button" class="wave29-btn dark" id="wave29-report-print">🖨 Печать</button>' +
      '<button type="button" class="wave29-btn light" id="wave29-report-close">Закрыть</button>';

    body.appendChild(actions);
    ui.card.appendChild(body);

    body.querySelector('#wave29-report-share').addEventListener('click', function(){
      if(hasFn(window.doShare)) doShare('Отчёт для родителя', window.__wave29LastReportText);
      else if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(window.__wave29LastReportText);
    });
    body.querySelector('#wave29-report-link').addEventListener('click', function(){ copyText(link, '✅ Ссылка на отчёт скопирована'); });
    body.querySelector('#wave29-report-qr').addEventListener('click', function(){ showQrPackage(link, 'QR-ссылка на отчёт', 'Открой ссылку на другом устройстве или отсканируй её телефоном.', 'report'); });
    body.querySelector('#wave29-report-png').addEventListener('click', function(){ downloadParentPng(snapshot); });
    body.querySelector('#wave29-report-print').addEventListener('click', function(){ printParentReport(ui.overlay); });
    body.querySelector('#wave29-report-close').addEventListener('click', function(){ ui.overlay.remove(); });
    return ui.overlay;
  }

  function copyText(text, success){
    try {
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(String(text || '')).then(function(){ if(success) alert(success); }).catch(function(){ hasFn(window.showShareText) ? showShareText(String(text || '')) : alert(String(text || '')); });
        return;
      }
    } catch(e){}
    if(hasFn(window.showShareText)) showShareText(String(text || '')); else alert(String(text || ''));
  }

  function qrImageSrc(text, size){
    var n = size || 256;
    return QR_PROVIDER + '?size=' + n + 'x' + n + '&margin=0&data=' + encodeURIComponent(String(text || ''));
  }

  function buildQrFrames(text, kind){
    var src = String(text || '');
    if(!src) return [];
    if(src.length <= QR_CHUNK) return [src];
    var parts = [];
    for(var i=0;i<src.length;i+=QR_CHUNK) parts.push(src.slice(i, i + QR_CHUNK));
    var sig = hashText(src);
    return parts.map(function(chunk, idx){ return 'W29|' + (kind || 'data') + '|' + sig + '|' + (idx + 1) + '|' + parts.length + '|' + chunk; });
  }

  function parseQrFrame(text){
    var src = String(text || '');
    if(src.indexOf('W29|') !== 0) return null;
    var parts = src.split('|');
    if(parts.length < 6) return null;
    return { kind: parts[1], sig: parts[2], index: toNum(parts[3]), total: toNum(parts[4]), chunk: parts.slice(5).join('|') };
  }

  function showQrPackage(text, title, subtitle, kind){
    var frames = buildQrFrames(text, kind || 'data');
    var state = { index: 0, frames: frames, timer: null, playing: frames.length > 1 };
    window.__wave29LastQrFrames = frames.slice();
    var ui = overlayCard(title, subtitle + (frames.length > 1 ? ' Пакет разбит на ' + frames.length + ' QR-кадров.' : ''));
    var body = document.createElement('div');
    body.className = 'wave29-body';
    body.innerHTML =
      '<div class="wave29-qr-wrap"><div class="wave29-qr-box"><img id="wave29-qr-img" alt="QR"></div><div class="wave29-qr-meta"><div id="wave29-qr-counter" style="font-weight:800;margin-bottom:8px"></div><div>Если код длинный, покажи кадры по очереди и отсканируй их с другого устройства. Импорт соберёт пакет автоматически.</div><div class="wave29-actions wave29-no-print" style="margin-top:14px"><button type="button" class="wave29-btn light" id="wave29-qr-prev">◀ Назад</button><button type="button" class="wave29-btn light" id="wave29-qr-play">⏯ Пауза</button><button type="button" class="wave29-btn light" id="wave29-qr-next">Вперёд ▶</button><button type="button" class="wave29-btn dark" id="wave29-qr-copy">📋 Скопировать текст</button></div><textarea class="wave29-code wave29-no-print" id="wave29-qr-code" readonly style="margin-top:10px"></textarea></div></div>';
    ui.card.appendChild(body);
    var img = body.querySelector('#wave29-qr-img');
    var counter = body.querySelector('#wave29-qr-counter');
    var textarea = body.querySelector('#wave29-qr-code');
    var playBtn = body.querySelector('#wave29-qr-play');
    function render(){
      var frame = state.frames[state.index] || '';
      img.src = qrImageSrc(frame, 256);
      textarea.value = frame;
      counter.textContent = state.frames.length > 1 ? ('Кадр ' + (state.index + 1) + ' из ' + state.frames.length) : 'Один QR-код';
      playBtn.textContent = state.playing ? '⏸ Пауза' : '▶ Авто';
    }
    img.addEventListener('error', function(){
      counter.textContent = counter.textContent + ' · QR-изображение не загрузилось, используй текст кадра ниже';
    });
    function stop(){ if(state.timer){ clearInterval(state.timer); state.timer = null; } }
    function maybePlay(){
      stop();
      if(!state.playing || state.frames.length <= 1) return;
      state.timer = setInterval(function(){ state.index = (state.index + 1) % state.frames.length; render(); }, 1200);
    }
    body.querySelector('#wave29-qr-prev').addEventListener('click', function(){ state.index = (state.index - 1 + state.frames.length) % state.frames.length; render(); });
    body.querySelector('#wave29-qr-next').addEventListener('click', function(){ state.index = (state.index + 1) % state.frames.length; render(); });
    body.querySelector('#wave29-qr-play').addEventListener('click', function(){ state.playing = !state.playing; maybePlay(); render(); });
    body.querySelector('#wave29-qr-copy').addEventListener('click', function(){ copyText(text, '✅ Текст QR-пакета скопирован'); });
    ui.overlay.addEventListener('remove', stop);
    ui.overlay.addEventListener('DOMNodeRemoved', stop);
    render(); maybePlay();
    return ui.overlay;
  }

  function canScanQr(){
    try { return !!(window.BarcodeDetector && navigator.mediaDevices && navigator.mediaDevices.getUserMedia); } catch(e){ return false; }
  }

  function stopStream(video){
    try {
      var stream = video && video.srcObject;
      if(stream && stream.getTracks) stream.getTracks().forEach(function(track){ try { track.stop(); } catch(e){} });
      if(video) video.srcObject = null;
    } catch(e){}
  }

  function showQrScanner(opts){
    opts = opts || {};
    var onResult = opts.onResult || function(){};
    var session = null;
    var ui = overlayCard(opts.title || '📷 Сканировать QR', opts.subtitle || 'Наведи камеру на QR-код или выбери изображение.');
    var body = document.createElement('div');
    body.className = 'wave29-body';
    body.innerHTML = '<div class="wave29-scan"><video class="wave29-video" id="wave29-scan-video" autoplay playsinline muted></video><div class="wave29-scan-status" id="wave29-scan-status">Запрашиваю доступ к камере…</div><div class="wave29-actions wave29-no-print"><label class="wave29-btn light" style="display:inline-flex;align-items:center;justify-content:center;cursor:pointer">🖼 Фото QR<input type="file" accept="image/*" id="wave29-scan-file" style="display:none"></label><button type="button" class="wave29-btn dark" id="wave29-scan-close">Закрыть</button></div></div>';
    ui.card.appendChild(body);
    var video = body.querySelector('#wave29-scan-video');
    var status = body.querySelector('#wave29-scan-status');
    var fileInput = body.querySelector('#wave29-scan-file');
    var detector = null;
    var timer = null;
    var closed = false;

    function setStatus(text){ status.textContent = text; }
    function cleanup(){ closed = true; if(timer) clearTimeout(timer); stopStream(video); ui.overlay.remove(); }
    body.querySelector('#wave29-scan-close').addEventListener('click', cleanup);
    ui.overlay.addEventListener('click', function(){ closed = true; if(timer) clearTimeout(timer); stopStream(video); });

    function acceptText(text){
      var frame = parseQrFrame(text);
      if(frame){
        if(!session || session.sig !== frame.sig){ session = { sig: frame.sig, total: frame.total, chunks: {}, kind: frame.kind }; }
        session.chunks[frame.index] = frame.chunk;
        var got = Object.keys(session.chunks).length;
        setStatus('Собираю QR-пакет: ' + got + ' из ' + session.total + ' кадров');
        if(got >= session.total){
          var full = '';
          for(var i=1;i<=session.total;i++) full += session.chunks[i] || '';
          cleanup();
          onResult(full, session.kind || 'data');
        }
        return;
      }
      cleanup();
      onResult(text, 'raw');
    }

    async function detectFromSource(source){
      if(!detector) detector = new BarcodeDetector({ formats:['qr_code'] });
      var found = await detector.detect(source);
      if(found && found.length && found[0].rawValue){ acceptText(found[0].rawValue); return true; }
      return false;
    }

    async function loop(){
      if(closed) return;
      try {
        var ok = await detectFromSource(video);
        if(ok) return;
      } catch(e){}
      timer = setTimeout(loop, 240);
    }

    fileInput.addEventListener('change', async function(){
      var file = fileInput.files && fileInput.files[0];
      if(!file) return;
      if(!window.BarcodeDetector){ setStatus('В этом браузере нет BarcodeDetector. Используй код или .json файл.'); return; }
      try {
        setStatus('Пробую прочитать QR с изображения…');
        var bitmap = await createImageBitmap(file);
        var ok = await detectFromSource(bitmap);
        if(!ok) setStatus('На изображении не найден QR-код.');
      } catch(e){
        setStatus('Не удалось прочитать изображение.');
      } finally {
        fileInput.value = '';
      }
    });

    if(!canScanQr()){
      setStatus('В этом браузере нет встроенного сканера QR. Для импорта используй код переноса или .json файл.');
      return ui.overlay;
    }

    (async function(){
      try {
        detector = new BarcodeDetector({ formats:['qr_code'] });
        var stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        video.srcObject = stream;
        try { await video.play(); } catch(e){}
        setStatus('Наведи камеру на QR-код. Для длинного пакета сканируй кадры по очереди.');
        loop();
      } catch(e){
        setStatus('Не удалось открыть камеру. Разреши доступ или используй импорт по коду / файлу.');
      }
    })();

    return ui.overlay;
  }

  function handleBackupQrText(text){
    try {
      if(/^https?:/i.test(String(text || ''))){
        alert('Это ссылка, а не backup-код. Для отчёта открой ссылку в браузере.');
        return;
      }
      importBackupFromText(String(text || ''), document.querySelector('.wave29-overlay'));
    } catch(e){
      alert('⚠️ Не удалось импортировать QR-пакет');
    }
  }

  function renderBackupModal(mode){
    var isImport = mode === 'import';
    var code = hasFn(window.encodeTransferPayload) && hasFn(window.getBackupSnapshot) ? encodeTransferPayload(getBackupSnapshot()) : '';
    var ui = overlayCard(isImport ? '📦 Восстановить копию' : '💾 Резервная копия', isImport ? 'Импорт по коду, JSON-файлу или QR-пакету.' : 'Экспорт текущего класса без облака: код, JSON и QR-пакет.');
    var body = document.createElement('div');
    body.className = 'wave29-body';
    var qrCount = buildQrFrames(code, 'backup').length;
    body.innerHTML =
      (!isImport ? '<div class="wave29-section"><h4>Экспорт</h4><textarea readonly class="wave29-code" id="wave29-backup-export">' + esc(code) + '</textarea><div class="wave29-note" style="margin-top:8px">Код переноса можно вставить в другой класс того же номера. Если код длинный, QR будет разбит на ' + qrCount + ' кадров.</div><div class="wave29-actions wave29-no-print"><button type="button" class="wave29-btn light" id="wave29-backup-copy">📋 Скопировать код</button><button type="button" class="wave29-btn light" id="wave29-backup-file">⬇️ Скачать .json</button><button type="button" class="wave29-btn accent" id="wave29-backup-qr-btn">📱 QR-экспорт</button></div></div>' : '') +
      '<div class="wave29-section"><h4>Импорт</h4><textarea class="wave29-code" id="wave29-backup-import" placeholder="Вставь сюда код переноса"></textarea><div class="wave29-actions wave29-no-print"><button type="button" class="wave29-btn accent" id="wave29-backup-restore">📥 Восстановить</button><label class="wave29-btn light" style="display:inline-flex;align-items:center;justify-content:center;cursor:pointer">📂 Выбрать файл<input type="file" accept=".json,application/json,text/plain" id="wave29-backup-file-input" style="display:none"></label><button type="button" class="wave29-btn light" id="wave29-backup-scan">📷 Сканировать QR</button></div><div class="wave29-note" style="margin-top:8px">В импорт входят прогресс, серия, активность, даты, журнал ошибок, интервальное повторение, фильтр микса и локальные рекорды текущего класса.</div></div>';
    ui.card.appendChild(body);

    var input = body.querySelector('#wave29-backup-import');
    var fileInput = body.querySelector('#wave29-backup-file-input');
    var btnRestore = body.querySelector('#wave29-backup-restore');
    btnRestore.addEventListener('click', function(){ importBackupFromText(input.value, ui.overlay); });
    fileInput.addEventListener('change', function(){ importBackupFromFileInput(fileInput, ui.overlay); });
    body.querySelector('#wave29-backup-scan').addEventListener('click', function(){ showQrScanner({ title:'📷 Импорт backup по QR', subtitle:'Сканируй QR-код или весь QR-пакет по кадрам.', onResult: handleBackupQrText }); });

    if(!isImport){
      body.querySelector('#wave29-backup-copy').addEventListener('click', function(){ copyText(code, '✅ Код переноса скопирован'); });
      body.querySelector('#wave29-backup-file').addEventListener('click', function(){ downloadBackupFile(); });
      body.querySelector('#wave29-backup-qr-btn').addEventListener('click', function(){ showQrPackage(code, '📱 QR-экспорт backup', 'Покажи QR на одном устройстве и импортируй на другом через сканер.', 'backup'); });
    }
    return ui.overlay;
  }

  function installGradeOverrides(){
    var oldGenerate = window.generateReport;
    window.generateReport = function(){
      var snap = buildGradeSnapshot();
      window.__wave29LastSnapshot = snap;
      return renderParentReport(snap, { shared:false });
    };

    window.shareReport = function(){
      var snap = buildGradeSnapshot();
      window.__wave29LastSnapshot = snap;
      if(hasFn(window.doShare)) doShare('Отчёт для родителя', buildGradeReportText(snap));
      else copyText(buildGradeReportText(snap));
    };

    window.showBackupModal = function(mode){ return renderBackupModal(mode); };
    window.openParentReport = window.generateReport;
    window.__wave29OldGenerateReport = oldGenerate;
  }

  function parseSharedGradeFromHash(){
    var encoded = readHashParam(REPORT_HASH_KEY);
    if(!encoded) return null;
    try { return decodeGradeSnapshot(encoded); } catch(e){ return null; }
  }

  function installSharedMode(){
    var shared = parseSharedGradeFromHash();
    if(!shared || !isGradePage()) return null;
    window[SHARED_FLAG] = shared;
    window.pickName = function(){};
    window.showWelcome = function(){};
    setTimeout(function(){
      try { renderParentReport(shared, { shared:true }); } catch(e){}
    }, 80);
    return shared;
  }

  function dashboardSummaryHtml(state){
    var data = state && state.analytics ? state.analytics : null;
    if(!data || !data.weeks || !data.months) return '';
    var weeks = data.weeks.slice(-2);
    var months = data.months.slice(-3);
    return '<div class="wave29-dash-summary">' +
      '<div class="section">Weekly / monthly summary</div>' +
      '<div class="wave29-mini-grid">' + weeks.map(function(row, idx){ return '<div class="wave29-mini-card"><div class="k">' + (idx === weeks.length - 1 ? 'Эта неделя' : 'Прошлая неделя') + '</div><div class="v">' + row.total + '</div><div class="s">' + row.acc + '% точность · ' + row.label + '</div></div>'; }).join('') + '</div>' +
      '<div class="wave29-section" style="margin-top:8px"><h4>🗓 По месяцам</h4><div class="wave29-badges">' + months.map(function(row){ return '<span class="wave29-badge">' + esc(row.label) + ' · ' + row.total + ' задач · ' + row.acc + '%</span>'; }).join('') + '</div><div class="wave29-note" style="margin-top:8px">За 30 дней: ' + data.last30Total + ' задач · ' + data.last30Active + ' активных дней. ' + (data.subjectSummary && data.subjectSummary.best ? ('Лучший предмет: ' + esc(data.subjectSummary.best.label) + ' (' + data.subjectSummary.best.acc + '%). ') : '') + (data.subjectSummary && data.subjectSummary.weakest ? ('Зона роста: ' + esc(data.subjectSummary.weakest.label) + ' (' + data.subjectSummary.weakest.acc + '%).') : '') + '</div></div>' +
    '</div>';
  }

  function initDashboardEnhancements(){
    if(!isDashboardPage() || !window._dashboardState) return;
    var host = document.getElementById('wave29-dashboard-summary');
    if(!host){
      host = document.createElement('div');
      host.id = 'wave29-dashboard-summary';
      var ref = document.querySelector('.dash-actions');
      if(ref && ref.parentNode) ref.parentNode.insertBefore(host, ref);
      else if(document.body) document.body.appendChild(host);
    }
    host.innerHTML = dashboardSummaryHtml(window._dashboardState);
  }

  function installDashboardEnhancements(){
    var run = function(){ try { initDashboardEnhancements(); } catch(e){} };
    try { window.addEventListener('dashboard-state-ready', run); } catch(e){}
    setTimeout(run, 50);
    setTimeout(run, 220);
    setTimeout(run, 600);
  }

  function init(){
    if(isGradePage()){
      installGradeOverrides();
      installSharedMode();
    }
    if(isDashboardPage()){
      installDashboardEnhancements();
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.wave29Debug = {
    version: VERSION,
    buildGradeSnapshot: buildGradeSnapshot,
    encodeGradeSnapshot: encodeGradeSnapshot,
    decodeGradeSnapshot: decodeGradeSnapshot,
    buildReportLink: buildReportLink,
    parseReportLink: parseReportLink,
    buildReportText: buildGradeReportText,
    buildParentPngCanvas: buildParentPngCanvas,
    buildQrFrames: buildQrFrames,
    parseQrFrame: parseQrFrame,
    showQrPackage: showQrPackage,
    canScanQr: canScanQr,
    openReport: function(){ return renderParentReport(buildGradeSnapshot(), { shared:false }); },
    openBackup: function(mode){ return renderBackupModal(mode); },
    hasPrintStyle: function(){ return !!document.getElementById(STYLE_ID); },
    dashboardSummaryPresent: function(){ return !!document.getElementById('wave29-dashboard-summary'); },
    sharedSnapshot: function(){ return window[SHARED_FLAG] || null; },
    lastQrFrameCount: function(){ return (window.__wave29LastQrFrames || []).length; }
  };
})();

;/* ---- bundle_profile_social.js ---- */
(function(root, factory){
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(root || globalThis, true);
  } else {
    root.wave68Profile = factory(root || window, false);
  }
})(typeof window !== 'undefined' ? window : globalThis, function(root, isNode){
  'use strict';

  var CONFIG = {
    key: 'trainer_profile_social_v1',
    cloudCacheKey: 'trainer_profile_social_cloud_cache_v1',
    cloudBinKey: 'trainer_cloud_bin_id',
    profileActiveKey: 'trainer35_active_profile_v1',
    profilesKey: 'trainer35_profiles_v1',
    profileScopePrefix: 'trainer35_scoped:',
    xpKey: 'trainer_xp_state_v1',
    metaKey: 'trainer_meta_state_v1',
    maxLeaderboard: 20,
    cloudTimeout: 6500,
    version: 68
  };

  var QR_PROVIDER = 'https://api.qrserver.com/v1/create-qr-code/';
  var STYLE_ID = 'wave68-profile-style';
  var TOAST_ID = 'wave68-profile-toast';
  var AVATARS = [
    { id:'fox', icon:'🦊', label:'Лис' },
    { id:'owl', icon:'🦉', label:'Сова' },
    { id:'rocket', icon:'🚀', label:'Ракета' },
    { id:'spark', icon:'✨', label:'Искра' },
    { id:'robot', icon:'🤖', label:'Робот' },
    { id:'lion', icon:'🦁', label:'Лев' },
    { id:'cat', icon:'🐱', label:'Кот' },
    { id:'panda', icon:'🐼', label:'Панда' },
    { id:'tiger', icon:'🐯', label:'Тигр' },
    { id:'whale', icon:'🐋', label:'Кит' },
    { id:'koala', icon:'🐨', label:'Коала' },
    { id:'dolphin', icon:'🐬', label:'Дельфин' },
    { id:'unicorn', icon:'🦄', label:'Единорог' },
    { id:'crown', icon:'👑', label:'Корона' },
    { id:'medal', icon:'🏅', label:'Медаль' },
    { id:'star', icon:'⭐', label:'Звезда' },
    { id:'comet', icon:'☄️', label:'Комета' },
    { id:'palette', icon:'🎨', label:'Палитра' },
    { id:'book', icon:'📘', label:'Книга' },
    { id:'bulb', icon:'💡', label:'Идея' }
  ];

  var SUBJECT_LABELS = {
    math: 'Математика', mathall: 'Математика', algebra: 'Алгебра', geometry: 'Геометрия',
    rus: 'Русский', russian: 'Русский', eng: 'Английский', english: 'Английский',
    phys: 'Физика', physics: 'Физика', chem: 'Химия', chemistry: 'Химия', biology: 'Биология',
    geo: 'География', geography: 'География', history: 'История', social: 'Обществознание',
    lit: 'Литература', literature: 'Литература', info: 'Информатика', informatics: 'Информатика',
    diplomacy: 'Дипломатия', construction: 'Строительство', procurement: 'Закупки',
    management: 'Управление', gkh: 'ЖКХ', psychology: 'Психология'
  };

  var storage = {
    get: function(key){
      try { return root.localStorage ? root.localStorage.getItem(key) : null; } catch (_) { return null; }
    },
    set: function(key, value){
      try { if (root.localStorage) root.localStorage.setItem(key, String(value)); } catch (_) {}
    },
    remove: function(key){
      try { if (root.localStorage) root.localStorage.removeItem(key); } catch (_) {}
    }
  };

  var liveClockProfile = '';
  var liveClockStartedAt = 0;

  function hasOwn(obj, key){ return Object.prototype.hasOwnProperty.call(obj || {}, key); }
  function asObj(value){ return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function toNum(value){ return Number(value || 0) || 0; }
  function esc(text){
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function nowIso(){ return new Date().toISOString(); }
  function safeParse(raw, fallback){ try { return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; } }
  function stripUrl(){ try { return String(root.location.href || '').replace(/[?#].*$/, ''); } catch (_) { return ''; } }
  function base64UrlEncode(text){
    var src = typeof text === 'string' ? text : JSON.stringify(text || {});
    try {
      if (typeof Buffer !== 'undefined' && Buffer.from) return Buffer.from(src, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'');
    } catch (_) {}
    try { return btoa(unescape(encodeURIComponent(src))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); } catch (_) { return src; }
  }
  function base64UrlDecode(text){
    var raw = String(text || '').replace(/-/g,'+').replace(/_/g,'/');
    while (raw.length % 4) raw += '=';
    try {
      if (typeof Buffer !== 'undefined' && Buffer.from) return Buffer.from(raw, 'base64').toString('utf8');
    } catch (_) {}
    try { return decodeURIComponent(escape(atob(raw))); } catch (_) { return raw; }
  }
  function hashText(text){
    var str = String(text || '');
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return (h >>> 0).toString(36).toUpperCase();
  }

  function activeProfileId(){
    try {
      if (root.wave35Debug && typeof root.wave35Debug.activeProfileId === 'function') return String(root.wave35Debug.activeProfileId() || 'p1');
    } catch (_) {}
    return storage.get(CONFIG.profileActiveKey) || 'p1';
  }
  function scopedKey(baseKey, profileId){ return CONFIG.profileScopePrefix + (profileId || activeProfileId()) + ':' + baseKey; }
  function loadProfiles(){
    try {
      if (root.wave35Debug && typeof root.wave35Debug.profiles === 'function') {
        var rows = root.wave35Debug.profiles();
        if (Array.isArray(rows) && rows.length) return rows;
      }
    } catch (_) {}
    return safeParse(storage.get(CONFIG.profilesKey), []);
  }
  function activeProfileName(){
    try {
      if (root.wave35Debug && typeof root.wave35Debug.activeProfile === 'function') {
        var current = root.wave35Debug.activeProfile();
        if (current && current.name) return String(current.name);
      }
    } catch (_) {}
    var rows = loadProfiles();
    var id = activeProfileId();
    for (var i = 0; i < rows.length; i++) if (rows[i] && rows[i].id === id) return String(rows[i].name || 'Ученик');
    return 'Ученик';
  }

  function avatarById(id){
    for (var i = 0; i < AVATARS.length; i++) if (AVATARS[i].id === id) return AVATARS[i];
    return AVATARS[1];
  }

  function defaultState(){
    return {
      avatarId: 'owl',
      tagline: '',
      trackedMs: 0,
      shareCount: 0,
      syncCount: 0,
      lastSyncAt: '',
      publicCode: '',
      lastLeaderboard: [],
      updatedAt: ''
    };
  }

  function normalizeState(state){
    state = Object.assign(defaultState(), asObj(state));
    state.avatarId = avatarById(state.avatarId).id;
    state.tagline = String(state.tagline || '').trim().slice(0, 48);
    state.trackedMs = Math.max(0, Math.round(toNum(state.trackedMs)));
    state.shareCount = Math.max(0, Math.round(toNum(state.shareCount)));
    state.syncCount = Math.max(0, Math.round(toNum(state.syncCount)));
    state.lastSyncAt = String(state.lastSyncAt || '');
    state.publicCode = String(state.publicCode || '');
    state.updatedAt = String(state.updatedAt || '');
    state.lastLeaderboard = Array.isArray(state.lastLeaderboard) ? state.lastLeaderboard.slice(0, CONFIG.maxLeaderboard) : [];
    return state;
  }

  function loadState(profileId){
    var raw = storage.get(scopedKey(CONFIG.key, profileId)) || storage.get(CONFIG.key);
    var state = normalizeState(safeParse(raw, defaultState()));
    if (!state.publicCode) {
      state.publicCode = publicCodeFor(profileId || activeProfileId(), activeProfileName());
      saveState(state, profileId);
    }
    return state;
  }
  function saveState(state, profileId){
    var normalized = normalizeState(state);
    if (!normalized.publicCode) normalized.publicCode = publicCodeFor(profileId || activeProfileId(), activeProfileName());
    normalized.updatedAt = nowIso();
    storage.set(scopedKey(CONFIG.key, profileId), JSON.stringify(normalized));
    return normalized;
  }

  function loadScopedRawJson(baseKey, profileId, fallback){ return safeParse(storage.get(scopedKey(baseKey, profileId)) || storage.get(baseKey), fallback); }
  function loadXpState(){
    try { if (root.wave66Xp && typeof root.wave66Xp.loadState === 'function') return root.wave66Xp.loadState(); } catch (_) {}
    return asObj(loadScopedRawJson(CONFIG.xpKey, activeProfileId(), {}));
  }
  function loadXpSummary(){
    try { if (root.wave66Xp && typeof root.wave66Xp.summarize === 'function') return root.wave66Xp.summarize(); } catch (_) {}
    var state = loadXpState();
    var answered = Math.max(0, toNum(state.answered));
    var correct = Math.max(0, toNum(state.correct));
    var hintCorrect = Math.max(0, toNum(state.hintCorrect));
    var wrong = Math.max(0, toNum(state.wrong));
    return {
      xp: Math.max(0, toNum(state.xp)),
      level: 1,
      rank: { label: 'Новичок', icon: '🌱' },
      answered: answered,
      correct: correct,
      hintCorrect: hintCorrect,
      wrong: wrong,
      diagnosticsDone: Math.max(0, toNum(state.diagnosticsDone)),
      topicsCompleted: Math.max(0, toNum(state.topicsCompleted)),
      maxStreak: Math.max(0, toNum(state.maxStreak))
    };
  }
  function loadMetaState(){
    try { if (root.wave67Meta && typeof root.wave67Meta.loadState === 'function') return root.wave67Meta.loadState(); } catch (_) {}
    return asObj(loadScopedRawJson(CONFIG.metaKey, activeProfileId(), {}));
  }
  function loadMetaSnapshot(xpSummary){
    try {
      if (root.wave67Meta && typeof root.wave67Meta.snapshot === 'function') return root.wave67Meta.snapshot(root.wave67Meta.loadState(), xpSummary || loadXpSummary());
    } catch (_) {}
    var metaState = loadMetaState();
    return {
      unlockedCount: Object.keys(asObj(metaState.unlocked)).length,
      secretUnlocked: 0,
      totalCount: 35,
      daily: [],
      weekly: [],
      achievements: [],
      recent: []
    };
  }

  function publicCodeFor(profileId, name){ return hashText(String(profileId || '') + '|' + String(name || '') + '|trainer').slice(0, 8); }

  function drawRoundRect(ctx, x, y, w, h, r){
    r = Math.max(0, Math.min(r || 0, Math.min(w, h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function formatDuration(ms){
    var totalMin = Math.max(0, Math.round(toNum(ms) / 60000));
    if (totalMin < 60) return totalMin + ' мин';
    var hours = Math.floor(totalMin / 60);
    var mins = totalMin % 60;
    return hours + ' ч ' + mins + ' мин';
  }

  function subjectLabel(id){
    var key = String(id || '').toLowerCase();
    if (SUBJECT_LABELS[key]) return SUBJECT_LABELS[key];
    try {
      if (Array.isArray(root.SUBJ)) {
        for (var i = 0; i < root.SUBJ.length; i++) {
          var row = root.SUBJ[i];
          if (row && String(row.id || '').toLowerCase() === key) return row.nm || row.id;
        }
      }
    } catch (_) {}
    return id || '—';
  }

  function favoriteSubjectFrom(subjectStats){
    subjectStats = asObj(subjectStats);
    var best = null;
    Object.keys(subjectStats).forEach(function(id){
      var row = asObj(subjectStats[id]);
      var answers = Math.max(0, toNum(row.answers));
      var correct = Math.max(0, toNum(row.correct));
      if (!answers) return;
      if (!best || answers > best.answers || (answers === best.answers && correct > best.correct)) {
        best = { id: id, answers: answers, correct: correct };
      }
    });
    if (!best) return { id:'', label:'—', answers:0, correct:0 };
    return { id: best.id, label: subjectLabel(best.id), answers: best.answers, correct: best.correct };
  }

  function aggregateActivity(){
    var map = {};
    var keys = [];
    for (var grade = 1; grade <= 11; grade++) {
      keys.push('trainer_activity_' + grade);
      keys.push('m' + grade + '_activity');
      keys.push('trainer_daily_' + grade);
      keys.push('m' + grade + '_daily');
    }
    keys.forEach(function(key){
      var payload = safeParse(storage.get(key), null);
      if (Array.isArray(payload)) {
        payload.forEach(function(row){
          if (!row || !row.date) return;
          var date = String(row.date);
          if (!map[date]) map[date] = { total:0 };
          map[date].total += Math.max(0, toNum(row.total || (toNum(row.ok) + toNum(row.err))));
        });
      } else if (payload && payload.date) {
        if (!map[payload.date]) map[payload.date] = { total:0 };
        map[payload.date].total += Math.max(0, toNum(payload.ok) + toNum(payload.err));
      }
    });
    var activeDays = Object.keys(map).filter(function(date){ return toNum(map[date].total) > 0; }).length;
    return { activeDays: activeDays, totalByDay: map };
  }

  function currentTrackedMs(state){
    var value = Math.max(0, toNum((state || {}).trackedMs));
    if (!isNode && liveClockProfile === activeProfileId() && liveClockStartedAt > 0) value += Math.max(0, Date.now() - liveClockStartedAt);
    return value;
  }

  function buildProfileSummary(input){
    input = asObj(input);
    if (hasOwn(input, 'totalAnswers') && hasOwn(input, 'accuracyPct') && hasOwn(input, 'publicCode')) {
      var ready = Object.assign({}, input);
      ready.avatar = ready.avatar || avatarById(ready.avatarId);
      ready.rankLabel = ready.rankLabel || 'Новичок';
      ready.rankIcon = ready.rankIcon || '🌱';
      ready.timeLabel = ready.timeLabel || formatDuration(ready.trackedMs || 0);
      ready.recentAchievements = Array.isArray(ready.recentAchievements) ? ready.recentAchievements : [];
      return ready;
    }
    var profileState = normalizeState(input.profileState || loadState());
    var xpSummary = asObj(input.xpSummary || loadXpSummary());
    var xpState = asObj(input.xpState || loadXpState());
    var metaSnapshot = asObj(input.metaSnapshot || loadMetaSnapshot(xpSummary));
    var metaState = asObj(input.metaState || loadMetaState());
    var activity = asObj(input.activity || aggregateActivity());
    var avatar = avatarById(profileState.avatarId);
    var totalAnswers = Math.max(0, toNum(xpSummary.answered) || toNum((window.STR || {}).totalQs));
    var totalCorrect = Math.max(0, toNum(xpSummary.correct) + toNum(xpSummary.hintCorrect) || toNum((window.STR || {}).totalOk));
    var totalWrong = Math.max(0, totalAnswers - totalCorrect);
    var accuracyPct = totalAnswers ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    var favorite = favoriteSubjectFrom(asObj(xpState.subjectStats));
    var rank = asObj(xpSummary.rank);
    var trackedMs = currentTrackedMs(profileState);
    var profileId = input.profileId || activeProfileId();
    var name = String(input.name || activeProfileName() || 'Ученик');
    var publicCode = profileState.publicCode || publicCodeFor(profileId, name);
    return {
      profileId: profileId,
      name: name,
      avatarId: avatar.id,
      avatar: avatar,
      publicCode: publicCode,
      tagline: profileState.tagline || '',
      xp: Math.max(0, toNum(xpSummary.xp)),
      level: Math.max(1, toNum(xpSummary.level || ((root.wave66Xp && root.wave66Xp.levelForXp) ? root.wave66Xp.levelForXp(toNum(xpSummary.xp)) : 1))),
      rankLabel: String(rank.label || 'Новичок'),
      rankIcon: String(rank.icon || '🌱'),
      progressPct: Math.max(0, Math.min(100, toNum((xpSummary.progress || {}).pct))),
      totalAnswers: totalAnswers,
      totalCorrect: totalCorrect,
      totalWrong: totalWrong,
      accuracyPct: accuracyPct,
      favoriteSubjectId: favorite.id,
      favoriteSubject: favorite.label,
      favoriteAnswers: favorite.answers,
      trackedMs: trackedMs,
      timeLabel: formatDuration(trackedMs),
      achievementsCount: Math.max(0, toNum(metaSnapshot.unlockedCount)),
      secretAchievements: Math.max(0, toNum(metaSnapshot.secretUnlocked)),
      diagnosticsDone: Math.max(0, toNum(xpSummary.diagnosticsDone)),
      topicsCompleted: Math.max(0, toNum(xpSummary.topicsCompleted)),
      missionDays: Math.max(0, toNum(metaState.missionDays)),
      weekWins: Math.max(0, toNum(metaState.weekWins)),
      bestCombo: Math.max(0, toNum(metaState.bestCombo)),
      bestStreak: Math.max(0, toNum(xpSummary.maxStreak)),
      activeDays: Math.max(0, toNum(activity.activeDays)),
      shareCount: Math.max(0, toNum(profileState.shareCount)),
      syncCount: Math.max(0, toNum(profileState.syncCount)),
      lastSyncAt: profileState.lastSyncAt || '',
      recentAchievements: Array.isArray(xpSummary.recentAchievements) ? xpSummary.recentAchievements.slice(0, 4) : []
    };
  }

  function buildPublicSnapshot(summary){
    summary = buildProfileSummary(summary);
    return {
      v: CONFIG.version,
      code: summary.publicCode,
      profileId: summary.profileId,
      name: summary.name,
      avatarId: summary.avatarId,
      level: summary.level,
      xp: summary.xp,
      rank: summary.rankLabel,
      rankIcon: summary.rankIcon,
      stats: {
        answers: summary.totalAnswers,
        accuracyPct: summary.accuracyPct,
        favoriteSubject: summary.favoriteSubject,
        timeLabel: summary.timeLabel,
        achievements: summary.achievementsCount,
        diagnostics: summary.diagnosticsDone,
        topics: summary.topicsCompleted,
        missionDays: summary.missionDays,
        weekWins: summary.weekWins,
        bestCombo: summary.bestCombo,
        bestStreak: summary.bestStreak,
        activeDays: summary.activeDays
      },
      generatedAt: nowIso()
    };
  }

  function encodeSnapshot(snapshot){ return base64UrlEncode(JSON.stringify(snapshot || {})); }
  function decodeSnapshot(payload){
    try { return JSON.parse(base64UrlDecode(payload)); } catch (_) { return null; }
  }
  function buildProfileLink(summary){ return stripUrl() + '#profile=' + encodeSnapshot(buildPublicSnapshot(summary)); }

  function sortProfiles(rows){
    return (Array.isArray(rows) ? rows.slice() : []).sort(function(a, b){
      a = asObj(a); b = asObj(b);
      return toNum(b.xp) - toNum(a.xp)
        || toNum(b.level) - toNum(a.level)
        || toNum(b.accuracyPct) - toNum(a.accuracyPct)
        || toNum(b.answers) - toNum(a.answers)
        || String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
    });
  }

  function leaderboardEntryFromSummary(summary){
    summary = buildProfileSummary(summary);
    return {
      code: summary.publicCode,
      profileId: summary.profileId,
      name: summary.name,
      avatarId: summary.avatarId,
      level: summary.level,
      xp: summary.xp,
      accuracyPct: summary.accuracyPct,
      answers: summary.totalAnswers,
      achievements: summary.achievementsCount,
      favoriteSubject: summary.favoriteSubject,
      updatedAt: nowIso()
    };
  }

  function mergeCloudDoc(doc, entry){
    doc = Object.assign({}, asObj(doc));
    var profiles = Array.isArray(doc.profiles) ? doc.profiles.slice() : [];
    var next = null;
    entry = Object.assign({}, asObj(entry));
    for (var i = 0; i < profiles.length; i++) {
      var row = asObj(profiles[i]);
      if ((entry.code && row.code === entry.code) || (entry.profileId && row.profileId === entry.profileId)) {
        next = Object.assign({}, row, entry);
        profiles[i] = next;
        next = null;
        break;
      }
    }
    if (next === null) {
      var found = false;
      for (var j = 0; j < profiles.length; j++) {
        var existing = asObj(profiles[j]);
        if ((entry.code && existing.code === entry.code) || (entry.profileId && existing.profileId === entry.profileId)) {
          found = true;
          break;
        }
      }
      if (!found) profiles.push(entry);
    }
    doc.profiles = sortProfiles(profiles).slice(0, 100);
    return doc;
  }

  function privateModeEnabled(){
    try { if (typeof root.getPrivateMode === 'function') return !!root.getPrivateMode(); } catch (_) {}
    var value = storage.get('trainer_private');
    return value === null || value === '1';
  }

  function cloudBinId(){ return String(root.rushBinId || root.RUSH_BIN_ID || storage.get(CONFIG.cloudBinKey) || ''); }
  function localFallbackLeaderboard(summary){
    var state = loadState();
    var rows = Array.isArray(state.lastLeaderboard) && state.lastLeaderboard.length ? state.lastLeaderboard.slice() : [leaderboardEntryFromSummary(summary || buildProfileSummary())];
    return sortProfiles(rows).slice(0, CONFIG.maxLeaderboard);
  }

  function fetchWithTimeout(url, options, timeoutMs){
    if (typeof fetch !== 'function') return Promise.reject(new Error('fetch unavailable'));
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = null;
    options = options || {};
    if (controller) {
      options.signal = controller.signal;
      timer = setTimeout(function(){ try { controller.abort(); } catch (_) {} }, timeoutMs || CONFIG.cloudTimeout);
    }
    return fetch(url, options).then(function(response){ if (timer) clearTimeout(timer); return response; }, function(error){ if (timer) clearTimeout(timer); throw error; });
  }

  function cacheLeaderboard(rows){
    var state = loadState();
    state.lastLeaderboard = sortProfiles(rows).slice(0, CONFIG.maxLeaderboard);
    saveState(state);
  }

  function updateSelfMeta(patch){
    var state = loadState();
    Object.keys(asObj(patch)).forEach(function(key){ state[key] = patch[key]; });
    return saveState(state);
  }

  function loadLeaderboard(){
    var summary = buildProfileSummary();
    if (privateModeEnabled() || !cloudBinId() || typeof fetch !== 'function') return Promise.resolve({ ok:false, reason: privateModeEnabled() ? 'private' : 'no-cloud', profiles: localFallbackLeaderboard(summary) });
    var url = 'https://api.npoint.io/' + cloudBinId();
    return fetchWithTimeout(url, null, CONFIG.cloudTimeout).then(function(response){ return response.json(); }).then(function(doc){
      var rows = sortProfiles((doc && doc.profiles) || []).slice(0, CONFIG.maxLeaderboard);
      if (!rows.length) rows = localFallbackLeaderboard(summary);
      cacheLeaderboard(rows);
      return { ok:true, profiles: rows };
    }).catch(function(){ return { ok:false, reason:'network', profiles: localFallbackLeaderboard(summary) }; });
  }

  function syncProfileToCloud(){
    var summary = buildProfileSummary();
    if (privateModeEnabled()) return Promise.resolve({ ok:false, reason:'private', profiles: localFallbackLeaderboard(summary) });
    if (!cloudBinId() || typeof fetch !== 'function') return Promise.resolve({ ok:false, reason:'no-cloud', profiles: localFallbackLeaderboard(summary) });
    var url = 'https://api.npoint.io/' + cloudBinId();
    var entry = leaderboardEntryFromSummary(summary);
    return fetchWithTimeout(url, null, CONFIG.cloudTimeout).then(function(response){ return response.json(); }).catch(function(){ return {}; }).then(function(doc){
      var merged = mergeCloudDoc(doc, entry);
      return fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      }, CONFIG.cloudTimeout).then(function(){
        updateSelfMeta({ syncCount: loadState().syncCount + 1, lastSyncAt: nowIso(), lastLeaderboard: sortProfiles(merged.profiles).slice(0, CONFIG.maxLeaderboard) });
        return { ok:true, profiles: sortProfiles(merged.profiles).slice(0, CONFIG.maxLeaderboard) };
      });
    }).catch(function(){ return { ok:false, reason:'network', profiles: localFallbackLeaderboard(summary) }; });
  }

  function recentAchievementsHtml(summary, dark){
    var rows = Array.isArray(summary.recentAchievements) ? summary.recentAchievements.slice(0, 4) : [];
    if (!rows.length) return '<div class="wave68-muted">Пока без новых достижений — продолжай серию.</div>';
    return rows.map(function(item){
      return '<span class="wave68-chip' + (dark ? ' dark' : '') + '">' + esc(item.icon || '🏆') + ' ' + esc(item.title || item.id || 'Достижение') + '</span>';
    }).join('');
  }

  function ensureStyle(){
    if (isNode || !root.document || root.document.getElementById(STYLE_ID)) return;
    var style = root.document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave68-card{margin:10px 0;padding:14px;border:1px solid var(--border,#e5e7eb);border-radius:16px;background:var(--card,#fff);box-shadow:0 10px 30px rgba(15,23,42,.05)}',
      '.wave68-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between}',
      '.wave68-avatar{width:54px;height:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;background:linear-gradient(135deg,#dbeafe,#ede9fe);flex-shrink:0}',
      '.wave68-name{font-family:Unbounded,system-ui,sans-serif;font-size:14px;font-weight:900;line-height:1.25}',
      '.wave68-sub{font-size:11px;color:var(--muted,#6b7280);line-height:1.45;margin-top:4px}',
      '.wave68-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
      '.wave68-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(37,99,235,.08);color:#1d4ed8;font-size:11px;font-weight:800;border:1px solid rgba(37,99,235,.1)}',
      '.wave68-chip.dark{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.12)}',
      '.wave68-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}',
      '.wave68-kpi{padding:10px;border-radius:12px;background:var(--bg,#f8fafc);border:1px solid var(--border,#e5e7eb)}',
      '.wave68-kpi b{display:block;font-family:Unbounded,system-ui,sans-serif;font-size:14px;line-height:1.1}',
      '.wave68-kpi span{display:block;font-size:10px;color:var(--muted,#6b7280);margin-top:4px}',
      '.wave68-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}',
      '.wave68-btn{flex:1 1 calc(33.333% - 6px);min-width:120px;padding:10px 12px;border-radius:12px;border:1px solid var(--border,#e5e7eb);background:var(--card,#fff);font:700 12px/1.2 Golos Text,system-ui,sans-serif;color:var(--text,#111827);cursor:pointer}',
      '.wave68-btn.accent{background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;border-color:transparent}',
      '.wave68-muted{font-size:11px;color:var(--muted,#6b7280);line-height:1.5}',
      '.wave68-holder{margin:10px 0}',
      '.wave68-overlay{position:fixed;inset:0;background:rgba(15,23,42,.56);backdrop-filter:blur(6px);z-index:10006;padding:18px calc(14px + env(safe-area-inset-right,0px)) calc(18px + env(safe-area-inset-bottom,0px)) calc(14px + env(safe-area-inset-left,0px));display:flex;align-items:flex-start;justify-content:center;overflow:auto}',
      '.wave68-overlay-card{width:min(100%,720px);margin-top:max(12px,env(safe-area-inset-top,0px));background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:18px;padding:16px;box-shadow:0 24px 60px rgba(15,23,42,.25)}',
      '.wave68-overlay-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}',
      '.wave68-overlay-title{font-family:Unbounded,system-ui,sans-serif;font-size:16px;font-weight:900;line-height:1.25}',
      '.wave68-close{width:38px;height:38px;border-radius:12px;border:1px solid var(--border,#e5e7eb);background:var(--bg,#f8fafc);font-size:18px;cursor:pointer}',
      '.wave68-avatar-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}',
      '.wave68-avatar-btn{padding:12px;border-radius:14px;border:1px solid var(--border,#e5e7eb);background:var(--card,#fff);font-size:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;min-height:70px}',
      '.wave68-avatar-btn.active{outline:2px solid #2563eb;border-color:#2563eb;background:#eef4ff}',
      '.wave68-row{display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.wave68-field{margin-top:10px}',
      '.wave68-field label{display:block;font-size:11px;color:var(--muted,#6b7280);margin-bottom:6px}',
      '.wave68-input{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border,#e5e7eb);background:var(--card,#fff);font:600 13px/1.2 Golos Text,system-ui,sans-serif;color:var(--text,#111827)}',
      '.wave68-qr-wrap{display:grid;grid-template-columns:280px 1fr;gap:16px;align-items:start}',
      '.wave68-qr-box{border:1px solid var(--border,#e5e7eb);border-radius:16px;padding:12px;background:#fff;display:flex;align-items:center;justify-content:center}',
      '.wave68-qr-box img{width:100%;max-width:256px;height:auto;display:block;image-rendering:pixelated}',
      '.wave68-code{width:100%;min-height:120px;border-radius:12px;border:1px solid var(--border,#e5e7eb);padding:10px 12px;font:12px/1.45 JetBrains Mono,monospace;background:var(--bg,#f8fafc);color:var(--text,#111827)}',
      '.wave68-leader{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--border,#e5e7eb);border-radius:14px;background:var(--card,#fff);margin-top:8px}',
      '.wave68-leader-left{display:flex;align-items:center;gap:10px;min-width:0}',
      '.wave68-leader-rank{width:28px;text-align:center;font:900 13px/1 Unbounded,system-ui,sans-serif;color:#2563eb}',
      '.wave68-leader-avatar{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;background:linear-gradient(135deg,#dbeafe,#ede9fe)}',
      '.wave68-leader-name{font-weight:800;font-size:13px;line-height:1.2}',
      '.wave68-leader-sub{font-size:10px;color:var(--muted,#6b7280);margin-top:4px}',
      '.wave68-leader-metric{text-align:right;font-size:11px;color:var(--muted,#6b7280)}',
      '.wave68-toast{position:fixed;left:50%;bottom:calc(102px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(10px);z-index:10008;padding:10px 14px;border-radius:999px;background:rgba(15,23,42,.96);color:#fff;font-size:12px;font-weight:800;opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;max-width:min(92vw,420px);text-align:center;box-shadow:0 12px 28px rgba(0,0,0,.28)}',
      '.wave68-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}',
      '@media (max-width:800px){.wave68-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.wave68-qr-wrap{grid-template-columns:1fr}.wave68-avatar-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}',
      '@media (max-width:520px){.wave68-actions{flex-direction:column}.wave68-btn{min-width:0;flex:1 1 auto}.wave68-avatar-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}'
    ].join('');
    root.document.head.appendChild(style);
  }

  function toast(message){
    if (isNode || !root.document || !message) return;
    ensureStyle();
    var node = root.document.getElementById(TOAST_ID);
    if (!node) {
      node = root.document.createElement('div');
      node.id = TOAST_ID;
      node.className = 'wave68-toast';
      root.document.body.appendChild(node);
    }
    node.textContent = String(message);
    node.className = 'wave68-toast on';
    clearTimeout(node._tid);
    node._tid = setTimeout(function(){ node.className = 'wave68-toast'; }, 1800);
  }

  function overlay(title, subtitle){
    ensureStyle();
    var wrap = root.document.createElement('div');
    wrap.className = 'wave68-overlay';
    wrap.innerHTML = '<div class="wave68-overlay-card"><div class="wave68-overlay-head"><div><div class="wave68-overlay-title">' + esc(title || '') + '</div>' + (subtitle ? '<div class="wave68-sub" style="margin-top:6px">' + esc(subtitle) + '</div>' : '') + '</div><button type="button" class="wave68-close" aria-label="Закрыть">×</button></div><div class="wave68-overlay-body"></div></div>';
    wrap.querySelector('.wave68-close').addEventListener('click', function(){ wrap.remove(); });
    wrap.addEventListener('click', function(ev){ if (ev.target === wrap) wrap.remove(); });
    root.document.body.appendChild(wrap);
    return { wrap: wrap, body: wrap.querySelector('.wave68-overlay-body') };
  }

  function cardHtml(summary, compact){
    summary = buildProfileSummary(summary);
    return '<div class="wave68-card">'
      + '<div class="wave68-head">'
      + '<div style="display:flex;gap:12px;min-width:0"><div class="wave68-avatar">' + esc(summary.avatar.icon) + '</div><div style="min-width:0">'
      + '<div class="wave68-name">' + esc(summary.name) + '</div>'
      + '<div class="wave68-sub">' + esc(summary.rankIcon + ' ' + summary.rankLabel + ' · уровень ' + summary.level + ' · ' + summary.xp + ' XP') + '</div>'
      + '<div class="wave68-sub">Код профиля: <b>' + esc(summary.publicCode) + '</b>' + (summary.tagline ? ' · ' + esc(summary.tagline) : '') + '</div>'
      + '</div></div>'
      + '<div class="wave68-chip">' + (summary.totalAnswers === 0 ? '—' : summary.accuracyPct + '%') + ' точность</div>'
      + '</div>'
      + '<div class="wave68-grid">'
      + '<div class="wave68-kpi"><b>' + summary.totalAnswers + '</b><span>решено вопросов</span></div>'
      + '<div class="wave68-kpi"><b>' + esc(summary.favoriteSubject) + '</b><span>любимый предмет</span></div>'
      + '<div class="wave68-kpi"><b>' + esc(summary.timeLabel) + '</b><span>время в приложении</span></div>'
      + '<div class="wave68-kpi"><b>' + summary.achievementsCount + '</b><span>достижений</span></div>'
      + '</div>'
      + (compact ? '' : '<div class="wave68-badges">'
        + '<span class="wave68-chip">🩺 Диагностик: ' + summary.diagnosticsDone + '</span>'
        + '<span class="wave68-chip">🗺 Тем: ' + summary.topicsCompleted + '</span>'
        + '<span class="wave68-chip">🔥 Лучшая серия: ' + summary.bestStreak + '</span>'
        + '<span class="wave68-chip">✨ Комбо: ' + summary.bestCombo + '</span>'
        + '</div>')
      + '<div class="wave68-badges" style="margin-top:10px">' + recentAchievementsHtml(summary, false) + '</div>'
      + '<div class="wave68-actions">'
      + '<button type="button" class="wave68-btn" data-wave68-action="avatar">🧑 Аватар</button>'
      + '<button type="button" class="wave68-btn" data-wave68-action="qr">📱 QR</button>'
      + '<button type="button" class="wave68-btn" data-wave68-action="png">🖼 PNG</button>'
      + '<button type="button" class="wave68-btn" data-wave68-action="leaders">🏁 Лидеры</button>'
      + '<button type="button" class="wave68-btn accent" data-wave68-action="sync">☁️ Синхр.</button>'
      + '</div>'
      + '</div>';
  }

  function attachActionHandlers(host){
    if (!host) return;
    Array.prototype.slice.call(host.querySelectorAll('[data-wave68-action]')).forEach(function(btn){
      if (btn.__wave68Bound) return;
      btn.__wave68Bound = true;
      btn.addEventListener('click', function(){
        var action = btn.getAttribute('data-wave68-action');
        if (action === 'avatar') openAvatarPicker();
        else if (action === 'qr') showProfileQr();
        else if (action === 'png') downloadProfilePng();
        else if (action === 'leaders') showLeaderboard();
        else if (action === 'sync') syncProfileToCloud().then(function(result){
          if (result.ok) toast('Профиль синхронизирован');
          else if (result.reason === 'private') toast('Сначала выключи приватный режим');
          else if (result.reason === 'no-cloud') toast('Не настроен облачный бин');
          else toast('Не удалось синхронизировать');
        });
      });
    });
  }

  function openAvatarPicker(){
    if (isNode || !root.document) return;
    var state = loadState();
    var ui = overlay('Аватар и подпись', 'Выбери один из 20 аватаров для активного профиля.');
    var summary = buildProfileSummary();
    ui.body.innerHTML = '<div class="wave68-card" style="margin-top:0">'
      + '<div class="wave68-head"><div style="display:flex;gap:12px;align-items:center"><div class="wave68-avatar" id="wave68-avatar-preview">' + esc(summary.avatar.icon) + '</div><div><div class="wave68-name">' + esc(summary.name) + '</div><div class="wave68-sub">Код профиля: <b>' + esc(summary.publicCode) + '</b></div></div></div><div class="wave68-chip">уровень ' + summary.level + '</div></div>'
      + '<div class="wave68-field"><label>Короткая подпись</label><input class="wave68-input" id="wave68-tagline" maxlength="48" placeholder="Например: Готов к рывку" value="' + esc(state.tagline || '') + '"></div>'
      + '<div class="wave68-field"><label>Аватары</label><div class="wave68-avatar-grid" id="wave68-avatar-grid">'
      + AVATARS.map(function(row){ return '<button type="button" class="wave68-avatar-btn' + (row.id === state.avatarId ? ' active' : '') + '" data-avatar-id="' + esc(row.id) + '" aria-label="' + esc(row.label) + '">' + esc(row.icon) + '</button>'; }).join('')
      + '</div></div>'
      + '<div class="wave68-actions"><button type="button" class="wave68-btn accent" id="wave68-save-avatar">Сохранить</button><button type="button" class="wave68-btn" id="wave68-copy-code">Скопировать код</button></div>'
      + '</div>';
    var selected = state.avatarId;
    Array.prototype.slice.call(ui.body.querySelectorAll('[data-avatar-id]')).forEach(function(btn){
      btn.addEventListener('click', function(){
        selected = btn.getAttribute('data-avatar-id') || 'owl';
        Array.prototype.slice.call(ui.body.querySelectorAll('[data-avatar-id]')).forEach(function(node){ node.classList.toggle('active', node === btn); });
        ui.body.querySelector('#wave68-avatar-preview').textContent = avatarById(selected).icon;
      });
    });
    ui.body.querySelector('#wave68-save-avatar').addEventListener('click', function(){
      var next = loadState();
      next.avatarId = selected;
      next.tagline = String(ui.body.querySelector('#wave68-tagline').value || '').trim().slice(0, 48);
      saveState(next);
      refreshUi();
      toast('Профиль обновлён');
      ui.wrap.remove();
    });
    ui.body.querySelector('#wave68-copy-code').addEventListener('click', function(){ copyText(summary.publicCode, 'Код профиля скопирован'); });
  }

  function qrImageSrc(text, size){
    var n = Math.max(160, Math.min(512, toNum(size) || 280));
    return QR_PROVIDER + '?size=' + n + 'x' + n + '&margin=0&data=' + encodeURIComponent(String(text || ''));
  }

  function copyText(text, successMessage){
    if (!text) return;
    if (root.navigator && root.navigator.clipboard && typeof root.navigator.clipboard.writeText === 'function') {
      root.navigator.clipboard.writeText(String(text)).then(function(){ if (successMessage) toast(successMessage); }).catch(function(){ try { root.prompt('Скопируй:', String(text)); } catch (_) {} });
      return;
    }
    try { root.prompt('Скопируй:', String(text)); } catch (_) {}
  }

  function showProfileQr(){
    if (isNode || !root.document) return;
    var summary = buildProfileSummary();
    var link = buildProfileLink(summary);
    var ui = overlay('QR профиля', 'Покажи код другу или открой на другом устройстве для сравнения.');
    ui.body.innerHTML = '<div class="wave68-qr-wrap"><div class="wave68-qr-box"><img alt="QR профиля" src="' + esc(qrImageSrc(link, 280)) + '"></div><div>'
      + '<div class="wave68-card" style="margin-top:0">' + cardHtml(summary, true) + '</div>'
      + '<div class="wave68-field"><label>Ссылка профиля</label><textarea class="wave68-code" readonly>' + esc(link) + '</textarea></div>'
      + '<div class="wave68-actions"><button type="button" class="wave68-btn accent" id="wave68-copy-link">📋 Скопировать ссылку</button><button type="button" class="wave68-btn" id="wave68-copy-code2">🔑 Скопировать код</button></div>'
      + '</div></div>';
    attachActionHandlers(ui.body);
    ui.body.querySelector('#wave68-copy-link').addEventListener('click', function(){
      var state = loadState();
      state.shareCount += 1;
      saveState(state);
      copyText(link, 'Ссылка профиля скопирована');
    });
    ui.body.querySelector('#wave68-copy-code2').addEventListener('click', function(){ copyText(summary.publicCode, 'Код профиля скопирован'); });
  }

  function buildProfilePngCanvas(summary){
    summary = buildProfileSummary(summary);
    if (isNode || !root.document) return null;
    var canvas = root.document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    var grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.arc(1040, 120, 120, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(140, 540, 100, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px Unbounded, sans-serif';
    ctx.fillText(summary.name, 120, 100);
    ctx.font = '700 24px Golos Text, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fillText(summary.rankIcon + ' ' + summary.rankLabel + ' · уровень ' + summary.level + ' · ' + summary.xp + ' XP', 120, 146);

    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    drawRoundRect(ctx, 120, 180, 180, 180, 28);
    ctx.fill();
    ctx.font = '900 108px Apple Color Emoji, Segoe UI Emoji, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(summary.avatar.icon, 210, 300);
    ctx.textAlign = 'left';

    var cards = [
      { x: 340, y: 190, w: 220, h: 110, value: summary.totalAnswers, label: 'решено вопросов' },
      { x: 580, y: 190, w: 220, h: 110, value: summary.accuracyPct + '%', label: 'точность' },
      { x: 820, y: 190, w: 220, h: 110, value: summary.achievementsCount, label: 'достижений' },
      { x: 340, y: 320, w: 220, h: 110, value: summary.favoriteSubject, label: 'любимый предмет' },
      { x: 580, y: 320, w: 220, h: 110, value: summary.timeLabel, label: 'время в приложении' },
      { x: 820, y: 320, w: 220, h: 110, value: summary.bestStreak, label: 'лучшая серия' }
    ];
    cards.forEach(function(card){
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      drawRoundRect(ctx, card.x, card.y, card.w, card.h, 24);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 30px Unbounded, sans-serif';
      ctx.fillText(String(card.value), card.x + 20, card.y + 48);
      ctx.font = '700 16px Golos Text, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      ctx.fillText(card.label, card.x + 20, card.y + 78);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    drawRoundRect(ctx, 120, 470, 920, 100, 24);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px Unbounded, sans-serif';
    ctx.fillText('Профиль ученика · код ' + summary.publicCode, 150, 515);
    ctx.font = '700 18px Golos Text, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    var line = 'Диагностик: ' + summary.diagnosticsDone + ' · тем: ' + summary.topicsCompleted + ' · активных дней: ' + summary.activeDays + ' · неделя побед: ' + summary.weekWins;
    ctx.fillText(line, 150, 550);
    if (summary.recentAchievements && summary.recentAchievements.length) {
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.font = '700 16px Golos Text, sans-serif';
      ctx.fillText('Недавние достижения: ' + summary.recentAchievements.map(function(item){ return (item.icon || '🏆') + ' ' + (item.title || item.id); }).join(' · '), 150, 580);
    }
    return canvas;
  }

  function downloadProfilePng(){
    if (isNode || !root.document) return;
    var summary = buildProfileSummary();
    var canvas = buildProfilePngCanvas(summary);
    if (!canvas) return;
    var state = loadState();
    state.shareCount += 1;
    saveState(state);
    if (canvas.toBlob) {
      canvas.toBlob(function(blob){
        if (!blob) return;
        var fileName = 'trainer_profile_' + summary.publicCode + '.png';
        var file = null;
        try { file = new File([blob], fileName, { type:'image/png' }); } catch (_) {}
        if (root.navigator && root.navigator.share && file && (!root.navigator.canShare || root.navigator.canShare({ files:[file] }))) {
          root.navigator.share({ title:'Профиль ученика', text:'Мой профиль в тренажёре', files:[file] }).catch(function(){ downloadBlob(fileName, blob); });
        } else downloadBlob(fileName, blob);
      }, 'image/png');
    }
  }

  function downloadBlob(fileName, blob){
    if (isNode || !root.document || !blob) return;
    var url = URL.createObjectURL(blob);
    var a = root.document.createElement('a');
    a.href = url;
    a.download = fileName;
    root.document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1200);
  }

  function leaderboardHtml(rows, selfCode){
    rows = sortProfiles(rows).slice(0, CONFIG.maxLeaderboard);
    if (!rows.length) return '<div class="wave68-muted">Лидеров пока нет. Синхронизируй первый профиль и задай темп.</div>';
    return rows.map(function(row, index){
      row = asObj(row);
      var avatar = avatarById(row.avatarId).icon;
      var isSelf = row.code === selfCode;
      return '<div class="wave68-leader"' + (isSelf ? ' style="border-color:#2563eb;box-shadow:0 0 0 1px rgba(37,99,235,.18) inset"' : '') + '>'
        + '<div class="wave68-leader-left"><div class="wave68-leader-rank">' + (index + 1) + '</div><div class="wave68-leader-avatar">' + esc(avatar) + '</div><div style="min-width:0"><div class="wave68-leader-name">' + esc(row.name || 'Ученик') + (isSelf ? ' · это ты' : '') + '</div><div class="wave68-leader-sub">' + esc((row.favoriteSubject || '—') + ' · ' + (row.code || '')) + '</div></div></div>'
        + '<div class="wave68-leader-metric"><b style="display:block;color:var(--text,#111827)">' + toNum(row.xp) + ' XP</b><span>' + toNum(row.accuracyPct) + '% · ' + toNum(row.answers) + ' вопр.</span></div>'
        + '</div>';
    }).join('');
  }

  function showLeaderboard(){
    if (isNode || !root.document) return;
    var summary = buildProfileSummary();
    var ui = overlay('Таблица лидеров', 'Сравнение профилей через npoint.io. Если облако не настроено, показывается локальный кэш.');
    ui.body.innerHTML = '<div class="wave68-card" style="margin-top:0"><div class="wave68-row"><div class="wave68-name">Топ профилей</div><div class="wave68-chip">код ' + esc(summary.publicCode) + '</div></div><div class="wave68-sub">Сортировка: XP → уровень → точность → объём решённых вопросов.</div><div id="wave68-leaderboard-box" style="margin-top:10px">' + leaderboardHtml(localFallbackLeaderboard(summary), summary.publicCode) + '</div><div class="wave68-actions"><button type="button" class="wave68-btn accent" id="wave68-sync-now">Обновить из облака</button><button type="button" class="wave68-btn" id="wave68-copy-self">Скопировать код</button></div></div>';
    ui.body.querySelector('#wave68-copy-self').addEventListener('click', function(){ copyText(summary.publicCode, 'Код профиля скопирован'); });
    ui.body.querySelector('#wave68-sync-now').addEventListener('click', function(){
      syncProfileToCloud().then(function(syncRes){
        var rows = syncRes && syncRes.profiles ? syncRes.profiles : localFallbackLeaderboard(summary);
        ui.body.querySelector('#wave68-leaderboard-box').innerHTML = leaderboardHtml(rows, summary.publicCode);
        toast(syncRes.ok ? 'Лидеры обновлены' : (syncRes.reason === 'private' ? 'Открой публикацию результатов' : 'Показан локальный рейтинг'));
      });
    });
    loadLeaderboard().then(function(res){ ui.body.querySelector('#wave68-leaderboard-box').innerHTML = leaderboardHtml(res.profiles, summary.publicCode); });
  }

  function renderIndexCard(){
    if (isNode || !root.document || root.document.getElementById('s-main')) return;
    var anchor = root.document.getElementById('wave68-index-holder-anchor') || root.document.querySelector('.foot') || root.document.querySelector('.stats');
    if (!anchor) return;
    var holder = root.document.getElementById('wave68-index-holder');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave68-index-holder';
      holder.className = 'wave68-holder';
      anchor.parentNode.insertBefore(holder, anchor);
    }
    holder.innerHTML = cardHtml(buildProfileSummary(), true);
    attachActionHandlers(holder);
  }

  function renderDashboardCard(){
    if (isNode || !root.document || !root.document.getElementById('grades')) return;
    var hero = root.document.querySelector('.hero');
    if (!hero) return;
    var holder = root.document.getElementById('wave68-dashboard-holder');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave68-dashboard-holder';
      holder.className = 'wave68-holder';
      hero.insertAdjacentElement('afterend', holder);
    }
    holder.innerHTML = cardHtml(buildProfileSummary(), false);
    attachActionHandlers(holder);
    var nameEl = root.document.getElementById('name');
    if (nameEl) nameEl.textContent = buildProfileSummary().avatar.icon + ' ' + buildProfileSummary().name;
  }

  function decorateHallOfFame(){
    if (isNode || !root.document) return;
    var overlays = Array.prototype.slice.call(root.document.querySelectorAll('body > div[style*="position:fixed"], body > .wave68-overlay'));
    if (!overlays.length) return;
    var overlay = overlays[overlays.length - 1];
    if (!overlay || overlay.classList.contains('wave68-overlay')) return;
    var card = overlay.firstElementChild;
    if (!card || card.querySelector('.wave68-profile-hof')) return;
    var section = root.document.createElement('div');
    section.className = 'wave68-profile-hof';
    section.innerHTML = '<div class="wave68-card" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.14);color:#fff;box-shadow:none">'
      + '<div class="wave68-head"><div style="display:flex;gap:12px;align-items:center"><div class="wave68-avatar">' + esc(buildProfileSummary().avatar.icon) + '</div><div><div class="wave68-name" style="color:#fff">' + esc(buildProfileSummary().name) + '</div><div class="wave68-sub" style="color:#dbeafe">' + esc(buildProfileSummary().rankIcon + ' ' + buildProfileSummary().rankLabel + ' · код ' + buildProfileSummary().publicCode) + '</div></div></div><div class="wave68-chip dark">' + buildProfileSummary().xp + ' XP</div></div>'
      + '<div class="wave68-grid"><div class="wave68-kpi" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)"><b>' + buildProfileSummary().totalAnswers + '</b><span style="color:#dbeafe">вопросов</span></div><div class="wave68-kpi" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)"><b>' + buildProfileSummary().accuracyPct + '%</b><span style="color:#dbeafe">точность</span></div><div class="wave68-kpi" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)"><b>' + esc(buildProfileSummary().favoriteSubject) + '</b><span style="color:#dbeafe">любимый предмет</span></div><div class="wave68-kpi" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)"><b>' + buildProfileSummary().achievementsCount + '</b><span style="color:#dbeafe">достижений</span></div></div>'
      + '<div class="wave68-actions"><button type="button" class="wave68-btn" data-wave68-action="avatar">🧑 Аватар</button><button type="button" class="wave68-btn" data-wave68-action="qr">📱 QR</button><button type="button" class="wave68-btn" data-wave68-action="leaders">🏁 Лидеры</button><button type="button" class="wave68-btn accent" data-wave68-action="sync">☁️ Синхр.</button></div>'
      + '</div>';
    var anchor = card.querySelector('.wave67-profile-meta') || card.querySelector('.wave66-profile-xp');
    if (anchor && anchor.insertAdjacentElement) anchor.insertAdjacentElement('afterend', section);
    else card.appendChild(section);
    attachActionHandlers(section);
  }

  function patchHallOfFame(){
    if (isNode || !root.showHallOfFame || root.__wave68HallPatched) return;
    var original = root.showHallOfFame;
    root.showHallOfFame = function(){
      var out = original.apply(this, arguments);
      setTimeout(decorateHallOfFame, 0);
      return out;
    };
    root.__wave68HallPatched = true;
  }

  function patchBackup(){
    if (root.getBackupSnapshot && !root.__wave68ProfileBackupGetPatched) {
      var originalGet = root.getBackupSnapshot;
      root.getBackupSnapshot = function(){
        var snap = originalGet.apply(this, arguments);
        try { snap.profileSocialState = loadState(); } catch (_) {}
        return snap;
      };
      root.__wave68ProfileBackupGetPatched = true;
    }
    if (root.applyBackupSnapshot && !root.__wave68ProfileBackupApplyPatched) {
      var originalApply = root.applyBackupSnapshot;
      root.applyBackupSnapshot = function(payload){
        var out = originalApply.apply(this, arguments);
        try { if (payload && payload.profileSocialState) saveState(payload.profileSocialState); } catch (_) {}
        setTimeout(refreshUi, 0);
        return out;
      };
      root.__wave68ProfileBackupApplyPatched = true;
    }
  }

  function parseProfileHash(){
    try {
      var hash = String(root.location.hash || '').replace(/^#/, '');
      if (!hash) return null;
      var parts = hash.split('&');
      for (var i = 0; i < parts.length; i++) {
        var pair = parts[i].split('=');
        if (pair[0] === 'profile') return decodeSnapshot(pair.slice(1).join('='));
      }
    } catch (_) {}
    return null;
  }

  function showSharedProfile(snapshot){
    if (isNode || !root.document || !snapshot) return;
    var local = buildProfileSummary();
    var avatar = avatarById(snapshot.avatarId || 'owl');
    var ui = overlay('Профиль по QR', 'Снимок прогресса можно сравнить с локальным профилем.');
    var localBetter = toNum(local.xp) > toNum(snapshot.xp) ? 'Ты впереди по XP' : (toNum(local.xp) < toNum(snapshot.xp) ? 'Друг впереди по XP' : 'По XP ничья');
    ui.body.innerHTML = '<div class="wave68-card" style="margin-top:0"><div class="wave68-row"><div class="wave68-name">' + esc(snapshot.name || 'Профиль') + '</div><div class="wave68-chip">' + esc(snapshot.code || '') + '</div></div>'
      + '<div class="wave68-head" style="margin-top:10px"><div style="display:flex;gap:12px;align-items:center"><div class="wave68-avatar">' + esc(avatar.icon) + '</div><div><div class="wave68-sub">' + esc((snapshot.rankIcon || '🌱') + ' ' + (snapshot.rank || 'Новичок') + ' · уровень ' + toNum(snapshot.level)) + '</div><div class="wave68-sub">' + esc(toNum(snapshot.xp) + ' XP · ' + toNum((snapshot.stats || {}).accuracyPct) + '% точность') + '</div></div></div><div class="wave68-chip">' + esc(localBetter) + '</div></div>'
      + '<div class="wave68-grid"><div class="wave68-kpi"><b>' + toNum((snapshot.stats || {}).answers) + '</b><span>решено вопросов</span></div><div class="wave68-kpi"><b>' + esc((snapshot.stats || {}).favoriteSubject || '—') + '</b><span>любимый предмет</span></div><div class="wave68-kpi"><b>' + esc((snapshot.stats || {}).timeLabel || '0 мин') + '</b><span>время в приложении</span></div><div class="wave68-kpi"><b>' + toNum((snapshot.stats || {}).achievements) + '</b><span>достижений</span></div></div>'
      + '<div class="wave68-muted" style="margin-top:10px">Снимок создан: ' + esc(new Date(snapshot.generatedAt || Date.now()).toLocaleString('ru-RU')) + '</div></div>';
  }

  function startLiveClock(){
    if (isNode || !root.document) return;
    if (root.document.hidden) return;
    if (liveClockStartedAt > 0 && liveClockProfile === activeProfileId()) return;
    liveClockProfile = activeProfileId();
    liveClockStartedAt = Date.now();
  }

  function stopLiveClock(){
    if (isNode || liveClockStartedAt <= 0) return;
    var state = loadState(liveClockProfile || activeProfileId());
    state.trackedMs += Math.max(0, Date.now() - liveClockStartedAt);
    saveState(state, liveClockProfile || activeProfileId());
    liveClockStartedAt = 0;
    liveClockProfile = '';
  }

  function installTimeTracking(){
    if (isNode || !root.document || root.__wave68TimeTracking) return;
    startLiveClock();
    root.document.addEventListener('visibilitychange', function(){ if (root.document.hidden) stopLiveClock(); else startLiveClock(); });
    root.addEventListener('pagehide', stopLiveClock);
    root.addEventListener('beforeunload', stopLiveClock);
    root.__wave68TimeTracking = true;
  }

  function refreshUi(){
    if (isNode || !root.document) return;
    ensureStyle();
    renderIndexCard();
    renderDashboardCard();
    decorateHallOfFame();
  }

  function init(){
    if (isNode || !root.document) return;
    ensureStyle();
    installTimeTracking();
    patchBackup();
    patchHallOfFame();
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', refreshUi, { once:true });
    else refreshUi();
    root.addEventListener('wave66-xp-updated', function(){ setTimeout(refreshUi, 0); });
    root.addEventListener('wave67-meta-updated', function(){ setTimeout(refreshUi, 0); });
    root.addEventListener('dashboard-state-ready', function(){ setTimeout(renderDashboardCard, 0); });
    setTimeout(function(){ var shared = parseProfileHash(); if (shared) showSharedProfile(shared); }, 50);
  }

  var api = {
    config: CONFIG,
    avatars: AVATARS,
    defaultState: defaultState,
    normalizeState: normalizeState,
    loadState: loadState,
    saveState: saveState,
    buildProfileSummary: buildProfileSummary,
    buildPublicSnapshot: buildPublicSnapshot,
    encodeSnapshot: encodeSnapshot,
    decodeSnapshot: decodeSnapshot,
    buildProfileLink: buildProfileLink,
    publicCodeFor: publicCodeFor,
    leaderboardEntryFromSummary: leaderboardEntryFromSummary,
    sortProfiles: sortProfiles,
    mergeCloudDoc: mergeCloudDoc,
    localFallbackLeaderboard: localFallbackLeaderboard,
    loadLeaderboard: loadLeaderboard,
    syncProfileToCloud: syncProfileToCloud,
    buildProfilePngCanvas: buildProfilePngCanvas,
    openAvatarPicker: openAvatarPicker,
    showProfileQr: showProfileQr,
    showLeaderboard: showLeaderboard,
    refreshUi: refreshUi,
    init: init
  };

  init();
  return api;
});

;/* ---- chunk_roadmap_wave86w_cloud_sync.js ---- */
/* wave86w: optional cross-device cloud sync via Supabase or Firebase REST.
 * Static/offline-first: no SDK, no credentials baked into the build.
 */
(function(){
  'use strict';

  var root = window;
  var VERSION = 'wave86w';
  var CONFIG_KEY = 'trainer_wave86w_sync_config';
  var META_KEY_PREFIX = 'trainer_wave86w_sync_meta_';
  var STYLE_ID = 'wave86w-cloud-sync-style';
  var AUTO_PUSH_DELAY = 1600;
  var autoTimer = null;
  var lastStatus = null;
  var lastRemoteEnvelope = null;

  function isGradePage(){ return /^\/?.*grade\d+_v2\.html(?:$|[?#])/.test(location.pathname) || !!root.GRADE_NUM; }
  function gradeKey(){ return String(root.GRADE_NUM || root.GRADE_NO || (location.pathname.match(/grade(\d+)_v2/) || [,''])[1] || ''); }
  function nowIso(){ return new Date().toISOString(); }
  function toNum(v){ var n = Number(v); return isFinite(n) ? n : 0; }
  function hasFn(fn){ return typeof fn === 'function'; }
  function getName(){ try { return hasFn(root.getPlayerName) ? root.getPlayerName() : (localStorage.getItem('trainer_player_name') || 'Ученик'); } catch(e){ return 'Ученик'; } }
  function getCode(){ try { return hasFn(root.getPlayerCode) ? root.getPlayerCode() : (localStorage.getItem('trainer_player_code') || ''); } catch(e){ return ''; } }
  function setCode(v){ try { if(hasFn(root.setPlayerCode)) root.setPlayerCode(v); else localStorage.setItem('trainer_player_code', v); } catch(e){} }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(ch){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]; }); }
  function normalizeUrl(v){ return String(v || '').trim().replace(/\/+$/, ''); }
  function safeJson(text, fallback){ try { return JSON.parse(text); } catch(e){ return fallback; } }
  function lsGet(key, fallback){ try { var v = localStorage.getItem(key); return v == null ? fallback : v; } catch(e){ return fallback; } }
  function lsSet(key, value){ try { localStorage.setItem(key, value); return true; } catch(e){ return false; } }
  function lsRemove(key){ try { localStorage.removeItem(key); } catch(e){} }
  function metaKey(){ return META_KEY_PREFIX + gradeKey(); }
  function readMeta(){ return safeJson(lsGet(metaKey(), '{}'), {}) || {}; }
  function writeMeta(meta){ lsSet(metaKey(), JSON.stringify(meta || {})); }
  function isPrivate(){ try { return hasFn(root.getPrivateMode) ? !!root.getPrivateMode() : lsGet('trainer_private', '1') !== '0'; } catch(e){ return true; } }

  function randomId(prefix){
    var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var out = prefix || '';
    if(root.crypto && crypto.getRandomValues){
      var buf = new Uint8Array(10);
      crypto.getRandomValues(buf);
      for(var i=0;i<buf.length;i++) out += alphabet[buf[i] % alphabet.length];
      return out;
    }
    for(var j=0;j<10;j++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
  }

  function defaultConfig(){
    var code = getCode();
    if(!code){ code = randomId(''); setCode(code); }
    return {
      enabled: false,
      provider: 'supabase',
      syncId: code,
      autoPush: false,
      autoPull: false,
      deviceId: lsGet('trainer_wave86w_device_id', '') || randomId('dev_'),
      deviceName: lsGet('trainer_wave86w_device_name', '') || defaultDeviceName(),
      supabaseUrl: '',
      supabaseAnonKey: '',
      supabaseTable: 'trainer_sync_snapshots',
      firebaseProjectId: '',
      firebaseApiKey: '',
      firebaseCollection: 'trainer_sync'
    };
  }

  function defaultDeviceName(){
    var ua = (navigator.userAgent || '').toLowerCase();
    if(/iphone|ipad|android/.test(ua)) return 'Телефон';
    if(/mac|win|linux/.test(ua)) return 'Компьютер';
    return 'Устройство';
  }

  function externalConfig(){
    var cfg = root.TRAINER_SYNC_CONFIG || root.trainerSyncConfig || null;
    if(!cfg || typeof cfg !== 'object') return {};
    return {
      enabled: cfg.enabled,
      provider: cfg.provider,
      syncId: cfg.syncId,
      autoPush: cfg.autoPush,
      autoPull: cfg.autoPull,
      deviceName: cfg.deviceName,
      supabaseUrl: cfg.supabaseUrl || cfg.url,
      supabaseAnonKey: cfg.supabaseAnonKey || cfg.anonKey,
      supabaseTable: cfg.supabaseTable || cfg.table,
      firebaseProjectId: cfg.firebaseProjectId || cfg.projectId,
      firebaseApiKey: cfg.firebaseApiKey || cfg.apiKey,
      firebaseCollection: cfg.firebaseCollection || cfg.collection
    };
  }

  function readConfig(){
    var base = defaultConfig();
    var saved = safeJson(lsGet(CONFIG_KEY, '{}'), {}) || {};
    var ext = externalConfig();
    var cfg = Object.assign(base, saved, ext);
    cfg.provider = cfg.provider === 'firebase' ? 'firebase' : 'supabase';
    cfg.syncId = String(cfg.syncId || base.syncId || '').trim() || randomId('');
    cfg.deviceId = String(cfg.deviceId || base.deviceId || randomId('dev_'));
    cfg.deviceName = String(cfg.deviceName || base.deviceName || defaultDeviceName()).trim() || defaultDeviceName();
    cfg.supabaseUrl = normalizeUrl(cfg.supabaseUrl);
    cfg.supabaseAnonKey = String(cfg.supabaseAnonKey || '').trim();
    cfg.supabaseTable = String(cfg.supabaseTable || 'trainer_sync_snapshots').trim() || 'trainer_sync_snapshots';
    cfg.firebaseProjectId = String(cfg.firebaseProjectId || '').trim();
    cfg.firebaseApiKey = String(cfg.firebaseApiKey || '').trim();
    cfg.firebaseCollection = String(cfg.firebaseCollection || 'trainer_sync').trim() || 'trainer_sync';
    lsSet('trainer_wave86w_device_id', cfg.deviceId);
    lsSet('trainer_wave86w_device_name', cfg.deviceName);
    return cfg;
  }

  function saveConfig(cfg){
    var clean = Object.assign(readConfig(), cfg || {});
    clean.provider = clean.provider === 'firebase' ? 'firebase' : 'supabase';
    clean.syncId = String(clean.syncId || '').trim();
    clean.deviceName = String(clean.deviceName || '').trim() || defaultDeviceName();
    clean.supabaseUrl = normalizeUrl(clean.supabaseUrl);
    clean.supabaseAnonKey = String(clean.supabaseAnonKey || '').trim();
    clean.supabaseTable = String(clean.supabaseTable || 'trainer_sync_snapshots').trim() || 'trainer_sync_snapshots';
    clean.firebaseProjectId = String(clean.firebaseProjectId || '').trim();
    clean.firebaseApiKey = String(clean.firebaseApiKey || '').trim();
    clean.firebaseCollection = String(clean.firebaseCollection || 'trainer_sync').trim() || 'trainer_sync';
    lsSet('trainer_wave86w_device_name', clean.deviceName);
    lsSet(CONFIG_KEY, JSON.stringify(clean));
    return clean;
  }

  function validateConfig(cfg){
    if(!cfg.syncId) throw new Error('Укажи sync-код. Его нужно ввести на втором устройстве.');
    if(cfg.provider === 'supabase'){
      if(!cfg.supabaseUrl || !/^https:\/\/.+\.supabase\.co$/i.test(cfg.supabaseUrl)) throw new Error('Для Supabase нужен URL вида https://xxxx.supabase.co');
      if(!cfg.supabaseAnonKey) throw new Error('Для Supabase нужен anon public key.');
      if(!cfg.supabaseTable) throw new Error('Укажи имя таблицы Supabase.');
      return true;
    }
    if(!cfg.firebaseProjectId) throw new Error('Для Firebase нужен projectId.');
    if(!cfg.firebaseApiKey) throw new Error('Для Firebase нужен Web API key.');
    if(!cfg.firebaseCollection) throw new Error('Укажи коллекцию Firestore.');
    return true;
  }

  function stableStringify(value){
    if(value === null || typeof value !== 'object') return JSON.stringify(value);
    if(Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    return '{' + Object.keys(value).sort().map(function(key){ return JSON.stringify(key) + ':' + stableStringify(value[key]); }).join(',') + '}';
  }

  function snapshotForChecksum(snapshot){
    var clone = JSON.parse(JSON.stringify(snapshot || {}));
    delete clone.exportedAt;
    delete clone.__wave86wCloud;
    return clone;
  }

  async function checksum(value){
    var text = stableStringify(snapshotForChecksum(value));
    if(root.crypto && crypto.subtle && root.TextEncoder){
      try {
        var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.prototype.map.call(new Uint8Array(buf), function(b){ return b.toString(16).padStart(2, '0'); }).join('');
      } catch(e){}
    }
    var h1 = 0x811c9dc5;
    for(var i=0;i<text.length;i++){ h1 ^= text.charCodeAt(i); h1 = Math.imul(h1, 0x01000193); }
    return ('00000000' + (h1 >>> 0).toString(16)).slice(-8);
  }

  function buildSnapshot(){
    if(!hasFn(root.getBackupSnapshot)) throw new Error('Backup API ещё не загружен. Открой страницу класса ещё раз.');
    var snap = root.getBackupSnapshot();
    if(!snap || snap.app !== 'trainer') throw new Error('Backup snapshot не создан.');
    return snap;
  }

  async function buildEnvelope(cfg){
    var snap = buildSnapshot();
    var sum = await checksum(snap);
    var now = nowIso();
    snap.__wave86wCloud = {
      version: VERSION,
      syncId: cfg.syncId,
      provider: cfg.provider,
      deviceId: cfg.deviceId,
      deviceName: cfg.deviceName,
      updatedAt: now,
      checksum: sum
    };
    return {
      app: 'trainer',
      format: 'cloud-sync-envelope',
      version: 1,
      wave: VERSION,
      syncId: cfg.syncId,
      grade: gradeKey(),
      playerName: getName(),
      playerCode: getCode(),
      provider: cfg.provider,
      deviceId: cfg.deviceId,
      deviceName: cfg.deviceName,
      updatedAt: now,
      updatedTs: Date.now(),
      checksum: sum,
      snapshot: snap
    };
  }

  function recordId(cfg){ return String(cfg.syncId || '').trim() + '-grade-' + gradeKey(); }

  function fetchJson(url, opts, timeoutMs){
    timeoutMs = timeoutMs || 12000;
    var ctrl = new AbortController();
    var timer = setTimeout(function(){ try { ctrl.abort(); } catch(e){} }, timeoutMs);
    opts = opts || {};
    opts.signal = ctrl.signal;
    return fetch(url, opts).then(async function(res){
      var text = await res.text().catch(function(){ return ''; });
      var body = text ? safeJson(text, text) : null;
      clearTimeout(timer);
      if(!res.ok){
        var msg = (body && (body.message || body.error || body.hint)) || text || ('HTTP ' + res.status);
        throw new Error(msg);
      }
      return body;
    }).catch(function(err){ clearTimeout(timer); throw err; });
  }

  function supabaseHeaders(cfg, prefer){
    var h = {
      'apikey': cfg.supabaseAnonKey,
      'Authorization': 'Bearer ' + cfg.supabaseAnonKey,
      'Content-Type': 'application/json'
    };
    if(prefer) h.Prefer = prefer;
    return h;
  }

  function supabaseBase(cfg){ return cfg.supabaseUrl + '/rest/v1/' + encodeURIComponent(cfg.supabaseTable); }

  async function supabasePush(cfg, envelope){
    var body = {
      id: recordId(cfg),
      sync_id: cfg.syncId,
      grade: gradeKey(),
      updated_at: envelope.updatedAt,
      checksum: envelope.checksum,
      payload: envelope
    };
    var url = supabaseBase(cfg);
    var data = await fetchJson(url, {
      method: 'POST',
      headers: supabaseHeaders(cfg, 'resolution=merge-duplicates,return=representation'),
      body: JSON.stringify(body)
    });
    return Array.isArray(data) && data[0] && data[0].payload ? data[0].payload : envelope;
  }

  async function supabasePull(cfg){
    var url = supabaseBase(cfg) + '?id=eq.' + encodeURIComponent(recordId(cfg)) + '&select=id,updated_at,checksum,payload&limit=1';
    var data = await fetchJson(url, { method: 'GET', headers: supabaseHeaders(cfg) });
    var row = Array.isArray(data) ? data[0] : null;
    return row && row.payload ? normalizeEnvelope(row.payload) : null;
  }

  function firebaseUrl(cfg){
    var doc = encodeURIComponent(recordId(cfg));
    var url = 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(cfg.firebaseProjectId) + '/databases/(default)/documents/' + encodeURIComponent(cfg.firebaseCollection) + '/' + doc;
    return cfg.firebaseApiKey ? url + '?key=' + encodeURIComponent(cfg.firebaseApiKey) : url;
  }

  function firebaseDoc(envelope){
    return { fields: {
      syncId: { stringValue: String(envelope.syncId || '') },
      grade: { stringValue: String(envelope.grade || '') },
      updatedAt: { timestampValue: envelope.updatedAt },
      updatedTs: { integerValue: String(envelope.updatedTs || Date.now()) },
      checksum: { stringValue: String(envelope.checksum || '') },
      payloadJson: { stringValue: JSON.stringify(envelope) }
    }};
  }

  function parseFirebaseDoc(doc){
    if(!doc || !doc.fields || !doc.fields.payloadJson) return null;
    var text = doc.fields.payloadJson.stringValue || '';
    return normalizeEnvelope(safeJson(text, null));
  }

  async function firebasePush(cfg, envelope){
    var doc = await fetchJson(firebaseUrl(cfg), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firebaseDoc(envelope))
    });
    return parseFirebaseDoc(doc) || envelope;
  }

  async function firebasePull(cfg){
    try { return parseFirebaseDoc(await fetchJson(firebaseUrl(cfg), { method: 'GET' })); }
    catch(e){ if(String(e && e.message || '').indexOf('NOT_FOUND') >= 0 || String(e && e.message || '').indexOf('404') >= 0) return null; throw e; }
  }

  function normalizeEnvelope(env){
    if(!env || typeof env !== 'object') return null;
    if(env.format === 'cloud-sync-envelope' && env.snapshot && env.snapshot.app === 'trainer') return env;
    if(env.app === 'trainer' && env.format === 'grade-backup'){
      return {
        app: 'trainer', format: 'cloud-sync-envelope', version: 1, wave: VERSION,
        syncId: '', grade: String(env.grade || gradeKey()), playerName: env.player && env.player.name || 'Ученик',
        playerCode: env.player && env.player.code || '', provider: 'unknown', deviceId: '', deviceName: 'Импорт',
        updatedAt: env.exportedAt || nowIso(), updatedTs: Date.parse(env.exportedAt || '') || Date.now(), checksum: '', snapshot: env
      };
    }
    return null;
  }

  async function adapterPush(cfg, env){
    return cfg.provider === 'firebase' ? firebasePush(cfg, env) : supabasePush(cfg, env);
  }
  async function adapterPull(cfg){
    return cfg.provider === 'firebase' ? firebasePull(cfg) : supabasePull(cfg);
  }

  function summarizeSnapshot(snapshot){
    var str = snapshot && snapshot.streak || {};
    var daily = snapshot && snapshot.daily || {};
    var progress = snapshot && snapshot.progress || {};
    var topics = 0;
    try { Object.keys(progress).forEach(function(sid){ topics += Object.keys(progress[sid] || {}).length; }); } catch(e){}
    return {
      totalQs: toNum(str.totalQs),
      totalOk: toNum(str.totalOk),
      current: toNum(str.current),
      best: toNum(str.best),
      today: toNum(daily.ok) + toNum(daily.err),
      topics: topics,
      exportedAt: snapshot && snapshot.exportedAt || ''
    };
  }

  function statusText(env){
    if(!env) return 'В облаке пока нет копии для этого класса.';
    var s = summarizeSnapshot(env.snapshot || {});
    var pct = s.totalQs ? Math.round(s.totalOk / s.totalQs * 100) : 0;
    return 'Облако: ' + (env.playerName || 'Ученик') + ' · ' + s.totalQs + ' вопросов · ' + pct + '% · ' + (env.updatedAt || 'без даты');
  }

  async function pushNow(reason){
    var cfg = readConfig();
    validateConfig(cfg);
    if(isPrivate()) throw new Error('Включён приватный режим. Отключи его в профиле, чтобы отправлять данные в облако.');
    var env = await buildEnvelope(cfg);
    var saved = normalizeEnvelope(await adapterPush(cfg, env)) || env;
    var meta = readMeta();
    meta.lastPushAt = nowIso();
    meta.lastChecksum = env.checksum;
    meta.lastProvider = cfg.provider;
    meta.lastReason = reason || 'manual';
    meta.lastRemoteAt = saved.updatedAt || env.updatedAt;
    writeMeta(meta);
    lastStatus = '✅ Сохранено в облако: ' + env.updatedAt;
    lastRemoteEnvelope = saved;
    return saved;
  }

  async function pullRemote(){
    var cfg = readConfig();
    validateConfig(cfg);
    var env = normalizeEnvelope(await adapterPull(cfg));
    lastRemoteEnvelope = env;
    return env;
  }

  async function applyRemote(env){
    env = normalizeEnvelope(env || lastRemoteEnvelope);
    if(!env || !env.snapshot) throw new Error('В облаке нет копии для восстановления.');
    if(String(env.snapshot.grade || env.grade || '') !== gradeKey()) throw new Error('Копия относится к другому классу.');
    if(!hasFn(root.applyBackupSnapshot)) throw new Error('Restore API ещё не загружен.');
    var ok = root.applyBackupSnapshot(env.snapshot);
    var meta = readMeta();
    meta.lastPullAt = nowIso();
    meta.lastRemoteAt = env.updatedAt || '';
    meta.lastChecksum = env.checksum || '';
    writeMeta(meta);
    lastStatus = '✅ Восстановлено из облака: ' + (env.updatedAt || 'без даты');
    return ok;
  }

  function canAutoPush(){
    var cfg = readConfig();
    return !!(cfg.enabled && cfg.autoPush && (cfg.supabaseUrl || cfg.firebaseProjectId));
  }

  function scheduleAutoPush(reason){
    if(!canAutoPush() || isPrivate()) return;
    clearTimeout(autoTimer);
    autoTimer = setTimeout(function(){ pushNow(reason || 'auto').catch(function(err){ lastStatus = '⚠️ Автосинхронизация: ' + (err && err.message || err); }); }, AUTO_PUSH_DELAY);
  }

  function installHooks(){
    if(root.__wave86wCloudHooksInstalled) return;
    root.__wave86wCloudHooksInstalled = true;
    var oldEnd = root.endSession;
    if(hasFn(oldEnd)){
      root.endSession = function(){
        var result = oldEnd.apply(this, arguments);
        scheduleAutoPush('endSession');
        return result;
      };
    }
    var oldApply = root.applyBackupSnapshot;
    if(hasFn(oldApply)){
      root.applyBackupSnapshot = function(){
        var result = oldApply.apply(this, arguments);
        setTimeout(function(){ try { injectButtons(); } catch(e){} }, 120);
        return result;
      };
    }
    var oldCloudSave = root.cloudSave;
    if(hasFn(oldCloudSave)){
      root.cloudSave = function(){
        var ret;
        try { ret = oldCloudSave.apply(this, arguments); } finally { scheduleAutoPush('cloudSave'); }
        return ret;
      };
    }
    document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'hidden') scheduleAutoPush('visibility'); });
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave86w-cloud-btn{border-color:#0ea5e9!important;color:#0369a1!important}',
      '.wave86w-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10020;display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto}',
      '.wave86w-card{background:var(--card,#fff);color:var(--text,var(--ink,#1a1a2e));border:1px solid var(--border,#e5e7eb);border-radius:18px;padding:20px;max-width:560px;width:100%;box-shadow:0 18px 42px rgba(0,0,0,.25);max-height:92vh;overflow:auto}',
      '.wave86w-title{font-family:Unbounded,system-ui,sans-serif;font-size:17px;font-weight:900;margin:0 0 6px;text-align:center}',
      '.wave86w-sub{font-size:12px;color:var(--muted,#6b7280);line-height:1.5;text-align:center;margin:0 0 14px}',
      '.wave86w-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
      '.wave86w-field{display:flex;flex-direction:column;gap:4px;margin-bottom:8px}',
      '.wave86w-field label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--muted,#6b7280)}',
      '.wave86w-field input,.wave86w-field select{width:100%;padding:10px;border:1px solid var(--border,#e5e7eb);border-radius:10px;background:var(--bg,#fff);color:var(--text,var(--ink,#111827));font:12px Golos Text,system-ui,sans-serif}',
      '.wave86w-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}',
      '.wave86w-btn{flex:1;min-width:135px;border:1px solid var(--border,#e5e7eb);border-radius:10px;background:var(--bg,#f8fafc);color:var(--text,#111827);font-weight:800;font-size:12px;padding:10px;cursor:pointer;font-family:Golos Text,system-ui,sans-serif}',
      '.wave86w-btn.primary{background:#0ea5e9;color:#fff;border-color:#0ea5e9}',
      '.wave86w-btn.danger{background:#fee2e2;color:#b91c1c;border-color:#fecaca}',
      '.wave86w-note{font-size:11px;color:var(--muted,#6b7280);line-height:1.5;margin-top:10px}',
      '.wave86w-status{background:var(--abg,#f3f4f6);border-radius:12px;padding:12px;font-size:12px;line-height:1.5;margin-top:10px;white-space:pre-wrap}',
      '.wave86w-provider{border:1px solid var(--border,#e5e7eb);border-radius:12px;padding:10px;margin-top:8px}',
      '.wave86w-hide{display:none!important}',
      '@media(max-width:560px){.wave86w-grid{grid-template-columns:1fr}.wave86w-btn{min-width:100%}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function field(id, label, value, type, placeholder){
    return '<div class="wave86w-field"><label for="' + id + '">' + esc(label) + '</label><input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(value || '') + '" placeholder="' + esc(placeholder || '') + '"></div>';
  }

  function providerPanel(cfg){
    return '<div class="wave86w-provider" id="wave86w-supabase-panel">' +
      '<div class="wave86w-grid">' +
      field('wave86w-supabase-url', 'Supabase URL', cfg.supabaseUrl, 'url', 'https://xxxx.supabase.co') +
      field('wave86w-supabase-key', 'Supabase anon key', cfg.supabaseAnonKey, 'password', 'eyJ...') +
      '</div>' + field('wave86w-supabase-table', 'Таблица', cfg.supabaseTable, 'text', 'trainer_sync_snapshots') +
      '<div class="wave86w-note">Таблица должна иметь поля: <b>id</b> text primary key, <b>sync_id</b> text, <b>grade</b> text, <b>updated_at</b> timestamptz, <b>checksum</b> text, <b>payload</b> jsonb.</div>' +
      '</div>' +
      '<div class="wave86w-provider" id="wave86w-firebase-panel">' +
      '<div class="wave86w-grid">' +
      field('wave86w-firebase-project', 'Firebase projectId', cfg.firebaseProjectId, 'text', 'my-project') +
      field('wave86w-firebase-key', 'Firebase Web API key', cfg.firebaseApiKey, 'password', 'AIza...') +
      '</div>' + field('wave86w-firebase-collection', 'Firestore collection', cfg.firebaseCollection, 'text', 'trainer_sync') +
      '<div class="wave86w-note">Используется Firestore REST. Документ: <code>syncId-grade-N</code>, payload хранится строкой JSON в поле <code>payloadJson</code>.</div>' +
      '</div>';
  }

  function readForm(){
    var cfg = readConfig();
    function val(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; }
    function checked(id){ var el = document.getElementById(id); return !!(el && el.checked); }
    cfg.enabled = checked('wave86w-enabled');
    cfg.provider = val('wave86w-provider') === 'firebase' ? 'firebase' : 'supabase';
    cfg.syncId = val('wave86w-sync-id') || cfg.syncId;
    cfg.deviceName = val('wave86w-device-name') || cfg.deviceName;
    cfg.autoPush = checked('wave86w-auto-push');
    cfg.autoPull = checked('wave86w-auto-pull');
    cfg.supabaseUrl = val('wave86w-supabase-url');
    cfg.supabaseAnonKey = val('wave86w-supabase-key');
    cfg.supabaseTable = val('wave86w-supabase-table') || 'trainer_sync_snapshots';
    cfg.firebaseProjectId = val('wave86w-firebase-project');
    cfg.firebaseApiKey = val('wave86w-firebase-key');
    cfg.firebaseCollection = val('wave86w-firebase-collection') || 'trainer_sync';
    return saveConfig(cfg);
  }

  function refreshProviderPanels(){
    var provider = (document.getElementById('wave86w-provider') || {}).value || 'supabase';
    var supa = document.getElementById('wave86w-supabase-panel');
    var fire = document.getElementById('wave86w-firebase-panel');
    if(supa) supa.classList.toggle('wave86w-hide', provider !== 'supabase');
    if(fire) fire.classList.toggle('wave86w-hide', provider !== 'firebase');
  }

  function setStatus(text, kind){
    var box = document.getElementById('wave86w-status');
    if(!box) return;
    box.textContent = text || '';
    box.style.color = kind === 'error' ? '#b91c1c' : kind === 'ok' ? '#166534' : '';
  }

  function localStatusLine(){
    var snap = null;
    try { snap = buildSnapshot(); } catch(e){}
    if(!snap) return 'Локально: backup API ещё не готов.';
    var s = summarizeSnapshot(snap);
    var pct = s.totalQs ? Math.round(toNum(s.totalOk) / s.totalQs * 100) : 0;
    return 'Локально: ' + getName() + ' · ' + s.totalQs + ' вопросов · ' + pct + '% · ' + gradeKey() + ' класс';
  }

  function renderCloudModal(){
    ensureStyle();
    var cfg = readConfig();
    var meta = readMeta();
    var overlay = document.createElement('div');
    overlay.className = 'wave86w-overlay';
    overlay.addEventListener('click', function(ev){ if(ev.target === overlay) overlay.remove(); });
    var card = document.createElement('div');
    card.className = 'wave86w-card';
    card.addEventListener('click', function(ev){ ev.stopPropagation(); });
    card.innerHTML =
      '<h3 class="wave86w-title">☁️ Синхронизация между устройствами</h3>' +
      '<p class="wave86w-sub">F2: ручная и опциональная авто-синхронизация текущего класса через Supabase или Firebase. Данные остаются в твоём проекте, без SDK и без внешнего backend в сборке.</p>' +
      '<div class="wave86w-grid">' +
      '<div class="wave86w-field"><label for="wave86w-provider">Провайдер</label><select id="wave86w-provider"><option value="supabase">Supabase REST</option><option value="firebase">Firebase Firestore REST</option></select></div>' +
      field('wave86w-sync-id', 'Sync-код', cfg.syncId, 'text', 'один и тот же на устройствах') +
      field('wave86w-device-name', 'Имя устройства', cfg.deviceName, 'text', 'Телефон / ноутбук') +
      '<div class="wave86w-field"><label>Режим</label><label style="font-size:12px;text-transform:none;letter-spacing:0;font-weight:700;color:inherit"><input id="wave86w-enabled" type="checkbox" ' + (cfg.enabled ? 'checked' : '') + '> включить sync</label><label style="font-size:12px;text-transform:none;letter-spacing:0;font-weight:700;color:inherit"><input id="wave86w-auto-push" type="checkbox" ' + (cfg.autoPush ? 'checked' : '') + '> автосохранение после тренировки</label><label style="font-size:12px;text-transform:none;letter-spacing:0;font-weight:700;color:inherit"><input id="wave86w-auto-pull" type="checkbox" ' + (cfg.autoPull ? 'checked' : '') + '> проверять облако при входе</label></div>' +
      '</div>' + providerPanel(cfg) +
      '<div class="wave86w-actions">' +
      '<button class="wave86w-btn" id="wave86w-save">💾 Сохранить настройки</button>' +
      '<button class="wave86w-btn" id="wave86w-copy">📋 Копировать sync-код</button>' +
      '<button class="wave86w-btn primary" id="wave86w-push">⬆️ Отправить в облако</button>' +
      '<button class="wave86w-btn" id="wave86w-check">🔎 Проверить облако</button>' +
      '<button class="wave86w-btn" id="wave86w-pull">⬇️ Восстановить из облака</button>' +
      '<button class="wave86w-btn danger" id="wave86w-clear">🧹 Сбросить настройки</button>' +
      '<button class="wave86w-btn" id="wave86w-close">Закрыть</button>' +
      '</div>' +
      '<div class="wave86w-status" id="wave86w-status"></div>' +
      '<div class="wave86w-note">Для второго устройства: открой тот же класс, введи тот же sync-код и те же параметры Supabase/Firebase, затем нажми «Восстановить из облака». Приватный режим блокирует отправку, но не блокирует ручное восстановление.</div>';
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    var provider = document.getElementById('wave86w-provider');
    if(provider) provider.value = cfg.provider;
    refreshProviderPanels();
    if(provider) provider.addEventListener('change', refreshProviderPanels);
    setStatus(localStatusLine() + '\n' + (lastStatus || '') + (meta.lastPushAt ? '\nПоследний push: ' + meta.lastPushAt : '') + (meta.lastPullAt ? '\nПоследний pull: ' + meta.lastPullAt : ''));

    document.getElementById('wave86w-save').addEventListener('click', function(){
      try { var saved = readForm(); validateConfig(saved); setStatus('✅ Настройки сохранены.\n' + localStatusLine(), 'ok'); }
      catch(e){ setStatus('⚠️ ' + (e && e.message || e), 'error'); }
    });
    document.getElementById('wave86w-copy').addEventListener('click', async function(){
      var code = (document.getElementById('wave86w-sync-id') || {}).value || readConfig().syncId;
      try { await navigator.clipboard.writeText(code); setStatus('✅ Sync-код скопирован: ' + code, 'ok'); }
      catch(e){ setStatus('Sync-код: ' + code); }
    });
    document.getElementById('wave86w-push').addEventListener('click', async function(){
      try { var cfgNow = readForm(); validateConfig(cfgNow); setStatus('Отправляю snapshot в облако…'); var env = await pushNow('manual'); setStatus('✅ Snapshot отправлен.\n' + statusText(env) + '\n' + localStatusLine(), 'ok'); }
      catch(e){ setStatus('⚠️ ' + (e && e.message || e), 'error'); }
    });
    document.getElementById('wave86w-check').addEventListener('click', async function(){
      try { var cfgNow = readForm(); validateConfig(cfgNow); setStatus('Проверяю облако…'); var env = await pullRemote(); setStatus(statusText(env) + '\n' + localStatusLine(), env ? 'ok' : ''); }
      catch(e){ setStatus('⚠️ ' + (e && e.message || e), 'error'); }
    });
    document.getElementById('wave86w-pull').addEventListener('click', async function(){
      try {
        var cfgNow = readForm(); validateConfig(cfgNow); setStatus('Загружаю snapshot из облака…');
        var env = lastRemoteEnvelope || await pullRemote();
        if(!env){ setStatus('В облаке пока нет snapshot для этого sync-кода и класса.'); return; }
        var msg = statusText(env) + '\n\nЛокальные данные текущего класса будут заменены облачной копией. Продолжить?';
        if(!confirm(msg)){ setStatus('Восстановление отменено.\n' + statusText(env)); return; }
        await applyRemote(env);
        setStatus('✅ Восстановлено. Обновляю экран…\n' + statusText(env), 'ok');
        setTimeout(function(){ try { if(hasFn(root.refreshMain)) root.refreshMain(); if(hasFn(root.renderProg)) root.renderProg(); } catch(e){} }, 120);
      } catch(e){ setStatus('⚠️ ' + (e && e.message || e), 'error'); }
    });
    document.getElementById('wave86w-clear').addEventListener('click', function(){
      if(!confirm('Удалить локальные настройки синхронизации? Прогресс не будет удалён.')) return;
      lsRemove(CONFIG_KEY); lsRemove(metaKey()); lastRemoteEnvelope = null; lastStatus = null;
      overlay.remove(); renderCloudModal();
    });
    document.getElementById('wave86w-close').addEventListener('click', function(){ overlay.remove(); });
    return overlay;
  }

  function injectButtons(){
    if(!isGradePage() || !document.body) return;
    ensureStyle();
    if(!document.getElementById('wave86w-main-cloud-btn')){
      var backupBtn = Array.prototype.find.call(document.querySelectorAll('button'), function(btn){ return /showBackupModal/.test(btn.getAttribute('data-wave86u-on-click') || '') || /Резервная копия/.test(btn.textContent || ''); });
      var row = backupBtn && backupBtn.parentElement;
      if(row){
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'wave86w-main-cloud-btn';
        btn.className = 'btn btn-o wave86w-cloud-btn';
        btn.style.flex = '1';
        btn.textContent = '☁️ Синхронизация';
        btn.addEventListener('click', renderCloudModal);
        if(row.children.length >= 2){
          var newRow = document.createElement('div');
          newRow.style.cssText = 'display:flex;gap:8px;margin-bottom:8px';
          newRow.appendChild(btn);
          row.parentNode.insertBefore(newRow, row.nextSibling);
        } else {
          row.appendChild(btn);
        }
      }
    }
    if(!document.getElementById('wave86w-profile-cloud-btn')){
      var player = document.getElementById('player-badge');
      if(player){
        var small = document.createElement('button');
        small.type = 'button';
        small.id = 'wave86w-profile-cloud-btn';
        small.className = 'wave86w-cloud-btn';
        small.style.cssText = 'margin-top:6px;border:1px solid #0ea5e9;border-radius:999px;background:transparent;padding:5px 10px;font-size:10px;font-weight:800;cursor:pointer;font-family:Golos Text,sans-serif';
        small.textContent = '☁ sync';
        small.addEventListener('click', renderCloudModal);
        player.appendChild(document.createElement('br'));
        player.appendChild(small);
      }
    }
  }

  function enhanceBackupOverlay(){
    var old = root.showBackupModal;
    if(!hasFn(old) || root.__wave86wBackupModalPatched) return;
    root.__wave86wBackupModalPatched = true;
    root.showBackupModal = function(){
      var result = old.apply(this, arguments);
      setTimeout(function(){
        try {
          var body = document.querySelector('.wave29-body');
          if(!body || document.getElementById('wave86w-backup-cloud-section')) return;
          ensureStyle();
          var section = document.createElement('div');
          section.className = 'wave29-section';
          section.id = 'wave86w-backup-cloud-section';
          section.innerHTML = '<h4>Облако</h4><div class="wave29-note" style="margin-top:4px">Синхронизация текущего класса через Supabase/Firebase поверх этого backup snapshot.</div>';
          var actions = document.createElement('div');
          actions.className = 'wave29-actions wave29-no-print';
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'wave29-btn accent';
          btn.textContent = '☁️ Открыть синхронизацию';
          btn.addEventListener('click', renderCloudModal);
          actions.appendChild(btn);
          section.appendChild(actions);
          body.appendChild(section);
        } catch(e){}
      }, 80);
      return result;
    };
  }

  async function autoPullOnBoot(){
    var cfg = readConfig();
    if(!cfg.enabled || !cfg.autoPull) return;
    try {
      validateConfig(cfg);
      var env = await pullRemote();
      if(!env) return;
      var meta = readMeta();
      if(meta.lastRemoteAt === env.updatedAt || meta.lastChecksum === env.checksum) return;
      lastRemoteEnvelope = env;
      showIncomingRemoteBanner(env);
    } catch(e){ lastStatus = '⚠️ Auto-pull: ' + (e && e.message || e); }
  }

  function showIncomingRemoteBanner(env){
    if(document.getElementById('wave86w-remote-banner')) return;
    ensureStyle();
    var box = document.createElement('div');
    box.id = 'wave86w-remote-banner';
    box.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0));z-index:10010;max-width:560px;margin:auto;background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:14px;padding:12px;box-shadow:0 10px 28px rgba(0,0,0,.2);font-size:12px;line-height:1.45;color:var(--text,#111827)';
    var text = document.createElement('div');
    text.textContent = statusText(env);
    var actions = document.createElement('div');
    actions.className = 'wave86w-actions';
    var open = document.createElement('button'); open.className = 'wave86w-btn primary'; open.textContent = 'Открыть sync'; open.addEventListener('click', function(){ box.remove(); renderCloudModal(); });
    var close = document.createElement('button'); close.className = 'wave86w-btn'; close.textContent = 'Позже'; close.addEventListener('click', function(){ box.remove(); });
    actions.appendChild(open); actions.appendChild(close); box.appendChild(text); box.appendChild(actions); document.body.appendChild(box);
  }

  function init(){
    if(!isGradePage()) return;
    installHooks();
    enhanceBackupOverlay();
    injectButtons();
    setTimeout(injectButtons, 250);
    setTimeout(injectButtons, 900);
    setTimeout(autoPullOnBoot, 1200);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  root.wave86wCloudSync = {
    version: VERSION,
    readConfig: readConfig,
    saveConfig: saveConfig,
    buildSnapshot: buildSnapshot,
    buildEnvelope: buildEnvelope,
    pushNow: pushNow,
    pullRemote: pullRemote,
    applyRemote: applyRemote,
    open: renderCloudModal,
    auditSnapshot: async function(){
      var cfg = readConfig();
      var snap = null;
      var sum = '';
      try { snap = buildSnapshot(); sum = await checksum(snap); } catch(e){}
      return {
        version: VERSION,
        grade: gradeKey(),
        provider: cfg.provider,
        enabled: !!cfg.enabled,
        hasSupabaseUrl: !!cfg.supabaseUrl,
        hasSupabaseKey: !!cfg.supabaseAnonKey,
        hasFirebaseProject: !!cfg.firebaseProjectId,
        hasFirebaseKey: !!cfg.firebaseApiKey,
        syncId: cfg.syncId ? 'set' : '',
        snapshotReady: !!snap,
        checksum: sum,
        hasPush: typeof pushNow === 'function',
        hasPull: typeof pullRemote === 'function',
        buttonPresent: !!document.getElementById('wave86w-main-cloud-btn'),
        backupPatched: !!root.__wave86wBackupModalPatched,
        cspInlineSafe: true
      };
    }
  };
})();

;window.__wave87nGradeRuntimeServicesBundle = Object.freeze({wave:'wave87n', role:'services', bundled:["bundle_sharing.js","bundle_profile_social.js","chunk_roadmap_wave86w_cloud_sync.js"], generatedAt:'2026-04-23T00:00:00Z'});
