# Architecture — plateforme immobilière au Maroc

Statut : lancement de l’implémentation autorisé ; phase 1 livrée. Les options recommandées servent d’hypothèses de travail, les choix métier encore ouverts seront validés avant leur phase. Dépôt inspecté le 11 octobre 2026 : vide, branche locale `work` sans commit ; la lecture Git distante réussit sans retourner de référence HEAD/main. Aucun code existant à migrer. Ce document contient un schéma de conception, pas une migration exécutée.

## 1. Périmètre et principes

Vitrine premium de programmes neufs, Marrakech prioritaire, catalogue de lots, acquisition de leads et administration sans code. Français par défaut, anglais et arabe avec RTL. Monolithe modulaire Next.js : une application publique et un back-office, une base PostgreSQL. Aucun paiement, réservation contractuelle, portail acheteur ou portail multi-promoteurs en V1. Un lot réservé indique un état commercial, sans transaction financière.

Les montants sont en MAD, stockés en Decimal, jamais en flottants. Dates stockées en UTC, affichage métier `Africa/Casablanca`. Les surfaces sont en m². Téléphones normalisés au format E.164, avec prise en charge de +212. Les projets disposent de plusieurs types de biens ; chaque lot possède son propre type. Disponibilité calculée à partir des lots, sans confondre statut de livraison et stock commercial.

## 2. Décisions proposées et alternatives

| Sujet | Option recommandée | Alternative et compromis |
| --- | --- | --- |
| Architecture | Next.js App Router, Server Components, Server Actions internes et Route Handlers publics | API indépendante : utile à une application mobile, mais double déploiement et contrat supplémentaires |
| Base et hébergement | Vercel + Neon PostgreSQL, connexion poolée au runtime et directe pour migrations | Supabase : services supplémentaires pratiques, mais Auth et Storage doublonneraient la stack retenue |
| Authentification | Auth.js, invitations puis connexion Google pour l’équipe, sessions en base | Better Auth : gestion email/mot de passe plus intégrée, dépendances et flux différents ; à choisir si Google ne convient pas |
| Médias | Cloudflare R2, bucket privé, diffusion des médias publics via domaine dédié | S3 : écosystème plus large, coûts de sortie et configuration différents |
| Carte | Leaflet + OpenStreetMap, import client différé | Mapbox : style premium et géocodage intégrés, token et facturation ; OSM nécessite un fournisseur de tuiles adapté au trafic |
| Emails | Resend, table d’outbox et reprise périodique | Envoi synchrone seul : simple, mais risque de notification perdue ou formulaire bloqué |
| Protection des leads | Limiteur distribué Redis compatible Vercel + honeypot, Turnstile activable | PostgreSQL pour les quotas : moins de services mais davantage de contention ; mémoire locale insuffisante en serverless |
| Traductions | Tables relationnelles par langue, next-intl pour l’interface | JSONB : flexible, mais contraintes, requêtes et validation éditoriale moins simples |
| Contenu éditorial | Éditeur riche à format JSON structuré, rendu par liste de composants autorisés | HTML libre : import facile mais surface XSS et contrôle visuel difficiles |

Versions de phase 1 : Node 24.19.0, pnpm 11.25.0, Next.js 16.4.0, React 19.3.0, TypeScript 5.9.3 et Prisma 6.19.3 ; versions exactes et transitives dans package.json/pnpm-lock.yaml. Prisma utilise engineType=client et l’adaptateur PostgreSQL, sans moteur de requêtes natif. Le moteur des migrations reste vérifié par Prisma. Auth.js sera ajouté et vérifié en phase 3. ESLint 9 respecte les peer dependencies actuelles de la configuration Next ; migration vers ESLint 10 à traiter lorsque les plugins la prennent en charge. Le plugin next-intl utilise l’API SWC WebAssembly via une résolution pnpm explicite, car le cache natif refuse la propriété des répertoires du cloud ; build et types validés sans suppression de contrôle d’intégrité. TypeScript strict, Tailwind et shadcn/ui ; Zod partagé et React Hook Form côté client. Vitest et Playwright. Aucun choix ci-dessus n’est déjà installé.

## 3. Deux directions visuelles à choisir

### A — Atlas contemporain (recommandée)

