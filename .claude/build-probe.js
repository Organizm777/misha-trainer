// Verify Settings Build display picks up current sw.js CACHE_NAME.
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
    // Wait for SW install + a moment for scripts.
    await new Promise(r => setTimeout(r, 3500));

    // Reload so SW is controlling the page.
    await page.reload({ waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 2500));

    const res = await page.evaluate(async () => {
      const out = { swActive: false, cacheKeys: [], buildFromLoader: null, settingsText: null };
      try {
        const reg = await navigator.serviceWorker.ready;
        out.swActive = !!reg.active;
      } catch(_) {}
      try { out.cacheKeys = await caches.keys(); } catch(_) {}
      // Call loader directly (it's a closure — have to trigger via settings button).
      // Click the settings button if present.
      const btn = document.getElementById('trainer-settings-btn');
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 600));
      const host = document.querySelector('[data-build-info]');
      out.settingsText = host ? host.innerText : null;
      // Wait one more tick for async fetch.
      await new Promise(r => setTimeout(r, 1500));
      const host2 = document.querySelector('[data-build-info]');
      out.settingsTextAfter = host2 ? host2.innerText : null;
      return out;
    });

    console.log(JSON.stringify(res, null, 2));
    await browser.disconnect();
  } finally { await chrome.kill().catch(()=>{}); }
})().catch(e => { console.error(e); process.exit(1); });
