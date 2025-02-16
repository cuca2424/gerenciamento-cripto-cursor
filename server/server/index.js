const express = require("express");
const cors = require("cors");
require("dotenv").config()

const app = express();
const port = 3000;

const axios = require("axios");

const { MongoClient, ObjectId } = require("mongodb");
const uri_db_local = "mongodb://localhost:27017/projeto_jean";
const uri_db_nuvem = process.env.MONGO_URI;
const client = new MongoClient(uri_db_nuvem);
let db;

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET = process.env.MEU_SEGREDO;

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


const pegarDadosParaAtualizarBancoDeDados = require("./calculoIndicadores/pegarDadosParaAtualizarBancoDeDados");

async function conectarComBancoDeDados() {
    try {
        await client.connect();
        console.log("conectado ao banco de dados");
        db = client.db("teste");
    } catch(err) {
        console.log("error: ", err);
    }
}

async function atualizarBancoDeDados() {
    const dadosParaAtualizarBandoDeDados = await pegarDadosParaAtualizarBancoDeDados();
    const collection = db.collection("criptomoedas");

    if (dadosParaAtualizarBandoDeDados) {
        await collection.deleteMany({});
        const resultado = await collection.insertMany(dadosParaAtualizarBandoDeDados);
        console.log(`${resultado.insertedCount} valores inseridos ao banco de dados.`)
    } else {
        console.log("Falha ao atualizar dados de criptomoedas.")
    }
}


async function main() {
    await conectarComBancoDeDados();

    // a cada 5 minutos
    await atualizarBancoDeDados();
    console.log("Dados atualizados.");
}

app.use(express.json());
app.use(cors());

app.listen(port, async () => {
    await conectarComBancoDeDados();

    console.log(`API conectada na porta ${port}`)
});

app.get("/criptomoedas", async (req, res) => {
    try {
        const parametros = req.query;

        const filtros = {};

        for (const chave in parametros) {
            if (chave.startsWith("rsi_")) {
                const [, periodo, tipo, condicao] = chave.split("_"); 

                const valor = parseFloat(parametros[chave]);

                const campo = `RSI.${periodo}.${tipo}`; 

                if (condicao === "maior") {
                    filtros[campo] = { ...filtros[campo], $gte: valor };
                } else if (condicao === "menor") {
                    filtros[campo] = { ...filtros[campo], $lte: valor };
                }
            }
        }

        for (const chave in parametros) {
            if (chave.startsWith("ema_")) {
                const [, periodo, tipo, condicao] = chave.split("_");

                const valor = parseFloat(parametros[chave]);

                const campo = `EMA.${periodo}.${tipo}`; 

                if (condicao === "maior") {
                    filtros[campo] = { ...filtros[campo], $gte: valor };
                } else if (condicao === "menor") {
                    filtros[campo] = { ...filtros[campo], $lte: valor }; 
                }
            }
        }

        const collection = db.collection("criptomoedas");

        const ativosFiltrados = await collection.find(filtros).toArray();

        res.send(ativosFiltrados);

    } catch (err) {
        console.log("Erro na API: ", err);
        res.status(500).send("Erro interno na API.")
    }
});

app.get("/criptomoedas/lista", async (req, res) => {
    try {
        // Busca apenas os campos `nome` e `id`
        const dados = await db.collection("criptomoedas").find({}, { projection: { nome: 1, id: 1, _id: 0 } }).toArray();

        // Envia a resposta
        res.status(200).send(dados);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        res.status(500).send({ error: "Erro ao buscar criptomoedas" });
    }
});

