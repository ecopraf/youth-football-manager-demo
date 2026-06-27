# 📋 ANALISI DETTAGLIATA RENAME TABELLE - Backend

## 1. MAPPATURA COMPLETA

### Tabella: utente → users

| Vecchio | Nuovo | Tipo |
|---------|-------|------|
| `utente` | `users` | Tabella |
| `nome` | `first_name` | Colonna |
| `cognome` | `last_name` | Colonna |
| `password_hash` | `password_hash` | (invariato) |

**Occorrenze nel codice:** 10

### Tabella: stagione → seasons

| Vecchio | Nuovo | Tipo |
|---------|-------|------|
| `stagione` | `seasons` | Tabella |
| `nome` | `name` | Colonna |
| `anno_inizio` | `year_start` | Colonna |
| `anno_fine` | `year_end` | Colonna |
| `data_inizio` | `start_date` | Colonna |
| `data_fine` | `end_date` | Colonna |

**Occorrenze nel codice:** 5

### Tabella: squadra → teams

| Vecchio | Nuovo | Tipo |
|---------|-------|------|
| `squadra` | `teams` | Tabella |
| `nome` | `name` | Colonna |
| `categoria` | `category` | Colonna |
| `stagione_id` | `season_id` | (invariato) |

**Occorrenze nel codice:** 8

### Tabella: calciatore → players

| Vecchio | Nuovo | Tipo |
|---------|-------|------|
| `calciatore` | `players` | Tabella |
| `nome` | `first_name` | Colonna |
| `cognome` | `last_name` | Colonna |
| `data_nascita` | `birth_date` | Colonna |
| `telefono` | `phone` | Colonna |
| `email` | `email` | (invariato) |
| `tipo_documento` | `document_type` | Colonna |
| `numero_documento` | `document_number` | Colonna |
| `rilasciato_da` | `document_issuer` | Colonna |
| `data_visita_medica` | `medical_cert_date` | Colonna |
| `matricola_figc` | `figc_number` | Colonna |
| `peso` | `weight` | Colonna |
| `altezza` | `height` | Colonna |
| `piede_preferito` | `preferred_foot` | Colonna |

**Occorrenze nel codice:** 19

### Tabella: partita → matches

| Vecchio | Nuovo | Tipo |
|---------|-------|------|
| `partita` | `matches` | Tabella |
| `data_ora` | `datetime` | Colonna |
| `avversario` | `opponent` | Colonna |
| `luogo` | `location` | Colonna |
| `competizione` | `competition` | Colonna |
| `giornata` | `matchday` | Colonna |
| `gol_casa` | `home_goals` | Colonna |
| `gol_ospite` | `away_goals` | Colonna |
| `stato` | `status` | Colonna |
| `squadra_id` | `team_id` | Colonna |

**Occorrenze nel codice:** 8

### Tabella: rosa → team_players

| Vecchio | Nuovo | Tipo |
|---------|-------|------|
| `rosa` | `team_players` | Tabella |
| `squadra_id` | `team_id` | Colonna |
| `calciatore_id` | `player_id` | Colonna |
| `numero_maglia` | `jersey_number` | Colonna |
| `ruolo` | `position` | Colonna |

**Occorrenze nel codice:** 5

---

## 2. ENDPOINT API DA MODIFICARE

### Auth Endpoints

| Endpoint Attuale | Endpoint Nuovo |
|-----------------|---------------|
| `/api/auth/login` | (invariato) |
| `/api/auth/register` | (invariato) |
| `/api/auth/me` | (invariato) |
| `/api/auth/users` | (invariato) |

**Query da modificare:**
```sql
-- Da:
supabase.from('utente').select('*').eq('email', email)
-- A:
supabase.from('users').select('*').eq('email', email)
```

### Workspace Endpoints

| Endpoint Attuale | Endpoint Nuovo |
|-----------------|---------------|
| `/api/workspaces` | (invariato) |
| `/api/workspaces/:id/stagioni` | `/api/workspaces/:id/seasons` |
| `/api/workspaces/:id/seasons` | (invariato) |

**Query da modificare:**
```sql
-- Da:
supabase.from('stagione').select('*').eq('workspace_id', id)
-- A:
supabase.from('seasons').select('*').eq('workspace_id', id)
```

### Season Endpoints

