// Deeper CLS probe: capture the EARLIEST DOM state, track layout-shift
// sources with rect coordinates (JSON-safe), inspect html/body computed styles.
const path = require('path');
const fs = require('fs');

const npxCache = path.join(process.env.LOCALAPPDATA || '', 'npm-cache', '_npx');
let lhMods = null;
if (fs.existsSync(npxCache)) {
  for (const d of fs.readdirSync(npxCache)) {
    const p = path.join(npxCache, d, 'node_modules', 'lighthouse');
    if (fs.existsSync(p)) { lhMods = path.join(npxCache, d, 'node_modules'); break; }
  }
}
if (!lhMods) { console.error('No lighthouse npx cache found.'); process.exit(1); }

const chromeLauncher = require(path.join(lhMods, 'chrome-launcher'));
const puppeteer = require(path.join(lhMods, 'puppeteer-core'));

const URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';

(async () => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless=new','--no-sandbox','--disable-gpu','--window-size=412,823'],
  });
  try {
    const browser = await puppeteer.connect({
      browserURL: `http://127.0.0.1:${chrome.port}`,
      defaultViewport: null,
    });
    const pages = await browser.pages();
    const page = pages[0] || await browser.newPage();
    await page.setViewport({ width: 412, height: 823, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

    // Track layout-shift with proper rect serialization.
    await page.evaluateOnNewDocument(() => {
      window.__ls = [];
      window.__rectsOverTime = [];
      function rectify(r){ return r ? {x:r.x, y:r.y, w:r.width, h:r.height} : null; }
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            window.__ls.push({
              value: e.value,
              hadRecentInput: e.hadRecentInput,
              startTime: e.startTime,
              sources: (e.sources || []).map(s => ({
                node: s.node ? (s.node.nodeName + (s.node.id ? '#' + s.node.id : '') + (s.node.className ? '.' + String(s.node.className).split(/\s+/).filter(Boolean).join('.') : '')) : null,
                prev: rectify(s.previousRect),
                curr: rectify(s.currentRect),
              })),
            });
          }
        }).observe({ type: 'layout-shift', buffered: true });
      } catch (e) {}

      // Sample .w position periodically during early render.
      const sample = () => {
        const w = document.querySelector('body > .w');
        const h = document.documentElement;
        const b = document.body;
        if (!w || !b) return;
        const wr = w.getBoundingClientRect();
        const hr = h.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        const hcs = getComputedStyle(h);
        const bcs = getComputedStyle(b);
        const wcs = getComputedStyle(w);
        // Find the first in-flow child of .w (which owns first margin that may collapse with .w).
        const wFirst = w.firstElementChild;
        const wFcs = wFirst ? getComputedStyle(wFirst) : null;
        window.__rectsOverTime.push({
          t: performance.now(),
          w: {top: wr.top, h: wr.height, mt: wcs.marginTop, pt: wcs.paddingTop, pos: wcs.position, bodyClass: b.className || ''},
          html: {top: hr.top, h: hr.height, pt: hcs.paddingTop, mt: hcs.marginTop, bt: hcs.borderTopWidth},
          body: {top: br.top, h: br.height, pt: bcs.paddingTop, mt: bcs.marginTop, bt: bcs.borderTopWidth},
          wFirst: wFirst ? {tag: wFirst.tagName, id: wFirst.id, cls: wFirst.className, mt: wFcs.marginTop, top: wFirst.getBoundingClientRect().top} : null,
          children: Array.from(b.children).map(c => ({
            tag: c.tagName, id: c.id, pos: getComputedStyle(c).position,
            top: c.getBoundingClientRect().top, h: c.getBoundingClientRect().height,
          })),
        });
      };
      // Sample at many points in time.
      document.addEventListener('DOMContentLoaded', sample);
      window.addEventListener('load', sample);
      for (const t of [0, 10, 50, 100, 250, 500, 1000, 2000, 3000]) setTimeout(sample, t);
    });

    await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3500));

    const ls = await page.evaluate(() => window.__ls || []);
    const rot = await page.evaluate(() => window.__rectsOverTime || []);

    console.log('=== RECTS OVER TIME (top position of body>.w) ===');
    for (const s of rot) {
      console.log(`t=${s.t.toFixed(0).padStart(6)}ms  w.top=${String(Math.round(s.w.top)).padStart(4)}  w.h=${String(Math.round(s.w.h)).padStart(5)}  w.mt=${s.w.mt}  w.pt=${s.w.pt}  body.pt=${s.body.pt}  body.mt=${s.body.mt}  bodyCls="${s.w.bodyClass}"  kids=${s.children.length}`);
      if (s.wFirst) console.log(`       wFirst: ${s.wFirst.tag}#${s.wFirst.id||''} mt=${s.wFirst.mt} top=${Math.round(s.wFirst.top)}`);
    }
    console.log();
    console.log('=== LAYOUT-SHIFT events (with rects) ===');
    for (const e of ls) {
      console.log(`t=${e.startTime.toFixed(0)}ms  score=${e.value.toFixed(4)}  hadRecentInput=${e.hadRecentInput}`);
      for (const s of e.sources) {
        console.log(`  source: ${s.node}`);
        console.log(`    prev: ${JSON.stringify(s.prev)}  curr: ${JSON.stringify(s.curr)}`);
      }
    }
    console.log();
    console.log('=== FINAL body children ===');
    const finalChildren = rot.length ? rot[rot.length - 1].children : [];
    for (const c of finalChildren) {
      console.log(`  ${c.tag}${c.id?'#'+c.id:''}  pos=${c.pos} top=${c.top} h=${c.h}`);
    }

    await browser.disconnect();
  } finally {
    await chrome.kill();
  }
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
