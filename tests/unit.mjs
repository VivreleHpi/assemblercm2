import assert from 'node:assert/strict';
import fs from 'node:fs';
import { formatProgressLabel, diplomaFilename, medalShortLabels, formatDiplomaQuizScore, homeDiplomaCtaLabel } from '../src/scripts/ui-helpers.ts';
import { buildDiplomaPdf, DIPLOMA_CAPTURE_WIDTH_PX } from '../src/scripts/diploma-pdf.ts';

function test(name, fn) {
  fn();
  console.log(`✅ ${name}`);
}

test('homeDiplomaCtaLabel accorde Députée / Député', () => {
  assert.equal(homeDiplomaCtaLabel(true), 'Voir mon diplôme de Députée');
  assert.equal(homeDiplomaCtaLabel(false), 'Voir mon diplôme de Député');
});

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

test('formatDiplomaQuizScore évite la redondance « au Grand Quiz »', () => {
  assert.equal(formatDiplomaQuizScore(8), '8 / 8');
  assert.equal(formatDiplomaQuizScore(6), '6 / 8');
  assert.equal(formatDiplomaQuizScore('6 / 8 au Grand Quiz'), '6 / 8');
  assert.equal(formatDiplomaQuizScore('Validé en classe ✓'), 'Validé en classe ✓');
});

test('service worker précache les avatars PNG et WebP', () => {
  const sw = fs.readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(sw, /assemblee-cm2-v7/);
  ['depute', 'deputee', 'malik', 'papa', 'duo'].forEach((id) => {
    assert.ok(sw.includes(`/img/avatars/avatar-${id}.png`), `précache PNG ${id}`);
    assert.ok(sw.includes(`/img/avatars/avatar-${id}.webp`), `précache WebP ${id}`);
  });
});

test('medalShortLabels ne garde que les médailles obtenues', () => {
  assert.deepEqual(medalShortLabels(['hemi', 'galerie', 'quiz']), ['Hémicycle', 'Palais', 'Quiz']);
  assert.deepEqual(medalShortLabels(['hemi', 'inconnu', 'secrets']), ['Hémicycle', 'Coulisses']);
});

function tinyJpeg() {
  return Uint8Array.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
    0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
    0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
    0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0xff, 0xc4, 0x00, 0x14,
    0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x7f, 0x3f, 0xff, 0xd9
  ]);
}

test('DIPLOMA_CAPTURE_WIDTH_PX correspond au format A4 paysage @ 96 dpi', () => {
  assert.equal(DIPLOMA_CAPTURE_WIDTH_PX, 1122);
});

test('buildDiplomaPdf embarque la capture JPEG du diplôme HTML en A4 paysage', () => {
  const jpeg = tinyJpeg();
  const { bytes, filename } = buildDiplomaPdf({
    studentName: 'Léa',
    pageJpeg: jpeg
  });

  assert.equal(filename, 'diplome-depute-junior-lea.pdf');
  assert.ok(bytes.byteLength > jpeg.byteLength, 'PDF contient plus que le JPEG seul');
  const ascii = Buffer.from(bytes).toString('latin1');
  assert.ok(ascii.startsWith('%PDF-1.'), 'en-tête %PDF');
  assert.ok(ascii.includes('/MediaBox [0 0 842 595]'), 'A4 paysage 842×595 pts');
  assert.ok(ascii.includes('/Subtype /Image'), 'page = image du composant HTML');
  assert.ok(ascii.includes('/DCTDecode'), 'JPEG DCTDecode');
  assert.ok(ascii.includes('\xff\xd8\xff'), 'octets JPEG SOI présents');
});
