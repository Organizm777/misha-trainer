#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'assets', 'asset-manifest.json');
const SOURCE_BRIDGE_REL = 'assets/_src/js/chunk_roadmap_wave86x_style_csp_bridge.js';
const LOGICAL_BRIDGE = 'assets/js/chunk_roadmap_wave86x_style_csp_bridge.js';

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function count(text, regex){ return (text.match(regex) || []).length; }

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const builtBridge = manifest.assets?.[LOGICAL_BRIDGE] || '';
const sourceCode = read(SOURCE_BRIDGE_REL);
const builtCode = builtBridge && fs.existsSync(path.join(ROOT, builtBridge)) ? read(builtBridge) : '';
const publicHtmlFiles = fs.readdirSync(ROOT).filter(name => name.endsWith('.html') && !name.startsWith('debug_')).sort();

const htmlChecks = [];
const bridgeRefFailures = [];
const staticClassCssFailures = [];
for (const file of publicHtmlFiles) {
  const html = read(file);
  const cspMatch = html.match(/<meta[^>]+http-equiv="Content-Security-Policy"[^>]+content="([^"]+)"/i);
  const csp = cspMatch ? cspMatch[1] : '';
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)].map(match => match[1]);
  const styles = [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/g)].map(match => match[1]);
  const hasStyleBlob = /style-src[^;]*blob:/.test(csp) || /style-src-elem[^;]*blob:/.test(csp);
  const hasStyleUnsafeInline = /style-src[^;]*unsafe-inline/.test(csp) || /style-src-elem[^;]*unsafe-inline/.test(csp) || /style-src-attr[^;]*unsafe-inline/.test(csp);
  const hasBridge = scripts.some(src => src.includes('chunk_roadmap_wave86x_style_csp_bridge'));
  const hasStaticClassCss = styles.some(href => href.includes('wave86z_static_style_classes'));
  if (!hasBridge) bridgeRefFailures.push(file);
  if (!hasStaticClassCss) staticClassCssFailures.push(file);
  htmlChecks.push({ file, hasStyleBlob, hasStyleUnsafeInline, hasBridge, hasStaticClassCss });
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
  ok: !!builtBridge &&
    /wave87q-cssom-sheet/.test(sourceCode) &&
    /wave86z_static_style_classes/.test(sourceCode) &&
    !/\bBlob\b|createObjectURL|revokeObjectURL/.test(sourceCode) &&
    !/\bBlob\b|createObjectURL|revokeObjectURL/.test(builtCode) &&
    htmlChecks.every(item => !item.hasStyleBlob && !item.hasStyleUnsafeInline && item.hasBridge && item.hasStaticClassCss) &&
    bridgeRefFailures.length === 0 &&
    staticClassCssFailures.length === 0,
  wave: 'wave87q',
  logicalBridge: LOGICAL_BRIDGE,
  builtBridge,
  bridgeBytes: builtBridge ? fs.statSync(path.join(ROOT, builtBridge)).size : null,
  htmlChecks,
  bridgeRefFailures,
  staticClassCssFailures,
  runtimeStyleHotspots: {
    files: hotspotFiles.length,
    styleElements: hotspotFiles.reduce((sum, item) => sum + item.styleElements, 0),
    styleCssText: hotspotFiles.reduce((sum, item) => sum + item.styleCssText, 0),
    inlineStyleMarkup: hotspotFiles.reduce((sum, item) => sum + item.inlineStyleMarkup, 0),
    topFiles: hotspotFiles.slice(0, 12)
  },
  note: 'wave87q keeps the runtime style shim, but routes dynamic rules into the already-loaded same-origin wave86z_static_style_classes stylesheet via CSSOM. Runtime style hotspots still exist, yet style-src/style-src-elem no longer need blob:.'
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
