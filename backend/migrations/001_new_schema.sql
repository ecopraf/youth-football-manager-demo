-- ============================================================
-- YOUTH FOOTBALL MANAGER - NUOVO SCHEMA DB (v2.0)
-- Versione: 2.0 - 2026-06-27
--
-- CONVENZIONE: Nomi tabelle in INGLESE, campi in ITALIANO
--
-- Questo script CREA LA STRUTTURA COMPLETA DEL DATABASE
-- I dati vengono inseriti tramite webapp o script dedicati
--
-- ============================================================


-- 1. DROP TABELLE VECCHIE
DROP TABLE IF EXISTS match_statistics CASCADE;
DROP TABLE IF EXISTS training_attendance CASCADE;
DROP TABLE IF EXISTS convocation CASCADE;
DROP TABLE IF EXISTS match_formation CASCADE;
DROP TABLE IF EXISTS match_event CASCADE;
DROP TABLE IF EXISTS match CASCADE;
DROP TABLE IF EXISTS team_staff CASCADE;
DROP TABLE IF EXISTS team_player CASCADE;
DROP TABLE IF EXISTS team CASCADE;
DROP TABLE IF EXISTS training CASCADE;
DROP TABLE IF EXISTS document CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS player CASCADE;
DROP TABLE IF EXISTS facility CASCADE;
DROP TABLE IF EXISTS competition CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS season CASCADE;

-- ============================================================
-- 2. TABELLE ANAGRAFICHE (PERSISTENTI)
-- ============================================================


-- PLAYER - Anagrafica calciatori
CREATE TABLE player (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    data_nascita DATE,
    sesso VARCHAR(1) DEFAULT 'M',
    foto_url TEXT,
    telefono VARCHAR(50),
    email VARCHAR(255),
    ruolo_principale VARCHAR(50),
    piede_preferito VARCHAR(20),
    altezza INTEGER,
    peso INTEGER,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- STAFF - Anagrafica personale (allenatori, dirigenti, preparatori, etc.)
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    data_nascita DATE,
    sesso VARCHAR(1) DEFAULT 'M',
    foto_url TEXT,
    telefono VARCHAR(50),
    email VARCHAR(255),
    ruolo VARCHAR(50) NOT NULL,          -- Allenatore, Dirigente, Preparatore, Portieri, etc.
    qualifiche JSONB DEFAULT '{}',
    documento JSONB DEFAULT '{}',
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- CATEGORY - Categorie (Under 14, Under 15, etc.)
-- Nota: workspace_id NULL = categoria globale (creata da superadmin)
--       workspace_id valorizzato = categoria specifica del workspace
CREATE TABLE category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo_campionato VARCHAR(50) DEFAULT 'Regionale',  -- Provinciale, Regionale, Elite, Pro
    anno_da INTEGER NOT NULL,          -- Es. 2012 per U14
    anno_a INTEGER NOT NULL,           -- Es. 2012 per U14
    genere VARCHAR(10) DEFAULT 'M',
    is_active BOOLEAN DEFAULT true,
    descrizione TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


COMMENT ON COLUMN category.workspace_id IS 'NULL = categoria globale, valorizzato = specifica del workspace';


-- COMPETITION - Campionati/Competizioni
CREATE TABLE competition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'Campionato',  -- Campionato, Coppa, Torneo, Amichevole
    federazione VARCHAR(100),
    regione VARCHAR(100),
    logo_url TEXT,
    descrizione TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


-- FACILITY - Impianti sportivi
CREATE TABLE facility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(200) NOT NULL,
    indirizzo TEXT,
    citta VARCHAR(100),
    capienza INTEGER,
    superficie VARCHAR(50),              -- Erba naturale, Erba sintetica, Terra battuta, etc.
    tipo VARCHAR(50),                    -- Stadio, Centro sportivo, Campo comunale, etc.
    illuminazione BOOLEAN DEFAULT false,
    servizi TEXT[],
    coordinate_gps JSONB,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


-- DOCUMENT - Documenti polimorfici (con entita_tipo + entita_id)
CREATE TABLE document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(50) NOT NULL,           -- Convocazione, Distinta, Report, etc.
    entita_tipo VARCHAR(50) NOT NULL,    -- team, match, training, player, staff
    entita_id UUID NOT NULL,
    file_url TEXT NOT NULL,
    nome_file VARCHAR(255),
    mime_type VARCHAR(100),
    dimensione INTEGER,
    data_upload TIMESTAMP DEFAULT NOW(),
    scadenza DATE,
    note TEXT
);


