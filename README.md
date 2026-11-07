# 🇫🇷 L’Assemblée nationale — Le parcours de Malik & son Papa (CM2)

🌐 **Site en ligne (GitHub Pages)** : **[https://vivrelehpi.github.io/assemblercm2/](https://vivrelehpi.github.io/assemblercm2/)**

Site éducatif gratuit, sans compte, sans cookie et sans publicité conçu par **Malik (CM2)** et **son papa** pour faire découvrir l’Assemblée nationale, la Constitution de 1958, la Justice et le vote des lois aux élèves de **Cycle 3 (9-11 ans)**.

---

## ✨ Architecture & Stack Technique

- **Framework** : [Astro](https://astro.build/) (sortie 100 % statique multi-pages dans `dist/`)
- **Design System** : **Tailwind CSS compilé** (`tailwind.config.mjs` + `src/styles/global.css`) — Direction artistique *« Un carnet de voyage républicain »* (règle 60/30/10 : `paper #FAF7F0`, `republic-900 #002654`, `velvet #8B1E2D`, `gold #E8B21A`, `marianne #CE1126`, `night #0B1B3A`)
- **Typographie auto-hébergée (`public/fonts/*.woff2`)** :
  - Titres : `Fredoka` (600 / 700)
  - Corps de texte haute lisibilité (adapté lecteurs fragiles / dys) : `Atkinson Hyperlegible` (400 / 700)
  - Diplôme : `Cinzel` (700)
- **Images optimisées (`public/img/`)** : Formats **AVIF** + **WebP** responsives (`480w`, `960w`, `1600w`) + fallback JPEG, avec attributions légales **Wikimedia Commons (CC BY-SA / Domaine public)**.
- **Contenu séparé du code (`src/content/` & `src/data/`)** :
  - `src/content/etapes/etapes.json` : Les 12 leçons complètes, bulles de Malik, 3 points « Je retiens », objectifs enseignants et 36 questions de mini-quiz.
  - `src/content/glossaire/termes.json` : 23 termes civiques et juridiques expliqués à hauteur d’enfant de 10 ans.
  - `src/content/badges/badges.json` : Les 9 médailles républicaines à collectionner.
  - `src/content/photos/photos.json` : Les 14 photographies et illustrations historiques (8 lieux/portraits de la galerie + 6 illustrations dédiées à la frise historique) avec leurs métadonnées et licences.

---

## 🗺️ Plan des pages générées

| URL | Description |
| :--- | :--- |
| `/` | Accueil : Hero Hémicycle, Carte illustrée des 12 étapes (3 parties), Histoire de Malik & Papa, Espace Enseignants |
| `/etape/1-hemicycle/` | Étape 1 : L’Hémicycle et ses 577 députés (Photo à 6 repères, Plan des 577 sièges, Simulateur de vote, Pupitre) |
| `/etape/2-galerie/` | Étape 2 : La galerie photo des 8 lieux et portraits avec Lightbox |
| `/etape/3-secrets/` | Étape 3 : Les 6 secrets insolites du Palais Bourbon (Cartes mystères à retourner) |
| `/etape/4-constitution-justice/` | Étape 4 : Constitution, Codes & Tribunaux (Pyramide des normes, Code civil/pénal, 10 tribunaux, Jeu « Quel tribunal ? ») |
| `/etape/5-frise-napoleon/` | Étape 5 : Frise historique interactive à 8 dates illustrées (1789 → 2026) & Zoom Histoire CM2 sur Napoléon (1804, colonnade 1806–1810) |
| `/etape/6-parlement-enfants/` | Étape 6 : Le Parlement des enfants (CM2 & 6e, 30e édition 2026–2027) + atelier pédagogique d’entraînement |
| `/etape/7-contre-pouvoir-senat/` | Étape 7 : Contre-pouvoir, Gouvernement & Sénat + simulateur de la navette parlementaire |
| `/etape/8-videos/` | Étape 8 : 4 vidéos « 1 jour, 1 question » en façade sans cookie (`youtube-nocookie`) + 6 portails officiels |
| `/etape/9-carte-mentale/` | Étape 9 : Carte mentale à 6 branches + Mode « Cache-Cache » de révision |
| `/etape/10-mini-jeux/` | Étape 10 : 3 mini-jeux (« Fais voter ta loi », « Qui fait quoi ? », « Vrai ou Faux Express ») |
| `/etape/11-quiz-diplome/` | Étape 11 : Grand Quiz final (8 questions) + Diplôme de Député Junior CM2 imprimable en A4 paysage |
| `/etape/12-sources-credits/` | Étape 12 : Sources officielles, crédits des 14 photos/illustrations & charte de confidentialité |
| `/enseignants/` | Guide EMC Cycle 3, découpage en 4 séances de 15 min, Mode Classe TBI, traces écrites et corrigés imprimables |
| `/glossaire/` | Dictionnaire citoyen interactif des 23 mots clés avec recherche et synthèse vocale |
| `/credits/` | Crédits complets Wikimedia Commons, vidéos et mentions pédagogiques |
| `/styleguide/` | Documentation vivante du Design System et des 16 composants accessibles |

---

## 🚀 Commandes de développement et de déploiement

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement Astro
npm run dev

# 3. Compiler le site statique de production dans ./dist
npm run build

# 4. Servir le site compilé (port 8957 par défaut)
node server.js

# 5. Publier directement sur GitHub Pages (branche gh-pages avec BASE_PATH=/assemblercm2)
npm run deploy:gh
```

### Déploiement statique (GitHub Pages / Netlify)
- **GitHub Pages** : La commande `npm run deploy:gh` compile le site avec `BASE_PATH=/assemblercm2`, ajoute `.nojekyll` et publie automatiquement le dossier `dist/` sur la branche `gh-pages` (`https://vivrelehpi.github.io/assemblercm2/`).
- **Netlify** : Le fichier `netlify.toml` configure automatiquement la commande `npm run build` et le dossier de publication `dist` avec les en-têtes de sécurité et de cache longue durée (`immutable`) pour les polices WOFF2 et les images AVIF/WebP.

