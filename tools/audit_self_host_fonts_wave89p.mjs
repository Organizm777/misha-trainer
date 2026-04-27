#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'assets', 'asset-manifest.json');
const FONT_CSS_LOGICAL = 'assets/css/wave89p_self_host_fonts.css';
const htmlPages = fs.readdirSync(ROOT).filter(name => name.endsWith('.html') && !name.startsWith('debug_')).sort();
const expectedFontFiles = [
  'golos-text-cyrillic-400-normal.woff2',
  'golos-text-cyrillic-500-normal.woff2',
  'golos-text-cyrillic-600-normal.woff2',
  'golos-text-cyrillic-700-normal.woff2',
  'golos-text-latin-400-normal.woff2',
  'golos-text-latin-500-normal.woff2',
  'golos-text-latin-600-normal.woff2',
  'golos-text-latin-700-normal.woff2',
  'unbounded-cyrillic-400-normal.woff2',
  'unbounded-cyrillic-600-normal.woff2',
  'unbounded-cyrillic-700-normal.woff2',
  'unbounded-cyrillic-800-normal.woff2',
  'unbounded-cyrillic-900-normal.woff2',
  'unbounded-latin-400-normal.woff2',
  'unbounded-latin-600-normal.woff2',
  'unbounded-latin-700-normal.woff2',
  'unbounded-latin-800-normal.woff2',
  'unbounded-latin-900-normal.woff2',
  'jetbrains-mono-cyrillic-wght-normal.woff2',
  'jetbrains-mono-latin-wght-normal.woff2'
];
const errors = [];
function assert(cond, message){ if (!cond) errors.push(message); }
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const builtFontCss = manifest.assets?.[FONT_CSS_LOGICAL] || '';
assert(!!builtFontCss, `asset-manifest: missing ${FONT_CSS_LOGICAL}`);
assert(builtFontCss.endsWith('.css'), `asset-manifest: unexpected built font CSS path ${builtFontCss || '(empty)'}`);
assert(builtFontCss && exists(builtFontCss), `built font CSS missing on disk: ${builtFontCss || '(empty)'}`);

const builtCss = builtFontCss && exists(builtFontCss) ? read(builtFontCss) : '';
const sourceCss = exists('assets/_src/css/wave89p_self_host_fonts.css') ? read('assets/_src/css/wave89p_self_host_fonts.css') : '';
const fontDir = path.join(ROOT, 'assets', 'fonts');
const fontFiles = fs.existsSync(fontDir)
  ? fs.readdirSync(fontDir).filter(name => /\.woff2?$/i.test(name)).sort()
  : [];
const missingFontFiles = expectedFontFiles.filter(name => !fontFiles.includes(name));

