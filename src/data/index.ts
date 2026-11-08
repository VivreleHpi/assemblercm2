import etapesRaw from '../content/etapes/etapes.json';
import photosRaw from '../content/photos/photos.json';
import glossaireRaw from '../content/glossaire/termes.json';
import badgesRaw from '../content/badges/badges.json';

export interface QuizQuestionItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface EtapeItem {
  number: number;
  order: number;
  slug: string;
  partNumber: number;
  partTitle: string;
  partColor: 'republic' | 'velvet' | 'gold';
  title: string;
  shortTitle: string;
  subtitle: string;
  duration: string;
  durationMinutes: number;
  readingMinutes: number;
  activityMinutes: number;
  xp: number;
  badgeId: string | null;
  heroPhoto: string;
  discoverText: string[];
  interactiveType: string;
  malikSecret: {
    character: 'malik' | 'papa' | 'duo';
    title: string;
    text: string;
  };
  keyPoints: string[];
  quiz: QuizQuestionItem[];
  teacherObjective: string;
}

export interface PhotoItem {
  id: string;
  title: string;
  shortTitle: string;
  baseName: string;
  src: string;
  fileName: string;
  alt: string;
  caption: string;
  author: string;
  license: string;
  sourceUrl: string;
  width: number;
  height: number;
  objectPosition: string;
}

export interface GlossaireItem {
  id: string;
  term: string;
  category: string;
  simpleDef: string;
  preciseDef: string;
  definition: string;
  example: string;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  step: number;
  icon: string;
}

export const PHOTOS: PhotoItem[] = photosRaw.map((p) => ({
  ...p,
  src: `/img/${p.baseName}.jpg`,
  fileName: `${p.baseName}.jpg`,
  objectPosition: p.objectPosition === 'top' ? 'top center' : 'center center'
}));

export const GALLERY_PHOTOS: PhotoItem[] = PHOTOS.slice(0, 8);

export const GLOSSAIRE: GlossaireItem[] = glossaireRaw.map((g) => ({
  id: g.id,
  term: g.term,
  category: g.category,
  simpleDef: (g as { simpleDef?: string }).simpleDef || g.shortDef,
  preciseDef: g.shortDef,
  definition: g.shortDef,
  example: `Retrouve ce mot dans le parcours d’EMC sur l’Assemblée nationale (catégorie : ${g.category}).`
}));

export const BADGES: BadgeItem[] = badgesRaw.map((b) => ({
  id: b.id,
  title: b.title,
  description: b.desc,
  step: b.stepOrder,
  icon: b.icon
}));

export const ETAPES: EtapeItem[] = etapesRaw.map((e) => ({
  number: e.order,
  order: e.order,
  slug: e.slug,
  partNumber: e.part === 'palais' ? 1 : e.part === 'institutions' ? 2 : 3,
  partTitle:
    e.part === 'palais'
      ? 'Le Palais Bourbon'
      : e.part === 'institutions'
      ? 'Les Institutions & l’Histoire'
      : 'S’entraîner & Diplôme',
  partColor: e.part === 'palais' ? 'republic' : e.part === 'institutions' ? 'velvet' : 'gold',
  title: e.title,
  shortTitle: e.shortTitle,
  subtitle: e.subtitle,
  duration: e.duration,
  durationMinutes: (e as { durationMinutes?: number }).durationMinutes ?? ( parseInt(e.duration, 10) || 5 ),
  readingMinutes: (e as { readingMinutes?: number }).readingMinutes ?? 2,
  activityMinutes: (e as { activityMinutes?: number }).activityMinutes ?? 3,
  xp: e.xpReward,
  badgeId: e.badgeId,
  heroPhoto: e.heroPhotoId,
  discoverText: [e.discover.lead, ...e.discover.paragraphs],
  interactiveType: e.interactiveWidget,
  malikSecret: {
    character: e.malikBubble.speaker.toLowerCase().includes('papa') ? 'papa' : 'malik',
    title: e.malikBubble.title,
    text: e.malikBubble.text
  },
  keyPoints: e.keyPoints,
  quiz: e.microQuiz.map((q) => ({
    question: q.q,
    options: q.options,
    correctIndex: q.correct,
    explanation: q.exp
  })),
  teacherObjective: e.teacherObjective
}));

export function getPhotoById(id: string): PhotoItem {
  return PHOTOS.find((p) => p.id === id) || PHOTOS[0];
}

export function getGlossaryById(id: string): GlossaireItem | undefined {
  return GLOSSAIRE.find((g) => g.id === id);
}

export function getSourceLinkLabel(url: string): string {
  if (!url) return 'Consulter la source officielle';
  if (url.includes('commons.wikimedia.org') || url.includes('wikipedia.org')) {
    return 'Voir la fiche Wikimedia Commons';
  }
  if (url.includes('legifrance.gouv.fr')) {
    return 'Consulter le texte sur Légifrance';
  }
  if (url.includes('parlementdesenfants.fr')) {
    return 'Site officiel Parlement des enfants';
  }
  if (url.includes('conseil-constitutionnel.fr')) {
    return 'Voir sur conseil-constitutionnel.fr';
  }
  if (url.includes('assemblee-nationale.fr')) {
    return 'Voir sur assemblee-nationale.fr';
  }
  return 'Consulter la source officielle';
}

const sumStepsMinutes = (steps: EtapeItem[]) =>
  steps.reduce((acc, s) => acc + s.durationMinutes, 0);
const sumReadingMinutes = (steps: EtapeItem[]) =>
  steps.reduce((acc, s) => acc + s.readingMinutes, 0);
const sumActivityMinutes = (steps: EtapeItem[]) =>
  steps.reduce((acc, s) => acc + s.activityMinutes, 0);

const part1Steps = ETAPES.filter((e) => e.partNumber === 1);
const part2Steps = ETAPES.filter((e) => e.partNumber === 2);
const part3Steps = ETAPES.filter((e) => e.partNumber === 3);

