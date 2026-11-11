import html2canvas from 'html2canvas-pro';
import { diplomaFilename } from './ui-helpers.ts';

export interface DiplomaPdfInput {
  studentName: string;
  pageJpeg: Uint8Array;
}

const PAGE_W = 842;
const PAGE_H = 595;

/** Largeur CSS du diplôme pour capture (A4 paysage @ 96 dpi ≈ 11,69 in). */
export const DIPLOMA_CAPTURE_WIDTH_PX = 1122;

const CAPTURE_MOUNT_ID = 'diploma-pdf-capture-mount';
const CAPTURE_CARD_ID = 'diploma-pdf-capture-card';

function latin1(text: string): Uint8Array {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    out[i] = text.charCodeAt(i) & 0xff;
  }
  return out;
}

function concat(parts: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const part of parts) total += part.length;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function readJpegSize(bytes: Uint8Array): { width: number; height: number } {
  let i = 2;
  while (i + 8 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = bytes[i + 1];
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = (bytes[i + 2] << 8) | bytes[i + 3];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return {
        height: (bytes[i + 5] << 8) | bytes[i + 6],
        width: (bytes[i + 7] << 8) | bytes[i + 8]
      };
    }
    i += 2 + len;
  }
  return { width: PAGE_W, height: PAGE_H };
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
  const jpeg = input.pageJpeg;
  const { width, height } = readJpegSize(jpeg);
  const margin = 10;
  const scale = Math.min((PAGE_W - margin * 2) / width, (PAGE_H - margin * 2) / height);
  const drawW = width * scale;
  const drawH = height * scale;
  const x = (PAGE_W - drawW) / 2;
  const y = (PAGE_H - drawH) / 2;
  const content = [
    '0.98 0.97 0.94 rg 0 0 842 595 re f',
    'q',
    `${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm`,
    '/Im1 Do',
    'Q',
    ''
  ].join('\n');

  const parts: Uint8Array[] = [];
  const offsets = [0];
  const pushObj = (bytes: Uint8Array) => {
    offsets.push(parts.reduce((n, p) => n + p.length, 0));
    parts.push(bytes);
  };

  parts.push(latin1('%PDF-1.4\n'));
  pushObj(latin1('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n'));
  pushObj(latin1('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n'));
  pushObj(
    latin1(
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >> endobj\n'
    )
  );
  pushObj(latin1(`4 0 obj << /Length ${content.length} >> stream\n${content}endstream endobj\n`));
  pushObj(
    concat([
      latin1(
        `5 0 obj << /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >> stream\n`
      ),
      jpeg,
      latin1('\nendstream endobj\n')
    ])
  );

  const body = concat(parts);
  const xrefStart = body.length;
  const xref = xrefTable(offsets);
  const trailer = `trailer << /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  const bytes = concat([body, latin1(xref), latin1(trailer)]);

  return { bytes, filename: diplomaFilename(input.studentName) };
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('JPEG du diplôme indisponible'));
          return;
        }
        blob
          .arrayBuffer()
          .then((buffer) => resolve(new Uint8Array(buffer)))
          .catch(reject);
      },
      'image/jpeg',
      quality
    );
  });
}

async function responseToDataUrl(res: Response): Promise<string> {
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function fetchAsDataUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (res.ok) return responseToDataUrl(res);
  } catch {
    // hors-ligne : on tente le cache du service worker
  }
  if ('caches' in window) {
    const cached = await caches.match(url);
    if (cached) return responseToDataUrl(cached);
  }
  throw new Error(`Avatar indisponible : ${url}`);
}

async function loadAvatarDataUrl(url: string): Promise<string | null> {
  const absolute = new URL(url, document.baseURI).href;
  const candidates = [absolute];
  if (absolute.endsWith('.webp')) candidates.push(absolute.replace(/\.webp(\?.*)?$/, '.png$1'));
  if (absolute.endsWith('.png')) candidates.push(absolute.replace(/\.png(\?.*)?$/, '.webp$1'));
  for (const candidate of candidates) {
    try {
      return await fetchAsDataUrl(candidate);
    } catch {
      // essai suivant (png/webp / cache)
    }
  }
  return null;
}

async function rasterizeVisibleAvatars(card: HTMLElement): Promise<Array<{ canvas: HTMLCanvasElement; html: string }>> {
  const pictures = Array.from(card.querySelectorAll('picture')).filter((pic) => {
    const wrap = pic.closest('[id^="diploma-avatar-"]');
    return !wrap || !wrap.classList.contains('hidden');
  });

  const swaps: Array<{ canvas: HTMLCanvasElement; html: string }> = [];

  for (const pic of pictures) {
    try {
      const img = pic.querySelector('img');
      if (!img) continue;
      const url = img.currentSrc || img.src;
      if (!url) continue;
      const dataUrl = url.startsWith('data:') ? url : await loadAvatarDataUrl(url);
      if (!dataUrl) continue;
      const bitmap = new Image();
      bitmap.src = dataUrl;
      await bitmap.decode();
      const rect = pic.getBoundingClientRect();
      const size = Math.max(Math.round(rect.width) || 68, 68);
      const canvas = document.createElement('canvas');
      canvas.width = size * 2;
      canvas.height = size * 2;
      canvas.className = pic.className;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      canvas.setAttribute('aria-hidden', 'true');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const html = pic.outerHTML;
      pic.replaceWith(canvas);
      swaps.push({ canvas, html });
    } catch {
      // PDF sans cet avatar plutôt qu'un échec global
    }
  }

  return swaps;
}

function restoreAvatarSwaps(swaps: Array<{ canvas: HTMLCanvasElement; html: string }>): void {
  swaps.forEach(({ canvas, html }) => {
    const holder = document.createElement('div');
    holder.innerHTML = html;
    const restored = holder.firstElementChild;
    if (restored) canvas.replaceWith(restored);
  });
}

function createOffScreenCaptureCard(source: HTMLElement): { card: HTMLElement; mount: HTMLElement } {
  document.getElementById(CAPTURE_MOUNT_ID)?.remove();

  const mount = document.createElement('div');
  mount.id = CAPTURE_MOUNT_ID;
  mount.setAttribute('aria-hidden', 'true');
  mount.style.cssText = `position:fixed;left:-12000px;top:0;z-index:-1;width:${DIPLOMA_CAPTURE_WIDTH_PX}px;overflow:visible;pointer-events:none;`;

  const card = source.cloneNode(true) as HTMLElement;
  card.id = CAPTURE_CARD_ID;
  card.classList.add('pdf-capture');
  card.classList.remove('pointer-events-none', 'opacity-50');
  card.style.opacity = '1';
  card.style.width = `${DIPLOMA_CAPTURE_WIDTH_PX}px`;
  card.style.maxWidth = `${DIPLOMA_CAPTURE_WIDTH_PX}px`;
  card.style.boxSizing = 'border-box';

  card.querySelectorAll<HTMLElement>('.no-print').forEach((el) => {
    el.style.display = 'none';
  });

  mount.appendChild(card);
  document.body.appendChild(mount);
  return { card, mount };
}

export async function captureDiplomaCardJpeg(): Promise<Uint8Array> {
  const source = document.getElementById('diploma-printable-card') as HTMLElement | null;
  if (!source) {
    throw new Error('Carte diplôme introuvable');
  }

  const { card, mount } = createOffScreenCaptureCard(source);
  let swaps: Array<{ canvas: HTMLCanvasElement; html: string }> = [];

  try {
    await Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((resolve) => window.setTimeout(resolve, 2000))
    ]);

    swaps = await rasterizeVisibleAvatars(card);

    const captureScale = 2;
    const canvas = await html2canvas(card, {
      scale: captureScale,
      backgroundColor: '#FFFFFF',
      logging: false,
      width: DIPLOMA_CAPTURE_WIDTH_PX,
      windowWidth: DIPLOMA_CAPTURE_WIDTH_PX,
      windowHeight: 900,
      onclone(clonedDoc) {
        clonedDoc.getElementById(CAPTURE_CARD_ID)?.classList.add('pdf-capture');
        const fallback = clonedDoc.querySelector(`#${CAPTURE_CARD_ID}`) as HTMLElement | null;
        if (fallback) {
          fallback.style.width = `${DIPLOMA_CAPTURE_WIDTH_PX}px`;
          fallback.style.maxWidth = `${DIPLOMA_CAPTURE_WIDTH_PX}px`;
        }
      }
    });
    const ctx = canvas.getContext('2d');
    if (ctx && swaps.length > 0) {
      const cardRect = card.getBoundingClientRect();
      const scaleX = canvas.width / cardRect.width;
      const scaleY = canvas.height / cardRect.height;
      swaps.forEach(({ canvas: avatar }) => {
        const r = avatar.getBoundingClientRect();
        ctx.drawImage(
          avatar,
          (r.left - cardRect.left) * scaleX,
          (r.top - cardRect.top) * scaleY,
          r.width * scaleX,
          r.height * scaleY
        );
      });
    }
    return canvasToJpeg(canvas, 0.92);
  } finally {
    restoreAvatarSwaps(swaps);
    mount.remove();
  }
}

