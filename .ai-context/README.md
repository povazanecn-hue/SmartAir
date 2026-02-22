# AI Sync Context (SmartAir)

Tento `.ai-context/` platí **iba pre repo `povazanecn-hue/SmartAir`**.

## Dôležité oddelenie projektov
- `SmartAir` a `MENUMAT` sú rozdielne projekty.
- MENUMAT workflow, rozhodnutia a naming sa nesmú zapisovať do SmartAir kontextu.
- Ak je úloha o MENUMAT, pracuje sa v MENUMAT repozitári (nie tu).

## Session workflow (SmartAir)
1. Session štart: prečítaj `current-sprint.md`.
2. Počas práce: zmeny cez branch + PR.
3. Session koniec: aktualizuj `current-sprint.md` (+ podľa potreby `architecture.md`, `decisions.md`, `KNOWN_ISSUES.md`).

## Merge approval phrase
- Štandardná explicitná fráza vlastníka pre merge: **"Merge approved"**.
- Bez tejto frázy (v PR review/komentári alebo v chate pre konkrétny PR) sa merge nepovažuje za schválený.
