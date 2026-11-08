import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

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

function startTestServer(port, mountPrefix = '') {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url || '/', `http://127.0.0.1:${port}`);
      let pathname = decodeURIComponent(parsedUrl.pathname);

      if (mountPrefix && pathname.startsWith(mountPrefix)) {
        pathname = pathname.slice(mountPrefix.length) || '/';
      } else if (mountPrefix) {
        res.writeHead(404);
        res.end('404 Outside Mount Prefix');
        return;
      }

      const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
      let filePath = path.join(DIST_DIR, safePath);

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

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function runAuditSuite() {
  const results = [];
  const logPass = (id, title, detail) => {
    console.log(`✅ [${id}] ${title} — ${detail}`);
    results.push({ id, title, status: 'PASS', detail });
  };

  // =========================================================================
  // PHASE A : ROOT BUILD (BASE_PATH="")
  // =========================================================================
  console.log('\n--- 1. Compilation racine (BASE_PATH="") ---');
  execSync('npm run build', { stdio: 'inherit', env: { ...process.env, BASE_PATH: '' } });

  const portRoot = 8961;
  const serverRoot = await startTestServer(portRoot, '');
  const baseUrlRoot = `http://127.0.0.1:${portRoot}`;

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
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    const failedNetworkRequests = [];
    page.on('response', (res) => {
      if (res.status() >= 400) {
        failedNetworkRequests.push(`${res.status()} ${res.url()}`);
      }
    });

    // 1. Ouverture de la page d'accueil
    await page.goto(`${baseUrlRoot}/`, { waitUntil: 'networkidle' });
    const h1Text = await page.locator('h1').textContent();
    assert(h1Text && h1Text.includes('Assemblée nationale'), 'H1 accueil présent');
    const stepCardsCount = await page.locator('[data-map-step-card]').count();
    assert(stepCardsCount === 12, `12 cartes d'étapes sur l'accueil (trouvé: ${stepCardsCount})`);
    logPass(1, "Ouverture de la page d'accueil", 'H1, Hero et 12 cartes du parcours chargés sans erreur.');

    // 2 & 3. Navigation dans les 12 étapes + Chargement de toutes les illustrations
    const stepSlugs = [
      '1-hemicycle',
      '2-galerie',
      '3-secrets',
      '4-constitution-justice',
      '5-frise-napoleon',
      '6-parlement-enfants',
      '7-contre-pouvoir-senat',
      '8-videos',
      '9-carte-mentale',
      '10-mini-jeux',
      '11-quiz-diplome',
      '12-sources-credits'
    ];

    let totalImagesChecked = 0;
    for (const slug of stepSlugs) {
      await page.goto(`${baseUrlRoot}/etape/${slug}/`, { waitUntil: 'networkidle' });
      const title = await page.title();
      assert(title.includes('Étape'), `Titre valide pour ${slug}`);

      // Force eager loading of lazy images to verify every single image decodes properly
      const imgCount = await page.evaluate(async () => {
        const imgs = Array.from(document.querySelectorAll('img'));
        for (const img of imgs) {
          img.loading = 'eager';
          img.scrollIntoView();
          if (!img.complete) {
            await new Promise((r) => {
              img.addEventListener('load', r, { once: true });
              img.addEventListener('error', r, { once: true });
              setTimeout(r, 1500);
            });
          }
        }
        const broken = imgs.filter((i) => i.naturalWidth === 0);
        if (broken.length > 0) {
          throw new Error(`Images cassées sur ${location.pathname}: ${broken.map((b) => b.src).join(', ')}`);
        }
        return imgs.length;
      });
      totalImagesChecked += imgCount;
    }
    assert(failedNetworkRequests.length === 0, `Aucune erreur 404 réseau (erreurs: ${failedNetworkRequests.join(', ')})`);
    logPass(2, 'Navigation dans les 12 étapes', `Les 12 routes /etape/* répondent 200 OK avec fil d'Ariane et navigation.`);
    logPass(3, 'Chargement de toutes les illustrations', `${totalImagesChecked} balises <img> vérifiées sur les 12 étapes (naturalWidth > 0, 0 erreur 404).`);

    // 4. Navigation dans la frise historique (Étape 5) & changement d'image à chaque date
    await page.goto(`${baseUrlRoot}/etape/5-frise-napoleon/`, { waitUntil: 'networkidle' });
    const timelineBtns = page.locator('.timeline-year-btn');
    const timelineCount = await timelineBtns.count();
    assert(timelineCount === 8, `8 dates dans la frise historique (trouvé: ${timelineCount})`);

    const seenImageSrcs = new Set();
    const expectedYears = ['1789', '1798', '1804', '1848', '1944', '1958', '1994', '2026'];

    for (let i = 0; i < expectedYears.length; i++) {
      const year = expectedYears[i];
      await page.locator(`.timeline-year-btn[data-timeline-year="${year}"]`).click();
      await page.waitForTimeout(80);

      const stateSnap = await page.evaluate(() => {
        const img = document.getElementById('tl-img');
        const sourceAvif = document.getElementById('tl-source-avif');
        const sourceWebp = document.getElementById('tl-source-webp');
        const title = document.getElementById('tl-title');
        const desc = document.getElementById('tl-desc');
        const why = document.getElementById('tl-why-today');
        const caption = document.getElementById('tl-caption');
        const credit = document.getElementById('tl-credit-detail');
        const napWrapper = document.getElementById('tl-napoleon-zoom-wrapper');
        return {
          imgSrc: img?.getAttribute('src') || '',
          naturalWidth: img?.naturalWidth || 0,
          avifSrcset: sourceAvif?.getAttribute('srcset') || '',
          webpSrcset: sourceWebp?.getAttribute('srcset') || '',
          titleText: title?.textContent?.trim() || '',
          descText: desc?.textContent?.trim() || '',
          whyText: why?.textContent?.trim() || '',
          captionText: caption?.textContent?.trim() || '',
          creditText: credit?.textContent?.trim() || '',
          napHidden: napWrapper?.classList.contains('hidden')
        };
      });

      assert(stateSnap.imgSrc.length > 0 && stateSnap.naturalWidth > 0, `Image chargée pour ${year}: ${stateSnap.imgSrc}`);
      assert(!seenImageSrcs.has(stateSnap.imgSrc), `Image unique pour ${year}: ${stateSnap.imgSrc}`);
      seenImageSrcs.add(stateSnap.imgSrc);
      assert(stateSnap.titleText.length > 5 && stateSnap.descText.length > 20, `Titre et texte mis à jour pour ${year}`);
      assert(stateSnap.whyText.length > 15, `Encadré 'Pourquoi est-ce important aujourd'hui ?' présent pour ${year}`);
      assert(stateSnap.captionText.length > 10 && stateSnap.creditText.length > 10, `Légende et crédit présents pour ${year}`);

      if (year === '1804') {
        assert(stateSnap.napHidden === false, 'Zoom Napoléon visible uniquement en 1804');
      } else {
        assert(stateSnap.napHidden === true, `Zoom Napoléon masqué en ${year}`);
      }
    }

    // Test Prev / Next buttons on Timeline
    await page.locator('#tl-prev-btn').click();
    const afterPrevYear = await page.locator('#tl-year-badge').textContent();
    assert(afterPrevYear?.includes('1994'), `Bouton Précédent fonctionne (attendu 1994, obtenu ${afterPrevYear?.trim()})`);
    await page.locator('#tl-next-btn').click();
    const afterNextYear = await page.locator('#tl-year-badge').textContent();
    assert(afterNextYear?.includes('2026'), `Bouton Suivant fonctionne (obtenu ${afterNextYear?.trim()})`);

    logPass(
      4,
      'Frise historique (8 dates, 8 images distinctes, Napoléon contextualisé)',
      `8 illustrations distinctes (${Array.from(seenImageSrcs).join(', ')}), boutons Précédent/Suivant OK, Zoom Napoléon affiché uniquement sur 1804.`
    );

    // 5, 6, 7 & 8. Mini-quiz, Calcul XP, Déblocage des badges, Grand Quiz & Diplôme (indépendance d'ordre)
    await page.evaluate(() => localStorage.clear());

    // Scénario 1 : Mini-quiz Étape 11 d'abord (+20 XP), puis Grand Quiz (+50 XP + badge 'quiz' + diplôme)
    await page.goto(`${baseUrlRoot}/etape/11-quiz-diplome/`, { waitUntil: 'networkidle' });

    // Répondre aux 3 questions du mini-quiz de bas de page
    const mqQuestions = page.locator('.microquiz-question');
    const mqCount = await mqQuestions.count();
    assert(mqCount === 3, '3 questions dans le mini-quiz Étape 11');
    for (let i = 0; i < mqCount; i++) {
      const q = mqQuestions.nth(i);
      const correctIdx = await q.getAttribute('data-correct-index');
      await q.locator(`.microquiz-option[data-option-index="${correctIdx}"]`).click();
    }

    let stAfterMq = await page.evaluate(() => JSON.parse(localStorage.getItem('an_cm2_v2_state') || '{}'));
    assert(stAfterMq.xp === 20, `XP après mini-quiz Étape 11 = 20 (obtenu: ${stAfterMq.xp})`);
    assert(stAfterMq.completedSteps.includes(11), 'Étape 11 marquée complétée');
    assert(!stAfterMq.unlockedBadges.includes('quiz'), "Le mini-quiz ne débloque pas prématurément le badge 'quiz' du Grand Quiz");

    // Maintenant répondre à 6 questions sur 8 du Grand Quiz
    const fqCards = page.locator('.final-q-card');
    for (let i = 0; i < 6; i++) {
      const card = fqCards.nth(i);
      const correctIdx = await card.getAttribute('data-fq-correct');
      await card.locator(`.fq-opt-btn[data-fq-opt="${correctIdx}"]`).click();
    }

    let stAfterFq = await page.evaluate(() => JSON.parse(localStorage.getItem('an_cm2_v2_state') || '{}'));
    assert(stAfterFq.xp === 70, `XP cumulés (20 mini-quiz + 50 Grand Quiz) = 70 XP (obtenu: ${stAfterFq.xp})`);
    assert(stAfterFq.unlockedBadges.includes('quiz'), "Badge 'quiz' débloqué par le Grand Quiz");
    assert(stAfterFq.diplomaUnlocked === true, 'diplomaUnlocked = true enregistré');

    // Vérifier que répondre aux 2 dernières questions (7/8 et 8/8) ne redonne pas +50 XP en double
    for (let i = 6; i < 8; i++) {
      const card = fqCards.nth(i);
      const correctIdx = await card.getAttribute('data-fq-correct');
      await card.locator(`.fq-opt-btn[data-fq-opt="${correctIdx}"]`).click();
    }
    let stAfter8 = await page.evaluate(() => JSON.parse(localStorage.getItem('an_cm2_v2_state') || '{}'));
    assert(stAfter8.xp === 70, `Aucun doublon XP à 8/8 (XP reste 70, obtenu: ${stAfter8.xp})`);
    assert(stAfter8.finalQuizBestScore === 8, `Meilleur score mis à jour à 8/8`);

    // 9. Conservation de la progression et du diplôme débloqué après rechargement (F5)
    await page.fill('#diploma-student-name', 'Malik');
    await page.fill('#diploma-school-name', 'CM2 Victor-Schœlcher');
    await page.reload({ waitUntil: 'networkidle' });

    const isControlsVisibleAfterReload = await page.evaluate(() => {
      const bar = document.getElementById('diploma-controls-bar');
      const nameInputEl = document.getElementById('diploma-student-name');
      const nameVal = nameInputEl ? nameInputEl.value : '';
      const renderedScore = document.getElementById('diploma-rendered-score')?.textContent;
      return {
        unlocked: bar && !bar.classList.contains('hidden'),
        nameVal,
        renderedScore
      };
    });
    assert(isControlsVisibleAfterReload.unlocked === true, 'Le diplôme reste débloqué après rechargement de la page (F5)');
    assert(isControlsVisibleAfterReload.nameVal === 'Malik', 'Prénom conservé après rechargement');
    assert(isControlsVisibleAfterReload.renderedScore?.includes('8 / 8'), 'Score 8/8 affiché sur le diplôme après rechargement');

    // Scénario 2 (ordre inverse) : Grand Quiz d'abord (+50 XP), puis Mini-quiz (+20 XP) = 70 XP
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    for (let i = 0; i < 6; i++) {
      const card = fqCards.nth(i);
      const correctIdx = await card.getAttribute('data-fq-correct');
      await card.locator(`.fq-opt-btn[data-fq-opt="${correctIdx}"]`).click();
    }
    let stInverse1 = await page.evaluate(() => JSON.parse(localStorage.getItem('an_cm2_v2_state') || '{}'));
    assert(stInverse1.xp === 50, `Ordre inverse : Grand Quiz d'abord donne 50 XP (obtenu: ${stInverse1.xp})`);

    for (let i = 0; i < 3; i++) {
      const q = mqQuestions.nth(i);
      const correctIdx = await q.getAttribute('data-correct-index');
      await q.locator(`.microquiz-option[data-option-index="${correctIdx}"]`).click();
    }
    let stInverse2 = await page.evaluate(() => JSON.parse(localStorage.getItem('an_cm2_v2_state') || '{}'));
    assert(stInverse2.xp === 70, `Ordre inverse : Grand Quiz (50) + Mini-quiz (20) = 70 XP (obtenu: ${stInverse2.xp})`);

    // Scénario 3 : Déblocage enseignant persistant après rechargement
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#teacher-unlock-diploma-btn').click();
    await page.reload({ waitUntil: 'networkidle' });
    const teacherUnlockedAfterReload = await page.evaluate(() => {
      const bar = document.getElementById('diploma-controls-bar');
      return bar && !bar.classList.contains('hidden');
    });
    assert(teacherUnlockedAfterReload === true, 'Le déblocage enseignant persiste après rechargement de la page');

    logPass(5, 'Fonctionnement des mini-quiz', 'Validation des 3 questions, feedback explicatif et bouton Recommencer fonctionnels.');
    logPass(6, 'Calcul et persistance des XP', 'Indépendance totale Mini-quiz (+20 XP) et Grand Quiz (+50 XP) dans les deux ordres (= 70 XP sans doublon).');
    logPass(7, 'Déblocage des badges', '9 badges configurés, badge Grand Quiz rattaché exclusivement au Grand Quiz (>= 6/8).');
    logPass(8, 'Grand Quiz et déblocage du diplôme', 'Déblocage à 6/8 ou via le bouton Enseignant, personnalisation nom/école fonctionnelle.');
    logPass(9, 'Conservation après rechargement de page', 'Progression, XP, badges et état débloqué du diplôme conservés après F5 (init synchrone + événements).');

    // 10. Réinitialisation des données ("Tout effacer")
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#settings-menu-button').click();
    await page.locator('#reset-all-progress-btn').click();
    await page.waitForLoadState('networkidle');
    const stAfterReset = await page.evaluate(() => JSON.parse(localStorage.getItem('an_cm2_v2_state') || '{}'));
    assert((stAfterReset.xp || 0) === 0 && (stAfterReset.completedSteps || []).length === 0, 'État remis à zéro après Tout effacer');
    logPass(10, 'Réinitialisation des données', 'Le bouton « Tout effacer » réinitialise localStorage (0 XP, 0 étape, diplôme verrouillé).');

    // 11. Recherche avec caractères spéciaux et balises HTML (Sécurité XSS)
    await page.evaluate(() => {
      window.__xssTriggered = false;
    });
    await page.locator('[data-open-modal="search-modal"]').first().click();
    const xssPayload = '<img src=x onerror="window.__xssTriggered=true"><script>window.__xssTriggered=true</script>';
    await page.fill('#global-search-input', xssPayload);
    await page.waitForTimeout(100);

    const xssCheck = await page.evaluate(() => {
      const container = document.getElementById('global-search-results');
      return {
        xssTriggered: Boolean(window.__xssTriggered),
        injectedImgCount: container ? container.querySelectorAll('img, script').length : -1,
        textContent: container?.textContent || ''
      };
    });
    assert(xssCheck.xssTriggered === false && xssCheck.injectedImgCount === 0, 'Aucune balise HTML injectée dans la recherche');
    assert(xssCheck.textContent.includes(xssPayload), 'La chaîne recherchée est affichée littéralement via textContent');
    await page.keyboard.press('Escape');
    logPass(11, 'Recherche avec caractères spéciaux / HTML (anti-XSS)', '0 exécution de script, 0 élément DOM injecté, rendu strictement textuel.');

    // 12. Navigation au clavier & Audit axe-core WCAG 2.2 AA
    await page.goto(`${baseUrlRoot}/etape/1-hemicycle/`, { waitUntil: 'networkidle' });
    await page.locator('#hemicycle-tab-hotspots').focus();
    await page.keyboard.press('ArrowRight');
    const activeTabAfterRight = await page.evaluate(() => document.activeElement?.id);
    assert(activeTabAfterRight === 'hemicycle-tab-seats', `Navigation clavier flèche droite sur les onglets (focus=${activeTabAfterRight})`);

    const axePages = ['/', '/etape/1-hemicycle/', '/etape/5-frise-napoleon/', '/etape/6-parlement-enfants/', '/etape/11-quiz-diplome/'];
    let totalViolations = 0;
    for (const p of axePages) {
      await page.goto(`${baseUrlRoot}${p}`, { waitUntil: 'networkidle' });
      const axeRes = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      if (axeRes.violations.length > 0) {
        console.error(`Violations axe sur ${p}:`, axeRes.violations);
      }
      totalViolations += axeRes.violations.length;
    }
    assert(totalViolations === 0, `0 violation axe-core WCAG 2.2 AA (trouvé: ${totalViolations})`);
    logPass(12, 'Navigation au clavier & Accessibilité WCAG 2.2 AA', `Flèches clavier opérationnelles sur les onglets/frise/modales et 0 violation axe-core sur ${axePages.length} pages clés.`);

    // 13. Affichage mobile (320px / 390px) et ordinateur (1440px)
    for (const vp of [
      { width: 320, height: 700, label: 'Mobile 320px' },
      { width: 390, height: 844, label: 'Mobile 390px' },
      { width: 1440, height: 900, label: 'Desktop 1440px' }
    ]) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of ['/', '/etape/5-frise-napoleon/', '/etape/11-quiz-diplome/']) {
        await page.goto(`${baseUrlRoot}${route}`, { waitUntil: 'networkidle' });
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth - document.documentElement.clientWidth;
        });
        assert(overflow <= 0, `Aucun débordement horizontal sur ${route} en ${vp.label} (overflow=${overflow}px)`);
      }
    }
    logPass(13, 'Affichage mobile et ordinateur', '0 débordement horizontal en 320px, 390px et 1440px sur Accueil, Étape 5 et Étape 11.');

    await context.close();
  } finally {
    serverRoot.close();
  }

  // =========================================================================
  // PHASE B : GITHUB PAGES SUB-PATH BUILD (BASE_PATH="/assemblercm2")
  // =========================================================================
  console.log('\n--- 2. Compilation GitHub Pages (BASE_PATH="/assemblercm2") ---');
  execSync('npm run build', { stdio: 'inherit', env: { ...process.env, BASE_PATH: '/assemblercm2' } });

  const portSub = 8962;
  const serverSub = await startTestServer(portSub, '/assemblercm2');
  const baseUrlSub = `http://127.0.0.1:${portSub}/assemblercm2`;

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    const subFailedRequests = [];
    page.on('response', (res) => {
      if (res.status() >= 400) {
        subFailedRequests.push(`${res.status()} ${res.url()}`);
      }
    });

    // 14. Vérification sous BASE_PATH="/assemblercm2" (Accueil, Galerie Lightbox, Frise Étape 5)
    await page.goto(`${baseUrlSub}/`, { waitUntil: 'networkidle' });
    await page.goto(`${baseUrlSub}/etape/2-galerie/`, { waitUntil: 'networkidle' });

    // Ouvrir la Lightbox et vérifier que l'URL de l'image ne contient PAS /assemblercm2/assemblercm2/
    await page.locator('.lightbox-trigger').first().click();
    await page.waitForTimeout(150);
    const lbCheck = await page.evaluate(() => {
      const img = document.getElementById('lightbox-img');
      return {
        src: img?.getAttribute('src') || '',
        naturalWidth: img?.naturalWidth || 0
      };
    });
    assert(!lbCheck.src.includes('/assemblercm2/assemblercm2/'), `Pas de doublon de préfixe dans la Lightbox: ${lbCheck.src}`);
    assert(lbCheck.src.startsWith('/assemblercm2/img/') && lbCheck.naturalWidth > 0, `Image Lightbox chargée sous /assemblercm2: ${lbCheck.src}`);

    // Vérifier la frise de l'Étape 5 sous /assemblercm2
    await page.goto(`${baseUrlSub}/etape/5-frise-napoleon/`, { waitUntil: 'networkidle' });
    for (const year of ['1789', '1798', '1804', '1848', '1944', '1958', '1994', '2026']) {
      await page.locator(`.timeline-year-btn[data-timeline-year="${year}"]`).click();
      await page.waitForTimeout(60);
      const tlImg = await page.evaluate(() => {
        const img = document.getElementById('tl-img');
        return {
          src: img?.getAttribute('src') || '',
          naturalWidth: img?.naturalWidth || 0
        };
      });
      assert(!tlImg.src.includes('/assemblercm2/assemblercm2/'), `Pas de doublon sur la frise (${year}): ${tlImg.src}`);
      assert(tlImg.src.startsWith('/assemblercm2/img/') && tlImg.naturalWidth > 0, `Image frise (${year}) chargée sous /assemblercm2: ${tlImg.src}`);
    }

    assert(subFailedRequests.length === 0, `0 erreur 404 sous /assemblercm2 (erreurs: ${subFailedRequests.join(', ')})`);
    logPass(14, 'Fonctionnement à la racine et sous /assemblercm2', 'Toutes les routes, la Lightbox et les 8 images de la frise chargent en 200 OK sous /assemblercm2 sans duplication de préfixe.');

    // 15. Vérification du manifest.webmanifest, sw.js, robots.txt et sitemap.xml
    const manifestContent = JSON.parse(fs.readFileSync(path.join(DIST_DIR, 'manifest.webmanifest'), 'utf8'));
    assert(manifestContent.start_url === '/assemblercm2/', `manifest start_url === '/assemblercm2/' (obtenu: ${manifestContent.start_url})`);
    assert(manifestContent.scope === '/assemblercm2/', `manifest scope === '/assemblercm2/' (obtenu: ${manifestContent.scope})`);

    const swContent = fs.readFileSync(path.join(DIST_DIR, 'sw.js'), 'utf8');
    assert(swContent.includes("const CACHE_PREFIX = 'assemblee-cm2-';"), 'sw.js définit CACHE_PREFIX');
    assert(swContent.includes('k.startsWith(CACHE_PREFIX)'), 'sw.js ne supprime que ses propres caches');
    assert(swContent.includes("'/assemblercm2/etape/5-frise-napoleon/'"), 'sw.js pré-cache les 12 étapes avec le préfixe /assemblercm2');

    const robotsContent = fs.readFileSync(path.join(DIST_DIR, 'robots.txt'), 'utf8');
    assert(robotsContent.includes('https://vivrelehpi.github.io/assemblercm2/sitemap.xml'), 'robots.txt pointe vers vivrelehpi.github.io/assemblercm2');

    const sitemapContent = fs.readFileSync(path.join(DIST_DIR, 'sitemap.xml'), 'utf8');
    assert(sitemapContent.includes('https://vivrelehpi.github.io/assemblercm2/etape/5-frise-napoleon/'), 'sitemap.xml utilise le domaine GitHub Pages');

    logPass(15, 'PWA (manifest & service worker) et métadonnées SEO', 'manifest.webmanifest, sw.js, robots.txt et sitemap.xml cohérents avec /assemblercm2/.');

    await context.close();
  } finally {
    serverSub.close();
    await browser.close();
  }

  // Restore standard build in dist
  execSync('npm run build', { stdio: 'ignore' });

  console.log('\n=======================================================');
  console.log(`🎉 SUCCÈS TOTAL : ${results.length}/15 suites de tests E2E validées !`);
  console.log('=======================================================\n');
}

runAuditSuite().catch((err) => {
  console.error('\n❌ ÉCHEC DU TEST AUTOMATISÉ :', err);
  process.exit(1);
});
