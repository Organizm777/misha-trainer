import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'asset-manifest.json'), 'utf8'));
const assets = MANIFEST.assets || {};
const core = assets['assets/js/bundle_grade_runtime_core_wave87n.js'];
const features = assets['assets/js/bundle_grade_runtime_features_wave87n.js'];
const services = assets['assets/js/bundle_grade_runtime_services_wave87n.js'];
const oldMerged = assets['assets/js/bundle_grade_runtime_wave86z.js'] || '';
const cspBridge = assets['assets/js/chunk_roadmap_wave86u_csp_bridge.js'] || '';
const gradePages = fs.readdirSync(ROOT).filter((name) => /^grade\d+_v2\.html$/.test(name)).sort();
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const cspBridgeSrc = fs.readFileSync(path.join(ROOT, 'assets', '_src', 'js', 'chunk_roadmap_wave86u_csp_bridge.js'), 'utf8');
const coreSrc = core ? fs.readFileSync(path.join(ROOT, core), 'utf8') : '';

function size(rel){
  if (!rel) return 0;
  const abs = path.join(ROOT, rel);
  return fs.existsSync(abs) ? fs.statSync(abs).size : 0;
}

const pageRefs = gradePages.map((file) => {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  return {
    file,
    usesCore: !!(core && html.includes(`./${core}`)),
    usesFeaturesDirect: !!(features && html.includes(`./${features}`)),
    usesServicesDirect: !!(services && html.includes(`./${services}`)),
    usesOldMerged: /bundle_grade_runtime_wave86z\.[a-f0-9]{10}\.js/.test(html)
  };
});

const result = {
  ok:
    !!core &&
    !!features &&
    !!services &&
    !oldMerged &&
    pageRefs.every((row) => row.usesCore && !row.usesFeaturesDirect && !row.usesServicesDirect && !row.usesOldMerged) &&
    sw.includes(`'./${core}'`) &&
    sw.includes(`'./${features}'`) &&
    sw.includes(`'./${services}'`) &&
    !/bundle_grade_runtime_wave86z\.[a-f0-9]{10}\.js/.test(sw) &&
    /wave87nRuntimeSplit/.test(coreSrc) &&
    /bindDirectActions/.test(coreSrc) &&
    /hydrateForAction/.test(coreSrc) &&
    !/hydrateStaticAction|runStaticAction|installStaticActions/.test(cspBridgeSrc),
  wave: 'wave87n',
  bundles: {
    core: { file: core, bytes: size(core) },
    features: { file: features, bytes: size(features) },
    services: { file: services, bytes: size(services) },
    totalLazyRuntimeBytes: size(core) + size(features) + size(services)
  },
  cspBridge: {
    file: cspBridge,
    bytes: size(cspBridge),
    staticDispatchShimPresent: /hydrateStaticAction|runStaticAction|installStaticActions/.test(cspBridgeSrc),
    directHydrationInCore: /bindDirectActions/.test(coreSrc) && /hydrateForAction/.test(coreSrc)
  },
  gradePages: pageRefs,
  swPrecache: {
    core: !!(core && sw.includes(`'./${core}'`)),
    features: !!(features && sw.includes(`'./${features}'`)),
    services: !!(services && sw.includes(`'./${services}'`)),
    oldMergedAbsent: !/bundle_grade_runtime_wave86z\.[a-f0-9]{10}\.js/.test(sw)
  },
  manifest: {
    hashedAssetCount: MANIFEST.hashed_asset_count || 0,
    oldMergedEntryPresent: !!oldMerged
  }
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
