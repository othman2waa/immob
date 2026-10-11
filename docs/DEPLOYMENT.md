# Démo publique : Vercel + PostgreSQL

La démo utilise l’application Next.js complète, avec les trois langues, les photographies locales, les animations et la maquette WebGL. Les six projets et les quarante lots sont lus dans PostgreSQL. Le catalogue filtrable, les pages projet, l’administration et le CRM restent prévus dans la roadmap.

## Accès nécessaires

- Un compte Vercel autorisé à déployer le projet. Pour un déploiement depuis cet environnement, renseigner `VERCEL_TOKEN` dans les paramètres sécurisés. Le jeton est utilisé uniquement vers `api.vercel.com`.
- Une base PostgreSQL dédiée à cette démo, accessible depuis Vercel : Neon ou Supabase. Utiliser une base nommée **immob_dev** pour rester compatible avec la protection actuelle du seed. Ne pas utiliser une base contenant des données clients.
- `DATABASE_URL` : connexion applicative, poolée si le fournisseur le propose.
- `DIRECT_DATABASE_URL` : connexion directe destinée aux migrations Prisma. Conserver les paramètres TLS fournis par le fournisseur.

Les URL de développement en `127.0.0.1:5433` ne peuvent pas servir à Vercel. Les valeurs sont saisies dans les paramètres sécurisés, jamais dans Git ou dans le chat. Les URL PostgreSQL doivent être de véritables variables de processus ; un secret de proxy HTTP ne fournit pas les identifiants nécessaires au protocole PostgreSQL.

## Préparer la base de démonstration

Depuis la racine du dépôt, après injection des deux URL de la base dédiée :

```sh
pnpm db:generate
pnpm db:validate
pnpm db:migrate
NODE_ENV=development ALLOW_DEMO_SEED=true pnpm db:seed
```

`migrate deploy` applique les migrations versionnées sans réinitialisation. Le seed ajoute uniquement les enregistrements absents ; il refuse un environnement `production`, l’absence du consentement `ALLOW_DEMO_SEED=true` et les noms de bases autres que `immob_dev`/`immob_test`. Après vérification des 6 projets et 40 lots, ne pas activer le seed dans Vercel.

Si l’atelier cloud ne permet pas une connexion PostgreSQL directe, l’initialisation peut s’exécuter dans un **premier build Vercel ponctuel**, sur une ressource Neon dédiée déjà créée avec l’offre gratuite. Le script `scripts/prepare-cloud-demo.mjs` exige une autorisation explicite et vérifie que les trois connexions correspondent au même hôte Neon, au même rôle et à la base `immob_dev`. La connexion de création `DEMO_DATABASE_URL_UNPOOLED`, fournie par l’intégration, doit viser `neondb` sur cette même ressource. Il crée `immob_dev` seulement si elle est absente, puis exécute les migrations et le seed additif.

Commande de ce premier build uniquement :

```sh
pnpm db:generate && ALLOW_DEMO_SEED=true pnpm exec tsx scripts/prepare-cloud-demo.mjs && pnpm build
```

`ALLOW_DEMO_SEED` concerne cette commande de build ; il n’est pas ajouté aux variables de l’application. Rétablir ensuite la commande normale de `vercel.json`. Les builds suivants ne lancent ni migrations ni seed. Les secrets restent dans les variables chiffrées Vercel ; le script ne les affiche pas.

## Déployer

Le fichier `vercel.json` définit le framework, l’installation à lockfile figé et le build `pnpm db:generate && pnpm build`. La génération Prisma fait partie du build pour éviter un client périmé dans le cache Vercel. Les migrations et le seed s’exécutent séparément, avant le premier déploiement.

Deux accès au même déploiement sont possibles :

1. **Import Git** : importer `othman2waa/immob` depuis [Vercel](https://vercel.com/new), branche `main`, racine du dépôt. Les futurs pushes peuvent ensuite déclencher des déploiements automatiques.
2. **Depuis cet environnement** : connecter le compte avec le champ sécurisé `VERCEL_TOKEN`, puis lier et déployer le projet avec la CLI Vercel. Ce chemin permet de vérifier ici le résultat et son URL publique.

Dans les paramètres du projet Vercel :

| Paramètre | Valeur |
| --- | --- |
| Node.js | 24.x, compatible avec `.node-version` |
| `DATABASE_URL` | URL applicative de la base dédiée |
| `DIRECT_DATABASE_URL` | URL directe de cette même base |
| `NEXT_TELEMETRY_DISABLED` | `1` |

Définir les connexions dans l’environnement **Production** du projet de démonstration ; ajouter **Preview** uniquement si les prévisualisations doivent aussi utiliser cette base. Laisser `ALLOW_DEMO_SEED` absent. Le jeton `VERCEL_TOKEN` reste dans l’environnement d’outillage et n’est pas ajouté aux variables de l’application.

`.vercelignore` exclut les fichiers `.env`, les caches et les sorties locales des déploiements CLI. `.vercel/` est ignoré par Git. Les médias et licences dans `public/` font partie du déploiement.

## Vérifier l’URL publique

- `/` redirige vers `/fr` ; `/fr`, `/en` et `/ar` affichent les textes traduits et les six cartes. La page arabe porte `dir="rtl"`.
- `/api/health` renvoie HTTP 200 et `{"status":"ok"}` après une requête réelle à PostgreSQL.
- Les photographies chargent via l’optimisation Next.js ; aucune photo ne dépend d’une URL Unsplash au runtime.
- Au défilement, la maquette charge et ses boutons de rotation/zoom/réinitialisation fonctionnent. Le repli photographique reste disponible sans WebGL ; le mouvement réduit et le défilement mobile restent respectés.
- La démo de production est accessible dans un navigateur sans session Vercel. Vérifier les paramètres de protection du projet si une page de connexion Vercel apparaît.

Une installation ou un build local réussi ne prouve pas qu’un déploiement existe. Partager l’URL seulement après la fin du déploiement et une vérification HTTP/navigateur. L’objectif Lighthouse > 90 sera mesuré pendant la phase de performance ; il n’est pas encore certifié.
