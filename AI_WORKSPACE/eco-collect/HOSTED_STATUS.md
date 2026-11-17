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

## Patch review — 2026-11-17
Applied the supplied eco-collect-integration-harness.patch (85,828 bytes) with git am against 1aa2e311f7310f6a5c4addbbd78d94b673cdbef4. It changes six files and contains no wheel artifacts. Semantic comparison of package-lock.json found 63 added package paths, zero removed paths, and one existing version update: @types/estree 1.0.9 to 1.0.10. Most apparent deletions in the textual diff are reordered entries.

Malformed JSON and non-object bodies now return 400. Follow-up review removed raw exception names/messages from structured logging because dependency errors can contain credentials or personal data; a regression test checks the fixed log payload. Integration tests now run in GitHub Actions. Local npm ci, four original tests, the supplied 17 integration tests, TypeScript and production build passed. These tests use embedded PGlite PostgreSQL with mocked identity and a Neon-compatible SQL adapter, not live Neon or platform authentication.

Lint remains failing: seven errors and two warnings, including two explicit-any errors in the new test harness and five existing errors in client.tsx/layout.tsx. This is a development-branch update, not launch approval. No merge, deployment, Neon operation or access-setting change was performed. Live authentication, mobile/browser flows, concurrent request behavior and load remain unverified. The isolation test covers cross-user reading and cancellation but does not actually attempt cross-user quote acceptance despite its title; expand that case before launch. Existing stale quote display, non-JSON client responses and rate-limit retention remain follow-ups.

## Client and lint patch review — 2026-11-18
Applied eco-collect-lint-client-fix.patch from eco-dev (source commit 539a9e6) on 7df09e3. Changes are limited to client response handling and types, initial Orders loading, home-page Link elements, test harness types, and a CI lint gate. No dependency or migration changes.

Verified locally: four rule tests, 18 PGlite integration tests, TypeScript and production build passed. Lint now reports zero errors and one warning for Booking's existing window.location.assign navigation. Four isolated checks of the actual call() function passed: HTML responses with 200 and 502 return the generic Arabic error, a JSON API error preserves its message, and a successful JSON response is returned. These checks do not validate React rendering or browser navigation. Browser/mobile and live managed-authentication workflows remain untested; no deployment, merge, Neon change or public-access change was performed.

## Rate-limit retention and withdrawn quotes — 2026-11-18
Applied eco-dev patch 96fe403 on 035667c. Each authorized write now deletes only that user's rate-limit buckets strictly older than current bucket minus 10, in the same SQL statement as the counter upsert. No schema migration or cron is introduced. The current bucket is not deleted; the existing 20-writes-per-minute test still passes. Under ordinary monotonic timestamps, cleanup retains at most 11 minute buckets per active user. Inactive users' rows remain, so total storage can still grow with distinct users. Concurrent Workers/Neon behavior and runtime DELETE permission are not newly verified by embedded PGlite tests. Deployment will introduce database deletions of expired counters; no live deletion has been performed during this review.

Customer request reads now mask quote amount and notes in new/reviewing states; stored quote data and the admin endpoint are unchanged. The new test verifies old amount hiding and the replacement amount after re-quoting. Validation: four rule tests and 20 PGlite integration tests passed, TypeScript and production build passed, lint has zero errors and one existing navigation warning. No dependency changes, merge, deployment or Neon operation. Live browser/mobile acceptance testing remains pending.
