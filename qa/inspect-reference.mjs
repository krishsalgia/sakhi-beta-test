import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
await page.goto('http://127.0.0.1:5173/qa/references/Sakhi1.mp4');
await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
const data = await page.evaluate(async () => {
  const video = document.querySelector('video');
  video.pause();
  const canvas = document.createElement('canvas');
  canvas.width = 1600; canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  for (let i = 0; i < 12; i++) {
    const ready = new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
    video.currentTime = i * 1.4 + .02;
    await ready;
    const x = i % 4 * 400, y = Math.floor(i / 4) * 300;
    ctx.drawImage(video, x, y, 400, 300);
    ctx.fillStyle = '#000'; ctx.fillRect(x, y, 58, 23);
    ctx.fillStyle = '#fff'; ctx.font = '15px Arial'; ctx.fillText(`${(i * 1.4).toFixed(1)}s`, x + 6, y + 17);
  }
  return canvas.toDataURL('image/png').split(',')[1];
});
await writeFile('qa/references/motion-contact-sheet.png', Buffer.from(data, 'base64'));
await browser.close();
