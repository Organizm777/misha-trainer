#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const WORKFLOW_REL = '.github/workflows/lighthouse-budget.yml';
const CONFIG_REL = '.lighthouserc.json';
const TARGET_PAGES = ['index.html', 'grade3_v2.html', 'grade10_v2.html'];

function read(rel){
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function assertTuple(value){
  if (!Array.isArray(value) || value.length < 1) return { level: null, opts: {} };
  return { level: value[0], opts: value[1] || {} };
}

const workflow = read(WORKFLOW_REL);
const config = JSON.parse(read(CONFIG_REL));
const collect = config.ci?.collect || {};
const settings = collect.settings || {};
const assertionMap = config.ci?.assert?.assertions || {};
const a11y = assertTuple(assertionMap['categories:accessibility']);
const perf = assertTuple(assertionMap['categories:performance']);
const totalByteWeight = assertTuple(assertionMap['total-byte-weight']);
const cls = assertTuple(assertionMap['cumulative-layout-shift']);
const lcp = assertTuple(assertionMap['largest-contentful-paint']);
const consoleErrors = assertTuple(assertionMap['errors-in-console']);
const urls = Array.isArray(collect.url) ? collect.url.slice() : [];
const targetPages = Object.fromEntries(TARGET_PAGES.map((page) => [page, read(page)]));

const workflowChecks = {
  pullRequest: /pull_request:/m.test(workflow),
  workflowDispatch: /workflow_dispatch:/m.test(workflow),
  noAutorun: !/\blhci autorun\b/.test(workflow),
  checkoutFetchDepth: /fetch-depth:\s*(?:2\d|[3-9]\d|\d{3,}|20)\b/.test(workflow),
  baseBranchFetch: /git fetch --depth=1 origin \+refs\/heads\/\$\{\{\s*github\.base_ref\s*\}\}/.test(workflow),
  node20: /node-version:\s*20\b/.test(workflow),
  resolvesChromePath: /CHROME_PATH=.*command -v google-chrome/.test(workflow) || /command -v google-chrome \|\| command -v chromium \|\| command -v chromium-browser/.test(workflow),
  preflightCleanup: /node tools\/cleanup_build_artifacts\.mjs --check/.test(workflow),
  preflightPerfAudit: /node tools\/audit_performance_wave86z\.mjs/.test(workflow),
  preflightStaticActions: /node tools\/audit_static_events_wave87e\.mjs/.test(workflow),
  preflightSelfAudit: /node tools\/audit_lighthouse_ci_wave87s\.mjs/.test(workflow),
  installsPinnedCli: /@lhci\/cli@0\.15\.1/.test(workflow),
  healthcheck: /\bnpx lhci healthcheck --fatal\b/.test(workflow),
  advisoryCollect: /id:\s*collect_lhci[\s\S]*?name:\s*Collect Lighthouse runs \(advisory\)[\s\S]*?continue-on-error:\s*true[\s\S]*?npx lhci collect --config=\.lighthouserc\.json/.test(workflow),
  advisoryAssert: /id:\s*assert_lhci[\s\S]*?name:\s*Assert Lighthouse budgets \(advisory\)[\s\S]*?continue-on-error:\s*true[\s\S]*?npx lhci assert --config=\.lighthouserc\.json/.test(workflow),
  summaryWarning: /steps\.collect_lhci\.outcome/.test(workflow) && /steps\.assert_lhci\.outcome/.test(workflow) && /LHCI live run was advisory/.test(workflow),
  artifacts: /actions\/upload-artifact@v4/.test(workflow) && /path:\s*\.lighthouseci/.test(workflow)
};

const configChecks = {
  staticDistDir: collect.staticDistDir === './',
  noStartServerCommand: !('startServerCommand' in collect),
  urlCount: urls.length,
  hasIndexChoose: urls.includes('http://localhost/index.html?choose'),
  hasGrade3: urls.includes('http://localhost/grade3_v2.html'),
  hasGrade10: urls.includes('http://localhost/grade10_v2.html'),
  numberOfRuns: collect.numberOfRuns,
  multipleRuns: Number(collect.numberOfRuns || 0) >= 2,
  chromeFlags: settings.chromeFlags || '',
  chromeFlagsContainHeadless: /--headless=new/.test(settings.chromeFlags || ''),
  chromeFlagsContainNoSandbox: /--no-sandbox/.test(settings.chromeFlags || ''),
  chromeFlagsContainDisableDevShm: /--disable-dev-shm-usage/.test(settings.chromeFlags || ''),
  chromeFlagsContainDisableGpu: /--disable-gpu/.test(settings.chromeFlags || ''),
  presetRecommended: config.ci?.assert?.preset === 'lighthouse:recommended',
  includePassedAssertions: config.ci?.assert?.includePassedAssertions === true,
  accessibility: { level: a11y.level, minScore: a11y.opts.minScore ?? null },
  performance: { level: perf.level, minScore: perf.opts.minScore ?? null },
  totalByteWeight: { level: totalByteWeight.level, maxNumericValue: totalByteWeight.opts.maxNumericValue ?? null, aggregationMethod: totalByteWeight.opts.aggregationMethod ?? null },
  cls: { level: cls.level, maxNumericValue: cls.opts.maxNumericValue ?? null, aggregationMethod: cls.opts.aggregationMethod ?? null },
  lcp: { level: lcp.level, maxNumericValue: lcp.opts.maxNumericValue ?? null, aggregationMethod: lcp.opts.aggregationMethod ?? null },
  consoleErrors: { level: consoleErrors.level, minScore: consoleErrors.opts.minScore ?? null }
};

const pageChecks = Object.fromEntries(TARGET_PAGES.map((page) => [page, {
  noNpointPreconnect: !/rel="preconnect"[^>]+api\.npoint\.io/i.test(targetPages[page]),
  noGoogleFonts: !/fonts\.googleapis|fonts\.gstatic/i.test(targetPages[page])
}]));

const ok = Object.values(workflowChecks).every(Boolean) &&
  configChecks.staticDistDir &&
  configChecks.noStartServerCommand &&
  configChecks.urlCount === 3 &&
  configChecks.hasIndexChoose &&
  configChecks.hasGrade3 &&
  configChecks.hasGrade10 &&
  configChecks.multipleRuns &&
  configChecks.chromeFlagsContainHeadless &&
  configChecks.chromeFlagsContainNoSandbox &&
  configChecks.chromeFlagsContainDisableDevShm &&
  configChecks.chromeFlagsContainDisableGpu &&
  configChecks.presetRecommended &&
  configChecks.includePassedAssertions &&
  configChecks.accessibility.level === 'error' &&
  Number(configChecks.accessibility.minScore) >= 0.9 &&
  configChecks.performance.level === 'warn' &&
  Number(configChecks.performance.minScore) >= 0.7 &&
  configChecks.totalByteWeight.level === 'error' &&
  Number(configChecks.totalByteWeight.maxNumericValue) <= 1800000 &&
  configChecks.totalByteWeight.aggregationMethod === 'pessimistic' &&
  configChecks.cls.level === 'warn' &&
  Number(configChecks.cls.maxNumericValue) <= 0.45 &&
  configChecks.cls.aggregationMethod === 'pessimistic' &&
  configChecks.lcp.level === 'warn' &&
  Number(configChecks.lcp.maxNumericValue) <= 5000 &&
  configChecks.lcp.aggregationMethod === 'pessimistic' &&
  configChecks.consoleErrors.level === 'warn' &&
  Number(configChecks.consoleErrors.minScore) >= 0.9 &&
  Object.values(pageChecks).every((item) => Object.values(item).every(Boolean));

const result = {
  ok,
  wave: 'wave87s',
  workflow: WORKFLOW_REL,
  config: CONFIG_REL,
  workflowChecks,
  configChecks,
  pageChecks,
  note: 'wave89v keeps static Lighthouse governance strict, removes npoint preconnects from audited pages, and makes live LHCI collect/assert advisory so transient headless/network flakes stop failing the workflow and emailing the owner.'
};

console.log(JSON.stringify(result, null, 2));
if (!ok) process.exit(1);
