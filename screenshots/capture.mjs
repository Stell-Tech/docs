// Captures every screenshot in shots.config.mjs using the saved staging session.
// Run `npm run shots:login` first (and again when the session expires).
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from 'dotenv';
import shots from './shots.config.mjs';

config({ path: '.env.local' });

const baseUrl = process.env.STAGING_URL;
if (!baseUrl) {
  console.error('STAGING_URL is not set. Add it to .env.local');
  process.exit(1);
}

const statePath = 'screenshots/.auth/state.json';
if (!existsSync(statePath)) {
  console.error(`No saved session at ${statePath}. Run: npm run shots:login`);
  process.exit(1);
}

const browser = await chromium.launch();
const context = await browser.newContext({
  storageState: statePath,
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'light',
});
const page = await context.newPage();

// Optional filter: `npm run shots -- programs/detail` captures matching names only.
const filter = process.argv[2];
const selected = filter ? shots.filter((s) => s.name.includes(filter)) : shots;
if (filter && selected.length === 0) {
  console.error(`No shots match "${filter}"`);
  process.exit(1);
}

let failed = 0;
for (const shot of selected) {
  const outPath = `images/${shot.name}.png`;
  try {
    await page.goto(`${baseUrl}${shot.path}`, { waitUntil: 'networkidle' });
    if (page.url().includes('/login')) {
      console.error('Session expired — redirected to login. Run: npm run shots:login');
      process.exit(1);
    }
    if (shot.waitFor) {
      await page.waitForSelector(shot.waitFor, { timeout: 15000 });
    }
    for (const selector of shot.clicks ?? []) {
      await page.click(selector, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      // Let dialogs and page transitions finish animating before capture.
      await page.waitForTimeout(800);
    }
    if (shot.waitForUrl) {
      await page.waitForURL(shot.waitForUrl, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
    }
    // Wait for loading skeletons to finish rendering real content.
    await page
      .waitForSelector('.animate-pulse', { state: 'detached', timeout: 20000 })
      .catch(() => console.warn(`  (skeletons still visible on ${shot.name})`));
    await mkdir(dirname(outPath), { recursive: true });
    await page.screenshot({ path: outPath, fullPage: shot.fullPage ?? false });
    console.log(`✓ ${outPath}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${shot.name}: ${err.message}`);
  }
}

await browser.close();
if (failed > 0) {
  console.error(`${failed} screenshot(s) failed`);
  process.exit(1);
}
