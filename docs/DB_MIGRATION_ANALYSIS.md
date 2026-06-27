# 🗄️ ANALISI MIGRAZIONE DATABASE - Youth Football Manager

## 1. Schema Attuale vs Nuovo Schema

### Schema Attuale (PROBLEMATICO)
```
┌─────────────────────────────────────────────────────────────────────┐
│ WORKSPACE                                                            │
│ ├── id, nome, logo_url, indirizzo, telefono, email, sito_web       │
│ ├── season_id (FK) ← RELAZIONE 1:1 FORZATA                         │
│ └──                                                                     │
│     ├── STAGIONE (1:1 con workspace - ERRORE!)                      │
│     │   └── id, nome, anno_inizio, anno_fine, workspace_id          │
│     │                                                                │
│     │   └── SQUADRA (1:N)                                           │
│     │       ├── id, nome, categoria, stagione_id ← NO workspace_id │
│     │       ├── allenatore, dirigente, preparatore_atletico         │
│     │       ├── rosa_id (FK)                                        │
│     │       ├── partite, allenamenti, eventi_partita               │
│     │       └── convocazioni, formazioni                            │
│     │                                                                │
│     │   └── CATEGORIA (non esiste come tabella!)                    │
│     │                                                                │
│     ├── CALCIATORE                                                   │
│     │   └── id, nome, cognome, data_nascita, foto_url               │
│     │       ├── workspace_id ← DOVREBBE ESSERE ANAGRAFICA!         │
│     │       ├── telefono, email                                     │
│     │       ├── certificato_medico, tessera_sanitaria               │
│     │       ├── documento_identità, rilasciato_da                   │
│     │       └── peso, altezza, piede_preferito                      │
│     │                                                                │
│     ├── ROSA (team_player)                                           │
│     │   └── id, squadra_id, calciatore_id, numero_maglia, ruolo     │
│     │       └── data_assegnazione ← MANCA!                          │
│     │                                                                │
│     └── UTENTE                                                       │
│         └── id, nome, cognome, email, ruolo, workspace_id           │
└─────────────────────────────────────────────────────────────────────┘
```

