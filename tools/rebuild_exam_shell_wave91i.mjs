#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/asset-manifest.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/exam_bank/catalog.json'), 'utf8'));
const logicalByFamily = {
  oge_math_2026_full: 'assets/js/exam_bank_oge_math_wave91.js',
  oge_russian_2026_full: 'assets/js/exam_bank_oge_russian_wave91.js',
  oge_english_2026_full: 'assets/js/exam_bank_oge_english_wave91.js',
  oge_social_2026_full: 'assets/js/exam_bank_oge_social_wave91.js',
  ege_profile_math_2026_part1: 'assets/js/exam_bank_ege_profile_math_wave91.js',
  ege_base_math_2026_full: 'assets/js/exam_bank_ege_base_math_wave91.js',
  ege_russian_2026_part1: 'assets/js/exam_bank_ege_russian_wave91.js',
  ege_social_2026_part1: 'assets/js/exam_bank_ege_social_wave91.js',
  ege_english_2026_part1: 'assets/js/exam_bank_ege_english_wave91.js',
  ege_physics_2026_part1: 'assets/js/exam_bank_ege_physics_wave91.js',
  oge_informatics_2026_full: 'assets/js/exam_bank_oge_informatics_wave91i.js',
  ege_informatics_2026_part1: 'assets/js/exam_bank_ege_informatics_wave91i.js',
  oge_history_2026_full: 'assets/js/exam_bank_oge_history_wave91i.js',
  ege_history_2026_part1: 'assets/js/exam_bank_ege_history_wave91i.js'
};
const familyChunks = {};
for (const [family, logical] of Object.entries(logicalByFamily)) {
  const built = manifest.assets && manifest.assets[logical];
  if (!built) throw new Error(`asset-manifest missing ${logical} for ${family}`);
  familyChunks[family] = './' + built;
}
const payload = {
  version: 'wave91i',
  schema: 'wave89q_exam_bank_v1',
  catalog,
  banks: {},
  families: {},
  lazy: { familyChunks },
  __familyPromises: {},
  __loadedFamilies: {}
};
const source = `/* wave91i lazy exam bank shell: catalog + expanded subject chunk loader */\n(function(global){\n  var payload = ${JSON.stringify(payload)};\n  function hasFamily(familyId){ return !!(payload.families && payload.families[familyId]); }\n  payload.__resolveFamily = function(familyId){\n    payload.__loadedFamilies[familyId] = true;\n    return payload.families && payload.families[familyId];\n  };\n  payload.loadFamily = function(familyId){\n    familyId = String(familyId || \"\");\n    if (!familyId) return Promise.reject(new Error(\"empty exam family id\"));\n    if (hasFamily(familyId)) return Promise.resolve(payload.families[familyId]);\n    if (payload.__familyPromises[familyId]) return payload.__familyPromises[familyId];\n    var src = payload.lazy && payload.lazy.familyChunks && payload.lazy.familyChunks[familyId];\n    if (!src) return Promise.reject(new Error(\"missing lazy exam bank chunk for \" + familyId));\n    payload.__familyPromises[familyId] = new Promise(function(resolve, reject){\n      if (!global.document || !document.createElement) { reject(new Error(\"document is unavailable\")); return; }\n      var existing = document.querySelector && document.querySelector('script[data-wave89q-family="' + familyId + '"]');\n      if (existing) {\n        existing.addEventListener('load', function(){ hasFamily(familyId) ? resolve(payload.families[familyId]) : reject(new Error(\"lazy exam bank chunk loaded but family is absent: \" + familyId)); }, { once:true });\n        existing.addEventListener('error', function(){ reject(new Error(\"failed to load lazy exam bank chunk: \" + src)); }, { once:true });\n        return;\n      }\n      var script = document.createElement(\"script\");\n      script.src = src;\n      script.async = true;\n      script.dataset.wave89qFamily = familyId;\n      script.onload = function(){\n        if (hasFamily(familyId)) resolve(payload.families[familyId]);\n        else reject(new Error(\"lazy exam bank chunk loaded but family is absent: \" + familyId));\n      };\n      script.onerror = function(){ reject(new Error(\"failed to load lazy exam bank chunk: \" + src)); };\n      (document.head || document.documentElement || document.body).appendChild(script);\n    });\n    return payload.__familyPromises[familyId];\n  };\n  payload.ensureFamily = function(familyId, callback){\n    var promise = payload.loadFamily(familyId);\n    if (typeof callback === \"function\") {\n      promise.then(function(family){ callback(family, true); }).catch(function(error){ callback(null, false, error); });\n    }\n    return promise;\n  };\n  payload.availableFamilies = function(){ return Object.keys((payload.lazy && payload.lazy.familyChunks) || {}); };\n  global.WAVE89Q_EXAM_BANK = payload;\n  if (global.window) global.window.WAVE89Q_EXAM_BANK = payload;\n})(typeof globalThis !== \"undefined\" ? globalThis : (typeof window !== \"undefined\" ? window : this));\n`;
fs.writeFileSync(path.join(ROOT, 'assets/_src/js/chunk_exam_bank_wave89q.js'), source);
console.log(JSON.stringify({ ok:true, version:'wave91i', families:Object.keys(familyChunks).length, output:'assets/_src/js/chunk_exam_bank_wave89q.js' }, null, 2));