-- ============================================================
-- 3. TABELLE STAGIONALI
-- ============================================================


-- SEASON - Stagione sportiva
CREATE TABLE season (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,          -- Es. "Stagione 2025/2026"
    data_inizio DATE,
    data_fine DATE,
    attiva BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,    -- Stagione predefinita per il workspace
    created_at TIMESTAMP DEFAULT NOW()
);


-- TEAM - Squadra per una specifica stagione
CREATE TABLE team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID NOT NULL REFERENCES season(id) ON DELETE CASCADE,
    category_id UUID REFERENCES category(id),
    nome VARCHAR(100) NOT NULL,
    colori_casa VARCHAR(50),
    colori_trasferta VARCHAR(50),
    venue_id UUID REFERENCES facility(id),
    allenatore_id UUID REFERENCES staff(id),
    dirigente_id UUID REFERENCES staff(id),
    preparatore_id UUID REFERENCES staff(id),
    portieri_id UUID REFERENCES staff(id),
    matricola_figc VARCHAR(100),
    iscritta_competizione UUID REFERENCES competition(id),
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


-- TEAM_PLAYER - Assegnazione giocatore a squadra
-- Nota: Un giocatore puo' essere assegnato a piu' squadre.
-- is_primary = TRUE (rosa principale), is_primary = FALSE (aggregazione)
CREATE TABLE team_player (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES player(id) ON DELETE RESTRICT,
    is_primary BOOLEAN DEFAULT true,
    numero_maglia INTEGER,
    ruolo_preferito VARCHAR(50),
    stato VARCHAR(50) DEFAULT 'Attivo',  -- Attivo, Aggregato, Infortunato, Svincolato, Trasferito
    data_assegnazione DATE DEFAULT CURRENT_DATE,
    data_cessione DATE,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


COMMENT ON COLUMN team_player.is_primary IS 'TRUE = rosa principale, FALSE = aggregazione temporanea';


-- TEAM_STAFF - Assegnazione staff a squadra
CREATE TABLE team_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    ruolo_squadra VARCHAR(100) NOT NULL,   -- Allenatore, Vice, Preparatore, etc.
    data_assegnazione DATE DEFAULT CURRENT_DATE,
    data_cessione DATE,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(team_id, staff_id, ruolo_squadra)
);


-- MATCH - Partita
CREATE TABLE match (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competition(id),
    venue_id UUID REFERENCES facility(id),
    data_ora TIMESTAMP NOT NULL,
    avversario VARCHAR(200) NOT NULL,
    luogo VARCHAR(20) DEFAULT 'Casa',    -- Casa, Trasferta, Campo neutro
    giornata INTEGER,
    gol_casa INTEGER DEFAULT 0,
    gol_ospite INTEGER DEFAULT 0,
    stato VARCHAR(30) DEFAULT 'Da disputare',  -- Da disputare, In corso, Terminata, Rinviata, Annullata
    archiviata BOOLEAN DEFAULT false,
    note TEXT,
    note_avversario TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


-- MATCH_EVENT - Eventi partita (gol, cartellini, sostituzioni, etc.)
CREATE TABLE match_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    tipo_evento VARCHAR(50) NOT NULL,    -- Gol, Assist, Ammonizione, Espulsione, Sostituzione, etc.
    minuto INTEGER,
    player_id UUID REFERENCES player(id),
    player_id_secondario UUID REFERENCES player(id),  -- Per assist, sostituzione, etc.
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


-- MATCH_FORMATION - Formazione partita
CREATE TABLE match_formation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    team_player_id UUID NOT NULL REFERENCES team_player(id) ON DELETE CASCADE,
    posizione VARCHAR(50),               -- Portiere, Terzino, Centrocampista, Attaccante, etc.
    numero_maglia INTEGER,
    is_captain BOOLEAN DEFAULT false,
    is_vice_captain BOOLEAN DEFAULT false,
    is_starter BOOLEAN DEFAULT true,
    ordine INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);


-- CONVOCATION - Convocazioni per partita
CREATE TABLE convocation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    team_player_id UUID NOT NULL REFERENCES team_player(id) ON DELETE CASCADE,
    convocato_da UUID REFERENCES staff(id),
    convocato_il DATE DEFAULT CURRENT_DATE,
    confermato BOOLEAN,
    presente BOOLEAN,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(match_id, team_player_id)
);


