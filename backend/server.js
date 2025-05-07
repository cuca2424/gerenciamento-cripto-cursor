require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const carteiraRoutes = require('./routes/carteira.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const historicoRoutes = require('./routes/historico.routes');
const graficosRoutes = require('./routes/graficos.routes');
const authRoutes = require('./routes/auth.routes');
const criptoRoutes = require('./routes/cripto.routes');
const checkoutRoutes = require('./routes/checkout.routes');
const authMiddleware = require('./middleware/auth.middleware');
const mercadoRoutes = require('./routes/mercado.routes');
const webhookRoutes = require('./routes/webhook.routes');
const impostoRoutes = require('./routes/imposto.routes');
const webhookController = require('./controllers/webhook.controller');
const estrategiaRoutes = require('./routes/estrategia.routes');
const adminRoutes = require('./routes/admin.routes');
const Scheduler = require('./jobs/scheduler');
const jobs = require('./jobs/jobs');

const app = express();
const PORT = process.env.PORT || 5000;

const MONGODB_URI = "mongodb+srv://adorno:f2q39KH5al6BNU2s@projeto-jean-deploy.okctz.mongodb.net/";
const MONGO_DB = "FazendoProjetoComIA";
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cryptomanager';

// MongoDB Connection
let db;

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(MONGO_DB);
    
    // Inicializar dados se necessário
    await initializeData(db);
    
    // Inicializar e iniciar o scheduler
    const scheduler = new Scheduler(db);
    
    // Registrar jobs
    Object.entries(jobs).forEach(([name, task]) => {
      scheduler.addJob(name, task);
    });
    
    // Iniciar o scheduler
    // scheduler.start();
    
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}

