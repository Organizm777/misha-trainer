(function(){
  function gradeKey(){ return String(window.GRADE_NUM || '10'); }
  function rushStoreKey(){ return 'trainer_rush_best_' + gradeKey(); }
  function rushPublicKey(){ return 'trainer_rush_public_' + gradeKey(); }
  function hasCloudRush(){ return !!(window.rushBinId || window.RUSH_BIN_ID); }
  function safeJSON(raw, fallback){
    try{
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    }catch(_){
      return fallback;
    }
  }
  function escHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function playerName(){
    try{ return (window.getPlayerName ? getPlayerName() : localStorage.getItem('trainer_player_name')) || 'Ученик'; }
    catch(_){ return 'Ученик'; }
  }
  function getRushPublishMode(){
    try{
      const stored = localStorage.getItem(rushPublicKey());
      if(stored === '1') return true;
      if(stored === '0') return false;
      if(hasCloudRush() && typeof window.getPrivateMode === 'function') return !window.getPrivateMode();
      return false;
    }catch(_){
      return false;
    }
  }
  function setRushPublishMode(value){
    try{ localStorage.setItem(rushPublicKey(), value ? '1' : '0'); }catch(_){ }
  }
  function rushModeLabel(){
    return getRushPublishMode() ? '🌐 Публикация в общем рейтинге включена' : '👤 Общий рейтинг выключен';
  }
  function readRushStore(){
    const data = safeJSON(localStorage.getItem(rushStoreKey()) || '{}', {});
    if(!Array.isArray(data._records)) data._records = [];
    return data;
  }
  function writeRushStore(data){
    try{ localStorage.setItem(rushStoreKey(), JSON.stringify(data)); }catch(_){ }
  }
  function localRushRecords(){
    const data = readRushStore();
    return Array.isArray(data._records) ? data._records.slice() : [];
  }
  function normalizeEntries(list, source){
    return (Array.isArray(list) ? list : []).map(function(row){
      return {
        name: String((row && row.name) || '?').slice(0, 20),
        min: Number(row && row.min) || 0,
        score: Number(row && row.score) || 0,
        date: String((row && row.date) || ''),
        ts: Number(row && row.ts) || 0,
        source: source || (row && row.source) || 'local'
      };
    }).filter(function(row){
      return (row.min === 3 || row.min === 5) && Number.isFinite(row.score);
    });
  }
  function bestRows(entries, minute){
    const best = Object.create(null);
    normalizeEntries(entries).forEach(function(row){
      if(row.min !== minute) return;
      const key = row.name || '?';
      if(!(key in best) || row.score > best[key].score){
        best[key] = row;
      }
    });
    return Object.values(best).sort(function(a,b){ return b.score - a.score || (b.ts || 0) - (a.ts || 0); }).slice(0, 10);
  }
  function latestRows(localRows, cloudRows){
    return normalizeEntries([].concat(localRows || [], cloudRows || [])).sort(function(a,b){ return (b.ts || 0) - (a.ts || 0); }).slice(0, 10);
  }
  function gradeLabel(){
    const raw = String(window.GRADE_TITLE || (window.GRADE_NUM ? window.GRADE_NUM + ' класс' : 'класс'));
    const cleaned = raw.replace(/^[^0-9]*\s*/, '').trim();
    return cleaned || (window.GRADE_NUM ? window.GRADE_NUM + ' класс' : 'класс');
  }
  function minuteBlock(title, rows, accent, background){
    if(!rows.length){
      return '<div style="text-align:center;color:var(--muted);font-size:11px;padding:14px 10px">Пока пусто. Сыграй первым.</div>';
    }
    const me = playerName();
    let html = '<div style="font-size:11px;font-weight:800;color:'+accent+';text-align:center;margin-bottom:8px">'+title+'</div>';
    rows.forEach(function(row, idx){
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : String(idx + 1);
      const mine = row.name === me;
      html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:10px;'+(mine ? 'background:'+background+';border:1px solid '+accent+'33;' : '')+'">'
        + '<div style="width:22px;text-align:center;font-size:12px">'+medal+'</div>'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:12px;font-weight:'+(mine ? '800' : '700')+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escHtml(row.name)+'</div>'
        + '<div style="font-size:10px;color:var(--muted)">'+escHtml(row.source === 'cloud' ? 'общий рейтинг' : 'это устройство')+'</div>'
        + '</div>'
        + '<div style="font-size:'+(idx === 0 ? '22px' : '16px')+';font-weight:900;color:'+accent+'">'+row.score+'</div>'
        + '</div>';
    });
    return html;
  }
  function latestBlock(rows){
    if(!rows.length) return '';
    let html = '<div style="margin-top:14px"><div style="font-size:12px;font-weight:800;margin-bottom:6px;color:var(--muted)">Последние игры</div>';
    rows.forEach(function(row){
      html += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)">'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escHtml(row.name)+'</div>'
        + '<div style="font-size:10px;color:var(--muted)">'+escHtml((row.date || '') + (row.min ? ' · ' + row.min + ' мин' : ''))+' · '+escHtml(row.source === 'cloud' ? 'общий' : 'локальный')+'</div>'
        + '</div>'
        + '<div style="font-size:17px;font-weight:900">'+row.score+'</div>'
        + '</div>';
    });
    html += '</div>';
    return html;
  }
  async function fetchCloudRushRows(){
    if(!hasCloudRush()) return [];
    try{
      const url = 'https://api.npoint.io/' + (window.rushBinId || window.RUSH_BIN_ID);
      const res = window.fetchWithTimeout ? await window.fetchWithTimeout(url, null, 5000) : await fetch(url);
      const data = await res.json();
      return normalizeEntries((data && data.records) || [], 'cloud');
    }catch(_){
      return [];
    }
  }
  async function pushRushRecordPatched(name, min, score){
    if(!hasCloudRush() || !getRushPublishMode()) return false;
    try{
      const url = 'https://api.npoint.io/' + (window.rushBinId || window.RUSH_BIN_ID);
      const fetcher = window.fetchWithTimeout ? window.fetchWithTimeout : async function(u, opts){ return fetch(u, opts); };
      const current = await fetcher(url, null, 5000);
      const payload = await current.json();
      payload.records || (payload.records = []);
      payload.records.push({
        name: String(name || playerName()).slice(0, 20),
        min: Number(min) || 0,
        score: Number(score) || 0,
        date: (new Date()).toLocaleDateString('ru', { day:'numeric', month:'short' }) + ' ' + (new Date()).toLocaleTimeString('ru', { hour:'2-digit', minute:'2-digit' }),
        ts: Date.now()
      });
      if(payload.records.length > 120) payload.records = payload.records.slice(-120);
      await fetcher(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }, 5000);
      return true;
    }catch(err){
      try{
        const q = safeJSON(localStorage.getItem('rush_queue') || '[]', []);
        q.push({ name:String(name || playerName()).slice(0,20), min:Number(min)||0, score:Number(score)||0, ts:Date.now(), reason:'cloud' });
        localStorage.setItem('rush_queue', JSON.stringify(q.slice(-20)));
      }catch(_){ }
      return false;
    }
  }
  function patchPrivacyButton(){
    const original = typeof window.renderPrivacyBtn === 'function' ? window.renderPrivacyBtn : null;
    window.renderPrivacyBtn = function(){
      if(original) original();
      const btn = document.getElementById('privacy-btn');
      if(!btn) return;
      const hidden = typeof window.getPrivateMode === 'function' ? window.getPrivateMode() : true;
      btn.textContent = hidden ? '☁️ Облако выключено' : '☁️ Облако включено';
      btn.style.background = hidden ? '#fee2e2' : '#dbeafe';
      btn.style.color = hidden ? '#dc2626' : '#2563eb';
      btn.title = hidden
        ? 'Облако выключено: код восстановления не обновляется, резервная копия доступна только через файл или код переноса.'
        : 'Облако включено: можно синхронизировать текущий класс и восстанавливать его по коду.';
      let note = document.getElementById('privacy-note');
      if(!note && btn.parentElement){
        note = document.createElement('div');
        note.id = 'privacy-note';
        note.style.cssText = 'margin-top:6px;font-size:11px;line-height:1.45;color:var(--muted)';
        btn.parentElement.appendChild(note);
      }
      if(note){
        note.textContent = hidden
          ? 'Пока облако выключено, резервная копия работает только через файл или код переноса. Рейтинг Молнии настраивается отдельно.'
          : 'Облако включено: код восстановления можно обновлять, а рейтинг Молнии управляется своей настройкой.';
      }
    };
  }
  function patchInfoCopy(){
    const root = document.getElementById('s-info');
    if(!root) return;
    const blocks = Array.from(root.querySelectorAll('p'));
    blocks.forEach(function(p){
      const txt = (p.textContent || '').trim();
      if(txt.includes('Рекорды сохраняются')){
        p.textContent = hasCloudRush()
          ? 'Рекорды Молнии всегда сохраняются на этом устройстве. Публикация в общий рейтинг включается отдельно — по желанию.'
          : 'В этом классе Молния сохраняет рекорды только на этом устройстве. Общий рейтинг пока не подключён.';
      }
      if(txt.includes('Код восстановления показывается')){
        p.textContent = hasCloudRush()
          ? 'Код восстановления показывается в профиле, если включено облако. Для надёжности всегда доступны резервная копия: файл или код переноса без облака.'
          : 'В этом классе облачная синхронизация пока не включена. Для переноса прогресса используй резервную копию: файл или код переноса.';
      }
    });
  }
  function currentModalCard(){
    const overlays = Array.from(document.querySelectorAll('div[style*="z-index:9999"]'));
    return overlays.length ? overlays[overlays.length - 1] : null;
  }
  async function showRushRecordsPatched(){
    try{
      const best = readRushStore();
      window.rushBest = { 3: best[3] || 0, 5: best[5] || 0 };
    }catch(_){ }
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto';
    overlay.onclick = function(){ overlay.remove(); };
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:18px;padding:22px 18px;max-width:420px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 12px 30px rgba(0,0,0,.25)';
    card.onclick = function(ev){ ev.stopPropagation(); };
    card.innerHTML = '<div style="text-align:center;padding:24px"><div style="font-size:24px">⏳</div><div style="font-size:13px;color:var(--muted);margin-top:8px">Загружаю рейтинг Молнии...</div></div>';
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const localRows = normalizeEntries(localRushRecords(), 'local');
    const cloudRows = await fetchCloudRushRows();
    const local3 = bestRows(localRows, 3);
    const local5 = bestRows(localRows, 5);
    const cloud3 = bestRows(cloudRows, 3);
    const cloud5 = bestRows(cloudRows, 5);
    const latest = latestRows(localRows, cloudRows);
    const sharedEnabled = getRushPublishMode();
    const localOnly = !hasCloudRush();

    let html = '<h3 style="font-family:Unbounded,system-ui,sans-serif;font-size:16px;font-weight:800;margin-bottom:8px;text-align:center">🏆 Молния — '+escHtml(gradeLabel())+'</h3>';
    html += '<div style="font-size:11px;color:var(--muted);line-height:1.55;text-align:center;margin-bottom:12px">На устройстве рекорды сохраняются всегда. Общий рейтинг и облачная синхронизация теперь настраиваются отдельно.</div>';

    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">';
    html += '<div style="background:#fef9c3;border-radius:14px;padding:10px">'+minuteBlock('Это устройство · 3 мин', local3, '#92400e', '#fff7ed')+'</div>';
    html += '<div style="background:#fee2e2;border-radius:14px;padding:10px">'+minuteBlock('Это устройство · 5 мин', local5, '#991b1b', '#fff7ed')+'</div>';
    html += '</div>';

    if(localOnly){
      html += '<div style="background:var(--abg);border-radius:12px;padding:12px;font-size:11px;line-height:1.55;color:var(--muted);margin-bottom:10px">☁️ В этом классе общий рейтинг пока не подключён. Локальный рейтинг уже работает и хранится на этом устройстве.</div>';
    } else {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">';
      html += '<div style="background:#ede9fe;border-radius:14px;padding:10px">'+minuteBlock('Общий рейтинг · 3 мин', cloud3, '#6d28d9', '#ede9fe')+'</div>';
      html += '<div style="background:#dbeafe;border-radius:14px;padding:10px">'+minuteBlock('Общий рейтинг · 5 мин', cloud5, '#1d4ed8', '#dbeafe')+'</div>';
      html += '</div>';
      html += '<div style="background:var(--abg);border-radius:12px;padding:12px;margin-bottom:10px">'
        + '<div style="font-size:11px;font-weight:800;margin-bottom:4px">'+escHtml(rushModeLabel())+'</div>'
        + '<div style="font-size:11px;color:var(--muted);line-height:1.5">'
        + (sharedEnabled
            ? 'Новые рекорды могут попадать в общий рейтинг, даже если облако для резервной копии выключено.'
            : 'Пока общий рейтинг выключен, новые рекорды останутся только на этом устройстве. Включить публикацию можно в один тап.')
        + '</div>'
        + '<button type="button" id="rush-public-toggle" style="margin-top:8px;width:100%;padding:10px;border:none;border-radius:10px;background:'+(sharedEnabled ? '#fee2e2' : '#dcfce7')+';color:'+(sharedEnabled ? '#991b1b' : '#166534')+';font-weight:800;cursor:pointer">'+(sharedEnabled ? '👤 Не публиковать в общий рейтинг' : '🌐 Публиковать в общий рейтинг')+'</button>'
        + '</div>';
    }

    html += latestBlock(latest);
    html += '<button type="button" style="margin-top:12px;width:100%;padding:10px;border:none;border-radius:10px;background:var(--text);color:var(--bg);font-weight:800;cursor:pointer" onclick="this.closest(\'div[style*=fixed]\').remove()">Закрыть</button>';
    card.innerHTML = html;
    const toggle = card.querySelector('#rush-public-toggle');
    if(toggle){
      toggle.addEventListener('click', function(){
        const next = !getRushPublishMode();
        setRushPublishMode(next);
        if(typeof window.showToast === 'function'){
          window.showToast(next ? 'Общий рейтинг Молнии включён' : 'Общий рейтинг Молнии выключен', next ? 'success' : 'warn', 2200);
        }
        overlay.remove();
        window.showRushRecords();
      }, { once: true });
    }
  }

  function patchFunctions(){
    window.getRushPublishMode = getRushPublishMode;
    window.setRushPublishMode = setRushPublishMode;
    window.pushRushRecord = pushRushRecordPatched;
    window.showRushRecords = showRushRecordsPatched;
    try{ getRushPublishMode = window.getRushPublishMode; }catch(_){}
    try{ setRushPublishMode = window.setRushPublishMode; }catch(_){}
    try{ pushRushRecord = window.pushRushRecord; }catch(_){}
    try{ showRushRecords = window.showRushRecords; }catch(_){}
    patchPrivacyButton();
    try{ renderPrivacyBtn = window.renderPrivacyBtn; }catch(_){}
    patchInfoCopy();
    if(typeof window.renderPrivacyBtn === 'function') window.renderPrivacyBtn();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchFunctions, { once:true });
  else patchFunctions();
})();