function isAppleMobile(): boolean {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function notifyPdfToast(title: string, message: string): void {
  const app = (window as unknown as { ANApp?: { showToast?: (title: string, desc: string) => void } }).ANApp;
  if (app?.showToast) {
    app.showToast(title, message);
    return;
  }
  const toast = document.getElementById('xp-toast');
  const titleEl = document.getElementById('xp-toast-title');
  const descEl = document.getElementById('xp-toast-desc');
  if (!toast || !titleEl || !descEl) return;
  titleEl.textContent = title;
  descEl.textContent = message;
  toast.classList.remove('hidden');
}

function notifyPdfFailure(message: string): void {
  notifyPdfToast('Diplôme PDF', message);
}

function notifyPdfIosHint(): void {
  notifyPdfToast(
    'Diplôme ouvert',
    'Sur iPhone/iPad : touche Partager ↑ puis « Enregistrer dans Fichiers » (ou « Sur mon iPhone ») pour garder le PDF.'
  );
}

export async function triggerPdfDownload(
  bytes: Uint8Array,
  filename: string,
  studentName?: string
): Promise<void> {
  // 1. Sur smartphone/tablette : tentative avec Web Share API (iOS Safari 15+, Android Chrome, Edge Mobile)
  // Ouvre directement la feuille de partage native avec le fichier PDF
  // (AirDrop, Enregistrer dans Fichiers, Imprimer, WhatsApp, etc.) SANS blocage de pop-up !
  if (isMobileDevice() && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const file = new File([bytes], filename, { type: 'application/pdf' });
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Diplôme de Député Junior CM2',
          text: `Diplôme officiel de ${studentName || 'l’élève'} — Assemblée nationale CM2`
        });
        notifyPdfToast('Diplôme prêt', 'Tu peux enregistrer ton diplôme dans Fichiers ou l’imprimer.');
        return;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // L'utilisateur a fermé la boîte de partage native : action volontaire
        return;
      }
    }
  }

  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  if (isAppleMobile()) {
    const opened = window.open(url, '_blank');
    if (!opened) {
      // Repli si Safari bloque window.open après le délai async : ouverture via lien
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    notifyPdfIosHint();
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
    return;
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function downloadDiplomaPdf(studentName: string): Promise<void> {
  try {
    const pageJpeg = await captureDiplomaCardJpeg();
    const { bytes, filename } = buildDiplomaPdf({ studentName, pageJpeg });
    await triggerPdfDownload(bytes, filename, studentName);
  } catch (err) {
    if (err instanceof Error && err.message === 'diploma-pdf-popup-blocked') {
      throw err;
    }
    notifyPdfFailure('Le PDF n’a pas pu être préparé. Réessaie, ou utilise « Imprimer (A4) ».');
    throw new Error('diploma-pdf-failed');
  }
}
