# Windows: zrkadlenie designov a scrape dát na plochu (bez admin práv)

Tento návod pripraví jednotnú štruktúru pre DreamAir projekt a zrkadlí ju na plochu cez `robocopy /MIR`.

## Čo sa triedi

Skript `scripts/windows/sync_project_assets_to_desktop.ps1` zoberie súbory z repo a roztriedi ich do:

- `designs/figma-html` (napr. `frontend/figma/*`)
- `designs/screenshots` (napr. `output/playwright/*`)
- `designs/docs` (mockupy/dizajn markdown)
- `scraping/catalog-csv` (napr. `data/*.csv`)
- `scraping/firecrawl` (cesty s `firecrawl/scrape/scraping`)
- `other/unclassified`

Staging je v repozitári: `workspace-assets/staging/<repo>/...`

Desktop mirror je predvolene: `%USERPROFILE%\Desktop\DreamAir-Workspace-Mirror\<repo>\...`

## Príkazy pre Windows (PowerShell)

### 1) Suchý beh (len náhľad)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\sync_project_assets_to_desktop.ps1 -WhatIf
```

### 2) Reálne triedenie + mirror na plochu

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\sync_project_assets_to_desktop.ps1
```

### 3) Aj pre susedné git repozitáre (v rovnakom parent priečinku)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\sync_project_assets_to_desktop.ps1 -IncludeSiblingRepos
```

## Firecrawl workflow (aby sa všetko ukladalo aj na Desktop mirror)

1. Ulož Firecrawl exporty do projektu pod:
   - `output/firecrawl/`
   - alebo `data/firecrawl/`
2. Spusť mirror skript (príkaz vyššie).
3. Výsledok sa automaticky objaví na ploche v:
   - `DreamAir-Workspace-Mirror/<repo>/scraping/firecrawl/...`

### Odporúčaný naming pre exporty

- `output/firecrawl/<yyyy-mm-dd>/pages.json`
- `output/firecrawl/<yyyy-mm-dd>/images/`
- `output/firecrawl/<yyyy-mm-dd>/products.csv`

Takto budú CSV, obrázky a scrape JSONy ľahko dohľadateľné aj pre AI nástroje.
