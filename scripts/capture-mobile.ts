import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const mimeTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
};

const distDir = path.resolve('dist');

const server = http.createServer((req, res) => {
  let reqPath = decodeURI((req.url || '/').split('?')[0]);
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  let filePath = path.join(distDir, reqPath);
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  } else if (!fs.existsSync(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) {
    filePath = path.join(filePath, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(4321, async () => {
  console.log('Static server started on http://127.0.0.1:4321');
  const localApp = process.env.LOCALAPPDATA || '';
  const chromePath = path.join(localApp, 'ms-playwright', 'chromium-1234', 'chrome-win64', 'chrome.exe');
  const browser = await chromium.launch({
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 12 / 13 / 14 mobile viewport
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();
  const outDir = path.resolve('screenshots-mobile');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const targets = [
    { url: 'http://127.0.0.1:4321/', file: '01_accueil_hero_mobile.png', wait: 600 },
    { url: 'http://127.0.0.1:4321/#carte-parcours', file: '02_carte_parcours_mobile.png', wait: 600 },
    { url: 'http://127.0.0.1:4321/etape/1-hemicycle/', file: '03_etape1_hemicycle_mobile.png', wait: 800 },
    { url: 'http://127.0.0.1:4321/etape/4-constitution-justice/', file: '04_etape4_justice_mobile.png', wait: 800 },
    { url: 'http://127.0.0.1:4321/etape/5-frise-napoleon/', file: '05_etape5_frise_mobile.png', wait: 800 },
    { url: 'http://127.0.0.1:4321/etape/6-parlement-enfants/', file: '06_etape6_tribune_mobile.png', wait: 800 },
    { url: 'http://127.0.0.1:4321/etape/11-quiz-diplome/', file: '07_etape11_diplome_mobile.png', wait: 1000 },
    { url: 'http://127.0.0.1:4321/glossaire/', file: '08_glossaire_mobile.png', wait: 600 },
    { url: 'http://127.0.0.1:4321/enseignants/', file: '09_enseignants_mobile.png', wait: 600 }
  ];

  for (const t of targets) {
    console.log('Capturing:', t.file);
    await page.goto(t.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(t.wait);

    if (t.file === '07_etape11_diplome_mobile.png') {
      try {
        await page.click('#teacher-unlock-diploma-btn');
        await page.waitForTimeout(300);
        await page.fill('#diploma-student-name', 'Malik');
        await page.fill('#diploma-school-name', 'École Jean Moulin · CM2');
        await page.waitForTimeout(300);
        // Scroll to diploma card
        const card = await page.$('#diploma-printable-card');
        if (card) {
          await card.scrollIntoViewIfNeeded();
          await page.waitForTimeout(300);
        }
      } catch (err) {
        console.warn('Unlock diploma error:', err);
      }
    } else if (t.file === '06_etape6_tribune_mobile.png') {
      const tribune = await page.$('#atelier-tribune');
      if (tribune) {
        await tribune.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
      }
    }

    const outPath = path.join(outDir, t.file);
    await page.screenshot({ path: outPath, fullPage: false });
  }

  await browser.close();
  server.close();
  console.log('All mobile screenshots generated successfully in screenshots-mobile/');
  process.exit(0);
});
