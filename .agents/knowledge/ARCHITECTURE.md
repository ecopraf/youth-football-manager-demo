# Youth Football Manager - Architecture

## Panoramica Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                 │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐    │
│   │   Landing    │    │    App      │    │   Backend API   │    │
│   │  (Static)   │    │  (Vite/JS)  │    │   (Express)     │    │
│   └─────────────┘    └──────┬──────┘    └────────┬────────┘    │
└─────────────────────────────┼────────────────────┼──────────────┘
                              │                    │
                              │   REST API         │
                              └────────┬───────────┘
                                       │
                              ┌────────▼────────┐
                              │    SUPABASE     │
                              │   (PostgreSQL)  │
                              └─────────────────┘
```

## Stack Tecnologico

### Frontend
- **Framework**: Vite 6.x + JavaScript ES Modules
- **Styling**: Tailwind CSS
- **Routing**: Router custom in `router.js`
- **State**: Window globals (`window.YFM.*`)
- **Deploy**: Vercel (static hosting)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT custom + Guest tokens
- **Deploy**: Vercel Serverless Functions

### Database
- **Provider**: Supabase (PostgreSQL)
- **Auth Tables**: `utente`, `guest_token`
- **Business Tables**: `calciatori`, `squadra`, `stagione`, `partita`, etc.

## Struttura Repository

```
youth-football-manager/
├── frontend-v2/              # Frontend Vite
│   ├── src/
│   │   ├── main.js           # Entry point
│   │   ├── router.js         # Routing
│   │   ├── style.css         # Stili globali
│   │   ├── build-info.js     # Auto-generato (non tracciare)
│   │   ├── api.js            # Chiamate backend
│   │   ├── modules/          # Pagine/applicazioni
│   │   │   ├── auth/         # Login, Register, Guest
│   │   │   ├── admin/        # Users, Guest Links
│   │   │   ├── team/         # Dashboard, Roster, Calendar, etc.
│   │   │   ├── coach/        # Training
│   │   │   ├── performance/  # Stats, Reports
│   │   │   ├── club/         # Settings, Workspace
│   │   │   └── demo/         # Demo mode
│   │   └── components/
│   │       └── layout/        # Sidebar, Header
│   ├── public/
│   │   └── assets/           # Static assets
│   ├── dist/                 # Build output (gitignore)
│   ├── vite.config.js         # Build config con plugin
│   └── package.json
│
├── backend/
│   ├── api/
│   │   └── index.js          # Tutti gli endpoint API
│   └── package.json
│
├── docs/                     # Documenti partnership
├── landing.html              # Landing page statica
├── AGENTS.md                 # Linee guida per agenti
└── README.md                 # Documentazione
```

## API Design

### Base URL
- **Produzione**: `https://youth-football-manager-backend.vercel.app/api`
- **Locale**: `http://localhost:3001/api`

### Endpoint Principali

#### Auth
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | `/auth/login` | Login utente |
| POST | `/auth/register` | Registrazione |
| GET | `/auth/me` | Profilo utente |
| GET | `/auth/users` | Lista utenti (admin) |
| POST | `/auth/users` | Crea utente (admin) |
| PUT | `/auth/users/:id` | Modifica utente (admin) |
| DELETE | `/auth/users/:id` | Disattiva utente (admin) |
| POST | `/auth/guest-link` | Genera link guest |
| GET | `/auth/guest-links` | Lista link guest |
| DELETE | `/auth/guest-link/:token` | Revoca link |

#### Teams
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/squadre` | Lista squadre |
| GET | `/squadre/:id` | Dettaglio squadra |
| GET | `/squadre/:id/statistiche-complete` | Stats complete |
| GET | `/squadre/:id/top-players` | Top marcatori/assist |

#### Matches
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/partite/:id/dettaglio` | Dettaglio con eventi |
| GET | `/squadre/:id/partite-future` | Prossime partite |
| PUT | `/partite/:id/archivia` | Archivia partita |
| PUT | `/partite/:id/sblocca` | Sblocca partita |

