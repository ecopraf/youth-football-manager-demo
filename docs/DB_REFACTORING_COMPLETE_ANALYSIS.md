# 🔄 ANALISI COMPLETA REFACTORING DATABASE - Youth Football Manager

## 1. STATO ATTUALE VERIFICATO

### 1.1 Schema DB Attuale

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ATTUALE                                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ WORKSPACE (4 esistenti)                                                     │
│ └── id, nome, logo_url, data_creazione                                      │
│                                                                              │
│ STAGIONE (attuale)                                                          │
│ └── id, workspace_id, nome, anno_inizio, anno_fine                          │
│     └── Relazione: 1 workspace → n stagioni (MA FUNZIONA BENE)              │
│                                                                              │
│ SQUADRA (7 esistenti)                                                       │
│ └── id, stagione_id, nome, categoria                                        │
│     ├── allenatore (stringa), dirigente (stringa)                           │
│     ├── preparatore_atletico, allenatore_portieri, dirigente2               │
│     ├── matricola_dirigente, tessera_lnd_dirigente, tessera_figc            │
│     └── ⚠️ PROBLEMA: NON ha workspace_id diretto!                           │
│         Per ottenere workspace → squadra → stagione → workspace               │
│                                                                              │
│ CALCIATORE (tabella esistente)                                              │
│ └── id, workspace_id, nome, cognome, data_nascita                          │
│     ├── telefono, email, foto_url                                           │
│     ├── tipo_documento, numero_documento, rilasciato_da                    │
│     ├── data_visita_medica, note_mediche                                    │
│     ├── peso, altezza, piede_preferito                                     │
│     └── ⚠️ PROBLEMA: Ha workspace_id (dovrebbe essere anagrafica!)          │
│                                                                              │
│ ROSA (team_player attuale)                                                  │
│ └── id, squadra_id, calciatore_id, numero_maglia, ruolo, stato              │
│     └── ⚠️ PROBLEMA: Non ha riferimento alla stagione!                     │
│         Una volta assegnato, il giocatore resta sempre nella stessa squadra   │
│                                                                              │
│ PARTITA                                                                       │
│ └── id, squadra_id, data_ora, avversario, luogo, competizione, giornata     │
│     ├── gol_casa, gol_ospite, stato                                         │
│     └── archiviat, note_avversario                                           │
│                                                                              │
│ ALLENAMENTO                                                                 │
│ └── id, squadra_id, data_ora, durata, luogo, tipo, descrizione              │
│                                                                              │
│ UTENTE (auth.users)                                                         │
│ └── id, workspace_id, nome, cognome, email, ruolo                          │
│     ├── ruoli[], squadre_accesso[]                                          │
│     └── is_superadmin, is_active                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Problemi Critici Identificati

| # | Problema | Impatto | Gravità |
|---|----------|---------|---------|
| 1 | `squadra` non ha `workspace_id` | Query lente, rischio orphan data | 🔴 ALTA |
| 2 | `calciatore` ha `workspace_id` | Non può cambiare società tra stagioni | 🔴 ALTA |
| 3 | `rosa` non ha riferimento stagione | Giocatore resta sempre nella stessa squadra | 🔴 ALTA |
| 4 | `staff` non esiste come entità | Dati allenatore sono stringhe in `squadra` | 🟡 MEDIA |
| 5 | `category` non esiste come entità | Categorie hard-coded o duplicate | 🟡 MEDIA |
| 6 | Nessuno storico carriere | Impossibile tracciare passato giocatore | 🟡 MEDIA |

---

## 2. NUOVO SCHEMA DEFINITIVO

