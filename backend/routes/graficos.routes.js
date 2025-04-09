const express = require('express');
const router = express.Router();
const graficosController = require('../controllers/graficos.controller');

// Rotas de gráficos
router.get('/aporte-saldo/geral', graficosController.getGeneralPerformance);
router.get('/pizza/geral', graficosController.getGeneralPieChart);
router.get('/pizza/carteira/:id', graficosController.getWalletPieChart);

module.exports = router;
