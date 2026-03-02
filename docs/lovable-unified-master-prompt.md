# Dream Air – Kompletný Lovable Prompt Pack (Webflow Embed + App-like konfigurátor)

> Poznámka: finálna implementácia sa realizuje v Bolt. Tento dokument je kompatibilný obsahovo, Bolt-specific verzia je v `docs/bolt-master-prompt.md`.

> Architektonický blueprint pre stack rozhodnutia (Webflow/Lovable/Supabase/Cal.com/Make/Notion/HubSpot/Airtable/Cloudinary) je v `docs/architektura-webflow-lovable-stack-sk.md`.

Tento dokument je **jediný zdroj pravdy** pre Lovable implementáciu.
Obsahuje:
- 1 master prompt (copy/paste),
- detailný style manual,
- knowledge/data pravidlá,
- import CSV + obohatenie cez Firecrawl + Cloudinary,
- automatizácie (Make/Zapier, faktúry, kalendár),
- 12 krokov konfigurátora s mockup popisom.

---

## 1) Master prompt (copy/paste do Lovable)

```text
Build a production-ready customer air-conditioner configurator for Dream Air.

CRITICAL CONTEXT
- We already have a Webflow marketing website.
- This configurator must run as a standalone web app and be embedded into Webflow via iframe.
- On mobile and tablet, the same app must feel app-like (PWA behavior, touch-first UX), but still remain the same hosted app.

DELIVERY MODEL
1) Webflow = marketing front.
2) Configurator app = product logic, quote, booking, payment, automation.
3) Embed mode: <iframe src="https://app.dreamair.sk/?embed=1"></iframe>
4) Direct mode (mobile/tablet/desktop): https://app.dreamair.sk/

LOCALE & BRAND
- Language: Slovak first, English-ready.
- Currency: EUR.
- Public naming: Dream Air zákaznícky konfigurátor.

DESIGN MANUAL
- Premium dark-blue style, modern translucent cards, subtle overlays.
- Typography: headings Space Grotesk or Righteous equivalent; body DM Sans or Quicksand equivalent.
- Colors:
  - primary backgrounds: #082B4A, #0D3C66, #0A4B7A
  - surfaces: #1B4F79, accents: #2F80FF + #00BDEB
  - text: white + soft white alpha variants
- Real product/lifestyle photos with gentle dark overlay for readability.
- Keep visual consistency with existing Webflow look.

CONFIGURATOR FLOW (12 CONSECUTIVE STEPS)
1) Intro lifestyle catalog classes
2) Space type
3) Room dimensions/conditions
4) BTU sizing recommendation
5) Technical preferences (noise/SEER/refrigerant/compressor/smart)
6) Brand + budget filtering
7) Compare models
8) Dream Air Care service package
9) Quote in EUR (transparent breakdown)
10) Installation questionnaire + optional photo upload
11) Booking + deposit payment
12) Confirmation + PDF + email


AI GUIDE REQUIREMENTS
- Implement Dreamairko (Drímerko) as an in-flow AI guide (not just passive chat).
- The assistant must:
  - read guided questions aloud when voice mode is enabled (Web Speech API),
  - ask follow-up questions proactively,
  - reassure the customer and summarize decisions after each major step,
  - provide product comparisons across brands and technologies,
  - explain orientational installation surcharge logic in plain Slovak.
- Include a "Start AI Guide" action in the configurator and allow switch between manual and guided mode.
- Guided questions must include fields from the inspection form: property type, room count/m2/m3, split vs multisplit, phase (230/400V), extra route meters, extra penetrations, wall material, condensate drain mode, difficult access/height.

PRODUCT CATALOG & IMPORT
- Import primary source: CSV (Webflow product-like structure with variants).
- Enrich and expand data for missing brands/models:
  - add full GREE + AUX model families and all kW variants,
  - fill missing model metadata (performance, area, features).
- Use Firecrawl for enrichment scraping and sync to Airtable/DB.
- Use Cloudinary collection as media source for model photos and map images to products/variants.

IMPORTANT PRICE LOGIC
- Input prices currently include VAT and include a 350 EUR standard installation allowance.
- You must split quote into:
  A) Device price (invoice-able separately),
  B) Standard installation baseline (350 EUR with VAT),
  C) Additional installation work (above standard) from questionnaire rules.
- At checkout:
  - allow purchase/reservation of device,
  - show installation as estimate,
  - mark additional installation as orientational until technical confirmation.

INSTALLATION PRICING RULES (extra work)
Use this table in pricing engine:
- Extra route above 3m: from 30 EUR / bm
- Extra wall penetration (2nd+): 69 EUR / ks
- Core drilling concrete/panel: 99 EUR / ks
- Chasing in masonry: 59 EUR / bm
- Chasing in reinforced concrete: 109 EUR / bm
- Condensate pump install: 160 EUR / ks
- Condensate routing repair: 149 EUR / intervention
- Difficult access/height (no platform): from 79 EUR
- Platform/scaffolding/rope access: real cost
- Anti-vibration pads: 19 EUR / set
- Extra electrical feed: from 129 EUR
- WiFi module install/pairing (without module): 30 EUR / ks
- Mono-split dismantle: 120 EUR / ks
- Mono-split reinstall: 199 EUR / ks
- Outdoor relocation (no extra route): 299 EUR / ks
- Indoor relocation (no extra route): 229 EUR / ks
- Service mono-split cleaning/disinfection: 99 EUR
- Service multisplit (2 indoor + 1 outdoor): 139 EUR
- Each additional indoor unit in multisplit: 49 EUR / ks
- Diagnostics/service call up to 60 min: 120 EUR
- Each additional technician hour: 55 EUR / hour
- Refrigerant refill R32/R410A: 24 EUR / 100 g
- Transport Bratislava: 0 EUR
- Parking/access fees: actual cost

BOOKING + CALENDAR + AUTOMATION
- Support Calendly or Cal.com integration for appointment booking.
- Sync lead/order state into Airtable.
- Automations via Make or Zapier:
  - quote created,
  - booking confirmed,
  - payment received,
  - PDF generated,
  - invoice issued (device invoice automatic).
- Installation surcharge remains estimate until approval; then generate final work order/final invoice logic.

WEBFLOW INTEGRATION
- Embed must support dynamic iframe resizing (postMessage).
- `?embed=1` hides nonessential app chrome.
- Use native Webflow forms optionally for lead capture bridge, but app remains source of truth for configurator state.

TECH STACK
- Frontend: Next.js/React + RHF + animations.
- Backend: API-first stack + DB + queue/jobs.
- Storage: Cloudinary for media, Airtable (or DB mirror) for operational views.
- GDPR compliant data handling and consent logs.

REQUIRED OUTPUT FROM LOVABLE
1) Full architecture (frontend/backend/integrations)
2) Data schema for products, variants, quotes, bookings, installation extras
3) CSV ingestion + Firecrawl enrichment + Cloudinary mapper
4) 12-step UX screens + state transitions + validations
5) Pricing engine with baseline/install split and extra-work matrix
6) Booking/payment/automation workflows (Make/Zapier)
7) Webflow embed guide + direct app mode guide
8) QA checklist and acceptance tests
```

