-- ================================================================
-- YOUTH FOOTBALL MANAGER - NUOVO WORKSPACE DI ESEMPIO
-- Esegui in Supabase SQL Editor
-- Nota: ASD Albalonga esiste già con ID 11111111-...
-- ================================================================

-- ================================================================
-- 1. WORKSPACE NUOVO (usa ID univoco)
-- ================================================================
INSERT INTO workspace (id, nome, indirizzo, città, telefono, email, data_creazione)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  'ASD Sport Academy',
  'Via del Calcio 99',
  'Roma',
  '06 9999999',
  'info@sportacademy.it',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 2. STAGIONE ATTIVA
-- ================================================================
INSERT INTO stagione (id, workspace_id, nome, data_inizio, data_fine, is_attiva)
VALUES (
  '66666666-6666-6666-6666-666666666667',
  '66666666-6666-6666-6666-666666666666',
  '2025/26',
  '2025-07-01',
  '2026-06-30',
  true
) ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 3. SQUADRE
-- ================================================================
INSERT INTO squadra (id, stagione_id, nome, categoria, allenatore, dirigente, telefono_dirigente, email_dirigente)
VALUES
  ('66666666-6666-6666-6666-666666666668', '66666666-6666-6666-6666-666666666667', 'Sport Academy', 'Pulcini', 'Marco Totti', 'Sara Blu', '3399999991', 'sara@sportacademy.it'),
  ('66666666-6666-6666-6666-666666666669', '66666666-6666-6666-6666-666666666667', 'Sport Academy', 'Esordienti', 'Luca Romani', 'Anna Verde', '3399999992', 'anna@sportacademy.it')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 4. UTENTE ADMIN (password: admin123)
-- Cambia la password dopo il primo login!
-- ================================================================
INSERT INTO utente (id, workspace_id, email, password_hash, nome, cognome, ruolo, is_active, is_superadmin)
VALUES (
  '66666666-6666-6666-6666-666666666670',
  '66666666-6666-6666-6666-666666666666',
  'admin@sportacademy.it',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4m0zFPaRUd.IkMH2',
  'Admin',
  'Sport',
  'admin',
  true,
  false
) ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- VERIFICA
-- ================================================================
SELECT 'Workspace ASD Sport Academy creato!' as status;
SELECT id, nome, email, data_creazione FROM workspace ORDER BY data_creazione;
