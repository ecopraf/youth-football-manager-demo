-- ============================================================
-- YOUTH FOOTBALL MANAGER - RENAME TABLES & COLUMNS TO ENGLISH
-- Versione: 1.0 - 2026-06-27
--
-- ATTENZIONE: Questo script MODIFICA il database!
-- Eseguire SOLO dopo backup completo.
--
-- PREREQUISITI:
-- 1. Aver eseguito 001_new_schema.sql (tabelle nuove)
-- 2. Aver eseguito 003_populate_data.sql (dati)
-- ============================================================

-- ============================================================
-- STEP 1: RINOMINA TABELLE (se esistono ancora con nomi IT)
-- ============================================================

-- utente -> users
ALTER TABLE IF EXISTS utente RENAME TO users;

-- stagione -> seasons
ALTER TABLE IF EXISTS stagione RENAME TO seasons;

-- squadra -> teams
ALTER TABLE IF EXISTS squadra RENAME TO teams;

-- calciatore -> players
ALTER TABLE IF EXISTS calciatore RENAME TO players;

-- partita -> matches
ALTER TABLE IF EXISTS partita RENAME TO matches;

-- rosa -> team_players
ALTER TABLE IF EXISTS rosa RENAME TO team_players;

-- evento_partita -> match_events
ALTER TABLE IF EXISTS evento_partita RENAME TO match_events;

-- allenamento -> trainings
ALTER TABLE IF EXISTS allenamento RENAME TO trainings;

-- presenza_allenamento -> training_attendances
ALTER TABLE IF EXISTS presenza_allenamento RENAME TO training_attendances;

-- convocazione -> convocations
ALTER TABLE IF EXISTS convocazione RENAME TO convocations;

-- formazione_partita -> match_formations
ALTER TABLE IF EXISTS formazione_partita RENAME TO match_formations;

-- configurazione_allenamento -> training_configs
ALTER TABLE IF EXISTS configurazione_allenamento RENAME TO training_configs;

-- ============================================================
-- STEP 2: RINOMINA COLONNE - TABLE: users (ex utente)
-- ============================================================

ALTER TABLE users RENAME COLUMN nome TO first_name;
ALTER TABLE users RENAME COLUMN cognome TO last_name;

-- ============================================================
-- STEP 3: RINOMINA COLONNE - TABLE: seasons (ex stagione)
-- ============================================================

ALTER TABLE seasons RENAME COLUMN nome TO name;
ALTER TABLE seasons RENAME COLUMN anno_inizio TO year_start;
ALTER TABLE seasons RENAME COLUMN anno_fine TO year_end;
ALTER TABLE seasons RENAME COLUMN data_inizio TO start_date;
ALTER TABLE seasons RENAME COLUMN data_fine TO end_date;

-- ============================================================
-- STEP 4: RINOMINA COLONNE - TABLE: teams (ex squadra)
-- ============================================================

ALTER TABLE teams RENAME COLUMN nome TO name;
ALTER TABLE teams RENAME COLUMN categoria TO category;
ALTER TABLE teams RENAME COLUMN allenatore TO coach_name;
ALTER TABLE teams RENAME COLUMN dirigente TO manager_name;
ALTER TABLE teams RENAME COLUMN preparatore_atletico TO fitness_coach;
ALTER TABLE teams RENAME COLUMN allenatore_portieri TO goalkeeping_coach;
ALTER TABLE teams RENAME COLUMN dirigente2 TO second_manager;
ALTER TABLE teams RENAME COLUMN matricola_dirigente TO manager_figc_number;
ALTER TABLE teams RENAME COLUMN tessera_lnd_dirigente TO lnd_card_number;
ALTER TABLE teams RENAME COLUMN tessera_figc_allenatore TO coach_figc_card;

-- ============================================================
-- STEP 5: RINOMINA COLONNE - TABLE: players (ex calciatore)
-- ============================================================

ALTER TABLE players RENAME COLUMN nome TO first_name;
ALTER TABLE players RENAME COLUMN cognome TO last_name;
ALTER TABLE players RENAME COLUMN data_nascita TO birth_date;
ALTER TABLE players RENAME COLUMN telefono TO phone;
ALTER TABLE players RENAME COLUMN tipo_documento TO document_type;
ALTER TABLE players RENAME COLUMN numero_documento TO document_number;
ALTER TABLE players RENAME COLUMN rilasciato_da TO document_issuer;
ALTER TABLE players RENAME COLUMN data_visita_medica TO medical_cert_date;
ALTER TABLE players RENAME COLUMN matricola_figc TO figc_number;
ALTER TABLE players RENAME COLUMN peso TO weight;
ALTER TABLE players RENAME COLUMN altezza TO height;
ALTER TABLE players RENAME COLUMN piede_preferito TO preferred_foot;
ALTER TABLE players RENAME COLUMN foto_url TO photo_url;
ALTER TABLE players RENAME COLUMN workspace_id TO workspace_id;  -- gia' corretto
ALTER TABLE players RENAME COLUMN data_scadenza_certificato TO medical_cert_expiry;

-- ============================================================
-- STEP 6: RINOMINA COLONNE - TABLE: matches (ex partita)
-- ============================================================

