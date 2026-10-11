# Project instructions

## Scope and stack

Moroccan new-property platform, Marrakech first. Next.js App Router, React, strict TypeScript, Tailwind CSS, shadcn/ui-compatible components, PostgreSQL and Prisma. next-intl: French default, English, Arabic with RTL. Auth.js/Google, R2, Resend and distributed rate limiting are planned integrations, not yet implemented. Vitest and Playwright validate each phase.

## Working agreement

- Follow docs/ARCHITECTURE.md and docs/ROADMAP.md. Deliver one phase at a time, then stop for user approval.
- Keep interface copy in French and supply English/Arabic messages for public pages. Code, identifiers and comments are English.
- Explain ambiguous decisions and their alternatives before implementing dependent work.
- Use Conventional Commits. Run lint, typecheck and meaningful tests before each phase commit. Report actual results and limitations.
- Use the existing isolated checkout; do not create Git worktrees unless requested.
- During environment-only setup, preserve tracked application files and lockfiles. Application changes require the coding task's authorization.

## Conventions

- Server Components by default; client components only for interactions.
- Keep Prisma and secrets in server-only modules. Features own services and validation; routes only orchestrate.
- Use Zod at all server trust boundaries. Validate permissions in services/actions/handlers, not only middleware.
- Never cache sessions, leads or other personal data publicly. Never log credentials or lead payloads.
- Use Decimal for MAD and m². Store dates in UTC; display in Africa/Casablanca.
- Use logical CSS properties and localized number formatting. Document accessibility and RTL behavior.
- No unvalidated HTML. Rich content will use an allowlisted structured renderer.
- organizationId is future-proofing, not completed tenant isolation.

## Commands

Node is pinned in .node-version/.nvmrc; pnpm is pinned in package.json. Run from the repository root.

- `bash scripts/setup-dev.sh`: install from frozen lockfile, initialize local development configuration when absent, start PostgreSQL, apply migrations and seed.
- `pnpm dev`: development server.
- `pnpm db:up` / `pnpm db:down`: start/stop the project's local PostgreSQL container without deleting its volume.
- `pnpm db:generate` / `pnpm db:validate` / `pnpm db:migrate`: Prisma client, validation and migration deployment.
- `pnpm db:seed`: additive, idempotent fictitious data; requires explicit ALLOW_DEMO_SEED=true and an allowlisted non-production database name.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`: lint, TypeScript, unit suite.
- `pnpm test:integration`: database constraints and seed repeatability against the configured demo/test database.
- `pnpm build`, `pnpm test:e2e`: production build and browser smoke tests; PostgreSQL must be running and seeded.
- `pnpm start`: production server after building.

## Data and configuration

- Never commit .env files, keys, database dumps or real customer data. .env.example contains placeholders only.
- Local scripts generate a random development database password; never overwrite an existing .env.
- Seed uses stable identifiers and only inserts missing records. Never reset or delete a user's database during setup.
- Schema changes need a reviewed migration. Production uses migrate deploy, never db push/reset.
- SQL constraints complement application validation; test both acceptance and rejection.
- Cloud credentials must be supplied through secure environment settings after checking existing bindings. Never ask for secret values in chat.
