/** Libellé court du CTA accueil une fois les 12 étapes terminées (accord féminin/masculin). */
export function homeDiplomaCtaLabel(isDeputee: boolean): string {
  return isDeputee ? 'Voir mon diplôme de Députée' : 'Voir mon diplôme de Député';
}

export function formatProgressLabel(doneCount: number): string {
  const safe = Number.isFinite(doneCount) ? Math.max(0, Math.min(12, Math.floor(doneCount))) : 0;
  return `Parcours : ${safe} / 12`;
}

export const BADGE_SHORT_LABELS: Record<string, string> = {
  hemi: 'Hémicycle',
  galerie: 'Palais',
  secrets: 'Coulisses',
  justice: 'Justice',
  histoire: 'Histoire',
  enfants: 'Enfants',
  pouvoirs: 'Sénat',
  mindmap: 'Carte',
  quiz: 'Quiz'
};

export function medalShortLabels(badgeIds: string[] | undefined): string[] {
  if (!Array.isArray(badgeIds)) return [];
  return badgeIds
    .map((id) => BADGE_SHORT_LABELS[id])
    .filter((label): label is string => Boolean(label));
}

export function formatDiplomaQuizScore(score: number | string | undefined): string {
  if (typeof score === 'number' && Number.isFinite(score)) {
    return `${score} / 8`;
  }
  const text = String(score || '').trim();
  if (!text) return '';
  return text.replace(/\s*au Grand Quiz\s*$/i, '').trim();
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
