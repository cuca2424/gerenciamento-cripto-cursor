
const express = require('express');
const router = express.Router();
const historicoController = require('../controllers/historico.controller');

// Exibir histórico de operações
router.get('/', historicoController.getHistory);

module.exports = router;
