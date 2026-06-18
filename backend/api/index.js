const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// ═══════════════ HEALTH ═══════════════
app.get('/api/health', async (req, res) => {
  const { data, error } = await supabase.from('workspace').select('count', { count: 'exact', head: true });
  if (error) return res.status(500).json({ status: 'error', message: error.message });
  res.json({ status: 'ok', database: 'connected' });
});

// ═══════════════ WORKSPACE ═══════════════
app.get('/api/workspaces', async (req, res) => {
  const { data, error } = await supabase.from('workspace').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ═══════════════ STAGIONI ═══════════════
app.get('/api/workspaces/:wsId/stagioni', async (req, res) => {
  const { data, error } = await supabase.from('stagione').select('*').eq('workspace_id', req.params.wsId).order('data_inizio', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/workspaces/:wsId/stagioni', async (req, res) => {
  const { nome, dataInizio, dataFine } = req.body;
  const { data, error } = await supabase.from('stagione').insert({ workspace_id: req.params.wsId, nome, data_inizio: dataInizio, data_fine: dataFine }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// ═══════════════ SQUADRE ═══════════════
app.get('/api/stagioni/:stagioneId/squadre', async (req, res) => {
  const { data, error } = await supabase.from('squadra').select('*').eq('stagione_id', req.params.stagioneId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/stagioni/:stagioneId/squadre', async (req, res) => {
  const { nome, categoria } = req.body;
  const { data, error } = await supabase.from('squadra').insert({ stagione_id: req.params.stagioneId, nome, categoria }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// ═══════════════ CALCIATORI ═══════════════
app.get('/api/squadre/:squadraId/calciatori', async (req, res) => {
  try {
    const { ruolo, search } = req.query;
    let query = supabase.from('rosa')
      .select('calciatore:calciatore_id(id, nome, cognome, data_nascita, luogo_nascita, matricola_figc, tipo_documento, numero_documento, rilasciato_da), numero_maglia, ruolo, stato')
      .eq('squadra_id', req.params.squadraId);
    if (ruolo) query = query.eq('ruolo', ruolo);
    const { data, error } = await query;
    if (error) throw error;
    let result = data.map(r => ({
      id: r.calciatore.id, nome: r.calciatore.nome, cognome: r.calciatore.cognome,
      dataNascita: r.calciatore.data_nascita, luogoNascita: r.calciatore.luogo_nascita,
      matricolaFigc: r.calciatore.matricola_figc, tipoDocumento: r.calciatore.tipo_documento,
      numeroDocumento: r.calciatore.numero_documento, rilasciatoDa: r.calciatore.rilasciato_da,
      numeroMaglia: r.numero_maglia, ruolo: r.ruolo, stato: r.stato
    }));
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(c => (c.nome + ' ' + c.cognome).toLowerCase().includes(s));
    }
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/squadre/:squadraId/calciatori', async (req, res) => {
  try {
    const { nome, cognome, dataNascita, luogoNascita, numeroMaglia, ruolo, matricolaFigc, tipoDocumento, numeroDocumento, rilasciatoDa } = req.body;
    const { data: calciatore, error: err1 } = await supabase.from('calciatore').insert({
      workspace_id: '11111111-1111-1111-1111-111111111111', nome, cognome, data_nascita: dataNascita,
      luogo_nascita: luogoNascita, matricola_figc: matricolaFigc, tipo_documento: tipoDocumento,
      numero_documento: numeroDocumento, rilasciato_da: rilasciatoDa
    }).select().single();
    if (err1) throw err1;
    const { error: err2 } = await supabase.from('rosa').insert({
      squadra_id: req.params.squadraId, calciatore_id: calciatore.id, numero_maglia: numeroMaglia, ruolo, stato: 'Attivo'
    });
    if (err2) throw err2;
    res.status(201).json({ ...calciatore, numeroMaglia, ruolo });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/calciatori/:id', async (req, res) => {
  try {
    const { nome, cognome, dataNascita, luogoNascita, matricolaFigc, tipoDocumento, numeroDocumento, rilasciatoDa } = req.body;
    const { data, error } = await supabase.from('calciatore').update({
      nome, cognome, data_nascita: dataNascita, luogo_nascita: luogoNascita,
      matricola_figc: matricolaFigc, tipo_documento: tipoDocumento, numero_documento: numeroDocumento, rilasciato_da: rilasciatoDa
    }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ═══════════════ PARTITE ═══════════════
app.get('/api/squadre/:squadraId/partite', async (req, res) => {
  const { data, error } = await supabase.from('partita').select('*').eq('squadra_id', req.params.squadraId).order('data_ora', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/squadre/:squadraId/partite', async (req, res) => {
  const { dataOra, avversario, luogo, competizione, note } = req.body;
  const { data, error } = await supabase.from('partita').insert({
    squadra_id: req.params.squadraId, data_ora: dataOra, avversario, luogo, competizione, note
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/partite/:id', async (req, res) => {
  const { dataOra, avversario, luogo, competizione, note } = req.body;
  const { data, error } = await supabase.from('partita').update({
    data_ora: dataOra, avversario, luogo, competizione, note
  }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.delete('/api/partite/:id', async (req, res) => {
  const { error } = await supabase.from('partita').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ═══════════════ CONVOCAZIONI ═══════════════
app.get('/api/partite/:partitaId/convocazioni', async (req, res) => {
  try {
    const { data, error } = await supabase.from('convocazione')
      .select('id, presente, note, calciatore:calciatore_id(id, nome, cognome)')
      .eq('partita_id', req.params.partitaId);
    if (error) throw error;
    res.json(data.map(c => ({
      id: c.id, calciatoreId: c.calciatore.id, nome: c.calciatore.nome,
      cognome: c.calciatore.cognome, presente: c.presente, note: c.note
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/partite/:partitaId/convocazioni', async (req, res) => {
  try {
    const { calciatoreId, presente, note } = req.body;
    const { data, error } = await supabase.from('convocazione')
      .upsert({ partita_id: req.params.partitaId, calciatore_id: calciatoreId, presente, note })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/partite/:partitaId/convocazioni/:calciatoreId', async (req, res) => {
  const { error } = await supabase.from('convocazione').delete()
    .eq('partita_id', req.params.partitaId).eq('calciatore_id', req.params.calciatoreId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ═══════════════ FORMAZIONE ═══════════════
app.get('/api/partite/:partitaId/formazione', async (req, res) => {
  try {
    const { data, error } = await supabase.from('formazione_partita')
      .select('id, numero_maglia, posizione, capitano, vice_capitano, calciatore:calciatore_id(id, nome, cognome, data_nascita, matricola_figc, tipo_documento, numero_documento, rilasciato_da)')
      .eq('partita_id', req.params.partitaId)
      .order('numero_maglia', { ascending: true });
    if (error) throw error;
    res.json(data.map(f => ({
      id: f.id, numeroMaglia: f.numero_maglia, posizione: f.posizione,
      capitano: f.capitano, viceCapitano: f.vice_capitano,
      nome: f.calciatore.nome, cognome: f.calciatore.cognome,
      dataNascita: f.calciatore.data_nascita, matricolaFigc: f.calciatore.matricola_figc,
      tipoDocumento: f.calciatore.tipo_documento, numeroDocumento: f.calciatore.numero_documento,
      rilasciatoDa: f.calciatore.rilasciato_da
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/partite/:partitaId/formazione', async (req, res) => {
  try {
    const { calciatoreId, numeroMaglia, posizione, capitano, viceCapitano } = req.body;
    const { data, error } = await supabase.from('formazione_partita')
      .upsert({ partita_id: req.params.partitaId, calciatore_id: calciatoreId, numero_maglia: numeroMaglia, posizione, capitano, vice_capitano: viceCapitano })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ═══════════════ STATISTICHE ═══════════════
app.get('/api/squadre/:squadraId/statistiche', async (req, res) => {
  try {
    const { data: partite } = await supabase.from('partita').select('id').eq('squadra_id', req.params.squadraId);
    const { count } = await supabase.from('rosa').select('*', { count: 'exact', head: true }).eq('squadra_id', req.params.squadraId);
    res.json({ partiteGiocate: partite?.length || 0, calciatoriInRosa: count || 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════ DISTINTA GARA (PDF) ═══════════════
app.get('/api/partite/:partitaId/distinta', async (req, res) => {
  try {
    // Recupera dati partita
    const { data: partita, error: err1 } = await supabase.from('partita').select('*').eq('id', req.params.partitaId).single();
    if (err1) throw err1;

    // Recupera squadra e stagione
    const { data: squadra, error: err2 } = await supabase.from('squadra').select('*, stagione:stagione_id(nome)').eq('id', partita.squadra_id).single();
    if (err2) throw err2;

    // Recupera workspace
    const { data: workspace, error: err3 } = await supabase.from('workspace').select('nome').eq('id', squadra.stagione_id ? (await supabase.from('stagione').select('workspace_id').eq('id', squadra.stagione_id).single()).data?.workspace_id : null).single();
    if (err3) throw err3;

    // Recupera formazione
    const { data: formazione } = await supabase.from('formazione_partita')
      .select('numero_maglia, posizione, capitano, vice_capitano, calciatore:calciatore_id(nome, cognome, data_nascita, matricola_figc, tipo_documento, numero_documento, rilasciato_da)')
      .eq('partita_id', req.params.partitaId)
      .order('numero_maglia', { ascending: true });

    res.json({
      partita: {
        dataOra: partita.data_ora,
        avversario: partita.avversario,
        luogo: partita.luogo,
        competizione: partita.competizione
      },
      squadra: squadra.nome,
      stagione: squadra.stagione?.nome || '',
      societa: workspace?.nome || 'ASD Albalonga',
      formazione: (formazione || []).map(f => ({
        numeroMaglia: f.numero_maglia,
        cognome: f.calciatore.cognome,
        nome: f.calciatore.nome,
        dataNascita: f.calciatore.data_nascita,
        capitano: f.capitano,
        viceCapitano: f.vice_capitano,
        matricolaFigc: f.calciatore.matricola_figc,
        tipoDocumento: f.calciatore.tipo_documento,
        numeroDocumento: f.calciatore.numero_documento,
        rilasciatoDa: f.calciatore.rilasciato_da
      }))
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = app;
