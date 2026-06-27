-- ============================================================
-- YOUTH FOOTBALL MANAGER - RENAME TABLES TO ENGLISH
-- Versione: 1.0 - 2026-06-27
--
-- ATTENZIONE: Questo script RINOMINA le tabelle!
-- Eseguire dopo backup completo del database.
--
-- MAPPATURA RINOMINAZIONI:
-- ============================================================
-- ATTENZIONE: Eseguire SOLO DOPO aver creato lo schema nuovo
-- (003_populate_data.sql)
-- Questo script serve per ALLINEARE le tabelle vecchie
-- al nuovo schema inglese
-- ============================================================

-- ============================================================
-- STEP 1: RINOMINA TABELLE VECCHIE
-- ============================================================

-- Nota: Molte tabelle sono già state rinominate/eliminate
-- in 001_new_schema.sql

-- Se esistono ancora con nomi italiani, rinominiamole:

-- utente -> users (se esiste)
-- ALTER TABLE IF EXISTS utente RENAME TO users;

-- stagione -> seasons (se esiste)
-- ALTER TABLE IF EXISTS stagione RENAME TO seasons;

-- squadra -> teams (se esiste)
-- ALTER TABLE IF EXISTS squadra RENAME TO teams;

-- calciatore -> players (se esiste)
-- ALTER TABLE IF EXISTS calciatore RENAME TO players;

-- partita -> matches (se esiste)
-- ALTER TABLE IF EXISTS partita RENAME TO matches;

-- rosa -> team_players (se esiste)
-- ALTER TABLE IF EXISTS rosa RENAME TO team_players;

-- evento_partita -> match_events (se esiste)
-- ALTER TABLE IF EXISTS evento_partita RENAME TO match_events;

-- allenamento -> trainings (se esiste)
-- ALTER TABLE IF EXISTS allenamento RENAME TO trainings;

-- presenza_allenamento -> training_attendances (se esiste)
-- ALTER TABLE IF EXISTS presenza_allenamento RENAME TO training_attendances;

-- convocazione -> convocations (se esiste)
-- ALTER TABLE IF EXISTS convocazione RENAME TO convocations;

-- formazione_partita -> match_formations (se esiste)
-- ALTER TABLE IF EXISTS formazione_partita RENAME TO match_formations;

-- configurazione_allenamento -> training_configs (se esiste)
-- ALTER TABLE IF EXISTS configurazione_allenamento RENAME TO training_configs;

-- ============================================================
-- STEP 2: RINOMINA COLONNE (se necessario)
-- ============================================================

-- Esempio per players (ex calciatore):
-- ALTER TABLE players RENAME COLUMN nome TO first_name;
-- ALTER TABLE players RENAME COLUMN cognome TO last_name;
-- ALTER TABLE players RENAME COLUMN data_nascita TO birth_date;
-- ALTER TABLE players RENAME COLUMN telefono TO phone;
-- ALTER TABLE players RENAME COLUMN email TO email_address;
-- ALTER TABLE players RENAME COLUMN tipo_documento TO document_type;
-- ALTER TABLE players RENAME COLUMN numero_documento TO document_number;
-- ALTER TABLE players RENAME COLUMN rilasciato_da TO document_issued_by;
-- ALTER TABLE players RENAME COLUMN data_visita_medica TO medical_certificate_date;
-- ALTER TABLE players RENAME COLUMN matricola_figc TO figc_number;
-- ALTER TABLE players RENAME COLUMN peso TO weight;
-- ALTER TABLE players RENAME COLUMN altezza TO height;
-- ALTER TABLE players RENAME COLUMN piede_preferito TO preferred_foot;

-- Esempio per teams (ex squadra):
-- ALTER TABLE teams RENAME COLUMN nome TO name;
-- ALTER TABLE teams RENAME COLUMN categoria TO category;
-- ALTER TABLE teams RENAME COLUMN allenatore TO coach_name;
-- ALTER TABLE teams RENAME COLUMN dirigente TO manager_name;
-- ALTER TABLE teams RENAME COLUMN stagione_id TO season_id;
-- ALTER TABLE teams RENAME COLUMN preparatore_atletico TO fitness_coach;
-- ALTER TABLE teams RENAME COLUMN allenatore_portieri TO goalkeeping_coach;
-- ALTER TABLE teams RENAME COLUMN dirigente2 TO second_manager;
-- ALTER TABLE teams RENAME COLUMN matricola_dirigente TO manager_figc_number;
-- ALTER TABLE teams RENAME COLUMN tessera_lnd_dirigente TO lnd_card_number;
-- ALTER TABLE teams RENAME COLUMN tessera_figc_allenatore TO coach_figc_card;

-- Esempio per matches (ex partita):
-- ALTER TABLE matches RENAME COLUMN data_ora TO datetime;
-- ALTER TABLE matches RENAME COLUMN avversario TO opponent;
-- ALTER TABLE matches RENAME COLUMN luogo TO location;
-- ALTER TABLE matches RENAME COLUMN competizione TO competition;
-- ALTER TABLE matches RENAME COLUMN giornata TO matchday;
-- ALTER TABLE matches RENAME COLUMN gol_casa TO home_goals;
-- ALTER TABLE matches RENAME COLUMN gol_ospite TO away_goals;
-- ALTER TABLE matches RENAME COLUMN stato TO status;
-- ALTER TABLE matches RENAME COLUMN archiviat TO archived;
-- ALTER TABLE matches RENAME COLUMN note_avversario TO opponent_notes;

-- Esempio per seasons (ex stagione):
-- ALTER TABLE seasons RENAME COLUMN nome TO name;
-- ALTER TABLE seasons RENAME COLUMN anno_inizio TO year_start;
-- ALTER TABLE seasons RENAME COLUMN anno_fine TO year_end;
-- ALTER TABLE seasons RENAME COLUMN data_inizio TO start_date;
-- ALTER TABLE seasons RENAME COLUMN data_fine TO end_date;

-- ============================================================
-- STEP 3: AGGIORNA FK E VINCOLI (se necessario)
-- ============================================================

-- Aggiorna foreign key che referenziano tabelle rinominate

-- Esempio:
-- ALTER TABLE team_players DROP CONSTRAINT IF EXISTS fk_team_player_calciatore;
-- ALTER TABLE team_players ADD CONSTRAINT fk_team_player_player 
--    FOREIGN KEY (player_id) REFERENCES players(id);

-- ============================================================
-- VERIFICA
-- ============================================================

SELECT 'Rename completato!' AS status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
