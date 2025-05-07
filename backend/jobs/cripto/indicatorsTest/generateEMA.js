const { agruparDados } = require('./agruparDados');

// Calcula a EMA padrão (Wilder)
const calcularEMA = (periodo, closes) => {
  if (closes.length < periodo) return null;

  const k = 2 / (periodo + 1);
  let ema = closes.slice(0, periodo).reduce((a, b) => a + b, 0) / periodo;

  for (let i = periodo; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
  }

  return +ema;
};

// Suaviza com uma SMA de 14 períodos
const suavizarComSMA = (valores, periodo = 14) => {
  if (valores.length < periodo) return null;
  const soma = valores.slice(-periodo).reduce((a, b) => a + b, 0);
  return +(soma / periodo);
};

// Calcula EMAs e aplica suavização SMA(14) para o lento
const calcularEMAsPorVelas = (velas) => {
  const closes = velas.map(v => v.close);

  const calcularPara = (periodo) => {
    const historicoEMAs = [];

    for (let i = periodo; i <= closes.length; i++) {
      const slice = closes.slice(0, i);
      const ema = calcularEMA(periodo, slice);
      if (ema !== null) historicoEMAs.push(ema);
    }

    const rapido = calcularEMA(periodo, closes);
    const lento = suavizarComSMA(historicoEMAs);

    return { rapido, lento };
  };

  return {
    periodo20: calcularPara(20),
    periodo50: calcularPara(50),
    periodo100: calcularPara(100)
  };
};

// Gera a estrutura no formato solicitado
const generateEMA = (historico, cotacaoDolar) => {
  const agrupados = agruparDados(historico);
  const intervalos = ['4h', 'diario', 'semanal', 'mensal'];

  const estrutura = {
    rapido: { brl: {}, usd: {} },
    lento: { brl: {}, usd: {} }
  };

  for (const intervalo of intervalos) {
    const velas = agrupados[intervalo];
    const resultados = calcularEMAsPorVelas(velas);

    // Rápido
    const usdRapido = {
      periodo20: resultados.periodo20.rapido,
      periodo50: resultados.periodo50.rapido,
      periodo100: resultados.periodo100.rapido
    };
    const brlRapido = {
      periodo20: +(usdRapido.periodo20 * cotacaoDolar),
      periodo50: +(usdRapido.periodo50 * cotacaoDolar),
      periodo100: +(usdRapido.periodo100 * cotacaoDolar)
    };

    estrutura.rapido.usd[intervalo] = usdRapido;
    estrutura.rapido.brl[intervalo] = brlRapido;

    // Lento (suavizado com SMA(14))
    const usdLento = {
      periodo20: resultados.periodo20.lento,
      periodo50: resultados.periodo50.lento,
      periodo100: resultados.periodo100.lento
    };
    const brlLento = {
      periodo20: +(usdLento.periodo20 * cotacaoDolar),
      periodo50: +(usdLento.periodo50 * cotacaoDolar),
      periodo100: +(usdLento.periodo100 * cotacaoDolar)
    };

    estrutura.lento.usd[intervalo] = usdLento;
    estrutura.lento.brl[intervalo] = brlLento;
  }

  return estrutura;
};

module.exports = { generateEMA };


