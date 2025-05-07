const { agruparDados } = require('./agruparDados');

// EMA
const calcularEMA = (periodo, valores) => {
  const k = 2 / (periodo + 1);
  let ema = valores.slice(0, periodo).reduce((a, b) => a + b, 0) / periodo;

  for (let i = periodo; i < valores.length; i++) {
    ema = valores[i] * k + ema * (1 - k);
  }

  return ema;
};

// MACD com Signal e Histograma
const calcularMACDCompleto = (closes) => {
  if (closes.length < 35) return null; // mínimo necessário

  const linhaMACD = [];

  for (let i = 26; i <= closes.length; i++) {
    const slice = closes.slice(0, i);
    const ema12 = calcularEMA(12, slice);
    const ema26 = calcularEMA(26, slice);
    linhaMACD.push(ema12 - ema26);
  }

  const macd = linhaMACD[linhaMACD.length - 1];
  const signal = calcularEMA(9, linhaMACD);
  const histograma = macd - signal;

  return {
    macd: +macd.toFixed(2),
    signal: +signal.toFixed(2),
    histograma: +histograma.toFixed(2)
  };
};

const generateMACD = (historico) => {
  const agrupados = agruparDados(historico);

  const calcular = (velas) => {
    const closes = velas.map(v => v.close);
    return calcularMACDCompleto(closes);
  };

  return {
    '4h': calcular(agrupados['4h']),
    diario: calcular(agrupados.diario),
    semanal: calcular(agrupados.semanal),
    mensal: calcular(agrupados.mensal),
  };
};

module.exports = { generateMACD };


