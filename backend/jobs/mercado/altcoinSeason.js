const axios = require('axios');
const API_KEY = "CG-pzWghTmHgaTU1vdgcBAgoQbz";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getAltcoinSeasonData = async () => {
  try {
    const getTopCoins = async () => {
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 51,
          page: 1,
        },
      });

      return response.data.filter((coin) => coin.id !== 'bitcoin').slice(0, 50);
    };

    const getPerformance90d = async (coinId) => {
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: 90,
          x_cg_demo_api_key: API_KEY
        },
      });

      const prices = response.data.prices;
      if (prices.length < 2) return null;

      const initial = prices[0][1];
      const final = prices[prices.length - 1][1];

      return ((final - initial) / initial) * 100;
    };

    const btcPerformance = await getPerformance90d('bitcoin');
     // espera após o Bitcoin
    await sleep(2000);

    const topAltcoins = await getTopCoins();

    let outperformCount = 0;

    for (const coin of topAltcoins) {
      try {
        console.log('coin: ', coin.id);
        const perf = await getPerformance90d(coin.id);
        if (perf !== null && perf > btcPerformance) {
          outperformCount++;
        }
        await sleep(2000); // espera entre cada altcoin
      } catch (err) {
        console.warn(`Erro com ${coin.id}: ${err.message}`);
      }
    }

    const valor = parseFloat(((outperformCount / topAltcoins.length) * 100).toFixed(2));

    const getStatus = (value) => {
      if (value >= 75) return "Altcoin Season";
      if (value <= 25) return "Bitcoin Season";
      return "Neutro";
    };

    return {
      valor,
      status: getStatus(valor),
      ultimaAtualizacao: new Date()
    };
  } catch (error) {
    console.error('Erro ao calcular Altcoin Season:', error.message);
    throw error;
  }
};

module.exports = getAltcoinSeasonData;
