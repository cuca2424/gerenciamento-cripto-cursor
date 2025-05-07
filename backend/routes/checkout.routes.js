const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkout.controller');

// Criar sessão de checkout para novo usuário
router.post('/criar-sessao-checkout', checkoutController.criarSessaoCheckout);

// Criar sessão de checkout para reativação de conta
router.post('/reativar-conta', checkoutController.criarSessaoReativacao);

module.exports = router; 