---

## 2) Knowledge pack pre import (CSV + enrich)

### 2.1 Vstupné pravidlá pre CSV
- `Variant Price` je aktuálne cena s DPH (a často obsahuje štandardnú montáž 350€ s DPH).
- Potrebné je logicky rozdeliť kalkuláciu na:
  - cena zariadenia,
  - štandardná montáž (350€),
  - nadštandardné montážne práce (podľa dotazníka).
- Varianty sú podľa výkonu (kW), farby a odporúčanej plochy m².
- Povinné mapovanie ceny zariadenia: `device_price_eur = max(0, Variant Price - 350)`.

### 2.2 Obohatenie datasetu
- Doplniť značky **GREE** a **AUX** vrátane všetkých modelových rád a výkonových variant.
- Doplniť chýbajúce parametre:
  - SEER/EER, hlučnosť, chladivo, Wi‑Fi/smart, kompresor,
  - odporúčaná plocha, technické listy, image URL.
- Firecrawl scraping výsledky validovať pred zápisom do produkčného katalógu.

### 2.3 Foto pipeline (Cloudinary)
- Zdroj: Cloudinary collection (poskytnutý link).
- Mapping strategy:
  - product handle + brand + series + kW variant,
  - fallback obrázok na úroveň série,
  - samostatné tagy pre indoor/outdoor unit.
