const axios = require("axios");
const API_KEY = "CG-pzWghTmHgaTU1vdgcBAgoQbz";
const { sleep } = require("./sleep");

async function fetchAllCryptosFromAPI() {
  const allCryptos = [];
  const perPage = 50;
  let page = 1;

  try {
    while (true) {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: perPage,
            page: page,
            x_cg_demo_api_key: API_KEY
          },
        }
      );

      const cryptos = response.data;

      if (cryptos.length === 0) {
        console.log("Página vazia recebida. Interrompendo o loop.");
        break;
      }

      const validCryptos = cryptos.filter(
        coin => coin.current_price !== null && coin.market_cap !== null
      );

      if (validCryptos.length > 0) {
        allCryptos.push(...validCryptos);
        console.log(`Página ${page} carregada com ${validCryptos.length} criptos válidas.`);
      } else {
        console.log(`Página ${page} contém apenas criptos inválidas. Ignorando esta página.`);
      }

      // break está aqui só para debug — REMOVA para pegar todas as páginas!
        break;

      page++;
      await sleep(2001);
    }

    console.log(`Total de criptos válidas: ${allCryptos.length}`);
    return allCryptos;

  } catch (err) {
    console.error("Erro ao buscar dados das criptos:", err.message);
    return [];
  }
}

module.exports = { fetchAllCryptosFromAPI };