export const PARCOURS_STATS = {
  totalSteps: ETAPES.length,
  totalMinutes: sumStepsMinutes(ETAPES),
  totalReadingMinutes: sumReadingMinutes(ETAPES),
  totalActivityMinutes: sumActivityMinutes(ETAPES),
  part1Minutes: sumStepsMinutes(part1Steps),
  part1ReadingMinutes: sumReadingMinutes(part1Steps),
  part1ActivityMinutes: sumActivityMinutes(part1Steps),
  part2Minutes: sumStepsMinutes(part2Steps),
  part2ReadingMinutes: sumReadingMinutes(part2Steps),
  part2ActivityMinutes: sumActivityMinutes(part2Steps),
  part3Minutes: sumStepsMinutes(part3Steps),
  part3ReadingMinutes: sumReadingMinutes(part3Steps),
  part3ActivityMinutes: sumActivityMinutes(part3Steps),
  sessions: [
    {
      number: 1,
      title: 'Séance 1 · Le Palais Bourbon & l’Hémicycle',
      stepsLabel: 'Étapes 1 à 3',
      stepNumbers: [1, 2, 3],
      durationMinutes: sumStepsMinutes(ETAPES.filter((e) => [1, 2, 3].includes(e.number))),
      readingMinutes: sumReadingMinutes(ETAPES.filter((e) => [1, 2, 3].includes(e.number))),
      activityMinutes: sumActivityMinutes(ETAPES.filter((e) => [1, 2, 3].includes(e.number))),
      summary: '577 députés, Perchoir, Tribune, architecture néoclassique et traditions républicaines.'
    },
    {
      number: 2,
      title: 'Séance 2 · La Loi, la Justice & l’Histoire (1789–2026)',
      stepsLabel: 'Étapes 4 et 5',
      stepNumbers: [4, 5],
      durationMinutes: sumStepsMinutes(ETAPES.filter((e) => [4, 5].includes(e.number))),
      readingMinutes: sumReadingMinutes(ETAPES.filter((e) => [4, 5].includes(e.number))),
      activityMinutes: sumActivityMinutes(ETAPES.filter((e) => [4, 5].includes(e.number))),
      summary: 'Pyramide de Kelsen, ordres de juridiction, Conseil constitutionnel et Grande Frise illustrée.'
    },
    {
      number: 3,
      title: 'Séance 3 · Citoyenneté, Navette & Vidéos',
      stepsLabel: 'Étapes 6 à 8',
      stepNumbers: [6, 7, 8],
      durationMinutes: sumStepsMinutes(ETAPES.filter((e) => [6, 7, 8].includes(e.number))),
      readingMinutes: sumReadingMinutes(ETAPES.filter((e) => [6, 7, 8].includes(e.number))),
      activityMinutes: sumActivityMinutes(ETAPES.filter((e) => [6, 7, 8].includes(e.number))),
      summary: 'Parlement des enfants (atelier prise de parole), Sénat, navette parlementaire et capsules vidéo.'
    },
    {
      number: 4,
      title: 'Séance 4 · Révision, Mini-Jeux, Grand Quiz & Diplôme',
      stepsLabel: 'Étapes 9 à 12',
      stepNumbers: [9, 10, 11, 12],
      durationMinutes: sumStepsMinutes(ETAPES.filter((e) => [9, 10, 11, 12].includes(e.number))),
      readingMinutes: sumReadingMinutes(ETAPES.filter((e) => [9, 10, 11, 12].includes(e.number))),
      activityMinutes: sumActivityMinutes(ETAPES.filter((e) => [9, 10, 11, 12].includes(e.number))),
      summary: 'Carte mentale Cache-Cache, simulation de vote de loi, Grand Quiz final (6/8) et sources.'
    }
  ],
  expressPath: {
    title: 'Parcours Express « L’Essentiel en 15 minutes » (sélection d’extraits au TBI)',
    subtitle:
      'Sélection ciblée de 4 activités clés pour une projection collective rapide en classe (sans la lecture intégrale ni les mini-quiz individuels des 4 fiches, qui représentent 23 minutes au complet).',
    durationMinutes: 15,
    fullStepsDurationMinutes: 23,
    steps: [
      { number: 1, slug: '1-hemicycle', title: 'Extrait Étape 1 : Carte de l’Hémicycle & vote des 577 députés', minutes: 5 },
      { number: 4, slug: '4-constitution-justice', title: 'Extrait Étape 4 : Schéma de la Pyramide des lois (Constitution)', minutes: 4 },
      { number: 7, slug: '7-contre-pouvoir-senat', title: 'Extrait Étape 7 : Animation de la Navette avec le Sénat', minutes: 3 },
      { number: 11, slug: '11-quiz-diplome', title: 'Extrait Étape 11 : Grand Quiz collectif & Diplôme de la classe', minutes: 3 }
    ]
  }
};

export const HOTSPOTS_DATA = [
  {
    id: 1,
    x: 50,
    y: 36,
    badge: 'Point Clé n°1 • Au sommet à 3 mètres',
    title: 'Le Perchoir (Présidence de séance)',
    description:
      "Perché à 3 mètres au-dessus du sol, c'est le fauteuil où siège le ou la Président(e) de l'Assemblée nationale. Il ou elle dirige les débats, donne la parole et agite sa cloche en bronze pour réclamer le silence."
  },
  {
    id: 2,
    x: 50,
    y: 50,
    badge: 'Point Clé n°2 • Juste sous le Perchoir',
    title: "La Tribune de l'Orateur",
    description:
      "C'est ici que montent les députés et les ministres pour présenter ou défendre un texte de loi. Sur sa façade en marbre blanc, deux statues sculptées par François-Frédéric Lemot représentent l'Histoire et la Renommée."
  },
  {
    id: 3,
    x: 31,
    y: 65,
    badge: 'Point Clé n°3 • Les 2 premiers rangs du bas',
    title: 'Les Bancs du Gouvernement',
    description:
      "Le Premier ministre et les ministres s'assoient aux deux premiers rangs tout en bas, face à la Tribune. Règle constitutionnelle absolue : comme ils appartiennent au pouvoir exécutif, les ministres n'ont jamais le droit de voter !"
  },
  {
    id: 4,
    x: 69,
    y: 74,
    badge: 'Point Clé n°4 • Les gradins en demi-cercle',
    title: 'Les 577 Fauteuils des Députés',
    description:
      "Les 577 députés élus pour 5 ans au suffrage universel direct sont répartis par groupe politique, de la gauche vers la droite. Chaque pupitre possède une clé personnelle, un micro et un boîtier de vote à 3 boutons."
  },
  {
    id: 5,
    x: 48,
    y: 16,
    badge: 'Point Clé n°5 • Le grand décor du fond',
    title: "La Tapisserie de L'École d'Athènes",
    description:
      "Derrière le Perchoir s'élève une grande tapisserie tissée par la Manufacture des Gobelins d'après le chef-d'œuvre de Raphaël : L'École d'Athènes, rappelant la naissance de la démocratie dans l'Antiquité grecque."
  },
  {
    id: 6,
    x: 83,
    y: 18,
    badge: 'Point Clé n°6 • Les galeries en hauteur',
    title: 'Les Tribunes du Public & des Journalistes',
    description:
      "Tout autour de l'Hémicycle, des galeries accueillent gratuitement les citoyens, les classes d'élèves et les journalistes. En République, les débats parlementaires sont publics et transparents !"
  }
];