### Nuovo Schema (PROPOSTO)
```
┌─────────────────────────────────────────────────────────────────────┐
│ 📚 ANAGRAFICHE (ENTITÀ PERMANENTI - esistono sempre)                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ WORKSPACE                                                            │
│ └── id, nome, logo_url, indirizzo, telefono, email, sito_web       │
│                                                                      │
│ PLAYER (anagrafica calciatori)                                      │
│ └── id, nome, cognome, data_nascita, sesso, foto_url                │
│     ├── telefono, email                                              │
│     ├── documento_identita (tipo, numero, rilasciato_da, scadenza) │
│     ├── dati_fisici (peso, altezza, piede_preferito)                │
│     ├── foto_url, note                                               │
│     └── created_at, updated_at                                       │
│                                                                      │
│ STAFF (anagrafica staff - NUOVO!)                                   │
│ └── id, nome, cognome, data_nascita, ruolo_staff, foto_url        │
│     ├── telefono, email, professione                                │
│     ├── documento_identita, tessera_sanitaria                       │
│     ├── specializzazioni (patentino allenatore, etc)                │
│     └── created_at, updated_at                                       │
│                                                                      │
│ CATEGORY (categorie/anni di nascita - NUOVO!)                        │
│ └── id, nome, anno_da, anno_a, descrizione                          │
│     └── Esempi: "Under 14", "2009-2010", "Juniores"                │
│                                                                      │
│ COMPETITION (campionati - NUOVO!)                                   │
│ └── id, nome, tipo, federazione, regione, stagione                 │
│     └── Esempi: "Campionato Regionale Lazio", "Coppa Italia"        │
│                                                                      │
│ VENUE (impianti sportivi - NUOVO!)                                  │
│ └── id, nome, indirizzo, città, tipo, capienza, superficie         │
│                                                                      │
│ DOCUMENT (documenti - NUOVO!)                                       │
│ └── id, tipo, entita_tipo, entita_id, file_url, nome_file         │
│     └── Per: certificati medici, tessere FIGC, documenti squadre   │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ 🏆 DATI STAGIONALI (esistono solo per una stagione specifica)       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ SEASON                                                               │
│ └── id, workspace_id (FK), nome, anno_inizio, anno_fine, attiva     │
│     └── data_inizio, data_fine, note                                │
│                                                                      │
│ TEAM (squadra per stagione specifica)                               │
│ └── id, season_id (FK), category_id (FK), nome, colori              │
│     ├── venue_id (FK - casa), allenatore_id, dirigente_id          │
│     ├── preparatore_id, portieri_id, dirigente_aggiuntivo_id       │
│     ├── matricola_figc, iscritta_competizione                       │
│     └── created_at                                                   │
│                                                                      │
│ TEAM_PLAYER (assegnazione stagionale giocatore → squadra)           │
│ └── id, team_id (FK), player_id (FK), numero_maglia, ruolo_preferito│
│     ├── stato (Attivo, Infortunato, Svincolato, Trasferito)        │
│     ├── data_assegnazione, data_cessione                            │
│     └── note                                                         │
│                                                                      │
│ TEAM_STAFF (assegnazione stagionale staff → squadra) - NUOVO!       │
│ └── id, team_id (FK), staff_id (FK), ruolo_squadra                  │
│     ├── data_assegnazione, data_cessione                            │
│     └── note                                                         │
│                                                                      │
│ MATCH                                                                │
│ └── id, team_id (FK), competition_id (FK), venue_id (FK)           │
│     ├── data_ora, avversario, luogo (Casa/Trasferta/Neutro)       │
│     ├── giornata, gol_casa, gol_ospite                              │
│     ├── stato (Da disputare, In corso, Terminata, Annullata)        │
│     ├── note, archiviat                                              │
│     └── created_at                                                   │
│                                                                      │
│ MATCH_EVENT (eventi partita)                                         │
│ └── id, match_id (FK), tipo_evento (GOAL, ASSIST, CARTELLINO, etc) │
│     ├── minuto, player_id (FK), player_id_secondario (FK)          │
│     ├── note                                                        │
│     └── created_at                                                   │
│                                                                      │
│ TRAINING (allenamento)                                               │
│ └── id, team_id (FK), venue_id (FK), data_ora, durata              │
│     ├── tipo, descrizione, note                                     │
│     └── created_at                                                   │
│                                                                      │
│ TRAINING_ATTENDANCE (presenza allenamento) - NUOVO!                 │
│ └── id, training_id (FK), team_player_id (FK)                       │
│     ├── presente, motivi_assenza, note                              │
│     └── created_at                                                   │
│                                                                      │
│ CONVOCATION (convocazione per partita)                              │
│ └── id, match_id (FK), team_player_id (FK)                          │
│     ├── convocato_da, convocato_il                                 │
│     ├── confermato, presente, note                                  │
│     └── created_at                                                   │
│                                                                      │
│ MATCH_FORMATION (formazione partita)                                 │
│ └── id, match_id (FK), team_player_id (FK)                          │
│     ├── posizione, numero_maglia, is_captain, is_vice_captain     │
│     ├── is_starter, ordine_visualizzazione                         │
│     └── created_at                                                   │
│                                                                      │
│ MATCH_STATISTICS (statistiche calciatore per partita)                │
│ └── id, match_id (FK), team_player_id (FK)                          │
│     ├── minuti_giocati, gol, assist, tiri, tiri_in_porta           │
│     ├── passaggi, passaggi_riusciti, palloni_recuperati           │
│     ├── falli_subiti, falli_commessi, ammonizioni, espulsioni      │
│     └── created_at                                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tabelle da CREARE

| Tabella | Descrizione | Priorità |
|---------|-------------|----------|
| `staff` | Anagrafica personale (allenatori, dirigenti) | ALTA |
| `category` | Categorie (U14, U15, U16, etc.) | ALTA |
| `competition` | Campionati/competizioni | MEDIA |
| `venue` | Impianti sportivi | MEDIA |
| `document` | Documenti allegati | MEDIA |
| `team_staff` | Assegnazione staff → squadra per stagione | ALTA |
| `team_player_history` | Storico passaggi tra squadre | BASSA |
| `match_statistics` | Statistiche dettagliate per partita | MEDIA |
| `training_attendance` | Presenze agli allenamenti | ALTA |

---

## 3. Tabelle da MODIFICARE

### 3.1 CALCIATORE → PLAYER
```sql
-- Rimuovere:
- workspace_id (non è più legato a un workspace)

