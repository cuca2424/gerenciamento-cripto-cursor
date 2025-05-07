const { generateRSI } = require('./indicatorsTest/generateRSI');
const { generateEstocastico } = require('./indicatorsTest/generateEstocastico');
const { generateMACD } = require('./indicatorsTest/generateMACD');
const { generateEMA } = require('./indicatorsTest/generateEMA');

const calculateIndicatorsTest = (historico, cotacaoDolar) => { 
  
  const precoAtual = historico[historico.length - 1].close;

    return {
      rsi: generateRSI(historico),
      estocastico: generateEstocastico(historico),
      macd: generateMACD(historico),
      ema: generateEMA(historico, cotacaoDolar),
    };
  };
  
module.exports = { calculateIndicatorsTest };
