-- ============================================
-- SCRIPT SEED DATABASE - U14 ASD Albalonga
-- Esegui su Supabase Dashboard → SQL Editor
-- ============================================

-- Pulisci dati esistenti (opzionale - decommenta se vuoi ripartire da zero)
-- DELETE FROM evento_partita;
-- DELETE FROM convocazione;
-- DELETE FROM formazione_partita;
-- DELETE FROM partita;
-- DELETE FROM rosa;
-- DELETE FROM calciatore;
-- DELETE FROM squadra;
-- DELETE FROM stagione;

-- 1. CREA STAGIONE
INSERT INTO stagione (id, nome, anno, attiva) 
VALUES ('a1111111-1111-1111-1111-111111111111', 'Stagione 2024/2025', '2024-2025', true)
ON CONFLICT DO NOTHING;

-- 2. CREA SQUADRA
INSERT INTO squadra (id, stagione_id, nome, categoria, allenatore, dirigente)
VALUES ('b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'ASD Albalonga', 'U14', 'Marco Rossi', 'Luca Bianchi')
ON CONFLICT DO NOTHING;

-- 3. CREA GIOCATORI
DO $$
DECLARE
  cal_id UUID;
BEGIN
  -- Giocatore 1
  INSERT INTO calciatore (id, workspace_id, nome, cognome, data_nascita) 
  VALUES ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Lorenzo', 'Esposito', '2012-03-15')
  ON CONFLICT DO NOTHING RETURNING id INTO cal_id;
  INSERT INTO rosa (squadra_id, calciatore_id, numero_maglia, ruolo, stato) 
  VALUES ('b2222222-2222-2222-2222-222222222222', cal_id, 1, 'Portiere', 'Attivo') ON CONFLICT DO NOTHING;

  -- Giocatore 2
  INSERT INTO calciatore (id, workspace_id, nome, cognome, data_nascita) 
  VALUES ('c2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Alessandro', 'Romano', '2012-05-20')
  ON CONFLICT DO NOTHING RETURNING id INTO cal_id;
  INSERT INTO rosa (squadra_id, calciatore_id, numero_maglia, ruolo, stato) 
  VALUES ('b2222222-2222-2222-2222-222222222222', cal_id, 2, 'Difensore', 'Attivo') ON CONFLICT DO NOTHING;

  -- Giocatore 3
  INSERT INTO calciatore (id, workspace_id, nome, cognome, data_nascita) 
  VALUES ('c3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Matteo', 'Ricci', '2012-01-10')
  ON CONFLICT DO NOTHING RETURNING id INTO cal_id;
  INSERT INTO rosa (squadra_id, calciatore_id, numero_maglia, ruolo, stato) 
  VALUES ('b2222222-2222-2222-2222-222222222222', cal_id, 3, 'Difensore', 'Attivo') ON CONFLICT DO NOTHING;

  -- Giocatore 4
  INSERT INTO calciatore (id, workspace_id, nome, cognome, data_nascita) 
  VALUES ('c4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Gabriele', 'Costa', '2012-07-08')
  ON CONFLICT DO NOTHING RETURNING id INTO cal_id;
  INSERT INTO rosa (squadra_id, calciatore_id, numero_maglia, ruolo, stato) 
  VALUES ('b2222222-2222-2222-2222-222222222222', cal_id, 4, 'Centrocampista', 'Attivo') ON CONFLICT DO NOTHING;

  -- Giocatore 5
  INSERT INTO calciatore (id, workspace_id, nome, cognome, data_nascita) 
  VALUES ('c5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Davide', 'Marino', '2012-04-22')
  ON CONFLICT DO NOTHING RETURNING id INTO cal_id;
  INSERT INTO rosa (squadra_id, calciatore_id, numero_maglia, ruolo, stato) 
  VALUES ('b2222222-2222-2222-2222-222222222222', cal_id, 5, 'Centrocampista', 'Attivo') ON CONFLICT DO NOTHING;

  -- Giocatore 6
  INSERT INTO calciatore (id, workspace_id, nome, cognome, data_nascita) 
  VALUES ('c6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Federico', 'Greco', '2012-09-12')
  ON CONFLICT DO NOTHING RETURNING id INTO cal_id;
  INSERT INTO rosa (squadra_id, calciatore_id, numero_maglia, ruolo, stato) 
  VALUES ('b2222222-2222-2222-2222-222222222222', cal_id, 6, 'Attaccante', 'Attivo') ON CONFLICT DO NOTHING;

  -- Giocatore 7
  INSERT INTO calciatore (id, workspace_id, nome, cognome, data_nascita) 
  VALUES ('c7777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'Tommaso', 'Conti', '2012-02-28')
  ON CONFLICT DO NOTHING RETURNING id INTO cal_id;
  INSERT INTO rosa (squadra_id, calciatore_id, numero_maglia, ruolo, stato) 
  VALUES ('b2222222-2222-2222-2222-222222222222', cal_id, 7, 'Attaccante', 'Attivo') ON CONFLICT DO NOTHING;

  -- Giocatore 8
  INSERT INTO calciatore (id, workspace_id, nome, cognome, data_nascita) 
  VALUES ('c8888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'Luca', 'Ferrara', '2012-11-05')
  ON CONFLICT DO NOTHING RETURNING id INTO cal_id;
  INSERT INTO rosa (squadra_id, calciatore_id, numero_maglia, ruolo, stato) 
  VALUES ('b2222222-2222-2222-2222-222222222222', cal_id, 8, 'Difensore', 'Attivo') ON CONFLICT DO NOTHING;

  -- Giocatore 9
  INSERT INTO calciatore (id, workspace_id, nome, cognome, data_nascita) 
  VALUES ('c9999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'Andrea', 'Ferraro', '2012-06-18')
  ON CONFLICT DO NOTHING RETURNING id INTO cal_id;
  INSERT INTO rosa (squadra_id, calciatore_id, numero_maglia, ruolo, stato) 
  VALUES ('b2222222-2222-2222-2222-222222222222', cal_id, 9, 'Centrocampista', 'Attivo') ON CONFLICT DO NOTHING;

  -- Giocatore 10
  INSERT INTO calciatore (id, workspace_id, nome, cognome, data_nascita) 
  VALUES ('caaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Simone', 'Russo', '2012-08-30')
  ON CONFLICT DO NOTHING RETURNING id INTO cal_id;
  INSERT INTO rosa (squadra_id, calciatore_id, numero_maglia, ruolo, stato) 
  VALUES ('b2222222-2222-2222-2222-222222222222', cal_id, 10, 'Attaccante', 'Attivo') ON CONFLICT DO NOTHING;

END $$;

-- 4. CREA PARTITE E EVENTI
DO $$
DECLARE
  p_id UUID;
BEGIN
  -- PARTITA 1: Vittoria 4-1 (Casa)
  INSERT INTO partita (id, squadra_id, data_ora, avversario, luogo, competizione, giornata)
  VALUES ('p1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', '2024-09-22 10:00:00', 'Fortitudo Roma', 'Casa', 'Campionato U14', 1)
  RETURNING id INTO p_id;
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 15, 'c5555555-5555-5555-5555-555555555555', 'c4444444-4444-4444-4444-444444444444');
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 32, 'c6666666-6666-6666-6666-666666666666', NULL);
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 45, 'c7777777-7777-7777-7777-777777777777', 'c5555555-5555-5555-5555-555555555555');
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 68, 'caaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL);
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'YELLOW', 25, 'c3333333-3333-3333-3333-333333333333', NULL);

  -- PARTITA 2: Vittoria 2-0 (Trasferta)
  INSERT INTO partita (id, squadra_id, data_ora, avversario, luogo, competizione, giornata)
  VALUES ('p2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', '2024-10-06 15:30:00', 'Virtus Aurelia', 'Trasferta', 'Campionato U14', 2)
  RETURNING id INTO p_id;
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 20, 'c6666666-6666-6666-6666-666666666666', 'c9999999-9999-9999-9999-999999999999');
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 55, 'c7777777-7777-7777-7777-777777777777', NULL);
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'YELLOW', 40, 'c8888888-8888-8888-8888-888888888888', NULL);

  -- PARTITA 3: Pareggio 1-1 (Casa)
  INSERT INTO partita (id, squadra_id, data_ora, avversario, luogo, competizione, giornata)
  VALUES ('p3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', '2024-10-20 11:00:00', 'Lupa Roma', 'Casa', 'Campionato U14', 3)
  RETURNING id INTO p_id;
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 35, 'c4444444-4444-4444-4444-444444444444', NULL);
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'YELLOW', 50, 'c5555555-5555-5555-5555-555555555555', NULL);
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'YELLOW', 58, 'c6666666-6666-6666-6666-666666666666', NULL);

  -- PARTITA 4: Sconfitta 0-2 (Trasferta)
  INSERT INTO partita (id, squadra_id, data_ora, avversario, luogo, competizione, giornata)
  VALUES ('p4444444-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', '2024-11-03 14:00:00', 'Ostiantica', 'Trasferta', 'Campionato U14', 4)
  RETURNING id INTO p_id;
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'YELLOW', 30, 'c2222222-2222-2222-2222-222222222222', NULL);
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'RED', 70, 'c3333333-3333-3333-3333-333333333333', NULL);

  -- PARTITA 5: Vittoria 4-0 (Casa)
  INSERT INTO partita (id, squadra_id, data_ora, avversario, luogo, competizione, giornata)
  VALUES ('p5555555-5555-5555-5555-555555555555', 'b2222222-2222-2222-2222-222222222222', '2024-11-17 10:30:00', 'Crescentese', 'Casa', 'Campionato U14', 5)
  RETURNING id INTO p_id;
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 10, 'c7777777-7777-7777-7777-777777777777', 'c4444444-4444-4444-4444-444444444444');
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 28, 'caaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c7777777-7777-7777-7777-777777777777');
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 42, 'c9999999-9999-9999-9999-999999999999', NULL);
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 65, 'c6666666-6666-6666-6666-666666666666', 'caaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

  -- PARTITA 6: Pareggio 2-2 (Trasferta)
  INSERT INTO partita (id, squadra_id, data_ora, avversario, luogo, competizione, giornata)
  VALUES ('p6666666-6666-6666-6666-666666666666', 'b2222222-2222-2222-2222-222222222222', '2024-12-01 15:00:00', 'AXG Civitavecchia', 'Trasferta', 'Campionato U14', 6)
  RETURNING id INTO p_id;
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 18, 'c4444444-4444-4444-4444-444444444444', NULL);
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 52, 'c5555555-5555-5555-5555-555555555555', 'c9999999-9999-9999-9999-999999999999');
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'YELLOW', 35, 'c8888888-8888-8888-8888-888888888888', NULL);

  -- PARTITA 7: Vittoria 3-2 (Casa)
  INSERT INTO partita (id, squadra_id, data_ora, avversario, luogo, competizione, giornata)
  VALUES ('p7777777-7777-7777-7777-777777777777', 'b2222222-2222-2222-2222-222222222222', '2025-01-12 10:00:00', 'Fiumicino', 'Casa', 'Campionato U14', 7)
  RETURNING id INTO p_id;
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 8, 'caaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c7777777-7777-7777-7777-777777777777');
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 33, 'c7777777-7777-7777-7777-777777777777', NULL);
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 67, 'c6666666-6666-6666-6666-666666666666', 'c5555555-5555-5555-5555-555555555555');
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'YELLOW', 45, 'c2222222-2222-2222-2222-222222222222', NULL);
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'YELLOW', 58, 'c3333333-3333-3333-3333-333333333333', NULL);

  -- PARTITA 8: Vittoria 1-0 (Trasferta)
  INSERT INTO partita (id, squadra_id, data_ora, avversario, luogo, competizione, giornata)
  VALUES ('p8888888-8888-8888-8888-888888888888', 'b2222222-2222-2222-2222-222222222222', '2025-01-26 14:30:00', 'Tor di Quinto', 'Trasferta', 'Campionato U14', 8)
  RETURNING id INTO p_id;
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 75, 'c7777777-7777-7777-7777-777777777777', 'caaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'YELLOW', 22, 'c4444444-4444-4444-4444-444444444444', NULL);

  -- PARTITA 9: Pareggio 1-1 (Casa)
  INSERT INTO partita (id, squadra_id, data_ora, avversario, luogo, competizione, giornata)
  VALUES ('p9999999-9999-9999-9999-999999999999', 'b2222222-2222-2222-2222-222222222222', '2025-02-09 11:00:00', 'Ponte di Nona', 'Casa', 'Campionato U14', 9)
  RETURNING id INTO p_id;
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 40, 'c9999999-9999-9999-9999-999999999999', NULL);
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'YELLOW', 55, 'c6666666-6666-6666-6666-666666666666', NULL);

  -- PARTITA 10: Vittoria 5-0 (Casa)
  INSERT INTO partita (id, squadra_id, data_ora, avversario, luogo, competizione, giornata)
  VALUES ('paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'b2222222-2222-2222-2222-222222222222', '2025-02-23 10:00:00', 'Santa Maria delle Mole', 'Casa', 'Campionato U14', 10)
  RETURNING id INTO p_id;
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 5, 'c7777777-7777-7777-7777-777777777777', 'c4444444-4444-4444-4444-444444444444');
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 22, 'caaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c7777777-7777-7777-7777-777777777777');
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 38, 'c5555555-5555-5555-5555-555555555555', NULL);
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 55, 'c6666666-6666-6666-6666-666666666666', 'caaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'GOAL', 72, 'c9999999-9999-9999-9999-999999999999', NULL);
  INSERT INTO evento_partita (id, partita_id, tipo_evento_codice, minuto, calciatore_principale_id, calciatore_secondario_id)
  VALUES (gen_random_uuid(), p_id, 'YELLOW', 30, 'c2222222-2222-2222-2222-222222222222', NULL);

END $$;

-- Verifica
SELECT 'Stagione creata' as status;
