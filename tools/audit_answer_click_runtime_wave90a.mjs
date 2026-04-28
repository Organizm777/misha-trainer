#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRel = 'assets/_src/js/bundle_grade_runtime_extended_wave89b.js';
const manifestRel = 'assets/asset-manifest.json';

function read(rel){
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

const manifest = JSON.parse(read(manifestRel));
const builtRel = manifest.assets && manifest.assets['assets/js/bundle_grade_runtime_extended_wave89b.js'];
const source = read(sourceRel);
const built = builtRel && fs.existsSync(path.join(root, builtRel)) ? read(builtRel) : '';

function prelude(text){
  const marker = 'function isInteractiveQuestion';
  const idx = text.indexOf(marker);
  return idx >= 0 ? text.slice(0, idx) : text;
}

const sourcePrelude = prelude(source);
const builtPrelude = prelude(built);
const safeToken = "typeof prob !== 'undefined' ? prob : undefined";
const unsafeToken = "lexicalValue(function(){ return prob; })";

const result = {
  ok: false,
  wave: 'wave90a',
  sourceRel,
  builtRel: builtRel || null,
  sourceSafe: sourcePrelude.includes(safeToken),
  builtSafe: builtPrelude.includes(safeToken),
  sourceUnsafe: sourcePrelude.includes(unsafeToken),
  builtUnsafe: builtPrelude.includes(unsafeToken),
  fallbackToWindowProb: sourcePrelude.includes("return root.prob && typeof root.prob === 'object' ? root.prob : null;") && builtPrelude.includes("return root.prob && typeof root.prob === 'object' ? root.prob : null;"),
  sourceCurrentQuestionCount: (sourcePrelude.match(/function currentQuestion\(/g) || []).length,
  builtCurrentQuestionCount: (builtPrelude.match(/function currentQuestion\(/g) || []).length
};

result.ok = !!(
  builtRel &&
  result.sourceSafe &&
  result.builtSafe &&
  !result.sourceUnsafe &&
  !result.builtUnsafe &&
  result.fallbackToWindowProb &&
  result.sourceCurrentQuestionCount >= 1 &&
  result.builtCurrentQuestionCount >= 1
);

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
