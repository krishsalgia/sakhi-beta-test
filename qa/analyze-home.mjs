import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/');
  console.log(await page.evaluate(async () => {
    const images = await Promise.all(['before', 'after'].map(async mode => {
      const image = new Image(); image.src = `/qa/screenshots/home-protection/${mode}-768.png`; await image.decode(); return image;
    }));
    const canvas = document.createElement('canvas'); canvas.width = images[0].width; canvas.height = images[0].height;
    const ctx = canvas.getContext('2d');
    const pixels = images.map(image => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0); return ctx.getImageData(0, 0, canvas.width, canvas.height).data; });
    let count = 0, minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0, maxDelta = 0, over20 = 0; const bands = {};
    for (let i = 0; i < pixels[0].length; i += 4) if (pixels[0].slice(i, i + 4).some((value, index) => value !== pixels[1][i + index])) {
      count++; const x = i / 4 % canvas.width, y = Math.floor(i / 4 / canvas.width);
      minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      const delta = Math.max(...pixels[0].slice(i, i + 4).map((value, index) => Math.abs(value - pixels[1][i + index]))); maxDelta = Math.max(maxDelta, delta); if (delta > 20) over20++; bands[Math.floor(y / 100) * 100] = (bands[Math.floor(y / 100) * 100] || 0) + 1;
    }
    return { count, minX, minY, maxX, maxY, maxDelta, over20, bands, dimensions: images.map(image => [image.width, image.height]) };
  }));
} finally { await browser.close(); }
