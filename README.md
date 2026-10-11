# Immob

Plateforme de programmes immobiliers neufs au Maroc. Français, anglais et arabe (RTL). Le projet est développé phase par phase : voir [l’architecture](docs/ARCHITECTURE.md) et [la roadmap](docs/ROADMAP.md).

## Développement

Prérequis : Node **24.19.0**, pnpm **11.25.0**, Docker avec Compose. Les versions applicatives sont figées dans package.json et pnpm-lock.yaml. Le serveur PostgreSQL de développement écoute uniquement sur loopback, port 5433 ; son volume survit aux arrêts.

```sh
bash scripts/setup-dev.sh
pnpm dev
```

Le script installe à lockfile figé, crée une `.env` ignorée uniquement si aucune configuration n’existe, puis démarre PostgreSQL, génère Prisma, applique les migrations et ajoute les données fictives. Il ne réinitialise jamais la base. Pour une base existante, configurez DATABASE_URL et DIRECT_DATABASE_URL par un canal sécurisé avant l’installation ; le seed refuse les bases autres que immob_dev/immob_test et exige ALLOW_DEMO_SEED=true. Ne dirigez jamais ces commandes de démonstration vers la production.

Le jeu de démonstration comprend Marrakech, Casablanca, Rabat, 6 projets, 40 lots, 3 traductions par projet et les 6 types de biens. Les références stables et créations additives préservent les éditions lors des réexécutions. Aucun compte administrateur ou média sans licence n’est ajouté.

## Vérifications

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Playwright démarre son propre serveur de production après le build et teste les trois langues sur desktop et mobile. Dans un environnement cloud ayant déjà Chromium installé, définissez `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` au lieu de télécharger un navigateur supplémentaire. `/api/health` vérifie une requête PostgreSQL réelle, sans exposer de connexion ni de détails internes.

## Périmètre

Le socle de phase 1 fournit la configuration, le modèle de données, une page multilingue lisant la base et l’infrastructure de tests. Le catalogue complet, le design premium, l’authentification, l’administration, les leads et les services externes arrivent dans les phases suivantes. Les polices et médias définitifs ne sont pas encore intégrés.

Les secrets de production ne doivent jamais être écrits dans Git ou le chat. `.env.example` documente les paramètres locaux ; les futurs fournisseurs sont décrits dans ARCHITECTURE.md. Voir [CLAUDE.md](CLAUDE.md) pour les conventions et le contrat de livraison.

## Validation de la phase 1

Installation réexécutée, migrations/seed idempotents et absence de dérive du schéma vérifiés. Lint, typecheck et build production réussis ; 11 tests unitaires, 4 tests PostgreSQL et 10 tests navigateur desktop/mobile passent. Le développement répond dans les trois langues. GitHub Actions est configuré ; son exécution distante n’a pas encore été vérifiée.