### 2.1 Schema Proposto

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📚 ANAGRAFICHE (ENTITÀ PERMANENTI)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ WORKSPACE                                                                    │
│ ├── id, nome, logo_url, indirizzo, telefono, email, sito_web, social        │
│ └── data_creazione, is_active, settings (JSONB)                             │
│                                                                              │
│ PLAYER (ex calciatore)                                                      │
│ ├── id, nome, cognome, data_nascita, sesso, foto_url                       │
│ ├── telefono, email                                                        │
│ ├── documento: tipo, numero, rilasciato_da, scadenza                        │
│ ├── dati_fisici: peso, altezza, piede_preferito                            │
│ ├── certificato_medico: data, scadenza, id_file                             │
│ ├── foto_url, note                                                        │
│ └── created_at, updated_at                                                 │
│                                                                              │
│ STAFF (NUOVA!)                                                             │
│ ├── id, nome, cognome, data_nascita, sesso, foto_url                        │
│ ├── ruolo: tipo (Allenatore, Dirigente, Preparatore, etc.)                  │
│ ├── telefono, email                                                        │
│ ├── qualifiche: patentino, tessera_lnd, certificato, scadenze               │
│ ├── documento: tipo, numero, rilasciato_da, scadenza                        │
│ └── created_at, updated_at                                                 │
│                                                                              │
│ CATEGORY (NUOVA!)                                                           │
│ ├── id, nome, anno_da, anno_a, genere, descrizione                         │
│ └── Esempi: "Under 14" (2009-2010), "Juniores" (2007-2008)               │
│                                                                              │
│ COMPETITION (NUOVA!)                                                       │
│ ├── id, nome, tipo (Campionato, Coppa, Torneo), federazione                 │
│ ├── regione, stagione, anno                                                │
│ └── descrizione, logo_url                                                  │
│                                                                              │
│ FACILITY (NUOVA!)                                                          │
│ ├── id, nome, indirizzo, città, capienza, superficie                       │
│ ├── tipo (Campo, Palestra, etc.), illuminazione, servizi                    │
│ └── coordinate_gps, note                                                   │
│                                                                              │
│ DOCUMENT (NUOVA!)                                                           │
│ ├── id, tipo (Certificato, Tessera, Modulo, Report)                        │
│ ├── entita_tipo, entita_id (polimorfica)                                   │
│ ├── file_url, nome_file, mime_type, dimensione                               │
│ └── data_upload, scadenza, note                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏆 DATI STAGIONALI (dipendono da SEASON)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ SEASON (ex stagione)                                                        │
│ ├── id, workspace_id (FK), nome, anno_inizio, anno_fine                    │
│ ├── data_inizio, data_fine                                                 │
│ ├── attiva (boolean - solo una per workspace)                               │
│ ├── is_default (boolean)                                                   │
│ └── note, settings (JSONB)                                                 │
│                                                                              │
│ TEAM (ex squadra)                                                          │
│ ├── id, season_id (FK), category_id (FK), nome                              │
│ ├── colori_casa, colori_trasferta                                         │
│ ├── venue_id (FK - campo casa), allenatore_id (FK → staff)                │
│ ├── dirigente_id (FK → staff), preparatore_id, portieri_id                 │
│ ├── matricola_figc, iscritta_competizione (FK → competition)              │
│ ├── note, created_at                                                       │
│ └── Relazione: 1 season → n teams                                          │
│                                                                              │
│ TEAM_PLAYER (ex rosa)                                                       │
│ ├── id, team_id (FK), player_id (FK), numero_maglia                       │
│ ├── ruolo_preferito (Portiere, Difensore, etc.)                           │
│ ├── stato (Attivo, Infortunato, Svincolato, Trasferito)                  │
│ ├── data_assegnazione, data_cessione                                      │
│ └── note                                                                   │
│                                                                              │
│ TEAM_STAFF (NUOVA!)                                                        │
│ ├── id, team_id (FK), staff_id (FK)                                       │
│ ├── ruolo_squadra (Capo Allenatore, Allenatore, Assistente, Dirigente)    │
│ ├── data_assegnazione, data_cessione                                      │
│ └── note                                                                   │
│                                                                              │
│ MATCH (ex partita)                                                          │
│ ├── id, team_id (FK), competition_id (FK), venue_id (FK)                 │
│ ├── data_ora, avversario, luogo (Casa/Trasferta/Neutro)                  │
│ ├── giornata, gol_casa, gol_ospite                                         │
│ ├── stato (Da disputare/In corso/Terminata/Annullata)                     │
│ ├── archiviat, note, note_avversario                                      │
│ └── created_at                                                             │
│                                                                              │
│ MATCH_EVENT (ex evento_partita)                                            │
│ ├── id, match_id (FK), tipo_evento (GOAL, ASSIST, AMMONIZIONE, etc.)     │
│ ├── minuto, player_id (FK), player_id_secondario (FK)                      │
│ ├── note, created_at                                                       │
│ └── Relazione: 1 match → n events                                         │
│                                                                              │
│ MATCH_FORMATION                                                             │
│ ├── id, match_id (FK), team_player_id (FK)                                │
│ ├── posizione, numero_maglia, is_captain, is_vice_captain                │
│ ├── is_starter, ordine                                                    │
│ └── created_at                                                             │
│                                                                              │
│ CONVOCATION                                                                │
│ ├── id, match_id (FK), team_player_id (FK)                                │
│ ├── convocato_da (staff_id), convocato_il                                 │
│ ├── confermato, presente, note                                            │
│ └── created_at                                                             │
│                                                                              │
│ TRAINING (ex allenamento)                                                   │
│ ├── id, team_id (FK), venue_id (FK), data_ora, durata                    │
│ ├── tipo, descrizione, note                                               │
│ └── created_at                                                             │
│                                                                              │
│ TRAINING_ATTENDANCE (NUOVA!)                                               │
│ ├── id, training_id (FK), team_player_id (FK)                             │
│ ├── presente, motivi_assenza, note                                        │
│ └── created_at                                                             │
│                                                                              │
│ MATCH_STATISTICS (NUOVA!)                                                  │
│ ├── id, match_id (FK), team_player_id (FK)                                │
│ ├── minuti_giocati, gol, assist, tiri, tiri_in_porta                     │
│ ├── passaggi, passaggi_riusciti, palloni_recuperati                       │
│ ├── falli_subiti, falli_commessi, ammonizioni, espulsioni                │
│ └── created_at                                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. MATRICE DI MIGRAZIONE

