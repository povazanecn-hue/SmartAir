# Dream Air – Odporúčaná architektúra (Webflow + Lovable app + automatizácie)

Tento dokument je rozhodovací návrh pre finálnu implementáciu, aby sme vedeli pokračovať konzistentne s doterajším dizajnom a smerovaním projektu.

## 1) Cieľová topológia (high-level)

1. **Webflow (marketing + obsah + eCommerce prezentačná vrstva)**
   - landing, kategórie, blog, SEO, brand stránky,
   - embed konfigurátora cez iframe (`?embed=1`).
2. **Lovable app (core konfigurátor predaja)**
   - 12-krokový konfigurátor,
   - Dreamairko AI sprievodca,
   - cenotvorba zariadenie vs. montáž,
   - porovnanie modelov, CP, booking flow.
3. **Supabase (operatívny backend)**
   - primárna databáza (produkty, varianty, leady, CP, bookingy, stavy),
   - auth, row-level security, storage metadata,
   - edge functions / cron pre server-side logiku.
4. **Cal.com (kalendár rezervácií)**
   - výber termínu montáže,
   - potvrdenie termínu,
   - webhook notifikácie do Make scenárov.
5. **Make (automatizácie a orchestrácia procesov)**
   - quote created, booking confirmed, payment status, invoice issued,
   - routing do CRM, email/SMS, interné tasky.
6. **Cloudinary (asset pipeline)**
   - produktové foto + transformácie,
   - optimalizácia výkonu (responsive variants, webp/avif).
7. **Airtable (editor + import workspace)**
   - CSV staging, ručná editácia rows, QA pred publikovaním,
   - nie je source-of-truth pre transakčné dáta (tým je Supabase).
8. **ElevenLabs (voice)**
   - prémiový voice režim pre Dreamairko,
   - fallback: browser speech API.
9. **Notion (knowledge + interné procesy)**
   - centrálna knowledge base (FAQ, montážne pravidlá, servisné postupy),
   - interný operačný dashboard (stavy leadov, checklisty, SOP),
   - synchronizácia dôležitých udalostí z Make (logy, handoff poznámky).

---

## 2) CRM rozhodnutie do budúcna (čo je „naj“)

### Odporúčanie: **HubSpot CRM** ako cieľový CRM systém

Prečo:
- robustný pipeline management pre lead → CP → deal → realizácia,
- výborné API/webhooky a široká integrácia (Webflow, Make, Cal.com, Stripe ekosystém),
- škálovanie od SMB po enterprise bez migrácie jadra,
- reporting a obchodné dashboardy bez potreby custom BI v prvej fáze.

### Alternatíva pre nižší rozpočet: **Pipedrive**
- jednoduchší onboarding,
- slabšia natívna marketing automation vrstva oproti HubSpotu.

### Prečo nie „len Airtable“ ako CRM
- Airtable je skvelý na staging/import/editáciu katalógu,
- ale pre dlhodobý obchodný proces, SLA, históriu komunikácie a robustnú pipeline je CRM vhodnejšie.

**Záver CRM:**
- **Core transakcie:** Supabase
- **Obchodné riadenie:** HubSpot
- **Automatizácie medzi nimi:** Make

---

## 3) Source-of-truth a synchronizácia

- **Produkty/varianty (runtime):** Supabase
- **CSV staging a manuálne úpravy:** Airtable
- **Média:** Cloudinary
- **Marketingové texty/stránky:** Webflow CMS
- **Leady/Deals/obchodné statusy:** HubSpot
- **Interné know-how a SOP:** Notion

### Publikačný tok katalógu
1. CSV import do Airtable (staging).
2. QA a editácia rows (názvy, parametre, cena split, mapovanie foto).
3. Make validácia + enrich + sync do Supabase.
4. App číta produkty zo Supabase API.
5. Webflow zobrazuje marketingové karty (nepredstavuje jediný zdroj pravdy pre konfigurátor).

---

## 4) Cenotvorba a fakturácia (odporúčaný model)

