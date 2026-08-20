# Youth Football Manager Demo — Development Plan

> Piano di sviluppo per la demo interattiva. Formato: Epic → Task con stato.

**Legenda stati**: ⬜ Todo | ⏳ In corso | ✅ Completato | ❌ Bloccato

---

## Epic Attivi

### EPIC 1: Allineamento Demo con App Reale

> Obiettivo: Portare la demo al pari delle funzionalità chiave dell'app di produzione per migliorare l'esperienza di valutazione da parte di potenziali clienti.

**Priorità**: Alta
**Effort stimato**: 5-7 giorni

#### Fase 1: Infrastruttura Mock Data (1 giorno)

| ID | Task | Effort | Stato | Dipendenze |
|----|------|--------|-------|------------|
| 1.1 | Creare `data/mockFees.js` — fee_config + fee + installments per 18 giocatori | 1h | ⬜ | - |
| 1.2 | Creare `data/mockKit.js` — template (gara + portiere) + bundle + assignment | 1h | ⬜ | - |
| 1.3 | Creare `data/mockStaff.js` — 5 staff con ruoli (allenatore, vice, prep atletico, dirigente, team manager) | 30min | ⬜ | - |
| 1.4 | Creare `data/mockMatchCenter.js` — eventi dettagliati per 3 partite (gol, assist, cambi, cartellini con minuti) | 1h | ⬜ | - |
| 1.5 | Creare `data/mockPerformance.js` — aggregazioni stats + sparkline data per ultimi 10 allenamenti | 1h | ⬜ | - |
| 1.6 | Estendere `services/api.js` — handler mock per nuovi endpoint (/fees, /kit, /staff, /match-center, /performance) | 2h | ⬜ | 1.1-1.5 |
| 1.7 | Estendere `DemoPersistence.js` — persistenza localStorage per fees (pagamenti) e kit (assegnazioni) | 1h | ⬜ | 1.1, 1.2 |

#### Fase 2: Moduli Gestionali (3 giorni)

| ID | Task | Effort | Stato | Dipendenze |
|----|------|--------|-------|------------|
| 2.1 | Implementare `modules/club/fees.js` — vista quote con config, lista giocatori, stato pagamento, azioni paga/annulla | 4h | ⬜ | 1.1, 1.6 |
| 2.2 | Implementare `modules/club/kit.js` — vista magazzino con template, bundle disponibili, assegnazioni per giocatore | 3h | ⬜ | 1.2, 1.6 |
| 2.3 | Implementare `modules/club/staff.js` — lista staff read-only con ruoli e contatti | 2h | ⬜ | 1.3, 1.6 |
| 2.4 | Implementare `modules/club/checklist.js` — checklist stagione con toggle items e barra progresso | 2h | ⬜ | - |

#### Fase 3: Moduli "Wow Factor" (2 giorni)

| ID | Task | Effort | Stato | Dipendenze |
|----|------|--------|-------|------------|
| 3.1 | Implementare `modules/team/matchCenter.js` — vista read-only con timeline eventi, formazione live, cronometro simulato | 4h | ⬜ | 1.4, 1.6 |
| 3.2 | Implementare `modules/performance/playerPerformance.js` — vista rosa con tab Partite/Allenamenti, sparkline, voti | 4h | ⬜ | 1.5, 1.6 |
| 3.3 | Implementare `modules/team/lndClassifica.js` — classifica mock con dati statici (no fetch GR) | 2h | ⬜ | - |
| 3.4 | Implementare `modules/print/printRosa.js` — stampa PDF rosa con foto e dati | 2h | ⬜ | - |

#### Fase 4: Integrazione UI (0.5 giorni)

| ID | Task | Effort | Stato | Dipendenze |
|----|------|--------|-------|------------|
| 4.1 | Aggiornare `Sidebar.js` — aggiungere voci: Quote, Kit, Staff, Match Center, Performance, Classifica | 1h | ⬜ | 2.1-3.3 |
| 4.2 | Aggiornare `router.js` — registrare nuove route | 30min | ⬜ | 4.1 |
| 4.3 | Aggiornare `PageHelp.js` — aggiungere help contestuale per nuove pagine | 1h | ⬜ | 4.2 |
| 4.4 | Test navigazione completa + fix eventuali | 1h | ⬜ | 4.1-4.3 |

