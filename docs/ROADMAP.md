# Roadmap — plateforme immobilière

Statut : phase 1 livrée ; évolution visuelle de phase 2 autorisée et livrée. Le catalogue complet reste à réaliser après le prochain feu vert. Chaque phase attend le feu vert après livraison. Interface en français, code et commentaires en anglais ; traductions anglaises et arabes accompagnent les routes publiques.

## Contrat de livraison

À la fin de chaque phase de développement : lint, typecheck et tests pertinents réellement exécutés, résultats distinguant échecs/skips ; commit Conventional Commits ; résumé des changements et du restant ; arrêt jusqu’au feu vert. Un échec n’est pas masqué par un test trivial. Les commandes seront créées en phase 1 et documentées dans CLAUDE.md. La phase de conception initiale n’a comporté aucune installation. La phase 1 dispose désormais de ses commandes et vérifications.

## Phase 0 — conception (étape actuelle)

- ARCHITECTURE.md : modules, routes, Prisma, flux, permissions, sécurité, alternatives, deux directions visuelles.
- ROADMAP.md : périmètre, dépendances et critères d’acceptation.
- Réponses aux cinq points de validation puis accord explicite.
- CLAUDE.md créé après l’autorisation de démarrer, avant le code applicatif.

## Phase 1 — socle et environnement reproductible (livrée)

- Next.js App Router, TypeScript strict, pnpm/version Node épinglés, Tailwind, shadcn/ui.
- CLAUDE.md : stack, structure, conventions, scripts, RBAC, secrets, règles de migration et checkpoints.
- PostgreSQL/Prisma, migration initiale et contraintes, next-intl fr/en/ar et RTL.
- Vitest, Playwright, scripts lint/typecheck/test/test:e2e/build ; GitHub Actions avec PostgreSQL de test.
- Configuration locale non secrète, modèle de variables, instructions cloud install_script/start_skill testées et sauvegardées. Aucun changement de secrets sans vérification des bindings existants.
- Seed idempotent réservé à une base de développement : 3 villes (Marrakech, Casablanca, Rabat), 6 projets (3/2/1) et exactement 40 lots (8/7/7/6/6/6), différents types, prix, surfaces et états. Noms fictifs, traductions FR/EN/AR, aucun contact réel ni téléchargement de médias sans licence. Aucun effacement de données utilisateur.
- Validation : installation à lockfile figé, migration, prisma validate, seed exécuté deux fois avec mêmes comptes et relations, build, lint/typecheck/tests du socle et smoke test HTTP local dans les trois langues.

## Phase 2 — identité et catalogue public

- Direction validée, composants responsive, navigation localisée et WhatsApp flottant.
- Accueil complet ; catalogue avec tous les filtres, tri, pagination et URLs partageables.
- Projet détaillé : galerie/vidéo, carte différée, équipements, progression, livraison, plans, lots et brochure.
- Validation : tests filtrage combiné sur un même lot, prix inconnu, pagination ; Playwright accueil → filtres → projet/lot, mobile et arabe RTL ; build et contrôles accessibilité pertinents.

## Phase 3 — administration et contenu

- Auth retenue, invitations, utilisateur actif et RBAC serveur avec matrice documentée.
- CRUD projets/lots/médias/articles/pages/témoignages, traductions et publication.
- Upload multiple R2 contrôlé, réorganisation, preview protégée des brouillons et invalidation du cache.
- Pages À propos, Services, Presse, Blog, Contact et pages légales éditables.
- Validation : refus côté serveur pour chaque rôle, IDOR et brouillons inaccessibles, publication/invalidation, upload refusé si invalide, CRUD complet via Playwright.

## Phase 4 — leads, CRM et notifications

- Formulaires rappel/visite/brochure/contact avec consentement explicite, honeypot, limites et captcha si activé.
- CRM : statuts, notes, assignation, filtres, export CSV sécurisé ; dashboard leads par projet/source et lots disponibles/réservés/vendus.
- Outbox Resend transactionnelle, cron authentifié, retry/idempotence et supervision.
- Newsletter avec consentement distinct, double opt-in et désinscription.
- Validation : parcours lead public → CRM → assignation/statut/export, absence consentement refusée, quotas distribués, panne email sans perte du lead, reprise sans double envoi logique, permission commerciale conforme au choix validé.

