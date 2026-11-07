# Journal des Vérifications & Corrections Factuelles (`CONTENT_CHANGES.md`)

Ce document recense l'ensemble des vérifications historiques, constitutionnelles, juridiques et pédagogiques effectuées à partir du prototype initial (`_prototype_archive/index.prototype.html`) en les confrontant aux sources institutionnelles de référence (`assemblee-nationale.fr`, `senat.fr`, `conseil-constitutionnel.fr`, `vie-publique.fr`, `education.gouv.fr`, `parlementdesenfants.fr`).

---

## 1. Repères historiques et institutionnels validés (inchangés sur le fond)

| Notion | Donnée vérifiée | Source de référence |
|---|---|---|
| **Nombre de députés** | **577 députés** élus au suffrage universel direct pour 5 ans (scrutin uninominal majoritaire à 2 tours dans 577 circonscriptions, fixé par la loi du 11 juillet 1986 et inscrit à l'article 24 de la Constitution depuis la révision de 2008 comme plafond maximal). | Constitution (art. 24) & `assemblee-nationale.fr` |
| **Nombre de sénateurs** | **348 sénateurs** élus au suffrage universel indirect par les grands électeurs (maires, conseillers municipaux, départementaux, régionaux, députés) au Palais du Luxembourg. | Constitution (art. 24) & `senat.fr` |
| **Majorité absolue à l'Assemblée** | **289 voix** ($577 \div 2 = 288,5 \rightarrow 289$), requise notamment pour l'adoption d'une motion de censure (art. 49 al. 2 de la Constitution). Pour une loi ordinaire, la majorité simple des suffrages exprimés (plus de *POUR* que de *CONTRE*) suffit. | Constitution (art. 49) & Règlement de l'Assemblée nationale |
| **Serment du Jeu de Paume & DDHC** | **20 juin 1789** (Serment du Jeu de Paume à Versailles) et **26 août 1789** (vote de la Déclaration des Droits de l'Homme et du Citoyen). | `assemblee-nationale.fr` (Histoire) |
| **Installation au Palais Bourbon** | **21 janvier 1798** : première séance du Conseil des Cinq-Cents (Directoire) dans le Palais Bourbon réaménagé. | `assemblee-nationale.fr` |
| **Code civil & Colonnade de Napoléon Ier** | Coup d'État du 18 Brumaire (**9 novembre 1799**), promulgation du Code civil le **21 mars 1804**, construction de la façade néoclassique à **12 colonnes** par l'architecte **Bernard Poyet** à partir de **1806** face à l'église de la Madeleine. Sous le Consulat et l'Empire, les 300 membres du *Corps législatif* votaient les lois en silence après avoir écouté les orateurs du Tribunat et du Conseil d'État (« l'Assemblée des Muets »). | `assemblee-nationale.fr` & Fondation Napoléon |
| **Droit de vote et d'éligibilité des femmes** | Ordonnance du **21 avril 1944** signée à Alger par le général de Gaulle ; élection des **33 premières femmes députées** le **21 octobre 1945**. | `assemblee-nationale.fr` |
| **Constitution de la Ve République & Majorité à 18 ans** | Adoptée par référendum le **28 septembre 1958** et promulguée le **4 octobre 1958**. Abaissement de la majorité électorale de 21 à **18 ans** le **5 juillet 1974**. | `conseil-constitutionnel.fr` |
| **Interdiction d'entrée du Président dans l'Hémicycle** | Tradition républicaine issue de la loi constitutionnelle du **16 juillet 1875** (IIIe République) et maintenue sous la Ve République (art. 18 de la Constitution) : le Président communique avec le Parlement par des messages lus ou devant le Parlement réuni en **Congrès à Versailles**. | Constitution (art. 18) |

---

## 2. Corrections et précisions apportées dans la refonte

### Correction n°1 — Statut non-officiel du site et du Diplôme
* **Dans le prototype** : Mentions *« Diplôme officiel de Député Junior CM2 »* et *« 1 Diplôme A4 officiel »* sur la page d'accueil.
* **Problème** : Risque de confusion avec un document délivré par l'Assemblée nationale ou le ministère de l'Éducation nationale.
* **Correction appliquée** :
  * Remplacement systématique par **« Diplôme de Député Junior CM2 »** (sans l'adjectif « officiel »).
  * Ajout dans le pied de page de toutes les pages et sur `/credits` de la mention explicite : *« Projet éducatif citoyen indépendant créé par Malik & son Papa — Non affilié à l'Assemblée nationale. »*

### Correction n°2 — Le Parlement des Enfants (1994 → aujourd'hui)
* **Dans le prototype** : *« Et la seule classe sélectionnée dans toute la France pour remplacer les vrais députés, ce sont les élèves de CM2 ! »*
* **Précision historique et réglementaire** : Créé en **juin 1994** (1re séance le **4 juin 1994**) à l'initiative de **Philippe Séguin**, le Parlement des Enfants a longtemps été réservé aux seules classes de CM2. Dans le cadre de la continuité du Cycle 3, l'opération associe désormais les classes de **CM2** (et, selon les éditions récentes, des classes de **6e**), à raison de **577 classes sélectionnées** (une par circonscription).
* **Correction appliquée** : Maintien de la mise à l'honneur des élèves de CM2 tout en précisant que l'opération s'inscrit dans le **Cycle 3 (CM2)** avec 577 classes sélectionnées à travers toute la France.

### Correction n°3 — Saisine du Conseil constitutionnel
* **Dans le prototype** : *« Si les députés votent une loi qui interdit aux gens d'exprimer leur opinion, le Conseil Constitutionnel intervient immédiatement et détruit la loi avant qu'elle ne s'applique. »*
* **Précision juridique** : En vertu des articles 61 et 61-1 de la Constitution, le Conseil constitutionnel ne peut pas s'autosaisir d'office. Il vérifie une loi lorsqu'il est **saisi** avant sa promulgation (par le Président de la République, le Premier ministre, le Président de l'Assemblée nationale, le Président du Sénat, ou par **60 députés ou 60 sénateurs**), ou après son entrée en vigueur via une Question Prioritaire de Constitutionnalité (QPC) posée par un citoyen lors d'un procès.
* **Correction appliquée** : Explication adaptée au CM2 précisant que le Conseil constitutionnel intervient **lorsqu'il est alerté (saisi)**, notamment par 60 députés ou 60 sénateurs, pour censurer une loi contraire à la Constitution.

### Correction n°4 — Les dates du Printemps 1848 (IIe République)
* **Dans le prototype** : Un seul bouton *« Mars 1848 : Suffrage universel masculin et abolition de l'esclavage »*.
* **Précision historique** : Le décret instaurant le suffrage universel masculin date du **5 mars 1848** (faisant passer le corps électoral de 246 000 électeurs censitaires à plus de 9 millions), tandis que le décret abolissant définitivement l'esclavage dans les colonies françaises (préparé par **Victor Schœlcher**) est signé le **27 avril 1848**.
* **Correction appliquée** : Intitulé **« Printemps 1848 (mars – avril 1848) »** en citant précisément les deux dates dans la fiche historique.

### Correction n°5 — Composition de la Cour d'Assises
* **Dans le prototype** : *« 6 citoyens français tirés au sort siègent et votent aux côtés des 3 magistrats professionnels »*.
* **Précision juridique** : Depuis la loi du 10 août 2011 (entrée en vigueur le 1er janvier 2012), le jury populaire comprend bien **6 jurés citoyens en première instance** (et 9 jurés en appel) aux côtés des 3 magistrats professionnels.
* **Correction appliquée** : Mention explicite *« 6 citoyens tirés au sort (en 1re instance, 9 en appel) aux côtés de 3 juges professionnels »*.

### Correction n°6 — Attribution légale Creative Commons sur chaque photo
* **Dans le prototype** : Les crédits figuraient uniquement dans l'onglet 12, sans lien Wikimedia pour 6 photos sur 8, et n'apparaissaient pas dans la Lightbox d'agrandissement.
* **Correction appliquée** : Chaque photo possède désormais son auteur, son année/époque, son institution, sa licence exacte (`CC BY-SA 4.0`, `CC BY-SA 3.0`, `CC BY-SA 2.0 FR`, `CC0`, `Domaine public`) et son URL Wikimedia Commons vérifiée, visibles directement dans la Lightbox et sur la page `/credits`.

### Correction n°7 — Rééquilibrage des 250 XP et déblocage du 9e badge
* **Dans le prototype** : Le badge `justice` (« Juge Citoyen CM2 ») n'avait aucun déclencheur dans le code JavaScript (bloquant le compteur à `8/9`), et des XP étaient attribués au simple clic d'ouverture d'un onglet.
* **Correction appliquée** :
  * Les **9 badges** ont chacun une règle de déblocage claire, testée et vérifiée (le badge `justice` se débloque en réussissant le mini-jeu des tribunaux ou le quiz de l'étape 4).
  * Le barème total est fixé à **exactement 250 XP**, gagnés en validant les mini-quiz *« Je vérifie »* des étapes et les simulations interactives.

