const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERRORE: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono obbligatori');
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('workspace').select('count');
    if (error) throw error;
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/workspaces
app.get('/api/workspaces', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workspace')
      .select('*')
      .order('data_creazione', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workspaces/:workspaceId/stagioni
app.get('/api/workspaces/:workspaceId/stagioni', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stagione')
      .select('*')
      .eq('workspace_id', req.params.workspaceId)
      .order('data_inizio', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stagioni/:stagioneId/squadre
app.get('/api/stagioni/:stagioneId/squadre', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('squadra')
      .select('*')
      .eq('stagione_id', req.params.stagioneId);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/squadre/:squadraId/calciatori
app.get('/api/squadre/:squadraId/calciatori', async (req, res) => {
  try {
    const { ruolo, search } = req.query;
    
    let query = supabase
      .from('rosa')
      .select(`
        calciatore:calciatore_id (
          id, nome, cognome, data_nascita, foto_url
        ),
        numero_maglia,
        ruolo,
        stato
      `)
      .eq('squadra_id', req.params.squadraId);
    
    if (ruolo) query = query.eq('ruolo', ruolo);
    
    const { data, error } = await query;
    if (error) throw error;
    
    let result = data.map(r => ({
      id: r.calciatore.id,
      nome: r.calciatore.nome,
      cognome: r.calciatore.cognome,
      dataNascita: r.calciatore.data_nascita,
      fotoUrl: r.calciatore.foto_url,
      numeroMaglia: r.numero_maglia,
      ruolo: r.ruolo,
      stato: r.stato
    }));
    
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(c =>
        c.nome.toLowerCase().includes(s) ||
        c.cognome.toLowerCase().includes(s)
      );
    }
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/squadre/:squadraId/statistiche
app.get('/api/squadre/:squadraId/statistiche', async (req, res) => {
  try {
    const { data: partite, error: err1 } = await supabase
      .from('partita')
      .select('id')
      .eq('squadra_id', req.params.squadraId);
    if (err1) throw err1;

    const { count: totCalciatori, error: err2 } = await supabase
      .from('rosa')
      .select('*', { count: 'exact', head: true })
      .eq('squadra_id', req.params.squadraId);
    if (err2) throw err2;

    res.json({
      partiteGiocate: partite.length,
      calciatoriInRosa: totCalciatori
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/squadre/:squadraId/partite
app.get('/api/squadre/:squadraId/partite', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('partita')
      .select('*')
      .eq('squadra_id', req.params.squadraId)
      .order('data_ora', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/squadre/:squadraId/partite
app.post('/api/squadre/:squadraId/partite', async (req, res) => {
  try {
    const { dataOra, avversario, luogo, competizione, note } = req.body;
    const { data, error } = await supabase
      .from('partita')
      .insert({
        squadra_id: req.params.squadraId,
        data_ora: dataOra,
        avversario,
        luogo,
        competizione,
        note
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = app;