Ivoire `#F7F4EE`, charbon `#202522`, vert profond `#244B43`, accent bronze `#A97848`. Titres français/anglais : Cormorant Garamond ; corps : Manrope ; arabe : Noto Sans Arabic. Grandes photographies architecturales, grille aérée, titres expressifs, mouvement discret. Le bronze est un accent décoratif ; les textes et boutons doivent respecter les contrastes WCAG AA.

### B — Marrakech minérale

Sable `#F5EEE5`, encre `#25211F`, terre cuite `#974D38`, accent olive `#626548`. Titres : DM Serif Display ; corps : Inter ; arabe : Noto Naskh Arabic avec corps Noto Sans Arabic. Composition plus chaleureuse, détails artisanaux mesurés, galeries immersives. Identité plus locale, moins institutionnelle.

Polices auto-hébergées via next/font. Vérification des licences et contrastes. Pas de reproduction des marques, textes, images ou compositions des sites de référence ; ils servent d’inspiration. Les références n’ont pas été auditées dans cette étape. Hero image prioritaire sur mobile ; vidéo facultative avec poster, lecture silencieuse et respect de `prefers-reduced-motion`.

## 4. Arborescence cible

```text
src/
  app/
    [locale]/(public)/         # pages publiques et layouts localisés
    admin/                   # espace protégé, interface française
    api/auth/[...nextauth]/
    api/leads/ api/newsletter/ api/uploads/ api/cron/outbox/
    sitemap.ts robots.ts
  components/{ui,public,admin}/
  features/{projects,units,leads,content,media,settings}/
  lib/{auth,db,rbac,validation,rate-limit,storage,email,seo}/
  i18n/{routing,request,navigation}.ts
  messages/{fr,en,ar}.json
prisma/{schema.prisma,migrations/,seed.ts}
tests/{unit,integration,e2e}/
public/
docs/{ARCHITECTURE,ROADMAP}.md
CLAUDE.md
.github/workflows/ci.yml
```

Les modules contiennent services, schémas Zod et requêtes. Les accès Prisma et secrets restent côté serveur (`server-only`). Les routes orchestrent les services ; les composants ne portent pas les règles métier.

## 5. Routes et navigation

| Route | Fonction |
| --- | --- |
| `/` | Redirection vers `/fr` |
| `/{locale}` | Accueil : hero, chiffres, projets, valeurs, services, CTA |
| `/{locale}/projets` | Filtres, tri autorisé, pagination ; paramètres dans l’URL |
| `/{locale}/projets/[slug]` | Galerie, vidéo, carte, prestations, livraison, progression, plans, lots, brochure, leads |
| `/{locale}/a-propos`, `/services`, `/presse`, `/contact` | Pages institutionnelles |
| `/{locale}/actualites`, `/actualites/[slug]` | Blog publié et pagination |
| `/{locale}/mentions-legales`, `/confidentialite` | Informations légales validées par le responsable |
| `/admin/connexion` | Connexion équipe |
| `/admin` | Indicateurs commerciaux |
| `/admin/projets`, `/admin/projets/[id]`, `/admin/lots` | Programmes et inventaire |
| `/admin/medias`, `/admin/articles`, `/admin/pages`, `/admin/temoignages` | Contenu et médias |
| `/admin/leads`, `/admin/leads/[id]` | CRM, notes, assignation et export |
| `/admin/utilisateurs`, `/admin/parametres` | Administration réservée aux admins |

`locale` est strictement `fr|en|ar`. Slugs de projet stables communs aux langues en V1, libellés et metadata traduits ; segments institutionnels restent stables pour limiter la complexité. Alternative : chemins entièrement traduits via next-intl, plus naturels mais avec davantage de redirections à maintenir. Arabe : `dir="rtl"`, propriétés CSS logiques, navigation et tableaux testés ; nombres, références et téléphones conservent leur direction appropriée.

## 6. Schéma Prisma proposé

Schéma validé avec `prisma validate` en phase 1 ; migration initiale générée puis enrichie des contraintes CHECK et appliquée à PostgreSQL local. Les contraintes SQL complémentaires sont détaillées après le schéma. Les modèles d’adaptateur Auth.js sont inclus.