export const SECRETS_DATA = [
  {
    id: 1,
    title: 'Les 577 circonscriptions',
    frontQuestion: 'Pourquoi la France compte-t-elle 577 députés et comment calcule-t-on une majorité ?',
    backTitle: '577 circonscriptions législatives à travers toute la République !',
    backText:
      "Chaque député représente l'une des 577 circonscriptions législatives (Hexagone, Corse, Outre-mer et Français établis hors de France), un plafond fixé par l'article 24 de la Constitution. Une loi ordinaire est adoptée à la majorité des suffrages exprimés (plus de POUR que de CONTRE), tandis qu'une motion de censure exige la majorité absolue des 577 députés (289 voix)."
  },
  {
    id: 2,
    title: 'Le tambour de la Garde',
    frontQuestion: 'Pourquoi des soldats battent-ils le tambour quand le Président de l’Assemblée arrive ?',
    backTitle: "La haie d'honneur de la Garde républicaine !",
    backText:
      "Au début de chaque séance, le Président de l'Assemblée traverse la Salle des Pas Perdus entre deux rangées de soldats de la Garde républicaine au son du tambour : la force armée salue le pouvoir civil élu."
  },
  {
    id: 3,
    title: 'La Salle des Pas Perdus',
    frontQuestion: 'Pourquoi le grand salon s’appelle-t-il la « Salle des Pas Perdus » ?',
    backTitle: 'Parce qu’on y marche de long en large en discutant !',
    backText:
      "Située juste devant l'entrée de l'Hémicycle, cette immense galerie peinte par Horace Vernet est le lieu où les députés et les journalistes font les cent pas en négociant avant d'entrer en séance."
  },
  {
    id: 4,
    title: 'La chaîne en argent',
    frontQuestion: 'Qui porte un costume noir queue-de-pie et une chaîne en argent autour du cou ?',
    backTitle: 'Les Huissiers de séance de l’Assemblée !',
    backText:
      "Présents depuis 1789, les huissiers portent un habit noir et une chaîne d'argent. Sans arme, ils veillent au calme dans l'Hémicycle, apportent les amendements à la Tribune et font passer les urnes."
  },
  {
    id: 5,
    title: 'Le trésor de la Bibliothèque',
    frontQuestion: 'Quels trésors extraordinaires sont gardés dans la Bibliothèque du Palais ?',
    backTitle: 'Jeanne d’Arc, Rousseau et les plafonds de Delacroix !',
    backText:
      "Sous les 5 coupoles peintes par Eugène Delacroix, la Bibliothèque conserve 700 000 livres ainsi que le manuscrit original du procès de Jeanne d'Arc (1431) et le Serment du Jeu de Paume (1789)."
  },
  {
    id: 6,
    title: 'Le Président hors de l’Hémicycle',
    frontQuestion: 'Le Président de la République a-t-il le droit d’entrer dans l’Hémicycle ?',
    backTitle: 'Non, jamais ! C’est la Séparation des Pouvoirs.',
    backText:
      "Depuis 1875, le Président de la République n'a pas le droit de pénétrer dans l'Hémicycle du Palais Bourbon. S'il souhaite parler aux parlementaires, députés et sénateurs se réunissent en Congrès au Château de Versailles !"
  }
];

export const PYRAMID_LEVELS = [
  {
    level: 1,
    subtitle: 'Sommet suprême • 4 octobre 1958',
    title: 'La Constitution de la Ve République',
    description:
      "Adoptée en 1958 (et incluant la Déclaration des Droits de 1789), la Constitution organise les pouvoirs de l'État et garantit nos libertés. Lorsqu'il est saisi, le Conseil constitutionnel censure toute loi contraire.",
    example: 'Exemple : Le droit de vote, la liberté d’expression et l’égalité devant la loi.'
  },
  {
    level: 2,
    subtitle: 'Engagements de la France • Niveau 2',
    title: 'Les Traités Internationaux & Européens',
    description:
      "Quand la France signe et ratifie un traité international ou européen, ses lois doivent respecter cet engagement.",
    example: "Exemple : La Convention internationale des droits de l'enfant (1989)."
  },
  {
    level: 3,
    subtitle: 'Pouvoir législatif • Niveau 3',
    title: 'Les Lois votées par le Parlement',
    description:
      "Discutées et votées par les 577 députés (Assemblée nationale) et les 348 sénateurs (Sénat), elles fixent les règles communes à tous les citoyens.",
    example: "Exemple : Le Code civil, le Code pénal, le Code de l'éducation et le budget de l'État."
  },
  {
    level: 4,
    subtitle: 'Pouvoir exécutif & mairies • Niveau 4',
    title: 'Les Règlements (Décrets & Arrêtés)',
    description:
      "Signés par le Président, le Premier ministre, les préfets ou les maires, ils servent à appliquer concrètement les lois au quotidien sans jamais les contredire.",
    example: 'Exemple : Un arrêté du maire qui limite la vitesse à 30 km/h devant ton école.'
  }
];

export const TRIBUNALS_DATA = [
  {
    name: 'Le Tribunal de proximité',
    branch: 'judiciaire',
    level: '1re instance civile',
    role: 'Règle les petits conflits civils du quotidien entre particuliers jusqu’à 10 000 €.',
    example: 'Clôture abîmée par un voisin, colis non livré, caution.'
  },
  {
    name: 'Le Tribunal judiciaire & correctionnel',
    branch: 'judiciaire',
    level: '1re instance civile & pénale',
    role: 'Juge les affaires civiles importantes (> 10 000 €), la famille et, au pénal, les délits.',
    example: 'Vol, escroquerie, dégradations ou grand litige familial.'
  },
  {
    name: 'Le Tribunal pour enfants',
    branch: 'judiciaire',
    level: 'Mineurs (< 18 ans)',
    role: 'Protège les jeunes en danger et juge les mineurs avec une priorité éducative.',
    example: 'Mesures de protection et d’accompagnement éducatif.'
  },
  {
    name: "La Cour d'assises",
    branch: 'judiciaire',
    level: 'Crimes graves',
    role: 'Juge les crimes les plus graves avec 3 magistrats professionnels et 6 citoyens jurés tirés au sort (9 en appel).',
    example: 'Braquage à main armée, crime grave.'
  },
  {
    name: "La Cour d'appel",
    branch: 'judiciaire',
    level: '2e degré (Recours)',
    role: "Rejuge entièrement une affaire si l'une des personnes conteste le premier jugement.",
    example: 'Réexamen complet des faits et du droit.'
  },
  {
    name: 'La Cour de cassation',
    branch: 'judiciaire',
    level: 'Sommet judiciaire',
    role: 'Ne rejuge pas les faits : vérifie que tous les tribunaux judiciaires ont appliqué la loi sans erreur.',
    example: 'Unique cour située à Paris (Île de la Cité).'
  },
  {
    name: 'Le Tribunal administratif',
    branch: 'administratif',
    level: '1re instance publique',
    role: 'Juge les conflits entre un citoyen et une administration (mairie, préfecture, ministère).',
    example: 'Refus injustifié d’inscription scolaire ou de permis par une mairie.'
  },
  {
    name: "La Cour administrative d'appel",
    branch: 'administratif',
    level: '2e degré public',
    role: 'Réexamine les jugements rendus par les tribunaux administratifs en cas de recours.',
    example: 'Appel d’un litige entre un citoyen et l’État.'
  },
  {
    name: "Le Conseil d'État",
    branch: 'administratif',
    level: 'Sommet administratif',
    role: "Juge suprême de l'ordre administratif et conseiller juridique du Gouvernement sur ses projets de loi.",
    example: 'Siège au Palais-Royal à Paris.'
  },
  {
    name: 'Le Conseil constitutionnel (Les 9 Sages)',
    branch: 'constitutionnel',
    level: 'Gardien de la Constitution',
    role: "Lorsqu'il est saisi, vérifie que les lois votées par le Parlement respectent la Constitution de 1958.",
    example: 'Peut être saisi par 60 députés, 60 sénateurs ou via une QPC.'
  }
];

