# Dream Air – Bolt Master Prompt (Embed konfigurátor + app režim)

Tento dokument je copy/paste vstup pre **Bolt.new** implementáciu Dream Air appky.

## 1) Master prompt pre Bolt

```text
Build a production-ready customer AC configurator for Dream Air in Bolt.

CONTEXT
- Existing Webflow marketing site remains the front layer.
- Build one hosted configurator app used in 2 modes:
  1) Embed mode in Webflow iframe: https://app.dreamair.sk/?embed=1
  2) Direct app mode for mobile/tablet/desktop: https://app.dreamair.sk/

ASSISTANT
- AI assistant name: Dreamairko (spoken form: Drímerko).
- Dreamairko must guide users step-by-step, ask follow-up questions, reassure users, and provide comparison advice.
- Voice read-aloud mode for guided questions (Web Speech API).

CATALOG IMPORT (CRITICAL)
- Use CSV file: data/dreamair-product-import.csv.
- Treat `Variant Price` as current all-in price INCLUDING standard installation 350 EUR with VAT.
- Compute device-only price using:
  device_price_eur = max(0, Variant Price - 350)
- Always display transparent quote split:
  A) device price (without installation),
  B) standard installation baseline 350 EUR,
  C) additional installation work estimate.

GUIDED INSPECTION QUESTIONS (for orientational labor estimate)
- property type, room count, room area m2, ceiling height m,
- split vs multisplit,
- preferred brand / budget / technical priorities,
- power phase 230V/400V,
- route length and meters above 3m,
- extra wall penetrations,
- wall material,
- drilling/chasing meters,
- condensate drain mode (with/without pump),
- difficult access / height work.

EXTRA WORK MATRIX (ORIENTATIONAL)
- route above 3m: from 30 EUR / bm
- extra penetration: 69 EUR / ks
- core drilling concrete/panel: 99 EUR / ks
- chasing masonry: 59 EUR / bm
- chasing concrete: 109 EUR / bm
- condensate pump: 160 EUR / ks
- difficult access: from 79 EUR

RULES
- Mark extra installation amounts as orientational until technical confirmation.
- Never present extra-work estimate as final invoice amount.
- Device invoice can be auto-issued after payment; installation finalized after approval.

OUTPUT REQUIRED
- Full 12-step configurator UI and state logic,
- AI guide mode with voice + manual toggle,
- CSV import parser with device-price normalization,
- product comparison cards/tables,
- quote + booking + confirmation flow.
```

## 2) Bolt implementation notes
- Keep data model fields: `variant_price_all_in`, `device_price_eur`, `standard_installation_eur`, `extra_installation_estimate_eur`.
- Default `standard_installation_eur = 350`.
- If `Variant Price < 350`, set `device_price_eur = 0` and mark row for manual review.
- Use Slovak locale and EUR formatting.
