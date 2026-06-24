-- Script per popolare dati di test per U14
-- Eseguire su Supabase SQL Editor

-- Verifica se esiste gia la squadra U14 e crea giocatori di test
DO $$
DECLARE
  u14_id UUID := '33333333-3333-3333-3333-333333333333';
  new_player_id UUID;
  current_date DATE := CURRENT_DATE;
  first_names TEXT[] := ARRAY['Andrea', 'Luca', 'Matteo', 'Alessandro', 'Federico', 'Lorenzo', 'Tommaso', 'Gabriele', 'Nicolo', 'Davide', 'Simone', 'Filippo', 'Riccardo', 'Edoardo', 'Antonio', 'Giovanni', 'Paolo', 'Francesco'];
  last_names TEXT[] := ARRAY['Rossi', 'Bianchi', 'Verdi', 'Neri', 'Gialli', 'Blu', 'Arancioni', 'Viola', 'Rosa', 'Celesti', 'Grigi', 'Marroni', 'Lilla', 'Ocra', 'Ciani', 'Benedetti', 'Martinelli', 'Colombo'];
BEGIN
  FOR i IN 1..18 LOOP
    new_player_id := gen_random_uuid();
    
    INSERT INTO calciatori (id, nome, cognome, data_nascita, telefono, data_visita_medica, matricola_figc, tipo_documento, numero_documento, rilasciato_da, workspace_id)
    VALUES (
      new_player_id,
      first_names[i],
      last_names[i],
      DATE '2012-01-01' + (random() * 730)::INT,
      '+39 333 ' || LPAD((1000000 + (random() * 8999999)::INT)::TEXT, 7, '0'),
      current_date + ((random() * 400 - 30)::INT),
      'FIGC-' || (100000 + i),
      'Carta di Identita',
      'A' || LPAD((random() * 99999999)::INT::TEXT, 8, '0'),
      'Comune di Roma',
      '11111111-1111-1111-1111-111111111111'
    )
    ON CONFLICT (id) DO UPDATE SET
      nome = EXCLUDED.nome,
      cognome = EXCLUDED.cognome,
      data_visita_medica = EXCLUDED.data_visita_medica;
    
    INSERT INTO rosa (id, squadra_id, calciatore_id, numero_maglia, ruolo, stato)
    VALUES (
      gen_random_uuid(),
      u14_id,
      new_player_id,
      i,
      CASE 
        WHEN i = 1 THEN 'Portiere'
        WHEN i <= 5 THEN 'Difensore'
        WHEN i <= 9 THEN 'Centrocampista'
        ELSE 'Attaccante'
      END,
      'Attivo'
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Creati/aggiornati 18 giocatori di test per U14';
END $$;

-- Verifica i giocatori
SELECT s.nome as squadra, COUNT(r.id) as num_giocatori
FROM rosa r
JOIN squadra s ON r.squadra_id = s.id
WHERE s.id = '33333333-3333-3333-3333-333333333333'
GROUP BY s.nome;
