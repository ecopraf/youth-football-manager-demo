const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => res.json({ status: 'ok', version: '2.7' }));

app.get('/api/workspaces', async (req, res) => {
  const { data } = await supabase.from('workspace').select('*');
  res.json(data || []);
});

app.get('/api/workspaces/:wsId/stagioni', async (req, res) => {
  const { data } = await supabase.from('stagione').select('*').eq('workspace_id', req.params.wsId);
  res.json(data || []);
});

// ── SQUADRE ──
app.get('/api/stagioni/:stagioneId/squadre', async (req, res) => {
  const { data } = await supabase.from('squadra').select('*').eq('stagione_id', req.params.stagioneId).order('nome');
  res.json(data || []);
});

app.post('/api/stagioni/:stagioneId/squadre', async (req, res) => {
  const b = req.body;
  const { data } = await supabase.from('squadra').insert({
    stagione_id: req.params.stagioneId, nome: b.nome, categoria: b.categoria,
    allenatore: b.allenatore, dirigente: b.dirigente,
    preparatore_atletico: b.preparatore_atletico, allenatore_portieri: b.allenatore_portieri
  }).select().single();
  res.status(201).json(data);
});

app.put('/api/squadre/:id', async (req, res) => {
  const b = req.body;
  await supabase.from('squadra').update({
    nome: b.nome, categoria: b.categoria, allenatore: b.allenatore, dirigente: b.dirigente,
    preparatore_atletico: b.preparatore_atletico, allenatore_portieri: b.allenatore_portieri
  }).eq('id', req.params.id);
  res.json({ success: true });
});

