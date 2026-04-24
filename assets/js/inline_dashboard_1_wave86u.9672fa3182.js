
const GRADES = [
  {n:1, nm:'1 класс', ic:'🌱', color:'#f59e0b', bg:'#fef3c7', file:'grade1_v2.html'},
  {n:2, nm:'2 класс', ic:'🌿', color:'#f97316', bg:'#fff7ed', file:'grade2_v2.html'},
  {n:3, nm:'3 класс', ic:'🎒', color:'#16a34a', bg:'#dcfce7', file:'grade3_v2.html'},
  {n:4, nm:'4 класс', ic:'📘', color:'#2563eb', bg:'#dbeafe', file:'grade4_v2.html'},
  {n:5, nm:'5 класс', ic:'📗', color:'#0d9488', bg:'#ccfbf1', file:'grade5_v2.html'},
  {n:6, nm:'6 класс', ic:'📙', color:'#ea580c', bg:'#fff7ed', file:'grade6_v2.html'},
  {n:7, nm:'7 класс', ic:'📕', color:'#dc2626', bg:'#fee2e2', file:'grade7_v2.html'},
  {n:8, nm:'8 класс', ic:'🔬', color:'#7c3aed', bg:'#ede9fe', file:'grade8_v2.html'},
  {n:9, nm:'9 класс', ic:'🧪', color:'#0d9488', bg:'#ccfbf1', file:'grade9_v2.html'},
  {n:10, nm:'10 класс', ic:'🎓', color:'#2563eb', bg:'#dbeafe', file:'grade10_v2.html'},
  {n:11, nm:'11 класс', ic:'🏆', color:'#7c3aed', bg:'#ede9fe', file:'grade11_v2.html'},
];

function getKey(type, gradeNum) {
  return `trainer_${type}_${gradeNum}`;
}

function safeJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function readGradeJSON(gradeNum, type, fallback) {
  const currentKey = getKey(type, gradeNum);
  const current = safeJSON(currentKey, '__missing__');
  if (current !== '__missing__') return current;
  if (gradeNum <= 7) return safeJSON(`m${gradeNum}_${type}`, fallback);
  return fallback;
}

