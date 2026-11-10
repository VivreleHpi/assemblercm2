import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const DIST = path.resolve('dist');
const OUT = '/opt/cursor/artifacts';
fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2'
};

function extractJpeg(pdf) {
  const start = pdf.indexOf(Buffer.from([0xff, 0xd8, 0xff]));
  const end = pdf.lastIndexOf(Buffer.from([0xff, 0xd9]));
  if (start < 0 || end < start) {
    throw new Error('JPEG introuvable dans le PDF');
  }
  return pdf.subarray(start, end + 2);
}

async function sideBySide(leftPng, rightPng, dest, leftLabel, rightLabel) {
  const height = 720;
  const left = await sharp(leftPng).resize({ height, fit: 'inside' }).png().toBuffer();
  const right = await sharp(rightPng).resize({ height, fit: 'inside' }).png().toBuffer();
  const lm = await sharp(left).metadata();
  const rm = await sharp(right).metadata();
  const gap = 28;
  const pad = 24;
  const header = 52;
  const width = pad + (lm.width || 1) + gap + (rm.width || 1) + pad;
  const canvasH = header + height + pad;
  const label = (text, w) =>
    Buffer.from(
      `<svg width="${w}" height="${header}"><text x="0" y="32" font-size="22" font-family="DejaVu Sans, sans-serif" fill="#002654">${text}</text></svg>`
    );
  await sharp({
    create: { width, height: canvasH, channels: 3, background: '#FAF7F0' }
  })
    .composite([
      { input: label(leftLabel, lm.width || 200), left: pad, top: 8 },
      { input: left, left: pad, top: header },
      { input: label(rightLabel, rm.width || 200), left: pad + (lm.width || 1) + gap, top: 8 },
      { input: right, left: pad + (lm.width || 1) + gap, top: header }
    ])
    .png()
    .toFile(dest);
}

const profiles = [
  {
    key: 'lea-9medailles',
    name: 'Léa',
    school: 'CM2 Victor-Schœlcher',
    avatar: 'deputee',
    xp: 290,
    badges: ['hemi', 'galerie', 'secrets', 'justice', 'histoire', 'enfants', 'pouvoirs', 'mindmap', 'quiz'],
    score: 8
  },
  {
    key: 'theo-3medailles',
    name: 'Théo',
    school: 'École Jean Moulin · CM2',
    avatar: 'depute',
    xp: 80,
    badges: ['hemi', 'galerie', 'secrets'],
    score: 6
  }
];

const server = http.createServer((req, res) => {
  let pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  let filePath = path.join(DIST, pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
  else if (!path.extname(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404);
    res.end('404');
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

await new Promise((r) => server.listen(8988, '127.0.0.1', r));
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  for (const profile of profiles) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8988/etape/11-quiz-diplome/', { waitUntil: 'networkidle' });
    await page.evaluate((p) => {
      const st = {
        userName: p.name,
        avatar: p.avatar,
        xp: p.xp,
        completedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].slice(0, p.badges.length + 2),
        unlockedBadges: p.badges,
        fontSize: 'normal',
        dysMode: false,
        classroomMode: false,
        soundEnabled: true,
        onboardingDone: true,
        finalQuizBestScore: p.score,
        finalQuizXpAwarded: true,
        diplomaUnlocked: true,
        diplomaUnlockMode: 'quiz',
        diplomaSchoolName: p.school
      };
      localStorage.setItem('an_cm2_v2_state', JSON.stringify(st));
    }, profile);
    await page.reload({ waitUntil: 'networkidle' });
    await page.fill('#diploma-student-name', profile.name);
    await page.fill('#diploma-school-name', profile.school);
    await page.waitForTimeout(200);

    const card = page.locator('#diploma-printable-card');
    await card.scrollIntoViewIfNeeded();
    const refPath = path.join(OUT, `diplome-reference-${profile.key}.png`);
    await card.screenshot({ path: refPath });

    const downloadPromise = page.waitForEvent('download', { timeout: 20000 });
    await page.locator('#download-diploma-pdf-btn').click();
    const download = await downloadPromise;
    const pdfPath = path.join(OUT, `diplome-${profile.key}.pdf`);
    await download.saveAs(pdfPath);

    const pdf = fs.readFileSync(pdfPath);
    const jpeg = extractJpeg(pdf);
    const previewPath = path.join(OUT, `diplome-preview-${profile.key}.png`);
    await sharp(jpeg).png().toFile(previewPath);

    await sideBySide(
      refPath,
      previewPath,
      path.join(OUT, `diplome-comparaison-${profile.key}.png`),
      'Référence HTML (#diploma-printable-card)',
      'Aperçu PDF généré'
    );

    console.log('OK', profile.key, 'pdf', pdf.length, 'jpeg', jpeg.length);
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}