export const JUSTICE_CASES = [
  {
    id: 1,
    scenario:
      'Ton voisin refuse de réparer sa clôture tombée dans ton jardin (dégâts estimés à 400 €). Vers quel tribunal te tournes-tu ?',
    options: ['Le Tribunal de proximité', "La Cour d'assises", "Le Conseil d'État"],
    correctOption: 0,
    explanation:
      "C'est un litige civil entre particuliers de moins de 10 000 €, jugé par le Tribunal de proximité."
  },
  {
    id: 2,
    scenario:
      "Une mairie refuse d'inscrire un enfant à l'école publique sans raison valable. Quel tribunal peut annuler cette décision ?",
    options: ['Le Tribunal correctionnel', 'Le Tribunal administratif', 'La Cour de cassation'],
    correctOption: 1,
    explanation:
      "Lorsqu'un citoyen conteste la décision d'une autorité publique (mairie, préfecture), il saisit le Tribunal administratif."
  },
  {
    id: 3,
    scenario:
      'Un braquage à main armée a été commis dans une banque. Devant quelle juridiction ce crime grave sera-t-il jugé ?',
    options: ['Le Tribunal de proximité', 'Le Tribunal administratif', "La Cour d'assises"],
    correctOption: 2,
    explanation:
      "C'est un crime puni par le Code pénal, jugé par la Cour d'assises avec 3 magistrats et 6 citoyens jurés tirés au sort."
  },
  {
    id: 4,
    scenario:
      "Après un jugement en Cour d'appel, un avocat estime que les juges ont mal appliqué un article du Code civil. Qui vérifie ?",
    options: ['La Cour de cassation', 'Le Tribunal de proximité', 'Le Tribunal pour enfants'],
    correctOption: 0,
    explanation:
      'La Cour de cassation vérifie que la loi a été correctement appliquée par tous les tribunaux judiciaires.'
  },
  {
    id: 5,
    scenario:
      'Une loi vient d’être votée, mais 60 députés alertent qu’elle contredit la Constitution de 1958. Qui tranche ?',
    options: ['Le Tribunal judiciaire', 'Le Conseil constitutionnel (Les 9 Sages)', "La Cour d'appel"],
    correctOption: 1,
    explanation:
      'Ce sont les 9 Sages du Conseil constitutionnel qui vérifient que les lois respectent la Constitution.'
  }
];

export interface TimelineEventItem {
  id: string;
  year: string;
  buttonLabel: string;
  dateLabel: string;
  title: string;
  shortDescription: string;
  description: string;
  whyImportantToday: string;
  keyFigureOrDoc: string;
  quickQuestion: string;
  quickOptions: string[];
  quickCorrect: number;
  quickExplanation: string;
  photoId: string;
  baseName: string;
  imageAlt: string;
  author: string;
  institution: string;
  license: string;
  artworkUrl: string;
  officialSourceUrl: string;
  officialSourceLabel: string;
  objectPosition: string;
  width: number;
  height: number;
}