- `variant_price_all_in` = aktuálna cena vrátane štandardnej montáže 350 € s DPH.
- `device_price_eur = max(0, variant_price_all_in - 350)`.
- Montáž nad štandard = **orientačný odhad** z dotazníka (do technického potvrdenia).

### Fakturačná logika
- automatická faktúra primárne na zariadenie (po úhrade),
- montážne nadpráce po potvrdení technikom (samostatný doklad/finálne vyúčtovanie).

---

## 5) Návrh fáz implementácie (Lovable zadanie)

### Fáza 1 – Foundation
- design system tokeny + embed shell + i18n SK,
- Supabase schema + základné API,
- import CSV pipeline (Airtable staging -> Supabase).

### Fáza 2 – Konfigurátor jadro
- kroky 1–9 (katalóg, filter, porovnanie, CP),
- pricing engine (device vs. install split),
- PDF ponuka + email odoslanie.

### Fáza 3 – Montáž a booking
- kroky 10–12,
- Cal.com integrácia,
- stavový model rezervácií a potvrdení.

### Fáza 4 – Dreamairko AI + voice
- guided Q&A,
- ElevenLabs + fallback speech,
- porovnávací a uisťovací režim odpovedí.

### Fáza 5 – CRM a automatizácie
- Make orchestration,
- HubSpot sync (lead/deal/activity),
- fakturačné workflow + notifikácie.

---

## 6) Kompletný architektonický prompt do Lovable (copy/paste)

```text
Build Dream Air customer configurator as one app used in two modes:
1) Embedded in Webflow via iframe (?embed=1)
2) Direct app mode for mobile/tablet/desktop

Architecture requirements:
- Frontend/UI in Lovable preserving existing Dream Air dark-blue design language and 12-step flow.
- Supabase is runtime source-of-truth for products, variants, leads, quotes, bookings, and process states.
- Airtable is staging/editor workspace for CSV imports and manual row editing before publish.
- Cloudinary is the media source for product photos and transformed delivery URLs.
- Cal.com handles booking slots; sync bookings to Supabase and CRM.
- Make orchestrates events/workflows: quote created, booking confirmed, payment event, invoice event, reminders.
- CRM target is HubSpot (future-proof), with deal pipeline stages mapped from configurator states.
- Notion is the internal knowledge/process layer (SOP, handoff notes, implementation checklists) synchronized via Make.
- ElevenLabs voice output for Dreamairko, with browser speech fallback.

Data and pricing rules:
- Import product variants from CSV.
- Treat Variant Price as all-in including 350 EUR standard installation.
- Compute device-only price: device_price_eur = max(0, Variant Price - 350).
- Quote split must always show: device price, standard install baseline, extra install estimate.
- Extra install is orientational until technician confirmation.

Commerce and operations:
- Allow reservation/purchase flow for device; installation extras remain estimated.
- Generate PDF quote and send via email.
- Device invoice automation can run at payment confirmation; installation invoice after technical approval.

Implementation phases:
- Phase 1: foundation + Supabase schema + embed shell + import pipeline.
- Phase 2: steps 1–9 + pricing engine + PDF quote.
- Phase 3: steps 10–12 + Cal.com booking.
- Phase 4: Dreamairko guided AI + voice.
- Phase 5: Make automations + HubSpot sync + finance workflows.

Deliverables:
- System architecture diagram (logical)
- DB schema + event model
- Integration contracts (Webflow embed, Supabase, Cal.com, Make, Notion, HubSpot, Cloudinary)
- 12-step UX specification matching existing design
- Acceptance checklist with phase gates
```

---

## 7) Dizajnová konzistencia (must-have)

- Zachovať doterajší Dream Air vizuálny štýl (dark-blue, jemné overlaye, transparentné karty, moderný clean layout).
- Nevytvárať nový brand direction – iba evolúcia existujúceho.
- Komponenty mockupov krokov musia byť 1:1 konzistentné s doteraz schváleným smerom.