function getLastDays(count) {
  const days = [];
  const base = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function mergeActivityForGrade(gradeNum) {
  const hist = readGradeJSON(gradeNum, 'activity', []);
  const daily = readGradeJSON(gradeNum, 'daily', null);
  const map = {};
  if (Array.isArray(hist)) {
    hist.forEach(row => {
      if (!row || !row.date) return;
      map[row.date] = {
        total: Number(row.total || (Number(row.ok || 0) + Number(row.err || 0))) || 0,
        ok: Number(row.ok || 0) || 0,
        err: Number(row.err || 0) || 0,
      };
    });
  }
  if (daily && daily.date) {
    map[daily.date] = {
      total: Number(daily.ok || 0) + Number(daily.err || 0),
      ok: Number(daily.ok || 0),
      err: Number(daily.err || 0),
    };
  }
  return map;
}

function renderActivity(activityMap) {
  const el = document.getElementById('activity');
  const days = getLastDays(14);
  const rows = days.map(date => ({ date, ...(activityMap[date] || { total: 0, ok: 0, err: 0 }) }));
  const max = Math.max(10, ...rows.map(r => r.total || 0));
  const total7 = rows.slice(-7).reduce((sum, r) => sum + (r.total || 0), 0);
  const activeDays = rows.filter(r => (r.total || 0) > 0).length;
  const bestDay = rows.reduce((best, r) => (r.total || 0) > (best.total || 0) ? r : best, { total: 0, date: '' });

  if (rows.every(r => !r.total)) {
    el.innerHTML = '<div class="empty">Пока мало истории занятий. После новых сессий здесь появится живая лента активности.</div>';
    return;
  }

  const bars = rows.map(r => {
    const pct = r.total ? Math.round((r.ok || 0) / r.total * 100) : 0;
    const h = r.total ? Math.max(12, Math.round(r.total / max * 100)) : 6;
    const color = !r.total ? 'var(--border)' : pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--orange)' : 'var(--accent)';
    const lbl = new Date(r.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace(' ', ' ');
    const val = r.total ? r.total : '·';
    const title = `${lbl}: ${r.total} задач${r.total ? `, ${pct}% точность` : ''}`;
    return `
      <div class="activity-col" title="${title}">
        <div class="activity-val">${val}</div>
        <div class="activity-bar" style="height:${h}px;background:${color}"></div>
        <div class="activity-lbl">${new Date(r.date).toLocaleDateString('ru-RU', { day: 'numeric' })}</div>
      </div>`;
  }).join('');

  const bestLabel = bestDay.total ? new Date(bestDay.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : '—';
  el.innerHTML = `
    <div class="activity-card fade">
      <div class="activity-head">
        <div>
          <div class="activity-title">Последние две недели</div>
          <div class="activity-sub">Каждый столбик — все задачи за день по всем классам</div>
        </div>
        <div class="activity-meta">
          7 дней: <b>${total7}</b><br>
          Активных дней: <b>${activeDays}</b>
        </div>
      </div>
      <div class="activity-bars">${bars}</div>
      <div class="activity-meta">Лучший день: <b>${bestLabel}</b>${bestDay.total ? ` · ${bestDay.total} задач` : ''}</div>
    </div>`;
}

function buildDashboardReport(state) {
  const today = new Date().toLocaleDateString('ru-RU');
  const lines = [
    `📊 Родительская панель — ${state.name}`,
    `📅 ${today}`,
    '━━━━━━━━━━━━━━━',
    `🔢 Всего задач: ${state.totalQs}`,
    `🎯 Точность: ${state.totalPct}`,
    `🔥 Рекорд серии: ${state.bestStreak}`,
    `📆 Активных дней: ${state.totalDays}`,
  ];
  if (state.last7Total) lines.push(`🗓 За 7 дней: ${state.last7Total} задач`);
  if (state.analytics) {
    lines.push(`📆 За 30 дней: ${state.analytics.last30Total} задач, ${state.analytics.last30Active} активных дней`);
    lines.push(`🧠 Тем начато: ${state.analytics.subjectSummary.topicsStarted}, сильных: ${state.analytics.subjectSummary.strongTopics}`);
    if (state.analytics.subjectSummary.best) lines.push(`🏅 Лучший предмет: ${state.analytics.subjectSummary.best.label} (${state.analytics.subjectSummary.best.acc}%)`);
    if (state.analytics.subjectSummary.weakest) lines.push(`🎯 Зона роста: ${state.analytics.subjectSummary.weakest.label} (${state.analytics.subjectSummary.weakest.acc}%)`);
  }
  lines.push('━━━━━━━━━━━━━━━', 'По классам:');
  state.gradeData.forEach(d => {
    const line = d.qs > 0
      ? `${d.grade.ic} ${d.grade.nm}: ${d.pct}% · ${d.qs} задач · ${d.doneDays} дн.`
      : `${d.grade.ic} ${d.grade.nm}: ещё не начат`;
    lines.push(line);
  });
  if (state.weak.length) {
    lines.push('━━━━━━━━━━━━━━━', 'Слабые темы:');
    state.weak.slice(0, 8).forEach(([topic, count]) => {
      lines.push(`• ${topic}: ${count} ош.`);
    });
  }
  return lines.join('\n');
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function downloadDashboardReport() {
  if (!window._dashboardState) return;
  const today = new Date().toISOString().slice(0, 10);
  const text = buildDashboardReport(window._dashboardState);
  downloadTextFile(`roditelskaya-panel_${today}.txt`, text);
}

function init() {
  const name = localStorage.getItem('trainer_player_name') || 'Ученик';
  document.getElementById('name').textContent = name;

  let totalQs = 0;
  let totalOk = 0;
  let bestStreak = 0;
  let totalDays = 0;
  const activeDaySet = new Set();
  const allWeakTopics = {};
  const gradeData = [];
  const activityMap = {};

  GRADES.forEach(g => {
    const streak = readGradeJSON(g.n, 'streak', {totalQs:0, totalOk:0, best:0, totalDone:0});
    const journal = readGradeJSON(g.n, 'journal', []);
    const progress = readGradeJSON(g.n, 'progress', {});
    const datesMap = readGradeJSON(g.n, 'dates', {});
    const activity = mergeActivityForGrade(g.n);

    Object.entries(activity).forEach(([date, row]) => {
      if (!activityMap[date]) activityMap[date] = { total: 0, ok: 0, err: 0 };
      activityMap[date].total += Number(row.total || 0);
      activityMap[date].ok += Number(row.ok || 0);
      activityMap[date].err += Number(row.err || 0);
      if (Number(row.total || 0) > 0) activeDaySet.add(date);
    });

    const qs = streak.totalQs || 0;
    const ok = streak.totalOk || 0;
    const pct = qs > 0 ? Math.round(ok / qs * 100) : -1;
    const doneDays = streak.totalDone || 0;
    const plannedDates = datesMap && typeof datesMap === 'object' ? Object.keys(datesMap).length : 0;

    totalQs += qs;
    totalOk += ok;
    if ((streak.best || 0) > bestStreak) bestStreak = streak.best;

    (Array.isArray(journal) ? journal : []).forEach(j => {
      const key = `${g.nm}: ${j.tag || '?'}`;
      allWeakTopics[key] = (allWeakTopics[key] || 0) + 1;
    });

    gradeData.push({grade: g, qs, ok, pct, doneDays, plannedDates, streak, progress, journal, activity});
  });

  totalDays = activeDaySet.size;
  const totalPctText = totalQs > 0 ? Math.round(totalOk / totalQs * 100) + '%' : '—';
  document.getElementById('total-q').textContent = totalQs.toLocaleString();
  document.getElementById('total-pct').textContent = totalPctText;
  document.getElementById('total-streak').textContent = bestStreak;
  document.getElementById('total-days').textContent = totalDays;

  const rank = totalQs >= 5000 ? '🏅 Гроссмейстер' :
               totalQs >= 2000 ? '🥇 Эксперт' :
               totalQs >= 1000 ? '🏅 Мастер' :
               totalQs >= 500 ? '🧠 Знаток' :
               totalQs >= 100 ? '📚 Ученик' : '🌱 Новичок';
  document.getElementById('rank').textContent = rank + ' · ' + totalQs + ' задач за всё время';

  const container = document.getElementById('grades');
  gradeData.forEach((d, i) => {
    const g = d.grade;
    const card = document.createElement('a');
    card.href = g.file;
    card.className = 'grade-card fade';
    card.style.animationDelay = (0.1 + i * 0.04) + 's';

    const pctColor = d.pct >= 80 ? 'var(--green)' : d.pct >= 50 ? 'var(--orange)' : d.pct >= 0 ? 'var(--red)' : 'var(--muted)';
    const barWidth = d.qs > 0 ? Math.min(100, d.pct) : 0;
    const subline = d.qs > 0
      ? `${d.qs} задач · ${d.doneDays} дн.${d.plannedDates ? ` · ${d.plannedDates} дат` : ''}`
      : 'ещё не начат';

    card.innerHTML = `
      <div class="grade-ic" style="background:${g.bg};color:${g.color}">${g.ic}</div>
      <div class="grade-info">
        <div class="grade-nm">${g.nm}</div>
        <div class="grade-sub">${subline}</div>
        <div class="bar"><div class="bar-fill" style="width:${barWidth}%;background:${pctColor}"></div></div>
      </div>
      <div class="grade-stats">
        <div class="grade-pct" style="color:${pctColor}">${d.pct >= 0 ? d.pct + '%' : '—'}</div>
        <div class="grade-cnt">${d.qs > 0 ? '🔥' + (d.streak.best || 0) : ''}</div>
      </div>
    `;
    container.appendChild(card);
  });

  const weakContainer = document.getElementById('weak');
  const sortedWeak = Object.entries(allWeakTopics).sort((a, b) => b[1] - a[1]);
  if (sortedWeak.length === 0) {
    weakContainer.innerHTML = '<div class="empty">Ошибок пока нет — отлично!</div>';
  } else {
    sortedWeak.slice(0, 10).forEach(([topic, count]) => {
      const color = count >= 5 ? 'var(--red)' : count >= 3 ? 'var(--orange)' : 'var(--muted)';
      const div = document.createElement('div');
      div.className = 'weak';
      div.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
        <span class="weak-tag">${topic}</span>
        <span class="weak-cnt" style="color:${color};font-weight:800">${count} ош.</span>
      </div>`;
      weakContainer.appendChild(div);
    });
  }

  renderActivity(activityMap);
  const last7Total = getLastDays(7).reduce((sum, date) => sum + Number((activityMap[date] || {}).total || 0), 0);
  window._dashboardState = {
    name,
    totalQs,
    totalPct: totalPctText,
    bestStreak,
    totalDays,
    last7Total,
    gradeData,
    weak: sortedWeak,
    activityMap,
    generatedAt: Date.now(),
  };
  try{ window.dispatchEvent(new CustomEvent('dashboard-state-ready', { detail: window._dashboardState })); }catch(e){}
}


function bindDashboardAction(action, handler){
  document.querySelectorAll('[data-wave87r-action="'+action+'"]').forEach(el=>{
    if(el.__wave87rDashboardBound) return;
    el.__wave87rDashboardBound = true;
    el.addEventListener('click', event=>{
      event.preventDefault();
      handler(event);
    });
  });
}

function bindDashboardActions(){
  bindDashboardAction('dashboard-report', ()=>downloadDashboardReport());
  bindDashboardAction('dashboard-csv', ()=>downloadDashboardCSV());
  bindDashboardAction('dashboard-png', ()=>downloadDashboardPNG());
  bindDashboardAction('print', ()=>window.print && window.print());
}

bindDashboardActions();
init();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{})}