-- Aggiungere:
- sesso (M/F)
- foto_url (già esiste)
- note
- created_at, updated_at

-- Mantenere:
- nome, cognome, data_nascita, telefono, email
- documento_identita, rilasciato_da, scadenza_documento
- peso, altezza, piede_preferito
```

### 3.2 SQUADRA → TEAM
```sql
-- Rimuovere:
- stagione_id (ora passa attraverso SEASON)
- allenatore, dirigente, etc (ora in TEAM_STAFF)

-- Aggiungere:
- season_id (FK - obbligatorio)
- category_id (FK)
- venue_id (FK - campo casa)
- colori (maglia casa/trasferta)
- allenatore_id (FK → staff) [deprecated, usare team_staff]
- iscritta_competizione
- created_at
```

### 3.3 ROSA → TEAM_PLAYER
```sql
-- Rimuovere:
- ruolo (spostato in team_player)

-- Aggiungere:
- team_id (FK - replaces squadra_id)
- player_id (FK - replaces calciatore_id)
- ruolo_preferito (Portiere, Difensore, etc.)
- stato (Attivo, Infortunato, Svincolato, Trasferito)
- data_assegnazione
- data_cessione
```

### 3.4 STAGIONE → SEASON
```sql
-- Rimuovere:
- workspace_id (spostato)

-- Aggiungere:
- workspace_id (FK - già esiste)
- attiva (boolean)
- data_inizio, data_fine
```

---

## 4. Impatto sul Codice Backend

### 4.1 Endpoint da CREARE

```
# Staff
POST   /api/staff                          - Crea staff
GET    /api/staff                          - Lista staff (con filtri)
GET    /api/staff/:id                      - Dettaglio staff
PUT    /api/staff/:id                      - Modifica staff
DELETE /api/staff/:id                      - Elimina staff

# Categories
GET    /api/categories                     - Lista categorie
POST   /api/categories                     - Crea categoria
PUT    /api/categories/:id                - Modifica categoria
DELETE /api/categories/:id                 - Elimina categoria

# Competitions
GET    /api/competitions                    - Lista competizioni
POST   /api/competitions                    - Crea competizione
PUT    /api/competitions/:id               - Modifica competizione

# Venues
GET    /api/venues                         - Lista impianti
POST   /api/venues                         - Crea impianto
PUT    /api/venues/:id                     - Modifica impianto

# Team Staff
GET    /api/teams/:teamId/staff            - Staff di una squadra
POST   /api/teams/:teamId/staff            - Assegna staff a squadra
PUT    /api/team-staff/:id                 - Modifica assegnazione
DELETE /api/team-staff/:id                 - Rimuovi staff da squadra

# Player History
GET    /api/players/:playerId/history       - Storico carriera giocatore
POST   /api/players/:playerId/transfer     - Trasferisci giocatore
```

### 4.2 Endpoint da MODIFICARE

| Endpoint Attuale | Nuovo Endpoint | Modifiche |
|------------------|----------------|-----------|
| `GET /api/squadre` | `GET /api/teams` | Join con season, category |
| `POST /api/squadre` | `POST /api/seasons/:id/teams` | Crea team in stagione |
| `GET /api/squadre/:id/calciatori` | `GET /api/teams/:id/players` | Query su team_player |
| `POST /api/squadre/:id/calciatori` | `POST /api/teams/:id/players` | Insert in team_player |
| `GET /api/partite` | `GET /api/matches` | Filtri per season/team |
| `POST /api/partite` | `POST /api/teams/:id/matches` | Insert in match |
| `GET /api/calciatori/:id/stats` | `GET /api/players/:id/statistics` | Query aggregate |
| `GET /api/calciatori/:id/career` | `GET /api/players/:id/history` | Join team_player history |

### 4.3 Endpoint da ELIMINARE

```
- POST /api/squadre/:id/sposta-partite (non più necessario con nuova struttura)
- POST /api/squadre/:id/sposta-allenamenti (non più necessario)
- POST /api/calciatori-batch-insert (sostituito da batch team_player)
```

---

## 5. Impatto sul Codice Frontend

### 5.1 Pagine da Modificare

| Pagina Attuale | Nuova Pagina | Note |
|----------------|--------------|------|
| `/squadre` | `/teams` | Lista squadre per stagione |
| `/squadre/[id]` | `/teams/[id]` | Dettaglio squadra con tab staff |
| `/calciatori` | `/players` | Anagrafica giocatori (tutti i workspace) |
| `/calciatori/[id]` | `/players/[id]` | Profilo + storico carriera |
| `/staff` (non esiste) | `/staff` | Nuova pagina per gestione staff |
| `/categorie` (non esiste) | `/categories` | Gestione categorie |
| `/stagioni` | `/seasons` | Gestione stagioni con statistiche |

### 5.2 Componenti da Modificare

```typescript
// Struttura dati frontend - CAMBIARE DA:

