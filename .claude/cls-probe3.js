// Minimal probe — just inspect .w and its first child at end of load.
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
const chromeLauncher = require(path.join(lhMods, 'chrome-launcher'));
const puppeteer = require(path.join(lhMods, 'puppeteer-core'));

(async () => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless=new','--no-sandbox','--disable-gpu','--window-size=412,823'],
  });
  try {
    const browser = await puppeteer.connect({
      browserURL: `http://127.0.0.1:${chrome.port}`, defaultViewport: null,
    });
    const page = (await browser.pages())[0] || await browser.newPage();
    await page.setViewport({ width: 412, height: 823, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://127.0.0.1:8765/index.html', { waitUntil: 'load', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));

    const info = await page.evaluate(() => {
      const w = document.querySelector('body > .w');
      const wcs = getComputedStyle(w);
      const first = w.firstElementChild;
      const fcs = first ? getComputedStyle(first) : null;
      const wr = w.getBoundingClientRect();
      const fr = first ? first.getBoundingClientRect() : null;
      return {
        w: {
          top: wr.top, left: wr.left, height: wr.height, width: wr.width,
          marginTop: wcs.marginTop, paddingTop: wcs.paddingTop, borderTop: wcs.borderTopWidth,
          paddingAll: `${wcs.paddingTop} ${wcs.paddingRight} ${wcs.paddingBottom} ${wcs.paddingLeft}`,
          display: wcs.display, position: wcs.position, overflow: wcs.overflow,
          bodyPaddingTop: getComputedStyle(document.body).paddingTop,
          bodyMarginTop: getComputedStyle(document.body).marginTop,
        },
        firstChild: first ? {
          tag: first.tagName, id: first.id, cls: String(first.className || ''),
          marginTop: fcs.marginTop, paddingTop: fcs.paddingTop, borderTop: fcs.borderTopWidth,
          display: fcs.display, position: fcs.position,
          top: fr.top, left: fr.left, height: fr.height,
          inlineStyle: first.getAttribute('style') || '',
        } : null,
      };
    });

    console.log(JSON.stringify(info, null, 2));

    await browser.disconnect();
  } finally { await chrome.kill().catch(()=>{}); }
})().catch(e => { console.error(e); process.exit(1); });
