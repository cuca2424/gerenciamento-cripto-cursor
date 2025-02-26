const axios = require("axios");
const API_KEY = "CG-pzWghTmHgaTU1vdgcBAgoQbz";

// úteis
const sleep = require("./calculoIndicadores/sleep");
const agregarDados = require("./calculoIndicadores/agregarDados");
const calcularRSI = require("./calculoIndicadores/calcularRSI");
const calcularEMA = require("./calculoIndicadores/calcularEMA");


// db
const { MongoClient, ObjectId } = require("mongodb");
const { RSI } = require("technicalindicators");
const uri_db_nuvem = "mongodb+srv://adorno:f2q39KH5al6BNU2s@projeto-jean-deploy.okctz.mongodb.net/"
const client = new MongoClient(uri_db_nuvem);
let db;

async function conectarComBancoDeDados() {
    try {
        await client.connect();
        console.log("conectado ao banco de dados");
        db = client.db("teste");
    } catch(err) {
        console.log("error: ", err);
    }
}

async function testeBancoDeDados() {
    await db.collection("preços").insertOne({msg: "testando"});
    console.log("banco funcionando.")
}

async function pegarDadosPrincipais() {
    const allCryptos = [];
    const perPage = 250;  // Tamanho por página (máximo de 250)
    const totalPages = 1; // Para obter 1000 criptos no total

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
        //console.log(err);
        return {
            "prices": []
        };
    }
}

async function colocarPrecosBancoDeDados(todasCriptos, todosIDs) {
    // colocar precos no db
    let resposta = {}
    if (todasCriptos.length > 0) {
        for (let i = 0; i < todasCriptos.length; i++) {
            resposta[todosIDs[i]] = {id: todosIDs[i], precos: (await pegarPrecosHistoricos(todosIDs[i])).prices};
            console.log("Cripto adicionada ao banco de dados => ", todosIDs[i]);
            await sleep(3000);
        }

        console.log("Dados inseridos com sucesso.")
        await db.collection("preços").insertMany(Object.values(resposta));
        console.log(Object.values(resposta))
    } else {
        console.log("Ainda não temos os dados...")
    }
}

async function atualizarPrecosBancoDeDados(todasCriptos) {
    const precos = await db.collection("preços").find().toArray();

    for (let i = 0; i < todasCriptos.length; i++) {
        const id = todasCriptos[i].id;
        const precoAtual = todasCriptos[i].current_price;

        const escolhido = precos.find(preco => preco.id === id);

        if (escolhido) {
            if (escolhido.precos.length < 1) {
                escolhido.precos[0] = {date: new Date(Date.now()), price: precoAtual}
            }

            console.log(escolhido)
            
            const dataUltimaVela = escolhido.precos[escolhido.precos.length - 1].date.toISOString().split('T')[0];
            const dataAtual = new Date(Date.now()).toISOString().split('T')[0];
            console.log(dataUltimaVela, dataAtual);

            if (false) {
                console.log("Lógica para só adicionar o dado");
            } else {
                escolhido.precos[escolhido.precos.length - 1].price = precoAtual;
                escolhido.precos[escolhido.precos.length - 1].date = new Date(Date.now());
            }
        }

        console.log(id, " atualizado com sucesso.")
    }
    
    await db.collection("preços").deleteMany({});
    await db.collection("preços").insertMany(precos);
    console.log("Todos dados foram atualizados.");
}

