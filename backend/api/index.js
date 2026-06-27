/**
 * Youth Football Manager - Backend API
 * Versione modulare 3.15
 */

require("dotenv").config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Supabase con keep-alive e timeout esteso
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  global: { fetch: (url, options) => {
    const agent = new http.Agent({ keepAlive: true, timeout: 60000 });
    return fetch(url, { ...options, agent });
  }}
});
const JWT_SECRET = process.env.JWT_SECRET || 'yfm-secret-key-change-in-production';

// CORS ottimizzato
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey'] }));
app.use(express.json({ limit: '5mb' }));

// Health con warmup
app.get('/api/health', async (req, res) => {
  try { await supabase.from('squadra').select('id').limit(1); } catch(e) {}
  res.json({ status: 'ok', version: '3.15', modular: true, warm: true });
});

// Endpoint warmup dedicato
app.get('/api/warmup', async (req, res) => {
  try {
    await supabase.from('squadra').select('id').limit(1);
    res.json({ warm: true, time: new Date().toISOString() });
  } catch(e) {
    res.status(500).json({ warm: false, error: e.message });
  }
});

// ── AUTH MIDDLEWARE ──
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token mancante' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { data: user } = await supabase.from('utente').select('*').eq('id', decoded.userId).single();
    if (!user) return res.status(401).json({ error: 'Utente non trovato' });
    if (user.is_active === false) return res.status(401).json({ error: 'Account disattivato' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token non valido' });
  }
};

// Export supabase e JWT_SECRET per i moduli
module.exports = { app, supabase, JWT_SECRET, authMiddleware };

// ============================================================
// ROUTES - Integrazione moduli nel file principale
// ============================================================

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email e password richiesti' });
    
    const { data: users, error } = await supabase.from('utente').select('*').eq('email', email.toLowerCase()).eq('is_active', true).single();
    if (error || !users) return res.status(401).json({ error: 'Credenziali non valide' });
    
    const validPassword = await bcrypt.compare(password, users.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Credenziali non valide' });
    
    const token = jwt.sign({ userId: users.id, email: users.email, ruolo: users.ruolo, workspace_id: users.workspace_id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: users.id, nome: users.nome, cognome: users.cognome, email: users.email, ruolo: users.ruolo, workspace_id: users.workspace_id } });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nome, cognome, ruolo, workspace_id } = req.body;
    if (!email || !password || !nome || !cognome) return res.status(400).json({ error: 'Tutti i campi sono richiesti' });
    
    const { data: existing } = await supabase.from('utente').select('id').eq('email', email.toLowerCase()).single();
    if (existing) return res.status(409).json({ error: 'Email già registrata' });
    
    const password_hash = await bcrypt.hash(password, 10);
    const { data: newUser, error } = await supabase.from('utente').insert({
      email: email.toLowerCase(), password_hash, nome, cognome, ruolo: ruolo || 'admin',
      workspace_id: workspace_id || '00000000-0000-0000-0000-000000000001', is_active: true
    }).select().single();
    
    if (error) return res.status(400).json({ error: error.message });
    
    const token = jwt.sign({ userId: newUser.id, email: newUser.email, ruolo: newUser.ruolo, workspace_id: newUser.workspace_id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: newUser.id, nome: newUser.nome, cognome: newUser.cognome, email: newUser.email, ruolo: newUser.ruolo, workspace_id: newUser.workspace_id } });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  res.json(req.user);
});

app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  res.json({ success: true });
});

