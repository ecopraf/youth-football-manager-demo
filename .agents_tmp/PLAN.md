# 1. OBJECTIVE

Implementare le feature ad alta prioritГ  della roadmap Core 1.x per completare il prodotto minimo vitale:

1. **Auth/Ruoli MVP** - Sistema di autenticazione e gestione ruoli [COMPLETATO]
2. **Reports** - Report partita completo + Report stagionale/giocatore [COMPLETATO]
3. **UI Improvements** - Dashboard, Match Detail, Report Stagionale ottimizzati [COMPLETATO]
4. **Valutazioni Giocatore** - Valutazioni tecniche per stagione/partita [DA FARE]
5. **Timeline Partita** - Vista minuto-per-minuto degli eventi [DA FARE]

---

# 2. CONTEXT SUMMARY

## Stato Attuale delle Feature

| Feature | Stato | Note |
|---------|-------|------|
| Auth/Ruoli MVP | COMPLETATO | Login/Register, JWT, middleware, protezione route |
| Reports | COMPLETATO | Report Partita (social comment), Report Stagionale, Report Giocatore |
| UI Dashboard | COMPLETATO | Risultati raggruppati per competizione, giornata, C/T badges, emoji |
| UI Match Detail | COMPLETATO | Tabella 4 colonne allineate con table-layout:fixed |
| UI Report Stagionale | COMPLETATO | Stats grid 4 colonne, Result column con V/P/S emoji |
| Timeline Partita | DA FARE | Tabella eventi migliorata, no timeline animata |
| Valutazioni Giocatore | DA FARE | Nessun riferimento nel codebase |

## Componenti Chiave
- **Backend**: `backend/api/index.js` (Node.js + Express + Supabase)
- **Frontend**: `frontend-v2/src/` (Vite + JS vanilla)
- **Database**: Supabase (PostgreSQL) - tabelle esistenti
- **Routing**: `frontend-v2/src/router.js`

## Ultimo Rilascio Stabile (v3.11)
- **Auth MVP**: Login, Register, JWT, middleware, protezione route
- **Report Partita**: Con social comment per social media
- **Report Stagionale**: Stats aggregate, Punti, DR, Top Marcatori/Assist/Presenze
- **Report Giocatore**: Stats individuali, Minuti giocati, Storico eventi
- **Dashboard**: Risultati raggruppati per competizione, giornata, C/T badges, emoji V/P/S
- **Match Detail**: Tabella eventi con 4 colonne allineate (table-layout:fixed)
- **Report Stagionale UI**: Stats grid responsive, Calendario con Result column e emoji

---

# 3. APPROACH OVERVIEW

## Strategia: Implementazione Sequenziale

1. **Auth/Ruoli MVP** [COMPLETATO] - Base per sicurezza e autorizzazione
2. **Reports** [COMPLETATO] - Espansione da MVP a completo
3. **UI Improvements** [COMPLETATO] - Miglioramenti UX su Dashboard, Match Detail, Report
4. **Valutazioni Giocatore** [DA FARE] - Feature richiesta per report individuali
5. **Timeline Partita** [DA FARE] - UI migliorata per visualizzazione eventi

---

# 4. IMPLEMENTATION STEPS

## FASE 1: Auth/Ruoli MVP [COMPLETATO]

### Step 1.1 - Schema Database Auth [COMPLETATO]
### Step 1.2 - API Auth Backend [COMPLETATO]
### Step 1.3 - Middleware Auth [COMPLETATO]
### Step 1.4 - UI Login [COMPLETATO]
### Step 1.5 - Protezione Route [COMPLETATO]

---

## FASE 2: Reports Completo [COMPLETATO]

### Step 2.1 - Report Partita [COMPLETATO]
### Step 2.2 - Report Stagionale [COMPLETATO]
### Step 2.3 - Report Giocatore [COMPLETATO]
### Step 2.4 - Export PDF/CSV [DA FARE]
**Goal:** Download report in formato PDF

**Method:**
1. Implementare stampa PDF native del browser
2. Escludere sezioni non necessarie (es. commento social)

---

## FASE 3: UI Improvements [COMPLETATO]

### Step 3.1 - Dashboard - Ultimi Risultati [COMPLETATO]
**Goal:** Raggruppamento per competizione con giornata e C/T

**Implementato:**
- Risultati raggruppati per competizione con header colorato
- Giornata visibile per ogni partita (G.1, G.2, etc.)
- Badge Casa (blu) / Trasferta (giallo)
- Icone emoji per risultato (Vittoria, Pareggio, Sconfitta)
- Risultato colorato in base all'esito

**File:** `frontend-v2/src/modules/team/dashboard.js`
**API:** `backend/api/index.js` - endpoint `/statistiche-complete` (aggiunto campo giornata)

---

### Step 3.2 - Match Detail - Tabella Eventi [COMPLETATO]
**Goal:** Colonne allineate per qualsiasi tipo di evento

**Implementato:**
- 4 colonne fisse: Min., Tipo, Giocatore, Dettaglio
- table-layout:fixed per allineamento perfetto
- Dettaglio (Assist) in colonna separata

