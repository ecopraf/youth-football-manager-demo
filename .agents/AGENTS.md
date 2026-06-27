# Istruzioni per Agenti AI - Youth Football Manager

Questo file contiene istruzioni specifiche per gli agenti AI che lavorano sul progetto Youth Football Manager.

---

## Contesto Progetto

**Versione Attuale**: v3.14
**Build ID**: `v3.14.<git-hash>` (formato: versione + commit hash)
**Backend**: Node.js/Express con Supabase
**Frontend**: Vite + JavaScript ES Modules
**Database**: Supabase (PostgreSQL)
**Deploy**: Vercel (automatico su push a main)
**Logo**: `/frontend-v2/public/assets/logo.png`
**Email**: youthfootballmanager@gmail.com

---

## Sistema Build Info

Build ID basato su **versione SW + git commit hash**, univoco e confrontabile tra locale e produzione.

| Dove | Build ID |
|------|----------|
| Login footer | `build: v3.14.XXXXXXX` |
| Sidebar footer | `build: v3.14.XXXXXXX` |
| Variabile JS | `window.YFM_BUILD_ID` |

**File**: `frontend-v2/src/build-info.js` (rigenerato automaticamente da `vite.config.js`) - **NON modificare manualmente**

---

## Credenziali e Configurazione

### Supabase (Backend Vercel)
```
SUPABASE_URL=https://csxdlxbhcnyfppojwwzy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<stored in Vercel env>
JWT_SECRET=<stored in Vercel env>
```

### API Keys Pubbliche
- **ANON KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeGRseGJoY255ZnBwb2p3d3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NTEzMTMsImV4cCI6MjA5NzMyNzMxM30.KTL6Z_Mwo_QzNidWt95YLqc7ZvdbfxyQdzxCT5uNRIw`

---

## Schema Database (Tabelle Principali)

| Tabella | Campi Chiave | Descrizione |
|---------|--------------|-------------|
| `workspace` | id, nome, logo_url, referral_code | Società/club |
| `stagione` | id, workspace_id, nome, data_inizio, data_fine, is_attiva | Stagione sportiva |
| `squadra` | id, stagione_id, nome, categoria, allenatore | Squadra |
| `calciatore` | id, workspace_id, nome, cognome, data_nascita, ... | Giocatore |
| `rosa` | id, squadra_id, calciatore_id, numero_maglia, ruolo | Associazione |
| `partita` | id, squadra_id, data_ora, avversario, luogo, archiviata | Partita |
| `evento_partita` | id, partita_id, tipo_evento_codice, calciatore_principale_id, minuto | Eventi |
| `convocazione` | id, partita_id, calciatore_id | Convocazioni |
| `formazione_partita` | id, partita_id, calciatore_id, ruolo, numero_maglia | Formazione |
| `valutazione_partita` | id, partita_id, calciatore_id, voto, note | Valutazioni |
| `utente` | id, workspace_id, email, password_hash, nome, ruolo, is_superadmin | Utente |
| `guest_token` | id, token, tipo, scadenza, utente_id | Token guest |

### Tipo Eventi Partita (tipo_evento_codice)
- `GOAL` - Gol segnato
- `SUBITO` - Gol subito (portiere)
- `ASSIST` - Assist
- `YELLOW` - Cartellino giallo
- `RED` - Cartellino rosso
- `IN` - Entrato in campo
- `OUT` - Uscito dal campo

---

## Prima di Iniziare

### 1. Leggi i Documenti di Contesto
Prima di qualsiasi task, consulta:
```
.agents/
├── VISION.md      → Missione e valori prodotto
├── ARCHITECTURE.md → Architettura tecnica
├── ROADMAP.md     → Priorità e backlog
└── CODING_STANDARDS.md → Convenzioni codice
```

### 2. Verifica lo Stato Corrente
```bash
git log --oneline -5
git status
```

### 3. Identifica i File da Modificare
Consulta la struttura in ARCHITECTURE.md per capire dove operare.

---

## Regole Operative

### Modifiche Database
1. **Usa le API esistenti** quando possibili
2. **Se l'API non esiste**: fornisci query SQL dettagliate
3. **Prima di modificare**: verifica lo schema con `SELECT * FROM ... LIMIT 1`

### Modifiche Frontend
1. Segui CODING_STANDARDS.md per stile
2. Non modificare file generati automaticamente (`build-info.js`)
3. Testa responsive su mobile

### Modifiche Backend
1. Mantieni compatibilità con versioni precedenti
2. Aggiungi validazione input
3. Gestisci errori con messaggi user-friendly

### Deploy
1. **Non fare deploy manuale** - è automatico su push
2. Dopo ogni feature: commit + push
3. Verifica con `curl https://.../api/health`

