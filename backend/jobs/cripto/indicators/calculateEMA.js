// Função para calcular a média móvel exponencial (EMA)
function calcularEMA(prices, periodo) {
    if (prices.length < periodo * 2) {
      return null;
    }
  
    let k = 2 / (periodo + 1);
    let ema = prices.slice(0, periodo).reduce((sum, price) => sum + price.close, 0) / periodo;
  
    for (let i = periodo; i < prices.length; i++) {
      ema = (prices[i].close - ema) * k + ema;
    }
  
    return ema;
  }
  
  // Função principal que cria a estrutura desejada
  function calculateEMA(velas, cotacaoDolar = null) {
    const estruturaUSD = {};
    const estruturaBRL = {};
  
    const periodos = [20, 50, 100];
    const times = ['4h', 'diario', 'semanal', 'mensal'];
  
    times.forEach((time) => {
      estruturaUSD[time] = {};
      estruturaBRL[time] = {};
  
      periodos.forEach((periodo) => {
        const ema = calcularEMA(velas[time], periodo);
        estruturaUSD[time][`periodo${periodo}`] = ema?.toFixed(2) ?? null;
  
        if (ema !== null && cotacaoDolar) {
          estruturaBRL[time][`periodo${periodo}`] = (ema * cotacaoDolar).toFixed(2);
        } else {
          estruturaBRL[time][`periodo${periodo}`] = null;
        }
      });
    });
  
    return {
      usd: estruturaUSD,
      brl: estruturaBRL
    };
  }
  
module.exports = { calculateEMA };
  
