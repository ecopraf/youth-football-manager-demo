const supabase = require('../db/supabase');

const playerController = {
  // GET /api/calciatori/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('calciatore')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        return res.status(404).json({ error: 'Giocatore non trovato' });
      }
      
      res.json(data);
    } catch (err) {
      console.error('Get player error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // PUT /api/calciatori/:id
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, cognome, data_nascita, telefono, email, data_visita_medica, matricola_figc, tipo_documento, numero_documento, rilasciato_da, peso, altezza, piede_preferito } = req.body;
      
      const { data, error } = await supabase
        .from('calciatore')
        .update({ 
          nome, 
          cognome, 
          data_nascita, 
          telefono, 
          email, 
          data_visita_medica, 
          matricola_figc, 
          tipo_documento, 
          numero_documento, 
          rilasciato_da,
          peso,
          altezza,
          piede_preferito
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json(data);
    } catch (err) {
      console.error('Update player error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/calciatori/:id/stats-current - Statistiche attuali
  getCurrentStats: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Ottieni tutte le squadre del giocatore
      const { data: rose } = await supabase
        .from('rosa')
        .select('squadra_id, ruolo')
        .eq('calciatore_id', id);
      
      if (!rose || rose.length === 0) {
        return res.json({ gol: 0, assist: 0, presenze: 0, partite: 0 });
      }
      
      const sqIds = rose.map(r => r.squadra_id);
      const { data: partite } = await supabase
        .from('partita')
        .select('id')
        .in('squadra_id', sqIds)
        .eq('stato', 'Terminata');
      
      if (!partite || partite.length === 0) {
        return res.json({ gol: 0, assist: 0, presenze: 0, partite: 0 });
      }
      
      const partitaIds = partite.map(p => p.id);
      
      const { data: eventi } = await supabase
        .from('evento_partita')
        .select('tipo_evento_codice')
        .eq('calciatore_principale_id', id)
        .in('partita_id', partitaIds);
      
      const { data: convocazioni } = await supabase
        .from('convocazione')
        .select('presente')
        .eq('calciatore_id', id)
        .in('partita_id', partitaIds);
      
      const gol = (eventi || []).filter(e => e.tipo_evento_codice === 'GOAL').length;
      const assist = (eventi || []).filter(e => e.tipo_evento_codice === 'ASSIST').length;
      const presenze = (convocazioni || []).filter(c => c.presente).length;
      
      res.json({
        gol,
        assist,
        presenze,
        partite: partite.length
      });
    } catch (err) {
      console.error('Get player stats error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/calciatori/:id/career - Carriera storica
  getCareer: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data: rosa } = await supabase
        .from('rosa')
        .select('squadra_id, numero_maglia, ruolo, stato')
        .eq('calciatore_id', id);
      
      if (!rosa || rosa.length === 0) {
        return res.json({ historico: [] });
      }
      
      const sqIds = rosa.map(r => r.squadra_id);
      const { data: squadre } = await supabase
        .from('squadra')
        .select('id, nome, categoria, stagione:stagione_id(nome)')
        .in('id', sqIds);
      
      const sqMap = {};
      (squadre || []).forEach(s => {
        sqMap[s.id] = s;
      });
      
      const historico = rosa.map(r => ({
        squadra: sqMap[r.squadra_id]?.nome || '?',
        categoria: sqMap[r.squadra_id]?.categoria || '?',
        stagione: sqMap[r.squadra_id]?.stagione?.nome || '?',
        numero_maglia: r.numero_maglia,
        ruolo: r.ruolo,
        stato: r.stato
      }));
      
      res.json({ historico });
    } catch (err) {
      console.error('Get player career error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/calciatori/:id/last-matches - Ultime partite
  getLastMatches: async (req, res) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit) || 5;
      
      const { data: rosa } = await supabase
        .from('rosa')
        .select('squadra_id')
        .eq('calciatore_id', id);
      
      if (!rosa || rosa.length === 0) {
        return res.json({ partite: [] });
      }
      
      const sqIds = rosa.map(r => r.squadra_id);
      
      const { data: partite } = await supabase
        .from('partita')
        .select('*, squadra:squadra_id(nome)')
        .in('squadra_id', sqIds)
        .eq('stato', 'Terminata')
        .order('data_ora', { ascending: false })
        .limit(limit);
      
      // Per ogni partita, verifica se il giocatore ha giocato
      const partiteConStats = await Promise.all((partite || []).map(async (p) => {
        const { data: evento } = await supabase
          .from('evento_partita')
          .select('tipo_evento_codice')
          .eq('partita_id', p.id)
          .eq('calciatore_principale_id', id)
          .limit(1);
        
        const { data: convocazione } = await supabase
          .from('convocazione')
          .select('presente')
          .eq('partita_id', p.id)
          .eq('calciatore_id', id)
          .single();
        
        return {
          ...p,
          giocato: !!evento?.length || convocazione?.presente,
          gol: (evento || []).filter(e => e.tipo_evento_codice === 'GOAL').length
        };
      }));
      
      res.json({ partite: partiteConStats });
    } catch (err) {
      console.error('Get player last matches error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  }
};

module.exports = playerController;
