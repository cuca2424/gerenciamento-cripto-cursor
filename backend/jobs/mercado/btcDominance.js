const axios = require('axios');

const getBTCDominanceData = async () => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/global');
    const data = response.data.data.market_cap_percentage.btc;

    const getTrend = (value) => {
      if (value > 55) return "Alta";
      if (value < 45) return "Baixa";
      return "Estável";
    };

    return {
      valor: parseFloat(data),
      tendencia: getTrend(parseFloat(data)),
      ultimaAtualizacao: new Date()
    };
  } catch (error) {
    console.error('Erro ao buscar dados da dominância do BTC:', error);
    throw error;
  }
};

module.exports = getBTCDominanceData; 