| Endpoint Attuale | Endpoint Nuovo |
|-----------------|---------------|
| `GET /api/stagioni` | `GET /api/seasons` |
| `POST /api/stagioni` | `POST /api/seasons` |
| `DELETE /api/stagioni/:id` | `DELETE /api/seasons/:id` |

**Query da modificare:**
```sql
-- Da:
supabase.from('stagione').insert({ workspace_id, nome, anno_inizio, anno_fine })
-- A:
supabase.from('seasons').insert({ workspace_id, name, year_start, year_end })
```

### Team Endpoints

| Endpoint Attuale | Endpoint Nuovo |
|-----------------|---------------|
| `GET /api/squadre` | `GET /api/teams` |
| `POST /api/squadre` | `POST /api/teams` |
| `GET /api/squadre/:id` | `GET /api/teams/:id` |
| `PUT /api/squadre/:id` | `PUT /api/teams/:id` |
| `DELETE /api/squadre/:id` | `DELETE /api/teams/:id` |

**Query da modificare:**
```sql
-- Da:
supabase.from('squadra').select('*').order('nome')
supabase.from('stagione').select('id').eq('workspace_id', id)
-- A:
supabase.from('teams').select('*').order('name')
supabase.from('seasons').select('id').eq('workspace_id', id)
```

### Player Endpoints

| Endpoint Attuale | Endpoint Nuovo |
|-----------------|---------------|
| `GET /api/calciatori/:id` | `GET /api/players/:id` |
| `PUT /api/calciatori/:id` | `PUT /api/players/:id` |
| `GET /api/calciatori/:id/stats-current` | `GET /api/players/:id/stats-current` |
| `GET /api/calciatori/:id/career` | `GET /api/players/:id/career` |
| `GET /api/calciatori/:id/last-matches` | `GET /api/players/:id/last-matches` |

**Query da modificare:**
```sql
-- Da:
supabase.from('calciatore').select('*').eq('id', id)
supabase.from('calciatore').update({ nome, cognome }).eq('id', id)
-- A:
supabase.from('players').select('*').eq('id', id)
supabase.from('players').update({ first_name, last_name }).eq('id', id)
```

### Match Endpoints

| Endpoint Attuale | Endpoint Nuovo |
|-----------------|---------------|
| `GET /api/partite/:id` | `GET /api/matches/:id` |
| `PUT /api/partite/:id` | `PUT /api/matches/:id` |
| `DELETE /api/partite/:id` | `DELETE /api/matches/:id` |

---

## 3. PATTERN DI SOSTITUZIONE

### Pattern 1: Nomi Tabelle

```javascript
// Sostituire nel backend:
'utente' → 'users'
'stagione' → 'seasons'
'squadra' → 'teams'
'calciatore' → 'players'
'partita' → 'matches'
'rosa' → 'team_players'
'evento_partita' → 'match_events'
'allenamento' → 'trainings'
'presenza_allenamento' → 'training_attendances'
'convocazione' → 'convocations'
'formazione_partita' → 'match_formations'
```

### Pattern 2: Campi in Response JSON

```javascript
// API Response - cambiare i nomi camelCase:
// Vecchio: { nome: "Mario", cognome: "Rossi" }
// Nuovo: { firstName: "Mario", lastName: "Rossi" }
```

### Pattern 3: Campi in Request Body

```javascript
// Vecchio: { nome, cognome, data_nascita }
// Nuovo: { firstName, lastName, birthDate }
```

---

## 4. TEMPO STIMATO PER SEZIONE

| Sezione | Tempo |
|---------|-------|
| Database Rename | 1-2h |
| Backend Table Names | 2-4h |
| Backend Column Names | 2-4h |
| API Response/Request | 2-4h |
| Testing | 4-8h |
| **Totale** | **11-22h** |

---

## 5. RISCHI E MITIGAZIONI

| Rischio | Probabilità | Mitigazione |
|---------|-------------|-------------|
| Errori typo | Alta | Test manuali completi |
| Breaking changes API | Media | Mantenere backward compatibility temporanea |
| Perdita dati | Bassa | Backup completo prima |

---

## 6. RACCOMANDAZIONE OPERATIVA

1. **Fase 1:** Database rename (SQL script)
2. **Fase 2:** Backend - solo nomi tabelle
3. **Fase 3:** Backend - solo nomi campi
4. **Fase 4:** Test endpoint singoli
5. **Fase 5:** Test end-to-end

**Vai a picoli passi - ogni fase testata prima di procedere.**

---

*Documento generato: 2026-06-27*
