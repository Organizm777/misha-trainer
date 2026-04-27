#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function assert(condition, message){ if (!condition) throw new Error(message); }

const engineSrc = read('assets/_src/js/engine10.js');
const inputsSrc = read('assets/_src/js/bundle_grade_runtime_inputs_timing_wave87x.js');
const mergedSrc = read('assets/_src/js/bundle_grade_runtime_extended_wave89b.js');
const manifest = JSON.parse(read('assets/asset-manifest.json'));

function built(logical){
  const rel = manifest.assets && manifest.assets[logical];
  assert(rel, `asset-manifest missing ${logical}`);
  assert(fs.existsSync(path.join(ROOT, rel)), `missing built asset ${rel}`);
  return read(rel);
}

const engineBuilt = built('assets/js/engine10.js');
const mergedBuilt = built('assets/js/bundle_grade_runtime_extended_wave89b.js');
const runtimeBuilt = manifest.assets['assets/js/bundle_grade_runtime_inputs_timing_wave87x.js']
  ? built('assets/js/bundle_grade_runtime_inputs_timing_wave87x.js')
  : '';

function hasBridge(source){
  return source.includes('window.__wave89vStateBridge')
    && source.includes('bindWindowState("sel"')
    && source.includes('bindWindowState("prob"')
    && source.includes('bindWindowState("cS"')
    && source.includes('bindWindowState("cT"')
    && source.includes('bindWindowState("hintOn"')
    && source.includes('bindWindowState("shpOn"')
    && source.includes('bindWindowState("usedHelp"')
    && source.includes('bindWindowState("mix"')
    && source.includes('bindWindowState("globalMix"')
    && source.includes('bindWindowState("rushMode"')
    && source.includes('bindWindowState("diagMode"');
}

function hasGradeGuard(source){
  return source.includes('function autoInputEligible(question)')
    && source.includes('return grade >= 8;')
    && source.includes('if (!autoInputEligible(question)) return \'\';');
}

function explicitPrecedesGuard(source){
  const explicitIdx = source.indexOf('var explicit = explicitInputMode(question);');
  const guardIdx = source.indexOf('if (!autoInputEligible(question)) return \'\';');
  return explicitIdx >= 0 && guardIdx > explicitIdx;
}

assert(hasBridge(engineSrc), 'engine10 source: missing wave89v window-state bridge');
assert(hasBridge(engineBuilt), 'engine10 built asset: missing wave89v window-state bridge');
assert(hasGradeGuard(inputsSrc), 'inputs timing source: missing grade>=8 auto-input guard');
assert(hasGradeGuard(mergedSrc), 'merged runtime source: missing grade>=8 auto-input guard');
assert(explicitPrecedesGuard(inputsSrc), 'inputs timing source: explicit input mode must win before grade guard');
assert(explicitPrecedesGuard(mergedSrc), 'merged runtime source: explicit input mode must win before grade guard');
assert(hasGradeGuard(mergedBuilt), 'merged runtime built asset: missing grade>=8 auto-input guard');
if (runtimeBuilt) assert(hasGradeGuard(runtimeBuilt), 'inputs timing built asset: missing grade>=8 auto-input guard');

const grade2Html = read('grade2_v2.html');
const grade10Html = read('grade10_v2.html');
assert(!grade2Html.includes('chunk_subject_expansion_wave89b_inputs_interactions_banks'), 'grade2_v2.html: unexpected explicit input-bank chunk');
assert(grade10Html.includes('chunk_subject_expansion_wave89b_inputs_interactions_banks'), 'grade10_v2.html: missing explicit input-bank chunk');

console.log(JSON.stringify({
  ok: true,
  wave: 'wave89v',
  bridge: {
    source: hasBridge(engineSrc),
    built: hasBridge(engineBuilt)
  },
  autoInputGuard: {
    sourceRuntime: hasGradeGuard(inputsSrc),
    sourceMerged: hasGradeGuard(mergedSrc),
    builtMerged: hasGradeGuard(mergedBuilt),
    builtRuntime: runtimeBuilt ? hasGradeGuard(runtimeBuilt) : 'not-built'
  },
  pages: {
    grade2HasExplicitInputChunk: false,
    grade10HasExplicitInputChunk: true
  }
}, null, 2));
