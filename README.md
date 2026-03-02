# SmartAir

Minimal FastAPI backend with deployment scripts and tests.

## Run locally (Windows)

- Install deps: `python -m pip install -r requirements.txt`
- Start API: `python -m uvicorn app.main:app --reload --port 8000`
- Run tests: `python -m pytest -q`

## VS Code helpers

- Tasks: "Tests: Pytest (C:)" and "API: Start (uvicorn, C:)"
- Debug: "API: Debug (uvicorn, C:)" launch config

## Deployment (VPS)

- See `deploy/README.md` and `deploy/vps_bootstrap.sh`
- Nginx proxies `api.smartair.space`; static files under `/var/www/smartair` for `images.smartair.space`

## Notes

- Config uses env-first, with `config.json` as fallback (expands ${VARS})
- Line endings: `.gitattributes` enforces LF for shell scripts

## Product specification

- Bolt master prompt (final implementation target):
  `docs/bolt-master-prompt.md`

- Product import CSV (prices all-in, app computes device price as Variant Price - 350):
  `data/dreamair-product-import.csv`

- Detailed Slovak specification for the AC sales configurator:
  `docs/podrobna-specifikacia-konfiguratora-sk.md`

- Unified Lovable prompt for Webflow embed + app-like configurator:
  `docs/lovable-unified-master-prompt.md`

- Architecture proposal (Webflow + Lovable app + Supabase + Cal.com + Make + Notion + CRM):
  `docs/architektura-webflow-lovable-stack-sk.md`

- Commercial brand naming used in specs: **Dream Air (customer configurator)**

- Mockup approval checklist for all 12 configurator steps:
  `docs/mockupy-12-krokov-na-odsuhlasenie.md`

- ZIP export helper (download package preparation):
  `scripts/export_lovable_package.sh` (creates `dist/dream-air-bolt-package.zip`)


- Dreamairko (Drímerko) AI guide widget with voice-assisted guided Q&A lives in:
  `frontend/widget/smartesko-widget.js`

