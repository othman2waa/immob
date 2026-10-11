# Roadmap — plateforme immobilière

Statut : proposition, aucune phase de code démarrée. Chaque phase attend le feu vert après livraison. Interface en français, code et commentaires en anglais ; traductions anglaises et arabes accompagnent les routes publiques.

## Contrat de livraison

À la fin de chaque phase de développement : lint, typecheck et tests pertinents réellement exécutés, résultats distinguant échecs/skips ; commit Conventional Commits ; résumé des changements et du restant ; arrêt jusqu’au feu vert. Un échec n’est pas masqué par un test trivial. Les commandes seront créées en phase 1 et documentées dans CLAUDE.md. Aucun commit ni installation à l’étape de proposition actuelle.

## Phase 0 — conception (étape actuelle)

- ARCHITECTURE.md : modules, routes, Prisma, flux, permissions, sécurité, alternatives, deux directions visuelles.
- ROADMAP.md : périmètre, dépendances et critères d’acceptation.
- Réponses aux cinq points de validation puis accord explicite.
- CLAUDE.md sera créé à l’étape 2, après validation et avant le code applicatif.

## Phase 1 — socle et environnement reproductible

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

Deux documents de conception créés uniquement. Pas d’application, de dépendances installées, de base, de configuration cloud sauvegardée ou de checks applicatifs exécutables. L’accès Git distant en lecture fonctionne, mais aucune référence main/HEAD n’a été retournée ; le checkout reste sur la branche locale work sans commits. Prochaine action : validation de la phase 0, puis CLAUDE.md et socle.