#### Lineups & Events
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/partite/:id/formazione` | Formazione |
| POST | `/partite/:id/formazione` | Salva formazione |
| GET | `/partite/:id/convocazioni` | Convocazioni |
| POST | `/partite/:id/evento-item` | Inserisci evento |
| POST | `/partite/:id/eventi-batch` | Batch eventi |
| DELETE | `/partite/:id/eventi-batch` | Elimina eventi |

## Schema Database

### Tabelle Principali

```sql
-- Workspace (Multi-tenant)
workspace (id, nome, logo_url, data_creazione)

-- Stagione
stagione (id, workspace_id, nome, data_inizio, data_fine, is_attiva)

-- Squadra
squadra (id, stagione_id, nome, categoria, allenatore, dirigente, ...)

-- Giocatore
calciatori (id, nome, cognome, data_nascita, ruolo, numero_maglia, ...)

-- Rosa (associazione giocatore-squadra)
rosa (id, squadra_id, calciatore_id, ...)

-- Partita
partita (id, squadra_id, avversario, data, luogo, risultato_casa, 
         risultato_ospite, archiviata, ...)

-- Eventi Partita
evento_partita (id, partita_id, calciatore_id, tipo, minuto, ...)

-- Convocazione
convocazione (id, partita_id, calciatore_id, confermata, ...)

-- Formazione
formazione_partita (id, partita_id, calciatore_id, ruolo_in_partita, ...)

-- Valutazioni
valutazione_partita (id, partita_id, calciatore_id, voto, ...)

-- Utenti e Auth
utente (id, email, password_hash, nome, cognome, ruolo, workspace_id, ...)
guest_token (id, token, tipo, utente_id, scadenza, ...)
```

## Gestione Multi-Workspace

Ogni workspace rappresenta una **società sportiva** isolata.

```
┌─────────────────────────────────────────┐
│           TUTTI I WORKSPACE             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ ASD     │ │ ASD     │ │ Progetto│    │
│  │ Alba    │ │ Green   │ │ Demo    │    │
│  │ Longa   │ │ Academy │ │         │    │
│  └────┬────┘ └────┬────┘ └────┬────┘    │
│       │           │           │          │
│  Sq.Under10 │ Sq.Under12 │ Sq.Demo  │
└─────────────────────────────────────────┘
```

**Isolamento**: 
- Query sempre filtrate per `workspace_id`
- API `/auth/workspaces` restituisce squadre per workspace utente

## Build System

### Build ID
- **Formato**: `v<major>.<minor>.<git-hash>` (es. `v3.14.62f56e8`)
- **Generazione**: Vite plugin in `buildStart`
- **Display**: Footer login e sidebar

### Plugin Vite
```javascript
// frontend-v2/vite.config.js
function generateBuildInfo() {
  const gitHash = execSync('git rev-parse --short HEAD').toString().trim();
  const buildId = `v3.14.${gitHash}`;
  // Scrive in src/build-info.js
}
```

## Variabili d'Ambiente

### Frontend (.env)
```
VITE_API_BASE_URL=https://youth-football-manager-backend.vercel.app/api
```

### Backend (.env)
```
SUPABASE_URL=https://csxdlxbhcnyfppojwwzy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<key>
JWT_SECRET=<secret>
PORT=3001
```

## Deploy Pipeline

```
┌──────────┐    git push     ┌─────────────┐
│  Locale  │ ──────────────► │   GitHub    │
└──────────┘                 └──────┬──────┘
                                   │
                    Vercel webhook │
                                   ▼
                         ┌─────────────────┐
                         │     Vercel      │
                         ├─────────────────┤
                         │ Frontend Build  │ ~1-2 min
                         │ Backend Deploy  │ ~1-2 min
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Produzione    │
                         │ vercel.app      │
                         └─────────────────┘
```

## Sicurezza

### Auth
- Password hash con bcrypt
- JWT con scadenza 7 giorni
- Guest tokens con scadenza configurabile

### Row Level Security (RLS)
- Tutte le tabelle con `workspace_id`
- Policy Supabase per isolamento dati

### CORS
- Solo domini autorizzati in whitelist

## Performance

### Frontend
- Code splitting automatico con Vite
- Lazy loading moduli
- CSS inline critical path
- Cache busting con hash

### Backend
- Connessioni Supabase in pool
- Query ottimizzate con indici
- Warmup endpoint per keep-alive