async function calcularIndicadores(id, conteudoBancoDeDados) {

    const resposta = await conteudoBancoDeDados.find(conteudo => conteudo.id === id);

    if (!resposta) {
        return {
            "RSI": {
                "diario": 0,
                "semanal": 0,
                "mensal": 0
            },
            "EMA": {
                "diario": 0,
                "semanal": 0,
                "mensal": 0
            }
        }
    }
    const precos = resposta.precos;

    //console.log(precos)
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

        const RSILentoDiarios = {};
        const RSILentoSemanais = {};
        const RSILentoMensais = {};

        const EMADiarios = {};
        const EMASemanais = {};
        const EMAMensais = {};
        


        // indicadores diarios

        if (precosDiarios.length > 14 + 1) {   
            RSIDiarios[14] = calcularRSI(precosDiarios).at(-1);
        } else {
            RSIDiarios[14] = 0
        }

        // emas em diversos periodos diarios

        if (precosDiarios.length >= 20 * 2) {
            EMADiarios[20] = calcularEMA(precosDiarios, 20).at(-1);
        } else {
            EMADiarios[20] = 0
        }

        if (precosDiarios.length >= 50 * 2) {
            EMADiarios[50] = calcularEMA(precosDiarios, 50).at(-1);
        } else {
            EMADiarios[50] = 0
        }

        if (precosDiarios.length >= 100 * 2) {
            EMADiarios[100] = calcularEMA(precosDiarios, 100).at(-1);
        } else {
            EMADiarios[100] = 0
        }

        // indicadores semanais

        if (precosSemanais.length > 14 + 1) {   
            RSISemanais[14] = calcularRSI(precosSemanais).at(-1);
        } else {
            RSISemanais[14] = 0
        }

        // indicadores mensais

        if (precosMensais.length > 7 + 1) {   
            RSIMensais[7] = calcularRSI(precosMensais, 7).at(-1);
        } else {
            RSIMensais[7] = 0
        }

        // rsi lento

        RSILentoDiarios[14] = calcularRSI(precosDiarios).slice(-14).reduce((sum, num) => sum + num, 0) / 14
        RSILentoSemanais[14] = calcularRSI(precosSemanais).slice(-14).reduce((sum, num) => sum + num, 0) / 14
        RSILentoMensais[7] = calcularRSI(precosMensais, 7).slice(-7).reduce((sum, num) => sum + num, 0) / calcularRSI(precosMensais, 7).slice(-7).length;

        // ema lenta


        const indicadores = {
            "RSI": {
                "rapida": {
                    "diario": RSIDiarios,
                    "semanal": RSISemanais,
                    "mensal": RSIMensais           
                }, 
                "lenta": {
                    "diario": RSILentoDiarios,
                    "semanal": RSILentoSemanais,
                    "mensal": RSILentoMensais
                }
            },
            "EMA": {
                "diario": EMADiarios
            }
        }
        
        return indicadores;

    } else {
        console.log("erro ao buscar os dados...")
    }
}

async function main() {
    await conectarComBancoDeDados();
    const todasCriptos = await pegarDadosPrincipais();
    const todosIDS = todasCriptos.map(cripto => cripto.id);
    const conteudoBancoDeDados = await db.collection("preços").find().toArray();
    

    if (todasCriptos.length > 0) {
        console.log(todasCriptos.length + " criptomoedas...");
        //console.log("colocando precos no banco de dados.")
        //await colocarPrecosBancoDeDados(todasCriptos, todosIDS);
        //console.log("atualizando precos no banco de dados.");
        await atualizarPrecosBancoDeDados(todasCriptos);

        const dadosParaAtualizarBandoDeDados = []

        for (let i = 0; i < todasCriptos.length; i++) {
            const criptoAtual = todasCriptos[i];
            const dados = {
                "id": criptoAtual.id,
                "nome": criptoAtual.name,
                "simbolo": criptoAtual.symbol,
                "imagem": criptoAtual.image,
                "precoAtual": criptoAtual.current_price,
                "capitalizacaoDeMercado": criptoAtual.market_cap,
                "rankCapitalizacaoDeMercado": criptoAtual.market_cap_rank,
                "volumeTotal": criptoAtual.total_volume,
                "variacao24h": criptoAtual.price_change_percentage_24h,
                "topo24h": criptoAtual.high_24h,
                "fundo24h": criptoAtual.low_24h,
            }
            const indicadores = await calcularIndicadores(criptoAtual.id, conteudoBancoDeDados);
    
            if (indicadores) {
               console.log("Calculando indicadores ", criptoAtual.id)
               dados["RSI"] = indicadores.RSI;
               dados["EMA"] = indicadores.EMA;
            } else {
               console.log("erro ao buscas os indicadores...")
            }
            dadosParaAtualizarBandoDeDados.push(dados);
        }

        await db.collection("teste_criptomoedas").deleteMany({});
        const resultado = await db.collection("teste_criptomoedas").insertMany(dadosParaAtualizarBandoDeDados);
        console.log(`${resultado.insertedCount} valores inseridos ao banco de dados.`);
    }
}

async function executar() {
    // conectar db
    await conectarComBancoDeDados();

    // info inicial
    const todasCriptos = await pegarDadosPrincipais();
    const todosIDs = todasCriptos.map(cripto => cripto.id);

    if (todasCriptos.length > 0) {      
        //await colocarPrecosBancoDeDados(todasCriptos, todosIDs);
        await atualizarPrecosBancoDeDados(todasCriptos);
        console.log(await calcularIndicadores("bitcoin"));
    } else {
        console.log("Sem dados.")
    }
    // calcular indicadores usando precos do db

}

async function executar2() {
    
}

//executar();
main();