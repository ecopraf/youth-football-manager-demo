const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'youth-football-manager-secret-key-2024';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token mancante' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token non valido' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Errore autenticazione' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
      } catch (err) {
        // Token non valido, ma procedi comunque
      }
    }
    next();
  } catch (err) {
    next();
  }
};

module.exports = { authMiddleware, optionalAuth };
