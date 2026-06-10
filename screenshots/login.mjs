// Opens a headed browser on staging so you can log in manually (password + MFA).
// Once the portal dashboard loads, the session is saved for reuse by capture.mjs.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { config } from 'dotenv';

config({ path: '.env.local' });

const baseUrl = process.env.STAGING_URL;
if (!baseUrl) {
  console.error('STAGING_URL is not set. Add it to .env.local');
  process.exit(1);
}

const statePath = 'screenshots/.auth/state.json';
await mkdir('screenshots/.auth', { recursive: true });

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

await page.goto(`${baseUrl}/login`);
console.log('Log in manually in the browser window (password + MFA)...');

// Wait until the user lands on a portal page, then persist the session.
await page.waitForURL('**/portal**', { timeout: 5 * 60 * 1000 });
await page.waitForLoadState('networkidle');

await context.storageState({ path: statePath });
console.log(`Session saved to ${statePath}`);
await browser.close();
