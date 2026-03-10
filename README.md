# DreamAir

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
- Nginx proxies `api.dreamair.space`; static files under `/var/www/dreamair` for `images.dreamair.space`

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


## GitHub sync všetkých repozitárov

Ak chceš lokálne načítať/synchronizovať všetky repozitáre z jedného GitHub účtu alebo organizácie:

```bash
export GITHUB_TOKEN=ghp_xxx
python3 scripts/sync_all_github_repos.py --owner <github-login-alebo-org>
```

Voliteľné parametre:
- `--target-dir ../github-repos` (predvolený cieľ)
- `--protocol ssh` (ak používaš SSH kľúče)
- `--include-archived` (zahrnie aj archivované repozitáre)

Skript pre existujúce lokálne repozitáre urobí `git fetch --all --prune`, pre chýbajúce urobí `git clone`.

## Kde nainštalovať `gh` CLI (DreamAir)

`gh` inštaluj v **tom prostredí, kde reálne pracuješ s Git repozitárom `dreamair-web`**:

- **Lokálne PC (odporúčané):** Windows/macOS/Linux terminál, kde robíš `git pull/push`.
- **VPS/Server:** iba ak tam priamo riešiš GitHub release/issue/PR workflow.
- **VS Code Dev Container / WSL:** ak používaš terminál tam, inštaluj tam.

Rýchla kontrola po inštalácii:

```bash
gh --version
gh auth login
gh repo list
```


## Windows mirror pre dizajny a scrape dáta

- Návod + príkazy bez admin práv: `docs/windows-zrkadlenie-assets.md`
- Skript: `scripts/windows/sync_project_assets_to_desktop.ps1`

