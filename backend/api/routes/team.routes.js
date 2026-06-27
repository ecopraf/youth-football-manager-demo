const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Squadre
router.get('/squadre', teamController.getAll);
router.get('/squadre/:id', teamController.getById);
router.put('/squadre/:id', authMiddleware, teamController.update);
router.delete('/squadre/:id', authMiddleware, teamController.delete);

// Giocatori
router.get('/squadre/:id/calciatori', teamController.getPlayers);
router.post('/squadre/:id/calciatori', authMiddleware, teamController.addPlayer);

// Partite
router.get('/squadre/:id/partite', teamController.getMatches);
router.get('/squadre/:id/partite-future', teamController.getUpcomingMatches);
router.post('/squadre/:id/partite', authMiddleware, teamController.createMatch);

// Statistiche
router.get('/squadre/:id/statistiche-complete', teamController.getStatistics);
router.get('/squadre/:id/top-players', teamController.getTopPlayers);
router.get('/squadre/:id/scadenze-mediche', teamController.getMedicalExpirations);

module.exports = router;
