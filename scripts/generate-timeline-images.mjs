import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

const imgDir = path.resolve('public/img');

// 1. Original pedagogical SVG illustrations (1280x960, 4:3)
const svg1944 = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="960" viewBox="0 0 1280 960">
  <defs>
    <linearGradient id="bg1944" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0B1B3A"/>
      <stop offset="100%" stop-color="#002654"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="960" fill="url(#bg1944)"/>
  <!-- Tricolor top border -->
  <rect x="0" y="0" width="427" height="16" fill="#002654"/>
  <rect x="427" y="0" width="426" height="16" fill="#FAF7F0"/>
  <rect x="853" y="0" width="427" height="16" fill="#CE1126"/>

  <!-- Left: Historical Document Parchment (Ordonnance du 21 avril 1944) -->
  <rect x="70" y="90" width="600" height="780" rx="20" fill="#FAF7F0" stroke="#E8B21A" stroke-width="6"/>
  <rect x="96" y="116" width="548" height="728" rx="12" fill="none" stroke="#8B1E2D" stroke-width="2" stroke-dasharray="8 6"/>
  
  <rect x="130" y="150" width="480" height="44" rx="22" fill="#8B1E2D"/>
  <text x="370" y="179" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="20" font-weight="bold">ORDONNANCE DU 21 AVRIL 1944</text>

  <text x="370" y="245" text-anchor="middle" fill="#002654" font-family="serif" font-size="26" font-weight="bold">RÉPUBLIQUE FRANÇAISE</text>
  <text x="370" y="280" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="18">Comité français de la Libération nationale · Alger</text>
  <line x1="200" y1="305" x2="540" y2="305" stroke="#E8B21A" stroke-width="3"/>

  <rect x="130" y="335" width="480" height="230" rx="14" fill="#FFFFFF" stroke="#002654" stroke-width="3"/>
  <text x="370" y="380" text-anchor="middle" fill="#8B1E2D" font-family="sans-serif" font-size="22" font-weight="bold">ARTICLE 17</text>
  <text x="370" y="425" text-anchor="middle" fill="#0F172A" font-family="serif" font-size="23" font-style="italic">« Les femmes sont électrices et</text>
  <text x="370" y="460" text-anchor="middle" fill="#0F172A" font-family="serif" font-size="23" font-style="italic">éligibles dans les mêmes conditions</text>
  <text x="370" y="495" text-anchor="middle" fill="#0F172A" font-family="serif" font-size="23" font-style="italic">que les hommes. »</text>
  <text x="370" y="540" text-anchor="middle" fill="#002654" font-family="sans-serif" font-size="16" font-weight="bold">Signé : Charles de Gaulle · 21 avril 1944</text>

  <!-- Key dates inside parchment -->
  <rect x="130" y="595" width="480" height="95" rx="12" fill="#DBE4F3"/>
  <text x="155" y="632" fill="#002654" font-family="sans-serif" font-size="19" font-weight="bold">• 29 avril 1945 : 1er vote des Françaises</text>
  <text x="155" y="666" fill="#002654" font-family="sans-serif" font-size="19" font-weight="bold">• 21 oct. 1945 : 33 premières femmes députées</text>

  <circle cx="370" cy="770" r="54" fill="#E8B21A" stroke="#8B1E2D" stroke-width="4"/>
  <text x="370" y="766" text-anchor="middle" fill="#0F172A" font-family="sans-serif" font-size="15" font-weight="bold">SUFFRAGE</text>
  <text x="370" y="786" text-anchor="middle" fill="#0F172A" font-family="sans-serif" font-size="14" font-weight="bold">UNIVERSEL</text>

  <!-- Right: Citizen Ballot Box & Voter Card (1945) -->
  <g transform="translate(730, 120)">
    <!-- Voter Card -->
    <rect x="40" y="20" width="400" height="230" rx="16" fill="#FAF7F0" stroke="#E8B21A" stroke-width="4" transform="rotate(-3 240 135)"/>
    <rect x="65" y="45" width="350" height="36" rx="8" fill="#002654" transform="rotate(-3 240 135)"/>
    <text x="240" y="70" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="18" font-weight="bold" transform="rotate(-3 240 135)">CARTE D’ÉLECTRICE · 1945</text>
    <text x="240" y="125" text-anchor="middle" fill="#0F172A" font-family="sans-serif" font-size="22" font-weight="bold" transform="rotate(-3 240 135)">Liberté · Égalité · Fraternité</text>
    <text x="240" y="165" text-anchor="middle" fill="#8B1E2D" font-family="sans-serif" font-size="18" font-weight="bold" transform="rotate(-3 240 135)">Élections municipales &amp; législatives</text>
    <rect x="150" y="185" width="180" height="36" rx="18" fill="#146C32" transform="rotate(-3 240 135)"/>
    <text x="240" y="209" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="16" font-weight="bold" transform="rotate(-3 240 135)">A VOTÉ ✓</text>

    <!-- Envelope dropping into Ballot Box -->
    <rect x="140" y="300" width="200" height="95" rx="8" fill="#DBE4F3" stroke="#002654" stroke-width="4"/>
    <path d="M140 300 L240 352 L340 300" fill="none" stroke="#002654" stroke-width="4"/>
    <text x="240" y="380" text-anchor="middle" fill="#002654" font-family="sans-serif" font-size="14" font-weight="bold">BULLETIN DE VOTE</text>

    <!-- Ballot Box (Urne républicaine) -->
    <rect x="60" y="410" width="360" height="300" rx="18" fill="#FAF7F0" stroke="#E8B21A" stroke-width="6"/>
    <rect x="45" y="395" width="390" height="34" rx="10" fill="#8B1E2D"/>
    <rect x="150" y="405" width="180" height="12" rx="6" fill="#0B1B3A"/>
    
    <!-- Tricolor ribbon on ballot box -->
    <rect x="66" y="460" width="116" height="20" fill="#002654"/>
    <rect x="182" y="460" width="116" height="20" fill="#FFFFFF"/>
    <rect x="298" y="460" width="116" height="20" fill="#CE1126"/>

    <text x="240" y="545" text-anchor="middle" fill="#002654" font-family="sans-serif" font-size="28" font-weight="bold">URNE CITOYENNE</text>
    <text x="240" y="585" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="20" font-weight="bold">1944 – 1945</text>
    <text x="240" y="635" text-anchor="middle" fill="#8B1E2D" font-family="sans-serif" font-size="18" font-weight="bold">12 millions de citoyennes électrices</text>
  </g>

  <text x="640" y="925" text-anchor="middle" fill="#E8B21A" font-family="sans-serif" font-size="18" font-weight="bold">Illustration pédagogique originale (CM2) · Ordonnance du 21 avril 1944 &amp; premier vote des Françaises en 1945</text>
