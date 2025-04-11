
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');

// Adicionar saldo em reais à conta geral
router.post('/deposito', usuarioController.deposit);

// Sacar saldo em reais da conta geral
router.post('/saque', usuarioController.withdraw);

// Mostrar saldo, aporte e lucro geral do usuário (considerando todas as carteiras)
router.get('/geral', usuarioController.getOverview);

// Obter dados do usuário
router.get('/', usuarioController.getUser);

module.exports = router;
