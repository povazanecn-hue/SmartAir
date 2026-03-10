# CLAUDE.md – DreamAir Web Project

> Tento súbor je určený pre AI asistentov (Claude, Copilot, Cursor, Codex).
> Prečítaj ho celý pred akoukoľvek zmenou v repozitári.

## 🏢 O projekte

**DreamAir** je webová prezentácia a backend pre firmu DreamAir s.r.o. (Bratislava, SK).
Firma predáva, montuje a servisuje klimatizácie (DAIKIN, Samsung, TCL, Midea).

- **Web:** Webflow CMS (frontend) + Cloudflare Workers (API backend)
- **Jazyk:** Slovenčina (SK) – všetok obsah webu je po slovensky
- **Majiteľ:** Mgr. Norbert Považanec (DreamAir s.r.o., Bratislava)

## 🏗️ Architektúra

```
Webflow CMS (frontend/obsah)
    ↕ Webflow API
Cloudflare Workers (API layer)
    ↕ GitHub Actions (CI/CD deploy)
GitHub repo: dreamair-web
```

## 📁 Štruktúra repozitára

```
/app          – FastAPI Python backend (legacy, momentálne neaktívny)
/deploy       – deployment skripty pre VPS/Cloudflare
/workers      – Cloudflare Workers kód (aktívny)
/.github      – GitHub Actions CI/CD workflow
```

## ⚙️ Technológie

- Cloudflare Workers (JavaScript/TypeScript)
- Python FastAPI (legacy backend)
- GitHub Actions pre auto-deploy
- Webflow CMS API integrácia

## 🔑 Premenné prostredia – Doppler

Projekt používa **Doppler** na centrálnu správu API kľúčov.
Pozri `DOPPLER.md` pre návod.

```bash
# Spustenie projektu
doppler run -- npm run dev

# Prvé nastavenie
doppler setup   # vyberte projekt: dreamair
```

NIKDY necommituj `.env`! Pozri `.env.example` pre zoznam premenných.

## 🚦 Pravidlá pre AI asistentov

### ✅ Povolené
- Upravovať kód v `/workers` a `/deploy`
- Opravovať chyby, pridávať features podľa zadania
- Aktualizovať dokumentáciu

### ❌ ZAKÁZANÉ
- Commitovať `.env`, API kľúče, tokeny, heslá
- Meniť `main` branch priamo – vždy cez PR
- Mazať existujúce workflow súbory bez potvrdenia
- Pridávať nové npm/pip závislosti bez schválenia majiteľom
- Ukladať MENUMAT artefakty (mockupy, audity, snapshoty, dokumenty) do tohto repozitára

### 🚧 Hard stop: MENUMAT vs DreamAir

- Tento repozitár je striktne pre DreamAir (`dreamair-web`).
- Ak úloha patrí do MENUMAT, práce sa majú vykonať iba v MENUMAT repozitári.
- Pri pochybnosti vždy najprv over názov repozitára/branch pred úpravami.

## 📝 Konvencie

- Commit správy: `feat:`, `fix:`, `docs:`, `refactor:` (Conventional Commits)
- Jazyk kódu: angličtina
- Jazyk komentárov a dokumentácie: slovenčina
- Branch naming: `feature/nazov`, `fix/nazov`, `docs/nazov`

## 🔄 Changelog pre AI

- **2026-02-23** – Projekt premenovaný SmartAir → DreamAir (dreamair-web)
- **2026-02-23** – Pridaný Doppler systém správy kľúčov
- **2026-02-23** – Pridaný `.env` do `.gitignore` (security fix)
- **2026-02-23** – Vytvorené AI context súbory (CLAUDE.md, .cursorrules, copilot-instructions)

## 🤝 Súvisiace projekty

- `menumat-ecb44ba0` – MENUMAT aplikácia (reštauračný menu systém)
- `MENUGENERATOR` – experimentálny menu generátor
- Majiteľ prevádzkuje aj firmu SmartAir s.r.o. (samostatná)
