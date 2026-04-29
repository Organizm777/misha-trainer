#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const ROOT = process.cwd();
const CHECK = process.argv.includes('--check');
const MAX_BYTES = 450 * 1024;
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function size(rel){ return fs.statSync(path.join(ROOT, rel)).size; }
function uniq(list){ return list.filter((v, i, a) => v && a.indexOf(v) === i && exists(v)); }
const manifestPath = path.join(ROOT, 'assets/asset-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const assets = manifest.assets || {};
const criticalLogical = [
  'assets/js/bundle_grade_runtime_core_wave87n.js',
  'assets/js/bundle_grade_runtime_extended_wave89b.js',
  'assets/js/chunk_grade_lazy_payloads_wave91h.js',
  'assets/js/bundle_shell.js',
  'assets/js/engine10.js',
  'assets/js/chunk_exam_bank_wave89q.js',
  'assets/css/wave86x_inline_index.css',
  'assets/css/engine10.css',
  'assets/css/wave86x_inline_grade.css',
  'assets/css/wave86z_static_style_classes.css'
];
const html = fs.readdirSync(ROOT).filter(n => n.endsWith('.html'));
const smallAssets = Object.values(assets).filter(rel => /\.(js|css)$/.test(rel) && exists(rel) && size(rel) <= MAX_BYTES);
const files = uniq([
  ...html,
  'manifest.webmanifest',
  'healthz.json',
  ...criticalLogical.map(k => assets[k]),
  ...smallAssets
]).filter(rel => size(rel) > 256);
let written = 0;
const missing = [];
const stale = [];
for (const rel of files) {
  const abs = path.join(ROOT, rel);
  const br = abs + '.br';
  const input = fs.readFileSync(abs);
  const compressed = zlib.brotliCompressSync(input, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 1 } });
  if (CHECK) {
    if (!fs.existsSync(br)) missing.push(rel + '.br');
    else if (!fs.readFileSync(br).equals(compressed)) stale.push(rel + '.br');
  } else {
    fs.writeFileSync(br, compressed);
    written++;
  }
}
if (CHECK && (missing.length || stale.length)) {
  console.error(JSON.stringify({ ok:false, missing:missing.slice(0,20), stale:stale.slice(0,20), total:files.length }, null, 2));
  process.exit(1);
}
if (!CHECK) {
  manifest.brotli_count = written;
  manifest.brotli_wave = manifest.wave || 'wave91j';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}
console.log(JSON.stringify({ ok:true, mode:CHECK?'check':'write', files:files.length, brotli:CHECK?files.length:written, maxBytes:MAX_BYTES }, null, 2));