interface Squadra {
  id: string;
  nome: string;
  categoria: string;
  stagione_id: string;
  allenatore: string;
  dirigente: string;
}

interface Calciatore {
  id: string;
  nome: string;
  cognome: string;
  data_nascita: string;
  workspace_id: string; // ❌ RIMUOVERE
  // ... altri campi
}

// A:

interface Team {
  id: string;
  season_id: string;
  category_id: string;
  nome: string;
  colori: { casa: string; trasferta: string };
  venue_id: string;
}

interface TeamPlayer {
  id: string;
  team_id: string;
  player_id: string;
  numero_maglia: number;
  ruolo_preferito: string;
  stato: 'Attivo' | 'Infortunato' | 'Svincolato' | 'Trasferito';
  data_assegnazione: string;
}

interface Player {
  id: string;
  nome: string;
  cognome: string;
  data_nascita: string;
  // NO workspace_id - è anagrafica permanente!
  documenti: Document[];
  foto_url: string;
}

interface Staff {
  id: string;
  nome: string;
  cognome: string;
  ruolo_staff: 'Allenatore' | 'Dirigente' | 'Preparatore' | 'Allenatore Portieri';
  specializzazioni: string[];
}

interface TeamStaff {
  id: string;
  team_id: string;
  staff_id: string;
  ruolo_squadra: string;
  data_assegnazione: string;
}
```

---

## 6. Piano di Migrazione Dati

### Fase 1: Backup
```sql
-- Backup completo del database prima della migrazione
-- Eseguire snapshot/manual backup
```

### Fase 2: Creazione Tabelle
```sql
-- 1. Crea nuove tabelle (anagrafiche)
CREATE TABLE category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  anno_da INTEGER,
  anno_a INTEGER,
  descrizione TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  cognome VARCHAR(100) NOT NULL,
  data_nascita DATE,
  ruolo_staff VARCHAR(50) NOT NULL,
  telefono VARCHAR(50),
  email VARCHAR(255),
  documento_tipo VARCHAR(50),
  documento_numero VARCHAR(50),
  documento_rilasciato_da VARCHAR(255),
  documento_scadenza DATE,
  foto_url TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Crea tabelle relazionali
