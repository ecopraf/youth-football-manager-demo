# Youth Football Manager

> ⚠️ **Per agenti AI**: consultare `.agents/AGENTS.md` (entry point principale)

## Quick Links
- **App**: https://youth-football-manager.vercel.app
- **Backend**: https://youth-football-manager-backend.vercel.app/api
- **Repo**: https://github.com/ecopraf/youth-football-manager

## Info
- **Versione**: v3.14
- **Build ID**: `v3.14.<git-hash>`
- **Deploy**: Manuale via API (NON automatico su push a main)

## 🔑 Credenziali Sistema

### Superadmin
| Email | Password |
|-------|----------|
| coppola.raffaele@gmail.com | raffaele78 |

### Utenti Production
| Nome | Ruolo | Email | Password | Workspace |
|------|-------|-------|----------|-----------|
| Matteo Urilli | Allenatore | matteo@urilli.it | mister | DF Academy |
| Francesco Annese | Admin | francesco@annese.it | annex | ACP Annex |

## ⚠️ ISTRUZIONI IMPORTANTI

### Git & Deploy
- **NON fare push automatico su main** che triggera deploy Vercel
- Per ogni modifica:
  1. Disabilita deploy Vercel via API
  2. Fai commit e push
  3. Riabilita deploy Vercel
- Per deploy manuale: usare l'API Vercel con commit SHA specifico (richiedere conferma)

## 🔐 Credenziali Configurate

> ⚠️ **NOTA**: Le credenziali sensibili sono gestite tramite le variabili d'ambiente dell'agent.
> Non inserire mai secrets hardcoded nei file. Fai riferimento alle variabili `$SUPABASE_URL`, `$SUPABASE_SERVICE_ROLE_KEY`, `$VERCEL_TOKEN`.

### Supabase
- **URL**: `https://csxdlxbhcnyfppojwwzy.supabase.co`
- **ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeGRseGJoY255ZnBwb2p3d3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NTEzMTMsImV4cCI6MjA5NzMyNzMxM30.KTL6Z_Mwo_QzNidWt95YLqc7ZvdbfxyQdzxCT5uNRIw`
- **SERVICE_ROLE_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeGRseGJoY255ZnBwb2p3d3p5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTc1MTMxMywiZXhwIjoyMDk3MzI3MzEzfQ.HZXGk1Xfz0EvSqewAoSCcgZ6gIQYLOP-54mE3YVHgBo`
- **JWT_SECRET**: `aEj1OXdTHxSHD8iObjFov1jJ06RoyM1Ormf8KBb0uPI=`

### Vercel
- **Token**: usa variabile `$VERCEL_TOKEN`
- **Project ID**: `prj_zJ4cDM8Y8ledbwYKdJYWKQWwRrV6`
- **Team**: `team_CqNxANEW3rt4d6yuYeZM9Db7`

### Database Direct Access
```bash
# Usa le variabili d'ambiente dell'agent
curl -X POST "https://csxdlxbhcnyfppojwwzy.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sql":"SELECT 1"}'
```

### Vercel API - Gestione Deploy
```bash
# Disabilita deploy automatici
curl -X PATCH "https://api.vercel.com/v6/projects/youth-football-manager" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gitProviderOptions":{"createDeployments":"disabled"}}'

# Riabilita deploy
curl -X PATCH "https://api.vercel.com/v6/projects/youth-football-manager" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gitProviderOptions":{"createDeployments":"enabled"}}'
```

### Workspace Switcher - Note Implementative
- Solo i **superadmin** vedono lo switcher
- Al login appare un modal di selezione se ci sono 2+ workspace reali
- Dalla sidebar si può cambiare in qualsiasi momento
- Il workspace demo (ID: `00000000-0000-0000-0000-000000000001`) è escluso

---

## 📋 REGOLE DI SVILUPPO

### ⚠️ Prima di Modificare la Logica

1. **NON rimuovere campi dalla logica esistente** - Se un campo "manca" nel DB, la prima azione è **aggiungerlo con migrazione**, non rimuovere la funzionalità dal codice
2. **Chiedere conferma** prima di cambiare la logica generale delle funzionalità
3. **Verificare la struttura del DB** prima di assumere cosa esiste o non esiste
4. **Testare gli endpoint** direttamente prima di considerare una modifica come risolta

### 🗄️ Schema Database

