
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Registro de novo usuário
router.post('/register', authController.register);

// Login de usuário
router.post('/login', authController.login);

// Obter dados do usuário atual (rota protegida)
router.get('/me', authMiddleware, authController.me);

module.exports = router;
