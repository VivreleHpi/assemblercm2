import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const repoUrl = 'https://github.com/VivreleHpi/assemblercm2.git';
const basePath = '/assemblercm2';

console.log('1/4 Build statique Astro avec BASE_PATH=/assemblercm2...');
execSync('npm run build', {
  stdio: 'inherit',
  env: { ...process.env, BASE_PATH: basePath }
});

const distDir = path.resolve('dist');
fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf8');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'assemblercm2-ghpages-'));
console.log('2/4 Préparation de la branche gh-pages...');
fs.cpSync(distDir, tmpDir, { recursive: true });

execSync('git init', { cwd: tmpDir, stdio: 'inherit' });
execSync('git checkout -b gh-pages', { cwd: tmpDir, stdio: 'inherit' });
execSync('git add -A', { cwd: tmpDir, stdio: 'inherit' });
execSync('git commit -m "Deploy GitHub Pages"', { cwd: tmpDir, stdio: 'inherit' });

console.log('3/4 Envoi sur origin/gh-pages...');
execSync(`git push -f ${repoUrl} gh-pages:gh-pages`, { cwd: tmpDir, stdio: 'inherit' });

fs.rmSync(tmpDir, { recursive: true, force: true });

console.log('4/4 Restauration du build local (BASE_PATH racine)...');
execSync('npm run build', {
  stdio: 'inherit',
  env: { ...process.env, BASE_PATH: '' }
});

console.log('\nDéploiement terminé : https://vivrelehpi.github.io/assemblercm2/');