- V UI použiť jemný overlay, aby texty na kartách zostali čitateľné.

---

## 3) Mockup návrh všetkých 12 krokov (v tomto dizajne)

Použi tento formát pre každý krok:
- cieľ kroku,
- hlavný komponent,
- sekundárne komponenty,
- validácie,
- CTA a výstup.

### Krok 1 – Úvodný katalóg
- Cieľ: výber cenovej triedy a orientácia v ponuke.
- Komponent: lifestyle cards tried.
- CTA: „Pokračovať do konfigurátora“.

### Krok 2 – Typ priestoru
- Cieľ: byt/dom/firma.
- Komponent: výberové karty + mikrocopy.

### Krok 3 – Parametre miestnosti
- m², výška, orientácia, izolácia, osoby.

### Krok 4 – Výkon BTU
- zobraziť výpočet + odporúčaný rozsah.

### Krok 5 – Technické preferencie
- hlučnosť, účinnosť, smart, chladivo.

### Krok 6 – Značka + rozpočet
- filter značiek + cenové rozpätie.

### Krok 7 – Porovnanie modelov
- tabuľka parametrov + primary + alternatívy.

### Krok 8 – Dream Air Care
- Basic/Comfort/Premium + dopad na záruku.

### Krok 9 – Cenová ponuka
- rozpis: zariadenie + 350 štandard montáž + odhad extras + DPH.

### Krok 10 – Montážny dotazník
- otázky k prístupu, prestupom, trasám, elektro + foto upload.

### Krok 11 – Rezervácia a platba
- kalendár slotov + záloha za zariadenie.

### Krok 12 – Potvrdenie
- PDF, email, ďalšie kroky, stav objednávky.

---

## 4) Prompt pre Firecrawl enrichment (copy/paste)

```text
Enrich AC product catalog data for Dream Air.
Input: existing CSV product variants.
Tasks:
1) Detect missing models/series/variants.
2) Expand catalog with complete GREE and AUX model families and kW variants.
3) Fill technical attributes (SEER/EER/noise/refrigerant/Wi-Fi/compressor/area).
4) Normalize Slovak labels and units.
5) Return structured JSON + quality score + source URLs for each enriched field.
6) Mark uncertain values for manual review.
```

---

## 5) Prompt pre Cloudinary image mapping (copy/paste)

```text
Map Cloudinary collection assets to Dream Air product variants.
Rules:
- Match by brand + series + model + kW variant where possible.
- Fallback order: exact variant -> series default -> brand default.
- Tag images as indoor/outdoor/lifestyle/technical.
- Return final mapping table with confidence score and missing-media report.
```

---

## 6) Prompt pre automatizácie (Make/Zapier) (copy/paste)

```text
Design automation flows for Dream Air configurator:
- Trigger: quote created -> generate PDF -> email customer -> create/update Airtable lead.
- Trigger: booking confirmed -> calendar sync (Calendly/Cal.com) -> notify team.
- Trigger: deposit paid -> issue device invoice automatically.
- Trigger: installation extras approved -> generate final work order/final invoice workflow.
Include retries, error handling, idempotency keys and audit logs.
```

---

## 7) Prompt pre QA a akceptáciu (copy/paste)

```text
Run acceptance QA for Dream Air customer configurator.
Validate end-to-end:
- 12 steps sequential flow,
- pricing split (device vs standard 350 installation vs extra work estimate),
- PDF + email,
- booking + deposit payment,
- embed mode in Webflow and direct app mode on mobile/tablet,
- CSV import + Firecrawl enrich + Cloudinary mapping,
- automation events (Make/Zapier) and Airtable sync.
Return pass/fail matrix + remediation list.
```

