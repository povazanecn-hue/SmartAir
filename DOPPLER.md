# 🔑 DOPPLER – Správa tajomstiev (DreamAir)

> Tento projekt používa [Doppler](https://doppler.com) na centrálnu správu
> environment premenných. Kľúče sa NIKDY neukladajú priamo do repozitára.

## Prvotné nastavenie (raz na každom PC)

```bash
# 1. Inštalácia Doppler CLI
npm install -g @doppler/cli

# 2. Prihlásenie
doppler login

# 3. Prepojenie s týmto projektom (spustiť v root priečinku dreamair-web)
doppler setup
# → vyberte projekt: dreamair
# → vyberte config: dev
```

## Každodenné použitie

```bash
# Spustenie projektu
doppler run -- npm run dev

# Zobraziť aktuálne kľúče
doppler secrets

# Stiahnuť ako .env (ak je potrebný)
doppler secrets download --no-file --format env > .env
```

## Doppler projekt

| Doppler projekt | GitHub repo | Popis |
|---|---|---|
| `dreamair` | dreamair-web | DreamAir web + Cloudflare Workers |

## Pre AI asistentov

Keď spúšťaš príkazy v tomto projekte, VŽDY prefix-uj s `doppler run --`.
Nikdy nevytváraj ani nenavrhuj .env súbor s reálnymi hodnotami.

## GitHub Actions / Codex

Kľúče sú synchronizované z Doppler → GitHub Secrets automaticky
(cez Doppler GitHub Sync integration v dashboard).
