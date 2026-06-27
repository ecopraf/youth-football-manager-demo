-- ============================================================
-- YOUTH FOOTBALL MANAGER - NUOVO SCHEMA DB
-- Versione: 1.4 - 2026-06-27
--
-- Questo script CREA SOLO LA STRUTTURA DEL DATABASE
-- I dati vengono inseriti tramite webapp o script dedicati
--
-- CONTENUTO:
-- 1. Drop tabelle vecchie
-- 2. Creazione tabelle nuove
-- 3. Modifica tabelle esistenti
-- 4. Creazione indici
--
-- ELENCO TABELLE NUOVE:
-- - category     (categorie - globali o specifiche del workspace)
-- - competition  (campionati/competizioni)
-- - facility    (impianti sportivi)
-- - staff       (anagrafica personale)
-- - team        (squadre per stagione)
-- - team_player (assegnazione giocatori - supporta aggregazioni)
-- - team_staff  (assegnazione staff)
-- - match       (partite)
-- - match_event (eventi partita)
-- - match_formation (formazione)
-- - convocation (convocazioni)
-- - training    (allenamenti)
-- - training_attendance (presenze allenamenti)
-- - match_statistics (statistiche)
-- - document    (documenti polimorfici)
--
-- NOTE:
-- - Categoria: workspace_id=NULL (globale), valorizzato (specifica)
-- - Giocatori: un calciatore puo' essere in piu' squadre (aggregazioni)
-- - team_player.is_primary = TRUE (rosa principale), FALSE (aggregazione)
-- ============================================================

-- 1. DROP TABELLE VECCHIE
DROP TABLE IF EXISTS rosa CASCADE;
DROP TABLE IF EXISTS partita CASCADE;
DROP TABLE IF EXISTS evento_partita CASCADE;
DROP TABLE IF EXISTS allenamento CASCADE;
DROP TABLE IF EXISTS presenza_allenamento CASCADE;
DROP TABLE IF EXISTS formazione_partita CASCADE;
DROP TABLE IF EXISTS configurazione_allenamento CASCADE;

-- 2. CREA TABELLE NUOVE

