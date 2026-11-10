import { diplomaFilename } from './ui-helpers.ts';

export interface DiplomaPdfInput {
  studentName: string;
  schoolName?: string;
  xp: number;
  badgesEarned: number;
  badgesTotal: number;
  quizScore?: string;
  date: Date;
  isGirl?: boolean;
}

const WINANSI_EXTRA: Record<number, number> = {
  0x0152: 0x8c, // Œ
  0x0153: 0x9c, // œ
  0x0160: 0x8a,
  0x0161: 0x9a,
  0x0178: 0x9f,
  0x017d: 0x8e,
  0x017e: 0x9e,
  0x20ac: 0x80, // €
  0x2018: 0x91,
  0x2019: 0x92, // ’
  0x201a: 0x82,
  0x201c: 0x93,
  0x201d: 0x94,
  0x201e: 0x84,
  0x2013: 0x96, // –
  0x2014: 0x97, // —
  0x2022: 0x95,
  0x2026: 0x85,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x2039: 0x8b,
  0x203a: 0x9b
};

function toWinAnsi(text: string): string {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0) || 0;
    if (code === 10 || code === 13) {
      out += ' ';
      continue;
    }
    if (code < 128) {
      out += ch;
      continue;
    }
    if (code >= 0xa0 && code <= 0xff) {
      out += String.fromCharCode(code);
      continue;
    }
    const mapped = WINANSI_EXTRA[code];
    out += mapped ? String.fromCharCode(mapped) : '?';
  }
  return out;
}

function pdfLiteral(text: string): string {
  return `(${toWinAnsi(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')})`;
}

function formatFrenchDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function buildContentStream(input: DiplomaPdfInput): string {
  const name = (input.studentName || '').trim() || 'Jeune citoyen(ne) de CM2';
  const school = (input.schoolName || '').trim();
  const headingAccent = input.isGirl ? 'DIPLÔME DE DÉPUTÉE JUNIOR CM2' : 'DIPLÔME DE DÉPUTÉ JUNIOR CM2';
  const initial = name.charAt(0).toUpperCase();
  const dateLabel = formatFrenchDate(input.date);
  const xp = Number.isFinite(input.xp) ? input.xp : 0;
  const earned = Number.isFinite(input.badgesEarned) ? input.badgesEarned : 0;
  const total = input.badgesTotal || 9;
  const score = (input.quizScore || '').trim();
  const fill = input.isGirl ? '0.91 0.70 0.10' : '0 0.15 0.33';

  const lines = [
    'q',
    '0 0.15 0.33 rg 36 555 256 16 re f',
    '0.98 0.97 0.94 rg 292 555 258 16 re f',
    '0.81 0.07 0.15 rg 550 555 256 16 re f',
    'Q',
    'BT',
    '/F1 11 Tf 0 0.15 0.33 rg',
    `36 530 Td ${pdfLiteral('Parcours citoyen Cycle 3  ·  Enseignement Moral et Civique')} Tj`,
    '/F2 26 Tf 0 0.06 0.16 rg',
    `0 -36 Td ${pdfLiteral(headingAccent)} Tj`,
    '/F1 13 Tf 0.45 0.35 0.08 rg',
    `0 -22 Td ${pdfLiteral('Parcours citoyen par Malik & son Papa')} Tj`,
    '/F1 12 Tf 0.2 0.2 0.25 rg',
    `0 -28 Td ${pdfLiteral('Décerné avec les félicitations de Malik & son Papa à :')} Tj`,
    'ET',
    'q',
    `${fill} rg 36 350 54 54 re f`,
    '1 1 1 rg',
    'BT /F2 22 Tf 54 368 Td',
    `${pdfLiteral(initial)} Tj ET`,
    'Q',
    'BT',
    '/F2 28 Tf 0 0.15 0.33 rg',
    `102 366 Td ${pdfLiteral(name)} Tj`,
    '/F1 11 Tf 0.25 0.25 0.3 rg',
    school
      ? `0 -20 Td ${pdfLiteral(school)} Tj`
      : `0 -20 Td ${pdfLiteral("A validé le parcours Député Junior CM2 sur l'Assemblée nationale")} Tj`,
    '/F1 12 Tf 0.1 0.1 0.15 rg',
    `0 -36 Td ${pdfLiteral(`Date : ${dateLabel}`)} Tj`,
    `0 -20 Td ${pdfLiteral(`Total : ${xp} XP   ·   Médailles : ${earned}/${total}`)} Tj`,
    score ? `0 -20 Td ${pdfLiteral(`Grand Quiz : ${score}`)} Tj` : '',
    '/F1 11 Tf 0.2 0.2 0.25 rg',
    `0 -32 Td ${pdfLiteral("L'Assemblée nationale — le parcours de Malik & son Papa")} Tj`,
    `0 -16 Td ${pdfLiteral('Projet pédagogique indépendant, non affilié à l’Assemblée nationale.')} Tj`,
    'ET'
  ];

  return lines.filter(Boolean).join('\n');
}

function xrefTable(offsets: number[]): string {
  let out = `xref\n0 ${offsets.length}\n`;
  offsets.forEach((off, i) => {
    if (i === 0) {
      out += '0000000000 65535 f \n';
    } else {
      out += `${String(off).padStart(10, '0')} 00000 n \n`;
    }
  });
  return out;
}

export function buildDiplomaPdf(input: DiplomaPdfInput): { bytes: Uint8Array; filename: string } {
  const stream = buildContentStream(input);

  const objects = [
    '',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >> endobj\n',
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj\n`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >> endobj\n',
    '6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >> endobj\n'
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 1; i < objects.length; i++) {
    offsets[i] = pdf.length;
    pdf += objects[i];
  }
  const xrefStart = pdf.length;
  pdf += xrefTable(offsets);
  pdf += `trailer << /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) {
    bytes[i] = pdf.charCodeAt(i) & 0xff;
  }

  return { bytes, filename: diplomaFilename(input.studentName) };
}

export function downloadDiplomaPdf(input: DiplomaPdfInput): void {
  const { bytes, filename } = buildDiplomaPdf(input);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
