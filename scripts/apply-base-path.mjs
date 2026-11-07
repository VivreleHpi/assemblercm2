import fs from 'node:fs';
import path from 'node:path';

const rawBase = (process.env.BASE_PATH || '').trim().replace(/\/+$/, '');

if (!rawBase || rawBase === '/') {
  console.log('[base-path] Aucun sous-chemin GitHub Pages détecté (racine / conservée).');
  process.exit(0);
}

const basePath = rawBase.startsWith('/') ? rawBase : `/${rawBase}`;
const distDir = path.resolve('dist');

console.log(`[base-path] Application du préfixe "${basePath}" dans ./dist pour GitHub Pages...`);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(full));
    } else if (/\.(html|css|js|webmanifest|xml)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const targetPrefixes = [
  '_astro/',
  'img/',
  'fonts/',
  'og/',
  'etape/',
  'enseignants/',
  'glossaire/',
  'credits/',
  'styleguide/',
  'favicon.svg',
  'manifest.webmanifest',
  'sw.js',
  'icon-192.png',
  'icon-512.png',
  '#carte-parcours'
];

const escapedPrefixes = targetPrefixes.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
// Match "/<prefix>" preceded by quote, backtick, space, comma, or url(, only if not already prefixed
const regex = new RegExp(`(["'\`\\s,(])\\/(${escapedPrefixes})`, 'g');
const duplicateBaseRegex = new RegExp(`(${basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}){2,}`, 'g');

const files = walk(distDir);
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let updated = content.replace(regex, `$1${basePath}/$2`);
  // Also handle exact root href="/"
  updated = updated.replace(/href="\/"/g, `href="${basePath}/"`);

  // Handle manifest.webmanifest start_url & scope
  if (file.endsWith('manifest.webmanifest')) {
    updated = updated
      .replace(/"start_url":\s*"\/"/g, `"start_url": "${basePath}/"`)
      .replace(/"scope":\s*"\/"/g, `"scope": "${basePath}/"`);
  }

  // Handle sw.js root URL '/' in PRECACHE_URLS
  if (file.endsWith('sw.js')) {
    updated = updated.replace(/(['"])\/(['"])/g, `$1${basePath}/$2`);
  }

  // Collapse any accidental duplicate basePath
  updated = updated.replace(duplicateBaseRegex, basePath);

  if (updated !== content) {
    fs.writeFileSync(file, updated, 'utf8');
  }
}

console.log(`[base-path] Terminé (${files.length} fichiers vérifiés).`);