assert(fontFiles.length >= expectedFontFiles.length, `assets/fonts: expected at least ${expectedFontFiles.length} .woff2 files, got ${fontFiles.length}`);
assert(missingFontFiles.length === 0, `assets/fonts: missing expected files: ${missingFontFiles.join(', ')}`);
assert(/font-family:\s*'Golos Text'/.test(builtCss), 'built font CSS: missing Golos Text faces');
assert(/font-family:\s*'Unbounded'/.test(builtCss), 'built font CSS: missing Unbounded faces');
assert(/font-family:\s*'JetBrains Mono'/.test(builtCss), 'built font CSS: missing JetBrains Mono faces');
assert(!/JetBrains Mono Variable/.test(builtCss), 'built font CSS: variable-family alias leaked instead of normalized JetBrains Mono family');
assert((builtCss.match(/@font-face\s*\{/g) || []).length >= 20, `built font CSS: expected at least 20 @font-face blocks, got ${(builtCss.match(/@font-face\s*\{/g) || []).length}`);
assert((builtCss.match(/\.\.\/fonts\//g) || []).length >= 20, `built font CSS: expected local ../fonts/ references, got ${(builtCss.match(/\.\.\/fonts\//g) || []).length}`);
assert(!/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(builtCss), 'built font CSS: external Google Fonts reference still present');
assert(/wave89p self-hosted fonts/.test(sourceCss), 'source font CSS: missing wave89p header marker');

const htmlChecks = [];
for (const file of htmlPages) {
  const html = read(file);
  const styles = [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/g)].map(match => match[1]);
  const cspMatch = html.match(/<meta[^>]+http-equiv="Content-Security-Policy"[^>]+content="([^"]+)"/i);
  const csp = cspMatch ? cspMatch[1] : '';
  const hasLocalFontCss = styles.includes(`./${builtFontCss}`) || styles.includes(builtFontCss);
  const hasGoogleFonts = /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html);
  const cspMentionsGoogleFonts = /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(csp);
  const cspLocalStyles = /style-src 'self'/.test(csp) && /style-src-elem 'self'/.test(csp) && !/style-src[^;]*https?:/.test(csp) && !/style-src-elem[^;]*https?:/.test(csp);
  const cspLocalFonts = /font-src 'self' data:/.test(csp) && !/font-src[^;]*fonts\.gstatic\.com/.test(csp);
  const cspConnectDropsFontHosts = !/connect-src[^;]*fonts\.googleapis\.com/.test(csp) && !/connect-src[^;]*fonts\.gstatic\.com/.test(csp);
  htmlChecks.push({ file, hasLocalFontCss, hasGoogleFonts, cspMentionsGoogleFonts, cspLocalStyles, cspLocalFonts, cspConnectDropsFontHosts });
  assert(hasLocalFontCss, `${file}: missing local wave89p font stylesheet`);
  assert(!hasGoogleFonts, `${file}: still references Google Fonts`);
  assert(!cspMentionsGoogleFonts, `${file}: CSP still mentions Google Fonts hosts`);
  assert(cspLocalStyles, `${file}: CSP should keep style-src/style-src-elem same-origin only`);
  assert(cspLocalFonts, `${file}: CSP should keep font-src same-origin/data only`);
  assert(cspConnectDropsFontHosts, `${file}: CSP connect-src should not include Google Fonts hosts`);
}

const syncSource = read('tools/sync_release_metadata.mjs');
assert(/const fontsDir = path\.join\(ROOT, 'assets', 'fonts'\);/.test(syncSource), 'sync_release_metadata: missing assets/fonts scan');
assert(/const fontFiles = fs\.existsSync\(fontsDir\)/.test(syncSource), 'sync_release_metadata: missing fontFiles collection');
assert(/\.\.\.fontFiles/.test(syncSource), 'sync_release_metadata: ASSETS array does not include fontFiles');

const swCode = read('sw.js');
const swFontEntries = [...swCode.matchAll(/'\.\/assets\/fonts\/([^']+)'/g)].map(match => match[1]).sort();
const swMissingFontFiles = expectedFontFiles.filter(name => !swFontEntries.includes(name));
assert(swFontEntries.length >= expectedFontFiles.length, `sw.js: expected at least ${expectedFontFiles.length} precached font files, got ${swFontEntries.length}`);
assert(swMissingFontFiles.length === 0, `sw.js: missing font precache entries: ${swMissingFontFiles.join(', ')}`);
assert(swCode.includes(`'./${builtFontCss}'`) || swCode.includes(`'${builtFontCss}'`), 'sw.js: missing hashed wave89p font CSS in ASSETS');
assert(!/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(swCode), 'sw.js: still references Google Fonts hosts');

const result = {
  ok: errors.length === 0,
  wave: 'wave89p',
  fontCssLogical: FONT_CSS_LOGICAL,
  builtFontCss,
  htmlChecks,
  fontFiles,
  swFontEntries: swFontEntries.length,
  missingFontFiles,
  errors,
  note: 'wave89p self-hosts the three UI families locally, removes Google Fonts from HTML/CSP/SW, and makes the fonts precacheable/offline-safe through the shared release metadata sync.'
};
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
