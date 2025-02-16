const { EMA } = require("technicalindicators");

function calcularEMA(prices, period = 14) {
    return EMA.calculate({ values: prices, period });
}

module.exports = calcularEMA;