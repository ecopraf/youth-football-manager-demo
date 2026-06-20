const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const SQUADRA_ID = '33333333-3333-3333-3333-333333333333';

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  const { error } = await supabase.from('workspace').select('count', { count: 'exact', head: true });
  if (error) return res.status(500).json({ status: 'error', message: error.message });
  res.json({ status: 'ok', database: 'connected', version: '2.4' });
});

app.get('/api/workspaces', async (req, res) => {
  const { data, error } = await supabase.from('workspace').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/workspaces/:wsId/stagioni', async (req, res) => {
  const { data, error } = await supabase.from('stagione').select('*').eq('workspace_id', req.params.wsId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/stagioni/:stagioneId/squadre', async (req, res) => {
  const { data, error } = await supabase.from('squadra').select('*').eq('stagione_id', req.params.stagioneId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CALCIATORI
app.get('/api/squadre/:squadraId/calciatori', async (req, res) => {
  try {
    const { ruolo } = req.query;
    let query = supabase.from('rosa')
      .select('calciatore:calciatore_id(*), numero_maglia, ruolo, stato')
      .eq('squadra_id', req.params.squadraId);
    if (ruolo) query = query.eq('ruolo', ruolo);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data.map(r => ({
      id: r.calciatore.id, nome: r.calciatore.nome, cognome: r.calciatore.cognome,
      dataNascita: r.calciatore.data_nascita, luogoNascita: r.calciatore.luogo_nascita,
      matricolaFigc: r.calciatore.matricola_figc, tipoDocumento: r.calciatore.tipo_documento,
      numeroDocumento: r.calciatore.numero_documento, rilasciatoDa: r.calciatore.rilasciato_da,
      numeroMaglia: r.numero_maglia, ruolo: r.ruolo, stato: r.stato
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/squadre/:squadraId/calciatori', async (req, res) => {
  try {
    const c = req.body;
    const { data: calciatore, error: err1 } = await supabase.from('calciatore').insert({
      workspace_id: '11111111-1111-1111-1111-111111111111', nome: c.nome, cognome: c.cognome,
      data_nascita: c.dataNascita, luogo_nascita: c.luogoNascita,
      matricola_figc: c.matricolaFigc, tipo_documento: c.tipoDocumento,
      numero_documento: c.numeroDocumento, rilasciato_da: c.rilasciatoDa
    }).select().single();
    if (err1) throw err1;
    await supabase.from('rosa').insert({
      squadra_id: req.params.squadraId, calciatore_id: calciatore.id,
      numero_maglia: c.numeroMaglia, ruolo: c.ruolo, stato: 'Attivo'
    });
    res.status(201).json(calciatore);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/calciatori/:id', async (req, res) => {
  try {
    const c = req.body;
    await supabase.from('calciatore').update({
      nome: c.nome, cognome: c.cognome, data_nascita: c.dataNascita,
      luogo_nascita: c.luogoNascita, matricola_figc: c.matricolaFigc,
      tipo_documento: c.tipoDocumento, numero_documento: c.numeroDocumento,
      rilasciato_da: c.rilasciatoDa
    }).eq('id', req.params.id);
    
    if (c.numeroMaglia || c.ruolo) {
      const update = {};
      if (c.numeroMaglia) update.numero_maglia = c.numeroMaglia;
      if (c.ruolo) update.ruolo = c.ruolo;
      await supabase.from('rosa').update(update).eq('calciatore_id', req.params.id).eq('squadra_id', SQUADRA_ID);
    }
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PARTITE
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
  await supabase.from('convocazione').delete().eq('partita_id', req.params.id);
  await supabase.from('formazione_partita').delete().eq('partita_id', req.params.id);
  const { error } = await supabase.from('partita').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// CONVOCAZIONI (con aggiornamento automatico formazione)
app.get('/api/partite/:partitaId/convocazioni', async (req, res) => {
  const { data, error } = await supabase.from('convocazione')
    .select('id, presente, calciatore:calciatore_id(id, nome, cognome)')
    .eq('partita_id', req.params.partitaId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(c => ({
    id: c.id, calciatoreId: c.calciatore.id,
    nome: c.calciatore.nome, cognome: c.calciatore.cognome, presente: c.presente
  })));
});

app.post('/api/partite/:partitaId/convocazioni', async (req, res) => {
  try {
    const { calciatoreId, presente } = req.body;
    
    await supabase.from('convocazione').upsert({
      partita_id: req.params.partitaId, calciatore_id: calciatoreId, presente
    });
    
    if (presente) {
      const { data: rosa } = await supabase.from('rosa')
        .select('numero_maglia').eq('calciatore_id', calciatoreId).eq('squadra_id', SQUADRA_ID).single();
      
      await supabase.from('formazione_partita').upsert({
        partita_id: req.params.partitaId, calciatore_id: calciatoreId,
        numero_maglia: rosa?.numero_maglia || 99, posizione: 'Panchina',
        capitano: false, vice_capitano: false
      });
    } else {
      await supabase.from('formazione_partita').delete()
        .eq('partita_id', req.params.partitaId).eq('calciatore_id', calciatoreId);
    }
    
    res.status(201).json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// FORMAZIONE
app.get('/api/partite/:partitaId/formazione', async (req, res) => {
  const { data, error } = await supabase.from('formazione_partita')
    .select('id, numero_maglia, posizione, capitano, vice_capitano, calciatore:calciatore_id(id, nome, cognome, data_nascita, matricola_figc, tipo_documento, numero_documento, rilasciato_da)')
    .eq('partita_id', req.params.partitaId).order('numero_maglia', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(f => ({
    id: f.id, numeroMaglia: f.numero_maglia, posizione: f.posizione,
    capitano: f.capitano, viceCapitano: f.vice_capitano,
    nome: f.calciatore.nome, cognome: f.calciatore.cognome,
    dataNascita: f.calciatore.data_nascita, matricolaFigc: f.calciatore.matricola_figc,
    tipoDocumento: f.calciatore.tipo_documento, numeroDocumento: f.calciatore.numero_documento,
    rilasciatoDa: f.calciatore.rilasciato_da
  })));
});

// DISTINTA
app.get('/api/partite/:partitaId/distinta', async (req, res) => {
  try {
    const { data: partita, error: err1 } = await supabase.from('partita')
      .select('*, squadra:squadra_id(nome, stagione:stagione_id(nome, workspace:workspace_id(nome)))')
      .eq('id', req.params.partitaId).single();
    if (err1 || !partita) return res.status(404).json({ error: 'Partita non trovata' });
    
    const { data: formazione } = await supabase.from('formazione_partita')
      .select('numero_maglia, posizione, capitano, vice_capitano, calciatore:calciatore_id(nome, cognome, data_nascita, matricola_figc, tipo_documento, numero_documento, rilasciato_da)')
      .eq('partita_id', req.params.partitaId).order('numero_maglia', { ascending: true });
    
    res.json({
      partita: {
        dataOra: partita.data_ora, avversario: partita.avversario,
        luogo: partita.luogo, competizione: partita.competizione
      },
      societa: partita.squadra?.stagione?.workspace?.nome || 'ASD Albalonga',
      formazione: (formazione || []).map(f => ({
        numeroMaglia: f.numero_maglia, cognome: f.calciatore.cognome, nome: f.calciatore.nome,
        dataNascita: f.calciatore.data_nascita, capitano: f.capitano, viceCapitano: f.vice_capitano,
        matricolaFigc: f.calciatore.matricola_figc, tipoDocumento: f.calciatore.tipo_documento,
        numeroDocumento: f.calciatore.numero_documento, rilasciatoDa: f.calciatore.rilasciato_da,
        posizione: f.posizione
      }))
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Statistiche
app.get('/api/squadre/:squadraId/statistiche', async (req, res) => {
  const { data: partite } = await supabase.from('partita').select('id').eq('squadra_id', req.params.squadraId);
  const { count } = await supabase.from('rosa').select('*', { count: 'exact', head: true }).eq('squadra_id', req.params.squadraId);
  res.json({ partiteGiocate: partite?.length || 0, calciatoriInRosa: count || 0 });
});

module.exports = app;
