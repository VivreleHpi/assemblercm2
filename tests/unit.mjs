import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { formatProgressLabel, diplomaFilename } from '../src/scripts/ui-helpers.ts';
import { buildDiplomaPdf } from '../src/scripts/diploma-pdf.ts';

function test(name, fn) {
  fn();
  console.log(`✅ ${name}`);
}

test('formatProgressLabel affiche le nombre d’étapes validées', () => {
  assert.equal(formatProgressLabel(0), 'Parcours : 0 / 12');
  assert.equal(formatProgressLabel(1), 'Parcours : 1 / 12');
  assert.equal(formatProgressLabel(12), 'Parcours : 12 / 12');
});

test('diplomaFilename slugifie le prénom avec accents', () => {
  assert.equal(diplomaFilename('Léa'), 'diplome-depute-junior-lea.pdf');
  assert.equal(diplomaFilename('Jean-Étienne'), 'diplome-depute-junior-jean-etienne.pdf');
  assert.equal(diplomaFilename('   '), 'diplome-depute-junior-eleve.pdf');
});

test('buildDiplomaPdf produit un PDF A4 paysage avec accents français', () => {
  const { bytes, filename } = buildDiplomaPdf({
    studentName: 'Léa',
    schoolName: 'CM2 Victor-Schœlcher',
    xp: 290,
    badgesEarned: 9,
    badgesTotal: 9,
    quizScore: '8 / 8',
    date: new Date('2026-11-10T12:00:00Z'),
    isGirl: true
  });

  assert.equal(filename, 'diplome-depute-junior-lea.pdf');
  assert.ok(bytes.byteLength > 500, `PDF trop court (${bytes.byteLength})`);
  const ascii = Buffer.from(bytes).toString('latin1');
  assert.ok(ascii.startsWith('%PDF-1.'), 'en-tête %PDF');
  assert.ok(ascii.includes('/MediaBox [0 0 842 595]'), 'A4 paysage 842×595 pts');
  assert.ok(ascii.includes('/Encoding /WinAnsiEncoding'), 'encodage WinAnsi pour les accents');
  assert.ok(ascii.includes('Parcours citoyen par Malik'), 'mention Malik & Papa');
  // Léa → WinAnsi E9 pour é
  assert.ok(ascii.includes('L\xE9a') || ascii.includes('Léa'), 'prénom Léa avec accent');
  assert.ok(ascii.includes('290'), 'total XP');
  assert.ok(ascii.includes('9/9') || ascii.includes('9 / 9'), 'médailles');

  const artifactDirs = ['/opt/cursor/artifacts', '/cursor/stores/self/artifacts'];
  for (const dir of artifactDirs) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'diplome-exemple-lea.pdf'), bytes);
    } catch {
      // dossier artifacts indisponible dans cet environnement
    }
  }
});
