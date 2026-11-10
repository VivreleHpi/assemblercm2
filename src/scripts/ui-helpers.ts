export function formatProgressLabel(doneCount: number): string {
  const safe = Number.isFinite(doneCount) ? Math.max(0, Math.min(12, Math.floor(doneCount))) : 0;
  return `Parcours : ${safe} / 12`;
}

export function diplomaFilename(name: string): string {
  const slug = (name || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `diplome-depute-junior-${slug || 'eleve'}.pdf`;
}