</svg>`;

const svg1994 = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="960" viewBox="0 0 1280 960">
  <defs>
    <linearGradient id="bg1994" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0B1B3A"/>
      <stop offset="100%" stop-color="#1E3A8A"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="960" fill="url(#bg1994)"/>
  <rect x="0" y="0" width="427" height="16" fill="#002654"/>
  <rect x="427" y="0" width="426" height="16" fill="#FAF7F0"/>
  <rect x="853" y="0" width="427" height="16" fill="#CE1126"/>

  <!-- Header Banner -->
  <rect x="140" y="55" width="1000" height="90" rx="20" fill="#FAF7F0" stroke="#E8B21A" stroke-width="5"/>
  <text x="640" y="98" text-anchor="middle" fill="#8B1E2D" font-family="sans-serif" font-size="28" font-weight="bold">CRÉATION DU PARLEMENT DES ENFANTS · 4 JUIN 1994</text>
  <text x="640" y="128" text-anchor="middle" fill="#002654" font-family="sans-serif" font-size="19" font-weight="bold">577 classes de CM2 découvrent le travail de législateur au Palais Bourbon</text>

  <!-- Semicircular Hemicycle Arch -->
  <g transform="translate(640, 560)">
    <path d="M -480 0 A 480 340 0 0 1 480 0 Z" fill="#8B1E2D" stroke="#E8B21A" stroke-width="6"/>
    <path d="M -380 0 A 380 265 0 0 1 380 0 Z" fill="#FAF7F0" fill-opacity="0.12" stroke="#FAF7F0" stroke-width="3" stroke-dasharray="10 8"/>
    <path d="M -270 0 A 270 190 0 0 1 270 0 Z" fill="#0B1B3A" stroke="#E8B21A" stroke-width="4"/>

    <!-- Perchoir & Tribune in center -->
    <rect x="-135" y="-110" width="270" height="95" rx="14" fill="#FAF7F0" stroke="#E8B21A" stroke-width="4"/>
    <text x="0" y="-72" text-anchor="middle" fill="#002654" font-family="sans-serif" font-size="19" font-weight="bold">TRIBUNE &amp; PERCHOIR</text>
    <text x="0" y="-40" text-anchor="middle" fill="#8B1E2D" font-family="sans-serif" font-size="17" font-weight="bold">577 délégués juniors</text>
  </g>

  <!-- Three Pedagogical Cards below the Hemicycle -->
  <g transform="translate(80, 610)">
    <rect x="0" y="0" width="350" height="230" rx="18" fill="#FAF7F0" stroke="#E8B21A" stroke-width="4"/>
    <rect x="24" y="22" width="130" height="32" rx="16" fill="#002654"/>
    <text x="89" y="44" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="15" font-weight="bold">1. DÉBATTRE</text>
    <text x="24" y="88" fill="#0F172A" font-family="sans-serif" font-size="21" font-weight="bold">En classe de CM2</text>
    <text x="24" y="122" fill="#475569" font-family="sans-serif" font-size="17">Les élèves réfléchissent</text>
    <text x="24" y="148" fill="#475569" font-family="sans-serif" font-size="17">ensemble à un sujet citoyen</text>
    <text x="24" y="174" fill="#475569" font-family="sans-serif" font-size="17">avec leur enseignant(e).</text>

    <rect x="385" y="0" width="350" height="230" rx="18" fill="#FAF7F0" stroke="#E8B21A" stroke-width="4"/>
    <rect x="409" y="22" width="130" height="32" rx="16" fill="#8B1E2D"/>
    <text x="474" y="44" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="15" font-weight="bold">2. RÉDIGER</text>
    <text x="409" y="88" fill="#0F172A" font-family="sans-serif" font-size="21" font-weight="bold">Une proposition pédagogique</text>
    <text x="409" y="122" fill="#475569" font-family="sans-serif" font-size="17">Un exposé des motifs et</text>
    <text x="409" y="148" fill="#475569" font-family="sans-serif" font-size="17">4 articles maximum pour</text>
    <text x="409" y="174" fill="#475569" font-family="sans-serif" font-size="17">apprendre à écrire le droit.</text>

    <rect x="770" y="0" width="350" height="230" rx="18" fill="#FAF7F0" stroke="#E8B21A" stroke-width="4"/>
    <rect x="794" y="22" width="130" height="32" rx="16" fill="#146C32"/>
    <text x="859" y="44" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="15" font-weight="bold">3. VOTER</text>
    <text x="794" y="88" fill="#0F172A" font-family="sans-serif" font-size="21" font-weight="bold">Apprentissage de la loi</text>
    <text x="794" y="122" fill="#475569" font-family="sans-serif" font-size="17">Un exercice civique qui peut</text>
    <text x="794" y="148" fill="#475569" font-family="sans-serif" font-size="17">inspirer les députés (sans être</text>
    <text x="794" y="174" fill="#475569" font-family="sans-serif" font-size="17">une loi automatique).</text>
  </g>

  <text x="640" y="915" text-anchor="middle" fill="#E8B21A" font-family="sans-serif" font-size="18" font-weight="bold">Illustration pédagogique originale (CM2) · Opération créée en 1994 par l’Assemblée nationale et l’Éducation nationale</text>
</svg>`;

