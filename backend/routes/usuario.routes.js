const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');

// Rotas do usuário
router.post('/deposito', usuarioController.deposit);
router.post('/saque', usuarioController.withdraw);
router.get('/overview', usuarioController.getOverview);
router.get('/me', usuarioController.getUser);

module.exports = router;
