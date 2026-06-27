const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/guest/:token', authController.verifyGuestLink);

// Protected routes
router.get('/me', authMiddleware, authController.me);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/logout', authMiddleware, (req, res) => res.json({ success: true }));

// User management (admin only)
router.get('/users', authMiddleware, authController.getUsers);
router.post('/users', authMiddleware, authController.createUser);
router.put('/users/:id', authMiddleware, authController.updateUser);
router.delete('/users/:id', authMiddleware, authController.deleteUser);

// Guest links
router.post('/guest-link', authMiddleware, authController.createGuestLink);
router.get('/guest-links', authMiddleware, authController.getGuestLinks);
router.delete('/guest-link/:token', authMiddleware, authController.deleteGuestLink);

module.exports = router;
