const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspace.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Public routes
router.get('/', workspaceController.getAll);
router.get('/:id', workspaceController.getById);

// Protected routes
router.post('/', authMiddleware, workspaceController.create);
router.put('/:id', authMiddleware, workspaceController.update);
router.delete('/:id', authMiddleware, workspaceController.delete);
router.put('/:id/logo', authMiddleware, workspaceController.updateLogo);

// Season routes
router.get('/:id/stagioni', workspaceController.getSeasons);
router.post('/:id/stagioni', authMiddleware, workspaceController.createSeason);

// User workspaces
router.get('/', authMiddleware, workspaceController.getMyWorkspaces);

module.exports = router;
