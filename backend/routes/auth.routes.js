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

// Rotas de redefinição de senha
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-reset-token/:token', authController.verifyResetToken);
router.get('/verify-email/:token', authController.verifyEmail);

// Verificar status de verificação do email
router.post('/check-email-verification', authController.checkEmailVerification);

module.exports = router;
