#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
function getArg(name, fallback){
  const flag = `--${name}`;
  const idx = args.indexOf(flag);
  if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
  return fallback;
}
const wave = getArg('wave', '').trim();
const buildDate = getArg('date', '').trim();
if (!wave || !/^wave[0-9a-z]+$/i.test(wave)) {
  console.error('Usage: node tools/sync_release_metadata.mjs --wave wave89a --date 2026-04-25');
  process.exit(1);
}
if (!buildDate || !/^\d{4}-\d{2}-\d{2}$/.test(buildDate)) {
  console.error('Expected --date YYYY-MM-DD');
  process.exit(1);
}
const version = `trainer-build-${wave}-${buildDate}`;
const generatedAt = `${buildDate}T00:00:00Z`;

function readJSON(rel){ return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }
function writeJSON(rel, value){ fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(value, null, 2) + '\n'); }
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function write(rel, value){ fs.writeFileSync(path.join(ROOT, rel), value); }
function relToRoot(rel){ return rel.replace(/^\.\//, '').replace(/\\/g, '/'); }
function manifestAsset(manifest, logical){
  const value = manifest.assets && manifest.assets[logical];
  if (!value) throw new Error(`asset-manifest missing ${logical}`);
  return `./${value}`;
}
function formatArray(name, values){
  const uniq = Array.from(new Set(values));
  return `const ${name} = [\n${uniq.map(v => `  '${v}'`).join(',\n')}\n];`;
}
function replaceArray(source, name, values){
  const re = new RegExp(`const ${name} = \\\[([\\s\\S]*?)\\];`);
  if (!re.test(source)) throw new Error(`Could not locate ${name} in sw.js`);
  return source.replace(re, formatArray(name, values));
}

const manifest = readJSON('assets/asset-manifest.json');
manifest.version = version;
manifest.generated_at_utc = generatedAt;
manifest.hashed_asset_count = Object.keys(manifest.assets || {}).length;
writeJSON('assets/asset-manifest.json', manifest);

const healthz = readJSON('healthz.json');
healthz.wave = wave;
healthz.version = version;
healthz.build_id = wave;
healthz.generated_at_utc = generatedAt;
healthz.hashed_asset_count = manifest.hashed_asset_count;
healthz.cache = version;
writeJSON('healthz.json', healthz);

const htmlPages = [
  'index.html', 'dashboard.html', 'diagnostic.html', 'tests.html', 'spec_subjects.html',
  'grade1_v2.html', 'grade2_v2.html', 'grade3_v2.html', 'grade4_v2.html', 'grade5_v2.html',
  'grade6_v2.html', 'grade7_v2.html', 'grade8_v2.html', 'grade9_v2.html', 'grade10_v2.html', 'grade11_v2.html'
];
const specDataDir = path.join(ROOT, 'assets', 'data', 'spec_subjects');
const specDataFiles = fs.existsSync(specDataDir)
  ? fs.readdirSync(specDataDir).filter(name => name.endsWith('.json')).sort().map(name => `./assets/data/spec_subjects/${name}`)
  : [];
const iconsDir = path.join(ROOT, 'assets', 'icons');
const iconFiles = fs.existsSync(iconsDir)
  ? fs.readdirSync(iconsDir).filter(name => /\.(png|svg|webp)$/i.test(name)).sort().map(name => `./assets/icons/${name}`)
  : [];
const assetFiles = Object.values(manifest.assets || {}).sort().map(relToRoot).map(rel => `./${rel}`);

const ASSETS = [
  './.',
  ...htmlPages.map(page => `./${page}`),
  './manifest.webmanifest',
  './healthz.json',
  './CHANGELOG.md',
  './assets/asset-manifest.json',
  ...assetFiles,
  ...specDataFiles,
  ...iconFiles
];
const CSP_BRIDGE_ASSETS = [
  manifestAsset(manifest, 'assets/js/chunk_roadmap_wave86u_csp_bridge.js'),
  manifestAsset(manifest, 'assets/js/chunk_roadmap_wave86x_style_csp_bridge.js')
];
const DIAGNOSTIC_OFFLINE_ASSETS = [
  manifestAsset(manifest, 'assets/css/wave86x_inline_diagnostic.css'),
  manifestAsset(manifest, 'assets/css/wave86z_static_style_classes.css'),
  manifestAsset(manifest, 'assets/js/inline_diagnostic_1_wave86u.js'),
  manifestAsset(manifest, 'assets/js/inline_diagnostic_2_wave86u.js'),
  manifestAsset(manifest, 'assets/js/wave35_plans.js'),
  manifestAsset(manifest, 'assets/js/bundle_shell.js'),
  manifestAsset(manifest, 'assets/js/bundle_diagnostic_tools.js'),
  manifestAsset(manifest, 'assets/js/chunk_roadmap_wave86q_accessibility_theme.js'),
  manifestAsset(manifest, 'assets/js/chunk_subject_expansion_wave31_russian.js'),
  manifestAsset(manifest, 'assets/js/chunk_subject_expansion_wave32_math.js'),
  manifestAsset(manifest, 'assets/js/chunk_subject_expansion_wave33_science.js'),
  manifestAsset(manifest, 'assets/js/chunk_subject_expansion_wave38_content_consolidation.js'),
  manifestAsset(manifest, 'assets/js/chunk_subject_expansion_wave56_primary_math.js'),
  manifestAsset(manifest, 'assets/js/chunk_subject_expansion_wave57_primary_russian_1_4.js'),
  manifestAsset(manifest, 'assets/js/chunk_subject_expansion_wave58_secondary_math_7_9.js'),
  manifestAsset(manifest, 'assets/js/chunk_subject_expansion_wave59_physics_chemistry_7_9.js'),
  manifestAsset(manifest, 'assets/js/chunk_subject_expansion_wave60_biology_history_english_5_8.js'),
  manifestAsset(manifest, 'assets/js/chunk_subject_expansion_wave61_senior_school_10_11.js'),
  manifestAsset(manifest, 'assets/js/chunk_grade_content_wave87m_transition_1011.js'),
  manifestAsset(manifest, 'assets/js/chunk_subject_expansion_wave63_quality.js'),
  manifestAsset(manifest, 'assets/js/bundle_gamification_xp.js'),
  manifestAsset(manifest, 'assets/js/bundle_gamification_meta.js'),
  manifestAsset(manifest, 'assets/js/bundle_exam.js'),
  manifestAsset(manifest, 'assets/js/bundle_profile_social.js'),
  manifestAsset(manifest, 'assets/js/bundle_error_tracking.js'),
  './diagnostic.html'
];

let sw = read('sw.js');
sw = sw.replace(/const CACHE_NAME = 'trainer-build-[^']+';/, `const CACHE_NAME = '${version}';`);
sw = replaceArray(sw, 'ASSETS', ASSETS);
sw = replaceArray(sw, 'CSP_BRIDGE_ASSETS', CSP_BRIDGE_ASSETS);
sw = replaceArray(sw, 'DIAGNOSTIC_OFFLINE_ASSETS', DIAGNOSTIC_OFFLINE_ASSETS);
write('sw.js', sw);

console.log(JSON.stringify({
  wave,
  version,
  generatedAt,
  hashedAssetCount: manifest.hashed_asset_count,
  assets: ASSETS.length,
  diagnosticAssets: DIAGNOSTIC_OFFLINE_ASSETS.length
}, null, 2));