ALTER TABLE matches RENAME COLUMN data_ora TO datetime;
ALTER TABLE matches RENAME COLUMN avversario TO opponent;
ALTER TABLE matches RENAME COLUMN luogo TO location;
ALTER TABLE matches RENAME COLUMN competizione TO competition;
ALTER TABLE matches RENAME COLUMN giornata TO matchday;
ALTER TABLE matches RENAME COLUMN gol_casa TO home_goals;
ALTER TABLE matches RENAME COLUMN gol_ospite TO away_goals;
ALTER TABLE matches RENAME COLUMN archiviat TO archived;
ALTER TABLE matches RENAME COLUMN note_avversario TO opponent_notes;
ALTER TABLE matches RENAME COLUMN squadra_id TO team_id;  -- gia' corretto

-- ============================================================
-- STEP 7: RINOMINA COLONNE - TABLE: team_players (ex rosa)
-- ============================================================

ALTER TABLE team_players RENAME COLUMN squadra_id TO team_id;
ALTER TABLE team_players RENAME COLUMN calciatore_id TO player_id;
ALTER TABLE team_players RENAME COLUMN numero_maglia TO jersey_number;
ALTER TABLE team_players RENAME COLUMN ruolo TO position;
ALTER TABLE team_players RENAME COLUMN data_assegnazione TO assignment_date;

-- ============================================================
-- STEP 8: RINOMINA COLONNE - TABLE: match_events (ex evento_partita)
-- ============================================================

ALTER TABLE match_events RENAME COLUMN partita_id TO match_id;
ALTER TABLE match_events RENAME COLUMN tipo_evento_codice TO event_type;
ALTER TABLE match_events RENAME COLUMN calciatore_principale_id TO primary_player_id;
ALTER TABLE match_events RENAME COLUMN calciatore_secondario_id TO secondary_player_id;

-- ============================================================
-- STEP 9: RINOMINA COLONNE - TABLE: trainings (ex allenamento)
-- ============================================================

ALTER TABLE trainings RENAME COLUMN squadra_id TO team_id;
ALTER TABLE trainings RENAME COLUMN data_ora TO datetime;
ALTER TABLE trainings RENAME COLUMN durata_minuti TO duration_minutes;

-- ============================================================
-- STEP 10: RINOMINA COLONNE - TABLE: training_attendances
-- ============================================================

ALTER TABLE training_attendances RENAME COLUMN allenamento_id TO training_id;
ALTER TABLE training_attendances RENAME COLUMN motivi_assenza TO absence_reason;

-- ============================================================
-- STEP 11: RINOMINA COLONNE - TABLE: convocations
-- ============================================================

ALTER TABLE convocations RENAME COLUMN partita_id TO match_id;
ALTER TABLE convocations RENAME COLUMN calciatore_id TO player_id;
ALTER TABLE convocations RENAME COLUMN convocato_da TO called_by;
ALTER TABLE convocations RENAME COLUMN convocato_il TO called_on;

-- ============================================================
-- STEP 12: RINOMINA COLONNE - TABLE: match_formations
-- ============================================================

ALTER TABLE match_formations RENAME COLUMN partita_id TO match_id;
ALTER TABLE match_formations RENAME COLUMN rosa_id TO team_player_id;
ALTER TABLE match_formations RENAME COLUMN posizione TO position;
ALTER TABLE match_formations RENAME COLUMN numero_maglia TO jersey_number;
ALTER TABLE match_formations RENAME COLUMN is_captain TO is_captain;
ALTER TABLE match_formations RENAME COLUMN is_vice_captain TO is_vice_captain;

-- ============================================================
-- STEP 13: RINOMINA COLONNE - TABLE: training_configs
-- ============================================================

ALTER TABLE training_configs RENAME COLUMN squadra_id TO team_id;
ALTER TABLE training_configs RENAME COLUMN giorno_settimana TO day_of_week;
ALTER TABLE training_configs RENAME COLUMN ora_inizio TO start_time;
ALTER TABLE training_configs RENAME COLUMN ora_fine TO end_time;

-- ============================================================
-- STEP 14: AGGIORNA FK (se necessario)
-- ============================================================

-- Nota: In PostgreSQL le FK dovrebbero aggiornarsi automaticamente
-- dopo il rename delle tabelle. Se ci sono errori, eseguire:

-- Esempio per aggiornare FK manualmente:
-- ALTER TABLE match_events DROP CONSTRAINT IF EXISTS evento_partita_partita_id_fkey;
-- ALTER TABLE match_events ADD CONSTRAINT match_events_match_id_fkey 
--    FOREIGN KEY (match_id) REFERENCES matches(id);

-- ============================================================
-- VERIFICA
-- ============================================================

SELECT '=== TABELLE RINOMINATE ===' AS status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name NOT LIKE '%_old%'
ORDER BY table_name;

SELECT '=== TABELLA: users ===' AS status;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' ORDER BY ordinal_position;

SELECT '=== TABELLA: teams ===' AS status;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'teams' ORDER BY ordinal_position;

SELECT '=== TABELLA: players ===' AS status;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'players' ORDER BY ordinal_position;

SELECT '=== TABELLA: matches ===' AS status;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'matches' ORDER BY ordinal_position;

SELECT '=== TABELLA: team_players ===' AS status;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'team_players' ORDER BY ordinal_position;

SELECT '=== TABELLA: seasons ===' AS status;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'seasons' ORDER BY ordinal_position;