**File:** `frontend-v2/src/modules/team/matchDetail.js`

---

### Step 3.3 - Report Stagionale - Stats Grid [COMPLETATO]
**Goal:** Card uniformi sulla stessa riga

**Implementato:**
- Grid 4 colonne invece di 6 (8 card = 2 righe uguali)
- Breakpoint responsive: 4 -> 2 colonne su mobile

**File:** `frontend-v2/src/modules/performance/reports.js`

---

### Step 3.4 - Report Stagionale - Calendario [COMPLETATO]
**Goal:** Tabella allineata con Risultato e emoji V/P/S

**Implementato:**
- Nuova colonna C/T per Casa/Trasferta con badge colorato
- Colonna Risultato unificata (invece di GF/GS separati)
- Icone emoji: Vittoria, Pareggio, Sconfitta
- Colorazione verde/giallo/rosso per risultato
- table-layout:fixed per allineamento perfetto

**File:** `frontend-v2/src/modules/performance/reports.js`

---

## FASE 4: Valutazioni Giocatore [DA FARE]

### Step 4.1 - Schema Database Valutazioni
**Goal:** Creare tabella per valutazioni

**Method:**
1. Creare tabella `valutazione_giocatore`: `id`, `calciatore_id`, `stagione_id`, `partita_id` (nullable), `voto` (1-10), `note`, `categoria`, `data_valutazione`, `valutatore_id`
2. Aggiungere FK e indici

**Reference:** Supabase schema

---

### Step 4.2 - API Valutazioni Backend
**Goal:** CRUD per valutazioni

**Method:**
1. `GET /api/squadre/:squadraId/valutazioni` - Lista valutazioni squadra
2. `GET /api/calciatori/:id/valutazioni` - Valutazioni singolo giocatore
3. `POST /api/valutazioni` - Crea valutazione
4. `PUT /api/valutazioni/:id` - Modifica valutazione
5. `DELETE /api/valutazioni/:id` - Elimina valutazione

**Reference:** `backend/api/index.js`

---

### Step 4.3 - UI Scheda Giocatore con Valutazioni
**Goal:** Integrare valutazioni nella scheda giocatore esistente

**Method:**
1. Estendere `frontend-v2/src/modules/team/playerDetail.js`
2. Aggiungere sezione "Valutazioni" con grafico storico
3. Aggiungere form per nuova valutazione post-partita

**Reference:** `frontend-v2/src/modules/team/playerDetail.js`

---

### Step 4.4 - UI Lista Valutazioni Stagione
**Goal:** Vista aggregate delle valutazioni

**Method:**
1. Creare `frontend-v2/src/modules/coach/valutazioni.js`
2. Mostrare media voti per giocatore
3. Filtri per data/partita/categoria

**Reference:** `frontend-v2/src/modules/coach/valutazioni.js`

---

## FASE 5: Timeline Partita [DA FARE]

### Step 5.1 - UI Timeline Animata nel Match Detail
**Goal:** Trasformare la tabella eventi in una timeline visiva verticale con animazioni

**Analisi Codice Esistente:**
- File: `frontend-v2/src/modules/team/matchDetail.js`
- Attuale: Tabella statica con 4 colonne (Min., Tipo, Giocatore, Dettaglio)
- Dati evento: `minuto`, `tipo` (GOAL/ASSIST/YELLOW/RED), `principale`, `secondario`

**Method:**
1. **Creare layout timeline verticale** (invece di tabella)
   - Linea verticale centrale con pallini per ogni evento
   - Icone colorate sui pallini: ⚽ (gol), 🟨 (amm), 🟥 (esp), 🅰️ (assist)
   - Contenuto a sinistra/destra alternato per readability

2. **Implementare CSS Animations**
   ```css
   .timeline-item { animation: fadeSlideIn 0.4s ease-out; }
   @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } }
   ```

3. **Indicatori tempo visivi**
   - Badge minuto sopra ogni pallino (90', 45', etc.)
   - Dividers per tempi (1° Tempo / 2° Tempo / Extra Time)

