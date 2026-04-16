(function(){
  var works = false;
  try {
    var testKey = '__trainer_storage_probe__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    works = true;
  } catch(e) { works = false; }

  if (!works) {
    var memStore = {};
    var memoryLocalStorage = {
      getItem: function(k) { return k in memStore ? memStore[k] : null; },
      setItem: function(k, v) { memStore[k] = String(v); },
      removeItem: function(k) { delete memStore[k]; },
      clear: function() { memStore = {}; },
      key: function(i) { return Object.keys(memStore)[i] || null; },
      get length() { return Object.keys(memStore).length; }
    };
    try {
      Object.defineProperty(window, 'localStorage', {
        value: memoryLocalStorage,
        writable: true,
        configurable: true
      });
    } catch(e) {
      window.__safeStorage = memoryLocalStorage;
    }
    try { console.warn('[trainer] localStorage недоступен, использую in-memory fallback'); } catch(_) {}
    if (typeof window.showToast === 'function') {
      setTimeout(function(){
        try { window.showToast('Приватный режим: прогресс не сохраняется на устройстве'); } catch(_) {}
      }, 1500);
    }
  }

  window.safeStorage = {
    get: function(k, def) {
      try {
        var v = window.localStorage.getItem(k);
        return v === null ? (def === undefined ? null : def) : v;
      } catch(e) { return def === undefined ? null : def; }
    },
    set: function(k, v) {
      try { window.localStorage.setItem(k, v); return true; }
      catch(e) { return false; }
    },
    remove: function(k) {
      try { window.localStorage.removeItem(k); return true; }
      catch(e) { return false; }
    },
    getJSON: function(k, def) {
      try {
        var raw = window.localStorage.getItem(k);
        return raw === null ? def : JSON.parse(raw);
      } catch(e) { return def; }
    },
    setJSON: function(k, obj) {
      try {
        window.localStorage.setItem(k, JSON.stringify(obj));
        return true;
      } catch(e) { return false; }
    }
  };
})();
