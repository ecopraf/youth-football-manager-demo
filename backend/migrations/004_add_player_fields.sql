-- ============================================================
-- 004_add_player_fields.sql
-- Aggiunge i campi mancanti alla tabella player
-- per la scheda giocatore completa
-- ============================================================

-- Campi anagrafici aggiuntivi
ALTER TABLE player ADD COLUMN IF NOT EXISTS luogo_nascita TEXT;
ALTER TABLE player ADD COLUMN IF NOT EXISTS nazionalita TEXT DEFAULT 'Italiana';
ALTER TABLE player ADD COLUMN IF NOT EXISTS residenza TEXT;

-- Campi documentali
ALTER TABLE player ADD COLUMN IF NOT EXISTS matricola_figc TEXT UNIQUE;
ALTER TABLE player ADD COLUMN IF NOT EXISTS tipo_documento TEXT;
ALTER TABLE player ADD COLUMN IF NOT EXISTS numero_documento TEXT;
ALTER TABLE player ADD COLUMN IF NOT EXISTS rilasciato_da TEXT;

-- Campi medici
ALTER TABLE player ADD COLUMN IF NOT EXISTS data_visita_medica DATE;
ALTER TABLE player ADD COLUMN IF NOT EXISTS scadenza_visita_medica DATE;

-- Campi tesseramento
ALTER TABLE player ADD COLUMN IF NOT EXISTS tesserato_dal DATE;
ALTER TABLE player ADD COLUMN IF NOT EXISTS tesserato_fino_al DATE;

-- ============================================================
-- Aggiorna gli indici per i nuovi campi
-- ============================================================

-- Indice per ricerca rapida per nome/cognome
CREATE INDEX IF NOT EXISTS idx_player_nome_cognome ON player(nome, cognome);

-- Indice per scadenze mediche
CREATE INDEX IF NOT EXISTS idx_player_scadenza_medica ON player(scadenza_visita_medica);

-- Indice per matricola FIGC
CREATE INDEX IF NOT EXISTS idx_player_matricola_figc ON player(matricola_figc);

-- ============================================================
-- Verifica
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE 'Campi aggiunti alla tabella player:';
  RAISE NOTICE '  - soprannome, luogo_nascita, nazionalita, residenza';
  RAISE NOTICE '  - matricola_figc, tipo_documento, numero_documento, rilasciato_da';
  RAISE NOTICE '  - data_visita_medica, scadenza_visita_medica';
  RAISE NOTICE '  - tesserato_dal, tesserato_fino_al';
END $$;