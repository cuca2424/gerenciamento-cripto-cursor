function calcularRSIRapido(prices, period = 14) {

    if (prices.length < period) {
        return null;
    }

    let gains = 0;
    let losses = 0;

    // Calculando os ganhos e perdas iniciais com base nos preços de fechamento
    for (let i = 1; i <= period; i++) {
        let change = prices[i].close - prices[i - 1].close;
        if (change > 0) {
            gains += change;
        } else {
            losses -= change;
        }
    }

    // Média dos ganhos e perdas
    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculando o RSI
    let rsi = 100 - (100 / (1 + (avgGain / avgLoss)));

    // Calculando para o resto da série de preços
    for (let i = period; i < prices.length; i++) {
        let change = prices[i].close - prices[i - 1].close;

        if (change > 0) {
            gains = change;
            losses = 0;
        } else {
            gains = 0;
            losses = -change;
        }

        avgGain = (avgGain * (period - 1) + gains) / period;
        avgLoss = (avgLoss * (period - 1) + losses) / period;

        rsi = 100 - (100 / (1 + (avgGain / avgLoss)));
    }

    return rsi;
}



function calcularRSILento(prices, rsiPeriod = 14, emaPeriod = 14) {
    const totalPeriod = rsiPeriod + emaPeriod - 1;

    if (prices.length < totalPeriod) {
        return null;
    }

    // Etapa 1: Calcular a série de RSI
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < rsiPeriod; i++) {
        const change = prices[i].close - prices[i - 1].close;
        if (change > 0) gains += change;
        else losses -= change;
    }

    let avgGain = gains / rsiPeriod;
    let avgLoss = losses / rsiPeriod;
    let rsiArray = [
        100 - (100 / (1 + (avgGain / avgLoss)))
    ];

    for (let i = rsiPeriod; i < prices.length; i++) {
        const change = prices[i].close - prices[i - 1].close;
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? -change : 0;

        avgGain = (avgGain * (rsiPeriod - 1) + gain) / rsiPeriod;
        avgLoss = (avgLoss * (rsiPeriod - 1) + loss) / rsiPeriod;

        const rsi = 100 - (100 / (1 + (avgGain / avgLoss)));
        rsiArray.push(rsi);
    }

    // Etapa 2: Calcular EMA sobre a série de RSI
    const k = 2 / (emaPeriod + 1);
    let ema = rsiArray[0];
    for (let i = 1; i < rsiArray.length; i++) {
        ema = (rsiArray[i] - ema) * k + ema;
    }

    return ema;
}




function calculateRSI(dados) {
    let rsi = {
        rápido: {},
        lento: {}
    };

    // Intervalos dos períodos que você quer calcular
    const intervalos = ['4h', 'diario', 'semanal', 'mensal'];

    intervalos.forEach((intervalo) => {
        let velasPeriodo = dados[intervalo];  // Pegue todas as velas do intervalo
        console.log('intervalo => ', intervalo);
        console.log('velasPeriodo => ', velasPeriodo);

        // Calcula o RSI rápido e lento para cada intervalo usando todas as velas
        rsi.rápido[intervalo] = {
            periodo7: calcularRSIRapido(velasPeriodo, 7),
            periodo14: calcularRSIRapido(velasPeriodo, 14)
        };

        rsi.lento[intervalo] = {
            periodo7: calcularRSILento(velasPeriodo, 7),
            periodo14: calcularRSILento(velasPeriodo, 14)
        };
    });

    return { rsi };
}

module.exports = { calculateRSI };