export const TIMELINE_EVENTS: TimelineEventItem[] = [
  {
    id: 'tl-1789',
    year: '1789',
    buttonLabel: '1789',
    dateLabel: '17 juin, 20 juin & 26 août 1789',
    title: "Naissance de l'Assemblée nationale, Serment du Jeu de paume & Déclaration des droits",
    shortDescription:
      'Le 20 juin 1789 à Versailles, les députés réunis dans la salle du Jeu de paume jurent de rédiger une Constitution pour la France.',
    description:
      "Le 17 juin 1789, les députés du Tiers-État se constituent en Assemblée nationale. Trois jours plus tard, le 20 juin 1789, trouvant leur salle fermée, ils prêtent le Serment du Jeu de paume et jurent de ne pas se séparer avant d'avoir donné une Constitution à la France. Le 26 août 1789, ils adoptent la Déclaration des droits de l'homme et du citoyen.",
    whyImportantToday:
      "C'est l'acte de naissance de notre démocratie parlementaire : depuis 1789, la souveraineté appartient à la Nation et la Déclaration du 26 août 1789 protège toujours nos libertés fondamentales.",
    keyFigureOrDoc: 'Document repère : Déclaration des droits de l’homme et du citoyen (26 août 1789)',
    quickQuestion: 'À quelle date précise les députés se sont-ils constitués en « Assemblée nationale » avant de prêter le Serment du Jeu de paume le 20 juin ?',
    quickOptions: ['Le 17 juin 1789', 'Le 14 juillet 1900', 'Le 4 octobre 1958'],
    quickCorrect: 0,
    quickExplanation: 'Exact ! Les députés du Tiers-État se constituent en Assemblée nationale le 17 juin 1789, puis prêtent le Serment du Jeu de paume le 20 juin 1789.',
    photoId: 'jeu-de-paume',
    baseName: 'jeu-de-paume',
    imageAlt:
      'Tableau Le Serment du Jeu de Paume par Jacques-Louis David montrant les députés du 20 juin 1789 levant la main à Versailles',
    author: 'Jacques-Louis David (1748–1825)',
    institution: 'Musée Carnavalet – Histoire de Paris / Paris Musées',
    license: 'CC0 Domaine public',
    artworkUrl: 'https://commons.wikimedia.org/wiki/File:Le_Serment_du_Jeu_de_paume.jpg',
    officialSourceUrl: 'https://www2.assemblee-nationale.fr/decouvrir-l-assemblee/histoire',
    officialSourceLabel: "Histoire de l'Assemblée nationale (portail officiel)",
    objectPosition: 'center center',
    width: 1280,
    height: 845
  },
  {
    id: 'tl-1798',
    year: '1798',
    buttonLabel: '1798',
    dateLabel: '21 janvier 1798',
    title: 'Inauguration de la première salle des séances au Palais Bourbon',
    shortDescription:
      'Première salle en hémicycle du Conseil des Cinq-Cents aménagée au Palais Bourbon par les architectes Gisors et Leconte (1798).',
    description:
      "Sous la Première République (Directoire), les architectes Jacques-Pierre Gisors et Étienne-Chérubin Leconte aménagent un premier hémicycle dans le Palais Bourbon, au bord de la Seine. Le 21 janvier 1798, les députés du Conseil des Cinq-Cents y tiennent leur première séance.",
    whyImportantToday:
      "Depuis le 21 janvier 1798, le Palais Bourbon est resté le cœur de la vie parlementaire française et la « maison des députés » à Paris.",
    keyFigureOrDoc: 'Lieu repère : Première salle en hémicycle du Conseil des Cinq-Cents (Palais Bourbon)',
    quickQuestion: 'Quelle assemblée de députés inaugure la toute première salle en hémicycle du Palais Bourbon le 21 janvier 1798 ?',
    quickOptions: ['Le Conseil des Cinq-Cents', 'Le Parlement européen', 'Le Conseil municipal'],
    quickCorrect: 0,
    quickExplanation: 'Bravo ! Le 21 janvier 1798, le Conseil des Cinq-Cents inaugure la première salle des séances en hémicycle du Palais Bourbon.',
    photoId: 'conseil-cinq-cents-1798',
    baseName: 'conseil-cinq-cents-1798',
    imageAlt:
      'Estampe historique représentant la première salle des séances en hémicycle du Conseil des Cinq-Cents au Palais Bourbon en 1798',
    author: "D'après les architectes Jacques-Pierre Gisors et Étienne-Chérubin Leconte",
    institution: 'Musée Carnavalet – Histoire de Paris (G.33213) / Paris Musées',
    license: 'CC0 Domaine public',
    artworkUrl: 'https://commons.wikimedia.org/wiki/File:Le_Palais_national_du_Conseil_des_Cinq-Cents,_G.33213.jpg',
    officialSourceUrl: 'https://www2.assemblee-nationale.fr/decouvrir-l-assemblee/patrimoine/le-palais-bourbon-et-l-hotel-de-lassay',
    officialSourceLabel: 'Le Palais Bourbon (patrimoine officiel de l’Assemblée)',
    objectPosition: 'center center',
    width: 1600,
    height: 1204
  },
  {
    id: 'tl-1804',
    year: '1804',
    buttonLabel: '1804',
    dateLabel: '21 mars 1804 & travaux 1806–1810',
    title: 'Le Code civil (21 mars 1804) et la façade aux 12 colonnes (1806–1810)',
    shortDescription:
      'Le Code civil est promulgué le 21 mars 1804 sous le Consulat de Napoléon Bonaparte, qui fait ensuite édifier la colonnade du Palais Bourbon (1806–1810).',
    description:
      "Le 21 mars 1804, le Code civil des Français (2 281 articles) est promulgué sous le Consulat de Napoléon Bonaparte (qui devient empereur sous le nom de Napoléon Ier le 18 mai 1804). Il unifie les règles de la vie civile dans tout le pays. Napoléon confie ensuite à l'architecte Bernard Poyet la construction de la célèbre façade néoclassique à 12 colonnes du Palais Bourbon, dont les travaux s'étendent de 1806 à 1810 face à l'église de la Madeleine.",
    whyImportantToday:
      "Le Code civil règle toujours notre vie quotidienne (famille, contrats, propriété), et les 12 colonnes bâties de 1806 à 1810 sont devenues le symbole visuel de l'Assemblée nationale.",
    keyFigureOrDoc: 'Document & Architecture : Code civil (21 mars 1804) et Colonnade de Poyet (1806–1810)',
    quickQuestion: 'Qu’unifie le Code civil promulgué le 21 mars 1804 dans toute la France ?',
    quickOptions: ['Les règles de la vie civile entre citoyens (famille, contrats, propriété)', 'Les horaires des trains', 'Le règlement de la Ligue des champions'],
    quickCorrect: 0,
    quickExplanation: 'Exact ! Le Code civil du 21 mars 1804 unifie les règles du droit civil pour tous les Français.',
    photoId: 'napoleon',
    baseName: 'napoleon',
    imageAlt:
      'Portrait en pied de Napoléon Ier en costume de sacre par le peintre François Gérard (1805)',
    author: 'François Gérard (1770–1837)',
    institution: "Musée de l'Armée / RMN-Grand Palais / Wikimedia Commons",
    license: 'Domaine public',
    artworkUrl: 'https://commons.wikimedia.org/wiki/Category:Napoleon_I_in_Coronation_Robes_by_Fran%C3%A7ois_G%C3%A9rard',
    officialSourceUrl: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070721/',
    officialSourceLabel: 'Le Code civil sur Légifrance',
    objectPosition: 'top center',
    width: 1280,
    height: 2010
  },
  {
    id: 'tl-1848',
    year: '1848',
    buttonLabel: '1848',
    dateLabel: '5 mars & 27 avril 1848',
    title: "Suffrage universel masculin (5 mars) et abolition de l'esclavage (27 avril)",
    shortDescription:
      "Portrait de Victor Schœlcher par Henri Decaisne : en 1848, la IIe République adopte deux réformes majeures mais distinctes.",
    description:
      "Au printemps 1848, la IIe République prend deux grandes décisions historiques distinctes : d'une part, le décret du 5 mars 1848 abolit le suffrage censitaire (réservé aux plus riches) et instaure le suffrage universel masculin direct ; d'autre part, le décret du 27 avril 1848, préparé sous l'impulsion de Victor Schœlcher, abolit définitivement l'esclavage dans les colonies françaises.",
    whyImportantToday:
      "1848 proclame que la liberté et la dignité humaine appartiennent à tous et que le droit de vote ne dépend jamais de la fortune d'un citoyen.",
    keyFigureOrDoc: 'Personnage & Textes : Victor Schœlcher · Décrets des 5 mars et 27 avril 1848',
    quickQuestion: 'Quelles sont les deux grandes décisions distinctes prises au printemps 1848 par la IIe République ?',
    quickOptions: [
      'Le suffrage universel masculin (5 mars) et l’abolition définitive de l’esclavage (27 avril)',
      'La construction des 12 colonnes et le sacre de Napoléon',
      'La création de la télévision et d’Internet'
    ],
    quickCorrect: 0,
    quickExplanation: 'Parfait ! Le 5 mars 1848 établit le suffrage universel masculin, et le décret du 27 avril 1848 abolit définitivement l’esclavage.',
    photoId: 'schoelcher-1848',
    baseName: 'schoelcher-1848',
    imageAlt:
      "Portrait peint de Victor Schœlcher par Henri Decaisne, artisan du décret d'abolition de l'esclavage du 27 avril 1848",
    author: 'Henri Decaisne (1799–1852)',
    institution: 'Collections publiques / Wikimedia Commons',
    license: 'Domaine public',
    artworkUrl: 'https://commons.wikimedia.org/wiki/File:Victor_Sch%C5%93lcher_par_Henri_Decaisne.jpg',
    officialSourceUrl: 'https://www2.assemblee-nationale.fr/decouvrir-l-assemblee/histoire/histoire-de-l-assemblee-nationale/la-deuxieme-republique-1848-1851',
    officialSourceLabel: 'La IIe République (1848) sur le site de l’Assemblée',
    objectPosition: 'top center',
    width: 1280,
    height: 1708
  },
  {
    id: 'tl-1944',
    year: '1944',
    buttonLabel: '1944',
    dateLabel: '21 avril 1944 & votes de 1945',
    title: "Droit de vote et d'éligibilité des femmes (1944) et premiers votes (1945)",
    shortDescription:
      "Illustration pédagogique de l'article 17 de l'ordonnance du 21 avril 1944 et du premier vote des citoyennes françaises en 1945.",
    description:
      "Par l'ordonnance du 21 avril 1944 signée à Alger par le général de Gaulle, la République accorde aux femmes le droit de vote et d'éligibilité : « Les femmes sont électrices et éligibles dans les mêmes conditions que les hommes. » Les Françaises votent pour la première fois aux élections municipales du 29 avril 1945, puis élisent les 33 premières femmes députées le 21 octobre 1945.",
    whyImportantToday:
      "Sans le vote et l'éligibilité des femmes, le suffrage n'était pas réellement universel : depuis 1944–1945, femmes et hommes ont exactement les mêmes droits politiques.",
    keyFigureOrDoc: 'Document repère : Article 17 de l’ordonnance du 21 avril 1944 & 33 premières députées (1945)',
    quickQuestion: 'Que décide l’article 17 de l’ordonnance du 21 avril 1944 ?',
    quickOptions: [
      'Les femmes deviennent électrices et éligibles dans les mêmes conditions que les hommes',
      'Le vote devient obligatoire dès l’âge de 8 ans',
      'Le Sénat est supprimé'
    ],
    quickCorrect: 0,
    quickExplanation: 'Exact ! Les Françaises obtiennent le droit de vote et d’éligibilité le 21 avril 1944 et votent pour la première fois en 1945.',
    photoId: 'vote-femmes-1944',
    baseName: 'vote-femmes-1944',
    imageAlt:
      "Illustration pédagogique présentant l'article 17 de l'ordonnance du 21 avril 1944 accordant le droit de vote et d'éligibilité aux femmes, ainsi qu'une carte d'électrice et une urne de 1945",
    author: 'Illustration pédagogique originale (Le parcours de Malik & son Papa)',
    institution: "D'après l'article 17 de l'Ordonnance du 21 avril 1944 (Journal officiel)",
    license: 'CC0 Domaine public (Illustration pédagogique originale)',
    artworkUrl: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000698684/',
    officialSourceUrl: 'https://www2.assemblee-nationale.fr/decouvrir-l-assemblee/histoire/les-femmes-et-le-pouvoir',
    officialSourceLabel: "La conquête de la citoyenneté des femmes (Assemblée nationale)",
    objectPosition: 'center center',
    width: 1280,
    height: 960
  },
  {
    id: 'tl-1958',
    year: '1958',
    buttonLabel: '1958',
    dateLabel: '28 septembre & 4 octobre 1958',
    title: 'Naissance de la Ve République et promulgation de la Constitution',
    shortDescription:
      'Exemplaire scellé de la Constitution du 4 octobre 1958 accompagné du Grand Sceau de la République française.',
    description:
      "Approuvée par les citoyens lors du référendum du 28 septembre 1958 et promulguée le 4 octobre 1958, la Constitution fonde la Ve République. Elle définit l'équilibre entre le Président de la République, le Gouvernement, le Parlement bicaméral (Assemblée nationale et Sénat) et le Conseil constitutionnel.",
    whyImportantToday:
      "C'est la Constitution qui nous gouverne aujourd'hui : située tout au sommet de la pyramide des normes, elle organise le vote des lois et protège nos droits.",
    keyFigureOrDoc: 'Document repère : Constitution de la Ve République (référendum du 28 sept. · promulguée le 4 oct. 1958)',
    quickQuestion: 'Comment la Constitution de la Ve République a-t-elle été adoptée en 1958 ?',
    quickOptions: [
      'Approuvée par les Français par référendum le 28 septembre 1958, puis promulguée le 4 octobre 1958',
      'Décidée par un roi sans vote',
      'Tirée au sort dans un chapeau'
    ],
    quickCorrect: 0,
    quickExplanation: 'Bravo ! Le peuple français l’a approuvée par référendum le 28 septembre 1958 avant sa promulgation officielle le 4 octobre 1958.',
    photoId: 'constitution-1958',
    baseName: 'constitution-1958',
    imageAlt:
      'Exemplaire scellé de la Constitution du 4 octobre 1958 portant les signatures officielles et le Grand Sceau de la République française sur ruban tricolore',
    author: 'Tangopaso (Wikimedia Commons) / Document : Archives nationales',
    institution: 'Archives nationales / Assemblée nationale / Wikimedia Commons',
    license: 'Domaine public',
    artworkUrl: 'https://commons.wikimedia.org/wiki/File:Constitution_de_1958.jpg',
    officialSourceUrl: 'https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur',
    officialSourceLabel: 'Texte intégral de la Constitution de 1958 (Conseil constitutionnel)',
    objectPosition: 'center center',
    width: 1600,
    height: 1200
  },
  {
    id: 'tl-1994',
    year: '1994',
    buttonLabel: '1994',
    dateLabel: '4 juin 1994',
    title: 'Création du Parlement des enfants',
    shortDescription:
      'Illustration pédagogique du premier Parlement des enfants réuni au Palais Bourbon le 4 juin 1994.',
    description:
      "Créé en 1994 à l'initiative de Philippe Séguin (Président de l'Assemblée nationale) avec le ministère de l'Éducation nationale, le Parlement des enfants réunit pour la première fois 577 délégués de CM2 dans l'Hémicycle le 4 juin 1994. Les classes rédigent une proposition de loi pédagogique : ce texte est un exercice citoyen qui n'a pas valeur de loi officielle, même s'il a parfois inspiré de vrais députés.",
    whyImportantToday:
      "Le Parlement des enfants permet aux élèves de Cycle 3 de pratiquer le débat argumenté, la rédaction collective et le vote démocratique dès l'école.",
    keyFigureOrDoc: 'Initiative citoyenne : Philippe Séguin & Éducation nationale (1re séance le 4 juin 1994)',
    quickQuestion: 'Quel est le but du Parlement des enfants créé en 1994 ?',
    quickOptions: [
      'Initier les élèves à la démocratie en rédigeant et en votant une proposition de loi pédagogique',
      'Remplacer définitivement les 577 députés adultes',
      'Faire passer le permis de conduire aux CM2'
    ],
    quickCorrect: 0,
    quickExplanation: 'Exact ! C’est une opération civique qui permet aux classes de découvrir le rôle du député et le débat démocratique.',
    photoId: 'parlement-enfants-1994',
    baseName: 'parlement-enfants-1994',
    imageAlt:
      "Illustration pédagogique représentant le premier Parlement des enfants réuni dans l'Hémicycle le 4 juin 1994 autour du débat, de la rédaction et du vote citoyen en CM2",
    author: 'Illustration pédagogique originale (Le parcours de Malik & son Papa)',
    institution: "D'après l'opération civique de l'Assemblée nationale et de l'Éducation nationale",
    license: 'CC0 Domaine public (Illustration pédagogique originale)',
    artworkUrl: 'https://www.parlementdesenfants.fr/',
    officialSourceUrl: 'https://www.parlementdesenfants.fr/site/tout-savoir-sur-l-operation',
    officialSourceLabel: 'Tout savoir sur le Parlement des enfants (site officiel)',
    objectPosition: 'center center',
    width: 1280,
    height: 960
  },
  {
    id: 'tl-2026',
    year: '2026',
    buttonLabel: '2026 · Aujourd’hui',
    dateLabel: 'Année scolaire 2026–2027',
    title: "Aujourd'hui : l'Assemblée nationale et la 30e édition du Parlement des enfants",
    shortDescription:
      "Illustration pédagogique du travail actuel des 577 députés et du calendrier programmé de la 30e édition (2026–2027) du Parlement des enfants.",
    description:
      "Aujourd'hui, les 577 députés débattent, votent les lois et contrôlent le Gouvernement en direct au Palais Bourbon. Parallèlement, la 30e édition du Parlement des enfants (année scolaire 2026–2027) associe les classes de CM2 et de 6e autour du thème « Favoriser l'accès à la culture pour toutes et tous », avec un calendrier programmé : jury national prévu les 3 ou 4 février 2027, fin des votes le 5 mars 2027 et accueil des classes finalistes prévu le 10 mars 2027.",
    whyImportantToday:
      "La démocratie est vivante : chaque citoyen peut suivre les séances de l'Assemblée, et les élèves de CM2 et de 6e participent directement à la réflexion civique !",
    keyFigureOrDoc: 'Repère 2026–2027 : 30e édition CM2 / 6e « Favoriser l’accès à la culture pour toutes et tous »',
    quickQuestion: 'Quels élèves peuvent aujourd’hui participer à la 30e édition (2026–2027) du Parlement des enfants ?',
    quickOptions: [
      'Les classes de CM2 et les classes de 6e (Cycle 3)',
      'Uniquement les lycéens de Terminale',
      'Uniquement les habitants de Paris'
    ],
    quickCorrect: 0,
    quickExplanation: 'Parfait ! L’opération s’adresse aux classes de CM2 et de 6e sur toute la France et dans les écoles françaises à l’étranger.',
    photoId: 'assemblee-2026',
    baseName: 'assemblee-2026',
    imageAlt:
      'Illustration pédagogique présentant les missions actuelles des 577 députés au Palais Bourbon et le calendrier programmé de la 30e édition 2026-2027 du Parlement des enfants',
    author: 'Illustration pédagogique originale (Le parcours de Malik & son Papa)',
    institution: 'Sources : Assemblée nationale & Parlement des enfants (30e édition 2026–2027)',
    license: 'CC0 Domaine public (Illustration pédagogique originale)',
    artworkUrl: 'https://www.parlementdesenfants.fr/site/tout-savoir-sur-l-operation',
    officialSourceUrl: 'https://www.parlementdesenfants.fr/site/tout-savoir-sur-l-operation',
    officialSourceLabel: 'Calendrier officiel de la 30e édition (parlementdesenfants.fr)',
    objectPosition: 'center center',
    width: 1280,
    height: 960
  }
];

