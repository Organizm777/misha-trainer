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
//# sourceMappingURL=bundle_sharing.75450d41f8.js.map