```prisma
generator client {
  provider = "prisma-client-js"
  engineType = "client"
}
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
enum Role {
  ADMIN
  EDITOR
  SALES
}
enum Locale {
  fr
  en
  ar
}
enum ProjectStatus {
  IN_PROGRESS
  DELIVERED
  COMING_SOON
  SOLD_OUT
}
enum PropertyType {
  APARTMENT
  VILLA
  STUDIO
  DUPLEX
  COMMERCIAL
  LAND
}
enum UnitStatus {
  AVAILABLE
  RESERVED
  SOLD
}
enum PublicationStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
enum LeadStatus {
  NEW
  CONTACTED
  VISIT
  NEGOTIATION
  WON
  LOST
}
enum MediaType {
  IMAGE
  VIDEO
  DOCUMENT
}
model Organization {
  id String @id @default(cuid())
  name String
  users User[]
  projects Project[]
  units Unit[]
  media Media[]
  leads Lead[]
  notes LeadNote[]
  posts Post[]
  pages Page[]
  testimonials Testimonial[]
  settings Setting[]
  subscribers NewsletterSubscriber[]
  createdAt DateTime @default(now())
}
model User {
  id String @id @default(cuid())
  email String @unique
  name String?
  image String?
  emailVerified DateTime?
  role Role @default(EDITOR)
  active Boolean @default(false)
  organizationId String?
  organization Organization? @relation(fields: [organizationId], references: [id])
  accounts Account[]
  sessions Session[]
  assignedLeads Lead[] @relation("LeadAssignee")
  notes LeadNote[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([organizationId, role])
}
model Account {
  id String @id @default(cuid())
  userId String
  type String
  provider String
  providerAccountId String
  refresh_token String? @db.Text
  access_token String? @db.Text
  expires_at Int?
  token_type String?
  scope String?
  id_token String? @db.Text
  session_state String?
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
  @@index([userId])
}
model Session {
  id String @id @default(cuid())
  sessionToken String @unique
  userId String
  expires DateTime
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}
model VerificationToken {
  identifier String
  token String @unique
  expires DateTime
  @@unique([identifier, token])
}
model Project {
  id String @id @default(cuid())
  organizationId String?
  organization Organization? @relation(fields: [organizationId], references: [id])
  slug String @unique
  status ProjectStatus @default(COMING_SOON)
  publicationStatus PublicationStatus @default(DRAFT)
  city String
  neighborhood String
  lat Decimal? @db.Decimal(10, 7)
  lng Decimal? @db.Decimal(10, 7)
  deliveryDate DateTime?
  priceFrom Decimal? @db.Decimal(14, 2)
  types PropertyType[]
  amenities String[]
  brochureUrl String?
  featured Boolean @default(false)
  progressPercent Int @default(0)
  translations ProjectTranslation[]
  units Unit[]
  media Media[]
  leads Lead[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([city, status])
  @@index([publicationStatus, featured])
  @@index([priceFrom])
  @@index([organizationId])
}
model ProjectTranslation {
  id String @id @default(cuid())
  projectId String
  locale Locale
  title String
  description Json
  seoTitle String?
  seoDescription String?
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  @@unique([projectId, locale])
}
model Unit {
  id String @id @default(cuid())
  organizationId String?
  organization Organization? @relation(fields: [organizationId], references: [id])
  projectId String
  reference String
  type PropertyType
  floor Int?
  surface Decimal @db.Decimal(10, 2)
  bedrooms Int?
  bathrooms Int?
  price Decimal? @db.Decimal(14, 2)
  status UnitStatus @default(AVAILABLE)
  planUrl String?
  project Project @relation(fields: [projectId], references: [id], onDelete: Restrict)
  leads Lead[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@unique([projectId, reference])
  @@index([projectId, status, price])
  @@index([type, bedrooms, surface])
  @@index([price])
  @@index([organizationId])
}
model Media {
  id String @id @default(cuid())
  organizationId String?
  organization Organization? @relation(fields: [organizationId], references: [id])
  projectId String?
  type MediaType
  storageKey String @unique
  url String
  mimeType String
  sizeBytes Int
  width Int?
  height Int?
  order Int @default(0)
  translations MediaTranslation[]
  project Project? @relation(fields: [projectId], references: [id], onDelete: Restrict)
  createdAt DateTime @default(now())
  @@index([projectId, order])
  @@index([organizationId])
}
model MediaTranslation {
  id String @id @default(cuid())
  mediaId String
  locale Locale
  alt String
  media Media @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  @@unique([mediaId, locale])
}
model Lead {
  id String @id @default(cuid())
  organizationId String?
  organization Organization? @relation(fields: [organizationId], references: [id])
  name String
  phone String
  email String?
  subject String
  message String?
  projectId String?
  unitId String?
  source String
  status LeadStatus @default(NEW)
  assignedToId String?
  consent Boolean
  consentAt DateTime
  consentVersion String
  locale Locale @default(fr)
  project Project? @relation(fields: [projectId], references: [id], onDelete: Restrict)
  unit Unit? @relation(fields: [unitId], references: [id], onDelete: Restrict)
  assignedTo User? @relation("LeadAssignee", fields: [assignedToId], references: [id], onDelete: SetNull)
  notes LeadNote[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([status, createdAt])
  @@index([projectId, source])
  @@index([assignedToId, createdAt])
  @@index([unitId])
  @@index([organizationId])
}
model LeadNote {
  id String @id @default(cuid())
  organizationId String?
  organization Organization? @relation(fields: [organizationId], references: [id])
  leadId String
  authorId String
  content String
  lead Lead @relation(fields: [leadId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Restrict)
  createdAt DateTime @default(now())
  @@index([leadId, createdAt])
  @@index([authorId])
  @@index([organizationId])
}
model Post {
  id String @id @default(cuid())
  organizationId String?
  organization Organization? @relation(fields: [organizationId], references: [id])
  slug String @unique
  status PublicationStatus @default(DRAFT)
  publishedAt DateTime?
  cover String?
  translations PostTranslation[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([status, publishedAt])
  @@index([organizationId])
}
model PostTranslation {
  id String @id @default(cuid())
  postId String
  locale Locale
  title String
  excerpt String?
  content Json
  seoTitle String?
  seoDescription String?
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  @@unique([postId, locale])
}
model Page {
  id String @id @default(cuid())
  organizationId String?
  organization Organization? @relation(fields: [organizationId], references: [id])
  slug String @unique
  status PublicationStatus @default(DRAFT)
  translations PageTranslation[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([organizationId])
}
model PageTranslation {
  id String @id @default(cuid())
  pageId String
  locale Locale
  title String
  content Json
  seoTitle String?
  seoDescription String?
  page Page @relation(fields: [pageId], references: [id], onDelete: Cascade)
  @@unique([pageId, locale])
}
model Testimonial {
  id String @id @default(cuid())
  organizationId String?
  organization Organization? @relation(fields: [organizationId], references: [id])
  name String
  published Boolean @default(false)
  order Int @default(0)
  translations TestimonialTranslation[]
  createdAt DateTime @default(now())
  @@index([organizationId, published, order])
}
model TestimonialTranslation {
  id String @id @default(cuid())
  testimonialId String
  locale Locale
  content String
  testimonial Testimonial @relation(fields: [testimonialId], references: [id], onDelete: Cascade)
  @@unique([testimonialId, locale])
}
model Setting {
  id String @id @default(cuid())
  organizationId String?
  organization Organization? @relation(fields: [organizationId], references: [id])
  key String @unique
  value Json
  updatedAt DateTime @updatedAt
  @@index([organizationId])
}
model NewsletterSubscriber {
  id String @id @default(cuid())
  organizationId String?
  organization Organization? @relation(fields: [organizationId], references: [id])
  email String @unique
  locale Locale
  consentAt DateTime
  consentVersion String
  confirmedAt DateTime?
  unsubscribedAt DateTime?
  tokenHash String? @unique
  tokenExpiresAt DateTime?
  createdAt DateTime @default(now())
  @@index([organizationId])
}
model EmailOutbox {
  id String @id @default(cuid())
  kind String
  aggregateId String
  payload Json
  attempts Int @default(0)
  availableAt DateTime @default(now())
  lockedUntil DateTime?
  sentAt DateTime?
  lastError String?
  createdAt DateTime @default(now())
  @@unique([kind, aggregateId])
  @@index([sentAt, availableAt])
}
```