-- TRAINING - Allenamento
CREATE TABLE training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES facility(id),
    data_ora TIMESTAMP NOT NULL,
    durata_minuti INTEGER DEFAULT 90,
    tipo VARCHAR(50),                    -- Tecnico, Tattico, Fisico, Combinato, etc.
    descrizione TEXT,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


-- TRAINING_ATTENDANCE - Presenze allenamenti
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


-- MATCH_STATISTICS - Statistiche partita per giocatore
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


-- ============================================================
-- 4. INDICI
-- ============================================================


-- Category
CREATE INDEX idx_category_workspace ON category(workspace_id);
CREATE INDEX idx_category_tipo ON category(tipo_campionato);
CREATE INDEX idx_category_anni ON category(anno_da, anno_a);


-- Season
CREATE INDEX idx_season_workspace ON season(workspace_id);
CREATE INDEX idx_season_attiva ON season(attiva);


-- Team
CREATE INDEX idx_team_season ON team(season_id);
CREATE INDEX idx_team_category ON team(category_id);
CREATE INDEX idx_team_allenatore ON team(allenatore_id);
CREATE INDEX idx_team_competizione ON team(iscritta_competizione);


-- Team Player
CREATE INDEX idx_team_player_team ON team_player(team_id);
CREATE INDEX idx_team_player_player ON team_player(player_id);
CREATE INDEX idx_team_player_stato ON team_player(stato);


-- Team Staff
CREATE INDEX idx_team_staff_team ON team_staff(team_id);
CREATE INDEX idx_team_staff_staff ON team_staff(staff_id);


-- Match
CREATE INDEX idx_match_team ON match(team_id);
CREATE INDEX idx_match_data_ora ON match(data_ora);
CREATE INDEX idx_match_stato ON match(stato);


-- Match Event
CREATE INDEX idx_match_event_match ON match_event(match_id);
CREATE INDEX idx_match_event_player ON match_event(player_id);


-- Convocation
CREATE INDEX idx_convocation_match ON convocation(match_id);
CREATE INDEX idx_convocation_player ON convocation(team_player_id);


-- Training
CREATE INDEX idx_training_team ON training(team_id);
CREATE INDEX idx_training_data_ora ON training(data_ora);


-- Training Attendance
CREATE INDEX idx_training_attendance_training ON training_attendance(training_id);
CREATE INDEX idx_training_attendance_player ON training_attendance(team_player_id);


-- Match Statistics
CREATE INDEX idx_match_statistics_match ON match_statistics(match_id);
CREATE INDEX idx_match_statistics_player ON match_statistics(team_player_id);


-- Document
CREATE INDEX idx_document_entita ON document(entita_tipo, entita_id);
CREATE INDEX idx_document_tipo ON document(tipo);


-- ============================================================
-- 5. NOTE PER L'INSERIMENTO DATI DEMO
-- ============================================================


/*
CATEGORIE STAGIONE 2025/26:
- U14 = nati 2012
- U15 = nati 2011
- U16 = nati 2010
- U17 = nati 2009
- U18 = nati 2008
- U19 = nati 2007
- Juniores = nati 2007-2008
- Primavera = nati 2005-2006


tipo_campionato: Provinciale, Regionale, Elite, Pro


WORKSPACES:
- 00000000-0000-0000-0000-000000000001 = ASD Green Academy (Demo)
- 22222222-2222-2222-2222-222222222222 = SSD New Team
- 752eab50-73c1-495b-9e0e-8b851e9c9a99 = ACP Annex
- ab1186e5-a884-4355-b684-28e32b8157c2 = DF Academy
*/


-- ============================================================
-- 6. MAPPA DI CONVERSIONE (Vecchie → Nuove Tabelle)
-- ============================================================


/*
| Vecchia Tabella (IT) | Nuova Tabella (EN) | Note |
|----------------------|-------------------|------|
| rosa                 | team_player       | Assegnazioni stagionali |
| partita              | match             | Ridenominata |
| evento_partita       | match_event       | Ridenominata |
| allenamento          | training          | Ridenominata |
| presenza_allenamento | training_attendance | Ridenominata |
| formazione_partita   | match_formation   | Ridenominata |
| configurazione_allenamento | N/A         | Assorbita in training |
| stagione             | season            | Rinominata |
| calciatore           | player            | Rinominata |
*/