app.post("/cadastro", async (req, res) => {
    try {
        const { user, email, password } = req.body;

        if (!user || !email || !password) {
            return res.status(400).send('Dados insuficientes.');   
        }
    
        const usuarioExistente = await db.collection('usuarios').findOne({ email });
    
        if (usuarioExistente) {
            return res.status(400).send('Email já cadastrado.');
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        await db.collection('usuarios').insertOne({
            user,
            email,
            password: hashedPassword, 
        });
    
        res.status(201).send('Usuário cadastrado com sucesso!');
    } catch (err) {
        console.log("Erro na API: ", err);
        res.status(500).send("Erro interno na API.")
    }
    
});

app.post("/login", async (req, res) => {
    try {
        const { email, password, lembrarDeMim } = req.body;

        if (!email || !password) {
            return res.status(400).send('Dados insuficientes.'); 
        }
    
        const user = await db.collection('usuarios').findOne({ email });

        if (!user) {
            return res.status(400).send('Email ou senha inválidos.');
        }
    
        const senhaValida = await bcrypt.compare(password, user.password);
    
        if (!senhaValida) {
            return res.status(400).send('Email ou senha inválidos.');
        }
    
        let tempoDeExpiracao = lembrarDeMim ? "30d" : "1d";
    
        const token = jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: tempoDeExpiracao });
    
        res.status(200).json({ token });

    } catch (err) {
        console.log("Erro na API: ", err);
        res.status(500).send("Erro interno na API.")
    }
})


// Pegar carteiras com id do usuário - Não estou usando
app.get("/carteira/:id_usuario", async (req, res) => {
    try {
        const id_usuario = req.params.id_usuario;

        const user = await db.collection('usuarios').findOne({ _id: new ObjectId(id_usuario)});
    
        if (!user) {
            return res.status(400).send('ID de usuário não válido.');  
        }
    
        const carteiras = await db.collection('carteiras').find({ id_usuario: id_usuario }).toArray();
    
        res.status(201).json(carteiras);

    } catch (err) {
        console.log("Erro na API: ", err);
        res.status(500).send("Erro interno na API.")
    }
    
})

// Postar carteira com id do usuário + nome
app.post("/carteira", async (req, res) => {
    try {
        const {id_usuario, nome} = req.body;

        const usuario = await db.collection('usuarios').findOne({ _id: new ObjectId(id_usuario)});
    
        if (!usuario) {
            return res.status(400).send('ID de usuário não válido.');
        }
    
        if (!nome) {
            return res.status(400).send("Insira o nome da carteira.");
        }

        if (nome.length > 30) {
            return res.status(400).send("O nome da carteira não deve ultrapassar 30 caracteres.")
        }
  
        const carteiraExistente = await db.collection('carteiras').findOne({ id_usuario: id_usuario, nome: nome })
    
        if (carteiraExistente) {
            return res.status(400).send("Já existe uma carteira com esse nome.")
        }

        const carteirasDoUsuario = await db.collection('carteiras').find({ id_usuario: id_usuario }).toArray();

        if (carteirasDoUsuario.length >= 3) {
            return res.status(400).send("Você já alcançou o limite de 3 carteiras.")
        }
    
        await db.collection('carteiras').insertOne({
            id_usuario: id_usuario,
            nome: nome
        });
    
        res.status(201).send('Carteira cadastrada com sucesso!');
    } catch (err) {
        console.log("Erro na API: ", err);
        res.status(500).send("Erro interno na API.")
    }
});

app.post("/carteira/excluir", async (req, res) => {
    try {
        const { id_carteira } = req.body;
        console.log("ID da carteira recebido:", id_carteira);
        const collection = db.collection("carteiras");
    
        const carteira = await collection.findOne({ _id: new ObjectId(id_carteira)});
    
        if (!carteira) {
            res.status(400).send("ID inválido.");
        } else {
          db.collection("carteiras").deleteOne({ _id: new ObjectId(id_carteira)});           
          res.status(200).send("excluida com sucesso.");
        }

    } catch (err) {
        res.status(400).send("Erro interno.");
        console.log(err)
    }    
});

app.post("/aporte/excluir", async (req, res) => {
    try {
        const { id_aporte } = req.body;
        const collection = db.collection("aportes");
        console.log("aporte: ", id_aporte)
    
        const aporte = await collection.findOne({_id: new ObjectId(id_aporte)});
    
        if (!aporte) {
            res.status(400).send("ID inválido");
        } else {
            collection.deleteOne({_id: new ObjectId(id_aporte)});
            res.status(200).send("excluido com sucesso.")
        }
    } catch (err) {
        res.status(400).send("Erro interno.");
        console.log(err);
    }
    
})

