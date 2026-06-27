# 📊 ANALISI NAMING CONSISTENCY - Database Tables

## 1. SITUAZIONE ATTUALE

### Tabelle Esistenti (misto Italiano/Inglese)

| Tabella Attuale | Lingua | Problema |
|----------------|--------|----------|
| `workspace` | 🇬🇧 Inglese | ✅ OK |
| `utente` | 🇮🇹 Italiano | ⚠️ Andrebbe `user` |
| `stagione` | 🇮🇹 Italiano | ⚠️ Andrebbe `season` |
| `squadra` | 🇮🇹 Italiano | ⚠️ Andrebbe `team` |
| `calciatore` | 🇮🇹 Italiano | ⚠️ Andrebbe `player` |
| `partita` | 🇮🇹 Italiano | ⚠️ Andrebbe `match` |
| `rosa` | 🇮🇹 Italiano | ⚠️ Andrebbe `roster` o `team_player` |
| `evento_partita` | 🇮🇹 Italiano | ⚠️ Andrebbe `match_event` |
| `allenamento` | 🇮🇹 Italiano | ⚠️ Andrebbe `training` |
| `presenza_allenamento` | 🇮🇹 Italiano | ⚠️ Andrebbe `training_attendance` |
| `convocazione` | 🇮🇹 Italiano | ⚠️ Andrebbe `convocation` |
| `formazione_partita` | 🇮🇹 Italiano | ⚠️ Andrebbe `match_formation` |
| `configurazione_allenamento` | 🇮🇹 Italiano | ⚠️ Andrebbe `training_config` |
| `guest_link` | 🇬🇧 Inglese | ✅ OK |

### Nuove Tabelle (schema migration)

| Tabella Nuova | Lingua | Note |
|---------------|--------|------|
| `category` | 🇬🇧 Inglese | ✅ OK |
| `competition` | 🇬🇧 Inglese | ✅ OK |
| `facility` | 🇬🇧 Inglese | ✅ OK |
| `staff` | 🇬🇧 Inglese | ✅ OK |
| `team` | 🇬🇧 Inglese | ✅ OK |
| `team_player` | 🇬🇧 Inglese | ✅ OK |
| `team_staff` | 🇬🇧 Inglese | ✅ OK |
| `match` | 🇬🇧 Inglese | ✅ OK |
| `match_event` | 🇬🇧 Inglese | ✅ OK |
| `match_formation` | 🇬🇧 Inglese | ✅ OK |
| `match_statistics` | 🇬🇧 Inglese | ✅ OK |
| `training` | 🇬🇧 Inglese | ✅ OK |
| `training_attendance` | 🇬🇧 Inglese | ✅ OK |
| `document` | 🇬🇧 Inglese | ✅ OK |

---

## 2. CAMPI/TABELLE DA RINOMINARE

### Opzione A: Completamente in Inglese (Raccomandata)

| Attuale | Nuovo | Note |
|---------|-------|------|
| `utente` | `user` | Standard internazionale |
| `stagione` | `season` | Standard |
| `squadra` | `team` | Già usato nel nuovo schema |
| `calciatore` | `player` | Già usato nel nuovo schema |
| `partita` | `match` | Già usato nel nuovo schema |
| `rosa` | `team_player` | Già nella migration |
| `evento_partita` | `match_event` | Già nella migration |
| `allenamento` | `training` | Già nella migration |
| `presenza_allenamento` | `training_attendance` | Già nella migration |
| `convocazione` | `convocation` | Simile, migration usa già questo nome |
| `formazione_partita` | `match_formation` | Già nella migration |
| `configurazione_allenamento` | `training_config` | Nuovo nome |

### Opzione B: Tutto in Italiano

| Attuale | Nuovo | Note |
|---------|-------|------|
| `workspace` | `spazio_lavoro` | Non raccomandato |
| `match` | `partita` | Confusione con naming attuale |
| `team` | `squadra` | Già esiste `squadra` |

**⚠️ NON RACCOMANDATA** - Il mondo tech usa inglese.

---

## 3. IMPATTO DEL CAMBIAMENTO

### 3.1 Backend (API Express)

```javascript
// ATTUALE (Italiano)
supabase.from('calciatore')
supabase.from('squadra')
supabase.from('stagione')

// NUOVO (Inglese)
supabase.from('player')
supabase.from('team')
supabase.from('season')
```