4. **Colorazione per tipo evento**
   - Gol: Verde (#27AE60)
   - Assist: Blu (#3498db)
   - Ammonizione: Giallo (#f39c12)
   - Espulsione: Rosso (#e74c3c)

**Reference:** `frontend-v2/src/modules/team/matchDetail.js` (righe 25-37)

---

### Step 5.2 - Timeline Espandibile con Dettagli
**Goal:** Click su evento espande pannello con informazioni aggiuntive

**Analisi Dati Disponibili:**
- Attualmente: `minuto`, `tipo`, `principale` (nome cognome), `secondario` (assist)
- Mancante: formazione al minuto (richiede query separata)

**Method:**
1. **Click handler su pallino evento**
   ```javascript
   document.querySelectorAll('.timeline-item').forEach(item => {
     item.addEventListener('click', () => toggleEventDetail(item));
   });
   ```

2. **Pannello dettaglio espanso** (compare sotto l'evento)
   - Info aggiuntive: minuto esatto, tipo evento descritto
   - Giocatore coinvolto con avatar/colorazione ruolo
   - Assist (se presente) con formattazione distinta
   - Bottone "Vai alla scheda giocatore"

3. **Animazione espansione**
   - Smooth height transition
   - Focus visivo sul giocatore (highlight giallo temporaneo)

4. **Accordion behavior** (opzionale)
   - Solo un evento espanso alla volta
   - Animazione fluid per open/close

**Reference:** `frontend-v2/src/modules/team/matchDetail.js`

---

### Step 5.3 - Mini Timeline nel Calendario (Preview)
**Goal:** Mostrare anteprima eventi principali nella card partita

**Analisi Codice Esistente:**
- File: `frontend-v2/src/modules/team/calendar.js`
- Funzione `renderMatchCard()` già mostra risultato clickabile
- Attuale: "Dettaglio" link per aprire match detail

**Method:**
1. **Modificare `renderMatchCard()` in calendar.js**
   - Aggiungere colonna/icona con mini preview eventi
   - Icone compatte: ⚽🟨🟥 (max 3-4 eventi mostrati)

2. **Popup inline on hover (desktop)**
   - Hover sull'icona eventi mostra tooltip/popup
   - Lista eventi con minuto e giocatore
   - Click su evento apre match detail con quello evidenziato

3. **Fallback mobile**
   - Su mobile mostra solo count: "2 ⚽, 1 🟨"
   - Click apre match detail completo

4. **Ottimizzazione performance**
   - Fetch eventi in batch o lazy load
   - Cache locale per partite già caricate

**Reference:** 
- `frontend-v2/src/modules/team/calendar.js` (funzione `renderMatchCard`)
- Backend endpoint esistente: `/partite/:mid/dettaglio` (già restituisce eventi)

---

### Step 5.4 - Visualizzazione Formazione al Momento (Futuro)
**Goal:** Mostrare chi era in campo al minuto dell'evento

**Note:** Questo richiede implementazione futura di snapshot formazione per minuto.

**Method:**
1. Richiede modifica schema per salvare formazioni per minuto
2. Oppure: logica per ricostruire formazione da eventi sostituzioni

**Reference:** Schema Supabase (da valutare con team)

---

# 5. TESTING AND VALIDATION

## Criteri di Successo

### Auth/Ruoli MVP [COMPLETATO]
- [x] Login con credenziali valide -> redirect a dashboard
- [x] Login con credenziali invalide -> messaggio errore
- [x] Logout -> clear token, redirect a login
- [x] Accesso a route protetta senza auth -> redirect a login
- [ ] Ruolo admin vs allenatore -> visibilitГ  menu diversa (da completare)

### Reports [COMPLETATO]
- [x] Report Partita -> genera correttamente con tutti i dati
- [x] Report Partita -> Commento Social per social media
- [x] Report Stagionale -> stats aggregate, Punti, DR
- [x] Report Stagionale -> Top 3 Marcatori/Assist/Presenze
- [x] Report Giocatore -> stats individuali complete
- [ ] Export PDF -> download file valido (stampa browser funziona)

### UI Improvements [COMPLETATO]
- [x] Dashboard -> Risultati raggruppati per competizione
- [x] Dashboard -> Giornata visibile per ogni partita
- [x] Dashboard -> Badge C/T (Casa/Trasferta)
- [x] Dashboard -> Emoji V/P/S per risultato
- [x] Match Detail -> Tabella 4 colonne allineate
- [x] Report Stagionale -> Stats grid 4 colonne responsive
- [x] Report Stagionale -> Calendario con Result column

### Valutazioni Giocatore [DA FARE]
- [ ] Creazione valutazione -> salvata in DB, visibile in scheda
- [ ] Modifica valutazione -> aggiornamento immediato
- [ ] Media voti calcolata correttamente
- [ ] Filtri funzionano (data, partita, categoria)

### Timeline Partita [IN PIANIFICAZIONE]

#### Step 5.1 - UI Timeline Animata
- [ ] Timeline verticale visibile (invece di tabella)
- [ ] Pallini colorati per ogni tipo evento (⚽🟨🟥🅰️)
- [ ] Animazione fade-in sugli eventi
- [ ] Dividers per 1° Tempo / 2° Tempo
- [ ] Layout responsive (mobile-friendly)

#### Step 5.2 - Timeline Espandibile
- [ ] Click su evento apre pannello dettaglio
- [ ] Pannello mostra info complete (giocatore, assist, minuto)
- [ ] Animazione smooth open/close
- [ ] Link "Vai alla scheda giocatore" funziona
- [ ] Accordion (un solo evento espanso alla volta)

#### Step 5.3 - Mini Timeline Calendario
- [ ] Icone eventi visibili nella card partita
- [ ] Hover mostra tooltip con lista eventi
- [ ] Count eventi su mobile ("2 ⚽, 1 🟨")
- [ ] Click apre match detail con focus corretto

#### Step 5.4 - Formazione al Momento [FUTURO]
- [ ] (Dipende da implementazione schema)

---

*Ultimo aggiornamento: Giugno 2026*
