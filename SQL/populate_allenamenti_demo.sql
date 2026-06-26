-- =====================================================
-- POPOLA DATI ALLENAMENTI DEMO
-- Esegui questo script in Supabase SQL Editor
-- =====================================================

-- Squadra Green Academy Primavera
-- ID: 00000000-0000-0000-0000-000000000010

-- 1. CONFIGURAZIONE ALLENAMENTI SETTIMANALI
-- =====================================================

-- Elimina configurazioni esistenti e inserisci nuove
DELETE FROM configurazione_allenamento 
WHERE squadra_id = '00000000-0000-0000-0000-000000000010';

INSERT INTO configurazione_allenamento (squadra_id, giorno_settimana, ora_inizio, ora_fine, luogo) VALUES
  ('00000000-0000-0000-0000-000000000010', 2, '17:00', '18:30', 'Campo Sportivo Comunale'),  -- Martedì
  ('00000000-0000-0000-0000-000000000010', 4, '17:00', '18:30', 'Campo Sportivo Comunale');  -- Giovedì

-- 2. PRESENZE ALLENAMENTO (ULTIME 8 SETTIMANE)
-- =====================================================
-- Da eseguire con uno script esterno o manualmente
-- 320 presenze totali (20 giocatori × 16 allenamenti)

-- 3. VERIFICA
-- =====================================================
SELECT 
  'Configurazioni' as tipo,
  COUNT(*) as quantita
FROM configurazione_allenamento
WHERE squadra_id = '00000000-0000-0000-0000-000000000010'

UNION ALL

SELECT 
  'Presenze Totali' as tipo,
  COUNT(*) as quantita
FROM presenza_allenamento
WHERE squadra_id = '00000000-0000-0000-0000-000000000010';

-- Mostra riepilogo presenze per giocatore
SELECT 
  c.nome || ' ' || c.cognome as giocatore,
  COUNT(*) as allenamenti,
  SUM(CASE WHEN p.presente THEN 1 ELSE 0 END) as presenti,
  ROUND(SUM(CASE WHEN p.presente THEN 1 ELSE 0 END)::NUMERIC / COUNT(*) * 100, 1) as percentuale
FROM presenza_allenamento p
JOIN calciatore c ON c.id = p.calciatore_id
WHERE p.squadra_id = '00000000-0000-0000-0000-000000000010'
GROUP BY c.id, c.nome, c.cognome
ORDER BY percentuale DESC, c.cognome;
