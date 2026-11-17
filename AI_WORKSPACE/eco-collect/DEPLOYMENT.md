# Hosted deployment — 17 November 2026

Live owner-private URL: https://eco-collect-uae.robenedwan.chatgpt.site

Hosted source commit: c1b76e5446fc3cc70bcb96005c4cc1407920fc6e.
Deployment succeeded: appgdep_6afc570b5da88191862b409f2de9f05a, environment revision 1.

New hosted source is in apps/eco-collect-web. Existing Python prototype remains in apps/eco-collect as historical scaffolding. Existing company marketing site was not changed.

Neon existing project eco-technology-leads, database neondb, schema eco_collect, scoped runtime role eco_collect_app. Verified eco_collect schema usage=true and public.leads SELECT=false. Administrator is the verified platform identity robenedwan@gmail.com via runtime allowlist. No secrets are stored in this repository.

Passed: 4 TypeScript rule tests, TypeScript compilation, production build and desktop landing visual inspection. Browser reached the live platform sign-in gate; authenticated multi-user flow remains untested. Access is owner-private, not public launch. Images, payment collection, carrier portal and automated notifications are not implemented.
