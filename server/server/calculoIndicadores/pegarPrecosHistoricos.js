const axios = require("axios");
const API_KEY = "CG-pzWghTmHgaTU1vdgcBAgoQbz";

async function pegarPrecosHistoricos(id) {
    try {
        // dados api
        const URL = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=299&interval=daily&x_cg_demo_api_key=${API_KEY}`
        const resposta = await axios.get(URL);

        // prices for calculate
        const prices = resposta.data.prices.map(([timestamp, price]) => ({
            date: new Date(timestamp),
            price,
        }));
          return {
            "prices": prices
          }
    } catch (err) {
        console.log(err);
        return {
            "prices": []
        };
    }
}

module.exports = pegarPrecosHistoricos;