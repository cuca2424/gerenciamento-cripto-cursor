const { agruparDados } = require('./agruparDados');

// --- RSI padrão de Wilder, agora retornando série de valores ---
const calcularRSI = (periodo, closes) => {
  if (closes.length < periodo + 1) return null;

  let ganhos = 0;
  let perdas = 0;

  for (let i = 1; i <= periodo; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) ganhos += diff;
    else perdas -= diff;
  }

  let avgGain = ganhos / periodo;
  let avgLoss = perdas / periodo;

  const rsiSeries = [];

  for (let i = periodo + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = ((avgGain * (periodo - 1)) + gain) / periodo;
    avgLoss = ((avgLoss * (periodo - 1)) + loss) / periodo;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsiSeries.push(rsi);
  }

  return rsiSeries;
};

// --- RSI rápido: último valor da série RSI(7) e RSI(14) ---
const calcularRSIRapidoPorTipo = (velas) => {
  const closes = velas.map(v => v.close);
  const rsi7 = calcularRSI(7, closes);
  const rsi14 = calcularRSI(14, closes);

  return {
    periodo7: rsi7 ? +rsi7.at(-1).toFixed(2) : null,
    periodo14: rsi14 ? +rsi14.at(-1).toFixed(2) : null,
  };
};

// --- RSI lento: média dos últimos 14 valores de RSI(7) ou RSI(14) ---
const calcularRSILento = (closes, periodoRSI = 7, periodoSMA = 14) => {
  const rsiValues = calcularRSI(periodoRSI, closes);
  if (!rsiValues || rsiValues.length < periodoSMA) return null;

  const ultimosValores = rsiValues.slice(-periodoSMA);
  const soma = ultimosValores.reduce((acc, val) => acc + val, 0);
  const media = soma / periodoSMA;

  return +media.toFixed(2);
};

const calcularRSILentoPorTipo = (velas) => {
  const closes = velas.map(v => v.close);
  return {
    periodo7: calcularRSILento(closes, 7, 14),
    periodo14: calcularRSILento(closes, 14, 14),
  };
};

// --- Função principal ---
const generateRSI = (historico) => {
  const agrupados = agruparDados(historico);

  return {
    rapido: {
      '4h': calcularRSIRapidoPorTipo(agrupados['4h']),
      diario: calcularRSIRapidoPorTipo(agrupados.diario),
      semanal: calcularRSIRapidoPorTipo(agrupados.semanal),
      mensal: calcularRSIRapidoPorTipo(agrupados.mensal),
    },
    lento: {
      '4h': calcularRSILentoPorTipo(agrupados['4h']),
      diario: calcularRSILentoPorTipo(agrupados.diario),
      semanal: calcularRSILentoPorTipo(agrupados.semanal),
      mensal: calcularRSILentoPorTipo(agrupados.mensal),
    }
  };
};

module.exports = { generateRSI };



