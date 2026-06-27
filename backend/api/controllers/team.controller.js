const supabase = require('../db/supabase');

const teamController = {
  // GET /api/squadre - Lista tutte le squadre
  getAll: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('squadra')
        .select('*')
        .order('nome');
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json(data || []);
    } catch (err) {
      console.error('Get teams error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/squadre/:id - Dettaglio squadra
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('squadra')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        return res.status(404).json({ error: 'Squadra non trovata' });
      }
      
      res.json(data);
    } catch (err) {
      console.error('Get team error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // PUT /api/squadre/:id - Aggiorna squadra
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, categoria, allenatore, dirigente, dirigente2, preparatore_atletico, allenatore_portieri, matricola_dirigente, tessera_lnd_dirigente, tessera_figc_allenatore } = req.body;
      
      const { data, error } = await supabase
        .from('squadra')
        .update({ 
          nome, 
          categoria, 
          allenatore, 
          dirigente, 
          dirigente2, 
          preparatore_atletico, 
          allenatore_portieri,
          matricola_dirigente,
          tessera_lnd_dirigente,
          tessera_figc_allenatore
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ success: true, data });
    } catch (err) {
      console.error('Update team error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // DELETE /api/squadre/:id - Elimina squadra
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Elimina prima tutti i dati dipendenti
      const { data: partite } = await supabase.from('partita').select('id').eq('squadra_id', id);
      for (const p of (partite || [])) {
        await supabase.from('formazione_partita').delete().eq('partita_id', p.id);
        await supabase.from('convocazione').delete().eq('partita_id', p.id);
        await supabase.from('evento_partita').delete().eq('partita_id', p.id);
      }
      await supabase.from('partita').delete().eq('squadra_id', id);
      
      await supabase.from('presenza_allenamento').delete().eq('squadra_id', id);
      await supabase.from('configurazione_allenamento').delete().eq('squadra_id', id);
      await supabase.from('rosa').delete().eq('squadra_id', id);
      await supabase.from('squadra').delete().eq('id', id);
      
      res.json({ success: true });
    } catch (err) {
      console.error('Delete team error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/squadre/:id/calciatori - Lista giocatori rosa
  getPlayers: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('rosa')
        .select('calciatore:calciatore_id(*), numero_maglia, ruolo, stato')
        .eq('squadra_id', id);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      const players = (data || []).map(r => ({
        id: r.calciatore.id,
        nome: r.calciatore.nome,
        cognome: r.calciatore.cognome,
        data_nascita: r.calciatore.data_nascita,
        telefono: r.calciatore.telefono,
        data_visita_medica: r.calciatore.data_visita_medica,
        matricola_figc: r.calciatore.matricola_figc,
        tipo_documento: r.calciatore.tipo_documento,
        numero_documento: r.calciatore.numero_documento,
        rilasciato_da: r.calciatore.rilasciato_da,
        numero_maglia: r.numero_maglia,
        ruolo: r.ruolo,
        stato: r.stato
      }));
      
      res.json(players);
    } catch (err) {
      console.error('Get players error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // POST /api/squadre/:id/calciatori - Aggiungi giocatore
  addPlayer: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, cognome, numeroMaglia, ruolo, dataVisitaMedica, telefono } = req.body;
      
      // Crea calciatore
      const { data: cal, error: err1 } = await supabase
        .from('calciatore')
        .insert({
          workspace_id: '22222222-2222-2222-2222-222222222222',
          nome,
          cognome,
          data_nascita: dataVisitaMedica,
          telefono,
          data_visita_medica: dataVisitaMedica
        })
        .select()
        .single();
      
      if (err1) {
        return res.status(400).json({ error: err1.message });
      }
      
      // Aggiungi alla rosa
      await supabase.from('rosa').insert({
        squadra_id: id,
        calciatore_id: cal.id,
        numero_maglia: numeroMaglia,
        ruolo,
        stato: 'Attivo'
      });
      
      res.status(201).json(cal);
    } catch (err) {
      console.error('Add player error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/squadre/:id/partite - Lista partite
  getMatches: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('partita')
        .select('*')
        .eq('squadra_id', id)
        .order('data_ora', { ascending: false });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json(data || []);
    } catch (err) {
      console.error('Get matches error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/squadre/:id/partite-future - Prossime partite
  getUpcomingMatches: async (req, res) => {
    try {
      const { id } = req.params;
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('partita')
        .select('*')
        .eq('squadra_id', id)
        .gte('data_ora', now)
        .order('data_ora', { ascending: true })
        .limit(5);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json(data || []);
    } catch (err) {
      console.error('Get upcoming matches error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // POST /api/squadre/:id/partite - Crea partita
  createMatch: async (req, res) => {
    try {
      const { id } = req.params;
      const { avversario, luogo, competizione, giornata, dataOra } = req.body;
      
      const { data, error } = await supabase
        .from('partita')
        .insert({
          squadra_id: id,
          data_ora: dataOra,
          avversario,
          luogo,
          competizione,
          giornata
        })
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(201).json(data);
    } catch (err) {
      console.error('Create match error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/squadre/:id/scadenze-mediche - Scadenze certificati
  getMedicalExpirations: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('rosa')
        .select('calciatore:calciatore_id(id, nome, cognome, data_visita_medica)')
        .eq('squadra_id', id);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      const oggi = new Date();
      const scadenze = (data || [])
        .filter(r => r.calciatore.data_visita_medica)
        .map(r => {
          const scadenza = new Date(r.calciatore.data_visita_medica);
          scadenza.setFullYear(scadenza.getFullYear() + 1);
          return {
            id: r.calciatore.id,
            nome: r.calciatore.nome,
            cognome: r.calciatore.cognome,
            scadenza: scadenza.toISOString().split('T')[0],
            giorniRimanenti: Math.ceil((scadenza - oggi) / (1000 * 60 * 60 * 24))
          };
        })
        .filter(s => s.giorniRimanenti <= 30)
        .sort((a, b) => a.giorniRimanenti - b.giorniRimanenti);
      
      res.json(scadenze);
    } catch (err) {
      console.error('Get medical expirations error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/squadre/:id/statistiche-complete - Statistiche complete
  getStatistics: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data: partite } = await supabase
        .from('partita')
        .select('*')
        .eq('squadra_id', id);
      
      const giocate = (partite || []).filter(p => p.stato === 'Terminata');
      const vinte = giocate.filter(p => {
        if (p.luogo === 'Casa') return p.gol_casa > p.gol_ospite;
        return p.gol_ospite > p.gol_casa;
      });
      const pareggiate = giocate.filter(p => p.gol_casa === p.gol_ospite);
      const perse = giocate.filter(p => {
        if (p.luogo === 'Casa') return p.gol_casa < p.gol_ospite;
        return p.gol_ospite < p.gol_casa;
      });
      
      const golFatti = giocate.reduce((sum, p) => sum + (p.luogo === 'Casa' ? p.gol_casa : p.gol_ospite), 0);
      const golSubiti = giocate.reduce((sum, p) => sum + (p.luogo === 'Casa' ? p.gol_ospite : p.gol_casa), 0);
      
      res.json({
        partiteTotali: partite?.length || 0,
        partiteGiocate: giocate.length,
        vittorie: vinte.length,
        pareggi: pareggiate.length,
        sconfitte: perse.length,
        golFatti,
        golSubiti,
        differenzaReti: golFatti - golSubiti,
        punti: vinte.length * 3 + pareggiate.length
      });
    } catch (err) {
      console.error('Get statistics error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/squadre/:id/top-players - Top marcatori
  getTopPlayers: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data: partite } = await supabase
        .from('partita')
        .select('id')
        .eq('squadra_id', id);
      
      const ids = (partite || []).map(p => p.id);
      if (ids.length === 0) {
        return res.json({ marcatori: [], assistmen: [], presenze: [] });
      }
      
      const { data: eventi } = await supabase
        .from('evento_partita')
        .select('tipo_evento_codice, calciatore_principale_id, calciatore_secondario_id, minuto')
        .in('partita_id', ids);
      
      const stats = {};
      (eventi || []).forEach(e => {
        if (!stats[e.calciatore_principale_id]) {
          stats[e.calciatore_principale_id] = { gol: 0, assist: 0, presenze: 0 };
        }
        stats[e.calciatore_principale_id].presenze++;
        if (e.tipo_evento_codice === 'GOAL') {
          stats[e.calciatore_principale_id].gol++;
        }
        if (e.tipo_evento_codice === 'GOAL' && e.calciatore_secondario_id) {
          if (!stats[e.calciatore_secondario_id]) {
            stats[e.calciatore_secondario_id] = { gol: 0, assist: 0, presenze: 0 };
          }
          stats[e.calciatore_secondario_id].assist++;
        }
      });
      
      const { data: rosa } = await supabase
        .from('rosa')
        .select('calciatore:calciatore_id(id, nome, cognome)')
        .eq('squadra_id', id);
      
      const nomi = {};
      (rosa || []).forEach(r => {
        nomi[r.calciatore.id] = r.calciatore.nome + ' ' + r.calciatore.cognome;
      });
      
      const result = Object.entries(stats).map(([id, s]) => ({ id, nome: nomi[id] || id, ...s }));
      
      res.json({
        marcatori: result.filter(x => x.gol > 0).sort((a, b) => b.gol - a.gol).slice(0, 5),
        assistmen: result.filter(x => x.assist > 0).sort((a, b) => b.assist - a.assist).slice(0, 5),
        presenze: result.filter(x => x.presenze > 0).sort((a, b) => b.presenze - a.presenze).slice(0, 5)
      });
    } catch (err) {
      console.error('Get top players error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  }
};

module.exports = teamController;