export const NAVETTE_STEPS = [
  {
    step: 1,
    place: 'Étape 1 • Palais Bourbon (Assemblée)',
    title: "1re lecture à l'Assemblée nationale (577 députés)",
    detail:
      "Le texte de loi est étudié en commission puis dans l'Hémicycle. Les députés votent des amendements pour l'améliorer et adoptent une première version qui part vers le Sénat."
  },
  {
    step: 2,
    place: 'Étape 2 • Palais du Luxembourg (Sénat)',
    title: '1re lecture au Sénat (348 sénateurs)',
    detail:
      "Au Palais du Luxembourg, les 348 sénateurs examinent le texte. S'ils modifient certains articles avec leurs propres amendements, le texte repart vers l'Assemblée : c'est la navette parlementaire !"
  },
  {
    step: 3,
    place: 'Étape 3 • Recherche d’accord',
    title: 'La Commission Mixte Paritaire (7 députés + 7 sénateurs)',
    detail:
      "Si le désaccord persiste après les lectures dans chaque chambre, 7 députés et 7 sénateurs se réunissent autour d'une même table pour rédiger un texte de compromis commun."
  },
  {
    step: 4,
    place: 'Étape 4 • Adoption finale & Promulgation',
    title: "Le Dernier Mot à l'Assemblée nationale",
    detail:
      "Si les deux chambres ne parviennent toujours pas à un accord, le Gouvernement peut donner le dernier mot à l'Assemblée nationale, élue au suffrage universel direct. Le Président promulgue ensuite la loi au Journal officiel."
  }
];

