# Podrobná špecifikácia: Dream Air zákaznícky konfigurátor (Webflow embed + app-like režim)

## 1) Cieľ projektu
- Finálna implementácia prebehne v **Bolt.new** (s embed nasadením do Webflow).
Cieľom je dodať zákaznícky konfigurátor klimatizácií, ktorý:
- beží ako samostatná web aplikácia (`app.dreamair.sk`),
- je embednuteľný do Webflow cez `iframe` (`?embed=1`),
- na mobile/tablete pôsobí ako appka (touch-first, PWA-like UX),
- prevedie zákazníka **12 po sebe idúcimi krokmi** od výberu po rezerváciu a potvrdenie.

Konfigurátor je zákaznícka vrstva. Admin/import procesy bežia na pozadí (Airtable/DB, Make/Zapier, Firecrawl, CSV sync).

---

## 2) Prevádzkový model (Webflow + embed)
1. **Webflow** = marketing, brand, obsah.
2. **Konfigurátor app** = výber produktu, kalkulácie, CP, booking, platba, automatizácie.
3. **Embed režim**: `<iframe src="https://app.dreamair.sk/?embed=1"></iframe>`.
4. **Direct režim** (app-like): `https://app.dreamair.sk/`.
5. `postMessage` auto-resize pre iframe výšku.

---

## 3) UX a dizajn manuál

### 3.1 Vizuálny smer
- Moderný dark-blue vzhľad, jemné translucent vrstvy, čisté karty.
- Reálne lifestyle foto produktov s jemným tmavým overlay.
- Konzistentné s aktuálnou Webflow stránkou.

### 3.2 Farby
- Primárne pozadia: `#082B4A`, `#0D3C66`, `#0A4B7A`.
- Surface: `#1B4F79`.
- Akcenty: `#2F80FF`, `#00BDEB`.
- Text: biela + alpha varianty.

### 3.3 Typografia
- Nadpisy: Space Grotesk (alternatíva Righteous).
- Body text: DM Sans (alternatíva Quicksand).

### 3.4 Komponentové zásady
- Veľké touch targety (tablet-first).
- Viditeľný stepper 1–12.
- CTA vždy: „Späť“, „Ďalej“, „Uložiť a pokračovať neskôr“.
- Form inputy jemne priehľadné, svetlé, s vysokým kontrastom textu.

---

## 4) Kompletný flow: 12 krokov konfigurátora


## 4.1 AI sprievodca v otázkach (hlas + text)
- Dreamairko (hovorovo Drímerko) funguje ako aktívny sprievodca, nie len pasívny chat.
- Pri zapnutom hlasovom režime číta otázky nahlas (Web Speech API) a vedie používateľa krok po kroku.
- Pri každej odpovedi:
  - položí doplňujúcu otázku, ak chýbajú dáta,
  - stručne uistí zákazníka, že je na správnej ceste,
  - priebežne sumarizuje rozhodnutia (výkon, značka, rozpočet, montáž).
- Musí vedieť porovnávať modely naprieč značkami a technológiami (hlučnosť, účinnosť, smart funkcie, filtrácia, cena).
- Otázky musia kopírovať obhliadkové tlačivo: typ nehnuteľnosti, miestnosti (m²/m³), split/multisplit, 230V/400V, počet prierazov, trasa nad 3 m, materiál prierazu, odvod kondenzu, zhoršený prístup/výška.


### Krok 1 – Úvodný katalóg
- Lifestyle predstavenie značiek a tried.
- CTA: „Spustiť konfigurátor“.

### Krok 2 – Typ priestoru
- Byt/dom/firma + typ miestnosti.

### Krok 3 – Parametre miestnosti
- m², výška stropu, izolácia, orientácia, počet osôb.

### Krok 4 – BTU/kW odporúčanie
- Výpočet výkonu + odporúčaný rozsah.

### Krok 5 – Technické preferencie
- Hlučnosť, účinnosť, Wi‑Fi/smart, chladivo, filtrácia.

### Krok 6 – Značka a rozpočet
- Filter značiek (Daikin, Samsung, TCL, Midea, GREE, AUX...).
- Cenový filter.

### Krok 7 – Porovnanie modelov
- Primárny model + alternatívy.
- Porovnávacia tabuľka parametrov.

### Krok 8 – Dream Air Care
- Basic / Comfort / Premium.
- Vplyv na záruku a servis.

### Krok 9 – Cenová ponuka (CP)
- Transparentný rozpis:
  1) zariadenie,
  2) štandardná montáž 350 € s DPH,
  3) predbežný odhad nadštandardu,
  4) DPH a celkom.

### Krok 10 – Montážny dotazník + foto
- Zaškrtávací checklist + voliteľný upload foto priestoru.
- Výstup: orientačný výpočet nadštandardných úkonov.

### Krok 11 – Rezervácia + platba
- Calendly alebo Cal.com výber termínu.
- Platba zálohy / nákupu zariadenia.