### 3.1 Tabelle: Esistente → Nuovo

| Tabella Attuale | Nuova Tabella | Tipo | Azione |
|-----------------|---------------|------|--------|
| `workspace` | `workspace` | Mantieni | Aggiungi campi mancanti |
| `stagione` | `season` | Rinomina | Aggiungi `attiva`, `data_inizio`, `data_fine` |
| `squadra` | `team` | Separazione | Estrai anagrafica → team; gestione → workspace |
| `calciatore` | `player` | Ristruttura | Rimuovi `workspace_id`, aggiungi campi anagrafici |
| `rosa` | `team_player` | Modifica | Aggiungi `season_id` implicito, `data_assegnazione` |
| - | `staff` | NUOVA | Crea da campi stringa in `squadra` |
| - | `team_staff` | NUOVA | Crea da campi stringa in `squadra` |
| - | `category` | NUOVA | Crea da valori unici di `squadra.categoria` |
| - | `competition` | NUOVA | Crea da valori unici di `partita.competizione` |
| - | `facility` | NUOVA | Crea da luoghi unici di `allenamento.luogo` |
| - | `document` | NUOVA | Collega documenti in modo polimorfico |
| `partita` | `match` | Rinomina | Aggiorna FK `squadra_id` → `team_id` |
| `evento_partita` | `match_event` | Rinomina | Aggiorna FK, aggiungi `player_id` |
| `allenamento` | `training` | Rinomina | Aggiorna FK, gestisci `venue_id` |
| `presenza_allenamento` | `training_attendance` | Rinomina | Aggiorna FK con `team_player_id` |
| `convocazione` | `convocation` | Rinomina | Aggiorna FK con `team_player_id` |
| `formazione_partita` | `match_formation` | Rinomina | Aggiorna FK con `team_player_id` |
| - | `match_statistics` | NUOVA | Statistiche dettagliate match |
| `utente`/`auth.users` | `utente` | Mantieni | Aggiungi riferimenti a `staff` |

### 3.2 Endpoint API: Impatto Completo

| Endpoint Attuale | Nuovo Endpoint | Metodo | Modifiche |
|-----------------|----------------|--------|-----------|
| `GET /api/workspaces` | `GET /api/workspaces` | GET | Nessuna |
| `POST /api/workspaces` | `POST /api/workspaces` | POST | Aggiungi settings |
| `GET /api/stagioni` | `GET /api/seasons` | GET | Rinomina + filtri |
| `POST /api/stagioni` | `POST /api/workspaces/:id/seasons` | POST | Spostato sotto workspace |
| `GET /api/squadre` | `GET /api/seasons/:id/teams` | GET | Filtra per season |
| `POST /api/squadre` | `POST /api/seasons/:id/teams` | POST | Crea team in season |
| `GET /api/squadre/:id` | `GET /api/teams/:id` | GET | Dettaglio team |
| `PUT /api/squadre/:id` | `PUT /api/teams/:id` | PUT | Aggiorna team |
| `DELETE /api/squadre/:id` | `DELETE /api/teams/:id` | DELETE | Elimina team |
| `GET /api/squadre/:id/calciatori` | `GET /api/teams/:id/players` | GET | Query team_player join player |
| `POST /api/squadre/:id/calciatori` | `POST /api/teams/:id/players` | POST | Insert team_player |
| `DELETE /api/squadre/:id/calciatori/:cid` | `DELETE /api/teams/:id/players/:pid` | DELETE | Update team_player.stato |
| `GET /api/calciatori` | `GET /api/players` | GET | Lista anagrafica player |
| `GET /api/calciatori/:id` | `GET /api/players/:id` | GET | Dettaglio player |
| `PUT /api/calciatori/:id` | `PUT /api/players/:id` | PUT | Aggiorna player |
| `GET /api/calciatori/:id/stats` | `GET /api/players/:id/statistics` | GET | Aggrega da match_events |
| `GET /api/calciatori/:id/career` | `GET /api/players/:id/history` | GET | Storico team_player |
| - | `GET /api/staff` | GET | Lista anagrafica staff |
| - | `POST /api/staff` | POST | Crea staff |
| - | `GET /api/teams/:id/staff` | GET | Staff assegnati al team |
| - | `POST /api/teams/:id/staff` | POST | Assegna staff a team |
| - | `GET /api/categories` | GET | Lista categorie |
| - | `POST /api/categories` | POST | Crea categoria |
| - | `GET /api/competitions` | GET | Lista competizioni |
| - | `POST /api/competitions` | POST | Crea competizione |
| - | `GET /api/facilities` | GET | Lista impianti |
| - | `POST /api/facilities` | POST | Crea impianto |
| `GET /api/squadre/:id/partite` | `GET /api/teams/:id/matches` | GET | Lista match |
| `POST /api/squadre/:id/partite` | `POST /api/teams/:id/matches` | POST | Crea match |
| `GET /api/partite/:id` | `GET /api/matches/:id` | GET | Dettaglio match |
| `PUT /api/partite/:id` | `PUT /api/matches/:id` | PUT | Aggiorna match |
| `GET /api/partite/:id/dettaglio` | `GET /api/matches/:id/details` | GET | Match + eventi |
| `GET /api/squadre/:id/allenamenti` | `GET /api/teams/:id/trainings` | GET | Lista training |
| `POST /api/squadre/:id/allenamenti` | `POST /api/teams/:id/trainings` | POST | Crea training |