## Phase 5 — SEO, performance et préparation production

- Metadata, sitemap, robots, hreflang, JSON-LD et canonical ; contenu complet par langue.
- AVIF/WebP, ISR et disponibilité fraîche, budgets JS/images, responsive/accessibilité, headers/CSP.
- Rétention, suppression/anonymisation, logs sans PII, sauvegarde/restauration et documentation exploitation.
- Préproduction Vercel et base séparée ; migrations contrôlées, services réels et notifications vers destinataires de test.
- Validation : parcours critiques Playwright complets, intégrations réelles préproduction, Lighthouse > 90 suivant le protocole d’architecture, vérification SEO/RTL/clavier et restauration testée.
- Production uniquement après validation des contenus, droits médias, identité du responsable, consentements et obligations CNDP/transferts ; accord explicite avant publication.

## Hors V1

Multi-promoteurs avec isolation complète, paiements/réservations en ligne, portail acquéreur, signature électronique, synchronisation CRM externe et recherche géospatiale avancée. `organizationId` ne suffit pas à livrer ces fonctions.

## Situation actuelle

Phase 1 implémentée : conventions CLAUDE.md, stack épinglée, schéma Prisma complet et migration SQL avec contraintes, PostgreSQL Docker, seed additif (3 villes / 6 projets / 40 lots), messages FR/EN/AR, page de socle lisant PostgreSQL et switch de langue/RTL, composant Button compatible shadcn/ui, tests et workflow CI.

Vérifications effectuées dans l’instance cloud : installation à lockfile figé et réinstallation, schéma Prisma valide, migrations appliquées puis réappliquées sans modification, absence de différence entre base et schéma, seed répété sans duplication et préservation d’une édition, lint, typecheck, build production, 11 tests unitaires, 4 tests d’intégration et 10 tests Playwright desktop/mobile. Aucun test ignoré. Démarrage de développement et requêtes HTTP multilingues vérifiés. CI définie ; son exécution distante n’est pas encore attestée.

Le moteur des migrations exige binaries.prisma.sh, désormais accessible. Aucun fournisseur externe ni compte réel requis pour cette phase. Design final, catalogue filtrable, Auth.js/RBAC, administration, CRM, R2 et Resend restent à implémenter dans leurs phases ; Lighthouse n’est pas encore mesuré. La présentation Atlas et l’expérience 3D sont désormais enrichies dans le lot décrit ci-dessous. Prochaine action : feu vert pour compléter le catalogue public de phase 2.

## Évolution visuelle de phase 2 — photos, WebGL et animations

Demande autorisée : ajouter des photos, des mouvements 3D et des animations au défilement. Choix utilisateur explicite : scène WebGL immersive.

- Accueil Atlas : Manrope/Cormorant Garamond/Noto Sans Arabic auto-hébergées, visuel de villa, cartes photographiques, section vision et appels à explorer.
- Huit visuels WebP locaux ; optimisation next/image, hero préchargé, autres images différées. Sources et licences dans MEDIA.md.
- Maquette Three.js originale, rotation/zoom/reset/pause accessibles, chargement près du viewport et arrêt hors écran.
- Révélation au défilement, parallaxe et inclinaison des cartes ; préférence de mouvement réduit respectée. Photographies et contenu utilisables sans JavaScript, repli si WebGL est indisponible.
- Validation : lint, typecheck, build production, 11 tests unitaires, 4 tests PostgreSQL et 22 tests navigateur desktop/mobile ; tests sur les formats d’images, interactions 3D, absence WebGL/JavaScript et défilement tactile. Aucun test ignoré.

Ce lot couvre la présentation visuelle demandée. La phase 2 complète nécessite encore catalogue filtrable/tri/pagination, pages projet détaillées, galerie vidéo, carte, équipements, plans, tableau des lots et brochures. Auth/RBAC et back-office restent en phase 3. Le seuil Lighthouse > 90 reste à mesurer selon le protocole de phase 5.