const svg2026 = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="960" viewBox="0 0 1280 960">
  <defs>
    <linearGradient id="bg2026" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#002654"/>
      <stop offset="100%" stop-color="#0B1B3A"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="960" fill="url(#bg2026)"/>
  <rect x="0" y="0" width="427" height="16" fill="#002654"/>
  <rect x="427" y="0" width="426" height="16" fill="#FAF7F0"/>
  <rect x="853" y="0" width="427" height="16" fill="#CE1126"/>

  <!-- Top Title Card -->
  <rect x="80" y="55" width="1120" height="110" rx="20" fill="#FAF7F0" stroke="#E8B21A" stroke-width="5"/>
  <text x="640" y="102" text-anchor="middle" fill="#002654" font-family="sans-serif" font-size="30" font-weight="bold">L’ASSEMBLÉE NATIONALE AUJOURD’HUI (2026 – 2027)</text>
  <text x="640" y="140" text-anchor="middle" fill="#8B1E2D" font-family="sans-serif" font-size="21" font-weight="bold">577 députés élus · Démocratie vivante &amp; 30e édition du Parlement des enfants</text>

  <!-- Left: Neoclassical 12-Column Palais Bourbon Stylized Facade -->
  <g transform="translate(80, 210)">
    <rect x="0" y="0" width="520" height="630" rx="20" fill="#FAF7F0" stroke="#E8B21A" stroke-width="4"/>
    <text x="260" y="50" text-anchor="middle" fill="#002654" font-family="sans-serif" font-size="23" font-weight="bold">LE PALAIS BOURBON EN DIRECT</text>
    
    <!-- Pediment (Fronton) -->
    <polygon points="50,155 260,75 470,155" fill="#002654" stroke="#E8B21A" stroke-width="4"/>
    <text x="260" y="138" text-anchor="middle" fill="#E8B21A" font-family="sans-serif" font-size="16" font-weight="bold">577 DÉPUTÉS</text>

    <!-- 12 Columns -->
    <g fill="#DBE4F3" stroke="#002654" stroke-width="2">
      <rect x="62" y="160" width="22" height="170" rx="4"/>
      <rect x="96" y="160" width="22" height="170" rx="4"/>
      <rect x="130" y="160" width="22" height="170" rx="4"/>
      <rect x="164" y="160" width="22" height="170" rx="4"/>
      <rect x="198" y="160" width="22" height="170" rx="4"/>
      <rect x="232" y="160" width="22" height="170" rx="4"/>
      <rect x="266" y="160" width="22" height="170" rx="4"/>
      <rect x="300" y="160" width="22" height="170" rx="4"/>
      <rect x="334" y="160" width="22" height="170" rx="4"/>
      <rect x="368" y="160" width="22" height="170" rx="4"/>
      <rect x="402" y="160" width="22" height="170" rx="4"/>
      <rect x="436" y="160" width="22" height="170" rx="4"/>
    </g>
    <rect x="45" y="332" width="430" height="24" rx="6" fill="#002654"/>

    <!-- Missions Today -->
    <rect x="35" y="385" width="450" height="210" rx="14" fill="#FFFFFF" stroke="#E5E1D8" stroke-width="3"/>
    <text x="60" y="425" fill="#0F172A" font-family="sans-serif" font-size="19" font-weight="bold">• Voter la loi et le budget de l’État</text>
    <text x="60" y="468" fill="#0F172A" font-family="sans-serif" font-size="19" font-weight="bold">• Contrôler l’action du Gouvernement</text>
    <text x="60" y="511" fill="#0F172A" font-family="sans-serif" font-size="19" font-weight="bold">• Séances publiques ouvertes à tous</text>
    <text x="60" y="554" fill="#8B1E2D" font-family="sans-serif" font-size="19" font-weight="bold">• Navette avec les 348 sénateurs</text>
  </g>

  <!-- Right: 30e Edition du Parlement des enfants (2026-2027) -->
  <g transform="translate(640, 210)">
    <rect x="0" y="0" width="560" height="630" rx="20" fill="#FAF7F0" stroke="#E8B21A" stroke-width="4"/>
    <rect x="35" y="28" width="490" height="44" rx="22" fill="#E8B21A"/>
    <text x="280" y="57" text-anchor="middle" fill="#0F172A" font-family="sans-serif" font-size="20" font-weight="bold">30e ÉDITION · PARLEMENT DES ENFANTS</text>

    <text x="280" y="112" text-anchor="middle" fill="#002654" font-family="sans-serif" font-size="22" font-weight="bold">Année scolaire 2026 – 2027 (CM2 &amp; 6e)</text>

    <rect x="35" y="138" width="490" height="115" rx="14" fill="#8B1E2D"/>
    <text x="280" y="175" text-anchor="middle" fill="#E8B21A" font-family="sans-serif" font-size="17" font-weight="bold">THÈME OFFICIEL DE LA 30e ÉDITION :</text>
    <text x="280" y="210" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="bold">« Favoriser l’accès à la culture</text>
    <text x="280" y="238" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="bold">pour toutes et tous »</text>

    <!-- Scheduled Calendar 2027 -->
    <rect x="35" y="280" width="490" height="315" rx="14" fill="#FFFFFF" stroke="#002654" stroke-width="3"/>
    <text x="60" y="320" fill="#002654" font-family="sans-serif" font-size="19" font-weight="bold">Calendrier programmé de la 30e édition :</text>
    <text x="60" y="365" fill="#0F172A" font-family="sans-serif" font-size="18">1. Sélection &amp; rédaction en classe (CM2 et 6e)</text>
    <text x="60" y="410" fill="#0F172A" font-family="sans-serif" font-size="18">2. Jury national : 3 ou 4 février 2027</text>
    <text x="60" y="455" fill="#0F172A" font-family="sans-serif" font-size="18">3. Fin du vote électronique : 5 mars 2027</text>
    <text x="60" y="500" fill="#0F172A" font-family="sans-serif" font-size="18">4. Accueil des classes finalistes : 10 mars 2027</text>
    <rect x="60" y="528" width="440" height="44" rx="10" fill="#DBE4F3"/>
    <text x="280" y="556" text-anchor="middle" fill="#002654" font-family="sans-serif" font-size="16" font-weight="bold">Source officielle : parlementdesenfants.fr</text>
  </g>

  <text x="640" y="915" text-anchor="middle" fill="#E8B21A" font-family="sans-serif" font-size="18" font-weight="bold">Illustration pédagogique originale (CM2) · L’Assemblée nationale aujourd’hui et la 30e édition 2026-2027</text>
