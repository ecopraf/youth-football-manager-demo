const express = require('express');
const router = express.Router();
const seasonController = require('../controllers/season.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Public routes
router.get('/', seasonController.getAll);
router.get('/:id', seasonController.getById);

// Protected routes
router.post('/', authMiddleware, seasonController.create);
router.put('/:id', authMiddleware, seasonController.update);
router.delete('/:id', authMiddleware, seasonController.delete);

// Team routes under season
router.get('/:id/squadre', seasonController.getTeams);
router.post('/:id/squadre', authMiddleware, seasonController.createTeam);

module.exports = router;