export const VIDEOS_DATA = videosRawNormalize();

function videosRawNormalize() {
  return [
    {
      youtubeId: 'okZBvGSpmQw',
      duration: '1 min 42',
      title: "1. C'est quoi l'Assemblée nationale ?",
      summary:
        'Les 577 députés, le Palais Bourbon et le vote des lois expliqués avec clarté et humour aux élèves de Cycle 3.',
      source: '1 jour, 1 question (France Télévisions & Milan Presse)'
    },
    {
      youtubeId: 'S3Z58ba0qpo',
      duration: '1 min 42',
      title: '2. Comment on crée une loi ?',
      summary:
        "Du projet ou de la proposition de loi jusqu'aux amendements, à la navette parlementaire et à la promulgation.",
      source: '1 jour, 1 question (France Télévisions & Milan Presse)'
    },
    {
      youtubeId: 'bFni39BhfkY',
      duration: '1 min 42',
      title: '3. Comment ça se passe le vote ?',
      summary:
        'Comprendre le suffrage universel, le scrutin démocratique, la majorité et le rôle des citoyens électeurs.',
      source: '1 jour, 1 question (France Télévisions & Milan Presse)'
    },
    {
      youtubeId: 'lcQ1-PUZFhQ',
      duration: '1 min 42',
      title: '4. À quoi sert le Sénat ?',
      summary:
        "Découvrir la deuxième chambre du Parlement français (348 sénateurs au Palais du Luxembourg) et son travail avec l'Assemblée.",
      source: '1 jour, 1 question (France Télévisions & Milan Presse)'
    }
  ];
}

export const INSTITUTION_LINKS = [
  {
    title: "Portail de l'Assemblée nationale",
    desc: 'Toutes les lois en discussion, les séances en direct et la carte des 577 députés.',
    url: 'https://www.assemblee-nationale.fr/'
  },
  {
    title: "Espace Juniors de l'Assemblée",
    desc: "Brochures illustrées, bandes dessinées et ressources pédagogiques pour l'école primaire.",
    url: 'https://www2.assemblee-nationale.fr/decouvrir-l-assemblee/juniors'
  },
  {
    title: 'Le Parlement des Enfants',
    desc: 'Le site officiel de l’opération nationale dédiée aux classes de CM2 et de Cycle 3.',
    url: 'https://www.parlementdesenfants.fr/'
  },
  {
    title: 'Visiter le Palais Bourbon',
    desc: 'Informations pratiques pour réserver une visite gratuite du Palais Bourbon en famille ou avec sa classe.',
    url: 'https://www.assemblee-nationale.fr/dyn/visite'
  },
  {
    title: 'Le Sénat (Palais du Luxembourg)',
    desc: 'Découvrir la chambre haute du Parlement et ses 348 sénateurs.',
    url: 'https://www.senat.fr/'
  },
  {
    title: 'LCP – Assemblée nationale',
    desc: 'La chaîne parlementaire civique : débats en direct et documentaires pédagogiques.',
    url: 'https://lcp.fr/'
  }
];

export const MINDMAP_BRANCHES = [
  {
    title: '1. QUI ? Les 577 Députés',
    accent: 'republic' as const,
    items: [
      'Élus pour 5 ans au suffrage universel direct par tous les citoyens majeurs.',
      'Chaque député est élu dans une circonscription (577 en France), mais représente toute la Nation.',
      "Les débats sont dirigés par le ou la Président(e) de l'Assemblée depuis le Perchoir."
    ]
  },
  {
    title: '2. OÙ ? Le Palais Bourbon',
    accent: 'republic' as const,
    items: [
      "La salle des séances en demi-cercle s'appelle l'Hémicycle (fauteuils en velours rouge).",
      'Sa façade à 12 colonnes a été commandée par Napoléon Ier (travaux de 1806 à 1810) face à la Madeleine.',
      'Les députés siègent par groupe politique, de la Gauche vers la Droite.'
    ]
  },
  {
    title: '3. QUOI ? Voter la Loi',
    accent: 'velvet' as const,
    items: [
      'Examine les projets de loi (Gouvernement) et les propositions de loi (députés/sénateurs).',
      'Les députés améliorent le texte en votant des modifications appelées amendements.',
      "Vote chaque automne le Budget de l'État (écoles, santé, justice, sécurité)."
    ]
  },
  {
    title: '4. COMMENT ? Contrôler',
    accent: 'velvet' as const,
    items: [
      'Agit comme un contre-pouvoir essentiel pour respecter la séparation des pouvoirs.',
      'Interroge les ministres chaque semaine lors des Questions au Gouvernement.',
      'Peut renverser le Gouvernement en votant une Motion de censure (289 voix minimum).'
    ]
  },
  {
    title: '5. AVEC QUI ? Le Sénat',
    accent: 'gold' as const,
    items: [
      'Le Parlement est bicaméral : Assemblée nationale (577 députés) + Sénat (348 sénateurs).',
      'Tout texte de loi voyage entre les deux chambres : la navette parlementaire.',
      "En cas de désaccord final, c'est l'Assemblée nationale qui peut avoir le dernier mot."
    ]
  },
  {
    title: '6. ET NOUS ? De 1789 au CM2',
    accent: 'gold' as const,
    items: [
      '17 juin & 20 juin 1789 : constitution de l’Assemblée nationale et Serment du Jeu de paume (puis DDHC le 26 août).',
      '1848 : suffrage universel masculin (5 mars) & abolition de l’esclavage (27 avril) ; 1944 : droit de vote des femmes (1er vote en 1945).',
      'Depuis 1994 : le Parlement des enfants initie les classes de CM2 (et de 6e) à la rédaction d’une proposition de loi pédagogique !'
    ]
  }
];