---

## 4. IMPATTO FRONTEND

### 4.1 TypeScript Interfaces

```typescript
// ===== ANAGRAFICHE =====

interface Workspace {
  id: string;
  nome: string;
  logo_url?: string;
  indirizzo?: string;
  telefono?: string;
  email?: string;
  sito_web?: string;
  social?: { tipo: string; url: string }[];
  is_active: boolean;
  settings?: Record<string, unknown>;
  data_creazione: string;
}

interface Player {
  id: string;
  nome: string;
  cognome: string;
  data_nascita: string;
  sesso?: 'M' | 'F';
  foto_url?: string;
  telefono?: string;
  email?: string;
  documento?: {
    tipo: string;
    numero: string;
    rilasciato_da: string;
    scadenza: string;
  };
  dati_fisici?: {
    peso?: number;
    altezza?: number;
    piede_preferito: 'Destro' | 'Sinistro' | 'Ambidestro';
  };
  certificato_medico?: {
    data: string;
    scadenza: string;
    file_url?: string;
  };
  note?: string;
  created_at: string;
  updated_at: string;
}

interface Staff {
  id: string;
  nome: string;
  cognome: string;
  data_nascita?: string;
  sesso?: 'M' | 'F';
  foto_url?: string;
  telefono?: string;
  email?: string;
  ruolo: 'Allenatore' | 'Dirigente' | 'Preparatore Atletico' | 'Allenatore Portieri' | 'Fisioterapista' | 'Medico' | 'Team Manager';
  qualifiche?: {
    patentino?: string;
    tessera_lnd?: string;
    certificato?: string;
    scadenze?: { tipo: string; data: string }[];
  };
  documento?: {
    tipo: string;
    numero: string;
    rilasciato_da: string;
    scadenza: string;
  };
  note?: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  nome: string;
  anno_da: number;
  anno_a: number;
  genere?: 'M' | 'F' | 'Unisex';
  descrizione?: string;
}

interface Competition {
  id: string;
  nome: string;
  tipo: 'Campionato' | 'Coppa' | 'Torneo' | 'Amichevole';
  federazione?: string;
  regione?: string;
  stagione?: string;
  descrizione?: string;
  logo_url?: string;
}

interface Facility {
  id: string;
  nome: string;
  indirizzo?: string;
  città?: string;
  capienza?: number;
  superficie?: 'Erba' | 'Sintetico' | 'Pavimentato' | 'Misto';
  tipo?: string;
  illuminazione?: boolean;
  servizi?: string[];
  coordinate_gps?: { lat: number; lng: number };
  note?: string;
}

// ===== DATI STAGIONALI =====

interface Season {
  id: string;
  workspace_id: string;
  nome: string;
  anno_inizio: number;
  anno_fine: number;
  data_inizio?: string;
  data_fine?: string;
  attiva: boolean;
  is_default?: boolean;
  note?: string;
  settings?: Record<string, unknown>;
}

interface Team {
  id: string;
  season_id: string;
  category_id: string;
  nome: string;
  colori_casa?: string;
  colori_trasferta?: string;
  venue_id?: string;
  allenatore_id?: string;
  dirigente_id?: string;
  preparatore_id?: string;
  portieri_id?: string;
  matricola_figc?: string;
  iscritta_competizione?: string;
  note?: string;
  created_at: string;
}

interface TeamPlayer {
  id: string;
  team_id: string;
  player_id: string;
  numero_maglia?: number;
  ruolo_preferito: 'Portiere' | 'Difensore' | 'Centrocampista' | 'Attaccante' | 'Ala' | 'Trequartista';
  stato: 'Attivo' | 'Infortunato' | 'Svincolato' | 'Trasferito' | 'Sospeso';
  data_assegnazione: string;
  data_cessione?: string;
  note?: string;
  // JOIN
  player?: Player;
  team?: Team;
}

interface TeamStaff {
  id: string;
  team_id: string;
  staff_id: string;
  ruolo_squadra: 'Capo Allenatore' | 'Allenatore' | 'Assistente' | 'Dirigente' | 'Accompagnatore';
  data_assegnazione: string;
  data_cessione?: string;
  note?: string;
  // JOIN
  staff?: Staff;
  team?: Team;
}

interface Match {
  id: string;
  team_id: string;
  competition_id?: string;
  venue_id?: string;
  data_ora: string;
  avversario: string;
  luogo: 'Casa' | 'Trasferta' | 'Neutro';
  giornata?: number;
  gol_casa?: number;
  gol_ospite?: number;
  stato: 'Da disputare' | 'In corso' | 'Terminata' | 'Annullata' | 'Rinviata';
  archiviat: boolean;
  note?: string;
  note_avversario?: string;
  created_at: string;
  // JOIN
  team?: Team;
  competition?: Competition;
  venue?: Facility;
}

interface MatchEvent {
  id: string;
  match_id: string;
  tipo_evento: 'GOAL' | 'AUTOGOL' | 'ASSIST' | 'AMMONIZIONE' | 'ESPULSIONE' | 'AMMONIZIONE_2' | 'RIGORE' | 'RIGORE_SBAGLIATO' | 'PARATA' | 'ASSIST';
  minuto: number;
  player_id: string;
  player_id_secondario?: string;
  note?: string;
  created_at: string;
  // JOIN
  player?: Player;
}

interface Training {
  id: string;
  team_id: string;
  venue_id?: string;
  data_ora: string;
  durata_minuti?: number;
  tipo?: 'Tattico' | 'Tecnico' | 'Atletico' | 'Recupero' | 'Conferenza';
  descrizione?: string;
  note?: string;
  created_at: string;
}

interface TrainingAttendance {
  id: string;
  training_id: string;
  team_player_id: string;
  presente: boolean;
  motivi_assenza?: string;
  note?: string;
  created_at: string;
}

interface Convocazione {
  id: string;
  match_id: string;
  team_player_id: string;
  convocato_da?: string;
  convocato_il: string;
  confermato?: boolean;
  presente?: boolean;
  note?: string;
  created_at: string;
}

interface MatchFormation {
  id: string;
  match_id: string;
  team_player_id: string;
  posizione: string;
  numero_maglia: number;
  is_captain: boolean;
  is_vice_captain: boolean;
  is_starter: boolean;
  ordine: number;
  created_at: string;
}
```