-- CATEGORY
-- Nota: workspace_id NULL = categoria globale (creata da superadmin)
--       workspace_id valorizzato = categoria specifica del workspace (creata dall'admin del workspace)
CREATE TABLE category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo_campionato VARCHAR(50) DEFAULT 'Regionale',
    anno_da INTEGER NOT NULL,
    anno_a INTEGER NOT NULL,
    genere VARCHAR(10) DEFAULT 'M',
    is_active BOOLEAN DEFAULT true,
    descrizione TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON COLUMN category.workspace_id IS 'NULL = categoria globale, valorizzato = specifica del workspace';
COMMENT ON COLUMN category.tipo_campionato IS 'Provinciale, Regionale, Elite, Pro';

-- COMPETITION
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

-- FACILITY
CREATE TABLE facility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(200) NOT NULL,
    indirizzo TEXT,
    citta VARCHAR(100),
    capienza INTEGER,
    superficie VARCHAR(50),
    tipo VARCHAR(50),
    illuminazione BOOLEAN DEFAULT false,
    servizi TEXT[],
    coordinate_gps JSONB,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- STAFF
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

-- TEAM
CREATE TABLE team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID NOT NULL REFERENCES stagione(id) ON DELETE CASCADE,
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

-- TEAM_PLAYER
-- Nota: Un giocatore puo' essere assegnato a piu' squadre.
-- is_primary=true indica la rosa principale, is_primary=false indica un'aggregazione.
CREATE TABLE team_player (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES calciatore(id) ON DELETE RESTRICT,
    is_primary BOOLEAN DEFAULT true,
    numero_maglia INTEGER,
    ruolo_preferito VARCHAR(50),
    stato VARCHAR(50) DEFAULT 'Attivo',
    data_assegnazione DATE DEFAULT CURRENT_DATE,
    data_cessione DATE,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON COLUMN team_player.is_primary IS 'TRUE = rosa principale, FALSE = aggregazione temporanea';
COMMENT ON COLUMN team_player.stato IS 'Attivo, Aggregato, Infortunato, Svincolato, Trasferito';

-- TEAM_STAFF
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

-- MATCH
CREATE TABLE match (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competition(id),
    venue_id UUID REFERENCES facility(id),
    data_ora TIMESTAMP NOT NULL,
    avversario VARCHAR(200) NOT NULL,
    luogo VARCHAR(20) DEFAULT 'Casa',
    giornata INTEGER,
    gol_casa INTEGER DEFAULT 0,
    gol_ospite INTEGER DEFAULT 0,
    stato VARCHAR(30) DEFAULT 'Da disputare',
    archiviat BOOLEAN DEFAULT false,
    note TEXT,
    note_avversario TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- MATCH_EVENT
CREATE TABLE match_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    tipo_evento VARCHAR(50) NOT NULL,
    minuto INTEGER,
    player_id UUID REFERENCES calciatore(id),
    player_id_secondario UUID REFERENCES calciatore(id),
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- MATCH_FORMATION
CREATE TABLE match_formation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    team_player_id UUID NOT NULL REFERENCES team_player(id) ON DELETE CASCADE,
    posizione VARCHAR(50),
    numero_maglia INTEGER,
    is_captain BOOLEAN DEFAULT false,
    is_vice_captain BOOLEAN DEFAULT false,
    is_starter BOOLEAN DEFAULT true,
    ordine INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CONVOCATION
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

-- TRAINING
CREATE TABLE training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES facility(id),
    data_ora TIMESTAMP NOT NULL,
    durata_minuti INTEGER DEFAULT 90,
    tipo VARCHAR(50),
    descrizione TEXT,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TRAINING_ATTENDANCE
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

-- MATCH_STATISTICS
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

-- DOCUMENT
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

-- 3. MODIFICA TABELLE ESISTENTI
ALTER TABLE stagione ADD COLUMN IF NOT EXISTS attiva BOOLEAN DEFAULT false;
ALTER TABLE stagione ADD COLUMN IF NOT EXISTS data_inizio DATE;
ALTER TABLE stagione ADD COLUMN IF NOT EXISTS data_fine DATE;
ALTER TABLE stagione ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

ALTER TABLE calciatore ADD COLUMN IF NOT EXISTS sesso VARCHAR(1) DEFAULT 'M';
ALTER TABLE calciatore ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 4. DATI (da inserire tramite webapp o script dedicati)
-- I dati iniziali (categorie, competizioni) verranno inseriti dall'utente o tramite script separati

-- NOTE PER L'INSERIMENTO DATI:
-- 
-- CATEGORIE STAGIONE 2025/26:
-- U14 = nati 2012, U15 = nati 2011, U16 = nati 2010
-- U17 = nati 2009, U18 = nati 2008, U19 = nati 2007
-- Juniores = nati 2007-2008, Primavera = nati 2005-2006
--
-- tipo_campionato: Provinciale, Regionale, Elite, Pro
--
-- WORKSPACES ATTUALI:
-- 00000000-0000-0000-0000-000000000001 = ASD Green Academy (Demo)
-- 22222222-2222-2222-2222-222222222222 = SSD New Team
-- 752eab50-73c1-495b-9e0e-8b851e9c9a99 = ACP Annex
-- ab1186e5-a884-4355-b684-28e32b8157c2 = DF Academy

-- 5. INDICI
CREATE INDEX IF NOT EXISTS idx_category_workspace ON category(workspace_id);
CREATE INDEX IF NOT EXISTS idx_category_tipo ON category(tipo_campionato);
CREATE INDEX IF NOT EXISTS idx_category_anni ON category(anno_da, anno_a);
CREATE INDEX IF NOT EXISTS idx_team_season ON team(season_id);
CREATE INDEX IF NOT EXISTS idx_team_category ON team(category_id);
CREATE INDEX IF NOT EXISTS idx_team_player_team ON team_player(team_id);
CREATE INDEX IF NOT EXISTS idx_team_player_player ON team_player(player_id);
CREATE INDEX IF NOT EXISTS idx_team_staff_team ON team_staff(team_id);
CREATE INDEX IF NOT EXISTS idx_team_staff_staff ON team_staff(staff_id);
CREATE INDEX IF NOT EXISTS idx_match_team ON match(team_id);
CREATE INDEX IF NOT EXISTS idx_match_data_ora ON match(data_ora);
CREATE INDEX IF NOT EXISTS idx_match_event_match ON match_event(match_id);
CREATE INDEX IF NOT EXISTS idx_convocation_match ON convocation(match_id);
CREATE INDEX IF NOT EXISTS idx_training_team ON training(team_id);
