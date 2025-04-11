const express = require('express');
const router = express.Router();
const graficosController = require('../controllers/graficos.controller');

// Retorna dados para um gráfico de pizza, mostrando a porcentagem de cada ativo dentro da carteira
router.get('/pizza/carteira/:id', graficosController.getWalletPieChart);

// Retorna dados para um gráfico de pizza, mostrando a distribuição percentual dos ativos no total do usuário
router.get('/pizza/geral', graficosController.getGeneralPieChart);

// Retorna dados para um gráfico de linha ou barras, mostrando a relação entre aporte e saldo da carteira
router.get('/aporte-saldo/carteira/:id', graficosController.getWalletPerformanceChart);

// Retorna dados para um gráfico de linha ou barras, mostrando a relação entre aporte e saldo geral
router.get('/aporte-saldo/geral', graficosController.getGeneralPerformanceChart);

// Retorna as criptomoedas com as maiores variações nas últimas 24 horas
router.get('/maiores-variacoes', graficosController.getHighestVariations);

module.exports = router;