### 4.2 Pagine Frontend - Modifiche

| Pagina Attuale | Nuova Pagina | Componente Store/State |
|---------------|--------------|------------------------|
| `/dashboard` | `/dashboard` | Aggiorna per usare workspace + season attivi |
| `/squadre` | `/teams` | Lista teams per season |
| `/squadre/[id]` | `/teams/[id]` | Dettaglio team con tab staff/giocatori |
| `/squadre/[id]/rosa` | `/teams/[id]/players` | Gestione rosa team |
| `/calciatori` | `/players` | Anagrafica player (tutti i workspace) |
| `/calciatori/[id]` | `/players/[id]` | Profilo + storico carriera + statistiche |
| `/staff` (nuovo) | `/staff` | Gestione anagrafica staff |
| `/staff/[id]` | `/staff/[id]` | Profilo staff |
| `/categorie` (nuovo) | `/categories` | Gestione categorie |
| `/competizioni` (nuovo) | `/competitions` | Gestione competizioni |
| `/impianti` (nuovo) | `/facilities` | Gestione impianti |
| `/stagioni` | `/seasons` | Gestione stagioni per workspace |
| `/partite` | `/matches` | Calendario match |
| `/partite/[id]` | `/matches/[id]` | Dettaglio match |
| `/allenamenti` | `/trainings` | Calendario allenamenti |
| `/report` | `/reports` | Report per season |

### 4.3 State Management (AuthStore)

```typescript
// AuthContext/Store attuale
interface AuthState {
  user: User;
  workspace: Workspace;
  // MANCANTE: season
}

// Nuovo AuthState
interface AuthState {
  user: User;
  workspace: Workspace;
  season: Season | null;  // NUOVO - stagione attiva
  teams: Team[];          // Squadre per la stagione attiva
  currentTeam: Team | null; // Squadra selezionata
}

// Hook per accesso ai dati
function useTeamContext() {
  const { workspace, season, currentTeam } = useAuth();
  
  return {
    workspace,
    season,
    currentTeam,
    // Helper per ottenere team specifico
    getTeam: (id: string) => teams.find(t => t.id === id),
    // Helper per verifica accesso
    canAccessTeam: (teamId: string) => teams.some(t => t.id === teamId),
  };
}
```

---

## 5. PIANO DI MIGRAZIONE Dettagliato

### Fase 1: Backup e Preparazione (2-4h)

```bash
# 1. Backup completo database Supabase
# 2. Creare branch feature/database-refactor
# 3. Creare ambiente di staging/test
# 4. Documentare mapping tabelle attuali → nuove
```

### Fase 2: Database - Creazione Nuove Tabelle (4-6h)

