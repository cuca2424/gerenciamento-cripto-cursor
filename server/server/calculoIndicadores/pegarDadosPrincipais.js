const axios = require("axios");

async function pegarDadosPrincipais() {
    const allCryptos = [];
    const perPage = 250;  // Tamanho por página (máximo de 250)
    const totalPages = 4; // Para obter 1000 criptos no total

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
                    }
                }
            );

            // Adiciona as criptos da página à lista total
            allCryptos.push(...response.data);
        }

        return allCryptos;

    } catch (err) {
        console.log("Erro ao buscar dados: ", err);
        return [];
    }
}

module.exports = pegarDadosPrincipais;