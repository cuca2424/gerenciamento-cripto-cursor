const express = require('express');
const router = express.Router();
const impostoController = require('../controllers/imposto.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rota para buscar vendas e lucros/prejuízos
router.get('/vendas', impostoController.getVendas);
router.get('/relatorio', impostoController.gerarRelatorioPDF);

module.exports = router; 
module.exports = router; 
module.exports = router; 
module.exports = router; 