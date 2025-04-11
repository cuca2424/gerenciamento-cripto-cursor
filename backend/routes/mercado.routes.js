const express = require('express');
const router = express.Router();
const mercadoController = require('../controllers/mercado.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rotas públicas
router.get('/', mercadoController.getMarketInfo);
router.get('/medo-ganancia', mercadoController.getFearGreedIndex);
router.get('/altcoin-season', mercadoController.getAltcoinSeason);
router.get('/dominancia-btc', mercadoController.getBtcDominance);

// Rotas protegidas (apenas administradores podem atualizar)
router.put('/', authMiddleware, mercadoController.updateMarketInfo);

module.exports = router; 