```sql
-- 2.1 Crea tabella staff
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  cognome VARCHAR(100) NOT NULL,
  data_nascita DATE,
  sesso VARCHAR(1) DEFAULT 'M',
  foto_url TEXT,
  telefono VARCHAR(50),
  email VARCHAR(255),
  ruolo VARCHAR(50) NOT NULL,
  qualifiche JSONB DEFAULT '{}',
  documento JSONB DEFAULT '{}',
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2.2 Crea tabella category
CREATE TABLE category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  anno_da INTEGER NOT NULL,
  anno_a INTEGER NOT NULL,
  genere VARCHAR(10) DEFAULT 'M',
  descrizione TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2.3 Crea tabella competition
CREATE TABLE competition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'Campionato',
  federazione VARCHAR(100),
  regione VARCHAR(100),
  logo_url TEXT,
  descrizione TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2.4 Crea tabella facility
CREATE TABLE facility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(200) NOT NULL,
  indirizzo TEXT,
  città VARCHAR(100),
  capienza INTEGER,
  superficie VARCHAR(50),
  tipo VARCHAR(50),
  illuminazione BOOLEAN DEFAULT false,
  servizi TEXT[],
  coordinate_gps JSONB,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2.5 Crea tabella document
CREATE TABLE document (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL,
  entita_tipo VARCHAR(50) NOT NULL,
  entita_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  nome_file VARCHAR(255),
  mime_type VARCHAR(100),
  dimensione INTEGER,
  data_upload TIMESTAMP DEFAULT NOW(),
  scadenza DATE,
  note TEXT
);

-- 2.6 Crea tabella team_staff
CREATE TABLE team_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
  ruolo_squadra VARCHAR(100) NOT NULL,
  data_assegnazione DATE DEFAULT CURRENT_DATE,
  data_cessione DATE,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, staff_id, ruolo_squadra)
);

-- 2.7 Crea tabella match_statistics
CREATE TABLE match_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
  team_player_id UUID NOT NULL REFERENCES team_player(id) ON DELETE CASCADE,
  minuti_giocati INTEGER DEFAULT 0,
  gol INTEGER DEFAULT 0,
  assist INTEGER DEFAULT 0,
  tiri INTEGER DEFAULT 0,
  tiri_in_porta INTEGER DEFAULT 0,
  passaggi INTEGER DEFAULT 0,
  passaggi_riusciti INTEGER DEFAULT 0,
  palloni_recuperati INTEGER DEFAULT 0,
  falli_subiti INTEGER DEFAULT 0,
  falli_commessi INTEGER DEFAULT 0,
  ammonizioni INTEGER DEFAULT 0,
  espulsioni INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(match_id, team_player_id)
);

-- 2.8 Crea tabella training_attendance
CREATE TABLE training_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID NOT NULL REFERENCES training(id) ON DELETE CASCADE,
  team_player_id UUID NOT NULL REFERENCES team_player(id) ON DELETE CASCADE,
  presente BOOLEAN DEFAULT false,
  motivi_assenza TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(training_id, team_player_id)
);

-- 2.9 Aggiungi colonne a season
ALTER TABLE season ADD COLUMN attiva BOOLEAN DEFAULT false;
ALTER TABLE season ADD COLUMN data_inizio DATE;
ALTER TABLE season ADD COLUMN data_fine DATE;
ALTER TABLE season ADD COLUMN is_default BOOLEAN DEFAULT false;
ALTER TABLE season ADD COLUMN settings JSONB DEFAULT '{}';

-- 2.10 Aggiungi colonne a team
ALTER TABLE team ADD COLUMN category_id UUID REFERENCES category(id);
ALTER TABLE team ADD COLUMN colori_casa VARCHAR(50);
ALTER TABLE team ADD COLUMN colori_trasferta VARCHAR(50);
ALTER TABLE team ADD COLUMN venue_id UUID REFERENCES facility(id);
ALTER TABLE team ADD COLUMN allenatore_id UUID REFERENCES staff(id);
ALTER TABLE team ADD COLUMN dirigente_id UUID REFERENCES staff(id);
ALTER TABLE team ADD COLUMN preparatore_id UUID REFERENCES staff(id);
ALTER TABLE team ADD COLUMN portieri_id UUID REFERENCES staff(id);
ALTER TABLE team ADD COLUMN matricola_figc VARCHAR(100);
ALTER TABLE team ADD COLUMN iscritta_competizione UUID REFERENCES competition(id);
ALTER TABLE team ADD COLUMN created_at TIMESTAMP DEFAULT NOW();

-- 2.11 Aggiungi colonne a player (ex calciatore)
ALTER TABLE player RENAME TO calciatore_old;
ALTER TABLE calciatore_old RENAME TO player;

ALTER TABLE player ADD COLUMN sesso VARCHAR(1) DEFAULT 'M';
ALTER TABLE player ADD COLUMN documento JSONB DEFAULT '{}';
ALTER TABLE player ADD COLUMN dati_fisici JSONB DEFAULT '{}';
ALTER TABLE player ADD COLUMN certificato_medico JSONB DEFAULT '{}';
ALTER TABLE player ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- 2.12 Aggiungi colonne a team_player (ex rosa)
ALTER TABLE rosa RENAME TO team_player_old;
ALTER TABLE rosa_old RENAME TO team_player;

ALTER TABLE team_player ADD COLUMN ruolo_preferito VARCHAR(50);
ALTER TABLE team_player ADD COLUMN data_assegnazione DATE DEFAULT CURRENT_DATE;
ALTER TABLE team_player ADD COLUMN data_cessione DATE;

-- 2.13 Rinomina tabelle
ALTER TABLE partita RENAME TO match;
ALTER TABLE evento_partita RENAME TO match_event;
ALTER TABLE allenamento RENAME TO training;
ALTER TABLE presenza_allenamento RENAME TO training_attendance_old;
ALTER TABLE presenza_allenamento RENAME TO training_attendance;
ALTER TABLE convocazione RENAME TO convocation;
ALTER TABLE formazione_partita RENAME TO match_formation;
```

