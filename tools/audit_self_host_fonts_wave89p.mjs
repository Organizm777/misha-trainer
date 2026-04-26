#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const LOGICAL_CSS = 'assets/css/wave89p_self_host_fonts.css';
const SOURCE_CSS = 'assets/_src/css/wave89p_self_host_fonts.css';
const REQUIRED_FONTS = [
  'assets/fonts/unbounded-cyrillic-ext-wght-normal.woff2',
  'assets/fonts/unbounded-cyrillic-wght-normal.woff2',
  'assets/fonts/unbounded-latin-wght-normal.woff2',
  'assets/fonts/golos-text-cyrillic-ext-wght-normal.woff2',
  'assets/fonts/golos-text-cyrillic-wght-normal.woff2',
  'assets/fonts/golos-text-latin-wght-normal.woff2',
  'assets/fonts/jetbrains-mono-cyrillic-ext-wght-normal.woff2',
  'assets/fonts/jetbrains-mono-cyrillic-wght-normal.woff2',
  'assets/fonts/jetbrains-mono-latin-wght-normal.woff2'
];
const REQUIRED_FAMILIES = ['Unbounded', 'Golos Text', 'JetBrains Mono'];

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }

const manifest = JSON.parse(read('assets/asset-manifest.json'));
const builtCss = manifest.assets && manifest.assets[LOGICAL_CSS] ? manifest.assets[LOGICAL_CSS] : '';
const sourceCss = exists(SOURCE_CSS) ? read(SOURCE_CSS) : '';
const builtCssText = builtCss && exists(builtCss) ? read(builtCss) : '';
const sw = read('sw.js');
const htmlFiles = fs.readdirSync(ROOT).filter(name => name.endsWith('.html')).sort();

function hasFamily(css, family){
  const re = new RegExp(`font-family:\\s*['\"]${family.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}['\"]`);
  return re.test(css);
}

const cssChecks = {
  sourceExists: !!sourceCss,
  builtExists: !!builtCss && exists(builtCss),
  builtCss,
  familiesPresent: REQUIRED_FAMILIES.every(family => hasFamily(sourceCss, family) && hasFamily(builtCssText, family)),
  optionalDisplay: /font-display:\s*optional/.test(sourceCss) && /font-display:\s*optional/.test(builtCssText),
  requiredFontsExist: REQUIRED_FONTS.every(exists),
  sourceReferencesFonts: REQUIRED_FONTS.every(rel => sourceCss.includes(rel.replace(/^assets\/fonts\//, '../fonts/')))
};

const htmlChecks = htmlFiles.map(file => {
  const html = read(file);
  const cspMatch = html.match(/<meta[^>]+http-equiv="Content-Security-Policy"[^>]+content="([^"]+)"/i);
  const csp = cspMatch ? cspMatch[1] : '';
  return {
    file,
    hasLocalCss: !!builtCss && html.includes(`./${builtCss}`),
    hasFontCssPreload: !!builtCss && html.includes(`<link rel="preload" href="./${builtCss}" as="style">`),
    noGoogleFontsHosts: !/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html),
    cspNoGoogleFontsHosts: !/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(csp)
  };
});

const swChecks = {
  noGoogleFontsHosts: !/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(sw),
  precachesBuiltCss: !!builtCss && sw.includes(`'./${builtCss}'`),
  precachesFonts: REQUIRED_FONTS.every(rel => sw.includes(`'./${rel}'`)),
  sameOriginOnlyFetch: /const isSameOrigin = url\.origin === self\.location\.origin;\n\s*if\(!isSameOrigin\) return;\n\s*const cacheName = STATIC_CACHE;/.test(sw)
};

const ok = cssChecks.sourceExists &&
  cssChecks.builtExists &&
  cssChecks.familiesPresent &&
  cssChecks.optionalDisplay &&
  cssChecks.requiredFontsExist &&
  cssChecks.sourceReferencesFonts &&
  htmlChecks.every(item => item.hasLocalCss && item.hasFontCssPreload && item.noGoogleFontsHosts && item.cspNoGoogleFontsHosts) &&
  Object.values(swChecks).every(Boolean);

const result = {
  ok,
  wave: 'wave89p',
  logicalCss: LOGICAL_CSS,
  builtCss,
  requiredFonts: REQUIRED_FONTS,
  cssChecks,
  swChecks,
  htmlChecks,
  note: 'wave89p self-hosts the shared UI fonts so public pages and the service worker stay same-origin/offline-first without Google Fonts.'
};

console.log(JSON.stringify(result, null, 2));
if (!ok) process.exit(1);