### Krok 12 – Potvrdenie
- PDF CP, email zhrnutie, stav objednávky.
- Informácia: montážne doplatky sú orientačné do technického potvrdenia.

---

## 5) Cenová logika a pravidlá

## 5.1 Základný split ceny
Zdrojové ceny v katalógu sú často „all-in“ (zariadenie + štandardná montáž 350 € s DPH). V konfigurátore treba vždy oddeliť:
- **A) Cena zariadenia** (fakturovateľná automaticky),
- **B) Štandardná montáž 350 € s DPH**,
- **C) Nadštandardné montážne práce** (orientačný odhad podľa dotazníka).

## 5.2 Cenník nadštandardu (s DPH)
- Trasa nad 3 m: **od 30 € / bm**
- 2. a ďalší prestup stenou: **69 € / ks**
- Jadrový prieraz betón/panel: **99 € / ks**
- Drážkovanie murivo: **59 € / bm**
- Drážkovanie betón/železobetón: **109 € / bm**
- Čerpadlo kondenzátu s montážou: **160 € / ks**
- Úprava odvodu kondenzu / oprava: **149 € / zásah**
- Zhoršený prístup / výška bez plošiny: **od 79 €**
- Plošina/lešenie/horolezecké práce: **podľa reálnych cien**
- Antivibračné podložky: **19 € / sada**
- Dodatočné napájanie: **od 129 €**
- WiFi modul montáž/spárovanie (bez modulu): **30 € / ks**
- Demontáž monosplit: **120 € / ks**
- Opätovná montáž monosplit: **199 € / ks**
- Prekládka vonkajšej jednotky: **299 € / ks**
- Prekládka vnútornej jednotky: **229 € / ks**
- Servis monosplit: **99 €**
- Servis multisplit (2+1): **139 €**
- Každá ďalšia vnútorná jednotka: **49 € / ks**
- Diagnostika / výjazd do 60 min: **120 €**
- Každá ďalšia hodina technika: **55 € / hod**
- Doplnenie chladiva R32/R410A: **24 € / 100 g**
- Doprava BA: **0 €**
- Parkovanie/vjazdy/poplatky: **podľa reality**

---

## 6) Katalóg a dáta (CSV + Firecrawl + Cloudinary)

- Pri importe z CSV platí: `cena_zariadenia = max(0, Variant Price - 350)`; 350 € je štandardná montáž s DPH.
### 6.1 Primárny vstup
- CSV so stĺpcami vo formáte Webflow e-commerce variantov.
- Varianty podľa kW, farby a plochy m².

### 6.2 Obohatenie dát
- Doplniť kompletné portfólio **GREE** a **AUX** (všetky modelové rady a kW varianty).
- Doplniť chýbajúce parametre (SEER, hlučnosť, chladivo, smart, plocha m², technické vlastnosti).
- Firecrawl používať na zber + validáciu zdrojov pred publikovaním.

### 6.3 Obrazový mapping
- Zdroj obrázkov: Cloudinary kolekcia.
- Párovanie: `brand + séria + model + kW variant`.
- Fallback: variant → séria → značka.
- Tagovanie: indoor/outdoor/lifestyle/technical.

---

## 7) Integrácie a automatizácie
- **Kalendár**: Calendly alebo Cal.com.
- **CRM/OPS**: Airtable (alebo DB mirror).
- **Automatizácie**: Make alebo Zapier:
  - CP vytvorená → PDF → email zákazníkovi,
  - booking potvrdený → notifikácia tímu,
  - platba prijatá → automatická faktúra za zariadenie,
  - schválené montážne doplatky → pracovný príkaz / finálna faktúra.

---

## 8) Fakturácia a právna logika
- Faktúra za zariadenie sa vystavuje automaticky po úhrade.
- Montážne doplatky z dotazníka sú **orientačné** do potvrdenia technikom.
- Finálne montážne náklady sa potvrdzujú po technickom overení.
- GDPR: súhlasy, audit logy, uchovávanie dát podľa legislatívy.

---

## 9) Výstupy, ktoré musí mať Lovable implementácia
1. Architektúra app + embed.
2. Datový model (produkty, varianty, CP, booking, montážne extras, platby).
3. CSV import pipeline + Firecrawl enrichment + Cloudinary mapping.
4. Kompletný 12-krokový UX flow s validáciami.
5. Pricing engine so splitom ceny (zariadenie / 350 montáž / nadštandard).
6. Booking + payment + Make/Zapier automations.
7. PDF CP + email potvrdenie + stavový tracking.
8. QA checklist a acceptance testy.

---

## 10) Stav dokumentácie pre Lovable
Táto špecifikácia je pripravená ako knowledge podklad.
Copy/paste prompt pre implementáciu je v súbore:
- `docs/lovable-unified-master-prompt.md`

Odporúčaný postup:
1. Spustiť implementáciu podľa master promptu.
2. Potom iterovať jednotlivé mockupy každého z 12 krokov v rovnakom dizajn systéme.