#### Tabella `player`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Primary key |
| nome | TEXT | Nome giocatore |
| cognome | TEXT | Cognome giocatore |
| data_nascita | DATE | Data di nascita |
| sesso | TEXT | M/F |
| foto_url | TEXT | URL foto |
| telefono | TEXT | Telefono |
| email | TEXT | Email |
| ruolo_principale | TEXT | Ruolo principale |
| piede_preferito | TEXT | Destro/Sinistro/Ambidestro |
| altezza | INTEGER | Altezza in cm |
| peso | INTEGER | Peso in kg |
| note | TEXT | Note |
| luogo_nascita | TEXT | Luogo di nascita |
| nazionalita | TEXT | Nazionalità (default: Italiana) |
| residenza | TEXT | Residenza |
| matricola_figc | TEXT | Codice FIGC (UNIQUE) |
| tipo_documento | TEXT | Tipo documento |
| numero_documento | TEXT | Numero documento |
| rilasciato_da | TEXT | Ente rilascio documento |
| data_visita_medica | DATE | Data ultima visita medica |
| scadenza_visita_medica | DATE | Scadenza certificato medico |
| tesserato_dal | DATE | Inizio tesseramento |
| tesserato_fino_al | DATE | Fine tesseramento |

#### Tabella `team_player`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Primary key |
| team_id | UUID | FK a team |
| player_id | UUID | FK a player |
| numero_maglia | INTEGER | Numero di maglia |
| ruolo_preferito | TEXT | Ruolo per questa stagione |
| stato | TEXT | Attivo/Aggregato/Infortunato/Svincolato/Trasferito |
| is_primary | BOOLEAN | Squadra principale |
| data_assegnazione | DATE | Data assegnazione alla squadra |
| data_cessione | DATE | Data uscita dalla squadra |
| note | TEXT | Note |

#### Tabella `season`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Primary key |
| workspace_id | UUID | FK a workspace |
| nome | TEXT | Nome stagione (es. "2025/26") |
| data_inizio | DATE | Data inizio |
| attiva | BOOLEAN | Stagione attiva |

#### Tabella `team`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Primary key |
| nome | TEXT | Nome squadra |
| season_id | UUID | FK a season |
| category_id | UUID | FK a category |
| allenatore_id | UUID | FK a staff |
| dirigente_id | UUID | FK a staff |
| colori_casa | TEXT | Colori casa |
| colori_trasferta | TEXT | Colori trasferta |

### 🔄 Flusso Login e Caricamento Dati

1. Login → ottiene token JWT e dati utente
2. Se utente normale (non superadmin): usa `workspace_id` dal profilo per impostare `window.YFM.workspaceInfo`
3. `loadSquadre()` viene chiamato **dopo** che `workspaceInfo` è impostato
4. `loadSquadre()` cerca le stagioni del workspace, poi le squadre della stagione attiva
5. Il `squadraId` viene impostato automaticamente dalla prima squadra disponibile

### 📁 Struttura Migrations

Le migrazioni sono in `backend/migrations/` e seguono il pattern:
```
XXX_nome_migrazione.sql
```

Esempio: `004_add_player_fields.sql` aggiunge i campi mancanti alla tabella player.

### 🏗️ Endpoint API Key

- `/api/stagioni/:id/squadre` → restituisce squadre per stagione con category join
- `/api/squadre/:id/calciatori` → GET: lista giocatori, POST: aggiungi giocatore
- `/api/squadre/:id/scadenze-mediche` → giocatori con certificato in scadenza (30 giorni)
- `/api/squadre/:id/statistiche-complete` → statistiche squadre
- `/api/squadre/:id/top-players` → top marcatori/assist/presenze

---

## 🎭 Modalità Demo

### Attivazione
La modalità demo si attiva quando un utente clicca "Entra in Demo" sulla pagina di login. Viene impostato `localStorage.setItem('yfm_demo_session', 'active')`.

### Struttura Dati Demo (`frontend-v2/src/main.js`)

