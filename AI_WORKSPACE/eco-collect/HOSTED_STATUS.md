# ECO Collect hosted application — 2026-11-17

## Architecture decision
The original Flask/SQLite prototype remains in apps/eco-collect on GitHub. This hosted version uses Vinext/React on Cloudflare Workers with Neon PostgreSQL via the HTTP driver. It retains the business workflow but replaces shared-password administration with platform-managed ChatGPT sign-in and per-user ownership. No application passwords are stored.

Neon existing project: eco-technology-leads (square-hill-70076734), main branch br-delicate-pine-amtlcw03, database neondb. Only the new eco_collect schema is used; existing public tables remain untouched. Runtime role eco_collect_app has read_write scope on eco_collect; verified it cannot SELECT public.leads. DATABASE_URL and ADMIN_EMAILS are configured as runtime secrets. No D1 database is used.

## Implemented
Arabic responsive landing page, signed-in account/contact profile, new service requests, private customer dashboard, quote acceptance and pre-acceptance cancellation, operator quote and schedule controls, audit events, privacy/terms pages. Server authorization uses the platform-injected identity, ownership predicates on every customer request query and update, admin email allowlist, same-origin write checks and per-minute database rate limits. Updates use compare-and-set and atomic audit CTEs. Amounts use integer fils. No online payment, automatic provider assignment, uploads or external notifications.

## Validation
Four business-rule tests passed; TypeScript and production build checks are run before packaging. Desktop landing page visually reviewed. Live Neon schema access and isolation verified. Full two-user browser workflow, mobile device QA, load tests and restore drills are not yet verified. Deployment access starts owner-private; public audience must be explicitly selected by the owner.

## Operations
Runtime secrets: DATABASE_URL (limited role), ADMIN_EMAILS (comma-separated verified identity emails). Migration 001 was applied once to the new schema in the existing database; do not reapply. Account user_id comes exclusively from authenticated platform headers. Never deploy this behind infrastructure that accepts user-forged identity headers. Rollback by deploying a prior saved Site version; do not drop the database or reset the existing Neon project. Back up the eco_collect schema before future migrations.

## Remaining limitations
Public access and complete authenticated user acceptance testing remain before customer launch. No provider portal, payment gateway, image uploads or email/SMS delivery. Dashboard has explicit display limits of 100 customer / 200 operator requests. Rate-limit row retention needs an operational cleanup policy before sustained usage. Retention and provider eligibility require business review.