### Fase 3: Migrazione Dati (8-12h)

```sql
-- 3.1 Popola category da valori unici di team.categoria
INSERT INTO category (id, nome, anno_da, anno_a, descrizione)
SELECT 
  gen_random_uuid(),
  nome,
  CASE 
    WHEN nome ILIKE '%U14%' OR nome ILIKE '%2009%' THEN 2009
    WHEN nome ILIKE '%U15%' OR nome ILIKE '%2010%' THEN 2010
    WHEN nome ILIKE '%U16%' OR nome ILIKE '%2011%' THEN 2011
    WHEN nome ILIKE '%U17%' OR nome ILIKE '%2012%' THEN 2012
    WHEN nome ILIKE '%U18%' OR nome ILIKE '%2013%' THEN 2013
    WHEN nome ILIKE '%U19%' OR nome ILIKE '%2014%' THEN 2014
    WHEN nome ILIKE '%Primavera%' THEN 2007
    WHEN nome ILIKE '%Allievi%' THEN 2010
    ELSE 2010
  END,
  CASE 
    WHEN nome ILIKE '%U14%' OR nome ILIKE '%2009%' THEN 2010
    WHEN nome ILIKE '%U15%' OR nome ILIKE '%2010%' THEN 2011
    WHEN nome ILIKE '%U16%' OR nome ILIKE '%2011%' THEN 2012
    WHEN nome ILIKE '%U17%' OR nome ILIKE '%2012%' THEN 2013
    WHEN nome ILIKE '%U18%' OR nome ILIKE '%2013%' THEN 2014
    WHEN nome ILIKE '%U19%' OR nome ILIKE '%2014%' THEN 2015
    WHEN nome ILIKE '%Primavera%' THEN 2008
    WHEN nome ILIKE '%Allievi%' THEN 2011
    ELSE 2011
  END,
  nome
FROM (SELECT DISTINCT categoria AS nome FROM team WHERE categoria IS NOT NULL) t
WHERE NOT EXISTS (SELECT 1 FROM category WHERE category.nome = t.nome);

-- 3.2 Crea staff da campi stringa in team
INSERT INTO staff (id, nome, cognome, ruolo, created_at)
SELECT 
  gen_random_uuid(),
  SPLIT_PART(COALESCE(allenatore, ''), ' ', 1),
  CASE WHEN POSITION(' ' IN allenatore) > 0 
       THEN SUBSTRING(allenatore FROM POSITION(' ' IN allenatore) + 1) 
       ELSE '' END,
  'Allenatore',
  NOW()
FROM team 
WHERE allenatore IS NOT NULL AND allenatore != ''
ON CONFLICT DO NOTHING;

-- 3.3 Aggiorna team con category_id
UPDATE team t
SET category_id = c.id
FROM category c
WHERE t.categoria ILIKE '%' || c.nome || '%'
   OR (c.anno_da = 2011 AND t.categoria ILIKE '%U16%')
   OR (c.anno_da = 2012 AND t.categoria ILIKE '%U17%')
   OR (c.anno_da = 2010 AND t.categoria ILIKE '%U15%')
   OR (c.anno_da = 2009 AND t.categoria ILIKE '%U14%');

-- 3.4 Aggiorna FK in match (squadra_id → team_id)
-- Questa è già la FK corretta, verifica solo che match.team_id = match.squadra_id
UPDATE match m SET team_id = m.squadra_id WHERE m.team_id IS NULL;
ALTER TABLE match DROP COLUMN IF EXISTS squadra_id;

-- 3.5 Aggiorna player (rimuovi workspace_id)
ALTER TABLE player DROP COLUMN IF EXISTS workspace_id;

-- 3.6 Migra ros → team_player (aggiorna ruolo_preferito)
UPDATE team_player tp
SET ruolo_preferito = r.ruolo
FROM rosa r  -- se esiste ancora
WHERE tp.id = r.id;
```

### Fase 4: Backend - Refactoring (16-24h)

**Step 4.1: Aggiorna models/schema**
```javascript
// Aggiorna schema Supabase o ORM con nuove tabelle
// Genera tipi TypeScript da nuovo schema
```