app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { nome, cognome, telefono } = req.body;
    const { data, error } = await supabase.from('utente').update({ nome, cognome, telefono }).eq('id', req.user.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.get('/api/auth/users', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.query.workspace_id;
    let query = supabase.from('utente').select('id, nome, cognome, email, ruolo, workspace_id, ruoli, squadre_accesso, is_superadmin, is_active').eq('is_active', true).order('cognome');
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ users: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.post('/api/auth/users', authMiddleware, async (req, res) => {
  try {
    const { email, password, nome, cognome, ruolo, workspace_id, ruoli, squadre_accesso } = req.body;
    const password_hash = await bcrypt.hash(password || 'ChangeMe123!', 10);
    const { data, error } = await supabase.from('utente').insert({
      email: email.toLowerCase(), password_hash, nome, cognome,
      ruolo: ruolo || 'admin', workspace_id, ruoli: ruoli || [ruolo || 'admin'],
      squadre_accesso: squadre_accesso || [], is_active: true
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.put('/api/auth/users/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cognome, ruolo, workspace_id, ruoli, squadre_accesso, is_active } = req.body;
    const { data, error } = await supabase.from('utente').update({ nome, cognome, ruolo, workspace_id, ruoli, squadre_accesso, is_active }).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, user: data });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.delete('/api/auth/users/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('utente').update({ is_active: false }).eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.post('/api/auth/guest-link', authMiddleware, async (req, res) => {
  try {
    const { workspace_id, expires_in_hours = 24 } = req.body;
    const token = require('crypto').randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + expires_in_hours * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase.from('guest_link').insert({ token, workspace_id, expires_at }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ token: data.token, expires_at: data.expires_at, url: `/guest/${data.token}` });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.get('/api/auth/guest-links', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('guest_link').select('*').gte('expires_at', new Date().toISOString()).order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ links: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.delete('/api/auth/guest-link/:token', authMiddleware, async (req, res) => {
  try {
    const { token } = req.params;
    const { error } = await supabase.from('guest_link').delete().eq('token', token);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.get('/api/guest/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { data, error } = await supabase.from('guest_link').select('*, workspace:workspace_id(id, nome)').eq('token', token).gte('expires_at', new Date().toISOString()).single();
    if (error || !data) return res.status(404).json({ error: 'Link non valido o scaduto' });
    res.json({ workspace: data.workspace });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

// ── WORKSPACE ROUTES ──
app.get('/api/workspaces', async (req, res) => {
  try {
    const { data, error } = await supabase.from('workspace').select('id, nome, logo_url, data_creazione').order('nome');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.get('/api/auth/workspaces', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Non autenticato' });
    const { data: user } = await supabase.from('utente').select('workspace_id').eq('id', userId).single();
    if (!user?.workspace_id) return res.json([]);
    const { data: workspaces, error } = await supabase.from('workspace').select('id, nome, logo_url').eq('id', user.workspace_id);
    if (error) return res.status(400).json({ error: error.message });
    res.json(workspaces || []);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.post('/api/workspaces', authMiddleware, async (req, res) => {
  try {
    const { nome, logo_url, indirizzo, telefono, email, sito_web } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome richiesto' });
    const { data, error } = await supabase.from('workspace').insert({ nome, logo_url, indirizzo, telefono, email, sito_web }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.put('/api/workspaces/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, logo_url, indirizzo, telefono, email, sito_web } = req.body;
    const { data, error } = await supabase.from('workspace').update({ nome, logo_url, indirizzo, telefono, email, sito_web }).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.delete('/api/workspaces/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: seasons } = await supabase.from('stagione').select('id').eq('workspace_id', id);
    if (seasons && seasons.length > 0) return res.status(400).json({ error: 'Elimina prima le stagioni associate' });
    const { error } = await supabase.from('workspace').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.put('/api/workspaces/:id/logo', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { logo_url } = req.body;
    const { error } = await supabase.from('workspace').update({ logo_url }).eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.get('/api/workspaces/:id/stagioni', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('stagione').select('*').eq('workspace_id', id).order('anno_inizio', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.post('/api/workspaces/:id/stagioni', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, anno_inizio, anno_fine, data_inizio, data_fine } = req.body;
    if (!nome || !anno_inizio || !anno_fine) return res.status(400).json({ error: 'Nome, anno inizio e fine richiesti' });
    const { data, error } = await supabase.from('stagione').insert({
      workspace_id: id, nome, anno_inizio, anno_fine, data_inizio, data_fine, attiva: true
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

// ── STAGIONE ROUTES ──
app.get('/api/stagioni', async (req, res) => {
  try {
    const workspaceId = req.query.workspace_id;
    let query = supabase.from('stagione').select('*').order('anno_inizio', { ascending: false });
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.delete('/api/stagioni/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: teams } = await supabase.from('squadra').select('id').eq('stagione_id', id);
    if (teams && teams.length > 0) return res.status(400).json({ error: 'Elimina prima le squadre associate' });
    const { error } = await supabase.from('stagione').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

// ── SQUADRA ROUTES ──
app.get('/api/squadre', async (req, res) => {
  try {
    const { data, error } = await supabase.from('squadra').select('*').order('nome');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.post('/api/squadre', authMiddleware, async (req, res) => {
  try {
    const { nome, categoria, allenatore, dirigente, stagione_id } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome richiesto' });
    const { data, error } = await supabase.from('squadra').insert({ nome, categoria, allenatore, dirigente, stagione_id }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.get('/api/squadre/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('squadra').select('*').eq('id', id).single();
    if (error || !data) return res.status(404).json({ error: 'Squadra non trovata' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.put('/api/squadre/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, categoria, allenatore, dirigente, dirigente2, preparatore_atletico, allenatore_portieri, matricola_dirigente, tessera_lnd_dirigente, tessera_figc_allenatore } = req.body;
    const { error } = await supabase.from('squadra').update({ nome, categoria, allenatore, dirigente, dirigente2, preparatore_atletico, allenatore_portieri, matricola_dirigente, tessera_lnd_dirigente, tessera_figc_allenatore }).eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.delete('/api/squadre/:id', authMiddleware, async (req, res) => {
  try {
    const sid = req.params.id;
    const { data: partite } = await supabase.from('partita').select('id').eq('squadra_id', sid);
    for (const p of (partite || [])) {
      await supabase.from('formazione_partita').delete().eq('partita_id', p.id);
      await supabase.from('convocazione').delete().eq('partita_id', p.id);
      await supabase.from('evento_partita').delete().eq('partita_id', p.id);
    }
    await supabase.from('partita').delete().eq('squadra_id', sid);
    await supabase.from('presenza_allenamento').delete().eq('squadra_id', sid);
    await supabase.from('configurazione_allenamento').delete().eq('squadra_id', sid);
    await supabase.from('rosa').delete().eq('squadra_id', sid);
    await supabase.from('squadra').delete().eq('id', sid);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

// ── GIOCATORI ROUTES ──
app.get('/api/squadre/:squadraId/calciatori', async (req, res) => {
  try {
    const { data } = await supabase.from('rosa').select('calciatore:calciatore_id(*), numero_maglia, ruolo, stato').eq('squadra_id', req.params.squadraId);
    res.json((data || []).map(r => ({
      id: r.calciatore.id, nome: r.calciatore.nome, cognome: r.calciatore.cognome, data_nascita: r.calciatore.data_nascita,
      telefono: r.calciatore.telefono, data_visita_medica: r.calciatore.data_visita_medica, matricola_figc: r.calciatore.matricola_figc,
      tipo_documento: r.calciatore.tipo_documento, numero_documento: r.calciatore.numero_documento, rilasciato_da: r.calciatore.rilasciato_da,
      numero_maglia: r.numero_maglia, ruolo: r.ruolo, stato: r.stato
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/squadre/:squadraId/calciatori', async (req, res) => {
  try {
    const c = req.body;
    const { data: cal, error } = await supabase.from('calciatore').insert({
      workspace_id: '22222222-2222-2222-2222-222222222222', nome: c.nome, cognome: c.cognome,
      data_nascita: c.dataVisitaMedica, telefono: c.telefono, data_visita_medica: c.dataVisitaMedica,
      matricola_figc: c.matricolaFigc, tipo_documento: c.tipoDocumento, numero_documento: c.numeroDocumento, rilasciato_da: c.rilasciatoDa
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    await supabase.from('rosa').insert({ squadra_id: req.params.squadraId, calciatore_id: cal.id, numero_maglia: c.numeroMaglia, ruolo: c.ruolo, stato: 'Attivo' });
    res.status(201).json(cal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/squadre/:squadraId/scadenze-mediche', async (req, res) => {
  try {
    const { data: rosa } = await supabase.from('rosa').select('calciatore:calciatore_id(id, nome, cognome, data_visita_medica)').eq('squadra_id', req.params.squadraId);
    const oggi = new Date();
    const scadenze = (rosa || []).filter(r => r.calciatore.data_visita_medica).map(r => {
      const scadenza = new Date(r.calciatore.data_visita_medica);
      scadenza.setFullYear(scadenza.getFullYear() + 1);
      return { id: r.calciatore.id, nome: r.calciatore.nome, cognome: r.calciatore.cognome, scadenza: scadenza.toISOString().split('T')[0], giorniRimanenti: Math.ceil((scadenza - oggi) / (1000 * 60 * 60 * 24)) };
    }).filter(s => s.giorniRimanenti <= 30).sort((a, b) => a.giorniRimanenti - b.giorniRimanenti);
    res.json(scadenze);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PARTITE ROUTES ──
app.get('/api/squadre/:squadraId/partite', async (req, res) => {
  try {
    const { data } = await supabase.from('partita').select('*').eq('squadra_id', req.params.squadraId).order('data_ora', { ascending: false });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/squadre/:squadraId/partite-future', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const { data } = await supabase.from('partita').select('*').eq('squadra_id', req.params.squadraId).gte('data_ora', now).order('data_ora', { ascending: true }).limit(5);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/squadre/:squadraId/partite', async (req, res) => {
  try {
    const p = req.body;
    const { data } = await supabase.from('partita').insert({ squadra_id: req.params.squadraId, data_ora: p.dataOra, avversario: p.avversario, luogo: p.luogo, competizione: p.competizione, giornata: p.giornata }).select().single();
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/partite/:id', async (req, res) => {
  try {
    const p = req.body;
    await supabase.from('partita').update({ data_ora: p.dataOra, avversario: p.avversario, luogo: p.luogo, competizione: p.competizione, giornata: p.giornata }).eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/partite/:id', async (req, res) => {
  try {
    await supabase.from('evento_partita').delete().eq('partita_id', req.params.id);
    await supabase.from('formazione_partita').delete().eq('partita_id', req.params.id);
    await supabase.from('convocazione').delete().eq('partita_id', req.params.id);
    await supabase.from('partita').delete().eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CALCIATORE ROUTES ──
app.get('/api/calciatori/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('calciatore').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Giocatore non trovato' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.put('/api/calciatori/:id', async (req, res) => {
  try {
    const { nome, cognome, data_nascita, telefono, email, data_visita_medica, matricola_figc, tipo_documento, numero_documento, rilasciato_da, peso, altezza, piede_preferito } = req.body;
    const { data, error } = await supabase.from('calciatore').update({ nome, cognome, data_nascita, telefono, email, data_visita_medica, matricola_figc, tipo_documento, numero_documento, rilasciato_da, peso, altezza, piede_preferito }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

app.get('/api/calciatori/:id/stats-current', async (req, res) => {
  try {
    const { data: rose } = await supabase.from('rosa').select('squadra_id').eq('calciatore_id', req.params.id);
    if (!rose || rose.length === 0) return res.json({ gol: 0, assist: 0, presenze: 0, partite: 0 });
    const sqIds = rose.map(r => r.squadra_id);
    const { data: partite } = await supabase.from('partita').select('id').in('squadra_id', sqIds).eq('stato', 'Terminata');
    if (!partite || partite.length === 0) return res.json({ gol: 0, assist: 0, presenze: 0, partite: 0 });
    const partitaIds = partite.map(p => p.id);
    const { data: eventi } = await supabase.from('evento_partita').select('tipo_evento_codice').eq('calciatore_principale_id', req.params.id).in('partita_id', partitaIds);
    const { data: convocazioni } = await supabase.from('convocazione').select('presente').eq('calciatore_id', req.params.id).in('partita_id', partitaIds);
    res.json({ gol: (eventi || []).filter(e => e.tipo_evento_codice === 'GOAL').length, assist: (eventi || []).filter(e => e.tipo_evento_codice === 'ASSIST').length, presenze: (convocazioni || []).filter(c => c.presente).length, partite: partite.length });
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

// ── DEMO INIT ──
app.get('/api/demo/init', async (req, res) => {
  try {
    const wsId = '00000000-0000-0000-0000-000000000001';
    const { data: stagioni } = await supabase.from('stagione').select('id').eq('workspace_id', wsId);
    if (!stagioni || stagioni.length === 0) {
      const { data: newSeason } = await supabase.from('stagione').insert({ workspace_id: wsId, nome: '2024/25', anno_inizio: 2024, anno_fine: 2025, attiva: true }).select().single();
      await supabase.from('squadra').insert([{ stagione_id: newSeason.id, nome: 'Green Academy', categoria: 'Primavera' }, { stagione_id: newSeason.id, nome: 'Green Academy', categoria: 'Allievi B' }]);
    }
    res.json({ success: true, demo: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
