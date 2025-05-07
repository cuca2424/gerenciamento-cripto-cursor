const { agruparDados } = require('./agruparDados');

// Função para calcular RSI com fórmula de Wilder (sem suavização)
const calcularRSI = (periodo, closes) => {
  if (closes.length < periodo + 1) return [];

  const rsis = [];
  let ganhos = 0;
  let perdas = 0;

  // Cálculo inicial
  for (let i = 1; i <= periodo; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) ganhos += diff;
    else perdas -= diff;
  }

  let avgGain = ganhos / periodo;
  let avgLoss = perdas / periodo;
  rsis.push(100 - 100 / (1 + avgGain / avgLoss));

  for (let i = periodo + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = ((avgGain * (periodo - 1)) + gain) / periodo;
    avgLoss = ((avgLoss * (periodo - 1)) + loss) / periodo;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsis.push(rsi);
  }

  return rsis;
};

// Função para calcular o Stochastic RSI
const calcularStochRSI = (rsis, stochLength, k = 3, d = 3) => {
  if (rsis.length < stochLength + d) return [null, null];

  const stochRSIs = [];
  for (let i = stochLength - 1; i < rsis.length; i++) {
    const slice = rsis.slice(i - stochLength + 1, i + 1);
    const minRSI = Math.min(...slice);
    const maxRSI = Math.max(...slice);
    const currentRSI = rsis[i];
    const stoch = (currentRSI - minRSI) / (maxRSI - minRSI);
    stochRSIs.push(stoch);
  }

  // %K: média móvel simples dos últimos k valores
  const ultimoKs = stochRSIs.slice(-k);
  const kValue = (ultimoKs.reduce((sum, val) => sum + val, 0) / k) * 100;

  // %D: média móvel simples dos últimos d valores de %K
  const ksParaD = stochRSIs.slice(-(k + d - 1)).map((_, i, arr) => {
    if (i + k > arr.length) return null;
    const sub = arr.slice(i, i + k);
    return sub.reduce((sum, v) => sum + v, 0) / k;
  }).filter(Boolean);

  const dValue = (ksParaD.slice(-d).reduce((sum, val) => sum + val, 0) / d) * 100;

  return [kValue.toFixed(2), dValue.toFixed(2)];
};

const gerarStochRSIPorPeriodo = (closes, periodo) => {
  const rsis = calcularRSI(periodo, closes);
  const [k, d] = calcularStochRSI(rsis, periodo);
  return { k, d };
};

// Função principal
const generateEstocastico = (historico) => {
  const agrupados = agruparDados(historico);
  const getStochs = (dados) => {
    const closes = dados.map(v => v.close);
    return {
      periodo7: gerarStochRSIPorPeriodo(closes, 7),
      periodo14: gerarStochRSIPorPeriodo(closes, 14),
    };
  };

  return {
    rapido: {
      '4h': {
        periodo7: getStochs(agrupados['4h']).periodo7.k,
        periodo14: getStochs(agrupados['4h']).periodo14.k,
      },
      diario: {
        periodo7: getStochs(agrupados.diario).periodo7.k,
        periodo14: getStochs(agrupados.diario).periodo14.k,
      },
      semanal: {
        periodo7: getStochs(agrupados.semanal).periodo7.k,
        periodo14: getStochs(agrupados.semanal).periodo14.k,
      },
      mensal: {
        periodo7: getStochs(agrupados.mensal).periodo7.k,
        periodo14: getStochs(agrupados.mensal).periodo14.k,
      },
    },
    lento: {
      '4h': {
        periodo7: getStochs(agrupados['4h']).periodo7.d,
        periodo14: getStochs(agrupados['4h']).periodo14.d,
      },
      diario: {
        periodo7: getStochs(agrupados.diario).periodo7.d,
        periodo14: getStochs(agrupados.diario).periodo14.d,
      },
      semanal: {
        periodo7: getStochs(agrupados.semanal).periodo7.d,
        periodo14: getStochs(agrupados.semanal).periodo14.d,
      },
      mensal: {
        periodo7: getStochs(agrupados.mensal).periodo7.d,
        periodo14: getStochs(agrupados.mensal).periodo14.d,
      },
    }
  };
};

module.exports = { generateEstocastico };