**Step 4.2: Crea nuovi endpoint**
```javascript
// Staff endpoints
app.get('/api/staff', authMiddleware, getStaff);
app.post('/api/staff', authMiddleware, createStaff);
app.get('/api/staff/:id', authMiddleware, getStaffById);
app.put('/api/staff/:id', authMiddleware, updateStaff);
app.delete('/api/staff/:id', authMiddleware, deleteStaff);

// Category endpoints
app.get('/api/categories', getCategories);
app.post('/api/categories', authMiddleware, createCategory);
app.put('/api/categories/:id', authMiddleware, updateCategory);
app.delete('/api/categories/:id', authMiddleware, deleteCategory);

// Team Staff endpoints
app.get('/api/teams/:id/staff', authMiddleware, getTeamStaff);
app.post('/api/teams/:id/staff', authMiddleware, assignStaffToTeam);
app.delete('/api/team-staff/:id', authMiddleware, removeStaffFromTeam);

// Player History
app.get('/api/players/:id/history', authMiddleware, getPlayerHistory);
app.get('/api/players/:id/statistics', authMiddleware, getPlayerStatistics);
```

**Step 4.3: Aggiorna endpoint esistenti**
```javascript
// Sostituisci tutti i riferimenti:
// - squadra_id → team_id
// - calciatore_id → player_id
// - partita_id → match_id
// - allenamento_id → training_id

// Aggiungi filtri per season_id dove necessario
```

### Fase 5: Frontend - Refactoring (16-24h)

**Step 5.1: Aggiorna TypeScript types**
```bash
# Genera types da nuovo schema
# o scrivili manualmente basandoti su sezione 4.1
```

**Step 5.2: Aggiorna AuthContext**
```typescript
// Aggiungi season e teams allo stato
// Aggiungi helper per accesso team
```

**Step 5.3: Aggiorna API clients**
```typescript
// Aggiorna tutti i client API per usare nuovi endpoint
// Aggiorna gestione errori
```

**Step 5.4: Aggiorna pagine**
```bash
# Segui mapping in sezione 4.2
```

### Fase 6: Test (12-16h)

```bash
# Test Suite:
# 1. Test anagrafiche (CRUD completo)
# 2. Test workflow stagionale (crea season → team → assegna player/staff)
# 3. Test partite (crea match → aggiungi eventi → statistiche)
# 4. Test allenamenti (crea training → prendi presenze)
# 5. Test storico giocatore (verifica che player abbia storia completa)
# 6. Test permessi (verifica isolamento workspace)
# 7. Test sistema demo (verifica nuovo schema)
# 8. Test regressione (verifica funzionalità esistenti)
```

---

## 6. STIMA TEMPI TOTALE

| Fase | Attività | Tempo Stimato |
|------|----------|--------------|
| 1 | Backup e Preparazione | 2-4h |
| 2 | Database - Nuove Tabelle | 4-6h |
| 3 | Database - Migrazione Dati | 8-12h |
| 4 | Backend - Refactoring | 16-24h |
| 5 | Frontend - Refactoring | 16-24h |
| 6 | Testing | 12-16h |
| 7 | Fix Bug e Ottimizzazione | 8-12h |
| **TOTALE** | | **66-98h** |

---

## 7. RISCHI E MITIGAZIONI

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Perdita dati durante migrazione | Media | Alto | Backup completo + test su staging |
| Regressioni in funzionalità esistenti | Alta | Alto | Test suite completo + rollback plan |
| Tempo superiore alle stime | Alta | Medio | Approccio incrementale + milestone |
| Problemi di performance con JOIN | Media | Medio | Indici + query ottimizzate |
| Dati inconsistenti post-migrazione | Media | Alto | Scripts di verifica + correzione |

---

## 8. RACCOMANDAZIONI FINALI

### Approccio Consigliato: **Migrazione Incrementale**

1. **Sprint 1**: Database - Crea nuove tabelle, migra categorie
2. **Sprint 2**: Backend - Aggiungi endpoint per categorie/staff, mantieni compatibilità
3. **Sprint 3**: Frontend - Aggiorna UI per nuove entità
4. **Sprint 4**: Database - Migra team_player con season context
5. **Sprint 5**: Backend - Aggiorna tutti gli endpoint per season-aware
6. **Sprint 6**: Frontend - Aggiorna tutta la UI per season-aware
7. **Sprint 7**: Testing + Fix + Deploy

### Criteri di Successo

- ✅ Tutti i dati anagrafici persistenti e accessibili
- ✅ Giocatori possono cambiare società tra stagioni
- ✅ Storico completo carriere giocatori/staff
- ✅ Query performanti (no N+1)
- ✅ Zero regressioni nelle funzionalità esistenti
- ✅ Sistema demo funzionante con nuovo schema

---

*Documento generato: 2026-06-27*
*Versione: 1.0*
*Autore: AI Assistant per Youth Football Manager*
