# Decisions log (SmartAir)

## 2026-02-22 — Oddelenie kontextu SmartAir vs MENUMAT
**Decision:** V SmartAir repozitári sa udržiavajú iba SmartAir inštrukcie; MENUMAT pravidlá sem nepatria.

**Why:**
- predchádza sa miešaniu dvoch rôznych projektov
- znižuje sa riziko chybných zmien v nesprávnom repozitári

**Consequence:**
- pred každou zmenou sa overí, že task je pre SmartAir
- MENUMAT workflow sa rieši iba v MENUMAT repo

## 2026-02-22 — Explicitný merge súhlas
**Decision:** Oficiálna fráza pre owner schválenie merge je **"Merge approved"**.

**Why:**
- jednoznačný auditný signál, že merge je povolený

**Consequence:**
- bez tejto frázy sa merge nepovažuje za schválený