Contraintes complémentaires : SQL CHECK pour prix ≥ 0, surface > 0, progression 0–100 et coordonnées valides. Validation transactionnelle : un lot référencé par un lead appartient au projet indiqué ; même organisation pour les relations et les assignations. Identifiants de villes et prestations contrôlés par référentiels de configuration, traductions via next-intl. `priceFrom` recalculé transactionnellement depuis les lots disponibles ayant un prix ; sans prix connu, afficher « Prix sur demande ». Tous les critères de lot doivent être satisfaits par le même lot dans les filtres.

`organizationId` prépare une évolution, sans promettre une isolation multi-tenant en V1. Les traductions héritent du parent. EmailOutbox et modèles Auth sont techniques. Les slugs/emails/clés restent globalement uniques ; migration vers unicité par organisation et gestion SQL des NULL nécessaire avant ouverture multi-promoteurs. Les suppressions de projets avec leads sont bloquées : archivage préférable. Les paramètres publics ne contiennent jamais de secrets.

## 7. Flux de données

### Lecture publique

URL → schéma Zod de filtres → service catalogue Prisma → résultat paginé → Server Components. Tri sur liste blanche, limite maximale et requêtes paramétrées. Détails publiés uniquement. Filtres ville/quartier/type/statut/budget/chambres/surface ; prix inconnus exclus d’un filtre budget explicite. Pages filtrées : canonical vers le catalogue et noindex pour éviter une explosion d’URLs. Pagination stable avec identifiant comme dernier critère.

