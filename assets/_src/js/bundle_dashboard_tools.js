/* --- wave22_dashboard.js --- */
(function(){
  const SUBJECT_LABELS = {
    math:'Математика', alg:'Алгебра', prob:'Вероятность', rus:'Русский язык', soc:'Обществознание', inf:'Информатика',
    phy:'Физика', his:'История', bio:'Биология', chem:'Химия', eng:'Английский', geog:'География', lit:'Литература',
    art:'История искусств', oly:'Олимпиада', geo:'Геометрия', okr:'Окружающий мир', world:'Окружающий мир', litread:'Литературное чтение',
    geo5:'География', geo6:'География'
  };

  const SUBJECT_COLORS = {
    'Математика':'#f59e0b','Алгебра':'#dc2626','Вероятность':'#f97316','Русский язык':'#0d9488','Обществознание':'#7c3aed',
    'Информатика':'#2563eb','Физика':'#dc2626','История':'#ca8a04','Биология':'#16a34a','Химия':'#16a34a','Английский':'#2563eb',
    'География':'#0284c7','Литература':'#9333ea','История искусств':'#a855f7','Олимпиада':'#b45309','Геометрия':'#ea580c',
    'Окружающий мир':'#16a34a','Литературное чтение':'#7c3aed'
  };

  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function sum(arr, fn){
    return (arr || []).reduce((acc, item) => acc + Number(fn ? fn(item) : item || 0), 0);
  }

  function toNum(v){ return Number(v || 0) || 0; }
  function pct(ok, total){ return total > 0 ? Math.round(ok / total * 100) : 0; }
  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function fmtPct(v){ return Number.isFinite(v) ? Math.round(v) + '%' : '—'; }
  function shortLabel(s, max){ s = String(s || ''); return s.length > max ? s.slice(0, max - 1) + '…' : s; }
  function subjLabel(id){ return SUBJECT_LABELS[id] || id; }
  function subjColor(label){ return SUBJECT_COLORS[label] || '#2563eb'; }

  function getLastDates(count){
    const out = [];
    const now = new Date();
    for(let i=count-1;i>=0;i--){
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      out.push(d.toISOString().slice(0,10));
    }
    return out;
  }

  function weekBuckets(activityMap, weeks){
    const dates = getLastDates(weeks * 7);
    const buckets = [];
    for(let i=0;i<weeks;i++){
      const slice = dates.slice(i*7, i*7 + 7);
      const rows = slice.map(date => ({ date, ...(activityMap[date] || { total: 0, ok: 0, err: 0 }) }));
      const total = sum(rows, r => r.total);
      const ok = sum(rows, r => r.ok);
      const err = sum(rows, r => r.err);
      const start = new Date(slice[0]);
      buckets.push({
        label: start.toLocaleDateString('ru-RU', { day:'numeric', month:'short' }).replace(' ', ' '),
        total, ok, err, acc: total ? Math.round(ok / total * 100) : 0,
      });
    }
    return buckets;
  }

  function monthBuckets(activityMap, months){
    const now = new Date();
    const list = [];
    for(let i=months-1;i>=0;i--){
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0,7);
      list.push({ key, label: d.toLocaleDateString('ru-RU', { month:'short' }).replace('.', '') });
    }
    list.forEach(row => {
      let total = 0, ok = 0, err = 0;
      Object.keys(activityMap || {}).forEach(date => {
        if(date.slice(0,7) !== row.key) return;
        const item = activityMap[date] || {};
        total += toNum(item.total);
        ok += toNum(item.ok);
        err += toNum(item.err);
      });
      row.total = total;
      row.ok = ok;
      row.err = err;
      row.acc = total ? Math.round(ok / total * 100) : 0;
    });
    return list;
  }

  function heatCells(activityMap, weeks){
    const dates = getLastDates(weeks * 7);
    return dates.map(date => ({
      date,
      total: toNum((activityMap[date] || {}).total),
      ok: toNum((activityMap[date] || {}).ok),
      err: toNum((activityMap[date] || {}).err),
      dow: new Date(date).getDay(),
    }));
  }

  function colorLevel(value, max){
    if(!value) return 'var(--border)';
    const ratio = max > 0 ? value / max : 0;
    if(ratio < 0.25) return 'rgba(37,99,235,.28)';
    if(ratio < 0.5) return 'rgba(37,99,235,.45)';
    if(ratio < 0.75) return 'rgba(22,163,74,.55)';
    return 'rgba(22,163,74,.82)';
  }

  function summarizeSubjects(state){
    const subjects = {};
    let topicsStarted = 0;
    let strongTopics = 0;
    let weakTopics = 0;

    (state.gradeData || []).forEach(gd => {
      const progress = gd.progress || {};
      Object.keys(progress).forEach(subjectId => {
        const label = subjLabel(subjectId);
        const bucket = subjects[label] || (subjects[label] = {
          id: subjectId,
          label,
          color: subjColor(label),
          ok: 0,
          err: 0,
          qs: 0,
          topicsStarted: 0,
          mastered: 0,
          weak: 0,
          grades: new Set(),
        });
        bucket.grades.add(gd.grade.nm.replace(' класс', ''));
        const topics = progress[subjectId] || {};
        Object.keys(topics).forEach(topicId => {
          const row = topics[topicId] || {};
          const ok = toNum(row.ok);
          const err = toNum(row.err);
          const total = ok + err;
          if(!total) return;
          const acc = pct(ok, total);
          bucket.ok += ok;
          bucket.err += err;
          bucket.qs += total;
          bucket.topicsStarted += 1;
          topicsStarted += 1;
          if(total >= 3 && acc >= 80){ bucket.mastered += 1; strongTopics += 1; }
          if(total >= 3 && acc < 60){ bucket.weak += 1; weakTopics += 1; }
        });
      });
    });

    const list = Object.values(subjects).map(row => ({
      ...row,
      grades: Array.from(row.grades).sort((a,b) => Number(a) - Number(b)),
      acc: row.qs ? Math.round(row.ok / row.qs * 100) : 0,
    })).filter(row => row.qs > 0).sort((a,b) => b.qs - a.qs || b.acc - a.acc || a.label.localeCompare(b.label, 'ru'));

    return {
      list,
      topicsStarted,
      strongTopics,
      weakTopics,
      depthPct: topicsStarted ? Math.round(strongTopics / topicsStarted * 100) : 0,
      best: list[0] || null,
      weakest: list.slice().sort((a,b) => a.acc - b.acc || b.qs - a.qs)[0] || null,
    };
  }

  function ensureAnalytics(state){
    if(state.analytics && state.analytics._stamp === state.generatedAt) return state.analytics;
    const activityMap = state.activityMap || {};
    const subjectSummary = summarizeSubjects(state);
    const days30 = getLastDates(30);
    const last30Total = sum(days30, d => toNum((activityMap[d] || {}).total));
    const last30Active = days30.filter(d => toNum((activityMap[d] || {}).total) > 0).length;
    const heat = heatCells(activityMap, 26);
    const weeks = weekBuckets(activityMap, 12);
    const months = monthBuckets(activityMap, 6);
    const lastWeek = weeks[weeks.length - 1] || { total: 0, acc: 0 };
    const prevWeek = weeks[weeks.length - 2] || { total: 0, acc: 0 };
    const accDelta = lastWeek.acc - prevWeek.acc;
    const volumeDelta = lastWeek.total - prevWeek.total;
    state.analytics = {
      _stamp: state.generatedAt,
      subjectSummary,
      last30Total,
      last30Active,
      heat,
      weeks,
      months,
      accDelta,
      volumeDelta,
    };
    return state.analytics;
  }

  function renderInsights(state){
    const el = document.getElementById('wave22-insights');
    if(!el) return;
    const data = ensureAnalytics(state);
    const best = data.subjectSummary.best;
    const weakest = data.subjectSummary.weakest;
    el.innerHTML = `
      <div class="analytics-grid fade">
        <div class="analytics-card">
          <div class="analytics-k">30 дней</div>
          <div class="analytics-v">${data.last30Total}</div>
          <div class="analytics-sub">${data.last30Active} активных дней за месяц</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-k">Тем начато</div>
          <div class="analytics-v">${data.subjectSummary.topicsStarted}</div>
          <div class="analytics-sub">Сильных тем: ${data.subjectSummary.strongTopics}</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-k">Глубина знаний</div>
          <div class="analytics-v">${data.subjectSummary.depthPct}%</div>
          <div class="analytics-sub">Тем с уверенным уровнем ≥80%</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-k">Лучший предмет</div>
          <div class="analytics-v">${best ? fmtPct(best.acc) : '—'}</div>
          <div class="analytics-sub">${best ? esc(best.label) : 'Пока мало данных'}</div>
        </div>
      </div>
      <div class="analytics-note fade">
        <b>Зона роста:</b> ${weakest ? `${esc(weakest.label)} · ${fmtPct(weakest.acc)} при ${weakest.qs} задачах` : 'пока рано определять'}<br>
        <b>Неделя к неделе:</b> ${data.accDelta === 0 ? 'точность без изменений' : `точность ${data.accDelta > 0 ? 'выросла' : 'снизилась'} на ${Math.abs(data.accDelta)} п.п.`} · объём ${data.volumeDelta === 0 ? 'без изменений' : `${data.volumeDelta > 0 ? '+' : ''}${data.volumeDelta} задач`}
      </div>`;
  }

  function renderHeatmap(state){
    const el = document.getElementById('wave22-heatmap');
    if(!el) return;
    const data = ensureAnalytics(state);
    const cells = data.heat || [];
    if(!cells.some(c => c.total > 0)){
      el.innerHTML = '<div class="chart-card"><div class="chart-empty">Пока мало накопленной истории. После новых занятий здесь появится карта активности за недели.</div></div>';
      return;
    }
    const max = Math.max(1, ...cells.map(c => c.total));
    const weeks = [];
    for(let i=0;i<cells.length;i+=7) weeks.push(cells.slice(i, i + 7));
    const html = weeks.map(week => `
      <div class="heat-week">${week.map(cell => {
        const date = new Date(cell.date);
        const label = date.toLocaleDateString('ru-RU', { day:'numeric', month:'short' }).replace(' ', ' ');
        const accuracy = cell.total ? `, ${pct(cell.ok, cell.total)}%` : '';
        return `<div class="heat-cell" style="background:${colorLevel(cell.total, max)}" title="${label}: ${cell.total} задач${accuracy}"></div>`;
      }).join('')}</div>`).join('');
    el.innerHTML = `
      <div class="chart-card fade">
        <div class="chart-head">
          <div>
            <div class="chart-title">26 недель подряд</div>
            <div class="chart-sub">GitHub-style карта по всем классам вместе</div>
          </div>
          <div class="chart-meta">Всего дней в истории: <b>${cells.filter(c => c.total > 0).length}</b></div>
        </div>
        <div class="heat-wrap"><div class="heat-cols">${html}</div></div>
        <div class="heat-legend">
          <span>Меньше активности</span>
          <div class="heat-legend-scale">
            <span style="background:var(--border)"></span>
            <span style="background:rgba(37,99,235,.28)"></span>
            <span style="background:rgba(37,99,235,.45)"></span>
            <span style="background:rgba(22,163,74,.55)"></span>
            <span style="background:rgba(22,163,74,.82)"></span>
          </div>
          <span>Больше активности</span>
        </div>
      </div>`;
  }

  function radarSvg(subjects){
    const width = 340, height = 250, cx = 170, cy = 120, r = 88;
    const n = subjects.length;
    const grid = [20, 40, 60, 80, 100].map(level => {
      const pts = subjects.map((_, i) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * i / n);
        const rr = r * (level / 100);
        return `${(cx + Math.cos(angle) * rr).toFixed(1)},${(cy + Math.sin(angle) * rr).toFixed(1)}`;
      }).join(' ');
      return `<polygon points="${pts}" fill="none" stroke="var(--border)" stroke-width="1" opacity="${level === 100 ? 1 : .6}"></polygon>`;
    }).join('');

    const axes = subjects.map((subj, i) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i / n);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      const lx = cx + Math.cos(angle) * (r + 18);
      const ly = cy + Math.sin(angle) * (r + 18);
      const anchor = lx < cx - 10 ? 'end' : lx > cx + 10 ? 'start' : 'middle';
      return `
        <line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--border)" stroke-width="1"></line>
        <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" fill="var(--muted)" font-size="10">${esc(shortLabel(subj.label, 14))}</text>`;
    }).join('');

    const points = subjects.map((subj, i) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i / n);
      const rr = r * clamp(subj.acc, 0, 100) / 100;
      return {
        x: cx + Math.cos(angle) * rr,
        y: cy + Math.sin(angle) * rr,
        color: subj.color,
      };
    });

    const polygon = `<polygon points="${points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" fill="rgba(37,99,235,.18)" stroke="#2563eb" stroke-width="2"></polygon>`;
    const dots = points.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${p.color}"></circle>`).join('');

    return `<svg class="chart-svg" role="img" focusable="false" viewBox="0 0 ${width} ${height}" aria-labelledby="wave22-radar-svg-title"><title id="wave22-radar-svg-title">Радар по предметам</title>${grid}${axes}${polygon}${dots}</svg>`;
  }

  function renderRadar(state){
    const el = document.getElementById('wave22-radar');
    if(!el) return;
    const subjects = ensureAnalytics(state).subjectSummary.list.slice(0, 8);
    if(subjects.length < 3){
      el.innerHTML = '<div class="chart-card"><div class="chart-empty">Для предметного профиля нужно хотя бы несколько начатых предметов.</div></div>';
      return;
    }
    const legend = subjects.map(subj => `
      <span class="legend-pill"><span class="legend-dot" style="background:${subj.color}"></span>${esc(subj.label)} · ${fmtPct(subj.acc)} · ${subj.qs}</span>`).join('');
    el.innerHTML = `
      <div class="chart-card fade">
        <div class="chart-head">
          <div>
            <div class="chart-title">Топ предметов по активности</div>
            <div class="chart-sub">Длина луча = точность, в легенде — объём решённых задач</div>
          </div>
          <div class="chart-meta">Предметов в профиле: <b>${ensureAnalytics(state).subjectSummary.list.length}</b></div>
        </div>
        ${radarSvg(subjects)}
        <div class="legend-row">${legend}</div>
      </div>`;
  }

  function trendSvg(weeks){
    const width = 340, height = 185, left = 22, top = 14, chartW = 300, chartH = 118;
    const maxTotal = Math.max(1, ...weeks.map(w => w.total));
    const step = chartW / Math.max(1, weeks.length - 1);
    const points = weeks.map((w, i) => {
      const x = left + i * step;
      const y = top + (1 - clamp(w.acc, 0, 100) / 100) * chartH;
      return { x, y, total: w.total, label: w.label, acc: w.acc };
    });
    const poly = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const grid = [0,25,50,75,100].map(level => {
      const y = top + (1 - level / 100) * chartH;
      return `<line x1="${left}" y1="${y.toFixed(1)}" x2="${(left + chartW).toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--border)" stroke-width="1"></line><text x="0" y="${(y+3).toFixed(1)}" fill="var(--muted)" font-size="9">${level}</text>`;
    }).join('');
    const bars = weeks.map((w, i) => {
      const x = left + i * step - 8;
      const h = w.total ? Math.max(4, (w.total / maxTotal) * 56) : 2;
      const y = top + chartH - h;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="16" height="${h.toFixed(1)}" rx="4" fill="rgba(37,99,235,.18)"></rect>`;
    }).join('');
    const dots = points.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="#2563eb"></circle>`).join('');
    const labels = weeks.map((w, i) => {
      const x = left + i * step;
      return `<text x="${x.toFixed(1)}" y="${(top + chartH + 16).toFixed(1)}" text-anchor="middle" fill="var(--muted)" font-size="9">${esc(w.label)}</text>`;
    }).join('');
    return `<svg class="chart-svg" role="img" focusable="false" viewBox="0 0 ${width} ${height}" aria-labelledby="wave22-trend-svg-title"><title id="wave22-trend-svg-title">Тренд за 12 недель</title>${grid}${bars}<polyline points="${poly}" fill="none" stroke="#2563eb" stroke-width="2.5"></polyline>${dots}${labels}</svg>`;
  }

  function renderTrend(state){
    const el = document.getElementById('wave22-trend');
    if(!el) return;
    const data = ensureAnalytics(state);
    const weeks = data.weeks;
    if(!weeks.some(w => w.total > 0)){
      el.innerHTML = '<div class="chart-card"><div class="chart-empty">Ещё мало недельной истории для построения тренда.</div></div>';
      return;
    }
    const last = weeks[weeks.length - 1] || { total: 0, acc: 0 };
    const months = data.months.map(row => `<span class="month-chip">${esc(row.label)} · ${row.total} задач · ${fmtPct(row.acc)}</span>`).join('');
    el.innerHTML = `
      <div class="chart-card fade">
        <div class="chart-head">
          <div>
            <div class="chart-title">Точность и объём</div>
            <div class="chart-sub">Синие столбики — задачи, линия — средняя точность по неделям</div>
          </div>
          <div class="chart-meta">Последняя неделя: <b>${last.total}</b> задач · <b>${fmtPct(last.acc)}</b></div>
        </div>
        ${trendSvg(weeks)}
        <div class="month-chips">${months}</div>
      </div>`;
  }

  function renderSubjects(state){
    const el = document.getElementById('wave22-subjects');
    if(!el) return;
    const subjects = ensureAnalytics(state).subjectSummary.list;
    if(!subjects.length){
      el.innerHTML = '<div class="chart-card"><div class="chart-empty">Предметный разбор появится после первых решённых задач.</div></div>';
      return;
    }
    el.innerHTML = `<div class="subject-stack fade">${subjects.map(subj => {
      const fill = clamp(subj.acc, 0, 100);
      return `
        <div class="subject-card">
          <div class="subject-head">
            <div>
              <div class="subject-name">${esc(subj.label)}</div>
              <div class="subject-meta">${subj.qs} задач · ${subj.topicsStarted} тем начато · классы: ${subj.grades.map(g => esc(g)).join(', ')}</div>
            </div>
            <div class="subject-pct" style="color:${subj.color}">${fmtPct(subj.acc)}</div>
          </div>
          <div class="subject-bar"><div class="subject-fill" style="width:${fill}%;background:${subj.color}"></div></div>
          <div class="subject-mini">
            <div><b>${subj.topicsStarted}</b><span>Начато тем</span></div>
            <div><b>${subj.mastered}</b><span>Сильных</span></div>
            <div><b>${subj.weak}</b><span>Зон роста</span></div>
            <div><b>${subj.qs}</b><span>Всего задач</span></div>
          </div>
          <div class="subject-chips">${subj.grades.map(g => `<span class="subject-chip">${esc(g)} класс</span>`).join('')}</div>
        </div>`;
    }).join('')}</div>`;
  }

  function csvEscape(value){
    const s = String(value == null ? '' : value).replace(/"/g, '""');
    return /[",\n;]/.test(s) ? `"${s}"` : s;
  }

  function download(filename, blob){
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 700);
  }

  function buildCSV(state){
    const data = ensureAnalytics(state);
    const lines = ['type,date_or_subject,total,ok,err,accuracy,extra'];
    Object.keys(state.activityMap || {}).sort().forEach(date => {
      const row = state.activityMap[date] || {};
      lines.push(['activity', date, toNum(row.total), toNum(row.ok), toNum(row.err), pct(toNum(row.ok), toNum(row.total)), ''].map(csvEscape).join(','));
    });
    data.subjectSummary.list.forEach(subj => {
      lines.push(['subject', subj.label, subj.qs, subj.ok, subj.err, subj.acc, `topics=${subj.topicsStarted};strong=${subj.mastered};weak=${subj.weak};grades=${subj.grades.join('|')}`].map(csvEscape).join(','));
    });
    return lines.join('\n');
  }

  function roundRect(ctx, x, y, w, h, r){
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawMetric(ctx, x, y, w, h, label, value, sub){
    ctx.save();
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, x, y, w, h, 28); ctx.fill();
    ctx.fillStyle = '#6b7280';
    ctx.font = '700 26px sans-serif';
    ctx.fillText(label, x + 24, y + 38);
    ctx.fillStyle = '#111827';
    ctx.font = '900 54px sans-serif';
    ctx.fillText(String(value), x + 24, y + 98);
    ctx.fillStyle = '#4b5563';
    ctx.font = '500 24px sans-serif';
    ctx.fillText(sub, x + 24, y + 134, w - 48);
    ctx.restore();
  }

  function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines){
    const words = String(text || '').split(/\s+/);
    let line = '';
    let lines = 0;
    for(let i=0;i<words.length;i++){
      const test = line ? line + ' ' + words[i] : words[i];
      if(ctx.measureText(test).width > maxWidth && line){
        ctx.fillText(line, x, y + lines * lineHeight);
        lines += 1;
        if(maxLines && lines >= maxLines) return lines;
        line = words[i];
      } else {
        line = test;
      }
    }
    if(line && (!maxLines || lines < maxLines)){
      ctx.fillText(line, x, y + lines * lineHeight);
      lines += 1;
    }
    return lines;
  }

  function buildPngCanvas(state){
    const data = ensureAnalytics(state);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f5f3ee';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1a1a2e';
    ctx.font = '900 56px sans-serif';
    ctx.fillText('Родительская панель', 64, 84);
    ctx.font = '700 28px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(state.name || 'Ученик', 64, 124);
    ctx.fillText(new Date().toLocaleDateString('ru-RU'), 940, 84);

    drawMetric(ctx, 64, 164, 250, 156, 'Задач', state.totalQs, 'за всё время');
    drawMetric(ctx, 330, 164, 250, 156, 'Точность', state.totalPct, 'средний результат');
    drawMetric(ctx, 596, 164, 250, 156, 'Серия', state.bestStreak, 'лучший рекорд');
    drawMetric(ctx, 862, 164, 274, 156, '30 дней', data.last30Total, `${data.last30Active} активных дней`);

    ctx.fillStyle = '#1a1a2e';
    ctx.font = '800 34px sans-serif';
    ctx.fillText('Сильные и слабые стороны', 64, 392);
    ctx.fillStyle = '#4b5563';
    ctx.font = '500 24px sans-serif';
    drawWrappedText(ctx,
      `Лучший предмет: ${data.subjectSummary.best ? `${data.subjectSummary.best.label} (${fmtPct(data.subjectSummary.best.acc)})` : '—'}. ` +
      `Зона роста: ${data.subjectSummary.weakest ? `${data.subjectSummary.weakest.label} (${fmtPct(data.subjectSummary.weakest.acc)})` : '—'}. ` +
      `Тем начато: ${data.subjectSummary.topicsStarted}, сильных тем: ${data.subjectSummary.strongTopics}, глубина знаний: ${data.subjectSummary.depthPct}%.`,
      64, 432, 1072, 34, 4
    );

    ctx.fillStyle = '#1a1a2e';
    ctx.font = '800 34px sans-serif';
    ctx.fillText('Топ предметов', 64, 568);

    const topSubjects = data.subjectSummary.list.slice(0, 6);
    topSubjects.forEach((subj, idx) => {
      const y = 620 + idx * 120;
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, 64, y, 1072, 92, 24); ctx.fill();
      ctx.fillStyle = subj.color;
      roundRect(ctx, 64, y, 12, 92, 8); ctx.fill();
      ctx.fillStyle = '#111827';
      ctx.font = '800 30px sans-serif';
      ctx.fillText(subj.label, 98, y + 34);
      ctx.fillStyle = '#6b7280';
      ctx.font = '500 22px sans-serif';
      ctx.fillText(`${subj.qs} задач · ${subj.topicsStarted} тем · сильных ${subj.mastered}`, 98, y + 68);
      ctx.fillStyle = subj.color;
      ctx.font = '900 40px sans-serif';
      ctx.fillText(fmtPct(subj.acc), 1000, y + 54);
      ctx.fillStyle = '#e5e7eb';
      roundRect(ctx, 720, y + 62, 280, 10, 5); ctx.fill();
      ctx.fillStyle = subj.color;
      roundRect(ctx, 720, y + 62, Math.max(12, Math.round(280 * clamp(subj.acc, 0, 100) / 100)), 10, 5); ctx.fill();
    });

    ctx.fillStyle = '#1a1a2e';
    ctx.font = '800 34px sans-serif';
    ctx.fillText('Слабые темы', 64, 1380);
    ctx.fillStyle = '#4b5563';
    ctx.font = '600 24px sans-serif';
    (state.weak || []).slice(0, 5).forEach((row, idx) => {
      ctx.fillText(`• ${row[0]} — ${row[1]} ош.`, 64, 1428 + idx * 34);
    });

    ctx.fillStyle = '#6b7280';
    ctx.font = '500 22px sans-serif';
    ctx.fillText('Сформировано в тренажёре · offline-first', 64, 1550);
    return canvas;
  }

  window.downloadDashboardCSV = function(){
    if(!window._dashboardState) return;
    const csv = buildCSV(window._dashboardState);
    const today = new Date().toISOString().slice(0,10);
    download(`dashboard_${today}.csv`, new Blob([csv], { type:'text/csv;charset=utf-8' }));
  };

  window.downloadDashboardPNG = function(){
    if(!window._dashboardState) return;
    const canvas = buildPngCanvas(window._dashboardState);
    canvas.toBlob(function(blob){
      if(!blob) return;
      const today = new Date().toISOString().slice(0,10);
      download(`dashboard_${today}.png`, blob);
    }, 'image/png');
  };

  function render(state){
    if(!state) return;
    ensureAnalytics(state);
    renderInsights(state);
    renderHeatmap(state);
    renderRadar(state);
    renderTrend(state);
    renderSubjects(state);
  }

  window.addEventListener('dashboard-state-ready', function(ev){ render(ev.detail || window._dashboardState); });
  if(window._dashboardState) setTimeout(function(){ render(window._dashboardState); }, 0);
})();