app.delete('/api/squadre/:id', async (req, res) => {
  try {
    const sid = req.params.id;
    const { data: partite } = await supabase.from('partita').select('id').eq('squadra_id', sid);
    for (const p of (partite||[])) {
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
  } catch(err) { res.status(400).json({ error: err.message }); }
});

// ── CALCIATORI ──
app.get('/api/squadre/:squadraId/calciatori', async (req, res) => {
  const { ruolo } = req.query;
  let q = supabase.from('rosa').select('calciatore:calciatore_id(*), numero_maglia, ruolo, stato').eq('squadra_id', req.params.squadraId);
  if(ruolo) q = q.eq('ruolo', ruolo);
  const { data } = await q;
  res.json((data||[]).map(r => ({
    id: r.calciatore.id, nome: r.calciatore.nome, cognome: r.calciatore.cognome,
    dataNascita: r.calciatore.data_nascita, luogoNascita: r.calciatore.luogo_nascita,
    matricolaFigc: r.calciatore.matricola_figc, tipoDocumento: r.calciatore.tipo_documento,
    numeroDocumento: r.calciatore.numero_documento, rilasciatoDa: r.calciatore.rilasciato_da,
    numeroMaglia: r.numero_maglia, ruolo: r.ruolo, stato: r.stato
  })));
});

app.post('/api/squadre/:squadraId/calciatori', async (req, res) => {
  const c = req.body;
  const { data: cal } = await supabase.from('calciatore').insert({
    workspace_id: '11111111-1111-1111-1111-111111111111', nome: c.nome, cognome: c.cognome,
    data_nascita: c.dataNascita, luogo_nascita: c.luogoNascita, matricola_figc: c.matricolaFigc,
    tipo_documento: c.tipoDocumento, numero_documento: c.numeroDocumento, rilasciato_da: c.rilasciatoDa
  }).select().single();
  await supabase.from('rosa').insert({ squadra_id: req.params.squadraId, calciatore_id: cal.id, numero_maglia: c.numeroMaglia, ruolo: c.ruolo, stato: 'Attivo' });
  res.status(201).json(cal);
});

app.put('/api/calciatori/:id', async (req, res) => {
  const c = req.body;
  await supabase.from('calciatore').update({
    nome: c.nome, cognome: c.cognome, data_nascita: c.dataNascita, luogo_nascita: c.luogoNascita,
    matricola_figc: c.matricolaFigc, tipo_documento: c.tipoDocumento, numero_documento: c.numeroDocumento, rilasciato_da: c.rilasciatoDa
  }).eq('id', req.params.id);
  if(c.numeroMaglia||c.ruolo) {
    const u = {};
    if(c.numeroMaglia) u.numero_maglia = c.numeroMaglia;
    if(c.ruolo) u.ruolo = c.ruolo;
    await supabase.from('rosa').update(u).eq('calciatore_id', req.params.id);
  }
  res.json({ success: true });
});

// ── PARTITE ──
app.get('/api/squadre/:squadraId/partite', async (req, res) => {
  const { data } = await supabase.from('partita').select('*').eq('squadra_id', req.params.squadraId).order('data_ora');
  res.json(data || []);
});

app.post('/api/squadre/:squadraId/partite', async (req, res) => {
  const p = req.body;
  const { data } = await supabase.from('partita').insert({ squadra_id: req.params.squadraId, data_ora: p.dataOra, avversario: p.avversario, luogo: p.luogo, competizione: p.competizione, note: p.note }).select().single();
  res.status(201).json(data);
});

app.put('/api/partite/:id', async (req, res) => {
  const p = req.body;
  await supabase.from('partita').update({ data_ora: p.dataOra, avversario: p.avversario, luogo: p.luogo, competizione: p.competizione, note: p.note }).eq('id', req.params.id);
  res.json({ success: true });
});

app.delete('/api/partite/:id', async (req, res) => {
  await supabase.from('evento_partita').delete().eq('partita_id', req.params.id);
  await supabase.from('formazione_partita').delete().eq('partita_id', req.params.id);
  await supabase.from('convocazione').delete().eq('partita_id', req.params.id);
  await supabase.from('partita').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// ── STATISTICHE TOP PLAYER ──
app.get('/api/squadre/:squadraId/top-players', async (req, res) => {
  try {
    const { data: partite } = await supabase.from('partita').select('id').eq('squadra_id', req.params.squadraId);
    const ids = (partite||[]).map(p => p.id);
    if(ids.length===0) return res.json({ marcatori:[], assistmen:[], presenze:[], ammoniti:[] });
    
    const { data: eventi } = await supabase.from('evento_partita')
      .select('tipo_evento_codice, calciatore_principale_id, calciatore_secondario_id')
      .in('partita_id', ids);
    
    const stats = {};
    (eventi||[]).forEach(e => {
      if(!stats[e.calciatore_principale_id]) stats[e.calciatore_principale_id] = { gol:0, assist:0, presenze:0, ammonizioni:0 };
      stats[e.calciatore_principale_id].presenze++;
      if(e.tipo_evento_codice==='GOAL') stats[e.calciatore_principale_id].gol++;
      if(e.tipo_evento_codice==='YELLOW') stats[e.calciatore_principale_id].ammonizioni++;
      if(e.tipo_evento_codice==='GOAL' && e.calciatore_secondario_id) {
        if(!stats[e.calciatore_secondario_id]) stats[e.calciatore_secondario_id] = { gol:0, assist:0, presenze:0, ammonizioni:0 };
        stats[e.calciatore_secondario_id].assist++;
      }
    });
    
    // Arricchisci con nomi
    const { data: rosa } = await supabase.from('rosa').select('calciatore:calciatore_id(id, nome, cognome)').eq('squadra_id', req.params.squadraId);
    const nomi = {};
    (rosa||[]).forEach(r => { nomi[r.calciatore.id] = `${r.calciatore.nome} ${r.calciatore.cognome}`; });
    
    const result = Object.entries(stats).map(([id, s]) => ({ id, nome: nomi[id]||id, ...s }));
    
    res.json({
      marcatori: result.sort((a,b) => b.gol-a.gol).slice(0,3),
      assistmen: result.sort((a,b) => b.assist-a.assist).slice(0,3),
      presenze: result.sort((a,b) => b.presenze-a.presenze).slice(0,3),
      ammoniti: result.filter(x => x.ammonizioni>0).sort((a,b) => b.ammonizioni-a.ammonizioni).slice(0,3)
    });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// ── CONVOCAZIONI ──
app.get('/api/partite/:partitaId/convocazioni', async (req, res) => {
  const { data } = await supabase.from('convocazione').select('id, presente, calciatore:calciatore_id(id, nome, cognome)').eq('partita_id', req.params.partitaId);
  res.json((data||[]).map(c => ({ id: c.id, calciatoreId: c.calciatore.id, nome: c.calciatore.nome, cognome: c.calciatore.cognome, presente: c.presente })));
});

app.post('/api/partite/:partitaId/convocazioni', async (req, res) => {
  const { calciatoreId, presente } = req.body;
  const { data: partita } = await supabase.from('partita').select('squadra_id').eq('id', req.params.partitaId).single();
  await supabase.from('convocazione').upsert({ partita_id: req.params.partitaId, calciatore_id: calciatoreId, presente });
  if(presente) {
    const { data: rosa } = await supabase.from('rosa').select('numero_maglia').eq('calciatore_id', calciatoreId).eq('squadra_id', partita.squadra_id).single();
    await supabase.from('formazione_partita').upsert({ partita_id: req.params.partitaId, calciatore_id: calciatoreId, numero_maglia: rosa?.numero_maglia||99, posizione:'Panchina', capitano:false, vice_capitano:false });
  } else {
    await supabase.from('formazione_partita').delete().eq('partita_id', req.params.partitaId).eq('calciatore_id', calciatoreId);
  }
  res.status(201).json({ success:true });
});

// ── DISTINTA ──
app.get('/api/partite/:partitaId/distinta', async (req, res) => {
  const { data: partita } = await supabase.from('partita').select('*, squadra:squadra_id(nome, stagione:stagione_id(nome, workspace:workspace_id(nome)))').eq('id', req.params.partitaId).single();
  if(!partita) return res.status(404).json({ error:'Partita non trovata' });
  const { data: formazione } = await supabase.from('formazione_partita').select('numero_maglia, posizione, capitano, vice_capitano, calciatore:calciatore_id(nome, cognome, data_nascita, matricola_figc, tipo_documento, numero_documento, rilasciato_da)').eq('partita_id', req.params.partitaId).order('numero_maglia');
  res.json({
    partita: { dataOra: partita.data_ora, avversario: partita.avversario, luogo: partita.luogo, competizione: partita.competizione },
    societa: partita.squadra?.stagione?.workspace?.nome || 'ASD Albalonga',
    formazione: (formazione||[]).map(f => ({
      numeroMaglia: f.numero_maglia, cognome: f.calciatore.cognome, nome: f.calciatore.nome,
      dataNascita: f.calciatore.data_nascita, capitano: f.capitano, viceCapitano: f.vice_capitano,
      matricolaFigc: f.calciatore.matricola_figc, tipoDocumento: f.calciatore.tipo_documento,
      numeroDocumento: f.calciatore.numero_documento, rilasciatoDa: f.calciatore.rilasciato_da, posizione: f.posizione
    }))
  });
});

// ── ALLENAMENTI CONFIG ──
app.get('/api/squadre/:squadraId/allenamenti/config', async (req, res) => {
  const { data } = await supabase.from('configurazione_allenamento').select('*').eq('squadra_id', req.params.squadraId).order('giorno_settimana');
  res.json(data||[]);
});

app.post('/api/squadre/:squadraId/allenamenti/config', async (req, res) => {
  const { giorno_settimana, ora_inizio, ora_fine, luogo } = req.body;
  const { data } = await supabase.from('configurazione_allenamento').insert({ squadra_id: req.params.squadraId, giorno_settimana, ora_inizio, ora_fine, luogo }).select().single();
  res.status(201).json(data);
});

app.delete('/api/allenamenti/config/:id', async (req, res) => {
  await supabase.from('configurazione_allenamento').delete().eq('id', req.params.id);
  res.json({ success:true });
});

// ── PRESENZE ──
app.get('/api/squadre/:squadraId/allenamenti/presenze', async (req, res) => {
  const { data, from, to } = req.query;
  let q = supabase.from('presenza_allenamento').select('id, data, presente, note, calciatore:calciatore_id(id, nome, cognome)').eq('squadra_id', req.params.squadraId).order('data', { ascending: false });
  if(from) q = q.gte('data', from);
  if(to) q = q.lte('data', to);
  const { data: presenze } = await q;
  res.json((presenze||[]).map(p => ({ id: p.id, data: p.data, presente: p.presente, note: p.note, calciatoreId: p.calciatore.id, nome: p.calciatore.nome, cognome: p.calciatore.cognome })));
});

app.post('/api/squadre/:squadraId/allenamenti/presenze', async (req, res) => {
  const { calciatoreId, data, presente, note } = req.body;
  const { data: result } = await supabase.from('presenza_allenamento').upsert({ squadra_id: req.params.squadraId, calciatore_id: calciatoreId, data, presente, note }).select().single();
  res.status(201).json(result);
});

// ── SUMMARY PRESENZE ──
app.get('/api/squadre/:squadraId/allenamenti/summary', async (req, res) => {
  try {
    const { data: presenze } = await supabase.from('presenza_allenamento').select('calciatore_id, presente, data').eq('squadra_id', req.params.squadraId);
    const { data: rosa } = await supabase.from('rosa').select('calciatore:calciatore_id(id, nome, cognome)').eq('squadra_id', req.params.squadraId);
    
    const oggi = new Date(); const lunedi = new Date(oggi); lunedi.setDate(oggi.getDate()-((oggi.getDay()+6)%7));
    const lunediStr = lunedi.toISOString().split('T')[0];
    
    const summary = {};
    (rosa||[]).forEach(r => { summary[r.calciatore.id] = { nome:r.calciatore.nome, cognome:r.calciatore.cognome, totali:0, presenti:0, assenti:0, settimanali:0, presentiSett:0, assentiSett:0 }; });
    (presenze||[]).forEach(p => {
      if(summary[p.calciatore_id]) {
        summary[p.calciatore_id].totali++;
        if(p.presente) summary[p.calciatore_id].presenti++; else summary[p.calciatore_id].assenti++;
        if(p.data >= lunediStr) { summary[p.calciatore_id].settimanali++; if(p.presente) summary[p.calciatore_id].presentiSett++; else summary[p.calciatore_id].assentiSett++; }
      }
    });
    res.json(summary);
  } catch(err) { res.status(500).json({ error:err.message }); }
});

// Statistiche
app.get('/api/squadre/:squadraId/statistiche', async (req, res) => {
  const { data: partite } = await supabase.from('partita').select('id').eq('squadra_id', req.params.squadraId);
  const { count } = await supabase.from('rosa').select('*', { count:'exact', head:true }).eq('squadra_id', req.params.squadraId);
  res.json({ partiteGiocate: (partite||[]).length, calciatoriInRosa: count||0 });
});

module.exports = app;