ISR pour accueil, projets et articles ; cache du contenu public invalidé après mutations. Disponibilité/prix issus d’une lecture fraîche sur le détail, sans cache de données personnelles. Une demande de visite ne réserve pas un lot. Aucune route admin ou CRM mise en cache publiquement.

### Lead et newsletter

Formulaire → validation Zod serveur et taille maximale → honeypot, rate limit partagé, vérification origine/captcha si activé → consentement explicite non précoché → transaction Lead + EmailOutbox → confirmation accessible. Le numéro de téléphone est requis pour rappel, email requis pour demande de brochure par email. Pas de secret ni de donnée personnelle dans l’URL ou les logs.

Worker cron authentifié → verrouillage atomique des messages prêts → Resend avec clé d’idempotence → état envoyé ou reprise avec backoff et limite d’essais. Pas de notification perdue si Resend est indisponible. Payload minimal ; purge après livraison. Newsletter séparée avec double opt-in, tokens hachés et expirables, désinscription. Un clic WhatsApp ouvre un lien configuré ; il n’est pas comptabilisé comme lead nominatif sans formulaire.

### Administration et médias

Session → chargement utilisateur actif → RBAC serveur → validation → transaction → invalidation du cache public. Contrôles dans chaque service, action et Route Handler, pas seulement dans le middleware.

Upload autorisé → URL signée courte durée avec clé générée côté serveur → R2 privé → validation finale du fichier (signature, MIME, taille, dimensions) → publication vers espace public après acceptation. Rejet SVG/HTML et fichiers exécutables. Upload multiple, ordre transactionnel, nettoyage des fichiers abandonnés. Images optimisées par next/image ; vidéos et PDF distribués séparément. Les plans et brochures de démonstration portent une mention fictive.

## 8. Permissions

| Action | Admin | Éditeur | Commercial |
| --- | --- | --- | --- |
| Projets, lots, médias, articles, pages, témoignages | Oui | Oui | Non |
| Lire et gérer leads, notes, assignation, export CSV | Oui | Non | Oui |
| Dashboard commercial | Oui | Non | Oui |
| Utilisateurs, rôles, paramètres globaux | Oui | Non | Non |

Proposition : les commerciaux voient tous les leads de l’équipe ; alternative : uniquement leurs leads et les non assignés, plus confidentiel mais demande des règles de réassignation. Refus par défaut, aucun compte public auto-activé. Invitations par admin, première activation administrateur via commande explicite ; le seed ne crée pas de mot de passe connu. Désactivation et changement de rôle pris en compte à chaque accès. Exports CSV neutralisent les formules tableur et restent hors cache.

## 9. SEO, performance, accessibilité et sécurité

Metadata par langue et page, canonical, alternates hreflang `fr/en/ar` et `x-default`, sitemap des contenus publiés, robots excluant admin et API. JSON-LD Organization et RealEstateListing avec champs réellement disponibles ; pas de promesse de rich result Google. Brouillons et traductions non publiées exclus du sitemap. Publication exige les champs localisés nécessaires ; aucune page arabe remplie silencieusement de français.