// Inicialização de dados
async function initializeData(db) {
  if (!(await db.listCollections({ name: 'usuarios' }).hasNext())) {
    await db.createCollection('usuarios');
    console.log('Usuarios collection created');
  }
  
  if (!(await db.listCollections({ name: 'carteiras' }).hasNext())) {
    await db.createCollection('carteiras');
    console.log('Carteiras collection created');
  }
  
  if (!(await db.listCollections({ name: 'historico' }).hasNext())) {
    await db.createCollection('historico');
    console.log('Historico collection created');
  }

  if (!(await db.listCollections({ name: 'estrategias' }).hasNext())) {
    await db.createCollection('estrategias');
    console.log('Estrategias collection created');
  }
  
  if (!(await db.listCollections({ name: 'criptomoedas_teste' }).hasNext())) {
    await db.createCollection('criptomoedas_teste');
    console.log('Criptomoedas_teste collection created');
    
    // Inicializar com algumas criptomoedas populares
    const generateRandomPrice = (min, max) => {
      return (Math.random() * (max - min) + min).toFixed(2);
    };

    const generateIndicators = () => {
      const generateRSI = () => {
        return {
          lento: {
            '4h': {
              periodo7: [(Math.random() * 30 + 35).toFixed(1), (Math.random() * 30 + 35).toFixed(1)],
              periodo14: [(Math.random() * 30 + 40).toFixed(1), (Math.random() * 30 + 40).toFixed(1)]
            },
            diario: {
              periodo7: [(Math.random() * 30 + 40).toFixed(1), (Math.random() * 30 + 40).toFixed(1)],
              periodo14: [(Math.random() * 30 + 45).toFixed(1), (Math.random() * 30 + 45).toFixed(1)]
            },
            semanal: {
              periodo7: [(Math.random() * 30 + 45).toFixed(1), (Math.random() * 30 + 45).toFixed(1)],
              periodo14: [(Math.random() * 30 + 50).toFixed(1), (Math.random() * 30 + 50).toFixed(1)]
            },
            mensal: {
              periodo7: [(Math.random() * 30 + 50).toFixed(1), (Math.random() * 30 + 50).toFixed(1)],
              periodo14: [(Math.random() * 30 + 55).toFixed(1), (Math.random() * 30 + 55).toFixed(1)]
            }
          },
          rapido: {
            '4h': {
              periodo7: [(Math.random() * 30 + 30).toFixed(1), (Math.random() * 30 + 30).toFixed(1)],
              periodo14: [(Math.random() * 30 + 35).toFixed(1), (Math.random() * 30 + 35).toFixed(1)]
            },
            diario: {
              periodo7: [(Math.random() * 30 + 35).toFixed(1), (Math.random() * 30 + 35).toFixed(1)],
              periodo14: [(Math.random() * 30 + 40).toFixed(1), (Math.random() * 30 + 40).toFixed(1)]
            },
            semanal: {
              periodo7: [(Math.random() * 30 + 40).toFixed(1), (Math.random() * 30 + 40).toFixed(1)],
              periodo14: [(Math.random() * 30 + 45).toFixed(1), (Math.random() * 30 + 45).toFixed(1)]
            },
            mensal: {
              periodo7: [(Math.random() * 30 + 45).toFixed(1), (Math.random() * 30 + 45).toFixed(1)],
              periodo14: [(Math.random() * 30 + 50).toFixed(1), (Math.random() * 30 + 50).toFixed(1)]
            }
          }
        };
      };

      const generateEstocastico = () => {
        return {
          lento: {
            '4h': {
              periodo7: [(Math.random() * 30 + 35).toFixed(1), (Math.random() * 30 + 35).toFixed(1)],
              periodo14: [(Math.random() * 30 + 40).toFixed(1), (Math.random() * 30 + 40).toFixed(1)]
            },
            diario: {
              periodo7: [(Math.random() * 30 + 40).toFixed(1), (Math.random() * 30 + 40).toFixed(1)],
              periodo14: [(Math.random() * 30 + 45).toFixed(1), (Math.random() * 30 + 45).toFixed(1)]
            },
            semanal: {
              periodo7: [(Math.random() * 30 + 45).toFixed(1), (Math.random() * 30 + 45).toFixed(1)],
              periodo14: [(Math.random() * 30 + 50).toFixed(1), (Math.random() * 30 + 50).toFixed(1)]
            },
            mensal: {
              periodo7: [(Math.random() * 30 + 50).toFixed(1), (Math.random() * 30 + 50).toFixed(1)],
              periodo14: [(Math.random() * 30 + 55).toFixed(1), (Math.random() * 30 + 55).toFixed(1)]
            }
          },
          rapido: {
            '4h': {
              periodo7: [(Math.random() * 30 + 30).toFixed(1), (Math.random() * 30 + 30).toFixed(1)],
              periodo14: [(Math.random() * 30 + 35).toFixed(1), (Math.random() * 30 + 35).toFixed(1)]
            },
            diario: {
              periodo7: [(Math.random() * 30 + 35).toFixed(1), (Math.random() * 30 + 35).toFixed(1)],
              periodo14: [(Math.random() * 30 + 40).toFixed(1), (Math.random() * 30 + 40).toFixed(1)]
            },
            semanal: {
              periodo7: [(Math.random() * 30 + 40).toFixed(1), (Math.random() * 30 + 40).toFixed(1)],
              periodo14: [(Math.random() * 30 + 45).toFixed(1), (Math.random() * 30 + 45).toFixed(1)]
            },
            mensal: {
              periodo7: [(Math.random() * 30 + 45).toFixed(1), (Math.random() * 30 + 45).toFixed(1)],
              periodo14: [(Math.random() * 30 + 50).toFixed(1), (Math.random() * 30 + 50).toFixed(1)]
            }
          }
        };
      };

      const generateMACD = () => {
        return {
          lento: {
            '4h': {
              periodo7: [(Math.random() * 0.2 - 0.1).toFixed(4), (Math.random() * 0.2 - 0.1).toFixed(4)],
              periodo14: [(Math.random() * 0.2 - 0.1).toFixed(4), (Math.random() * 0.2 - 0.1).toFixed(4)]
            },
            diario: {
              periodo7: [(Math.random() * 0.2 - 0.1).toFixed(4), (Math.random() * 0.2 - 0.1).toFixed(4)],
              periodo14: [(Math.random() * 0.2 - 0.1).toFixed(4), (Math.random() * 0.2 - 0.1).toFixed(4)]
            },
            semanal: {
              periodo7: [(Math.random() * 0.2 - 0.1).toFixed(4), (Math.random() * 0.2 - 0.1).toFixed(4)],
              periodo14: [(Math.random() * 0.2 - 0.1).toFixed(4), (Math.random() * 0.2 - 0.1).toFixed(4)]
            },
            mensal: {
              periodo7: [(Math.random() * 0.2 - 0.1).toFixed(4), (Math.random() * 0.2 - 0.1).toFixed(4)],
              periodo14: [(Math.random() * 0.2 - 0.1).toFixed(4), (Math.random() * 0.2 - 0.1).toFixed(4)]
            }
          },
          rapido: {
            '4h': {
              periodo7: [(Math.random() * 0.3 - 0.15).toFixed(4), (Math.random() * 0.3 - 0.15).toFixed(4)],
              periodo14: [(Math.random() * 0.3 - 0.15).toFixed(4), (Math.random() * 0.3 - 0.15).toFixed(4)]
            },
            diario: {
              periodo7: [(Math.random() * 0.3 - 0.15).toFixed(4), (Math.random() * 0.3 - 0.15).toFixed(4)],
              periodo14: [(Math.random() * 0.3 - 0.15).toFixed(4), (Math.random() * 0.3 - 0.15).toFixed(4)]
            },
            semanal: {
              periodo7: [(Math.random() * 0.3 - 0.15).toFixed(4), (Math.random() * 0.3 - 0.15).toFixed(4)],
              periodo14: [(Math.random() * 0.3 - 0.15).toFixed(4), (Math.random() * 0.3 - 0.15).toFixed(4)]
            },
            mensal: {
              periodo7: [(Math.random() * 0.3 - 0.15).toFixed(4), (Math.random() * 0.3 - 0.15).toFixed(4)],
              periodo14: [(Math.random() * 0.3 - 0.15).toFixed(4), (Math.random() * 0.3 - 0.15).toFixed(4)]
            }
          }
        };
      };

      const generateEMA = (basePrice, dollarPrice = 5) => {
        const generatePeriodValues = (price, multipliers) => {
          return {
            periodo20: [(price * (1 + Math.random() * multipliers.p20)).toFixed(2), (price * (1 + Math.random() * multipliers.p20)).toFixed(2)],
            periodo50: [(price * (1 + Math.random() * multipliers.p50)).toFixed(2), (price * (1 + Math.random() * multipliers.p50)).toFixed(2)],
            periodo100: [(price * (1 + Math.random() * multipliers.p100)).toFixed(2), (price * (1 + Math.random() * multipliers.p100)).toFixed(2)]
          };
        };

        const multipliers = {
          '4h': { p20: 0.15, p50: 0.1, p100: 0.05 },
          diario: { p20: 0.1, p50: 0.05, p100: -0.05 },
          semanal: { p20: 0.05, p50: 0.02, p100: -0.02 },
          mensal: { p20: 0.02, p50: -0.02, p100: -0.05 }
        };

        // Generate values in BRL
        const brlValues = {
          '4h': generatePeriodValues(basePrice, multipliers['4h']),
          diario: generatePeriodValues(basePrice, multipliers.diario),
          semanal: generatePeriodValues(basePrice, multipliers.semanal),
          mensal: generatePeriodValues(basePrice, multipliers.mensal)
        };

        // Generate values in USD
        const basePriceUSD = basePrice / dollarPrice;
        const usdValues = {
          '4h': generatePeriodValues(basePriceUSD, multipliers['4h']),
          diario: generatePeriodValues(basePriceUSD, multipliers.diario),
          semanal: generatePeriodValues(basePriceUSD, multipliers.semanal),
          mensal: generatePeriodValues(basePriceUSD, multipliers.mensal)
        };

        return {
          brl: brlValues,
          usd: usdValues
        };
      };

      return {
        rsi: generateRSI(),
        estocastico: generateEstocastico(),
        ema: generateEMA(60000), // Usando 60000 como preço base para o BTC
        macd: generateMACD()
      };
    };

    const defaultCryptos = [
      {
        nome: 'Bitcoin',
        simbolo: 'BTC',
        precoAtual: generateRandomPrice(60000, 70000),
        precoAtualReal: (parseFloat(generateRandomPrice(60000, 70000)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(20000000000, 30000000000),
        volume24hReal: (parseFloat(generateRandomPrice(20000000000, 30000000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(1000000000000, 1200000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(1000000000000, 1200000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Ethereum',
        simbolo: 'ETH',
        precoAtual: generateRandomPrice(3000, 4000),
        precoAtualReal: (parseFloat(generateRandomPrice(3000, 4000)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(10000000000, 15000000000),
        volume24hReal: (parseFloat(generateRandomPrice(10000000000, 15000000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(300000000000, 400000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(300000000000, 400000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Binance Coin',
        simbolo: 'BNB',
        precoAtual: generateRandomPrice(500, 600),
        precoAtualReal: (parseFloat(generateRandomPrice(500, 600)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(2000000000, 3000000000),
        volume24hReal: (parseFloat(generateRandomPrice(2000000000, 3000000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(80000000000, 90000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(80000000000, 90000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Solana',
        simbolo: 'SOL',
        precoAtual: generateRandomPrice(100, 200),
        precoAtualReal: (parseFloat(generateRandomPrice(100, 200)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(1000000000, 2000000000),
        volume24hReal: (parseFloat(generateRandomPrice(1000000000, 2000000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(30000000000, 40000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(30000000000, 40000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Cardano',
        simbolo: 'ADA',
        precoAtual: generateRandomPrice(0.5, 1),
        precoAtualReal: (parseFloat(generateRandomPrice(0.5, 1)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(500000000, 1000000000),
        volume24hReal: (parseFloat(generateRandomPrice(500000000, 1000000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(15000000000, 20000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(15000000000, 20000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Polkadot',
        simbolo: 'DOT',
        precoAtual: generateRandomPrice(6, 8),
        precoAtualReal: (parseFloat(generateRandomPrice(6, 8)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(300000000, 400000000),
        volume24hReal: (parseFloat(generateRandomPrice(300000000, 400000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(8000000000, 10000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(8000000000, 10000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Avalanche',
        simbolo: 'AVAX',
        precoAtual: generateRandomPrice(30, 40),
        precoAtualReal: (parseFloat(generateRandomPrice(30, 40)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(700000000, 800000000),
        volume24hReal: (parseFloat(generateRandomPrice(700000000, 800000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(12000000000, 14000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(12000000000, 14000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Ripple',
        simbolo: 'XRP',
        precoAtual: generateRandomPrice(0.5, 0.6),
        precoAtualReal: (parseFloat(generateRandomPrice(0.5, 0.6)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(1000000000, 1300000000),
        volume24hReal: (parseFloat(generateRandomPrice(1000000000, 1300000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(30000000000, 32000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(30000000000, 32000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Polygon',
        simbolo: 'MATIC',
        precoAtual: generateRandomPrice(0.6, 0.7),
        precoAtualReal: (parseFloat(generateRandomPrice(0.6, 0.7)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(300000000, 400000000),
        volume24hReal: (parseFloat(generateRandomPrice(300000000, 400000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(6000000000, 8000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(6000000000, 8000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Aave',
        simbolo: 'AAVE',
        precoAtual: generateRandomPrice(90, 100),
        precoAtualReal: (parseFloat(generateRandomPrice(90, 100)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(100000000, 150000000),
        volume24hReal: (parseFloat(generateRandomPrice(100000000, 150000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(1300000000, 1500000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(1300000000, 1500000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Uniswap',
        simbolo: 'UNI',
        precoAtual: generateRandomPrice(7, 8),
        precoAtualReal: (parseFloat(generateRandomPrice(7, 8)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(200000000, 300000000),
        volume24hReal: (parseFloat(generateRandomPrice(200000000, 300000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(5000000000, 6000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(5000000000, 6000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Cosmos',
        simbolo: 'ATOM',
        precoAtual: generateRandomPrice(8, 9),
        precoAtualReal: (parseFloat(generateRandomPrice(8, 9)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(200000000, 300000000),
        volume24hReal: (parseFloat(generateRandomPrice(200000000, 300000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(3000000000, 3500000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(3000000000, 3500000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Algorand',
        simbolo: 'ALGO',
        precoAtual: generateRandomPrice(0.15, 0.2),
        precoAtualReal: (parseFloat(generateRandomPrice(0.15, 0.2)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(100000000, 150000000),
        volume24hReal: (parseFloat(generateRandomPrice(100000000, 150000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(1300000000, 1500000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(1300000000, 1500000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Filecoin',
        simbolo: 'FIL',
        precoAtual: generateRandomPrice(5, 6),
        precoAtualReal: (parseFloat(generateRandomPrice(5, 6)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(300000000, 400000000),
        volume24hReal: (parseFloat(generateRandomPrice(300000000, 400000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(2500000000, 3000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(2500000000, 3000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Internet Computer',
        simbolo: 'ICP',
        precoAtual: generateRandomPrice(12, 13),
        precoAtualReal: (parseFloat(generateRandomPrice(12, 13)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(600000000, 700000000),
        volume24hReal: (parseFloat(generateRandomPrice(600000000, 700000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(5500000000, 6000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(5500000000, 6000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'The Graph',
        simbolo: 'GRT',
        precoAtual: generateRandomPrice(0.2, 0.25),
        precoAtualReal: (parseFloat(generateRandomPrice(0.2, 0.25)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(150000000, 200000000),
        volume24hReal: (parseFloat(generateRandomPrice(150000000, 200000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(2000000000, 2200000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(2000000000, 2200000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'NEAR Protocol',
        simbolo: 'NEAR',
        precoAtual: generateRandomPrice(4.5, 5),
        precoAtualReal: (parseFloat(generateRandomPrice(4.5, 5)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(400000000, 500000000),
        volume24hReal: (parseFloat(generateRandomPrice(400000000, 500000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(5000000000, 5500000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(5000000000, 5500000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Fantom',
        simbolo: 'FTM',
        precoAtual: generateRandomPrice(0.7, 0.8),
        precoAtualReal: (parseFloat(generateRandomPrice(0.7, 0.8)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(300000000, 400000000),
        volume24hReal: (parseFloat(generateRandomPrice(300000000, 400000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(2000000000, 2200000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(2000000000, 2200000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Hedera',
        simbolo: 'HBAR',
        precoAtual: generateRandomPrice(0.09, 0.11),
        precoAtualReal: (parseFloat(generateRandomPrice(0.09, 0.11)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(150000000, 200000000),
        volume24hReal: (parseFloat(generateRandomPrice(150000000, 200000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(3000000000, 3500000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(3000000000, 3500000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Litecoin',
        simbolo: 'LTC',
        precoAtual: generateRandomPrice(70, 80),
        precoAtualReal: (parseFloat(generateRandomPrice(70, 80)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(300000000, 400000000),
        volume24hReal: (parseFloat(generateRandomPrice(300000000, 400000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(5000000000, 6000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(5000000000, 6000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Chainlink',
        simbolo: 'LINK',
        precoAtual: generateRandomPrice(13, 14),
        precoAtualReal: (parseFloat(generateRandomPrice(13, 14)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(500000000, 700000000),
        volume24hReal: (parseFloat(generateRandomPrice(500000000, 700000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(8000000000, 8500000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(8000000000, 8500000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Shiba Inu',
        simbolo: 'SHIB',
        precoAtual: generateRandomPrice(0.00002, 0.00003),
        precoAtualReal: (parseFloat(generateRandomPrice(0.00002, 0.00003)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(800000000, 1000000000),
        volume24hReal: (parseFloat(generateRandomPrice(800000000, 1000000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(11000000000, 13000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(11000000000, 13000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Tron',
        simbolo: 'TRX',
        precoAtual: generateRandomPrice(0.11, 0.13),
        precoAtualReal: (parseFloat(generateRandomPrice(0.11, 0.13)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(700000000, 800000000),
        volume24hReal: (parseFloat(generateRandomPrice(700000000, 800000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(10000000000, 11000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(10000000000, 11000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Stellar',
        simbolo: 'XLM',
        precoAtual: generateRandomPrice(0.1, 0.12),
        precoAtualReal: (parseFloat(generateRandomPrice(0.1, 0.12)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(200000000, 300000000),
        volume24hReal: (parseFloat(generateRandomPrice(200000000, 300000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(3000000000, 3200000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(3000000000, 3200000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'VeChain',
        simbolo: 'VET',
        precoAtual: generateRandomPrice(0.02, 0.03),
        precoAtualReal: (parseFloat(generateRandomPrice(0.02, 0.03)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(100000000, 150000000),
        volume24hReal: (parseFloat(generateRandomPrice(100000000, 150000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(1700000000, 1900000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(1700000000, 1900000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Dogecoin',
        simbolo: 'DOGE',
        precoAtual: generateRandomPrice(0.11, 0.13),
        precoAtualReal: (parseFloat(generateRandomPrice(0.11, 0.13)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(1400000000, 1600000000),
        volume24hReal: (parseFloat(generateRandomPrice(1400000000, 1600000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(16000000000, 17000000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(16000000000, 17000000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Apecoin',
        simbolo: 'APE',
        precoAtual: generateRandomPrice(1.2, 1.3),
        precoAtualReal: (parseFloat(generateRandomPrice(1.2, 1.3)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(200000000, 250000000),
        volume24hReal: (parseFloat(generateRandomPrice(200000000, 250000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(700000000, 800000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(700000000, 800000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      },
      {
        nome: 'Decentraland',
        simbolo: 'MANA',
        precoAtual: generateRandomPrice(0.35, 0.45),
        precoAtualReal: (parseFloat(generateRandomPrice(0.35, 0.45)) * 5).toFixed(2),
        variacao24h: generateRandomPrice(-5, 5),
        volume24h: generateRandomPrice(150000000, 200000000),
        volume24hReal: (parseFloat(generateRandomPrice(150000000, 200000000)) * 5).toFixed(2),
        capitalizacao: generateRandomPrice(800000000, 900000000),
        capitalizacaoReal: (parseFloat(generateRandomPrice(800000000, 900000000)) * 5).toFixed(2),
        indicadores: generateIndicators()
      }
    ];
    
    await db.collection('criptomoedas_teste').insertMany(defaultCryptos);
    console.log('Criptomoedas initialized with default values');

    // Inicializar coleção de preços históricos
    if (!(await db.listCollections({ name: 'precos_teste' }).hasNext())) {
      await db.createCollection('precos_teste');
      console.log('Precos_teste collection created');

      // Buscar todas as criptomoedas
      const cryptos = await db.collection('criptomoedas_teste').find({}).toArray();
      
      // Gerar preços históricos para cada criptomoeda
      for (const crypto of cryptos) {
        const precos = [];
        const now = new Date();
        
        // Gerar 300 preços históricos (1 por dia)
        for (let i = 0; i < 300; i++) {
          const data = new Date(now);
          data.setDate(data.getDate() - i);
          
          // Gerar preço baseado no preço atual da cripto
          const precoBase = parseFloat(crypto.precoAtual);
          const variacao = (Math.random() * 0.2 - 0.1); // Variação de -10% a +10%
          const preco = precoBase * (1 + variacao);
          
          precos.push({
            data: data,
            preco: parseFloat(preco.toFixed(2))
          });
        }
        
        // Inserir documento de preços para a criptomoeda
        await db.collection('precos_teste').insertOne({
          _id: new ObjectId(),
          simbolo: crypto.simbolo,
          nome: crypto.nome,
          precos: precos
        });
      }
      
      console.log('Preços históricos gerados para todas as criptomoedas');
    }
  }
  
  // Inicializar coleção de informações de mercado
  if (!(await db.listCollections({ name: 'mercado' }).hasNext())) {
    await db.createCollection('mercado');
    console.log('Mercado collection created');
    
    // Dados iniciais de mercado
    const mercadoData = {
      indiceMedoGanancia: {
        valor: 65,
        classificacao: 'Ganância', // Pode ser: "Medo Extremo", "Medo", "Neutro", "Ganância", "Ganância Extrema"
        ultimaAtualizacao: new Date()
      },
      altcoinSeason: {
        valor: 45, // De 0 a 100, onde 100 é season total
        status: 'Neutral', // Pode ser: "Bitcoin Season", "Neutral", "Altcoin Season"
        ultimaAtualizacao: new Date()
      },
      dominanciaBTC: {
        valor: 52.3, // Porcentagem do marketcap total
        tendencia: 'Estável', // Pode ser: "Crescendo", "Estável", "Diminuindo"
        ultimaAtualizacao: new Date()
      }
    };
    
    await db.collection('mercado').insertOne(mercadoData);
    console.log('Mercado data initialized with default values');
  }

  // Inicializar coleção de cotação do dólar
  if (!(await db.listCollections({ name: 'cotacao_dolar' }).hasNext())) {
    await db.createCollection('cotacao_dolar');
    console.log('Cotacao_dolar collection created');
    
    // Dados iniciais da cotação do dólar
    const cotacaoDolarData = {
      valor: 4.95, // Valor inicial do dólar em reais
      variacao24h: 0.15, // Variação percentual nas últimas 24h
      ultimaAtualizacao: new Date(),
      historico: [
        {
          data: new Date(),
          valor: 4.95,
          variacao: 0.15
        }
      ]
    };
    
    await db.collection('cotacao_dolar').insertOne(cotacaoDolarData);
    console.log('Cotacao do dolar initialized with default values');
  }
}

// Make DB available to routes
app.use((req, res, next) => {
  req.db = db;
  req.ObjectId = ObjectId;
  next();
});

// Rota do webhook (após ter acesso ao db, mas antes dos outros middlewares)
app.post('/webhook', express.raw({type: 'application/json'}), webhookController.handleWebhook);

// Middleware gerais
app.use(cors());
app.use(express.json());

// Public Routes
app.use('/auth', authRoutes);
app.use('/checkout', checkoutRoutes);

// Protected Routes (require authentication)
app.use('/carteira', authMiddleware, carteiraRoutes);
app.use('/usuario', authMiddleware, usuarioRoutes);
app.use('/historico', authMiddleware, historicoRoutes);
app.use('/graficos', authMiddleware, graficosRoutes);
app.use('/cripto', authMiddleware, criptoRoutes);
app.use('/mercado', authMiddleware, mercadoRoutes);
app.use('/estrategia', authMiddleware, estrategiaRoutes);
app.use('/imposto', authMiddleware, impostoRoutes);
app.use('/admin', authMiddleware, adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'API do Gerenciador de Carteiras de Criptomoedas' });
});

// Start server
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(console.error);

module.exports = app;
