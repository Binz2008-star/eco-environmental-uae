# ECO Collect — hosted app
Arabic renovation-waste enquiry and coordination platform for Dubai.

Stack: Vinext + React + Cloudflare Worker + existing Neon PostgreSQL.
Authentication: managed Sign in with ChatGPT. Customer accounts are keyed by authenticated user ID. Operator access is checked server-side against ADMIN_EMAILS.

## Checks
```
npm install
node --experimental-strip-types --test tests/rules.test.ts
npx tsc --noEmit
npm run build
```

Use the Sites workflow to deploy with the tracked .openai/hosting.json identity. Runtime DATABASE_URL and ADMIN_EMAILS must be set as secrets in hosting. Never commit runtime secrets. Schema migrations are under migrations/; 001 is already applied to eco_collect in the existing eco-technology-leads database. See ../../AI_WORKSPACE/eco-collect/HOSTED_STATUS.md for deployment boundaries and untested scope.