**Endpoint da modificare:**
- ~90 endpoint nel backend
- Query SQL in query builder
- Middleware di autenticazione
- Validazione dati

**Complessità: 🟡 MEDIA** (solo stringhe da cambiare, logica invariata)

### 3.2 Database (Supabase/PostgreSQL)

```sql
-- Rename tabella
ALTER TABLE calciatore RENAME TO player;
ALTER TABLE stagione RENAME TO season;
ALTER TABLE squadra RENAME TO team;
ALTER TABLE partita RENAME TO match;

-- Rename colonne (alcune)
ALTER TABLE player RENAME COLUMN nome TO first_name;
ALTER TABLE player RENAME COLUMN cognome TO last_name;
-- etc.
```

**Complessità: 🟢 BASSA** (solo SQL statements)

### 3.3 Frontend (se Next.js/React)

Dovrebbe dipendere da come è strutturato:
- Se usa API calls → cambiare solo endpoint/tabelle
- Se ha modelli hardcoded → bisogna cambiare anche quelli

**Complessità: 🟡 MEDIA-ALTA** (dipende dalla struttura)

---

## 4. PIANO DI MIGRAZIONE SUGGERITO

### Fase 1: Database Rename (Script SQL)

```sql
-- 1. Rename tabelle
ALTER TABLE utente RENAME TO users;
ALTER TABLE stagione RENAME TO seasons;
ALTER TABLE squadra RENAME TO teams;
ALTER TABLE calciatore RENAME TO players;
ALTER TABLE partita RENAME TO matches;
ALTER TABLE rosa RENAME TO team_players;
ALTER TABLE evento_partita RENAME TO match_events;
ALTER TABLE allenamento RENAME TO trainings;
ALTER TABLE presenza_allenamento RENAME TO training_attendances;
ALTER TABLE convocazione RENAME TO convocations;
ALTER TABLE formazione_partita RENAME TO match_formations;
ALTER TABLE configurazione_allenamento RENAME TO training_configs;
```

### Fase 2: Backend Update

```javascript
// Pattern di sostituzione:
'squadra' → 'team'
'stagione' → 'season'
'calciatore' → 'player'
'partita' → 'match'
```

### Fase 3: Creare VIEW per retrocompatibilità (opzionale)

```sql
-- View per retrocompatibilità (se il frontend usa ancora vecchi nomi)
CREATE VIEW squadra AS SELECT * FROM teams;
CREATE VIEW stagione AS SELECT * FROM seasons;
CREATE VIEW calciatore AS SELECT * FROM players;
```

---

## 5. RACCOMANDAZIONE

### 👍 OPZIONE A: Rinomina COMPLETA (Tutto in Inglese)

**Vantaggi:**
- ✅ Standard industriale
- ✅ Più facile trovare help/documentazione
- ✅ Team internazionali possono contribuire
- ✅ naming coerente con nuovo schema
- ✅ Più professionale

**Svantaggi:**
- ⚠️ Richiede aggiornamento Backend (~90 endpoint)
- ⚠️ Richiede test completo

**Tempo stimato:**
- Database rename: 1-2h
- Backend update: 4-8h
- Testing: 4-8h
- **Totale: 10-20h**

### 👎 OPZIONE B: Mantieni Attuale (Misto)

**Vantaggi:**
- ✅ Meno lavoro immediato
- ✅ Non serve toccare il codice esistente

**Svantaggi:**
- ⚠️ Confusione nel codice (misto IT/EN)
- ⚠️ Difficoltà manutenzione futura
- ⚠️ Nuovo schema già in inglese = incongruenza
- ⚠️ Developer nuovi confusi

---

## 6. CONCLUSIONE

**Raccomando di procedere con l'Opzione A (rinomina completa)** per:

1. **Coerenza** con nuovo schema già in inglese
2. **Professionalità** del codebase
3. **Manutenibilità** futura
4. **Scalabilità** (più facile assumere dev)

Il lavoro è manageable (~20h totali) e può essere fatto in parallelo con altri task.

---

## 7. PROSSIMI PASSI

1. [ ] Decisione finale su naming
2. [ ] Backup database
3. [ ] Script SQL per rename tabelle
4. [ ] Update backend (pattern replacement)
5. [ ] Testing completo
6. [ ] Deploy

---

*Documento generato: 2026-06-27*