export const ROLES_GAME_DATA = [
  {
    id: 'depute',
    actor: 'Le Député (577)',
    mission: 'Élu au suffrage universel direct pour 5 ans, il vote les lois et contrôle le Gouvernement au Palais Bourbon.',
    options: ['Le Député (577)', 'Le Sénateur (348)', "L'Huissier de séance"]
  },
  {
    id: 'president-an',
    actor: "Le Président de l'Assemblée",
    mission: 'Assis au Perchoir à 3 mètres de haut, il dirige les séances, donne la parole et agite sa cloche.',
    options: ['Le Premier ministre', "Le Président de l'Assemblée", 'Le Député (577)']
  },
  {
    id: 'premier-ministre',
    actor: 'Le Premier ministre',
    mission: 'Chef du Gouvernement assis au 1er rang : il défend ses projets mais ne vote pas et peut être renversé par 289 députés.',
    options: ['Le Premier ministre', 'Le Sénateur (348)', "L'Huissier de séance"]
  },
  {
    id: 'senateur',
    actor: 'Le Sénateur (348)',
    mission: 'Siège au Palais du Luxembourg (Sénat), élu au suffrage indirect par les maires et les élus locaux.',
    options: ['Le Député (577)', 'Le Sénateur (348)', "Le Président de l'Assemblée"]
  },
  {
    id: 'huissier',
    actor: "L'Huissier de séance",
    mission: 'En habit noir avec une chaîne en argent depuis 1789, il veille au calme et apporte les textes à la Tribune.',
    options: ["L'Huissier de séance", 'Le Premier ministre', 'Le Sénateur (348)']
  }
];

export const VF_QUESTIONS = [
  {
    statement: 'Les 577 députés sont élus pour une durée de 5 ans au suffrage universel direct.',
    isTrue: true,
    explanation: 'VRAI ! Le mandat des députés dure 5 ans (sauf si l’Assemblée est dissoute avant).'
  },
  {
    statement: "Le Président de la République a le droit d'entrer dans l'Hémicycle pour participer aux votes avec les députés.",
    isTrue: false,
    explanation: "FAUX ! C'est interdit depuis 1875 au nom de la séparation des pouvoirs."
  },
  {
    statement: "En cas de désaccord persistant avec le Sénat sur une loi, c'est l'Assemblée nationale qui peut avoir le dernier mot.",
    isTrue: true,
    explanation: 'VRAI ! Car les députés sont élus directement par tous les citoyens.'
  },
  {
    statement: 'C’est Napoléon Ier qui a fait construire la façade aux 12 colonnes du Palais Bourbon (1806–1810).',
    isTrue: true,
    explanation: 'VRAI ! L’architecte Bernard Poyet l’a construite de 1806 à 1810 pour répondre en miroir à l’église de la Madeleine.'
  },
  {
    statement: "Les élèves de CM2 n'ont jamais eu l'occasion de rédiger une proposition de loi pédagogique pour l'Assemblée.",
    isTrue: false,
    explanation: 'FAUX ! Depuis juin 1994, le Parlement des enfants associe chaque année des classes de CM2 (et de 6e) !'
  },
  {
    statement: 'Il faut au minimum 289 voix pour adopter une Motion de censure et obliger le Gouvernement à démissionner.',
    isTrue: true,
    explanation: 'VRAI ! 289 voix représentent la majorité absolue des 577 députés.'
  }
];

export const FINAL_QUIZ_QUESTIONS: QuizQuestionItem[] = [
  {
    question: "Combien de députés siègent dans l'Hémicycle de l'Assemblée nationale ?",
    options: ['348 députés', '577 députés', '1 000 députés'],
    correctIndex: 1,
    explanation: 'Exact ! Il y a 577 députés élus dans les 577 circonscriptions françaises (348 est le nombre de sénateurs au Sénat).'
  },
  {
    question: "Comment s'appelle le palais parisien où siège l'Assemblée nationale depuis 1798 ?",
    options: ['Le Palais Bourbon', 'Le Palais du Luxembourg', "Le Palais de l'Élysée"],
    correctIndex: 0,
    explanation: "Bravo ! L'Assemblée nationale siège au Palais Bourbon (le Sénat est au Palais du Luxembourg et le Président à l'Élysée)."
  },
  {
    question: 'Depuis quelle année les élèves de CM2 participent-ils au « Parlement des Enfants » créé par Philippe Séguin ?',
    options: ['Depuis 1806', 'Depuis juin 1994', 'Depuis 2022'],
    correctIndex: 1,
    explanation: 'Super ! La toute première séance du Parlement des Enfants s’est tenue le 4 juin 1994.'
  },
  {
    question: 'Qu’a fait bâtir Napoléon Ier sur le Palais Bourbon face à la Seine ?',
    options: ['Une pyramide en verre', 'La célèbre façade grecque à 12 colonnes', 'Un pont-levis médiéval'],
    correctIndex: 1,
    explanation: 'Bien joué ! Napoléon Ier a commandé la colonnade à 12 colonnes à l’architecte Bernard Poyet.'
  },
  {
    question: "Comment surnomme-t-on le fauteuil perché à 3 mètres de haut où s'assoit le Président de l'Assemblée ?",
    options: ['Le Trône', 'Le Perchoir', 'Le Mirador'],
    correctIndex: 1,
    explanation: "Oui ! On l'appelle le Perchoir car il domine toute la salle et la Tribune des orateurs."
  },
  {
    question: 'Quel est le texte suprême placé tout en haut de la pyramide des règles en France ?',
    options: ['La Constitution du 4 octobre 1958', 'Le règlement intérieur de la mairie', 'Un décret ministériel'],
    correctIndex: 0,
    explanation: 'Parfait ! Dans la hiérarchie des normes (pyramide de Kelsen), la Constitution de 1958 est au sommet.'
  },
  {
    question: "Comment s'appelle le va-et-vient d'un texte de loi entre l'Assemblée nationale et le Sénat ?",
    options: ['Le tennis républicain', 'La navette parlementaire', 'Le marathon civique'],
    correctIndex: 1,
    explanation: "Exactement ! C'est la navette parlementaire, et l'Assemblée nationale a le dernier mot en cas de désaccord final."
  },
  {
    question: 'En quelle année les femmes ont-elles obtenu le droit de vote et d’éligibilité en France ?',
    options: ['En 1789', 'En 1848', 'En 1944'],
    correctIndex: 2,
    explanation: "Bravo ! C'est l'ordonnance du 21 avril 1944 qui a accordé le droit de vote et d'éligibilité aux Françaises."
  }
];
