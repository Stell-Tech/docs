// Captures the Mintleaf marketing mockups in mockups/*.html to images/promote/.
// Run: node mockups/capture.mjs [name ...]   (no args = all)
// launch-collage embeds the other captures, so it always runs last.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, '..', 'images', 'promote');

const SHOTS = [
  { name: 'email-anatomy', width: 1100, height: 870 },
  { name: 'email-announcement', width: 680, height: 850 },
  { name: 'email-invitation', width: 680, height: 660 },
  { name: 'email-pass-visual', width: 680, height: 920 },
  { name: 'social-announcement', width: 560, height: 884 },
  { name: 'social-story', width: 420, height: 747 },
  { name: 'website-banner', width: 1180, height: 716 },
  { name: 'my-page-widget', width: 1180, height: 756 },
  { name: 'poster', width: 660, height: 933 },
  { name: 'counter-card', width: 660, height: 820 },
  { name: 'pos-screen', width: 1280, height: 720 },
  { name: 'screen-promo', width: 1280, height: 720 },
  { name: 'floor-stand', width: 660, height: 880 },
  { name: 'ceiling-banner', width: 640, height: 920 },
  { name: 'kiosk-offer', width: 720, height: 1180 },
  { name: 'kiosk-checkin', width: 720, height: 1180 },
  { name: 'register-topper', width: 660, height: 880 },
  { name: 'tap-mat', width: 720, height: 1040 },
  { name: 'totem', width: 460, height: 1100 },
  { name: 'sidewalk-aframe', width: 700, height: 900 },
  { name: 'launch-collage', width: 1280, height: 880 },
];

const only = process.argv.slice(2);
const shots = SHOTS.filter((s) => only.length === 0 || only.includes(s.name));

const browser = await chromium.launch();
for (const shot of shots) {
  const page = await browser.newPage({
    viewport: { width: shot.width, height: shot.height },
    deviceScaleFactor: 2,
  });
  await page.goto('file://' + path.join(here, `${shot.name}.html`));
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, `${shot.name}.png`) });
  await page.close();
  console.log(`captured ${shot.name}.png (${shot.width}x${shot.height} @2x)`);
}
await browser.close();
