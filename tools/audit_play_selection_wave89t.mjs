#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRel = 'assets/_src/js/engine10.js';
const manifestRel = 'assets/asset-manifest.json';

function read(rel){
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function count(haystack, needle){
  if (!needle) return 0;
  return haystack.split(needle).length - 1;
}

const manifest = JSON.parse(read(manifestRel));
const builtRel = manifest.assets && manifest.assets['assets/js/engine10.js'];
const source = read(sourceRel);
const built = builtRel && fs.existsSync(path.join(root, builtRel)) ? read(builtRel) : '';

const requiredTokens = [
  'data-wave89t-play-action="answer"',
  'data-wave89t-answer-index="${a}"',
  'data-wave89t-play-action="next"',
  'data-wave89t-play-action="hint"',
  'data-wave89t-play-action="shp"',
  'window.wave89tPlayBinding',
  'document.__wave89tPlayControlsBound',
  "document.addEventListener('click',function(event)",
  'const ACTION_ATTR=\'data-wave89t-play-action\'',
  'const ANSWER_INDEX_ATTR=\'data-wave89t-answer-index\''
];
const forbiddenTokens = [
  'onclick="ans(${a})"',
  'onclick="nextQ()"',
  'onclick="wave86uToggleHint()"',
  'onclick="wave86uToggleShp()"'
];

const sourceMissing = requiredTokens.filter((token) => !source.includes(token));
const builtMissing = requiredTokens.filter((token) => !built.includes(token));
const sourceForbidden = forbiddenTokens.filter((token) => source.includes(token));
const builtForbidden = forbiddenTokens.filter((token) => built.includes(token));

const result = {
  ok: false,
  wave: 'wave89t',
  sourceRel,
  builtRel: builtRel || null,
  requiredTokens: requiredTokens.length,
  sourceMissing,
  builtMissing,
  sourceForbidden,
  builtForbidden,
  sourceActionAttrCount: count(source, 'data-wave89t-play-action="'),
  builtActionAttrCount: count(built, 'data-wave89t-play-action="'),
  delegateBoundMarker: source.includes('document.__wave89tPlayControlsBound') && built.includes('document.__wave89tPlayControlsBound'),
  exportedApi: source.includes('window.wave89tPlayBinding') && built.includes('window.wave89tPlayBinding')
};

result.ok = !!(
  builtRel &&
  sourceMissing.length === 0 &&
  builtMissing.length === 0 &&
  sourceForbidden.length === 0 &&
  builtForbidden.length === 0 &&
  result.sourceActionAttrCount >= 4 &&
  result.builtActionAttrCount >= 4 &&
  result.delegateBoundMarker &&
  result.exportedApi
);

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
