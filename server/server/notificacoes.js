const axios = require("axios");

//db
const { MongoClient, ObjectId } = require("mongodb");
const uri_db_nuvem = "mongodb+srv://adorno:f2q39KH5al6BNU2s@projeto-jean-deploy.okctz.mongodb.net/"
const client = new MongoClient(uri_db_nuvem);
let db;

const URL_BASE = "http://localhost:8081";
const API_KEY = "429683C4C977415CAAFCCE10F7D57E11";
const ID_INSTANCIA = "fbca2447-b88e-4492-8d17-b017ecfa6600";
const NOME_INSTANCIA = "testando";

async function conectarComBancoDeDados() {
    try {
        await client.connect();
        console.log("conectado ao banco de dados");
        db = client.db("teste");
    } catch(err) {
        console.log("error: ", err);
    }
}

async function enviarMensagem(num, msg) {
    const response = await axios.post( URL_BASE + '/message/sendText/' + NOME_INSTANCIA, 
        {
        number: num,
        text: msg
    },
    {
        headers: {
            'apikey': API_KEY
        }
    }
)
}


async function retornarCriptomoedas(str) {
    try {
        const params = new URLSearchParams(str);
        const parametros = {};
        for (const [key, value] of params.entries()) {
            parametros[key] = value;
        }

        const filtros = {};

        for (const chave in parametros) {
            if (chave.startsWith("rsi-rapido")) {
                const [, periodo, tipo, condicao] = chave.split("_"); 

                const valor = parseFloat(parametros[chave]);

                const campo = `RSI.rapida.${periodo}.${tipo}`; 

                if (condicao === "maior") {
                    filtros[campo] = { ...filtros[campo], $gte: valor };
                } else if (condicao === "menor") {
                    filtros[campo] = { ...filtros[campo], $lte: valor };
                }
            }
        }
        for (const chave in parametros) {
            if (chave.startsWith("rsi-lento")) {
                const [, periodo, tipo, condicao] = chave.split("_"); 

                const valor = parseFloat(parametros[chave]);

                const campo = `RSI.lenta.${periodo}.${tipo}`; 

                if (condicao === "maior") {
                    filtros[campo] = { ...filtros[campo], $gte: valor };
                } else if (condicao === "menor") {
                    filtros[campo] = { ...filtros[campo], $lte: valor };
                }
            }
        }
        for (const chave in parametros) {
            if (chave.startsWith("ema")) {
                const [, , tipo, condicao] = chave.split("_"); 
                const periodo = "diario";

                const valor = parseFloat(parametros[chave]);

                const campo = `EMA.${periodo}.${tipo}`; 

                if (condicao === "maior") {
                    filtros[campo] = { ...filtros[campo], $gte: valor };
                } else if (condicao === "menor") {
                    filtros[campo] = { ...filtros[campo], $lte: valor };
                }
            }
        }

        const collection = db.collection("teste_criptomoedas");

        const ativosFiltrados = await collection.find(filtros).toArray();

        //console.log(ativosFiltrados.map(ativo => ativo.nome));

        return ativosFiltrados.map(ativo => ativo.nome);

    } catch (err) {
        console.log("Erro na API: ", err);
        return [];
    }
}

async function pegarNumero(id_usuario) {
    const numero_usuario = await db.collection("usuarios").findOne({_id: new ObjectId(id_usuario)});

    if (!numero_usuario) {
        return "";
    }

    return numero_usuario.num;
}

async function pegarNotificacoes() {
    const notificacoesAtivas = await db.collection("estrategias").find({
        $or: [
          { notificacao: true },
          { id_usuario: "geral" }
        ]
      }).toArray();
      
    //console.log("Estratégias com notificações ativas => ", notificacoesAtivas);

    for (let i = 0; i < notificacoesAtivas.length; i++) {
        const estrategia = notificacoesAtivas[i];
        const resultado_atual = await retornarCriptomoedas(estrategia.string_filtro);


        if (estrategia.resultado_anterior) {
            //comparar resultado

            const criptosParaNotificar = resultado_atual.filter(atual => !estrategia.resultado_anterior.includes(atual));

            console.log("Estratégia: ", estrategia.nome);
            
            // if (!criptosParaNotificar.length > 0) {
            //     console.log("Nenhum cripto a notificar.")
            // } else {
            //     for (let i = 0; i < criptosParaNotificar.length; i++) {
            //         console.log("Enviar notificação sobre => ", criptosParaNotificar[i]);
            //     }
            // }

            console.log(`Essas são as criptomoedas a serem notificadas para a estratégia ${estrategia.nome}`);

            //enviar notificacao

            if (criptosParaNotificar.length > 0) {
                console.log("enviando notificacoes...")
                    const msg = `${criptosParaNotificar}`;

                    if (estrategia.id_usuario === "geral") {   
                        Object.entries(estrategia.notificacoes_usuarios).forEach(async ([id_usuario, notificacaoLigada]) => {
                            if (notificacaoLigada) {
                                const num = await pegarNumero(id_usuario);
                                console.log(`Enviando msg para ${num}. msg = ${msg}`);
                                // await enviarMensagem(num, msg);
                            }
                          });
                          
                    } else {
                        const num = await pegarNumero(estrategia.id_usuario);
                        console.log(`Enviando msg para ${num}. msg = ${msg}`);
                        // await enviarMensagem(num, msg);
                    }
                }
            

        }

        //geral
        await db.collection('estrategias').updateOne(
            { _id: estrategia._id },  // Filtra pelo ID da estratégia
            { $set: { resultado_anterior: resultado_atual } } // Define o novo resultado
        );
        
    }
}


async function main() {
    console.log("iniciando teste...")
    //await test();
    await conectarComBancoDeDados();
    await pegarNotificacoes();
    //await retornarCriptomoedas("?rsi-rapido_diario_14_menor=0&rsi-lento_diario_14_menor=55");
    console.log("teste encerrado.")
}

main();


