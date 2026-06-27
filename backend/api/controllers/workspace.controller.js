const supabase = require('../db/supabase');

const workspaceController = {
  // GET /api/workspaces
  getAll: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('workspace')
        .select('id, nome, logo_url, data_creazione, indirizzo, telefono, email, sito_web')
        .order('nome');
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json(data || []);
    } catch (err) {
      console.error('Get workspaces error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/workspaces/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('workspace')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        return res.status(404).json({ error: 'Workspace non trovato' });
      }
      
      res.json(data);
    } catch (err) {
      console.error('Get workspace error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // POST /api/workspaces
  create: async (req, res) => {
    try {
      const { nome, logo_url, indirizzo, telefono, email, sito_web } = req.body;
      
      if (!nome) {
        return res.status(400).json({ error: 'Nome richiesto' });
      }
      
      const { data, error } = await supabase
        .from('workspace')
        .insert({
          nome,
          logo_url,
          indirizzo,
          telefono,
          email,
          sito_web
        })
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(201).json(data);
    } catch (err) {
      console.error('Create workspace error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // PUT /api/workspaces/:id
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, logo_url, indirizzo, telefono, email, sito_web } = req.body;
      
      const { data, error } = await supabase
        .from('workspace')
        .update({ nome, logo_url, indirizzo, telefono, email, sito_web })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json(data);
    } catch (err) {
      console.error('Update workspace error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // DELETE /api/workspaces/:id
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Non permettere eliminazione se ci sono stagioni
      const { data: seasons } = await supabase
        .from('stagione')
        .select('id')
        .eq('workspace_id', id);
      
      if (seasons && seasons.length > 0) {
        return res.status(400).json({ error: 'Elimina prima le stagioni associate' });
      }
      
      const { error } = await supabase
        .from('workspace')
        .delete()
        .eq('id', id);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error('Delete workspace error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // PUT /api/workspaces/:id/logo
  updateLogo: async (req, res) => {
    try {
      const { id } = req.params;
      const { logo_url } = req.body;
      
      const { error } = await supabase
        .from('workspace')
        .update({ logo_url })
        .eq('id', id);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error('Update logo error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/workspaces/:id/stagioni
  getSeasons: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('stagione')
        .select('*')
        .eq('workspace_id', id)
        .order('anno_inizio', { ascending: false });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json(data || []);
    } catch (err) {
      console.error('Get seasons error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // POST /api/workspaces/:id/stagioni
  createSeason: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, anno_inizio, anno_fine, data_inizio, data_fine } = req.body;
      
      if (!nome || !anno_inizio || !anno_fine) {
        return res.status(400).json({ error: 'Nome, anno inizio e fine richiesti' });
      }
      
      const { data, error } = await supabase
        .from('stagione')
        .insert({
          workspace_id: id,
          nome,
          anno_inizio,
          anno_fine,
          data_inizio,
          data_fine,
          attiva: true
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

  // GET /api/auth/workspaces (with user access)
  getMyWorkspaces: async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Non autenticato' });
      }
      
      // Ottieni workspace dell'utente
      const { data: user } = await supabase
        .from('utente')
        .select('workspace_id')
        .eq('id', userId)
        .single();
      
      if (!user?.workspace_id) {
        return res.json([]);
      }
      
      const { data: workspaces, error } = await supabase
        .from('workspace')
        .select('id, nome, logo_url')
        .eq('id', user.workspace_id);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json(workspaces || []);
    } catch (err) {
      console.error('Get my workspaces error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  }
};

module.exports = workspaceController;
