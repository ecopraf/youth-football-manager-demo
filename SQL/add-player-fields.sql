-- Aggiunge i nuovi campi alla tabella calciatori
-- Eseguire su Supabase SQL Editor

-- Aggiungi colonne mancanti a calciatori
ALTER TABLE calciatori ADD COLUMN IF NOT EXISTS piede_preferito TEXT DEFAULT 'Destro';
ALTER TABLE calciatori ADD COLUMN IF NOT EXISTS peso DECIMAL(5,2);
ALTER TABLE calciatori ADD COLUMN IF NOT EXISTS altezza INTEGER;

-- Aggiungi stato alla tabella rosa (se non esiste)
ALTER TABLE rosa ADD COLUMN IF NOT EXISTS stato TEXT DEFAULT 'Attivo';

-- Verifica le colonne
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'calciatori' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rosa' 
ORDER BY ordinal_position;