---

## Workflow Raccomandato

### Per Nuove Feature

```
1. ANALISI
   - Leggi VISION e ROADMAP
   - Identifica file da modificare
   - Verifica se esiste già l'API/funzionalità

2. PIANIFICAZIONE
   - Crea task list
   - Valida con utente se complessa

3. IMPLEMENTAZIONE
   - Segui CODING_STANDARDS
   - Commit frequenti con messaggi descrittivi

4. VERIFICA
   - Build locale: npm run build
   - Test manuale se possibile
   - Verifica API con curl

5. DEPLOY
   - Push su main → trigger automatico
   - Attendi ~2 minuti
   - Verifica produzione
```

### Per Bug Fix

```
1. RIPRODUCI
   - Identifica i passaggi per replicare il bug
   
2. ANALIZZA
   - Leggi il codice rilevante
   - Verifica log browser console
   - Testa API con curl

3. FIX
   - Implementa la correzione minima
   - Non introduurre nuovi bug

4. VERIFICA
   - Testa la fix
   - Verifica non abbia impatto su altre parti

5. COMMIT
   - Messaggio: "fix: <breve descrizione bug>"
   - Push
```

---

## Checklist Prima di Commit

- [ ] Codice segue CODING_STANDARDS
- [ ] Build locale passa (`npm run build`)
- [ ] Nessun `console.log` left-over in produzione
- [ ] Variabili d'ambiente non hardcoded
- [ ] Accessibilità rispettata (title su icone)
- [ ] Errori gestiti con messaggi user-friendly

---

## Comandi Utili

```bash
# Setup locale
git clone https://github.com/ecopraf/youth-football-manager.git
cd youth-football-manager
cd frontend-v2 && npm install && npm run build

# Backend locale (se necessario)
cd backend && npm install && node api/index.js

# Verifica build
npm run build
# Output: Build ID: v3.14.XXXXXXX

# Deploy (automatico)
git add .
git commit -m "tipo: descrizione"
git push origin main

# Verifica produzione
curl https://youth-football-manager-backend.vercel.app/api/health
```

---

## File Sensibili

### NON MODIFICARE MAI
- `frontend-v2/src/build-info.js` (generato automaticamente)
- `frontend-v2/dist/` (output build)
- `node_modules/` (dipendenze)
- File con credenziali (`.env`)

### Variabili d'Ambiente
Le credenziali sono in AGENTS.md (repository context). Non esporle mai.

---

## Contesto Multi-Workspace

Il sistema supporta **multi-tenant**: ogni workspace è una società sportiva isolata.

**Regole**:
- Tutte le query includono `workspace_id`
- API `/auth/workspaces` per ottenere squadre utente
- Dati Demo vs ASD Albalonga sono workspace separati

---

## Convenzioni API

### Risposte
```javascript
// Successo
{ success: true, data: {...} }

// Errore
{ success: false, error: 'Messaggio' }
```

### Endpoint Standard
```
GET    /api/<risorsa>           → Lista
GET    /api/<risorsa>/:id       → Dettaglio
POST   /api/<risorsa>           → Crea
PUT    /api/<risorsa>/:id       → Modifica
DELETE /api/<risorsa>/:id       → Elimina
```

---

## Design System

### Colori
```css
--primary: #667eea
--success: #27AE60
--warning: #F39C12
--danger: #E74C3C
--text: #333333
```

### Border Radius
- Card: 12px
- Card gradient: 16px
- Bottoni: 10px
- Input: 8px

### Effetti Hover
```css
.card:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 15px 30px rgba(0,0,0,0.2);
}
```

---

## Contatti e Credenziali

- **Email**: youthfootballmanager@gmail.com
- **Supabase**: nel repository context (AGENTS.md padre)
- **Backend API**: https://youth-football-manager-backend.vercel.app/api

---

## Riga di Comando Finale

Dopo ogni task completato:
```bash
git add .
git commit -m "tipo: descrizione - build v3.14.<hash>"
git push origin main
```

Il `<hash>` è il commit hash corrente (vedi `git rev-parse --short HEAD`).
