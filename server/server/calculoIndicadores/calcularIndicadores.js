const pegarPrecosHistoricos = require("./pegarPrecosHistoricos");
const agregarDados = require("./agregarDados");
const calcularRSI = require("./calcularRSI");
const calcularEMA = require("./calcularEMA");

async function calcularIndicadores(id) {
    // dados
    const resposta = await pegarPrecosHistoricos(id);
    const precos = resposta.prices;

    const dadosSemanais = agregarDados(precos, "weekly");
    const dadosMensais = agregarDados(precos, "monthly");

    const quantidadeDeIntervalosDiario = 60;
    const quantidadeDeIntervalosSemanal = 14;
    const quantidadeDeIntervalosMensal = 8;

    if (precos.length > 0) {
        const precosDiarios = precos.map(({ price }) => price);
        const precosSemanais = dadosSemanais.map(({ price }) => price);
        const precosMensais = dadosMensais.map(({ price }) => price);

        const RSIDiarios = {};
        const RSISemanais = {};
        const RSIMensais = {};
        const EMADiarios = {};
        const EMASemanais = {};
        const EMAMensais = {};

        for (let i = 0; i < quantidadeDeIntervalosDiario; i++) {
            const periodos = i + 1;
            if (precosDiarios.length > periodos + 1) {
                const valorRSI = calcularRSI(precosDiarios, period = periodos);
                RSIDiarios[periodos] = valorRSI.at(-1);
            }

            if (precosDiarios.length >= periodos * 3) {
                const valorEMA = calcularEMA(precosDiarios, period = periodos);
                EMADiarios[periodos] = valorEMA.at(-1);
            }
        }

        for (let i = 0; i < quantidadeDeIntervalosSemanal; i++) {
            const periodos = i + 1;

            if (precosSemanais.length > periodos + 1) {
                const valorRSI = calcularRSI(precosSemanais, period = periodos);
                RSISemanais[periodos] = valorRSI.at(-1);
            }

            if (precosSemanais.length >= periodos * 3) {
                const valorEMA = calcularEMA(precosSemanais, period = periodos);
                EMASemanais[periodos] = valorEMA.at(-1);               
            }

        }

        for (let i = 0; i < quantidadeDeIntervalosMensal; i++) {
            const periodos = i + 1;

            if (precosMensais.length > periodos + 1) {
                const valorRSI = calcularRSI(precosMensais, period = periodos);
                RSIMensais[periodos] = valorRSI.at(-1); 
            }

            if (precosMensais.length >= periodos * 3) {
                const valorEMA = calcularEMA(precosMensais, period = periodos);
                EMAMensais[periodos] = valorEMA.at(-1);
            }
        }
        
        const indicadores = {
            "RSI": {
                "diario": RSIDiarios,
                "semanal": RSISemanais,
                "mensal": RSIMensais
            },
            "EMA": {
                "diario": EMADiarios,
                "semanal": EMASemanais,
                "mensal": EMAMensais
            }
        }
        return indicadores;

    } else {
        console.log("erro ao buscar os dados...")
    }
}

module.exports = calcularIndicadores;