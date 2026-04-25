#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function assert(condition, message){ if (!condition) throw new Error(message); }
function firstBuilt(manifest, logicals){
  for (const logical of logicals) {
    const built = manifest.assets && manifest.assets[logical];
    if (built) return { logical, built };
  }
  return { logical: logicals[0], built: '' };
}

function countUses(raw, fnName){
  const all = raw.match(new RegExp(`\\b${fnName}\\(`, 'g')) || [];
  return Math.max(0, all.length - 1);
}

const manifest = JSON.parse(read('assets/asset-manifest.json'));
const logical = 'assets/js/bundle_grade_runtime_interactions_wave87w.js';
const mergedLogical = 'assets/js/bundle_grade_runtime_extended_wave89b.js';
const runtimeChoice = firstBuilt(manifest, [logical, mergedLogical]);
const builtRel = runtimeChoice.built;
const usingMerged = runtimeChoice.logical === mergedLogical;
assert(builtRel, `asset-manifest.json: missing ${logical} or ${mergedLogical}`);
assert(fs.existsSync(path.join(ROOT, builtRel)), `missing built asset ${builtRel}`);

const runtimeSrc = read('assets/_src/js/bundle_grade_runtime_interactions_wave87w.js');
assert(runtimeSrc.includes("window.__wave87wInteractiveFormats"), 'runtime source: missing wave87w guard export');
assert(runtimeSrc.includes("find-error") && runtimeSrc.includes("sequence") && runtimeSrc.includes("match") && runtimeSrc.includes("multi-select"), 'runtime source: missing interaction type constants');
assert(runtimeSrc.includes('submitCustomValue') && runtimeSrc.includes('renderInteractiveFeedback'), 'runtime source: missing submit/feedback helpers');
assert(runtimeSrc.includes('renderFindError') && runtimeSrc.includes('renderSequence') && runtimeSrc.includes('renderMatch'), 'runtime source: missing one of the custom renderers');
assert(runtimeSrc.includes('root.nextQ = function') && runtimeSrc.includes('root.render = function'), 'runtime source: missing nextQ/render patches');

const pageChecks = [];
for (let grade = 1; grade <= 11; grade++) {
  const htmlFile = `grade${grade}_v2.html`;
  const html = read(htmlFile);
  const hasRuntime = html.includes('./' + builtRel);
  if (grade >= 8) assert(hasRuntime, `${htmlFile}: missing ${builtRel}`);
  else if (usingMerged) assert(hasRuntime, `${htmlFile}: merged runtime should stay present on ${htmlFile}`);
  else assert(!hasRuntime, `${htmlFile}: unexpected ${builtRel}`);
  pageChecks.push({ grade, hasRuntime });
}
assert(read('sw.js').includes(`'./${builtRel}'`), `sw.js: missing ${builtRel}`);

const sourceChecks = [
  {
    file:'assets/_src/js/grade8_data.js',
    ids:['formula8w87v','calc8w87v','code8w87v'],
    min:{ errorRow:1, sequenceRow:1, matchRow:1 }
  },
  {
    file:'assets/_src/js/grade9_data.js',
    ids:['formula9w87v','calc9w87v','code9w87v'],
    min:{ errorRow:1, sequenceRow:1, matchRow:1 }
  },
  {
    file:'assets/_src/js/grade11_data.js',
    ids:['formula11w87v','calc11w87v','code11w87v'],
    min:{ errorRow:1, sequenceRow:1, matchRow:1 }
  },
  {
    file:'assets/_src/js/grade10_subject_alg_wave86s.js',
    ids:['formula10w87v'],
    min:{ errorRow:1 }
  },
  {
    file:'assets/_src/js/grade10_subject_phy_wave86s.js',
    ids:['calc10w87v'],
    min:{ sequenceRow:1 }
  },
  {
    file:'assets/_src/js/grade10_subject_inf_wave86s.js',
    ids:['code10w87v'],
    min:{ matchRow:1 }
  },
  {
    file:'assets/_src/js/grade10_subject_chem_wave86s.js',
    ids:['chemcalc10w87v'],
    min:{ sequenceRow:1 }
  }
];

const counts = { filesChecked: 0, topicIdsChecked: 0, interactiveRows: 0, perType: { 'find-error': 0, sequence: 0, match: 0 }, files: [] };
for (const item of sourceChecks) {
  const raw = read(item.file);
  assert(raw.includes('attachRowMeta') && raw.includes('interactionType'), `${item.file}: missing interaction row metadata plumbing`);
  for (const id of item.ids) {
    assert(raw.includes(id), `${item.file}: missing topic id ${id}`);
    counts.topicIdsChecked += 1;
  }
  const uses = {
    errorRow: countUses(raw, 'errorRow'),
    sequenceRow: countUses(raw, 'sequenceRow'),
    matchRow: countUses(raw, 'matchRow')
  };
  if (item.min.errorRow) assert(uses.errorRow >= item.min.errorRow, `${item.file}: expected >=${item.min.errorRow} errorRow use, got ${uses.errorRow}`);
  if (item.min.sequenceRow) assert(uses.sequenceRow >= item.min.sequenceRow, `${item.file}: expected >=${item.min.sequenceRow} sequenceRow use, got ${uses.sequenceRow}`);
  if (item.min.matchRow) assert(uses.matchRow >= item.min.matchRow, `${item.file}: expected >=${item.min.matchRow} matchRow use, got ${uses.matchRow}`);
  counts.filesChecked += 1;
  counts.interactiveRows += uses.errorRow + uses.sequenceRow + uses.matchRow;
  counts.perType['find-error'] += uses.errorRow;
  counts.perType.sequence += uses.sequenceRow;
  counts.perType.match += uses.matchRow;
  counts.files.push({ file:item.file, ids:item.ids.length, uses });
}

assert(counts.interactiveRows >= 13, `expected at least 13 interactive rows across sources, got ${counts.interactiveRows}`);
assert(counts.perType['find-error'] >= 4, `expected at least 4 find-error rows, got ${counts.perType['find-error']}`);
assert(counts.perType.sequence >= 5, `expected at least 5 sequence rows, got ${counts.perType.sequence}`);
assert(counts.perType.match >= 4, `expected at least 4 match rows, got ${counts.perType.match}`);

const healthz = JSON.parse(read('healthz.json'));
assert(/^(wave87[wxyz]|wave88[abcd]|wave89[abcd])$/.test(healthz.wave), `healthz.json: expected wave87w/wave87x/wave87y/wave87z/wave88a/wave88b/wave88c/wave88d/wave89a/wave89b/wave89c/wave89d, got ${healthz.wave}`);
assert(/^(wave87[wxyz]|wave88[abcd]|wave89[abcd])$/.test(healthz.build_id), `healthz.json: expected build_id wave87w/wave87x/wave87y/wave87z/wave88a/wave88b/wave88c/wave88d/wave89a/wave89b/wave89c/wave89d, got ${healthz.build_id}`);

console.log(JSON.stringify({
  logical,
  builtRel,
  healthzWave: healthz.wave,
  pageChecks,
  counts
}, null, 2));