#### Fase 5: Polish & QA (0.5 giorni)

| ID | Task | Effort | Stato | Dipendenze |
|----|------|--------|-------|------------|
| 5.1 | Verificare responsive mobile per tutti i nuovi moduli | 1h | ⬜ | 4.4 |
| 5.2 | Verificare persistenza demo (refresh, logout/login) | 30min | ⬜ | 4.4 |
| 5.3 | Aggiornare ROADMAP.md con funzionalità completate | 15min | ⬜ | 5.1-5.2 |
| 5.4 | Deploy demo su Vercel + test produzione | 30min | ⬜ | 5.3 |

---

## Riepilogo Effort

| Fase | Task | Effort Totale |
|------|------|---------------|
| 1. Infrastruttura Mock | 7 task | ~8h |
| 2. Moduli Gestionali | 4 task | ~11h |
| 3. Moduli Wow | 4 task | ~12h |
| 4. Integrazione UI | 4 task | ~3.5h |
| 5. Polish & QA | 4 task | ~2.5h |
| **TOTALE** | **23 task** | **~37h (~5 giorni)** |

---

## Dipendenze Non Ovvie

### Match Center richiede:
- Mock `match_event` con struttura: `{id, match_id, player_id, tipo, minuto, note}`
- Mock `match_formation` con `formazione_meta.positions` (coordinate x,y per ogni giocatore)
- Mock `convocation` con campo `risposta` (disponibile/indisponibile)
- Cronometro può essere simulato con stato statico (es. "2° tempo - 67'")

### Quote/Fees richiede:
- `fee_config` con array `rate` (importo, scadenza_label, scadenza)
- `fee` per ogni player con `importo_totale`, `importo_pagato`, `stato`
- `fee_installment` per ogni rata con `stato`, `data_pagamento`
- Logica: `stato = importo_pagato === 0 ? 'da_pagare' : importo_pagato < importo_totale ? 'parziale' : 'pagata'`

### Kit richiede:
- `kit_template` con `articoli` array e `is_portiere` boolean
- `kit_bundle` con `stato` (integro/assegnato/parziale)
- `kit_assignment` con `player_id` o `staff_id` (mutualmente esclusivi)
- Badge 🧤 per kit portiere

### Performance Center richiede:
- Aggregazione da `match_event` mock (gol, assist, presenze, minuti)
- Aggregazione da `training_attendance` mock (presenze, voti)
- Sparkline: array ultimi 10 valori (es. voti allenamento)

---

## Note Implementative

### Pattern API Mock (da seguire)

```javascript
// In api.js - handleDemoRequest()
if (endpoint.match(/^\/fees/)) {
  return mockFeesHandler(endpoint, method, options);
}

// In data/mockFees.js
export function mockFeesHandler(endpoint, method, options) {
  const persistence = window.YFM.demoPersistence;
  
  if (method === 'GET' && endpoint === '/fees/config') {
    return { success: true, data: DEMO_FEE_CONFIG };
  }
  
  if (method === 'PUT' && endpoint.match(/\/fees\/\w+\/pay/)) {
    const feeId = endpoint.split('/')[2];
    persistence.payFeeInstallment(feeId, options.body);
    return { success: true };
  }
  // ...
}
```

### Cosa NON implementare in demo

- ❌ Import Center (richiede file upload reale)
- ❌ Guest Links (richiede token backend)
- ❌ Notifiche Push (richiede service worker + backend)
- ❌ Tesseramento (workflow troppo complesso)
- ❌ Scouting (modulo secondario)
- ❌ Inbox/Notifiche (richiede polling backend)

### Sidebar: voci da nascondere in demo

```javascript
// In Sidebar.js - filtrare queste voci se isDemo
const HIDE_IN_DEMO = ['importCenter', 'guestLinks', 'inbox', 'scouting', 'tesseramento'];
```

---

## Changelog

| Data | Versione | Modifiche |
|------|----------|-----------|
| - | v1.0 | Creazione piano Epic 1 - Allineamento Demo |

