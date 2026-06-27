const express = require('express');
const router = express.Router();
const playerController = require('../controllers/player.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Player routes
router.get('/calciatori/:id', playerController.getById);
router.put('/calciatori/:id', authMiddleware, playerController.update);
router.get('/calciatori/:id/stats-current', playerController.getCurrentStats);
router.get('/calciatori/:id/career', playerController.getCareer);
router.get('/calciatori/:id/last-matches', playerController.getLastMatches);

module.exports = router;
