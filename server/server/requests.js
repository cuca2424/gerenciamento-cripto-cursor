const axios = require("axios");
const API_KEY = "CG-pzWghTmHgaTU1vdgcBAgoQbz";

async function pegarPrecosHistoricos(id) {
    try {
        // dados api
        const URL = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=90&interval=daily&x_cg_demo_api_key=${API_KEY}`;
        const resposta = await axios.get(URL);
        console.log(resposta.data.prices);
    } catch (err) {
        console.log(err);
        return {
            "prices": []
        };
    }
}

async function pegarDadosPrincipais() {
    try {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=30`,
        );

        console.log(response.data)

    } catch (err) {
        console.log(err);
    }
}

//pegarDadosPrincipais();
//pegarPrecosHistoricos("bitcoin");

async function pegarDadosPrincipais() {
    const allCryptos = [];
    const perPage = 250;  // Tamanho por página (máximo de 250)
    const totalPages = 36; // Para obter 1000 criptos no total

    try {
        // Loop para pegar todas as páginas de criptos (1 até 4 para pegar 1000)
        for (let page = 1; page <= totalPages; page++) {
            const response = await axios.get(
                `https://api.coingecko.com/api/v3/coins/markets`,
                {
                    params: {
                        vs_currency: "usd", // Moeda de comparação
                        order: "market_cap_desc", // Ordenado por market cap (decrescente)
                        per_page: perPage, // Quantidade de moedas por página
                        page: page, // Número da página
                        x_cg_demo_api_key: API_KEY
                    }
                }
            );

            // Adiciona as criptos da página à lista total
            allCryptos.push(...response.data);
        }

        console.log(allCryptos);

    } catch (err) {
        console.log("Erro ao buscar dados.");
        return [];
    }
}

pegarDadosPrincipais()