;
/* --- wave25_dashboard_exam.js --- */
(function(){
  if (typeof window === 'undefined') return;
  if (!document.getElementById('grades')) return;

  var HISTORY_KEY = 'trainer_diag_history_v2';
  var PACKS = {
    oge: { label:'ОГЭ core', subjects:['mathall','russian','history','social','informatics'], note:'по последним доступным диагностикам' },
    ege: { label:'ЕГЭ core', subjects:['mathall','russian','english','history','social','physics'], note:'по последним доступным диагностикам' },
    eng: { label:'English level', subjects:['english'], note:'сквозная English-диагностика' }
  };
  var SUBJECT_LABELS = {
    math:'Математика', algebra:'Алгебра', geometry:'Геометрия', mathall:'Вся математика', physics:'Физика', russian:'Русский', history:'История', informatics:'Информатика', literature:'Литература', social:'Обществознание', biology:'Биология', geography:'География', english:'Английский'
  };

  function safeJSON(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(_) {
      return fallback;
    }
  }

  function history(){
    var rows = safeJSON(HISTORY_KEY, []);
    if (!Array.isArray(rows)) rows = [];
    rows.sort(function(a,b){ return Number(b.ts || 0) - Number(a.ts || 0); });
    return rows;
  }

  function fmtDate(ts){
    try { return new Date(ts).toLocaleDateString('ru-RU', { day:'numeric', month:'short' }); } catch(_) { return '—'; }
  }

  function ensureStyle(){
    if (document.getElementById('wave25-dashboard-style')) return;
    var style = document.createElement('style');
    style.id = 'wave25-dashboard-style';
    style.textContent = '' +
      '.wave25-diag-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:8px}.wave25-diag-card{background:var(--card);border:1px solid var(--border);border-radius:var(--R);padding:14px}.wave25-diag-k{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;font-weight:700}.wave25-diag-v{font-family:Unbounded,system-ui,sans-serif;font-size:17px;font-weight:900;margin-top:6px}.wave25-diag-sub{font-size:11px;color:var(--muted);margin-top:4px;line-height:1.4}' +
      '.wave25-diag-list{display:flex;flex-direction:column;gap:8px}.wave25-diag-row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:12px 14px;background:var(--card);border:1px solid var(--border);border-radius:var(--R)}.wave25-diag-name{font-size:13px;font-weight:800}.wave25-diag-meta{font-size:10px;color:var(--muted);margin-top:3px;line-height:1.45}.wave25-diag-pct{font-family:JetBrains Mono,monospace;font-size:15px;font-weight:800}.wave25-diag-pct.up{color:var(--green)}.wave25-diag-pct.down{color:var(--red)}' +
      '.wave25-diag-note{background:var(--card);border:1px solid var(--border);border-radius:var(--R);padding:12px 14px;font-size:12px;line-height:1.45;color:var(--text);margin-bottom:8px}.wave25-pack-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:8px}.wave25-pack-card{background:var(--card);border:1px solid var(--border);border-radius:var(--R);padding:14px}.wave25-pack-label{font-size:12px;font-weight:800}.wave25-pack-avg{font-family:Unbounded,system-ui,sans-serif;font-size:18px;font-weight:900;margin-top:6px}.wave25-pack-meta{font-size:10px;color:var(--muted);margin-top:4px;line-height:1.45}' +
      '@media (max-width:560px){.wave25-diag-grid,.wave25-pack-grid{grid-template-columns:1fr}}';
    document.head.appendChild(style);
  }

  function ensureHosts(){
    ensureStyle();
    var anchor = document.querySelector('.dash-actions');
    if (!anchor || !anchor.parentNode) return null;
    if (!document.getElementById('wave25-diag-title')) {
      var title = document.createElement('div');
      title.className = 'section';
      title.id = 'wave25-diag-title';
      title.textContent = 'Диагностики и готовность';
      anchor.parentNode.insertBefore(title, anchor);
    }
    if (!document.getElementById('wave25-diag-root')) {
      var root = document.createElement('div');
      root.id = 'wave25-diag-root';
      anchor.parentNode.insertBefore(root, anchor);
    }
    return document.getElementById('wave25-diag-root');
  }

  function latestBySubject(rows){
    var map = {};
    rows.forEach(function(row){ if (row && row.subjectId && !map[row.subjectId]) map[row.subjectId] = row; });
    return map;
  }

  function computePack(rows, subjects){
    var latest = latestBySubject(rows);
    var available = [];
    subjects.forEach(function(id){ if (latest[id]) available.push(latest[id]); });
    var avg = available.length ? Math.round(available.reduce(function(sum,row){ return sum + Number(row.pct || 0); }, 0) / available.length) : 0;
    var ready = available.filter(function(row){ return Number(row.pct || 0) >= 75; }).length;
    return {
      avg: avg,
      ready: ready,
      available: available.length,
      missing: subjects.length - available.length,
      subjects: available.map(function(row){ return row.subjectName || SUBJECT_LABELS[row.subjectId] || row.subjectId; })
    };
  }

  function recommendation(rows){
    if (!rows.length) return 'Пройдите первую микро-диагностику — тогда здесь появится готовность к предметам и рекомендации.';
    var last = rows[0];
    var gaps = (last.gapTopics || []).slice(0, 3);
    if (gaps.length) return 'Последняя диагностика показывает, что стоит повторить: ' + gaps.join(', ') + '. Лучше начать именно с них.';
    if (Number(last.pct || 0) >= 80) return 'Последняя диагностика сильная. Можно переходить к экзаменному режиму или к соседнему предмету.';
    return 'Сделайте ещё одну микро-диагностику через 7–14 дней и сравните рост по тем же предметам.';
  }

  function render(state){
    var root = ensureHosts();
    if (!root) return;
    var rows = history();
    if (!rows.length) {
      root.innerHTML = '<div class="wave25-diag-note">История диагностик пока пуста. После первых запусков в разделе «Сквозная диагностика» здесь появятся последние результаты, готовность к экзаменам и предметные рекомендации.</div>';
      return;
    }

    var last30 = rows.filter(function(row){ return Number(row.ts || 0) >= Date.now() - 30 * 86400000; });
    var avg30 = last30.length ? Math.round(last30.reduce(function(sum,row){ return sum + Number(row.pct || 0); }, 0) / last30.length) : Math.round(rows.reduce(function(sum,row){ return sum + Number(row.pct || 0); }, 0) / rows.length);
    var latest = rows[0];
    var best = rows.slice().sort(function(a,b){ return Number(b.pct || 0) - Number(a.pct || 0); })[0];
    var packsHtml = Object.keys(PACKS).map(function(key){
      var pack = PACKS[key];
      var calc = computePack(rows, pack.subjects);
      return '<div class="wave25-pack-card">' +
        '<div class="wave25-pack-label">' + pack.label + '</div>' +
        '<div class="wave25-pack-avg">' + (calc.available ? (calc.avg + '%') : '—') + '</div>' +
        '<div class="wave25-pack-meta">' + calc.ready + ' strong · ' + calc.available + '/' + pack.subjects.length + ' диагностировано<br>' + pack.note + '</div>' +
      '</div>';
    }).join('');

    root.innerHTML = '' +
      '<div class="wave25-diag-grid">' +
        '<div class="wave25-diag-card"><div class="wave25-diag-k">Диагностики</div><div class="wave25-diag-v">' + rows.length + '</div><div class="wave25-diag-sub">всего попыток в истории</div></div>' +
        '<div class="wave25-diag-card"><div class="wave25-diag-k">30 дней</div><div class="wave25-diag-v">' + avg30 + '%</div><div class="wave25-diag-sub">средний результат за месяц</div></div>' +
        '<div class="wave25-diag-card"><div class="wave25-diag-k">Лучший предмет</div><div class="wave25-diag-v">' + (best.subjectName || '—') + '</div><div class="wave25-diag-sub">' + best.pct + '% · ' + fmtDate(best.ts) + '</div></div>' +
      '</div>' +
      '<div class="wave25-pack-grid">' + packsHtml + '</div>' +
      '<div class="wave25-diag-note"><b>Рекомендация:</b> ' + recommendation(rows) + '</div>' +
      '<div class="wave25-diag-list">' + rows.slice(0, 8).map(function(row){
        var delta = row.deltaFromPrev;
        var cls = delta > 0 ? 'up' : delta < 0 ? 'down' : '';
        var deltaText = delta === null || typeof delta === 'undefined' || isNaN(delta) ? 'первый замер' : (delta > 0 ? '+' + delta + '%' : delta + '%');
        var topics = (row.gapTopics || []).slice(0, 3);
        return '<div class="wave25-diag-row">' +
          '<div><div class="wave25-diag-name">' + (row.subjectName || SUBJECT_LABELS[row.subjectId] || row.subjectId) + '</div>' +
          '<div class="wave25-diag-meta">' + fmtDate(row.ts) + ' · ' + row.modeLabel + ' · ' + (row.englishLevel ? ('English ' + row.englishLevel) : deltaText) + '</div>' +
          '<div class="wave25-diag-meta">' + (topics.length ? ('Темы: ' + topics.join(', ')) : 'Крупных пробелов не найдено') + '</div></div>' +
          '<div class="wave25-diag-pct ' + cls + '">' + row.pct + '%</div>' +
        '</div>';
      }).join('') + '</div>';

    try {
      if (window._dashboardState) {
        window._dashboardState.wave25Diagnostics = {
          total: rows.length,
          avg30: avg30,
          latest: latest,
          best: best,
          packs: Object.keys(PACKS).reduce(function(acc,key){ acc[key] = computePack(rows, PACKS[key].subjects); return acc; }, {})
        };
      }
    } catch(_) {}
  }

  function patchReport(){
    if (window.__wave25DashboardReportPatched || typeof window.buildDashboardReport !== 'function') return;
    var original = window.buildDashboardReport;
    window.buildDashboardReport = function(state){
      var text = original(state);
      var rows = history();
      if (!rows.length) return text;
      var last = rows[0];
      text += '\n━━━━━━━━━━━━━━━\nДиагностики:';
      text += '\nПоследняя: ' + (last.subjectName || SUBJECT_LABELS[last.subjectId] || last.subjectId) + ' · ' + last.pct + '% · ' + last.modeLabel;
      if (last.gapTopics && last.gapTopics.length) text += '\nПовторить: ' + last.gapTopics.slice(0, 3).join(', ');
      var pack = computePack(rows, PACKS.oge.subjects);
      if (pack.available) text += '\nОГЭ core: ' + pack.avg + '% (' + pack.available + '/' + PACKS.oge.subjects.length + ' предметов диагностировано)';
      return text;
    };
    window.__wave25DashboardReportPatched = true;
  }

  function init(){
    ensureHosts();
    patchReport();
    if (window._dashboardState) render(window._dashboardState);
    window.addEventListener('dashboard-state-ready', function(ev){ render(ev.detail || window._dashboardState); });
    window.addEventListener('wave25-diagnostic-saved', function(){ render(window._dashboardState); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();

