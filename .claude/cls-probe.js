// CLS diagnostic probe — uses chrome-launcher + puppeteer-core
// (both bundled inside Lighthouse's npx cache).
const path = require('path');
const fs = require('fs');
const Module = require('module');

const npxCache = path.join(process.env.LOCALAPPDATA || '', 'npm-cache', '_npx');
let lhMods = null;
if (fs.existsSync(npxCache)) {
  for (const d of fs.readdirSync(npxCache)) {
    const p = path.join(npxCache, d, 'node_modules', 'lighthouse');
    if (fs.existsSync(p)) { lhMods = path.join(npxCache, d, 'node_modules'); break; }
  }
}
if (!lhMods) { console.error('No lighthouse npx cache found. Run lighthouse via npx first.'); process.exit(1); }

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

    // Install a PerformanceObserver before navigation.
    await page.evaluateOnNewDocument(() => {
      window.__ls = [];
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            window.__ls.push({
              value: e.value,
              hadRecentInput: e.hadRecentInput,
              sources: (e.sources || []).map(s => ({
                node: s.node ? ((s.node.tagName || '?') + (s.node.id ? '#' + s.node.id : '') + (s.node.className ? '.' + String(s.node.className).split(' ').join('.') : '')) : null,
                prev: s.previousRect,
                curr: s.currentRect,
              })),
            });
          }
        }).observe({ type: 'layout-shift', buffered: true });
      } catch (e) {}
    });

    await page.goto(URL, { waitUntil: 'load', timeout: 30000 });

    const snap = async (label) => page.evaluate((lbl) => {
      const rows = [];
      for (const el of document.body.children) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        rows.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          cls: el.className || null,
          pos: cs.position,
          display: cs.display,
          top: Math.round(r.top), left: Math.round(r.left),
          w: Math.round(r.width), h: Math.round(r.height),
          inFlow: !['absolute','fixed'].includes(cs.position) && cs.display !== 'none',
        });
      }
      const w = document.querySelector('body > .w');
      const wRect = w ? w.getBoundingClientRect() : null;
      return { label: lbl, children: rows, wTop: wRect ? Math.round(wRect.top) : null, wHeight: wRect ? Math.round(wRect.height) : null };
    }, label);

    await new Promise(r => setTimeout(r, 100));
    const before = await snap('after-load');
    await new Promise(r => setTimeout(r, 3000));
    const after = await snap('after-3s');

    const ls = await page.evaluate(() => window.__ls || []);

    const fmt = (c) => `    ${c.tag}${c.id?'#'+c.id:''}${c.cls?' ['+String(c.cls).slice(0,60)+']':''}  pos=${c.pos} top=${c.top} h=${c.h} inFlow=${c.inFlow}`;

    console.log('=== BEFORE (100ms after load) ===');
    console.log('body.w top:', before.wTop, 'height:', before.wHeight);
    for (const c of before.children) console.log(fmt(c));
    console.log();
    console.log('=== AFTER (3s later) ===');
    console.log('body.w top:', after.wTop, 'height:', after.wHeight);
    for (const c of after.children) console.log(fmt(c));
    console.log();
    console.log('=== LAYOUT-SHIFT events ===');
    for (const e of ls) {
      console.log('score:', e.value.toFixed(4), 'hadRecentInput:', e.hadRecentInput);
      for (const s of e.sources) {
        console.log('  source:', s.node, 'prev:', JSON.stringify(s.prev), 'curr:', JSON.stringify(s.curr));
      }
    }
    console.log();
    console.log('=== SHIFT OF body>.w ===');
    console.log('before top:', before.wTop, '→ after top:', after.wTop, '(delta:', (after.wTop - before.wTop) + 'px)');

    await browser.disconnect();
  } finally {
    await chrome.kill();
  }
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
