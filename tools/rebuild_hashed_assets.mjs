#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'assets', 'asset-manifest.json');
const args = process.argv.slice(2).filter(Boolean);

if (!args.length) {
  console.error('Usage: node tools/rebuild_hashed_assets.mjs assets/_src/js/file.js [assets/_src/css/file.css ...]');
  process.exit(1);
}

function norm(rel){ return rel.replace(/^\.\//, '').replace(/\\/g, '/'); }
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function write(rel, data){ fs.writeFileSync(path.join(ROOT, rel), data); }
function hash10(buf){ return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10); }
function runtimeFiles(){
  const files = [];
  for (const name of fs.readdirSync(ROOT)) {
    if (name.endsWith('.html')) files.push(name);
  }
  files.push('sw.js');
  function walk(dir){
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) return;
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      const rel = path.join(dir, entry.name).replace(/\\/g, '/');
      if (entry.isDirectory()) walk(rel);
      else if (/\.(js|css|json)$/.test(entry.name)) files.push(rel);
    }
  }
  walk('assets/_src');
  walk('.github/workflows');
  return Array.from(new Set(files));
}
function replaceInFile(rel, replacements){
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return false;
  const raw = fs.readFileSync(abs, 'utf8');
  let next = raw;
  let changed = false;
  for (const { oldValue, newValue } of replacements) {
    if (!oldValue || oldValue === newValue || !next.includes(oldValue)) continue;
    next = next.split(oldValue).join(newValue);
    changed = true;
  }
  if (changed) fs.writeFileSync(abs, next);
  return changed;
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const replacements = [];
const results = [];

for (const input of args) {
  const srcRel = norm(input);
  if (!srcRel.startsWith('assets/_src/') || !fs.existsSync(path.join(ROOT, srcRel))) {
    throw new Error(`Unsupported or missing source asset: ${srcRel}`);
  }
  const logical = srcRel.replace('assets/_src/', 'assets/');
  const ext = path.extname(logical);
  if (!['.js', '.css'].includes(ext)) throw new Error(`Unsupported asset type: ${srcRel}`);
  const content = fs.readFileSync(path.join(ROOT, srcRel));
  const hash = hash10(content);
  const builtRel = logical.replace(new RegExp(`${ext.replace('.', '\\.')}$`), `.${hash}${ext}`);
  fs.mkdirSync(path.dirname(path.join(ROOT, builtRel)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, builtRel), content);

  const oldBuilt = manifest.assets && manifest.assets[logical] ? manifest.assets[logical] : '';
  manifest.assets[logical] = builtRel;
  if (oldBuilt && oldBuilt !== builtRel && fs.existsSync(path.join(ROOT, oldBuilt))) {
    fs.unlinkSync(path.join(ROOT, oldBuilt));
    const oldMap = path.join(ROOT, `${oldBuilt}.map`);
    if (fs.existsSync(oldMap)) fs.unlinkSync(oldMap);
  }
  replacements.push({ oldValue: oldBuilt, newValue: builtRel });
  results.push({ src: srcRel, logical, oldBuilt, builtRel, hash });
}

for (const rel of runtimeFiles()) replaceInFile(rel, replacements);
manifest.hashed_asset_count = Object.keys(manifest.assets || {}).length;
write('assets/asset-manifest.json', JSON.stringify(manifest, null, 2) + '\n');

console.log(JSON.stringify({
  updated: results,
  touchedRuntimeFiles: runtimeFiles().filter(rel => {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) return false;
    const raw = fs.readFileSync(abs, 'utf8');
    return results.some(item => raw.includes(item.builtRel));
  }),
  hashedAssetCount: manifest.hashed_asset_count
}, null, 2));
