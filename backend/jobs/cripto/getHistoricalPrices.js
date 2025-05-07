const axios = require('axios');

const API_KEY = 'CG-pzWghTmHgaTU1vdgcBAgoQbz';

// Função principal para pegar os preços históricos
async function getHistoricalPrices(id_cripto) {
    try {
        // URLs para as requisições: uma para dados diários e outra para dados de 4h
        const urlDiario = `https://api.coingecko.com/api/v3/coins/${id_cripto}/market_chart?vs_currency=usd&days=299&interval=daily&x_cg_demo_api_key=${API_KEY}`;
        const url4h = `https://api.coingecko.com/api/v3/coins/${id_cripto}/market_chart?vs_currency=usd&days=3&x_cg_demo_api_key=${API_KEY}`;

        // Fazendo a requisição para os dados diários
        const respostaDiaria = await axios.get(urlDiario);
        if (!respostaDiaria.data || !respostaDiaria.data.prices) {
            console.warn(`⚠️ Nenhum dado diário encontrado para o ativo ${id_cripto}.`);
            return null;
        }

        // Fazendo a requisição para os dados de 4h
        const resposta4h = await axios.get(url4h);
        if (!resposta4h.data || !resposta4h.data.prices) {
            console.warn(`⚠️ Nenhum dado de 4h encontrado para o ativo ${id_cripto}.`);
            return null;
        }

        // Formatando os dados para diários e 4h
        const precosDiarios = formatarPrecos(respostaDiaria.data.prices, 'diario');
        const precos4h = formatarPrecos(resposta4h.data.prices, '4h');

        // Organizando todos os preços (diários e 4h) em uma única lista cronológica
        const todosPrecos = [...precosDiarios, ...precos4h];

        // Garantindo que tenha apenas um preço por hora (removendo duplicatas)
        const precosUnicosPorHora = filtrarPrecosPorHora(todosPrecos);

        // Ordenando os dados de forma cronológica pelo timestamp
        precosUnicosPorHora.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        await new Promise(resolve => setTimeout(resolve, 2500)); // pausa por 2 segundos

        // Retornando os dados organizados em ordem cronológica
        return {
            precos: precosUnicosPorHora
        };

    } catch (err) {
        console.error(`❌ Erro ao buscar dados históricos para ${id_cripto}:`, err.message);
        return null;
    }
}

// Função para formatar os preços (diários ou 4h)
function formatarPrecos(prices, tipo) {
    return prices.map(([timestamp, preco]) => {
        const hora = new Date(timestamp);

        // Se for dado diário, ajusta o timestamp para o final do dia anterior (23:59:59)
        if (tipo === 'diario') {
            // Subtrai 1 dia e ajusta para 00:00:00 do dia anterior
            hora.setDate(hora.getDate() - 1);
        } else {
            // Para dados de 4h, mantemos o timestamp original
            hora.setMinutes(0, 0, 0);
        }

        const timestampArredondado = hora.toISOString(); // Convertendo para ISO string

        return {
            timestamp: timestampArredondado,
            max: preco,  // O máximo é o preço atual
            min: preco,  // O mínimo é o preço atual
            close: preco, // O fechamento é o preço atual
        };
    });
}

// Função para garantir que tenha apenas um preço por hora
function filtrarPrecosPorHora(precos) {
    const precosPorHora = {};

    // Itera sobre os preços para garantir que há apenas um por hora
    precos.forEach(preco => {
        const hora = preco.timestamp;  // A chave será o timestamp da hora
        if (!precosPorHora[hora]) {
            // Se não houver um preço para essa hora, adiciona
            precosPorHora[hora] = preco;
        } else {
            // Caso contrário, substitui o preço se for mais recente (no caso de 4h ou diários)
            const precoExistente = precosPorHora[hora];
            const precoAtual = new Date(preco.timestamp);
            const precoExistenteData = new Date(precoExistente.timestamp);

            if (precoAtual > precoExistenteData) {
                // Substitui o preço mais antigo pelo mais recente
                precosPorHora[hora] = preco;
            }
        }
    });

    // Retorna uma lista com os preços únicos por hora
    return Object.values(precosPorHora);
}

module.exports = { getHistoricalPrices };

