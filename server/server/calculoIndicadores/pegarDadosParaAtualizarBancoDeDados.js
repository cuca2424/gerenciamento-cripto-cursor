const SIMBOLOS_VALIDOS = require("./simbolosValidos");
const pegarDadosPrincipais = require("./pegarDadosPrincipais");
const calcularIndicadores = require("./calcularIndicadores");
const sleep = require("./sleep");

async function pegarDadosParaAtualizarBancoDeDados() {
    try {
        const resposta = await pegarDadosPrincipais();
        const criptomoedasValidas = [];
        const dadosParaAtualizarBandoDeDados = [];

        if (resposta.length > 0) {

            for (let i = 0; i < resposta.length; i++) {
                const criptomoedaValida = resposta[i];
                const dados = {
                    "id": criptomoedaValida.id,
                    "nome": criptomoedaValida.name,
                    "simbolo": criptomoedaValida.symbol,
                    "imagem": criptomoedaValida.image,
                    "precoAtual": criptomoedaValida.current_price,
                    "capitalizacaoDeMercado": criptomoedaValida.market_cap,
                    "rankCapitalizacaoDeMercado": criptomoedaValida.market_cap_rank,
                    "volumeTotal": criptomoedaValida.total_volume,
                    "variacao24h": criptomoedaValida.price_change_percentage_24h,
                    "topo24h": criptomoedaValida.high_24h,
                    "fundo24h": criptomoedaValida.low_24h,
                }
                const indicadores = await calcularIndicadores(criptomoedaValida.id);
        
                if (indicadores) {
                   dados["RSI"] = indicadores.RSI;
                   dados["EMA"] = indicadores.EMA;
                } else {
                   console.log("erro ao buscas os indicadores...")
                }
                await sleep(2000);
                dadosParaAtualizarBandoDeDados.push(dados);
                console.log("adicionado ao banco de dados => ", dados.simbolo);
            }
        console.log(dadosParaAtualizarBandoDeDados);
        console.log("---------------------------------------------------------------")
        return dadosParaAtualizarBandoDeDados;   
    }
    
    } catch (err) {
       console.log(err)
    }
}

module.exports = pegarDadosParaAtualizarBancoDeDados;
