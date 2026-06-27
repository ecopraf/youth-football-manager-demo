const supabase = require('../db/supabase');

const seasonController = {
  // GET /api/stagioni
  getAll: async (req, res) => {
    try {
      const workspaceId = req.query.workspace_id;
      
      let query = supabase
        .from('stagione')
        .select('*')
        .order('anno_inizio', { ascending: false });
      
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json(data || []);
    } catch (err) {
      console.error('Get seasons error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/stagioni/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('stagione')
        .select('*, workspace:workspace_id(id, nome)')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        return res.status(404).json({ error: 'Stagione non trovata' });
      }
      
      res.json(data);
    } catch (err) {
      console.error('Get season error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // POST /api/stagioni
  create: async (req, res) => {
    try {
      const { workspace_id, nome, anno_inizio, anno_fine, data_inizio, data_fine, attiva } = req.body;
      
      if (!workspace_id || !nome || !anno_inizio || !anno_fine) {
        return res.status(400).json({ error: 'workspace_id, nome, anno_inizio e anno_fine richiesti' });
      }
      
      const { data, error } = await supabase
        .from('stagione')
        .insert({
          workspace_id,
          nome,
          anno_inizio,
          anno_fine,
          data_inizio,
          data_fine,
          attiva: attiva !== false
        })
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(201).json(data);
    } catch (err) {
      console.error('Create season error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // PUT /api/stagioni/:id
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, anno_inizio, anno_fine, data_inizio, data_fine, attiva } = req.body;
      
      const { data, error } = await supabase
        .from('stagione')
        .update({ nome, anno_inizio, anno_fine, data_inizio, data_fine, attiva })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json(data);
    } catch (err) {
      console.error('Update season error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // DELETE /api/stagioni/:id
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verifica che non ci siano squadre
      const { data: teams } = await supabase
        .from('squadra')
        .select('id')
        .eq('stagione_id', id);
      
      if (teams && teams.length > 0) {
        return res.status(400).json({ error: 'Elimina prima le squadre associate' });
      }
      
      const { error } = await supabase
        .from('stagione')
        .delete()
        .eq('id', id);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error('Delete season error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/stagioni/:id/squadre
  getTeams: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('squadra')
        .select('*')
        .eq('stagione_id', id)
        .order('nome');
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json(data || []);
    } catch (err) {
      console.error('Get season teams error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // POST /api/stagioni/:id/squadre
  createTeam: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, categoria, allenatore, dirigente, dirigente2, preparatore_atletico, allenatore_portieri } = req.body;
      
      if (!nome) {
        return res.status(400).json({ error: 'Nome richiesto' });
      }
      
      const { data, error } = await supabase
        .from('squadra')
        .insert({
          stagione_id: id,
          nome,
          categoria,
          allenatore,
          dirigente,
          dirigente2,
          preparatore_atletico,
          allenatore_portieri
        })
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(201).json(data);
    } catch (err) {
      console.error('Create team error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  }
};

module.exports = seasonController;
