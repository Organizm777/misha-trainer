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
    const state = (window.__dashboardGetActiveState && window.__dashboardGetActiveState()) || window.__dashboardActiveState || window._dashboardState;
    if(!state) return;
    const csv = buildCSV(state);
    const today = new Date().toISOString().slice(0,10);
    download(`dashboard_${today}.csv`, new Blob([csv], { type:'text/csv;charset=utf-8' }));
  };

  window.downloadDashboardPNG = function(){
    const state = (window.__dashboardGetActiveState && window.__dashboardGetActiveState()) || window.__dashboardActiveState || window._dashboardState;
    if(!state) return;
    const canvas = buildPngCanvas(state);
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

  window.__dashboardEnsureAnalytics = ensureAnalytics;
  window.__dashboardRenderAnalytics = function(state){
    render(state || (window.__dashboardGetActiveState && window.__dashboardGetActiveState()) || window.__dashboardActiveState || window._dashboardState);
  };

  window.addEventListener('dashboard-state-ready', function(ev){
    render((window.__dashboardGetActiveState && window.__dashboardGetActiveState()) || window.__dashboardActiveState || ev.detail || window._dashboardState);
  });
  if(window._dashboardState) setTimeout(function(){ render((window.__dashboardGetActiveState && window.__dashboardGetActiveState()) || window.__dashboardActiveState || window._dashboardState); }, 0);
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

;
/* --- wave89j_parent_dashboard.js --- */
(function(){
  if (typeof window === 'undefined') return;
  if (!document.getElementById('grades')) return;

  const MODE_KEY = 'trainer_dashboard_mode_wave89j_v1';
  const FILTER_KEY = 'trainer_dashboard_grade_filter_wave89j_v1';
  const ADVANCED_IDS = ['wave22-insights','wave22-heatmap','wave22-radar','wave22-trend','wave22-subjects'];

  function safeGet(key, fallback){
    try {
      const value = localStorage.getItem(key);
      return value == null ? fallback : value;
    } catch(_) {
      return fallback;
    }
  }

  function safeSet(key, value){
    try { localStorage.setItem(key, value); } catch(_) {}
  }

  function getLastDays(count){
    const out = [];
    const base = new Date();
    for(let i = count - 1; i >= 0; i -= 1){
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }

  function allGrades(base){
    return (base && Array.isArray(base.gradeData) ? base.gradeData : []).map(row => String(row.grade.n));
  }

  function normalizeMode(mode){
    return String(mode || '').toLowerCase() === 'full' ? 'full' : 'parent';
  }

  function normalizeFilter(base, value){
    const raw = String(value == null ? 'all' : value);
    if (raw === 'all') return 'all';
    return allGrades(base).includes(raw) ? raw : 'all';
  }

  function applyModeClass(mode){
    document.body.classList.toggle('wave89j-parent-mode', mode !== 'full');
    document.body.classList.toggle('wave89j-full-mode', mode === 'full');
  }

  function ensureAdvancedMarkers(){
    ADVANCED_IDS.forEach((id) => {
      const node = document.getElementById(id);
      if (!node) return;
      node.setAttribute('data-wave89j-advanced', '1');
      const title = node.previousElementSibling;
      if (title && title.classList && title.classList.contains('section')) title.setAttribute('data-wave89j-advanced', '1');
    });
  }

  function ensureHosts(){
    let toolbar = document.getElementById('wave89j-parent-toolbar');
    let summary = document.getElementById('wave89j-parent-summary');
    if (!toolbar || !summary) {
      const grades = document.getElementById('grades');
      const anchor = grades && grades.previousElementSibling;
      if (anchor && anchor.parentNode) {
        if (!toolbar) {
          toolbar = document.createElement('div');
          toolbar.id = 'wave89j-parent-toolbar';
          anchor.parentNode.insertBefore(toolbar, anchor);
        }
        if (!summary) {
          summary = document.createElement('div');
          summary.id = 'wave89j-parent-summary';
          anchor.parentNode.insertBefore(summary, anchor);
        }
      }
    }
    return { toolbar, summary };
  }

  function pickAnchorGrade(base){
    const rows = base && Array.isArray(base.gradeData) ? base.gradeData.slice() : [];
    if (!rows.length) return null;
    rows.sort((a,b) => {
      const tsA = a && a.lastActivityDate ? new Date(a.lastActivityDate).getTime() : 0;
      const tsB = b && b.lastActivityDate ? new Date(b.lastActivityDate).getTime() : 0;
      return tsB - tsA || Number(b.last7Total || 0) - Number(a.last7Total || 0) || Number(b.qs || 0) - Number(a.qs || 0) || Number(b.grade.n || 0) - Number(a.grade.n || 0);
    });
    return rows[0] || null;
  }

  function composeView(base, filter){
    if (typeof window.__dashboardComposeState === 'function') return window.__dashboardComposeState(base, filter);
    return base || null;
  }

  function makeChecklist(base, view, analytics, filter){
    const rows = [];
    const weakest = analytics && analytics.subjectSummary ? analytics.subjectSummary.weakest : null;
    const anchor = filter !== 'all' ? (base.gradeData || []).find(row => String(row.grade.n) === String(filter)) : pickAnchorGrade(base);
    const diagnostics = base && base.wave25Diagnostics ? base.wave25Diagnostics : null;

    if (!view || !Number(view.totalQs || 0)) {
      rows.push({ icon:'🌱', title:'Сделать первый короткий заход', text:'Запустите одну тему на 10–15 минут, чтобы появилась базовая статистика и слабые места.' });
    } else if (weakest && Number(weakest.acc || 0) < 60) {
      rows.push({ icon:'🎯', title:'Повторить зону роста', text:`Лучше всего сейчас закрепить ${weakest.label}: точность ${weakest.acc}% при ${weakest.qs} задачах.` });
    } else {
      rows.push({ icon:'✅', title:'Поддерживать текущий темп', text:`За 7 дней решено ${view.last7Total || 0} задач. Короткие регулярные сессии сейчас важнее длинных марафонов.` });
    }

    if (!diagnostics || !diagnostics.latest) {
      rows.push({ icon:'📍', title:'Снять опорную диагностику', text:'После первой микро-диагностики родительская панель покажет готовность по предметам и понятные рекомендации.' });
    } else {
      rows.push({ icon:'🧪', title:'Проверить готовность', text:`Последняя диагностика: ${diagnostics.latest.subjectName || diagnostics.latest.subjectId || 'предмет'} · ${diagnostics.latest.pct}% · ${diagnostics.latest.modeLabel || 'режим'}.` });
    }

    if ((view.totalDays || 0) < 3) {
      rows.push({ icon:'🗓', title:'Добавить регулярность', text:'Полезная цель для недели — хотя бы 3 активных дня, даже если сессии короткие.' });
    } else if (anchor) {
      rows.push({ icon:'📘', title:'Открыть актуальный класс', text:`Больше всего движения сейчас в разделе «${anchor.grade.nm}». Там проще всего продолжить без лишнего поиска.` });
    }

    return rows.slice(0, 3);
  }

  function makeStatus(view, analytics){
    if (!view || !Number(view.totalQs || 0)) return { tone:'idle', label:'Старт', title:'Пока мало данных', text:'Сначала нужна короткая практика, затем уже будет видно сильные и слабые стороны.' };
    if ((view.last7Total || 0) < 10) return { tone:'focus', label:'Фокус недели', title:'Нужно немного регулярности', text:'Последняя неделя была спокойной. Полезно вернуть 2–3 короткие сессии без перегруза.' };
    const weakest = analytics && analytics.subjectSummary ? analytics.subjectSummary.weakest : null;
    if (weakest && Number(weakest.acc || 0) < 60) return { tone:'alert', label:'Зона роста', title:`Точка внимания: ${weakest.label}`, text:`Сейчас именно этот предмет тянет общую картину вниз: ${weakest.acc}% точности.` };
    if (analytics && Number(analytics.accDelta || 0) >= 5) return { tone:'good', label:'Хорошая динамика', title:'Точность растёт', text:`По сравнению с прошлой неделей точность выросла на ${analytics.accDelta} п.п.` };
    return { tone:'good', label:'Стабильно', title:'Рабочий ритм найден', text:'Ошибки есть, но общая картина ровная. Сейчас важнее удерживать темп и не распыляться.' };
  }

  function openLinkFor(base, filter, preferDiagnostic){
    if (preferDiagnostic) return 'diagnostic.html';
    const anchor = filter !== 'all' ? (base.gradeData || []).find(row => String(row.grade.n) === String(filter)) : pickAnchorGrade(base);
    return anchor && anchor.grade ? anchor.grade.file : 'index.html';
  }

  function renderToolbar(base, mode, filter){
    const host = document.getElementById('wave89j-parent-toolbar');
    if (!host || !base) return;
    const grades = (base.gradeData || []).map(row => row.grade);
    host.innerHTML = `
      <div class="wave89j-toolbar fade">
        <div class="wave89j-toolbar-card">
          <div class="wave89j-toolbar-head">
            <div>
              <div class="wave89j-toolbar-title">Компактный взгляд для родителя</div>
              <div class="wave89j-toolbar-sub">По умолчанию показываем короткую сводку, рекомендации и быстрый фокус. Полная аналитика доступна по кнопке.</div>
            </div>
            <div class="wave89j-toolbar-badge">${mode === 'full' ? 'Полная аналитика' : 'Режим родителя'}</div>
          </div>
          <div class="wave89j-chip-row">
            <button type="button" class="wave89j-chip is-mode ${mode === 'parent' ? 'is-active' : ''}" data-wave89j-mode="parent">👨‍👩‍👧 Коротко</button>
            <button type="button" class="wave89j-chip is-mode ${mode === 'full' ? 'is-active' : ''}" data-wave89j-mode="full">📊 Подробно</button>
          </div>
          <div class="wave89j-chip-row">
            <button type="button" class="wave89j-chip ${filter === 'all' ? 'is-active' : ''}" data-wave89j-filter="all">Все классы</button>
            ${grades.map((grade) => `<button type="button" class="wave89j-chip ${String(filter) === String(grade.n) ? 'is-active' : ''}" data-wave89j-filter="${grade.n}">${grade.ic} ${grade.n}</button>`).join('')}
          </div>
        </div>
      </div>`;
  }

  function renderSummary(base, view, mode, filter){
    const host = document.getElementById('wave89j-parent-summary');
    if (!host || !view) return;
    const analytics = typeof window.__dashboardEnsureAnalytics === 'function' ? window.__dashboardEnsureAnalytics(view) : null;
    const status = makeStatus(view, analytics);
    const diagnostics = base && base.wave25Diagnostics ? base.wave25Diagnostics : null;
    const checklist = makeChecklist(base, view, analytics, filter);
    const strongest = analytics && analytics.subjectSummary ? analytics.subjectSummary.best : null;
    const weakest = analytics && analytics.subjectSummary ? analytics.subjectSummary.weakest : null;
    const openHref = openLinkFor(base, filter, !Number(view.totalQs || 0));
    host.innerHTML = `
      <div class="wave89j-parent-card fade">
        <div class="wave89j-parent-head">
          <div>
            <div class="wave89j-parent-title">Что важно сейчас</div>
            <div class="wave89j-parent-sub">${view.filterGrade ? `Фокус на ${view.filterLabel}` : 'Сводка по всем классам'} · ${mode === 'full' ? 'подробный режим включён' : 'компактный режим включён'}</div>
          </div>
          <div class="wave89j-tone ${status.tone}">${status.label}</div>
        </div>
        <div class="wave89j-parent-grid">
          <div class="wave89j-parent-metric">
            <div class="wave89j-parent-k">Сейчас</div>
            <div class="wave89j-parent-v">${view.totalQs || 0}</div>
            <div class="wave89j-parent-note">${status.title}. ${status.text}</div>
          </div>
          <div class="wave89j-parent-metric">
            <div class="wave89j-parent-k">Лучшее</div>
            <div class="wave89j-parent-v">${strongest ? strongest.acc + '%' : '—'}</div>
            <div class="wave89j-parent-note">${strongest ? strongest.label : 'Пока мало данных для сильной стороны.'}</div>
          </div>
          <div class="wave89j-parent-metric">
            <div class="wave89j-parent-k">Проверка</div>
            <div class="wave89j-parent-v">${diagnostics && diagnostics.latest ? diagnostics.latest.pct + '%' : '—'}</div>
            <div class="wave89j-parent-note">${diagnostics && diagnostics.latest ? `${diagnostics.latest.subjectName || diagnostics.latest.subjectId || 'диагностика'} · ${diagnostics.latest.modeLabel || 'режим'}` : 'Диагностика ещё не запускалась.'}</div>
          </div>
        </div>
        <div class="wave89j-parent-list">
          ${checklist.map((item) => `<div class="wave89j-parent-item"><div class="wave89j-parent-icon">${item.icon}</div><div><b>${item.title}</b><span>${item.text}</span></div></div>`).join('')}
          ${weakest && Number(weakest.acc || 0) < 60 ? `<div class="wave89j-parent-item"><div class="wave89j-parent-icon">🧩</div><div><b>Отдельно проседает ${weakest.label}</b><span>Точность ${weakest.acc}% при ${weakest.qs} задачах. Хорошая цель — 10–15 минут повторения именно здесь.</span></div></div>` : ''}
        </div>
        <div class="wave89j-parent-actions">
          <a class="wave89j-parent-action primary" href="${openHref}">${Number(view.totalQs || 0) ? '▶ Открыть следующий шаг' : '▶ Начать практику'}</a>
          <button type="button" class="wave89j-parent-action secondary" data-wave89j-mode="${mode === 'full' ? 'parent' : 'full'}">${mode === 'full' ? '👨‍👩‍👧 Короткая сводка' : '📊 Полная аналитика'}</button>
          <button type="button" class="wave89j-parent-action secondary" data-wave89j-export="report">📝 TXT-сводка</button>
        </div>
        <div class="wave89j-parent-hint">${view.filterGrade ? 'Фильтр влияет на верхнюю сводку, активность, ошибки и экспорт отчёта. Карточки классов ниже остаются кликабельными для быстрого перехода.' : 'Выберите класс выше, если хотите увидеть сводку только по одному разделу без лишнего шума.'}</div>
      </div>`;
  }

  function readMode(){ return normalizeMode(safeGet(MODE_KEY, 'parent')); }
  function readFilter(base){ return normalizeFilter(base, safeGet(FILTER_KEY, 'all')); }

  function renderAll(){
    const base = window._dashboardState || (typeof window.__dashboardBaseState === 'function' ? window.__dashboardBaseState() : null);
    if (!base) return;
    ensureHosts();
    ensureAdvancedMarkers();
    const mode = readMode();
    const filter = readFilter(base);
    applyModeClass(mode);
    const view = composeView(base, filter);
    window.__dashboardActiveState = view;
    if (typeof window.__dashboardRenderCore === 'function') window.__dashboardRenderCore(base, { gradeFilter: filter, viewState: view });
    if (typeof window.__dashboardRenderAnalytics === 'function') window.__dashboardRenderAnalytics(view);
    renderToolbar(base, mode, filter);
    renderSummary(base, view, mode, filter);
  }

  function setMode(mode){
    safeSet(MODE_KEY, normalizeMode(mode));
    renderAll();
  }

  function setFilter(filter){
    safeSet(FILTER_KEY, String(filter == null ? 'all' : filter));
    renderAll();
  }

  function bindHostClicks(){
    document.addEventListener('click', function(event){
      const modeBtn = event.target && event.target.closest ? event.target.closest('[data-wave89j-mode]') : null;
      if (modeBtn) {
        event.preventDefault();
        setMode(modeBtn.getAttribute('data-wave89j-mode'));
        return;
      }
      const filterBtn = event.target && event.target.closest ? event.target.closest('[data-wave89j-filter]') : null;
      if (filterBtn) {
        event.preventDefault();
        setFilter(filterBtn.getAttribute('data-wave89j-filter'));
        return;
      }
      const exportBtn = event.target && event.target.closest ? event.target.closest('[data-wave89j-export]') : null;
      if (exportBtn) {
        event.preventDefault();
        if (exportBtn.getAttribute('data-wave89j-export') === 'report' && typeof window.downloadDashboardReport === 'function') window.downloadDashboardReport();
      }
    });
  }

  let bound = false;
  function init(){
    ensureHosts();
    ensureAdvancedMarkers();
    if (!bound) {
      bindHostClicks();
      bound = true;
    }
    renderAll();
    window.addEventListener('dashboard-state-ready', function(){ renderAll(); });
    window.addEventListener('wave25-diagnostic-saved', function(){ setTimeout(renderAll, 0); });
  }

  window.__wave89jParentDashboard = {
    version:'wave89j',
    defaultMode:'parent',
    renderAll,
    setMode,
    setFilter,
    getMode: readMode,
    getFilter: function(){ return readFilter(window._dashboardState || {}); },
    composeView: function(filter){ return composeView(window._dashboardState || {}, filter == null ? readFilter(window._dashboardState || {}) : filter); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();

;/* --- wave92y_dashboard_analytics.js --- */
(function(){
  'use strict';
  if (window.__wave92yDashboardAnalytics) return;
  window.__wave92yDashboardAnalytics = { version:'wave92y', ready:false, last:null };

  const DB_NAME = 'trainer3_events_wave92d';
  const STORE = 'events';
  const FALLBACK_KEY = 'trainer_events_fallback_wave92d';
  const DAY = 86400000;
  const FEATURE_SIGNALS = [
    { id:'diagnostic', label:'Диагностика', signals:['diagnostic','диагност'] },
    { id:'tests', label:'Психологические тесты', signals:['tests.html','мотивац','стресс','психолог'] },
    { id:'spec', label:'Спецпредметы', signals:['spec_subjects','спецпредмет'] },
    { id:'dashboard_report', label:'TXT-сводка', signals:['dashboard-report','txt-сводка','сводка'] },
    { id:'dashboard_csv', label:'CSV-экспорт', signals:['dashboard-csv','csv'] },
    { id:'dashboard_png', label:'PNG-карточка', signals:['dashboard-png','png'] },
    { id:'print', label:'Печать / PDF', signals:['print','печать','pdf'] },
    { id:'hint', label:'Подсказки в тренировке', signals:['hint','подсказка'] },
    { id:'sheet', label:'Шпаргалка', signals:['shp','шпаргалка'] },
    { id:'share', label:'Поделиться результатом', signals:['share','поделиться'] }
  ];
  const DOW = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];

  function esc(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function toNum(value){ const n = Number(value); return Number.isFinite(n) ? n : 0; }
  function clamp(value, min, max){ return Math.max(min, Math.min(max, value)); }
  function pct(ok, total){ return total > 0 ? Math.round(ok / total * 100) : 0; }
  function parsePct(value){
    const m = String(value == null ? '' : value).match(/-?\d+/);
    return m ? Number(m[0]) : null;
  }
  function safeJSON(raw, fallback){ try { return raw ? JSON.parse(raw) : fallback; } catch(_) { return fallback; } }
  function dateKey(ts){
    const d = new Date(ts || Date.now());
    return Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : '';
  }
  function daysAgo(date){
    if (!date) return null;
    let d = null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(date))) d = new Date(String(date) + 'T00:00:00');
    else {
      const m = String(date).match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/);
      if (m) d = new Date(Number(m[3].length === 2 ? '20' + m[3] : m[3]), Number(m[2]) - 1, Number(m[1]));
    }
    if (!d || !Number.isFinite(d.getTime())) return null;
    return Math.max(0, Math.floor((Date.now() - d.getTime()) / DAY));
  }
  function download(filename, text, type){
    const blob = new Blob([text], { type:type || 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 700);
  }
  function csv(value){
    const s = String(value == null ? '' : value).replace(/"/g, '""');
    return /[",\n;]/.test(s) ? '"' + s + '"' : s;
  }

  function readFallbackEvents(){
    try {
      const rows = safeJSON(localStorage.getItem(FALLBACK_KEY), []);
      return Array.isArray(rows) ? rows : [];
    } catch(_) { return []; }
  }
  function openEventsDb(){
    return new Promise(function(resolve, reject){
      if (!('indexedDB' in window)) { reject(new Error('IndexedDB unavailable')); return; }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function(){
        try {
          const db = req.result;
          const store = db.objectStoreNames.contains(STORE) ? req.transaction.objectStore(STORE) : db.createObjectStore(STORE, { keyPath:'id', autoIncrement:true });
          if (!store.indexNames.contains('by_ts')) store.createIndex('by_ts', 'ts');
          if (!store.indexNames.contains('by_kind')) store.createIndex('by_kind', 'kind');
          if (!store.indexNames.contains('by_page')) store.createIndex('by_page', 'page');
        } catch(_) {}
      };
      req.onsuccess = function(){ resolve(req.result); };
      req.onerror = function(){ reject(req.error || new Error('IndexedDB open failed')); };
    });
  }
  function readIndexedDbEvents(){
    return openEventsDb().then(function(db){
      return new Promise(function(resolve){
        try {
          const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
          req.onsuccess = function(){ resolve(Array.isArray(req.result) ? req.result : []); };
          req.onerror = function(){ resolve([]); };
        } catch(_) { resolve([]); }
      });
    }).catch(function(){ return []; });
  }
  function readAllEvents(){
    return Promise.all([readIndexedDbEvents(), Promise.resolve(readFallbackEvents())]).then(function(parts){
      const seen = new Set();
      const out = [];
      parts.flat().forEach(function(row){
        if (!row || !row.ts) return;
        const key = [row.ts, row.kind, row.page, row.grade, JSON.stringify(row.meta || {})].join('|');
        if (seen.has(key)) return;
        seen.add(key);
        out.push(row);
      });
      out.sort(function(a,b){ return Date.parse(a.ts || 0) - Date.parse(b.ts || 0); });
      return out;
    });
  }

  function activityRows(state){
    return Object.keys((state && state.activityMap) || {}).map(function(date){
      const row = state.activityMap[date] || {};
      return { date:date, total:toNum(row.total), ok:toNum(row.ok), err:toNum(row.err) };
    }).sort(function(a,b){ return a.date.localeCompare(b.date); });
  }
  function collectTopics(state){
    const rows = [];
    ((state && state.gradeData) || []).forEach(function(gd){
      const gradeLabel = gd && gd.grade ? gd.grade.nm : '';
      const progress = (gd && gd.progress) || {};
      Object.keys(progress).forEach(function(subject){
        const topics = progress[subject] || {};
        Object.keys(topics).forEach(function(topic){
          const row = topics[topic] || {};
          const ok = toNum(row.ok), err = toNum(row.err), total = ok + err;
          if (!total) return;
          rows.push({ grade:gradeLabel, subject:subject, topic:topic, ok:ok, err:err, total:total, acc:pct(ok,total), last:row.last || '' });
        });
      });
    });
    return rows;
  }

  function computeFunnel(events){
    const since = Date.now() - 30 * DAY;
    const rows = events.filter(function(ev){ return Date.parse(ev.ts || '') >= since; });
    const count = function(kind){ return rows.filter(function(ev){ return ev.kind === kind; }).length; };
    const starts = count('quiz_start');
    const answers = count('answer_submit');
    const ends = count('quiz_end');
    const pageViews = count('page_view');
    const correct = rows.filter(function(ev){ return ev.kind === 'answer_submit' && ev.meta && ev.meta.correct; }).length;
    return {
      pageViews:pageViews,
      starts:starts,
      answers:answers,
      ends:ends,
      answerAccuracy:pct(correct, answers),
      startToAnswer:starts ? Math.round(Math.min(answers, starts) / starts * 100) : 0,
      answerToEnd:starts ? Math.round(ends / starts * 100) : 0,
      rows:rows.length
    };
  }
  function computeFeatureUse(events){
    const since = Date.now() - 30 * DAY;
    const rows = events.filter(function(ev){ return Date.parse(ev.ts || '') >= since; });
    return FEATURE_SIGNALS.map(function(feature){
      const used = rows.some(function(ev){
        const meta = ev.meta || {};
        const hay = [ev.kind, ev.page, meta.action, meta.text, meta.href, meta.target].join(' ').toLowerCase();
        return feature.signals.some(function(sig){ return hay.indexOf(String(sig).toLowerCase()) !== -1; });
      });
      return { id:feature.id, label:feature.label, used:used };
    });
  }
  function computeDifficulty(state){
    const topics = collectTopics(state).filter(function(row){ return row.total >= 3; });
    const easy = topics.filter(function(row){ return row.acc >= 85; });
    const target = topics.filter(function(row){ return row.acc >= 60 && row.acc < 85; });
    const hard = topics.filter(function(row){ return row.acc < 60; });
    const avg = topics.length ? Math.round(topics.reduce(function(sum,row){ return sum + row.acc; }, 0) / topics.length) : null;
    let verdict = 'Мало данных для калибровки';
    if (topics.length) {
      if (hard.length > easy.length && avg < 65) verdict = 'Сложность завышена: больше коротких повторений и базовых задач';
      else if (easy.length > hard.length * 2 && avg >= 85) verdict = 'Сложность занижена: можно чаще давать задачи уровня выше';
      else verdict = 'Сложность в рабочем диапазоне';
    }
    return { topics:topics, easy:easy, target:target, hard:hard, avg:avg, verdict:verdict };
  }
  function computeDecay(state){
    const topics = collectTopics(state)
      .filter(function(row){ return row.total >= 3; })
      .map(function(row){ return Object.assign({}, row, { age:daysAgo(row.last) }); })
      .filter(function(row){ return row.age !== null && row.age >= 14; })
      .sort(function(a,b){ return (b.age - a.age) || (a.acc - b.acc); });
    const gradeGaps = ((state && state.gradeData) || [])
      .map(function(gd){ return { label:gd && gd.grade ? gd.grade.nm : '', age:daysAgo(gd && gd.lastActivityDate), total:toNum(gd && gd.qs) }; })
      .filter(function(row){ return row.total > 0 && row.age !== null && row.age >= 7; })
      .sort(function(a,b){ return b.age - a.age; });
    return { topics:topics.slice(0, 8), grades:gradeGaps.slice(0, 5) };
  }
  function computeForecast(state){
    const rows = activityRows(state);
    const last30 = rows.filter(function(row){ return Date.parse(row.date + 'T00:00:00') >= Date.now() - 30 * DAY; });
    const last14 = rows.filter(function(row){ return Date.parse(row.date + 'T00:00:00') >= Date.now() - 14 * DAY; });
    const total30 = last30.reduce(function(sum,row){ return sum + row.total; }, 0);
    const ok30 = last30.reduce(function(sum,row){ return sum + row.ok; }, 0);
    const active30 = last30.filter(function(row){ return row.total > 0; }).length;
    const total14 = last14.reduce(function(sum,row){ return sum + row.total; }, 0);
    const active14 = last14.filter(function(row){ return row.total > 0; }).length;
    const pace = Math.round((active14 ? total14 / 14 : total30 / 30) * 30);
    const basePct = parsePct(state && state.totalPct);
    const recentPct = pct(ok30, total30);
    const blended = basePct === null ? recentPct : Math.round((basePct * 0.65) + (recentPct * 0.35 || 0));
    const predicted = clamp(blended + (active14 >= 3 ? 3 : active14 === 0 ? -5 : 0), 0, 100);
    const mark = predicted >= 85 ? 5 : predicted >= 65 ? 4 : predicted >= 45 ? 3 : predicted > 0 ? 2 : null;
    const text = mark ? 'Прогноз оценки: ' + mark + ' при текущем темпе' : 'Прогноз появится после нескольких сессий';
    return { total30:total30, active30:active30, pace:pace, predicted:predicted, mark:mark, text:text };
  }
  function computeDailyPattern(events, state){
    const hours = Array.from({ length:24 }, function(_,i){ return { hour:i, total:0, ok:0 }; });
    const days = Array.from({ length:7 }, function(_,i){ return { day:i, label:DOW[i], total:0, ok:0 }; });
    events.forEach(function(ev){
      const d = new Date(ev.ts || '');
      if (!Number.isFinite(d.getTime())) return;
      const h = d.getHours();
      hours[h].total += 1;
      if (ev.kind === 'answer_submit' && ev.meta && ev.meta.correct) hours[h].ok += 1;
      days[d.getDay()].total += 1;
      if (ev.kind === 'answer_submit' && ev.meta && ev.meta.correct) days[d.getDay()].ok += 1;
    });
    if (!events.length) {
      activityRows(state).forEach(function(row){
        const d = new Date(row.date + 'T12:00:00');
        if (!Number.isFinite(d.getTime())) return;
        days[d.getDay()].total += row.total;
        days[d.getDay()].ok += row.ok;
      });
    }
    const bestHour = hours.slice().sort(function(a,b){ return b.total - a.total || b.ok - a.ok; })[0];
    const bestDay = days.slice().sort(function(a,b){ return b.total - a.total || b.ok - a.ok; })[0];
    return { hours:hours, days:days, bestHour:bestHour, bestDay:bestDay };
  }
  function computeSnapshot(events, state){
    const funnel = computeFunnel(events);
    const featureUse = computeFeatureUse(events);
    const difficulty = computeDifficulty(state);
    const decay = computeDecay(state);
    const forecast = computeForecast(state || {});
    const pattern = computeDailyPattern(events, state || {});
    return { generatedAt:new Date().toISOString(), eventCount:events.length, lastEvent:events[events.length - 1] || null, funnel:funnel, featureUse:featureUse, difficulty:difficulty, decay:decay, forecast:forecast, pattern:pattern };
  }

  function ensureHost(){
    let host = document.getElementById('wave92y-analytics');
    if (host) return host;
    const after = document.getElementById('wave22-insights') || document.getElementById('wave89j-parent-summary') || document.getElementById('activity');
    const section = document.createElement('div');
    section.className = 'section';
    section.setAttribute('data-wave89j-advanced', '1');
    section.textContent = 'Аналитика wave92y';
    host = document.createElement('div');
    host.id = 'wave92y-analytics';
    host.setAttribute('data-wave89j-advanced', '1');
    if (after && after.parentNode) {
      after.parentNode.insertBefore(host, after.nextSibling);
      after.parentNode.insertBefore(section, host);
    } else if (document.body) {
      document.body.appendChild(section);
      document.body.appendChild(host);
    }
    return host;
  }
  function miniBar(label, value, max){
    const width = max > 0 ? clamp(Math.round(value / max * 100), 0, 100) : 0;
    return '<div class="subject-mini"><div><b>' + esc(value) + '</b><span>' + esc(label) + '</span></div></div><div class="subject-bar"><div class="subject-fill" style="width:' + width + '%;background:var(--accent)"></div></div>';
  }
  function renderFunnel(snapshot){
    const f = snapshot.funnel;
    const max = Math.max(1, f.pageViews, f.starts, f.answers, f.ends);
    return '<div class="chart-card fade"><div class="chart-head"><div><div class="chart-title">Воронка тренировки</div><div class="chart-sub">События IndexedDB за последние 30 дней</div></div><div class="chart-meta">Точность ответов: <b>' + f.answerAccuracy + '%</b></div></div>' +
      miniBar('просмотры', f.pageViews, max) +
      miniBar('старты', f.starts, max) +
      miniBar('ответы', f.answers, max) +
      miniBar('завершения', f.ends, max) +
      '<div class="analytics-note"><b>Переходы:</b> старт → ответ ' + f.startToAnswer + '% · старт → финал ' + f.answerToEnd + '%</div></div>';
  }
  function renderDifficulty(snapshot){
    const d = snapshot.difficulty;
    const total = Math.max(1, d.easy.length + d.target.length + d.hard.length);
    const hardList = d.hard.slice(0, 3).map(function(row){ return esc(row.grade + ' · ' + row.topic + ' · ' + row.acc + '%'); }).join('<br>');
    return '<div class="chart-card fade"><div class="chart-head"><div><div class="chart-title">Калибровка сложности</div><div class="chart-sub">По темам с минимум 3 попытками</div></div><div class="chart-meta"><b>' + (d.avg == null ? '—' : d.avg + '%') + '</b> средняя точность</div></div>' +
      '<div class="analytics-grid"><div class="analytics-card"><div class="analytics-k">Легко</div><div class="analytics-v">' + d.easy.length + '</div><div class="analytics-sub">≥85%</div></div><div class="analytics-card"><div class="analytics-k">Норма</div><div class="analytics-v">' + d.target.length + '</div><div class="analytics-sub">60–84%</div></div><div class="analytics-card"><div class="analytics-k">Сложно</div><div class="analytics-v">' + d.hard.length + '</div><div class="analytics-sub"><60%</div></div></div>' +
      '<div class="subject-bar"><div class="subject-fill" style="width:' + Math.round(d.target.length / total * 100) + '%;background:var(--accent)"></div></div><div class="analytics-note"><b>' + esc(d.verdict) + '</b>' + (hardList ? '<br>' + hardList : '') + '</div></div>';
  }
  function renderDecayForecast(snapshot){
    const decay = snapshot.decay;
    const forecast = snapshot.forecast;
    const stale = decay.topics.length ? decay.topics.map(function(row){ return '<div class="wave89j-parent-item"><div class="wave89j-parent-icon">⏳</div><div><b>' + esc(row.grade + ' · ' + row.topic) + '</b><span>' + row.age + ' дн. без повторения · точность ' + row.acc + '%</span></div></div>'; }).join('') : '<div class="chart-empty">Критичных просрочек повторения не найдено.</div>';
    return '<div class="chart-card fade"><div class="chart-head"><div><div class="chart-title">Decay alert + прогноз</div><div class="chart-sub">Когда пора повторить и какой темп ожидается</div></div><div class="chart-meta">30 дней: <b>' + forecast.total30 + '</b> задач</div></div>' +
      '<div class="analytics-grid"><div class="analytics-card"><div class="analytics-k">Темп/30д</div><div class="analytics-v">' + forecast.pace + '</div><div class="analytics-sub">прогноз объёма</div></div><div class="analytics-card"><div class="analytics-k">Прогноз</div><div class="analytics-v">' + (forecast.mark || '—') + '</div><div class="analytics-sub">' + esc(forecast.predicted ? forecast.predicted + '% точности' : 'мало данных') + '</div></div></div>' +
      '<div class="wave89j-parent-list">' + stale + '</div><div class="analytics-note"><b>' + esc(forecast.text) + '</b></div></div>';
  }
  function renderPatternFeatures(snapshot){
    const p = snapshot.pattern;
    const maxDay = Math.max(1, ...p.days.map(function(row){ return row.total; }));
    const dayBars = p.days.map(function(row){
      return '<span class="month-chip">' + esc(row.label) + ' · ' + row.total + '</span>';
    }).join('');
    const hourText = p.bestHour && p.bestHour.total ? String(p.bestHour.hour).padStart(2, '0') + ':00' : '—';
    const dead = snapshot.featureUse.filter(function(row){ return !row.used; });
    const used = snapshot.featureUse.filter(function(row){ return row.used; });
    return '<div class="chart-card fade"><div class="chart-head"><div><div class="chart-title">Суточный паттерн и мёртвые фичи</div><div class="chart-sub">По событиям UI; если событий нет, используется дневная активность</div></div><div class="chart-meta">Лучший час: <b>' + esc(hourText) + '</b></div></div>' +
      '<div class="legend-row">' + dayBars + '</div>' +
      '<div class="analytics-note"><b>Самый активный день:</b> ' + esc(p.bestDay ? p.bestDay.label : '—') + ' · <b>использовались:</b> ' + (used.length ? used.map(function(x){ return esc(x.label); }).join(', ') : 'пока нет данных') + '<br><b>Не замечены в событиях 30 дней:</b> ' + (dead.length ? dead.map(function(x){ return esc(x.label); }).join(', ') : 'нет') + '</div></div>';
  }
  function renderStorage(snapshot){
    const last = snapshot.lastEvent;
    const lastText = last ? dateKey(last.ts) + ' · ' + esc(last.kind) + ' · ' + esc(last.page || '') : 'событий пока нет';
    return '<div class="analytics-grid fade"><div class="analytics-card"><div class="analytics-k">IndexedDB history</div><div class="analytics-v">' + snapshot.eventCount + '</div><div class="analytics-sub">событий в ' + esc(DB_NAME) + '</div></div><div class="analytics-card"><div class="analytics-k">Последнее событие</div><div class="analytics-v" style="font-size:15px">' + esc(lastText) + '</div><div class="analytics-sub">fallback localStorage учитывается</div></div></div>';
  }
  function render(snapshot){
    const host = ensureHost();
    if (!host) return;
    host.innerHTML = renderStorage(snapshot) + renderFunnel(snapshot) + renderDifficulty(snapshot) + renderDecayForecast(snapshot) + renderPatternFeatures(snapshot);
  }
  function currentState(){
    return (window.__dashboardGetActiveState && window.__dashboardGetActiveState()) || window.__dashboardActiveState || window._dashboardState || null;
  }
  function refresh(){
    const host = ensureHost();
    if (host && !host.innerHTML) host.innerHTML = '<div class="chart-card"><div class="chart-empty">Собираю локальную аналитику…</div></div>';
    const state = currentState();
    return readAllEvents().then(function(events){
      const snapshot = computeSnapshot(events, state || {});
      window.__wave92yDashboardAnalytics.ready = true;
      window.__wave92yDashboardAnalytics.last = snapshot;
      render(snapshot);
      try { window.dispatchEvent(new CustomEvent('wave92y-analytics-ready', { detail:snapshot })); } catch(_) {}
      return snapshot;
    }).catch(function(){
      const snapshot = computeSnapshot([], state || {});
      window.__wave92yDashboardAnalytics.last = snapshot;
      render(snapshot);
      return snapshot;
    });
  }
  function buildCSV(snapshot, state){
    const lines = ['section,key,value,extra'];
    lines.push(['wave92y','generatedAt',snapshot.generatedAt,''].map(csv).join(','));
    lines.push(['indexeddb','eventCount',snapshot.eventCount,DB_NAME].map(csv).join(','));
    Object.keys(snapshot.funnel).forEach(function(key){ if (key !== 'rows') lines.push(['funnel',key,snapshot.funnel[key],'last30'].map(csv).join(',')); });
    snapshot.featureUse.forEach(function(row){ lines.push(['feature',row.label,row.used ? 'used' : 'not_seen_30d',''].map(csv).join(',')); });
    const d = snapshot.difficulty;
    lines.push(['difficulty','avg',d.avg == null ? '' : d.avg,d.verdict].map(csv).join(','));
    d.hard.forEach(function(row){ lines.push(['difficulty_hard', row.grade + ' ' + row.topic, row.acc, row.total + ' attempts'].map(csv).join(',')); });
    snapshot.decay.topics.forEach(function(row){ lines.push(['decay', row.grade + ' ' + row.topic, row.age, row.acc + '%'].map(csv).join(',')); });
    lines.push(['forecast','mark',snapshot.forecast.mark || '', snapshot.forecast.text].map(csv).join(','));
    snapshot.pattern.days.forEach(function(row){ lines.push(['daily_pattern',row.label,row.total,row.ok].map(csv).join(',')); });
    activityRows(state || {}).forEach(function(row){ lines.push(['activity',row.date,row.total,'ok=' + row.ok + ';err=' + row.err].map(csv).join(',')); });
    return '\ufeff' + lines.join('\n');
  }

  const oldCsv = window.downloadDashboardCSV;
  window.downloadDashboardCSV = function(){
    const state = currentState();
    readAllEvents().then(function(events){
      const snapshot = computeSnapshot(events, state || {});
      const today = new Date().toISOString().slice(0, 10);
      download('dashboard_wave92y_analytics_' + today + '.csv', buildCSV(snapshot, state || {}), 'text/csv;charset=utf-8');
    }).catch(function(){
      if (typeof oldCsv === 'function') oldCsv();
    });
  };

  window.__wave92yDashboardAnalytics.refresh = refresh;
  window.__wave92yDashboardAnalytics.readEvents = readAllEvents;
  window.addEventListener('dashboard-state-ready', function(){ setTimeout(refresh, 0); });
  window.addEventListener('wave25-diagnostic-saved', function(){ setTimeout(refresh, 0); });
  window.addEventListener('storage', function(ev){ if (ev && /^trainer_/.test(String(ev.key || ''))) setTimeout(refresh, 50); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(refresh, 0); }, { once:true }); else setTimeout(refresh, 0);
})();