</svg>`;

async function buildVariants(baseName, inputBufferOrFile) {
  console.log(`Processing ${baseName}...`);
  // Normalize base .jpg to max 1600px width
  const jpgPath = path.join(imgDir, `${baseName}.jpg`);
  const meta = await sharp(inputBufferOrFile).metadata();
  const targetWidth = Math.min(meta.width || 1280, 1600);

  await sharp(inputBufferOrFile)
    .resize({ width: targetWidth, withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(jpgPath + '.tmp');
  fs.renameSync(jpgPath + '.tmp', jpgPath);

  const widths = [480, 960, 1600];
  for (const w of widths) {
    await sharp(jpgPath)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(imgDir, `${baseName}-${w}.webp`));

    await sharp(jpgPath)
      .resize({ width: w, withoutEnlargement: true })
      .avif({ quality: 65 })
      .toFile(path.join(imgDir, `${baseName}-${w}.avif`));
  }
  const finalMeta = await sharp(jpgPath).metadata();
  console.log(`  ✓ ${baseName} (${finalMeta.width}x${finalMeta.height}) -> .jpg + 480/960/1600 .webp & .avif`);
}

(async () => {
  await buildVariants('conseil-cinq-cents-1798', path.join(imgDir, 'conseil-cinq-cents-1798.jpg'));
  await buildVariants('schoelcher-1848', path.join(imgDir, 'schoelcher-1848.jpg'));
  await buildVariants('vote-femmes-1944', Buffer.from(svg1944));
  await buildVariants('constitution-1958', path.join(imgDir, 'constitution-1958.jpg'));
  await buildVariants('parlement-enfants-1994', Buffer.from(svg1994));
  await buildVariants('assemblee-2026', Buffer.from(svg2026));
  console.log('All 6 new timeline illustrations generated and optimized!');
})();
