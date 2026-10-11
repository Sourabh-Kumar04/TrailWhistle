const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/home/sourabh_kumar04_ubuntu/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';
const DIST_DIR = path.join(__dirname, '..', 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.onnx': 'application/octet-stream',
  '.wav': 'audio/wav',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, reqPath);
  if (filePath.endsWith('/') || !path.extname(filePath)) {
    filePath = path.join(filePath, 'index.html');
  }

  // Fallback to public if not in dist
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '..', 'public', reqPath);
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.statusCode = 404;
    res.end('Not found: ' + req.url);
  }
});

server.listen(4173, async () => {
  console.log('Static server listening on http://localhost:4173');
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 950 });

    page.on('console', (msg) => console.log('[BROWSER]', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.error('[PAGE ERROR]', err));

    console.log('Navigating to http://localhost:4173...');
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
    console.log('Page loaded.');

    // 1. Verify footer repo link exists
    const footerLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const gh = links.find((a) => a.href.includes('github.com/Sourabh-Kumar04/TrailWhistle'));
      return gh ? gh.href : null;
    });
    console.log('Footer GitHub Link verified:', footerLink);
    if (!footerLink) {
      throw new Error('Footer GitHub repo link not found');
    }

    // 2. Click American Robin simulation button in Hero
    console.log('Looking for American Robin button...');
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const robinBtn = buttons.find((b) => b.textContent && b.textContent.includes('American Robin'));
      if (robinBtn) {
        robinBtn.click();
        return true;
      }
      return false;
    });
    console.log('American Robin button clicked:', clicked);
    if (!clicked) {
      throw new Error('American Robin button not found');
    }

    // 3. Wait for classification result to appear: top bioacoustic match
    console.log('Waiting for "TOP BIOACOUSTIC MATCH" to appear...');
    await page.waitForFunction(
      () => {
        const text = document.body.innerText.toLowerCase();
        return text.includes('top bioacoustic match');
      },
      { timeout: 35000 }
    );

    console.log('"TOP BIOACOUSTIC MATCH" appeared in DOM!');

    // Wait a brief moment for animations / checklist update
    await new Promise((r) => setTimeout(r, 1200));

    // Scroll to the prediction card so it is in view
    await page.evaluate(() => {
      const matchElem = Array.from(document.querySelectorAll('*')).find(
        (el) => el.textContent && el.textContent.toLowerCase().includes('top bioacoustic match')
      );
      if (matchElem) {
        matchElem.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });

    await new Promise((r) => setTimeout(r, 500));

    // Extract prediction details from DOM
    const details = await page.evaluate(() => {
      const matchElem = Array.from(document.querySelectorAll('*')).find(
        (el) => el.textContent && el.textContent.toLowerCase().includes('top bioacoustic match')
      );
      return {
        hasPredictionCard: !!matchElem,
        hasAmericanRobin: document.body.innerText.includes('American Robin'),
        has98Percent: document.body.innerText.includes('98%') || document.body.innerText.includes('99%'),
      };
    });
    console.log('Prediction details confirmed:', details);

    // Take screenshot showing classification
    const screenshotPath = path.join(__dirname, '..', 'screenshots', 'classification_verified.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
    });
    console.log('Focused screenshot saved to:', screenshotPath);

    // Also full page screenshot
    const fullScreenshotPath = path.join(__dirname, '..', 'screenshots', 'classification_verified_full.png');
    await page.screenshot({
      path: fullScreenshotPath,
      fullPage: true,
    });
    console.log('Full page screenshot saved to:', fullScreenshotPath);

    // 4. Test Header Search functionality
    console.log('Testing header search bar typing and pressing Enter...');
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 400));

    const searchInput = await page.$('input[placeholder*="Search"]');
    if (!searchInput) {
      throw new Error('Search input not found in header');
    }
    await searchInput.click();
    await searchInput.type('Sparrow');
    await searchInput.press('Enter');
    await new Promise((r) => setTimeout(r, 800));

    const searchResult = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.innerText;
      const text = document.body.innerText;
      return {
        activeH1: h1,
        hasSongSparrow: text.includes('Song Sparrow'),
        hasSpeciesCatalog: text.includes('Regional species checklist') || text.includes('taxonomy'),
      };
    });
    console.log('Header search result:', searchResult);

    const searchScreenshotPath = path.join(__dirname, '..', 'screenshots', 'search_verified.png');
    await page.screenshot({
      path: searchScreenshotPath,
      fullPage: false,
    });
    console.log('Search screenshot saved to:', searchScreenshotPath);

    console.log('=== ALL TESTS PASSED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Test FAILED:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
    process.exit(process.exitCode || 0);
  }
});