// pegar aportes com id da carteira - Não estou usando
app.get("/aporte/:id_carteira", async (req, res) => {
    try {
        const id_carteira = req.params.id_carteira;

        const carteira = await db.collection('carteiras').findOne({ _id: new ObjectId(id_carteira)});
    
        if (!carteira) {
            return res.status(400).send("ID de carteira não válido.")
        }
    
        const aportes = await db.collection('aportes').find({id_carteira: id_carteira}).toArray();
    
        res.status(201).json(aportes)
    } catch (err) {
        console.log("Erro na API: ", err);
        res.status(500).send("Erro interno na API.")
    }

})

// postar aporte com id da carteira + criptomoeda + preco + quantidade
app.post("/aporte", async (req, res) => {
    try {
        const {id_carteira, criptomoeda, preco, quantidade} = req.body;

        if (!id_carteira || !criptomoeda || !preco || !quantidade) {
            return res.status(400).send("Preencha todos os campos para continuar.") 
        }

        const carteira = await db.collection('carteiras').findOne({ _id: new ObjectId(id_carteira)});
    
        if (!carteira) {
            return res.status(400).send("ID de carteira não válido.")
        }
    
        

        if (preco < 0) {
            return res.status(400).send("Preço inválido.")
        }

        if (quantidade < 0) {
            return res.status(400).send("Quantidade inválida.")
        }

        const precoPago = parseFloat(preco) * parseFloat(quantidade);
    
        await db.collection('aportes').insertOne({
            id_carteira: new ObjectId(id_carteira),
            criptomoeda: criptomoeda,
            preco: parseFloat(preco),
            quantidade: quantidade,
            precoPago: precoPago,
            data: new Date()
        });
    
        res.status(201).send('Aporte cadastrado com sucesso!');

    } catch (err) {
        console.log("Erro na API: ", err);
        res.status(500).send("Erro interno na API.")
    }
    
})

// Pegar bloco completo de dados
app.get("/carteiras-detalhadas/:id_usuario", async (req, res) => {
    try {
      const id_usuario = req.params.id_usuario;
  
      const carteiras = await db.collection("carteiras").find({ id_usuario: id_usuario }).toArray();
  
      const dados = await db.collection("criptomoedas").find().toArray();

      const mapaDados = dados.reduce((acc, preco) => {
        acc[preco.id] = {"preco": preco.precoAtual, "imagem": preco.imagem, "nome": preco.nome};
        return acc
      }, {});

      const carteirasComDetalhes = await Promise.all(
        carteiras.map(async (carteira) => {
          const aportes = await db.collection("aportes").find({ id_carteira: carteira._id }).toArray();

          const totalAportesCarteira = aportes.reduce((crr, aporte) => crr + parseFloat(aporte.preco * aporte.quantidade), 0);
   
          // Agrupa os ativos e calcula o valor total
          const ativos = aportes.reduce((acc, aporte) => {
            const { criptomoeda, preco, quantidade } = aporte;

            if (!acc[criptomoeda]) {
                acc[criptomoeda] = {
                    "imagem": mapaDados[criptomoeda]["imagem"] || "",
                    "id": criptomoeda,
                    "nome": mapaDados[criptomoeda]["nome"] || "",
                    "precoAtual": mapaDados[criptomoeda]["preco"] || "",
                    "quantidadeTotal": 0,
                    "aporteTotal": 0
                }
            }

            acc[criptomoeda].quantidadeTotal += parseFloat(quantidade);
            acc[criptomoeda].aporteTotal += (parseFloat(quantidade) * preco)
            return acc;
          }, {});

          const resultado = Object.entries(ativos).map(([ativo, dado]) => {
            const { imagem, id, nome, aporteTotal, quantidadeTotal, precoAtual} = dado;

            const saldoTotal = quantidadeTotal * precoAtual;

            const lucroTotal = {
                "nominal": saldoTotal - aporteTotal,
                "porcentual": (saldoTotal / aporteTotal - 1) * 100
            }

            const precoMedio = aporteTotal / quantidadeTotal;

            return {
                imagem,
                nome,
                id,
                precoAtual,
                quantidadeTotal,
                precoMedio,
                saldoTotal,
                aporteTotal,
                lucroTotal
            }
          })

          const valorTotalCarteira = Object.values(ativos).reduce((total, ativo) => {
            return total + ativo.quantidadeTotal * ativo.precoAtual;
          }, 0);

          const lucroOuPrejuizo = {
            nominal: valorTotalCarteira - totalAportesCarteira,
            porcentual: (valorTotalCarteira / totalAportesCarteira - 1) * 100  
          }
  
          return { ...carteira, resultado, valorTotalCarteira, totalAportesCarteira, lucroOuPrejuizo, aportes };
        })
      );

      const dadosTotais = carteirasComDetalhes.reduce((acc, carteira) => {
        acc.saldo += carteira.valorTotalCarteira;
        acc.aportes += carteira.totalAportesCarteira;
  
        acc.lucro.nominal += carteira.lucroOuPrejuizo.nominal;
 
        return acc;
      }, {
        aportes: 0,
        saldo: 0,
        lucro: { nominal: 0, porcentual: 0 }
      });

    if (dadosTotais.saldo > 0) {
        dadosTotais.lucro.porcentual = (dadosTotais.saldo / dadosTotais.aportes - 1) * 100;
    }

    const resultadoGeral = carteirasComDetalhes.reduce((acc, carteira) => {
        carteira.resultado.forEach((item) => {
            // Verifica se a criptomoeda já foi adicionada
            const existente = acc.find((crypto) => crypto.nome === item.nome);
            if (existente) {
                // Se já existir, adiciona a quantidade
                existente.saldoTotal += item.saldoTotal;
            } else {
                // Caso contrário, adiciona uma nova criptomoeda
                acc.push({ nome: item.nome, saldoTotal: item.saldoTotal });
            }
        });
        return acc;
    }, []);
  
      res.status(200).json({carteirasComDetalhes, dadosTotais, resultadoGeral});

    } catch (error) {
      console.error("Erro ao buscar carteiras detalhadas:", error);
      res.status(500).send("Erro ao buscar carteiras detalhadas.");
    }
});