Objectif Lighthouse > 90 pour performance, accessibilité, bonnes pratiques et SEO sur accueil/catalogue/détail, mobile, build production, médiane de trois runs. Ce seuil est un critère à mesurer, pas un résultat acquis. Images AVIF/WebP, tailles responsive, chargement différé sauf hero, budgets JS et import différé de la carte. Pagination côté serveur, index et analyse des requêtes avant optimisation avancée. Contrôles clavier, labels, focus visibles, erreurs annoncées, tableaux lisibles sur mobile, animations réduites.

Headers CSP à concevoir pour Next.js et les domaines médias/cartes/captcha, HSTS en HTTPS, nosniff, referrer-policy et frame-ancestors. CSP d’abord vérifiée sans compromettre ISR ; alternative nonce par requête implique davantage de rendu dynamique. Auth CSRF, vérification des origines des mutations, limitation des exports et tailles de requêtes. Validation des URLs et rendu riche autorisé pour limiter SSRF/XSS. Journaux structurés sans données personnelles, alertes erreurs et sauvegardes PostgreSQL avec essai de restauration.

Loi marocaine 09-08 : consentement horodaté/versionné, finalités distinctes rappel/newsletter, minimisation, procédure d’accès/rectification/suppression et rétention configurable. Proposition de purge/anonymisation après 12 mois d’inactivité, durée à valider par le responsable. CNDP, formalités et transferts internationaux (Vercel, Neon, R2, Resend) à examiner avec le responsable juridique avant mise en production ; ce document ne constitue pas une validation juridique. Pas d’analytics non essentiels avant décision de consentement.

## 10. Environnements et configuration future

Local/cloud de développement : PostgreSQL isolé, données fictives, emails et stockage de développement. Préproduction distincte de production. CI : base PostgreSQL temporaire et stockage/email mockés pour tests déterministes, puis smoke test d’intégration des services réels en préproduction. Migrations `migrate deploy` dans un job contrôlé, jamais à chaque requête Vercel.

Variables futures : DATABASE_URL, DIRECT_DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_ID/SECRET si Google retenu, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, MEDIA_PUBLIC_URL, RESEND_API_KEY, EMAIL_FROM, LEAD_NOTIFICATION_EMAIL, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_WHATSAPP_NUMBER, REDIS_REST_URL/TOKEN, CRON_SECRET et clés Turnstile si activé. Secrets uniquement en gestionnaire sécurisé, pas dans les documents ou le seed. Vérifier bindings existants et présence sans afficher les valeurs avant toute demande.

Destinations réseau : registre npm, hébergement GitHub, hôte PostgreSQL choisi, API Resend, endpoint R2, fournisseur Redis et tuiles cartographiques retenu. Liste précise après choix des fournisseurs ; aucune modification réseau ou déclaration de secrets à ce stade. Phase 1 : scripts/setup-dev.sh installe les dépendances à lockfile figé, préserve la configuration existante, démarre PostgreSQL local, applique les migrations et ajoute le seed. Cette séquence a été réexécutée avec succès. Les instructions cloud référencent le checkout existant, sans nouveau worktree ; leur publication et la restauration dans une nouvelle tâche restent des opérations distinctes de la validation de cette instance.

## 11. Points de validation

1. Direction visuelle A ou B ; nom de marque et logo disponibles ou identité provisoire ?
2. Équipe sur Google Workspace/Google (Auth.js recommandé), ou besoin de connexion email/mot de passe (Better Auth) ?
3. Acceptez-vous Vercel + Neon + R2 + Resend et Redis, ou disposez-vous déjà de comptes/fournisseurs imposés ? Ne transmettre aucun secret en chat.
4. Visibilité commerciale : tous les leads de l’équipe ou uniquement les leads assignés/non assignés ?
5. Afficher les prix exacts par lot, uniquement les prix « à partir de », ou les masquer sur demande ?

Les textes légaux définitifs, domaine, coordonnées, contenus réels et autorisations de médias seront nécessaires avant production, sans empêcher le développement sur données fictives. Les options recommandées sont des propositions explicites en attente de validation.
