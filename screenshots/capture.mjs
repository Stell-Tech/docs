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

async function capture(shot, outPath) {
  // Shots with an absolute `url` target public pages outside the portal
  // (e.g. the embed configurator), so the login check doesn't apply.
  await page.goto(shot.url ?? `${baseUrl}${shot.path}`, { waitUntil: 'networkidle' });
  if (!shot.url && page.url().includes('/login')) {
    console.error('Session expired — redirected to login. Run: npm run shots:login');
    process.exit(1);
  }
  if (shot.waitFor) {
    await page.waitForSelector(shot.waitFor, { timeout: 15000 });
  }
  if (shot.clicks?.length) {
    // Let React hydration settle first — a click that lands mid-hydration
    // can hit a node being replaced and get silently dropped.
    await page.waitForTimeout(1000);
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
  if (shot.scrollTo) {
    // Align the element with the top of the viewport so the capture starts
    // there instead of at the page top (e.g. to skip a marketing hero).
    await page
      .locator(shot.scrollTo)
      .first()
      .evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(500);
  }
  if (shot.collapseSidebar) {
    // The sidebar state persists in a cookie, so only toggle when expanded.
    const expanded = await page.locator('[data-collapsible][data-state="expanded"]').count();
    if (expanded > 0) {
      await page.click('button[aria-label="Toggle sidebar"]');
      await page.waitForTimeout(500);
    }
  }
  // Wait for loading skeletons to finish rendering real content.
  await page
    .waitForSelector('.animate-pulse', { state: 'detached', timeout: 20000 })
    .catch(() => console.warn(`  (skeletons still visible on ${shot.name})`));
  await mkdir(dirname(outPath), { recursive: true });
  await page.screenshot({ path: outPath, fullPage: shot.fullPage ?? false });
}

let failed = 0;
for (const shot of selected) {
  const outPath = `images/${shot.name}.png`;
  try {
    try {
      await capture(shot, outPath);
    } catch {
      console.warn(`  (retrying ${shot.name})`);
      await capture(shot, outPath);
    }
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
