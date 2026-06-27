const supabase = require('../db/supabase');

const playerController = {
  // GET /api/calciatori/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('player')
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
        .from('player')
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
        .from('team_player')
        .select('team_id, ruolo')
        .eq('player_id', id);
      
      if (!rose || rose.length === 0) {
        return res.json({ gol: 0, assist: 0, presenze: 0, partite: 0 });
      }
      
      const sqIds = rose.map(r => r.team_id);
      const { data: partite } = await supabase
        .from('match')
        .select('id')
        .in('team_id', sqIds)
        .eq('stato', 'Terminata');
      
      if (!partite || partite.length === 0) {
        return res.json({ gol: 0, assist: 0, presenze: 0, partite: 0 });
      }
      
      const partitaIds = partite.map(p => p.id);
      
      const { data: eventi } = await supabase
        .from('match_event')
        .select('tipo_evento_codice')
        .eq('player_id', id)
        .in('match_id', partitaIds);
      
      const { data: convocazioni } = await supabase
        .from('convocation')
        .select('presente')
        .eq('player_id', id)
        .in('match_id', partitaIds);
      
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
        .from('team_player')
        .select('team_id, numero_maglia, ruolo, stato')
        .eq('player_id', id);
      
      if (!rosa || rosa.length === 0) {
        return res.json({ historico: [] });
      }
      
      const sqIds = rosa.map(r => r.team_id);
      const { data: squadre } = await supabase
        .from('team')
        .select('id, nome, categoria, season:season_id(nome)')
        .in('id', sqIds);
      
      const sqMap = {};
      (squadre || []).forEach(s => {
        sqMap[s.id] = s;
      });
      
      const historico = rosa.map(r => ({
        squadra: sqMap[r.team_id]?.nome || '?',
        categoria: sqMap[r.team_id]?.categoria || '?',
        stagione: sqMap[r.team_id]?.stagione?.nome || '?',
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
        .from('team_player')
        .select('team_id')
        .eq('player_id', id);
      
      if (!rosa || rosa.length === 0) {
        return res.json({ partite: [] });
      }
      
      const sqIds = rosa.map(r => r.team_id);
      
      const { data: partite } = await supabase
        .from('match')
        .select('*, team:team_id(nome)')
        .in('team_id', sqIds)
        .eq('stato', 'Terminata')
        .order('data_ora', { ascending: false })
        .limit(limit);
      
      // Per ogni partita, verifica se il giocatore ha giocato
      const partiteConStats = await Promise.all((partite || []).map(async (p) => {
        const { data: evento } = await supabase
          .from('match_event')
          .select('tipo_evento_codice')
          .eq('match_id', p.id)
          .eq('player_id', id)
          .limit(1);
        
        const { data: convocazione } = await supabase
          .from('convocation')
          .select('presente')
          .eq('match_id', p.id)
          .eq('player_id', id)
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
