# ECO Collect
Arabic-first Dubai renovation waste coordination pilot. Development scaffold, not a live service.

## Local run — Python 3.12
Run the commands from `apps/eco-collect`.
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.lock
export SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')"
read -rs -p 'Admin password (16+ characters): ' ADMIN_PASSWORD
export ADMIN_PASSWORD
flask --app app run --host 127.0.0.1
```
Open http://127.0.0.1:5000 ; admin: `/admin`. Database: `instance/eco.sqlite3`.
Keep SECRET_KEY stable between restarts. `.env.example` documents settings; it is not loaded automatically.

## Verify
```bash
python -m unittest discover -s tests -v
python -m compileall -q app tests
```

## Layout
- app/: application factory, validation, SQLite, status transitions.
- app/templates/: Arabic RTL customer and admin pages.
- app/static/: responsive styles, no external scripts or trackers.
- tests/: isolated database integration tests.
- ../../AI_WORKSPACE/eco-collect/: canonical architecture, scope and verification.
- .github/workflows/: CI checks.

See [project plan](../../AI_WORKSPACE/eco-collect/PLAN.md). Added on a feature branch in the existing eco-environmental-uae repository. No live deployment performed. Never commit credentials or customer databases.