CREATE TABLE team_player (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES team(id),
  player_id UUID REFERENCES player(id),
  numero_maglia INTEGER,
  ruolo_preferito VARCHAR(50),
  stato VARCHAR(50) DEFAULT 'Attivo',
  data_assegnazione DATE DEFAULT CURRENT_DATE,
  data_cessione DATE,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES team(id),
  staff_id UUID REFERENCES staff(id),
  ruolo_squadra VARCHAR(100) NOT NULL,
  data_assegnazione DATE DEFAULT CURRENT_DATE,
  data_cessione DATE,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Aggiungi colonne a tabelle esistenti
ALTER TABLE player ADD COLUMN sesso VARCHAR(1) DEFAULT 'M';
ALTER TABLE player ADD COLUMN scadenza_documento DATE;
ALTER TABLE player ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

ALTER TABLE team ADD COLUMN category_id UUID REFERENCES category(id);
ALTER TABLE team ADD COLUMN colori JSONB;
ALTER TABLE team ADD COLUMN venue_id UUID;
ALTER TABLE team ADD COLUMN created_at TIMESTAMP DEFAULT NOW();

ALTER TABLE season ADD COLUMN attiva BOOLEAN DEFAULT false;
ALTER TABLE season ADD COLUMN data_inizio DATE;
ALTER TABLE season ADD COLUMN data_fine DATE;
```

### Fase 3: Migrazione Dati
```sql
-- 1. Migra categorie
INSERT INTO category (id, nome, anno_da, anno_a, descrizione)
SELECT DISTINCT 
  gen_random_uuid(),
  categoria,
  CAST(SPLIT_PART(categoria, ' ', 2) AS INTEGER) - 14, -- anno Da calcolato
  CAST(SPLIT_PART(categoria, ' ', 2) AS INTEGER),
  categoria
FROM team WHERE categoria IS NOT NULL;

-- 2. Migra calciatori → players (rimuovi workspace_id)
INSERT INTO player (id, nome, cognome, data_nascita, telefono, email, 
                   documento_tipo, documento_numero, rilasciato_da,
                   peso, altezza, piede_preferito, foto_url)
SELECT id, nome, cognome, data_nascita, telefono, email,
       tipo_documento, numero_documento, rilasciato_da,
       peso, altezza, piede_preferito, foto_url
FROM calciatore;

-- 3. Migra rosa → team_player
INSERT INTO team_player (id, team_id, player_id, numero_maglia, ruolo_preferito, stato)
SELECT r.id, r.squadra_id, r.calciatore_id, r.numero_maglia, r.ruolo, r.stato
FROM rosa r;

-- 4. Migra staff (crea da nomi nella tabella team)
INSERT INTO staff (id, nome, cognome, ruolo_staff)
SELECT 
  gen_random_uuid(),
  SPLIT_PART(allenatore, ' ', 1),
  SPLIT_PART(allenatore, ' ', 2),
  'Allenatore'
FROM team WHERE allenatore IS NOT NULL AND allenatore != '';
```

### Fase 4: Cleanup
```sql
-- Rimuovi vecchie tabelle/colonne (dopo verifica)
-- DROP TABLE rosa;
-- DROP TABLE calciatore;
-- ALTER TABLE team DROP COLUMN categoria;
-- ALTER TABLE team DROP COLUMN allenatore;
-- etc.
```

---

## 7. Stima Effort

| Fase | Descrizione | Tempo Stimato |
|------|-------------|---------------|
| 1 | Analisi e pianificazione | 2-4h |
| 2 | Creazione tabelle + migrazione | 4-8h |
| 3 | Backend - Refactor endpoints | 16-24h |
| 4 | Backend - Nuovi endpoints | 8-12h |
| 5 | Frontend - Update store/context | 8-12h |
| 6 | Frontend - Update pagine | 16-24h |
| 7 | Testing completo | 8-16h |
| 8 | Fix bug + ottimizzazione | 8-16h |
| **TOTALE** | | **70-116h** |

---

## 8. Raccomandazioni

### Opzione A: Migrazione Completa (70-116h)
- Nuovo database da zero
- Migrazione dati con script
- Refactor completo codice
- **Vantaggi**: Struttura pulita, scalabile
- **Svantaggi**: Tempo elevato, rischio regressioni

### Opzione B: Migrazione Incrementale (40-60h)
- Aggiungere colonne alle tabelle esistenti (denormalizzazione)
- Mantenere compatibilità con codice esistente
- Aggiungere nuove tabelle senza modificare le esistenti
- Refactor progressivo
- **Vantaggi**: Meno rischi, graduale
- **Svantaggi**: Schema ibrido temporaneo

### Opzione C: Quick Fix (8-16h)
- Aggiungere solo `workspace_id` a `team`
- Separare `staff` da `team`
- Non toccare la struttura giocatore (già funziona)
- **Vantaggi**: Minimo sforzo,解决问题 immediato
- **Svantaggi**: Non risolve il problema storico

---

## 9. Prossimi Passi

1. [ ] Decisione su quale opzione adottare (A, B, o C)
2. [ ] Backup completo database
3. [ ] Creazione environment di test
4. [ ] Implementazione fase 1
5. [ ] Testing
6. [ ] Deploy progressivo

---

*Documento generato: 2026-06-27*
*Autore: AI Assistant per Youth Football Manager*