```javascript
// Dati demo sono costanti definite all'inizio del file
const DEMO_WORKSPACE = { id: '...', nome: 'ASD Green Academy', ... };
const DEMO_SQUADRE = [{ id: '...', nome: 'Green Academy', categoria: 'Primavera', ... }];
const DEMO_CALCIATORI = [{ id: 'c001', nome: 'Alessandro', cognome: 'Rossi', ... }, ...];
const DEMO_PARTITE = [{ id: 'm001', avversario: 'Roma Academy', gol_casa: 3, gol_trasferta: 1, ... }, ...];
const DEMO_EVENTI = [{ match_id: 'm003', player_id: 'c007', tipo: 'GOAL', minuto: 15 }, ...];
const DEMO_STATISTICHE = { punti: 34, vittorie: 10, pareggi: 4, sconfitte: 0, ... };
const DEMO_TOP_PLAYERS = { marcatori: [...], assistmen: [...], presenze: [...] };
const DEMO_CONVOCAZIONI = { m001: ['c001', 'c002', ...], m002: [...] };
const DEMO_FORMAZIONI = { m003: { portiere: 'c001', difensori: [...], ... }, ... };
const DEMO_ALLENAMENTI = [{ id: 'a001', data: '2026-06-26', tipo: 'Tattico', presenze: [...], assenti: [...], ... }];
```

### Init Demo Session (`initDemoSession()`)
```javascript
window.YFM.workspaceInfo = DEMO_WORKSPACE;
window.YFM.allSquadre = DEMO_SQUADRE;
window.YFM.squadraId = DEMO_SQUADRE[0].id; // Primavera
window.YFM.allPlayers = DEMO_CALCIATORI;
window.YFM.demoMatches = DEMO_PARTITE;
window.YFM.demoEvents = DEMO_EVENTI;
window.YFM.demoStats = DEMO_STATISTICHE;
window.YFM.demoTopPlayers = DEMO_TOP_PLAYERS;
window.YFM.demoConvocazioni = DEMO_CONVOCAZIONI;
window.YFM.demoFormazioni = DEMO_FORMAZIONI;
window.YFM.demoAllenamenti = DEMO_ALLENAMENTI;
```

### Moduli con Supporto Demo
Ogni modulo verifica `localStorage.getItem('yfm_demo_session') === 'active'` e usa i dati da `window.YFM.*`:
- `dashboard.js` - usa `demoStats`
- `calendar.js` - usa `demoMatches` (con `gol_casa`, `gol_trasferta`)
- `roster.js` - usa `allPlayers`
- `training.js` - usa `demoAllenamenti`
- `matchDetail.js` - usa `demoMatches`, `demoEvents`
- `reports.js` - usa `demoStats`, `demoTopPlayers`, `demoMatches`

### Nota su Partite e Risultati
Le partite demo hanno i campi `gol_casa` e `gol_trasferta` direttamente nell'oggetto partita (non in un oggetto stats separato). Il renderer `renderMatchCard()` cerca prima in `stats?.risultati` e poi usa i valori diretti dalla partita.

### ID Squadra Demo
- **Primavera**: `00000000-0000-0000-0000-000000000010`
- **Allievi B**: `00000000-0000-0000-0000-000000000011`
- **Workspace Demo**: `00000000-0000-0000-0000-000000000001`

### Persistenza Demo (`DemoPersistence.js`)
Le modifiche in modalità demo vengono salvate in `localStorage` sotto la chiave `yfm_demo_persistence`.

**Cosa viene persistito:**
- `matches` - Partite con risultati
- `matchResults` - Risultati partite (gol fatti/subiti)
- `events` - Eventi partita (gol, assist, cartellini)
- `formations` - Formazioni salvate
- `convocations` - Convocazioni per partita
- `training` - Allenamenti con presenze
- `players` - Giocatori aggiunti/modificati

**API DemoPersistence:**
```javascript
window.YFM.demoPersistence.saveMatchResult(matchId, golCasa, golOspiti)
window.YFM.demoPersistence.addEvent(matchId, { tipo, minuto, player_id })
window.YFM.demoPersistence.getEvents(matchId)
window.YFM.demoPersistence.saveFormation(matchId, formation)
window.YFM.demoPersistence.saveConvocation(matchId, playerIds)
window.YFM.demoPersistence.saveTrainingPresence(trainingId, { presenti, assenti })
window.YFM.demoPersistence.addPlayer(player)
window.YFM.demoPersistence.updatePlayer(playerId, updates)
window.YFM.demoPersistence.reset() // Pulisce tutti i dati
```

**Riferimento in window.YFM:**
```javascript
window.YFM.demoPersistence // Istanza singleton
```

### Reset Dati Demo
Per resettare tutti i dati demo persistenti e tornare ai valori originali:
```javascript
window.YFM.demoPersistence.reset()
location.reload()
```