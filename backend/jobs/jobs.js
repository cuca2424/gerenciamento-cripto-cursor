// Aqui você pode adicionar suas funções de jobs
// Cada função receberá o db como parâmetro

const atualizarCriptos = require('./cripto');
const atualizarMercado = require('./mercado');
const atualizarDolar = require('./dolar');
const verificarEstrategias = require('./estrategias');

const jobs = {
  // Exemplo de como estruturar seus jobs:
  // atualizarDolar,
  atualizarCriptos,
  // atualizarMercado,
  // verificarEstrategias
};

module.exports = jobs; 