app.post("/criar-sessao-checkout", async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price: 'price_1Qk7w1K70MP6dcZDSjMxptCi', // price id do produto
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `http://localhost:3001/sucesso`, 
          cancel_url: `http://localhost:3001/cancelado`, 
          metadata: {
            nome: nome,
            email: email,
            senha: senha,
          },
        });

    
        res.json({ sessionId: session.id });

    } catch (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        res.status(500).send('Erro ao criar sessão de checkout');
    }

});

app.post('/webhook', (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {

      console.error('Erro na assinatura do webhook', err);
      return res.status(400).send('Erro na assinatura do webhook');
    }
  
    // checkout concluido
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
  
      // verifica se foi pago
      if (session.payment_status === 'paid') {
        
        const user = {
          nome: session.metadata.nome,
          email: session.metadata.email,
          senha: session.metadata.senha,
        };
  
        db.collection('usuarios').insertOne(user, (err, result) => {
          if (err) {
            console.error('Erro ao registrar usuário:', err);
          } else {
            console.log('Usuário registrado com sucesso!', result);
          }
        });
      }
    }
  
    res.json({ received: true });
});

app.get("/test3", (req, res) => {
    let result = [];
    for (let page = 1; page <= 4; page++) {
        setInterval(() => {
            const dataPage = axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}`);

            if (dataPage.ok) {
                result = result.concat(dataPage.data);
            }
        }, 2000)
    }
    res.status(400).send(result);
});

app.get("/test2", async (req, res) => {
    const allCryptos = [];
    const perPage = 250; 
    const totalPages = 4;

    try {
        for (let page = 1; page <= totalPages; page++) {
            const response = await axios.get(
                `https://api.coingecko.com/api/v3/coins/markets`, 
                {
                    params: {
                        vs_currency: "usd", 
                        order: "market_cap_desc", 
                        per_page: perPage, 
                        page: page
                    }
                }
            );
            allCryptos.push(...response.data);
        }

        res.status(200).send(allCryptos);
    } catch (err) {
        console.log("Erro ao buscar dados: ", err);
        res.status(400).send([])
    }
})

app.get("/maiores_variacoes", async (req, res) => {
    const criptomoedas = await db.collection("criptomoedas").find().toArray() || []; 
    
    criptomoedas.sort((a, b) => b.variacao24h - a.variacao24h); 

    const maioresGanhos = criptomoedas.slice(0, 5); 
    const maioresPerdas = criptomoedas.slice(-5).reverse();

    res.status(200).send({maioresGanhos, maioresPerdas});
});
