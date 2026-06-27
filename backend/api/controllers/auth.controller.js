const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../db/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'youth-football-manager-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

const authController = {
  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email e password richiesti' });
      }
      
      const { data: users, error } = await supabase
        .from('utente')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single();
      
      if (error || !users) {
        return res.status(401).json({ error: 'Credenziali non valide' });
      }
      
      const validPassword = await bcrypt.compare(password, users.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenziali non valide' });
      }
      
      const token = jwt.sign(
        { 
          id: users.id, 
          email: users.email, 
          ruolo: users.ruolo,
          workspace_id: users.workspace_id 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      res.json({ 
        token, 
        user: {
          id: users.id,
          nome: users.nome,
          cognome: users.cognome,
          email: users.email,
          ruolo: users.ruolo,
          workspace_id: users.workspace_id
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // POST /api/auth/register
  register: async (req, res) => {
    try {
      const { email, password, nome, cognome, ruolo, workspace_id } = req.body;
      
      if (!email || !password || !nome || !cognome) {
        return res.status(400).json({ error: 'Tutti i campi sono richiesti' });
      }
      
      const { data: existing } = await supabase
        .from('utente')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();
      
      if (existing) {
        return res.status(409).json({ error: 'Email già registrata' });
      }
      
      const password_hash = await bcrypt.hash(password, 10);
      
      const { data: newUser, error } = await supabase
        .from('utente')
        .insert({
          email: email.toLowerCase(),
          password_hash,
          nome,
          cognome,
          ruolo: ruolo || 'admin',
          workspace_id: workspace_id || '00000000-0000-0000-0000-000000000001',
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email, 
          ruolo: newUser.ruolo,
          workspace_id: newUser.workspace_id 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      res.status(201).json({ 
        token, 
        user: {
          id: newUser.id,
          nome: newUser.nome,
          cognome: newUser.cognome,
          email: newUser.email,
          ruolo: newUser.ruolo,
          workspace_id: newUser.workspace_id
        }
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/auth/me
  me: async (req, res) => {
    try {
      const { data: user, error } = await supabase
        .from('utente')
        .select('id, nome, cognome, email, ruolo, workspace_id, ruoli, squadre_accesso, is_superadmin')
        .eq('id', req.user.id)
        .single();
      
      if (error || !user) {
        return res.status(404).json({ error: 'Utente non trovato' });
      }
      
      res.json(user);
    } catch (err) {
      console.error('Me error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // PUT /api/auth/profile
  updateProfile: async (req, res) => {
    try {
      const { nome, cognome, telefono } = req.body;
      
      const { data, error } = await supabase
        .from('utente')
        .update({ nome, cognome, telefono })
        .eq('id', req.user.id)
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json(data);
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/auth/users
  getUsers: async (req, res) => {
    try {
      const workspaceId = req.query.workspace_id;
      
      let query = supabase
        .from('utente')
        .select('id, nome, cognome, email, ruolo, workspace_id, ruoli, squadre_accesso, is_superadmin, is_active')
        .eq('is_active', true)
        .order('cognome');
      
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ users: data || [] });
    } catch (err) {
      console.error('Get users error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // POST /api/auth/users
  createUser: async (req, res) => {
    try {
      const { email, password, nome, cognome, ruolo, workspace_id, ruoli, squadre_accesso } = req.body;
      
      const password_hash = await bcrypt.hash(password || 'ChangeMe123!', 10);
      
      const { data, error } = await supabase
        .from('utente')
        .insert({
          email: email.toLowerCase(),
          password_hash,
          nome,
          cognome,
          ruolo: ruolo || 'admin',
          workspace_id,
          ruoli: ruoli || [ruolo || 'admin'],
          squadre_accesso: squadre_accesso || [],
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(201).json(data);
    } catch (err) {
      console.error('Create user error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // PUT /api/auth/users/:id
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, cognome, ruolo, workspace_id, ruoli, squadre_accesso, is_active } = req.body;
      
      const { data, error } = await supabase
        .from('utente')
        .update({ 
          nome, 
          cognome, 
          ruolo, 
          workspace_id,
          ruoli,
          squadre_accesso,
          is_active
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ success: true, user: data });
    } catch (err) {
      console.error('Update user error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // DELETE /api/auth/users/:id
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { error } = await supabase
        .from('utente')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // POST /api/auth/guest-link
  createGuestLink: async (req, res) => {
    try {
      const { workspace_id, expires_in_hours = 24 } = req.body;
      
      const token = require('crypto').randomBytes(32).toString('hex');
      const expires_at = new Date(Date.now() + expires_in_hours * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('guest_link')
        .insert({
          token,
          workspace_id,
          expires_at
        })
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(201).json({ 
        token: data.token, 
        expires_at: data.expires_at,
        url: `/guest/${data.token}` 
      });
    } catch (err) {
      console.error('Create guest link error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/auth/guest-links
  getGuestLinks: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('guest_link')
        .select('*')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ links: data || [] });
    } catch (err) {
      console.error('Get guest links error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // DELETE /api/auth/guest-link/:token
  deleteGuestLink: async (req, res) => {
    try {
      const { token } = req.params;
      
      const { error } = await supabase
        .from('guest_link')
        .delete()
        .eq('token', token);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error('Delete guest link error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  },

  // GET /api/guest/:token
  verifyGuestLink: async (req, res) => {
    try {
      const { token } = req.params;
      
      const { data, error } = await supabase
        .from('guest_link')
        .select('*, workspace:workspace_id(id, nome)')
        .eq('token', token)
        .gte('expires_at', new Date().toISOString())
        .single();
      
      if (error || !data) {
        return res.status(404).json({ error: 'Link non valido o scaduto' });
      }
      
      res.json({ workspace: data.workspace });
    } catch (err) {
      console.error('Verify guest link error:', err);
      res.status(500).json({ error: 'Errore server' });
    }
  }
};

module.exports = authController;
