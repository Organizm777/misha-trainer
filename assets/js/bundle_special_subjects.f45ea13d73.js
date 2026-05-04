/* wave55_special_subjects.js */
(function(){
  if (typeof window === 'undefined' || window.__wave55SpecialSubjects) return;
  window.__wave55SpecialSubjects = true;

  const VERSION = 'wave91b';
  const DATA_VERSION = '91b';
  const SESSION_SIZE = 20;
  const DIAG_SESSION_SIZE = 50;
  const PROGRESS_KEY = 'trainer_spec_progress_v1';
  const HISTORY_KEY = 'trainer_spec_history_v1';
  const LAST_TOPIC_KEY = 'trainer_spec_last_topic_v1';
  const DIAG_HISTORY_KEY = 'trainer_spec_diag_history_v1';
  const SPEC_MANIFEST = {"version":"wave91b","subjects":11,"topics":93,"totalQuestions":3588,"counts":{"diplomacy":540,"construction":614,"procurement":540,"management":544,"gkh":540,"psychology":300,"fashion_design":150,"architecture":150,"graphic_design":80,"interior_design":70,"design_entrance":60}};
  const SPEC_SUBJECTS = [{"id":"diplomacy","nm":"Международные отношения","icon":"🌍","desc":"Протокол, право, переговоры, аналитика","cl":"#1e40af","bg":"#dbeafe","tops":[{"id":"protocol","nm":"Дипломатический протокол и переписка","questionCount":60},{"id":"correspondence","nm":"Дипломатическая переписка","questionCount":60},{"id":"english_diplomacy","nm":"English for Diplomacy","questionCount":60},{"id":"conflict_peacekeeping","nm":"Конфликтология и миротворчество","questionCount":60},{"id":"economic_diplomacy","nm":"Экономическая дипломатия","questionCount":60},{"id":"info_policy","nm":"Информационная политика и публичная дипломатия","questionCount":60},{"id":"vienna_conventions","nm":"Венские конвенции: дипломатическое и консульское право","questionCount":60},{"id":"mid_minstroy","nm":"МИД и Минстрой: структура","questionCount":60},{"id":"analytics_notes","nm":"Аналитические записки и деловая переписка","questionCount":60}],"questionCount":540},{"id":"construction","nm":"Строительство","icon":"🏗","desc":"ГрК РФ, планировка территории, ввод","cl":"#b45309","bg":"#fef3c7","tops":[{"id":"grk","nm":"Градостроительный кодекс РФ","questionCount":60},{"id":"planning","nm":"Планировка территории и ГИСОГД","questionCount":14},{"id":"project_docs","nm":"Проектная документация","questionCount":60},{"id":"materials","nm":"Строительные материалы и конструкции","questionCount":60},{"id":"engineering_systems","nm":"Инженерные системы зданий","questionCount":60},{"id":"estimate_business","nm":"Сметное дело","questionCount":60},{"id":"safety_construction","nm":"Охрана труда в строительстве","questionCount":60},{"id":"control_supervision","nm":"Строительный контроль и надзор","questionCount":60},{"id":"bim_tech","nm":"BIM-технологии и ЦИМ","questionCount":60},{"id":"commissioning","nm":"Ввод в эксплуатацию","questionCount":60},{"id":"reconstruction_caprepair","nm":"Реконструкция и капремонт","questionCount":60}],"questionCount":614},{"id":"procurement","nm":"Закупки","icon":"📋","desc":"44‑ФЗ, процедуры, практика","cl":"#059669","bg":"#d1fae5","tops":[{"id":"fz44_basics","nm":"44‑ФЗ: основы и способы определения поставщика","questionCount":60},{"id":"planning_nmck","nm":"44-ФЗ: Планирование и НМЦК","questionCount":60},{"id":"contract_44fz","nm":"44-ФЗ: Контракт — заключение и исполнение","questionCount":60},{"id":"control_appeal","nm":"44-ФЗ: Контроль и обжалование","questionCount":60},{"id":"fz223_basics","nm":"223-ФЗ: основы","questionCount":60},{"id":"fz223_procedures_contract","nm":"223-ФЗ: процедуры и договор","questionCount":60},{"id":"goz_275fz","nm":"ГОЗ (275-ФЗ)","questionCount":60},{"id":"mixed_regime","nm":"Смешанный режим: 44/223/275","questionCount":60},{"id":"eis_etp","nm":"ЕИС и электронные площадки","questionCount":60}],"questionCount":540},{"id":"management","nm":"Управление","icon":"📊","desc":"Стратегия, проекты, люди, финансы, кейсы","cl":"#7c3aed","bg":"#ede9fe","tops":[{"id":"strategy","nm":"Стратегическое управление и принятие решений","questionCount":64},{"id":"project_mgmt","nm":"Управление проектами","questionCount":60},{"id":"decision_tools","nm":"Принятие решений и управленческие инструменты","questionCount":60},{"id":"efficiency_kpi","nm":"Эффективность и KPI","questionCount":60},{"id":"digital_transformation","nm":"Цифровая трансформация","questionCount":60},{"id":"people_mgmt","nm":"Управление людьми","questionCount":60},{"id":"financial_mgmt","nm":"Финансовый менеджмент","questionCount":60},{"id":"risk_management","nm":"Управление рисками","questionCount":60},{"id":"business_cases","nm":"Бизнес-кейсы и управленческие решения","questionCount":60}],"questionCount":544},{"id":"gkh","nm":"ЖКХ","icon":"🏢","desc":"ЖК РФ, управление МКД, собрания","cl":"#dc2626","bg":"#fee2e2","tops":[{"id":"mkd","nm":"ЖКХ: управление многоквартирным домом","questionCount":60},{"id":"owners_meeting","nm":"Общее собрание собственников","questionCount":60},{"id":"utilities_tariffs","nm":"ЖКУ и тарифы (ПП 354)","questionCount":60},{"id":"capital_repair","nm":"Капитальный ремонт","questionCount":60},{"id":"common_property","nm":"Содержание общего имущества","questionCount":60},{"id":"licensing_uk","nm":"Лицензирование УК","questionCount":60},{"id":"gis_housing","nm":"ГИС ЖКХ","questionCount":60},{"id":"energy_efficiency_meters","nm":"Энергоэффективность и приборы учёта","questionCount":60},{"id":"debtors","nm":"Работа с должниками","questionCount":60}],"questionCount":540},{"id":"psychology","nm":"Психология","icon":"🧠","desc":"EQ, стресс, мышление, прикладные навыки","cl":"#db2777","bg":"#fce7f3","tops":[{"id":"emotional_intelligence","nm":"Эмоциональный интеллект","questionCount":60},{"id":"stress_management","nm":"Стресс-менеджмент","questionCount":60},{"id":"cognitive_biases","nm":"Когнитивные искажения","questionCount":60},{"id":"conflictology","nm":"Конфликтология","questionCount":60},{"id":"personality","nm":"Психология личности","questionCount":60}],"questionCount":300},{"id":"fashion_design","nm":"Дизайн одежды и текстиля","icon":"👗","desc":"Мода, ткани, конструирование, пошив, индустрия","cl":"#be123c","bg":"#ffe4e6","tops":[{"id":"fashion_history","nm":"История моды: от античности до метамоды","questionCount":15},{"id":"color_theory","nm":"Цветоведение: круг Иттена, гармонии, Pantone, тренды","questionCount":15},{"id":"textile_materials","nm":"Материаловедение: ткани, свойства, уход","questionCount":15},{"id":"pattern_construction","nm":"Конструирование: мерки, основа, прибавки, размеры","questionCount":15},{"id":"fashion_modeling","nm":"Моделирование: вытачки, драпировки, складки, рельефы","questionCount":15},{"id":"sewing_technology","nm":"Технология пошива: швы, срезы, ВТО, фурнитура","questionCount":15},{"id":"fashion_styles","nm":"Стили: классика, casual, streetwear, haute couture, avant-garde, boho","questionCount":15},{"id":"fashion_industry","nm":"Бренды и индустрия: fashion weeks, luxury, fast fashion, аудитория","questionCount":15},{"id":"fashion_illustration","nm":"Фэшн-иллюстрация: пропорции, скетч, digital fashion","questionCount":15},{"id":"sustainable_fashion","nm":"Устойчивая мода: upcycling, slow fashion, этика, ресайклинг","questionCount":15}],"questionCount":150},{"id":"architecture","nm":"Архитектура","icon":"🏛️","desc":"Стили, композиция, конструкции, город, чертежи","cl":"#92400e","bg":"#ffedd5","tops":[{"id":"architectural_styles","nm":"Архитектурные стили и ордера","questionCount":15},{"id":"russian_architecture","nm":"Российская архитектура: от белокаменных храмов до современности","questionCount":15},{"id":"great_architects","nm":"Великие архитекторы: идеи и узнаваемые принципы","questionCount":15},{"id":"architectural_composition","nm":"Композиция: пропорции, ритм, симметрия, масштаб","questionCount":15},{"id":"structural_systems","nm":"Конструктивные системы: балки, арки, каркас, оболочки, ванты","questionCount":15},{"id":"urban_planning","nm":"Градостроительство: генплан, квартал, микрорайон, общественные пространства","questionCount":15},{"id":"drawing_reading","nm":"Чтение чертежей: планы, разрезы, фасады, масштаб","questionCount":15},{"id":"modern_architecture","nm":"Современная архитектура: параметризм, зелёная архитектура, BIM","questionCount":15},{"id":"architecture_interior","nm":"Интерьер: эргономика, антропометрия, зонирование, свет","questionCount":15},{"id":"marchi_prep","nm":"Подготовка к МАРХИ: рисунок, черчение, композиция","questionCount":15}],"questionCount":150},{"id":"graphic_design","nm":"Графический дизайн","icon":"🎨","desc":"Типографика, сетки, бренд, UI/UX, печать и веб","cl":"#7c3aed","bg":"#ede9fe","tops":[{"id":"typography","nm":"Типографика: шрифты, кернинг, трекинг, иерархия","questionCount":10},{"id":"layout_grid","nm":"Вёрстка: сетка, модульность, white space","questionCount":10},{"id":"branding","nm":"Брендинг: логотип, фирстиль, гайдлайн","questionCount":10},{"id":"ui_ux_basics","nm":"UI/UX основы: wireframe, prototype, usability","questionCount":10},{"id":"color_models","nm":"Цветовые модели: RGB, CMYK, HSB, Pantone","questionCount":10},{"id":"design_tools","nm":"Инструменты: Illustrator, Figma, Photoshop","questionCount":10},{"id":"print_design","nm":"Печатная продукция: препресс, CMYK, обрезные метки","questionCount":10},{"id":"web_design","nm":"Веб-дизайн: responsive, mobile first, accessibility","questionCount":10}],"questionCount":80},{"id":"interior_design","nm":"Дизайн интерьера","icon":"🏠","desc":"Стили, эргономика, свет, материалы и проектирование","cl":"#0f766e","bg":"#ccfbf1","tops":[{"id":"interior_styles","nm":"Стили интерьера: минимализм, лофт, скандинавский, арт-деко","questionCount":10},{"id":"ergonomics","nm":"Эргономика: размеры мебели, проходы, зоны комфорта","questionCount":10},{"id":"lighting","nm":"Свет: типы светильников, цветовая температура, сценарии","questionCount":10},{"id":"color_interior","nm":"Цвет в интерьере: палитры, акценты, визуальные эффекты","questionCount":10},{"id":"materials","nm":"Материалы: дерево, камень, стекло, металл, текстиль","questionCount":10},{"id":"projecting","nm":"Проектирование: планировка, зонирование, чертежи","questionCount":10},{"id":"tools","nm":"SketchUp, 3ds Max, Figma и другие инструменты","questionCount":10}],"questionCount":70},{"id":"design_entrance","nm":"Вступительные (дизайн)","icon":"🎯","desc":"Рисунок, живопись, композиция и портфолио","cl":"#c2410c","bg":"#ffedd5","tops":[{"id":"drawing","nm":"Рисунок: пропорции, светотень, штриховка, натюрморт","questionCount":10},{"id":"painting","nm":"Живопись: акварель, гуашь, колористика","questionCount":10},{"id":"composition","nm":"Композиция: плоскостная, объёмная, ритм, центр","questionCount":10},{"id":"stroganov_mghpa","nm":"МГХПА/Строгановка: типовые задания","questionCount":10},{"id":"marchi","nm":"МАРХИ: черчение, рисунок головы, композиция","questionCount":10},{"id":"britanka_hse","nm":"Британка/НИУ ВШЭ Дизайн: портфолио, мотивация","questionCount":10}],"questionCount":60}];
  const SUBJECT_DATA_PATHS = SPEC_SUBJECTS.reduce((acc, subject) => {
    acc[subject.id] = './assets/data/spec_subjects/' + subject.id + '.json?v=' + DATA_VERSION;
    return acc;
  }, {});

  function byId(id){ return typeof document !== 'undefined' ? document.getElementById(id) : null; }
  function esc(value){ return String(value == null ? '' : value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function storage(){ try { return window.localStorage; } catch(_) { return null; } }
  function readJSON(key, fallback){
    try {
      const s = storage();
      const raw = s ? s.getItem(key) : null;
      return raw ? JSON.parse(raw) : fallback;
    } catch(_) {
      return fallback;
    }
  }
  function writeJSON(key, value){
    try {
      const s = storage();
      if (s) s.setItem(key, JSON.stringify(value));
    } catch(_) {}
  }
  function shuffle(list){
    const arr = Array.isArray(list) ? list.slice() : [];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }
  function uniq(list){
    const out = [];
    (Array.isArray(list) ? list : []).forEach((item) => {
      if (!out.includes(item)) out.push(item);
    });
    return out;
  }
  function pct(ok, total){ return total ? Math.round(ok / total * 100) : 0; }
  function nowIso(){ return new Date().toISOString(); }
  function normSearch(value){ return String(value || '').trim().toLowerCase(); }
  function pick(list){ return list[Math.floor(Math.random() * list.length)]; }
  function fmtDuration(ms){
    const total = Math.max(0, Math.round((ms || 0) / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h ? String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') : String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  }
  function clampPct(value){ return Math.max(0, Math.min(100, Math.round(Number(value) || 0))); }
  function widthClass(value){ return 'spec-w-' + clampPct(value); }
  function badgeTone(value){
    const pctValue = clampPct(value);
    if (pctValue >= 85) return 'good';
    if (pctValue >= 65) return 'warn';
    return 'bad';
  }
  function badgeTextClass(value){ return 'spec-score-' + badgeTone(value); }
  function badgeFillClass(value){ return 'spec-fill-' + badgeTone(value); }

  function setAttr(el, name, value){ if (el && typeof el.setAttribute === 'function') el.setAttribute(name, value); }
  function setAttrIfMissing(el, name, value){ if (el && typeof el.getAttribute === 'function' && !el.getAttribute(name)) el.setAttribute(name, value); }

  function decorateSpecA11y(){
    const root = byId('spec-root');
    if (!root) return;
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', state.screen === 'quiz' ? 'Тренировка по спецпредметам' : 'Спецпредметы');
    root.querySelectorAll('.spec-search').forEach((input) => {
      const placeholder = String(input.getAttribute('placeholder') || '').toLowerCase();
      const label = placeholder.includes('внутри предмета') ? 'Поиск тем внутри предмета' : 'Поиск направлений и тем';
      setAttrIfMissing(input, 'aria-label', label);
    });
    root.querySelectorAll('.spec-grid').forEach((el) => { setAttr(el, 'role', 'group'); setAttrIfMissing(el, 'aria-label', 'Направления спецпредметов'); });
    root.querySelectorAll('.spec-topic-list').forEach((el) => { setAttr(el, 'role', 'group'); setAttrIfMissing(el, 'aria-label', 'Темы предмета'); });
    root.querySelectorAll('.spec-review-list').forEach((el) => { setAttr(el, 'role', 'group'); setAttrIfMissing(el, 'aria-label', 'Разбор результатов'); });
    root.querySelectorAll('.spec-card').forEach((btn) => {
      const name = (btn.querySelector('.spec-card-nm') || {}).textContent || 'Направление';
      const desc = (btn.querySelector('.spec-card-desc') || {}).textContent || '';
      const meta = Array.from(btn.querySelectorAll('.spec-card-meta')).map((row) => row.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).join('. ');
      setAttr(btn, 'aria-label', [name, desc, meta].filter(Boolean).join('. '));
    });
    root.querySelectorAll('.spec-topic-card').forEach((btn) => {
      const name = (btn.querySelector('.spec-topic-nm') || {}).textContent || 'Тема';
      const sub = (btn.querySelector('.spec-topic-sub') || {}).textContent || '';
      const stat = (btn.querySelector('.spec-topic-stat') || {}).textContent || '';
      setAttr(btn, 'aria-label', [name, sub, stat].join('. ').replace(/\s+/g, ' ').trim());
    });
    root.querySelectorAll('.spec-progress').forEach((track) => {
      const fill = track.querySelector('.spec-progress-fill');
      const width = fill ? clampPct(fill.getAttribute('data-spec-width') || '0') : 0;
      setAttr(track, 'role', 'progressbar');
      setAttr(track, 'aria-valuemin', '0');
      setAttr(track, 'aria-valuemax', '100');
      setAttr(track, 'aria-valuenow', String(width));
      setAttr(track, 'aria-label', 'Прогресс по вопросам');
    });
    root.querySelectorAll('.spec-opts').forEach((group) => {
      setAttr(group, 'role', 'radiogroup');
      setAttrIfMissing(group, 'aria-label', 'Варианты ответа');
      Array.from(group.querySelectorAll('.spec-opt')).forEach((opt) => {
        const checked = opt.classList.contains('is-wrong') || opt.classList.contains('is-correct');
        setAttr(opt, 'role', 'radio');
        setAttr(opt, 'aria-checked', checked ? 'true' : 'false');
      });
    });
    root.querySelectorAll('.spec-topic-bar-row').forEach((row) => {
      const title = (row.querySelector('.spec-topic-bar-head strong') || {}).textContent || 'Тема';
      const pctText = (row.querySelector('.spec-topic-bar-head span') || {}).textContent || '0%';
      const pct = Math.max(0, Math.min(100, parseInt(pctText, 10) || 0));
      const track = row.querySelector('.spec-topic-bar-track');
      if (track) {
        setAttr(track, 'role', 'progressbar');
        setAttr(track, 'aria-valuemin', '0');
        setAttr(track, 'aria-valuemax', '100');
        setAttr(track, 'aria-valuenow', String(pct));
        setAttr(track, 'aria-label', title + ': ' + pct + '%');
      }
    });
    root.querySelectorAll('.spec-weak-card').forEach((card) => {
      const title = (card.querySelector('.spec-review-q') || {}).textContent || 'Тема';
      const button = card.querySelector('button');
      if (button) setAttr(button, 'aria-label', button.textContent.replace(/\s+/g, ' ').trim() + ': ' + title);
    });
    root.querySelectorAll('.spec-result-n').forEach((el) => {
      const value = String(el.textContent || '').trim();
      setAttr(el, 'aria-label', 'Результат: ' + value);
    });
  }

  const loadedSubjects = Object.create(null);
  const pendingLoads = Object.create(null);
  const progress = readJSON(PROGRESS_KEY, {});
  const sessionHistory = readJSON(HISTORY_KEY, []);
  const diagHistory = readJSON(DIAG_HISTORY_KEY, []);

  const state = {
    screen: 'menu',
    mode: 'train',
    subjectId: null,
    topicId: null,
    queue: [],
    index: 0,
    ok: 0,
    answers: [],
    revealed: false,
    menuQuery: '',
    topicQuery: '',
    loading: false,
    loadingText: '',
    error: '',
    timerStartedAt: 0,
    timerNow: 0,
    timerHandle: 0,
    sessionDurationMs: 0,
    diagStats: []
  };

  function subjectById(subjectId){
    return SPEC_SUBJECTS.find((subject) => subject.id === subjectId) || null;
  }

  function topicById(subjectId, topicId){
    const subject = subjectById(subjectId);
    return subject ? (subject.tops || []).find((topic) => topic.id === topicId) || null : null;
  }

  function progressKey(subjectId, topicId){
    return subjectId + ':' + topicId;
  }

  function topicProgress(subjectId, topicId){
    const key = progressKey(subjectId, topicId);
    if (!progress[key]) progress[key] = { attempts:0, ok:0, total:0, best:0, lastPct:0, updatedAt:'' };
    return progress[key];
  }

  function saveProgress(){ writeJSON(PROGRESS_KEY, progress); }
  function saveHistory(){ writeJSON(HISTORY_KEY, sessionHistory.slice(0, 40)); }
  function saveDiagHistory(){ writeJSON(DIAG_HISTORY_KEY, diagHistory.slice(0, 20)); }
  function setLastTopic(subjectId, topicId){ writeJSON(LAST_TOPIC_KEY, { subjectId, topicId }); }
  function getLastTopic(){ return readJSON(LAST_TOPIC_KEY, null); }

  function latestDiagForSubject(subjectId){
    return diagHistory.find((row) => row.subjectId === subjectId) || null;
  }

  function normalizeQuestion(row, subject, topic){
    const answer = String(row && row.a || '').trim();
    let options = Array.isArray(row && row.o) ? row.o.map((item) => String(item || '').trim()).filter(Boolean) : [];
    if (answer && options.indexOf(answer) === -1) options.push(answer);
    options = uniq(options).slice(0, 4);
    while (options.length < 4) options.push('Нужны дополнительные данные');
    return {
      q: String(row && row.q || '').trim(),
      a: answer,
      o: shuffle(options),
      h: String(row && row.h || '').trim(),
      ex: String(row && row.ex || '').trim(),
      subjectId: subject.id,
      subjectName: subject.nm,
      topicId: topic.id,
      topicName: topic.nm,
      code: subject.id + ':' + topic.id
    };
  }

  function normalizeSubject(raw){
    const meta = subjectById(raw && raw.id);
    const subject = Object.assign({}, meta || {}, raw || {});
    const topicMetaMap = (meta && meta.tops || []).reduce((acc, topic) => {
      acc[topic.id] = topic;
      return acc;
    }, {});
    const tops = (raw && raw.tops || []).map((topicRaw) => {
      const topicMeta = topicMetaMap[topicRaw.id] || topicRaw;
      const bank = (topicRaw.questions || []).map((row) => normalizeQuestion(row, subject, topicMeta)).filter((item) => item.q && item.a && Array.isArray(item.o) && item.o.length >= 4);
      return {
        id: topicMeta.id,
        nm: topicMeta.nm,
        questions: bank,
        questionCount: bank.length
      };
    });
    return {
      id: subject.id,
      nm: subject.nm,
      icon: subject.icon,
      desc: subject.desc,
      cl: subject.cl,
      bg: subject.bg,
      tops: tops,
      questionCount: tops.reduce((sum, topic) => sum + topic.questionCount, 0)
    };
  }

  async function loadSubject(subjectId){
    if (loadedSubjects[subjectId]) return loadedSubjects[subjectId];
    if (pendingLoads[subjectId]) return pendingLoads[subjectId];
    const url = SUBJECT_DATA_PATHS[subjectId];
    if (!url) throw new Error('Unknown special subject: ' + subjectId);
    const request = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error('HTTP ' + response.status + ' for ' + url);
        return response.json();
      })
      .then((raw) => {
        const normalized = normalizeSubject(raw);
        loadedSubjects[subjectId] = normalized;
        delete pendingLoads[subjectId];
        return normalized;
      })
      .catch((error) => {
        delete pendingLoads[subjectId];
        throw error;
      });
    pendingLoads[subjectId] = request;
    return request;
  }

  function loadedSubjectById(subjectId){
    return loadedSubjects[subjectId] || null;
  }

  function loadedTopicById(subjectId, topicId){
    const subject = loadedSubjectById(subjectId);
    return subject ? (subject.tops || []).find((topic) => topic.id === topicId) || null : null;
  }

  function sampleQuestions(bank, amount){
    return shuffle(bank).slice(0, Math.min(amount, bank.length));
  }

  function buildDiagnosticQueue(subject, amount){
    const topics = Array.isArray(subject && subject.tops) ? subject.tops.filter((topic) => Array.isArray(topic.questions) && topic.questions.length) : [];
    if (!topics.length) return [];
    const maxQ = Math.min(amount, topics.reduce((sum, topic) => sum + topic.questions.length, 0));
    const base = Math.floor(maxQ / topics.length);
    const rem = maxQ % topics.length;
    const selected = [];
    const leftovers = [];
    topics.forEach((topic, index) => {
      const bank = shuffle(topic.questions);
      const quota = Math.min(bank.length, base + (index < rem ? 1 : 0));
      selected.push.apply(selected, bank.slice(0, quota));
      leftovers.push.apply(leftovers, bank.slice(quota));
    });
    if (selected.length < maxQ) {
      const rest = shuffle(leftovers).slice(0, maxQ - selected.length);
      selected.push.apply(selected, rest);
    }
    return shuffle(selected).slice(0, maxQ);
  }

  function resetSession(){
    stopTimer();
    state.queue = [];
    state.index = 0;
    state.ok = 0;
    state.answers = [];
    state.revealed = false;
    state.mode = 'train';
    state.sessionDurationMs = 0;
    state.diagStats = [];
  }

  function startTimer(){
    stopTimer();
    state.timerStartedAt = Date.now();
    state.timerNow = state.timerStartedAt;
    state.sessionDurationMs = 0;
    state.timerHandle = window.setInterval(() => {
      state.timerNow = Date.now();
      const timer = byId('spec-timer');
      if (timer) timer.textContent = fmtDuration(state.timerNow - state.timerStartedAt);
    }, 1000);
  }

  function stopTimer(){
    if (state.timerHandle) window.clearInterval(state.timerHandle);
    state.timerHandle = 0;
  }

  function setLoading(flag, text){
    state.loading = !!flag;
    state.loadingText = flag ? String(text || 'Загрузка…') : '';
  }

  function setError(text){
    state.error = text ? String(text) : '';
  }

  function subjectSummary(subject){
    const stats = (subject.tops || []).map((topic) => topicProgress(subject.id, topic.id));
    const attempts = stats.reduce((sum, stat) => sum + (stat.attempts || 0), 0);
    const best = stats.reduce((sum, stat) => Math.max(sum, stat.best || 0), 0);
    const diag = latestDiagForSubject(subject.id);
    return { attempts: attempts, best: best, diag: diag };
  }

  function currentQuestion(){ return state.queue[state.index] || null; }

  function renderQuestionInsight(q){
    const hint = q && q.h ? esc(q.h) : 'Подсказка пока не добавлена.';
    const ex = q && q.ex ? '<small class="spec-feedback-ex">' + esc(q.ex) + '</small>' : '';
    return '<span>' + hint + '</span>' + ex;
  }

  function filteredSubjects(){
    const query = normSearch(state.menuQuery);
    if (!query) return SPEC_SUBJECTS.slice();
    return SPEC_SUBJECTS.filter((subject) => {
      const hay = [subject.nm, subject.desc].concat((subject.tops || []).map((topic) => topic.nm)).join(' ').toLowerCase();
      return hay.indexOf(query) !== -1;
    });
  }

  function filteredTopics(subject){
    const query = normSearch(state.topicQuery);
    const list = subject && Array.isArray(subject.tops) ? subject.tops.slice() : [];
    if (!query) return list;
    return list.filter((topic) => ([topic.nm, topic.id].join(' ').toLowerCase().indexOf(query) !== -1));
  }

  function menuSummary(){
    const last = getLastTopic();
    if (!last) return '';
    const subject = subjectById(last.subjectId);
    const topic = topicById(last.subjectId, last.topicId);
    if (!subject || !topic) return '';
    const stat = topicProgress(subject.id, topic.id);
    return '<button class="spec-resume" type="button" data-spec-action="resume-last">⏯ Продолжить: ' + esc(subject.nm) + ' → ' + esc(topic.nm) + '<span>' + esc((stat.lastPct || 0) + '% в прошлой сессии') + '</span></button>';
  }

  function historyBlock(){
    const rows = sessionHistory.slice(0, 5);
    const diagRows = diagHistory.slice(0, 4);
    if (!rows.length && !diagRows.length) return '';
    return '<div class="spec-history"><div class="spec-section-title">Последняя активность</div>' +
      (rows.length ? rows.map((row) => '<div class="spec-history-row"><div><b>' + esc(row.subjectName) + '</b><span>' + esc(row.topicName) + '</span></div><strong class="' + badgeTextClass(row.pct) + '">' + row.pct + '%</strong></div>').join('') : '') +
      (diagRows.length ? '<div class="spec-history-split"></div>' + diagRows.map((row) => '<div class="spec-history-row"><div><b>' + esc(row.subjectName) + '</b><span>Диагностика · ' + esc(fmtDuration(row.durationMs || 0)) + '</span></div><strong class="' + badgeTextClass(row.pct) + '">' + row.pct + '%</strong></div>').join('') : '') +
      '</div>';
  }

  function latestSubjectResume(subjectId){
    const last = getLastTopic();
    if (!last || last.subjectId !== subjectId) return null;
    return topicById(last.subjectId, last.topicId);
  }

  function uiNotice(){
    const notices = [];
    if (state.error) notices.push('<div class="spec-empty spec-error">' + esc(state.error) + '</div>');
    if (state.loading) notices.push('<div class="spec-loading">' + esc(state.loadingText || 'Загрузка…') + '</div>');
    return notices.join('');
  }

  function renderMenu(){
    const root = byId('spec-root');
    const totalCards = SPEC_SUBJECTS.length;
    const cards = filteredSubjects();
    root.innerHTML = '' +
      '<section class="spec-screen spec-menu">' +
        '<div class="spec-hero">' +
          '<div class="spec-pill"><span class="spec-dot"></span>Профессиональные тесты</div>' +
          '<h1>Спецпредметы<br><em>диагностика и тренировки по делу</em></h1>' +
          '<p class="spec-sub">Отдельные тренировки и диагностики по каждому направлению: без перегруженных карточек, с понятной статистикой и быстрым переходом к слабым темам.</p>' +
          '<div class="spec-stats">' +
            '<div class="spec-stat"><div class="spec-stat-n">' + SPEC_MANIFEST.subjects + '</div><div class="spec-stat-l">направлений</div></div>' +
            '<div class="spec-stat"><div class="spec-stat-n">' + SPEC_MANIFEST.topics + '</div><div class="spec-stat-l">тем</div></div>' +
            '<div class="spec-stat"><div class="spec-stat-n">' + SPEC_MANIFEST.totalQuestions + '</div><div class="spec-stat-l">вопросов</div></div>' +
          '</div>' +
          menuSummary() +
        '</div>' +
        '<div class="spec-tools">' +
          '<label class="spec-search-wrap">' +
            '<span>🔎</span>' +
            '<input class="spec-search" type="search" placeholder="Найти направление или тему" value="' + esc(state.menuQuery) + '" data-spec-input="menu-query">' +
            (state.menuQuery ? '<button class="spec-clear" type="button" data-spec-action="clear-menu-query" aria-label="Очистить поиск">✕</button>' : '') +
          '</label>' +
          '<div class="spec-tools-meta">Показано ' + cards.length + ' из ' + totalCards + ' направлений · диагностика 50 вопросов внутри каждого</div>' +
        '</div>' +
        uiNotice() +
        '<div class="spec-section-title">Каталог спецпредметов</div>' +
        '<div class="spec-grid">' +
          (cards.length ? cards.map((subject) => {
            const summary = subjectSummary(subject);
            const diagHtml = summary.diag
              ? '<span>диагностика ' + summary.diag.pct + '%</span>'
              : '<span>диагностика 50 вопр.</span>';
            const trainHtml = summary.attempts
              ? '<strong>лучший ' + summary.best + '%</strong>'
              : '<strong>' + subject.questionCount + ' вопр.</strong>';
            return '<button class="spec-card" type="button" data-spec-id="' + esc(subject.id) + '" data-spec-action="open-subject" data-spec-subject="' + esc(subject.id) + '">' +
              '<div class="spec-card-ic">' + esc(subject.icon) + '</div>' +
              '<div class="spec-card-main"><div class="spec-card-nm">' + esc(subject.nm) + '</div><div class="spec-card-desc">' + esc(subject.desc) + '</div><div class="spec-card-meta"><span>' + subject.tops.length + ' тем</span>' + trainHtml + '</div><div class="spec-card-meta">' + diagHtml + '<span>по всем темам</span></div></div>' +
              '<span class="spec-card-arrow">→</span>' +
              '</button>';
          }).join('') : '<div class="spec-empty">По этому запросу ничего не найдено. Попробуйте часть названия предмета или темы.</div>') +
        '</div>' +
        historyBlock() +
      '</section>';
  }

  function renderSubject(){
    const root = byId('spec-root');
    const subject = subjectById(state.subjectId);
    if (!subject) return openMenu();
    const topics = filteredTopics(subject);
    const summary = subjectSummary(subject);
    const resumeTopic = latestSubjectResume(subject.id);
    root.innerHTML = '' +
      '<section class="spec-screen">' +
        '<button class="spec-back" type="button" data-spec-action="open-menu">← Все спецпредметы</button>' +
        '<div class="spec-subject-head" data-spec-id="' + esc(subject.id) + '">' +
          '<div class="spec-subject-ic">' + esc(subject.icon) + '</div>' +
          '<div>' +
            '<div class="spec-subject-nm">' + esc(subject.nm) + '</div>' +
            '<div class="spec-subject-desc">' + esc(subject.desc) + '</div>' +
            '<div class="spec-subject-meta"><span class="spec-chip">' + subject.tops.length + ' тем</span><span class="spec-chip">' + subject.questionCount + ' вопросов</span><span class="spec-chip">диагностика 50 вопросов</span>' + (summary.diag ? '<span class="spec-chip">последняя диагностика ' + summary.diag.pct + '%</span>' : '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="spec-actions-row">' +
          '<button class="spec-btn primary" type="button" data-spec-action="start-diagnostic" data-spec-subject="' + esc(subject.id) + '">🧭 Сквозная диагностика · 50 вопросов</button>' +
          (resumeTopic ? '<button class="spec-btn" type="button" data-spec-action="start-topic" data-spec-subject="' + esc(subject.id) + '" data-spec-topic="' + esc(resumeTopic.id) + '">⏯ Вернуться к теме</button>' : '<button class="spec-btn" type="button" data-spec-action="preload-subject" data-spec-subject="' + esc(subject.id) + '">⚡ Подгрузить банк</button>') +
        '</div>' +
        '<div class="spec-soft-note">Диагностика собирает вопросы по всем темам направления, показывает таймер, слабые темы и быстрые переходы в конкретные банки.</div>' +
        '<div class="spec-tools">' +
          '<label class="spec-search-wrap">' +
            '<span>🔎</span>' +
            '<input class="spec-search" type="search" placeholder="Найти тему внутри предмета" value="' + esc(state.topicQuery) + '" data-spec-input="topic-query">' +
            (state.topicQuery ? '<button class="spec-clear" type="button" data-spec-action="clear-topic-query" aria-label="Очистить поиск темы">✕</button>' : '') +
          '</label>' +
          '<div class="spec-tools-meta">Показано ' + topics.length + ' из ' + subject.tops.length + ' тем</div>' +
        '</div>' +
        uiNotice() +
        '<div class="spec-section-title">Темы и модули</div>' +
        '<div class="spec-topic-list">' +
          (topics.length ? topics.map((topic) => {
            const stat = topicProgress(subject.id, topic.id);
            const statHtml = stat.attempts
              ? '<div class="spec-topic-stat"><span>попыток: ' + stat.attempts + '</span><span>лучший: ' + stat.best + '%</span></div>'
              : '<div class="spec-topic-stat"><span>без попыток</span><span>' + topic.questionCount + ' вопросов в банке</span></div>';
            return '<button class="spec-topic-card" type="button" data-spec-action="start-topic" data-spec-subject="' + esc(subject.id) + '" data-spec-topic="' + esc(topic.id) + '">' +
              '<div><div class="spec-topic-nm">' + esc(topic.nm) + '</div><div class="spec-topic-sub">Мини-сессия: 20 вопросов · база: ' + topic.questionCount + '</div>' + statHtml + '</div>' +
              '<span class="spec-card-arrow">→</span>' +
              '</button>';
          }).join('') : '<div class="spec-empty">Поиск внутри предмета ничего не нашёл. Попробуйте другое слово.</div>') +
        '</div>' +
      '</section>';
  }

  function renderQuiz(){
    const root = byId('spec-root');
    const subject = subjectById(state.subjectId);
    const topic = state.mode === 'train' ? topicById(state.subjectId, state.topicId) : null;
    const q = currentQuestion();
    if (!subject || !q) return openMenu();
    if (state.mode === 'train' && !topic) return openSubject(state.subjectId);
    const selected = state.answers[state.answers.length - 1] || null;
    const progressValue = clampPct((state.index / state.queue.length) * 100);
    const subLine = state.mode === 'diagnostic'
      ? 'Вопрос ' + (state.index + 1) + ' из ' + state.queue.length + ' · верно: ' + state.ok
      : 'Вопрос ' + (state.index + 1) + ' из ' + state.queue.length + ' · верно: ' + state.ok;
    root.innerHTML = '' +
      '<section class="spec-screen spec-quiz">' +
        '<div class="spec-quiz-head">' +
          '<button class="spec-back" type="button" data-spec-action="confirm-exit">← ' + (state.mode === 'diagnostic' ? 'К предмету' : 'К теме') + '</button>' +
          '<div class="spec-quiz-meta">' +
            '<div class="spec-quiz-topline"><span class="spec-chip">' + (state.mode === 'diagnostic' ? 'Диагностика · 50 вопросов' : 'Тренировка · 20 вопросов') + '</span><span class="spec-timer" id="spec-timer">' + fmtDuration(state.timerNow - state.timerStartedAt) + '</span></div>' +
            '<div class="spec-quiz-title">' + esc(subject.nm) + (state.mode === 'diagnostic' ? ' · диагностика' : ' · ' + esc(topic.nm)) + '</div>' +
            '<div class="spec-quiz-sub">' + esc(subLine) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="spec-progress"><div class="spec-progress-fill ' + widthClass(progressValue) + '" data-spec-width="' + progressValue + '"></div></div>' +
        '<article class="spec-qcard">' +
          (state.mode === 'diagnostic' ? '<div class="spec-qtopic">' + esc(q.topicName) + '</div>' : '') +
          '<div class="spec-qtext">' + esc(q.q) + '</div>' +
          '<div class="spec-opts">' +
            q.o.map((option, optionIndex) => {
              const isCorrect = option === q.a;
              const isSelected = state.revealed && selected && option === selected.choice;
              const cls = !state.revealed ? 'spec-opt' : isCorrect ? 'spec-opt is-correct' : isSelected ? 'spec-opt is-wrong' : 'spec-opt is-muted';
              const disabled = state.revealed ? 'disabled' : '';
              return '<button class="' + cls + '" type="button" ' + disabled + ' data-spec-action="answer" data-spec-option-index="' + optionIndex + '">' + esc(option) + '</button>';
            }).join('') +
          '</div>' +
          (state.revealed ? '<div class="spec-feedback ' + (selected && selected.correct ? 'ok' : 'bad') + '"><strong>' + (selected && selected.correct ? 'Верно.' : 'Неверно.') + '</strong>' + renderQuestionInsight(q) + '</div><button class="spec-next" type="button" data-spec-action="next-question">' + (state.index + 1 >= state.queue.length ? 'К результатам →' : 'Дальше →') + '</button>' : '') +
        '</article>' +
      '</section>';
  }

  function badgeColor(value){
    if (badgeTone(value) === 'good') return 'var(--green,#16a34a)';
    if (badgeTone(value) === 'warn') return 'var(--orange,#ea580c)';
    return 'var(--red,#dc2626)';
  }

  function recordTrainingSession(subject, topic, summary){
    const stat = topicProgress(subject.id, topic.id);
    stat.attempts += 1;
    stat.ok += summary.ok;
    stat.total += summary.total;
    stat.lastPct = summary.pct;
    stat.best = Math.max(stat.best || 0, summary.pct);
    stat.updatedAt = summary.at;
    saveProgress();
    sessionHistory.unshift({
      at: summary.at,
      subjectId: subject.id,
      subjectName: subject.nm,
      topicId: topic.id,
      topicName: topic.nm,
      ok: summary.ok,
      total: summary.total,
      pct: summary.pct,
      wrong: summary.wrongCount
    });
    saveHistory();
    setLastTopic(subject.id, topic.id);
  }

  function buildDiagnosticTopicStats(subject){
    const topicMetaMap = (subject.tops || []).reduce((acc, topic) => {
      acc[topic.id] = { topicId: topic.id, topicName: topic.nm, ok: 0, total: 0, wrong: 0 };
      return acc;
    }, {});
    state.answers.forEach((row) => {
      if (!topicMetaMap[row.topicId]) topicMetaMap[row.topicId] = { topicId: row.topicId, topicName: row.topicName, ok:0, total:0, wrong:0 };
      topicMetaMap[row.topicId].total += 1;
      if (row.correct) topicMetaMap[row.topicId].ok += 1;
      else topicMetaMap[row.topicId].wrong += 1;
    });
    return Object.keys(topicMetaMap).map((topicId) => {
      const item = topicMetaMap[topicId];
      item.pct = pct(item.ok, item.total);
      return item;
    }).filter((item) => item.total > 0).sort((a, b) => {
      if (a.pct !== b.pct) return a.pct - b.pct;
      if (a.wrong !== b.wrong) return b.wrong - a.wrong;
      return String(a.topicName).localeCompare(String(b.topicName), 'ru');
    });
  }

  function recordDiagnosticSession(subject, summary, stats){
    diagHistory.unshift({
      at: summary.at,
      subjectId: subject.id,
      subjectName: subject.nm,
      pct: summary.pct,
      ok: summary.ok,
      total: summary.total,
      durationMs: summary.durationMs,
      weakTopics: stats.slice(0, 3).map((item) => item.topicName)
    });
    saveDiagHistory();
  }

  function renderTrainingResult(){
    const root = byId('spec-root');
    const subject = subjectById(state.subjectId);
    const topic = topicById(state.subjectId, state.topicId);
    if (!subject || !topic) return openMenu();
    const total = state.queue.length;
    const score = pct(state.ok, total);
    const wrong = state.answers.filter((row) => !row.correct);
    root.innerHTML = '' +
      '<section class="spec-screen">' +
        '<div class="spec-result">' +
          '<div class="spec-result-n">' + score + '%</div>' +
          '<div class="spec-result-sub">' + state.ok + ' из ' + total + ' верно · ' + esc(subject.nm) + ' / ' + esc(topic.nm) + ' · ' + esc(fmtDuration(state.sessionDurationMs)) + '</div>' +
          '<div class="spec-result-actions">' +
            '<button class="spec-btn primary" type="button" data-spec-action="start-topic" data-spec-subject="' + esc(subject.id) + '" data-spec-topic="' + esc(topic.id) + '">↻ Повторить тему</button>' +
            '<button class="spec-btn" type="button" data-spec-action="open-subject" data-spec-subject="' + esc(subject.id) + '">← К темам</button>' +
            '<button class="spec-btn" type="button" data-spec-action="open-menu">Все предметы</button>' +
          '</div>' +
        '</div>' +
        '<div class="spec-section-title">Разбор ошибок</div>' +
        '<div class="spec-review-list">' +
          (wrong.length ? wrong.map((row, idx) => '<div class="spec-review-card"><div class="spec-review-q">' + esc((idx + 1) + '. ' + row.q) + '</div><div class="spec-review-line"><span>Ваш ответ</span><strong class="bad">' + esc(row.choice || '—') + '</strong></div><div class="spec-review-line"><span>Верный ответ</span><strong class="ok">' + esc(row.a) + '</strong></div><div class="spec-review-hint">' + esc(row.h) + '</div></div>').join('') : '<div class="spec-empty">Ошибок нет. Хорошая сессия.</div>') +
        '</div>' +
      '</section>';
  }

  function renderDiagnosticResult(){
    const root = byId('spec-root');
    const subject = subjectById(state.subjectId);
    if (!subject) return openMenu();
    const total = state.queue.length;
    const score = pct(state.ok, total);
    const wrong = state.answers.filter((row) => !row.correct);
    const stats = Array.isArray(state.diagStats) ? state.diagStats.slice() : [];
    const strong = stats.slice().sort((a, b) => {
      if (a.pct !== b.pct) return b.pct - a.pct;
      if (a.ok !== b.ok) return b.ok - a.ok;
      return String(a.topicName).localeCompare(String(b.topicName), 'ru');
    }).slice(0, 3);
    root.innerHTML = '' +
      '<section class="spec-screen">' +
        '<div class="spec-result">' +
          '<div class="spec-result-n">' + score + '%</div>' +
          '<div class="spec-result-sub">' + state.ok + ' из ' + total + ' верно · диагностика по ' + esc(subject.nm) + ' · ' + esc(fmtDuration(state.sessionDurationMs)) + '</div>' +
          '<div class="spec-result-actions">' +
            '<button class="spec-btn primary" type="button" data-spec-action="start-diagnostic" data-spec-subject="' + esc(subject.id) + '">↻ Повторить диагностику</button>' +
            '<button class="spec-btn" type="button" data-spec-action="open-subject" data-spec-subject="' + esc(subject.id) + '">← К предмету</button>' +
            '<button class="spec-btn" type="button" data-spec-action="open-menu">Все предметы</button>' +
          '</div>' +
        '</div>' +
        '<div class="spec-section-title">Карта тем</div>' +
        '<div class="spec-result spec-topic-bars">' +
          (stats.length ? stats.map((item) => '<div class="spec-topic-bar-row"><div class="spec-topic-bar-head"><strong>' + esc(item.topicName) + '</strong><span>' + item.pct + '% · ' + item.ok + '/' + item.total + '</span></div><div class="spec-topic-bar-track"><div class="spec-topic-bar-fill ' + widthClass(item.pct) + ' ' + badgeFillClass(item.pct) + '"></div></div></div>').join('') : '<div class="spec-empty">Статистика по темам пока не собрана.</div>') +
        '</div>' +
        '<div class="spec-section-title">Слабые темы</div>' +
        '<div class="spec-review-list">' +
          (stats.length ? stats.slice(0, 5).map((item) => '<div class="spec-weak-card"><div><div class="spec-review-q">' + esc(item.topicName) + '</div><div class="spec-review-line"><span>Точность</span><strong class="' + badgeTextClass(item.pct) + '">' + item.pct + '%</strong></div></div><button class="spec-btn" type="button" data-spec-action="start-topic" data-spec-subject="' + esc(subject.id) + '" data-spec-topic="' + esc(item.topicId) + '">Проработать →</button></div>').join('') : '<div class="spec-empty">Слабые темы не определились.</div>') +
        '</div>' +
        '<div class="spec-section-title">Сильные стороны</div>' +
        '<div class="spec-review-list">' +
          (strong.length ? strong.map((item) => '<div class="spec-weak-card"><div><div class="spec-review-q">' + esc(item.topicName) + '</div><div class="spec-review-line"><span>Точность</span><strong class="' + badgeTextClass(item.pct) + '">' + item.pct + '%</strong></div></div><button class="spec-btn" type="button" data-spec-action="start-topic" data-spec-subject="' + esc(subject.id) + '" data-spec-topic="' + esc(item.topicId) + '">Ещё 20 →</button></div>').join('') : '<div class="spec-empty">Сильные темы появятся после первой диагностики.</div>') +
        '</div>' +
        '<div class="spec-section-title">Ошибки и подсказки</div>' +
        '<div class="spec-review-list">' +
          (wrong.length ? wrong.slice(0, 10).map((row, idx) => '<div class="spec-review-card"><div class="spec-review-q">' + esc((idx + 1) + '. ' + row.q) + '</div><div class="spec-review-line"><span>Тема</span><strong>' + esc(row.topicName) + '</strong></div><div class="spec-review-line"><span>Ваш ответ</span><strong class="bad">' + esc(row.choice || '—') + '</strong></div><div class="spec-review-line"><span>Верный ответ</span><strong class="ok">' + esc(row.a) + '</strong></div><div class="spec-review-hint">' + esc(row.h) + '</div></div>').join('') : '<div class="spec-empty">Ошибок нет. Отличный результат по всему направлению.</div>') +
        '</div>' +
      '</section>';
  }

  function renderResult(){
    if (state.mode === 'diagnostic') return renderDiagnosticResult();
    return renderTrainingResult();
  }

  function render(){
    initRootDelegation();
    if (!byId('spec-root')) return;
    try {
      document.body.setAttribute('data-spec-screen', state.screen || 'menu');
      document.body.setAttribute('data-trainer-screen', state.screen === 'quiz' ? 'immersive' : 'browse');
    } catch(_) {}
    if (state.screen === 'subject') renderSubject();
    else if (state.screen === 'quiz') renderQuiz();
    else if (state.screen === 'result') renderResult();
    else renderMenu();
    decorateSpecA11y();
  }

  function openMenu(){
    resetSession();
    state.screen = 'menu';
    state.subjectId = null;
    state.topicId = null;
    state.topicQuery = '';
    setLoading(false, '');
    render();
  }

  function openSubject(subjectId){
    if (!subjectById(subjectId)) return;
    resetSession();
    state.screen = 'subject';
    state.subjectId = subjectId;
    state.topicId = null;
    state.topicQuery = '';
    setError('');
    setLoading(false, '');
    render();
    loadSubject(subjectId).catch(() => {});
  }

  async function startTopic(subjectId, topicId){
    const subjectMeta = subjectById(subjectId);
    const topicMeta = topicById(subjectId, topicId);
    if (!subjectMeta || !topicMeta) return false;
    setError('');
    setLoading(true, 'Загружаю банк темы…');
    render();
    try {
      const subject = await loadSubject(subjectId);
      const topic = loadedTopicById(subject.id, topicId);
      if (!topic || !topic.questions.length) throw new Error('Topic bank missing');
      resetSession();
      state.screen = 'quiz';
      state.mode = 'train';
      state.subjectId = subjectId;
      state.topicId = topicId;
      state.queue = sampleQuestions(topic.questions, SESSION_SIZE);
      state.index = 0;
      state.ok = 0;
      state.answers = [];
      state.revealed = false;
      setLoading(false, '');
      startTimer();
      state.timerNow = Date.now();
      render();
      return true;
    } catch (error) {
      console.error(error);
      setLoading(false, '');
      setError('Не удалось загрузить тему. Проверьте офлайн-кэш или обновите страницу.');
      state.screen = 'subject';
      state.subjectId = subjectId;
      render();
      return false;
    }
  }

  async function startDiagnostic(subjectId){
    const subjectMeta = subjectById(subjectId);
    if (!subjectMeta) return false;
    setError('');
    setLoading(true, 'Собираю диагностическую выборку…');
    render();
    try {
      const subject = await loadSubject(subjectId);
      const queue = buildDiagnosticQueue(subject, DIAG_SESSION_SIZE);
      if (!queue.length) throw new Error('Diagnostic queue is empty');
      resetSession();
      state.screen = 'quiz';
      state.mode = 'diagnostic';
      state.subjectId = subjectId;
      state.topicId = null;
      state.queue = queue;
      state.index = 0;
      state.ok = 0;
      state.answers = [];
      state.revealed = false;
      setLoading(false, '');
      startTimer();
      state.timerNow = Date.now();
      render();
      return true;
    } catch (error) {
      console.error(error);
      setLoading(false, '');
      setError('Не удалось собрать диагностику. Проверьте офлайн-кэш или обновите страницу.');
      state.screen = 'subject';
      state.subjectId = subjectId;
      render();
      return false;
    }
  }

  function answerQuestion(choice){
    const q = currentQuestion();
    if (!q || state.revealed) return;
    const selected = String(choice || '').trim();
    const correct = selected === q.a;
    state.answers.push({
      q: q.q,
      a: q.a,
      choice: selected,
      correct: correct,
      h: q.h,
      ex: q.ex,
      topicId: q.topicId,
      topicName: q.topicName
    });
    if (correct) state.ok += 1;
    state.revealed = true;
    render();
  }

  function finishSession(){
    const subject = subjectById(state.subjectId);
    if (!subject) return openMenu();
    state.sessionDurationMs = Math.max(0, Date.now() - state.timerStartedAt);
    stopTimer();
    const total = state.queue.length;
    const wrong = state.answers.filter((row) => !row.correct);
    const summary = {
      at: nowIso(),
      ok: state.ok,
      total: total,
      pct: pct(state.ok, total),
      wrongCount: wrong.length,
      durationMs: state.sessionDurationMs
    };
    if (state.mode === 'diagnostic') {
      const stats = buildDiagnosticTopicStats(subject);
      state.diagStats = stats;
      recordDiagnosticSession(subject, summary, stats);
      state.screen = 'result';
      render();
      return;
    }
    const topic = topicById(state.subjectId, state.topicId);
    if (!topic) return openSubject(state.subjectId);
    recordTrainingSession(subject, topic, summary);
    state.screen = 'result';
    render();
  }

  function nextQuestion(){
    if (!state.revealed) return;
    state.index += 1;
    state.revealed = false;
    if (state.index >= state.queue.length) {
      finishSession();
      return;
    }
    render();
  }

  function confirmExit(){
    if (!state.queue.length) return openSubject(state.subjectId);
    if (state.revealed || state.index === 0) return openSubject(state.subjectId);
    if (window.confirm('Выйти из сессии? Прогресс текущей мини-сессии не сохранится.')) openSubject(state.subjectId);
  }


  function preloadSubjectBank(subjectId){
    setError('');
    setLoading(true, 'Подгружаю банк…');
    render();
    return loadSubject(subjectId).then((subject) => {
      setLoading(false, '');
      render();
      return subject;
    }).catch((error) => {
      console.error(error);
      setLoading(false, '');
      setError('Подгрузка не удалась.');
      render();
      throw error;
    });
  }

  function resumeLastTopic(){
    const last = getLastTopic();
    if (last && topicById(last.subjectId, last.topicId)) return startTopic(last.subjectId, last.topicId);
    return false;
  }

  function handleRootInput(event){
    const target = event && event.target && typeof event.target.getAttribute === 'function' ? event.target : null;
    if (!target) return;
    const inputType = target.getAttribute('data-spec-input') || '';
    if (inputType === 'menu-query') {
      state.menuQuery = String(target.value || '');
      render();
    } else if (inputType === 'topic-query') {
      state.topicQuery = String(target.value || '');
      render();
    }
  }

  function handleRootClick(event){
    const target = event && event.target && typeof event.target.closest === 'function' ? event.target.closest('[data-spec-action]') : null;
    if (!target) return;
    const action = String(target.getAttribute('data-spec-action') || '');
    const subjectId = String(target.getAttribute('data-spec-subject') || '');
    const topicId = String(target.getAttribute('data-spec-topic') || '');
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (action === 'resume-last') resumeLastTopic();
    else if (action === 'clear-menu-query') { state.menuQuery = ''; render(); }
    else if (action === 'clear-topic-query') { state.topicQuery = ''; render(); }
    else if (action === 'open-menu') openMenu();
    else if (action === 'open-subject' && subjectId) openSubject(subjectId);
    else if (action === 'start-topic' && subjectId && topicId) startTopic(subjectId, topicId);
    else if (action === 'start-diagnostic' && subjectId) startDiagnostic(subjectId);
    else if (action === 'preload-subject' && subjectId) preloadSubjectBank(subjectId);
    else if (action === 'confirm-exit') confirmExit();
    else if (action === 'next-question') nextQuestion();
    else if (action === 'answer') {
      const index = Number(target.getAttribute('data-spec-option-index'));
      const q = currentQuestion();
      if (q && Array.isArray(q.o) && Number.isInteger(index) && index >= 0 && index < q.o.length) answerQuestion(q.o[index]);
    }
  }

  function initRootDelegation(){
    const root = byId('spec-root');
    if (!root || root.__wave89aDelegation) return;
    root.__wave89aDelegation = true;
    root.addEventListener('click', handleRootClick);
    root.addEventListener('input', handleRootInput);
  }

  function routeFromHash(){
    const raw = String((window.location && window.location.hash) || '').replace(/^#/, '').trim();
    if (!raw) return false;
    if (!/^spec\//.test(raw)) return false;
    const parts = raw.split('/');
    if (parts[1] === 'diag' && parts[2] && subjectById(parts[2])) {
      startDiagnostic(parts[2]);
      return true;
    }
    if (parts[1] && parts[2] && topicById(parts[1], parts[2])) {
      startTopic(parts[1], parts[2]);
      return true;
    }
    if (parts[1] && subjectById(parts[1])) {
      openSubject(parts[1]);
      return true;
    }
    return false;
  }

  function updateHash(){
    try {
      if (state.screen === 'subject' && state.subjectId) window.history.replaceState(null, '', '#spec/' + state.subjectId);
      else if (state.screen === 'quiz' && state.mode === 'diagnostic' && state.subjectId) window.history.replaceState(null, '', '#spec/diag/' + state.subjectId);
      else if (state.screen === 'quiz' && state.subjectId && state.topicId) window.history.replaceState(null, '', '#spec/' + state.subjectId + '/' + state.topicId);
      else window.history.replaceState(null, '', '#');
    } catch(_) {}
  }

  const originalRender = render;
  render = function(){ originalRender(); updateHash(); };

  window.__specDebug = {
    version: VERSION,
    manifest: SPEC_MANIFEST,
    subjects: SPEC_SUBJECTS,
    openMenu: openMenu,
    openSubject: openSubject,
    startTopic: startTopic,
    startDiagnostic: startDiagnostic,
    preloadSubject: preloadSubjectBank,
    answer: answerQuestion,
    nextQuestion: nextQuestion,
    confirmExit: confirmExit,
    resumeLast: resumeLastTopic,
    setMenuQuery: function(value){ state.menuQuery = String(value || ''); render(); },
    setTopicQuery: function(value){ state.topicQuery = String(value || ''); render(); },
    loadSubject: loadSubject,
    loadedSubjects: loadedSubjects,
    state: state
  };
  window.__wave91bSpecSubjects = {
    version: 'wave91b',
    auditSnapshot: function(){
      return {
        version: VERSION,
        subjects: SPEC_MANIFEST.subjects,
        topics: SPEC_MANIFEST.topics,
        totalQuestions: SPEC_MANIFEST.totalQuestions,
        newSubjects: ['fashion_design','architecture','graphic_design','interior_design','design_entrance'].filter(function(id){ return !!subjectById(id); })
      };
    }
  };
  window.__wave89aSpecSubjects = {
    version: 'wave89a',
    auditSnapshot: function(){
      const root = byId('spec-root');
      const html = root ? String(root.innerHTML || '') : '';
      return {
        version: 'wave89a',
        screen: state.screen,
        delegated: !!(root && root.__wave89aDelegation),
        hasInlineHandlers: /on(?:click|input|change|keydown)\s*=/.test(html),
        hasInlineStyles: /style\s*=/.test(html),
        actionNodes: root ? root.querySelectorAll('[data-spec-action]').length : 0,
        inputNodes: root ? root.querySelectorAll('[data-spec-input]').length : 0
      };
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', routeFromHash);
  }

  if (!routeFromHash()) render();
})();
