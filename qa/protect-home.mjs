import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const mode = process.argv[2] || 'after';
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const files = ['src/main.jsx', 'src/styles.css', 'src/content.js', 'src/product-data.js', 'src/ui.jsx', 'public/assets/sakhi-logo.png'];
const hashes = Object.fromEntries(await Promise.all(files.map(async file => [file, hash(await readFile(file))])));
await mkdir('qa/screenshots/home-protection', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const width of [1440, 768, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.deposit-visual').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.images].every(image => image.complete));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    const screenshot = await page.screenshot({ fullPage: true, path: `qa/screenshots/home-protection/${mode}-${width}.png` });
    const imageHash = hash(screenshot);
    if (mode === 'after') {
      const baseline = JSON.parse(await readFile('qa/home-baseline.json', 'utf8'));
      if (imageHash !== baseline[`screenshot-${width}`]) {
        const difference = await page.evaluate(async width => {
          const images = await Promise.all(['before', 'after'].map(async mode => {
            const image = new Image(); image.src = `/qa/screenshots/home-protection/${mode}-${width}.png`; await image.decode(); return image;
          }));
          if (images[0].width !== images[1].width || images[0].height !== images[1].height) return { maxDelta: 255, fraction: 1 };
          const canvas = document.createElement('canvas'); canvas.width = images[0].width; canvas.height = images[0].height;
          const ctx = canvas.getContext('2d');
          const data = images.map(image => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0); return ctx.getImageData(0, 0, canvas.width, canvas.height).data; });
          let maxDelta = 0, changed = 0;
          for (let i = 0; i < data[0].length; i += 4) {
            let delta = 0;
            for (let c = 0; c < 4; c++) delta = Math.max(delta, Math.abs(data[0][i + c] - data[1][i + c]));
            if (delta) changed++;
            maxDelta = Math.max(maxDelta, delta);
          }
          return { maxDelta, fraction: changed / (canvas.width * canvas.height) };
        }, width);
        // Allow only negligible rasterization rounding: <=2/255 and <=0.5% of pixels.
        assert.ok(difference.maxDelta <= 2 && difference.fraction <= .005, `Homepage ${width}px changed: ${JSON.stringify(difference)}`);
        console.log(`${width}px: layout unchanged; rasterization delta ${difference.maxDelta}/255 across ${(difference.fraction * 100).toFixed(3)}% of pixels.`);
      }
    }
    hashes[`screenshot-${width}`] = imageHash;
    await page.close();
  }
  if (mode === 'before') await writeFile('qa/home-baseline.json', JSON.stringify(hashes, null, 2));
  else {
    const before = JSON.parse(await readFile('qa/home-baseline.json', 'utf8'));
    for (const file of files) assert.equal(hashes[file], before[file], `${file} changed`);
    console.log('Homepage source, header, logo, product data and full-page screenshots unchanged at 1440, 768 and 375px.');
  }
} finally { await browser.close(); }
