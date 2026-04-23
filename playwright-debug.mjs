import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message));
  page.on('requestfailed', req => console.log('REQUESTFAILED:', req.url(), req.failure()?.errorText));
  page.on('response', res => {
    if (res.status() >= 400) console.log('BADRESP:', res.status(), res.url());
  });

  await page.goto('http://localhost:8082/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  console.log('PAGE TITLE:', await page.title());
  const bodyHtml = await page.locator('body').innerHTML();
  console.log('BODY HTML:', bodyHtml.slice(0, 400));
  await browser.close();
}

run().catch(err => {
  console.error('SCRIPT ERROR:', err);
  process.exit(1);
});
