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

export const GLOSSAIRE: GlossaireItem[] = glossaireRaw.map((g) => ({
  id: g.id,
  term: g.term,
  category: g.category,
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
    frontQuestion: 'Pourquoi y a-t-il exactement 577 députés (et pas 500 ou 600) ?',
    backTitle: 'Un nombre impair pour les 577 circonscriptions !',
    backText:
      "La France est découpée en 577 circonscriptions législatives (environ 125 000 habitants chacune). Une loi ordinaire passe dès qu'il y a plus de POUR que de CONTRE parmi les votants, et une motion de censure exige 289 voix."
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

export const TIMELINE_EVENTS = [
  {
    year: '1789',
    dateLabel: '20 juin & 26 août 1789',
    title: "Le Serment du Jeu de Paume & la Déclaration des Droits de l'Homme",
    description:
      "À Versailles, les députés du Tiers-État réunis dans la salle du Jeu de Paume jurent de donner une Constitution à la France : c'est la naissance de l'Assemblée nationale ! Le 26 août 1789, ils votent la Déclaration des Droits de l'Homme et du Citoyen."
  },
  {
    year: '1798',
    dateLabel: '21 janvier 1798',
    title: "L'installation des députés au Palais Bourbon",
    description:
      "Sous la Première République, le Conseil des Cinq-Cents s'installe pour la première fois au Palais Bourbon à Paris, au bord de la Seine. Depuis cette date, ce palais est resté la maison des députés français."
  },
  {
    year: '1804',
    dateLabel: '1804 – 1807 (Napoléon)',
    title: 'Le Code civil (1804) et les 12 colonnes du Palais Bourbon (1807)',
    description:
      "En 1804, Napoléon promulgue le Code civil (2 281 articles) qui unifie les règles de vie des Français. Il fait ensuite ériger la célèbre façade à 12 colonnes corinthiennes du Palais Bourbon face à l'église de la Madeleine."
  },
  {
    year: '1848',
    dateLabel: 'Mars & Avril 1848',
    title: "Suffrage universel masculin (5 mars) & Abolition de l'esclavage (27 avril)",
    description:
      "La IIe République supprime le suffrage censitaire réservé aux riches le 5 mars 1848 (tous les hommes majeurs peuvent voter) et abolit définitivement l'esclavage le 27 avril 1848 sous l'impulsion de Victor Schœlcher."
  },
  {
    year: '1944',
    dateLabel: '21 avril 1944',
    title: "Les Françaises obtiennent le droit de vote et d'éligibilité !",
    description:
      "L'ordonnance signée par le général de Gaulle accorde enfin aux femmes le droit de voter et d'être élues. En octobre 1945, les 33 premières femmes députées font leur entrée sur les bancs du Palais Bourbon."
  },
  {
    year: '1958',
    dateLabel: '4 octobre 1958',
    title: 'La Constitution de la Ve République',
    description:
      "Approuvée par référendum, la Constitution du 4 octobre 1958 organise nos institutions actuelles : Président de la République, Gouvernement, Conseil constitutionnel et Parlement bicaméral (Assemblée + Sénat)."
  },
  {
    year: '1994',
    dateLabel: '4 juin 1994',
    title: 'Création du Parlement des Enfants (Classes de CM2)',
    description:
      "Créé par Philippe Séguin avec l'Éducation nationale, le Parlement des Enfants réunit pour la première fois 577 délégués de CM2 dans l'Hémicycle pour débattre et voter de vraies propositions de loi."
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
      'Sa façade à 12 colonnes a été commandée par Napoléon Ier face à la Madeleine.',
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
      '20 juin 1789 : naissance de l’Assemblée nationale lors du Serment du Jeu de Paume.',
      '1848 : suffrage masculin & abolition de l’esclavage ; 1944 : droit de vote des femmes.',
      'Depuis 1994 : le Parlement des Enfants permet à 577 classes de CM2 de rédiger une loi !'
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
    statement: 'C’est Napoléon Ier qui a fait construire la façade aux 12 colonnes du Palais Bourbon.',
    isTrue: true,
    explanation: 'VRAI ! L’architecte Bernard Poyet l’a construite pour répondre en miroir à l’église de la Madeleine.'
  },
  {
    statement: "Les élèves de CM2 n'ont jamais eu le droit de rédiger une proposition de loi pour l'Assemblée.",
    isTrue: false,
    explanation: 'FAUX ! Depuis juin 1994, le Parlement des Enfants associe chaque année 577 classes de CM2 !'
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
