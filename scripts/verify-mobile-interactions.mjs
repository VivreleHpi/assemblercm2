import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const DIST_DIR = path.resolve('dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

function startServer(port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url || '/', `http://127.0.0.1:${port}`);
      let pathname = decodeURIComponent(parsedUrl.pathname);
      let filePath = path.join(DIST_DIR, pathname);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      } else if (!path.extname(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      } else if (!path.extname(filePath) && fs.existsSync(`${filePath}.html`)) {
        filePath = `${filePath}.html`;
      }

      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`404 Not Found: ${req.url}`);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

function assert(cond, msg) {
  if (!cond) throw new Error(`[FAIL] ${msg}`);
}

async function run() {
  const port = 8963;
  const server = await startServer(port);
  const baseUrl = `http://127.0.0.1:${port}`;

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    try {
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    } catch {
      browser = await chromium.launch({ headless: true });
    }
  }

  try {
    // Mobile Viewport: 390x844 (iPhone 14 / modern smartphone)
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();

    console.log('--- TEST MOBILE 1 : Atelier oral Tribune (Étape 6) ---');
    await page.goto(`${baseUrl}/etape/6-parlement-enfants/`, { waitUntil: 'networkidle' });

    // Verify 60s default timings
    const timing1_60 = await page.locator('[data-step-timing="1"]').textContent();
    const timing2_60 = await page.locator('[data-step-timing="2"]').textContent();
    const timing3_60 = await page.locator('[data-step-timing="3"]').textContent();
    const timing4_60 = await page.locator('[data-step-timing="4"]').textContent();
    assert(timing1_60 === '10s', `Étape 1 en format 60s doit être 10s (reçu: ${timing1_60})`);
    assert(timing2_60 === '15s', `Étape 2 en format 60s doit être 15s (reçu: ${timing2_60})`);
    assert(timing3_60 === '25s', `Étape 3 en format 60s doit être 25s (reçu: ${timing3_60})`);
    assert(timing4_60 === '10s', `Étape 4 en format 60s doit être 10s (reçu: ${timing4_60})`);
    console.log('  ✓ Répartition format 60s vérifiée (10s + 15s + 25s + 10s = 60s)');

    // Switch to 90s
    await page.locator('button[data-tribune-duration="90"]').click();
    await page.waitForTimeout(100);
    const timing1_90 = await page.locator('[data-step-timing="1"]').textContent();
    const timing2_90 = await page.locator('[data-step-timing="2"]').textContent();
    const timing3_90 = await page.locator('[data-step-timing="3"]').textContent();
    const timing4_90 = await page.locator('[data-step-timing="4"]').textContent();
    assert(timing1_90 === '15s', `Étape 1 en format 90s doit être 15s (reçu: ${timing1_90})`);
    assert(timing2_90 === '20s', `Étape 2 en format 90s doit être 20s (reçu: ${timing2_90})`);
    assert(timing3_90 === '35s', `Étape 3 en format 90s doit être 35s (reçu: ${timing3_90})`);
    assert(timing4_90 === '20s', `Étape 4 en format 90s doit être 20s (reçu: ${timing4_90})`);
    console.log('  ✓ Répartition format 90s vérifiée (15s + 20s + 35s + 20s = 90s)');

    // Start timer on mobile
    const startBtn = page.locator('#tribune-start-btn');
    await startBtn.click();
    await page.waitForTimeout(1100);
    const displayAfter1s = await page.locator('#tribune-timer-display').textContent();
    assert(displayAfter1s === '01:29' || displayAfter1s === '01:28', `Timer décrémente bien (reçu: ${displayAfter1s})`);
    await startBtn.click(); // Pause
    console.log('  ✓ Chronomètre mobile fonctionnel (démarrage, décrémentation, pause)');

    console.log('\n--- TEST MOBILE 2 : Grand Quiz & Impression du Diplôme (Étape 11) ---');
    await page.goto(`${baseUrl}/etape/11-quiz-diplome/`, { waitUntil: 'networkidle' });

    // Unlock diploma via teacher button or 6 answers
    await page.locator('#teacher-unlock-diploma-btn').click();
    await page.waitForTimeout(100);
    const diplomaBarVisible = await page.locator('#diploma-controls-bar').isVisible();
    assert(diplomaBarVisible, 'Barre de commandes du diplôme visible après déblocage');

    // Fill pupil name
    await page.fill('#diploma-student-name', 'Camille');
    await page.fill('#diploma-school-name', 'École Émile-Zola CM2');
    const renderedName = await page.locator('#diploma-rendered-name').textContent();
    assert(renderedName === 'Camille', `Prénom rendu sur le diplôme: ${renderedName}`);
    console.log('  ✓ Saisie et rendu immédiat du prénom élève sur mobile');

    // Verify print button triggers window.print without error
    let printCalled = false;
    await page.exposeFunction('mockPrintTrigger', () => {
      printCalled = true;
    });
    await page.evaluate(() => {
      window.print = () => window.mockPrintTrigger();
    });
    await page.locator('#print-diploma-btn').click();
    assert(printCalled, 'Bouton Imprimer le diplôme déclenche window.print()');
    console.log('  ✓ Déclencheur impression A4 paysage validé sur mobile');

    console.log('\n--- TEST MOBILE 3 : Tablette (768x1024) & Navigation ---');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    const heroH1 = await page.locator('h1').textContent();
    assert(heroH1?.includes('Assemblée nationale'), 'H1 accueil tablette présent');
    console.log('  ✓ Affichage tablette 768px vérifié');

    console.log('\n🎉 TOUS LES TESTS MOBILES & INTERACTIFS SONT VALIDÉS AVEC SUCCÈS !');
    await context.close();
  } finally {
    server.close();
    if (browser) await browser.close();
  }
}

run().catch((e) => {
  console.error('ERREUR TEST MOBILE:', e);
  process.exit(1);
});
