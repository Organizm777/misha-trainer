#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/asset-manifest.json'), 'utf8'));
const logicalBridge = 'assets/js/chunk_roadmap_wave86x_style_csp_bridge.js';
const builtBridge = manifest.assets?.[logicalBridge];
const sourceBridge = path.join(ROOT, 'assets/_src/js/chunk_roadmap_wave86x_style_csp_bridge.js');

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function count(text, regex){ return (text.match(regex) || []).length; }

const sourceCode = fs.readFileSync(sourceBridge, 'utf8');
const builtCode = builtBridge && fs.existsSync(path.join(ROOT, builtBridge)) ? read(builtBridge) : '';
const publicHtmlFiles = fs.readdirSync(ROOT).filter(name => name.endsWith('.html') && !name.startsWith('debug_')).sort();

let publicDataStyleAttrs = 0;
let publicInlineStyleAttrs = 0;
let publicInlineStyleBlocks = 0;
const bridgeRefFailures = [];

for (const file of publicHtmlFiles) {
  const html = read(file);
  publicDataStyleAttrs += count(html, /data-wave86x-style=/g);
  publicInlineStyleAttrs += count(html, /\sstyle="/g);
  publicInlineStyleBlocks += count(html, /<style\b/gi);
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)].map(match => match[1]);
  if (!scripts[1]?.includes('chunk_roadmap_wave86x_style_csp_bridge')) bridgeRefFailures.push(file);
}

const hotspotFiles = [];
for (const name of fs.readdirSync(path.join(ROOT, 'assets/_src/js')).sort()) {
  if (!name.endsWith('.js')) continue;
  const rel = `assets/_src/js/${name}`;
  const code = read(rel);
  const styleElements = count(code, /createElement\((['"])style\1\)/g);
  const styleCssText = count(code, /\.style\.cssText\s*=/g);
  const inlineStyleMarkup = count(code, /style=/g);
  const total = styleElements + styleCssText + inlineStyleMarkup;
  if (!total) continue;
  hotspotFiles.push({ rel, styleElements, styleCssText, inlineStyleMarkup, total });
}
hotspotFiles.sort((a, b) => b.total - a.total || a.rel.localeCompare(b.rel));

const result = {
  ok: !!builtBridge && !/data-wave86x-style|DATA_STYLE/.test(sourceCode) && !/data-wave86x-style|DATA_STYLE/.test(builtCode) && (/wave87p-runtime-only/.test(sourceCode) || /wave87q-cssom-sheet/.test(sourceCode)) && publicDataStyleAttrs === 0 && publicInlineStyleAttrs === 0 && publicInlineStyleBlocks === 0 && bridgeRefFailures.length === 0,
  wave: 'wave87p',
  logicalBridge,
  builtBridge,
  bridgeBytes: builtBridge ? fs.statSync(path.join(ROOT, builtBridge)).size : null,
  publicHtmlFiles: publicHtmlFiles.length,
  publicDataStyleAttrs,
  publicInlineStyleAttrs,
  publicInlineStyleBlocks,
  bridgeRefFailures,
  runtimeStyleHotspots: {
    files: hotspotFiles.length,
    styleElements: hotspotFiles.reduce((sum, item) => sum + item.styleElements, 0),
    styleCssText: hotspotFiles.reduce((sum, item) => sum + item.styleCssText, 0),
    inlineStyleMarkup: hotspotFiles.reduce((sum, item) => sum + item.inlineStyleMarkup, 0),
    topFiles: hotspotFiles.slice(0, 12)
  },
  note: 'Historical shim audit: public HTML stays clean and the legacy logical bridge no longer migrates data-wave86x-style. Since wave87q blob: is no longer required in style-src, but this audit still highlights the remaining runtime style hotspots.'
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
