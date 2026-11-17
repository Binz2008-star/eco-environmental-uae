# ECO Collect — product and architecture
Date: 2026-11-17. Owner: Roben. Local development foundation.

## Product
Coordinate non-hazardous renovation waste collection in Dubai, initially for repeat fit-out contractors. An operator reviews scope and manually confirms provider, price and schedule. Submission is an enquiry, never a confirmed booking.

## ADR-001: small monolith
Python 3.12 + Flask + server-rendered Jinja + SQLite for local evaluation. One deployable unit reduces frontend/backend authentication and deployment complexity. Arabic RTL mobile layouts without a JS build toolchain. Adopt PostgreSQL and schema migrations before multi-instance production. No performance claims.

## Implemented
Customer name, UAE mobile, Dubai site text, category, preferred date, notes and contact consent. Durable requests with a 256-bit secret tracking URL showing only status/date. Password-protected operator sessions, CSRF checks, parameterized SQL, HTML autoescaping, response security headers.
State machine: new → reviewing → quoted → scheduled → completed. Cancellation before completion; quoted may return to reviewing. Atomic status audit trail. Admin shows last 100 requests.

## Data
requests: contact/site details and state. events: old/new state and timestamp. Shared admin role, not individual staff attribution. Tracking URLs are secrets: redact access logs and avoid analytics. Contact consent does not trigger any external message. Data minimization and retention policy must be finalized before collecting real data.

## Next milestones
1. Verify business scope, carrier eligibility and commercial terms; define privacy, retention, cancellation and quotation policy.
2. Production: individual OIDC/MFA and roles, app/edge login and submission rate limits, managed PostgreSQL migrations, admin pagination, backup/restore tests, HTTPS + secure cookies, production WSGI server, PII-redacted monitoring and secret management. Shared password is local scaffolding only.
3. Provider records with eligibility expiry, quote in integer fils, expiry/customer acceptance, dispatch allocation and proof of service.
4. Private photo uploads: object storage, presigned URLs, size/MIME checks, malware checks and retention.
5. Notifications and payments after business setup, with outbox delivery and idempotent webhooks.

## Release and rollback
Do not expose the development server or collect real customer data yet. No deployment performed. Back up and test restoring database before future releases; establish schema compatibility before code rollback. No destructive rollback migrations.

## Not implemented
Photos, payment, automatic quotes, customer accounts, provider portal, live tracking, notifications or hosted deployment. Desired date is not a confirmed appointment. No claim of licensed partners or guaranteed service.

## Verification
Tests cover persistence, tracking privacy, admin authorization, CSRF, invalid inputs, state transitions, audit transactions, HTML escaping, login/logout and secrets. See VERIFICATION.md. Browser/device, load, penetration and external integration testing remain outstanding.
