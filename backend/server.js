const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const carteiraRoutes = require('./routes/carteira.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const historicoRoutes = require('./routes/historico.routes');
const graficosRoutes = require('./routes/graficos.routes');
const authRoutes = require('./routes/auth.routes');
const criptoRoutes = require('./routes/cripto.routes');
const authMiddleware = require('./middleware/auth.middleware');
const mercadoRoutes = require('./routes/mercado.routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const MONGODB_URI = "mongodb+srv://adorno:f2q39KH5al6BNU2s@projeto-jean-deploy.okctz.mongodb.net/";
const MONGO_DB = "FazendoProjetoComIA";
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cryptomanager';

// Middleware
app.use(cors());
app.use(express.json());

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
  
  if (!(await db.listCollections({ name: 'criptomoedas' }).hasNext())) {
    await db.createCollection('criptomoedas');
    console.log('Criptomoedas collection created');
    
    // Inicializar com algumas criptomoedas populares
    const defaultCryptos = [
      {
        nome: 'Bitcoin',
        simbolo: 'BTC',
        precoAtual: 64000,
        variacao24h: 2.5,
        marketCap: 1200000000000,
        volume24h: 30000000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Ethereum',
        simbolo: 'ETH',
        precoAtual: 3100,
        variacao24h: 3.2,
        marketCap: 380000000000,
        volume24h: 15000000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Solana',
        simbolo: 'SOL',
        precoAtual: 118,
        variacao24h: -2.5,
        marketCap: 55000000000,
        volume24h: 3500000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Cardano',
        simbolo: 'ADA',
        precoAtual: 0.45,
        variacao24h: -3.8,
        marketCap: 16000000000,
        volume24h: 500000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Polkadot',
        simbolo: 'DOT',
        precoAtual: 6.8,
        variacao24h: 2.1,
        marketCap: 9000000000,
        volume24h: 350000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Avalanche',
        simbolo: 'AVAX',
        precoAtual: 35,
        variacao24h: 4.3,
        marketCap: 13000000000,
        volume24h: 750000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Ripple',
        simbolo: 'XRP',
        precoAtual: 0.58,
        variacao24h: 1.5,
        marketCap: 31000000000,
        volume24h: 1200000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Polygon',
        simbolo: 'MATIC',
        precoAtual: 0.68,
        variacao24h: 2.8,
        marketCap: 7000000000,
        volume24h: 380000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Aave',
        simbolo: 'AAVE',
        precoAtual: 93,
        variacao24h: 3.7,
        marketCap: 1400000000,
        volume24h: 140000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Uniswap',
        simbolo: 'UNI',
        precoAtual: 7.2,
        variacao24h: 2.9,
        marketCap: 5500000000,
        volume24h: 260000000,
        ultimaAtualizacao: new Date()
      },
      // Adicionando mais criptomoedas com variação positiva
      {
        nome: 'Binance Coin',
        simbolo: 'BNB',
        precoAtual: 565,
        variacao24h: 5.2,
        marketCap: 87000000000,
        volume24h: 2100000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Cosmos',
        simbolo: 'ATOM',
        precoAtual: 8.5,
        variacao24h: 6.8,
        marketCap: 3200000000,
        volume24h: 280000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Algorand',
        simbolo: 'ALGO',
        precoAtual: 0.18,
        variacao24h: 4.9,
        marketCap: 1400000000,
        volume24h: 120000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Filecoin',
        simbolo: 'FIL',
        precoAtual: 5.2,
        variacao24h: 8.3,
        marketCap: 2600000000,
        volume24h: 380000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Internet Computer',
        simbolo: 'ICP',
        precoAtual: 12.5,
        variacao24h: 9.1,
        marketCap: 5800000000,
        volume24h: 630000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'The Graph',
        simbolo: 'GRT',
        precoAtual: 0.23,
        variacao24h: 7.5,
        marketCap: 2100000000,
        volume24h: 190000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'NEAR Protocol',
        simbolo: 'NEAR',
        precoAtual: 4.8,
        variacao24h: 6.2,
        marketCap: 5300000000,
        volume24h: 510000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Fantom',
        simbolo: 'FTM',
        precoAtual: 0.76,
        variacao24h: 10.5,
        marketCap: 2100000000,
        volume24h: 390000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Hedera',
        simbolo: 'HBAR',
        precoAtual: 0.10,
        variacao24h: 5.6,
        marketCap: 3200000000,
        volume24h: 180000000,
        ultimaAtualizacao: new Date()
      },
      // Adicionando mais criptomoedas com variação negativa
      {
        nome: 'Litecoin',
        simbolo: 'LTC',
        precoAtual: 74.5,
        variacao24h: -1.7,
        marketCap: 5500000000,
        volume24h: 350000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Chainlink',
        simbolo: 'LINK',
        precoAtual: 13.8,
        variacao24h: -4.2,
        marketCap: 8200000000,
        volume24h: 620000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Shiba Inu',
        simbolo: 'SHIB',
        precoAtual: 0.00002,
        variacao24h: -5.3,
        marketCap: 12000000000,
        volume24h: 900000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Tron',
        simbolo: 'TRX',
        precoAtual: 0.12,
        variacao24h: -2.9,
        marketCap: 10500000000,
        volume24h: 780000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Stellar',
        simbolo: 'XLM',
        precoAtual: 0.11,
        variacao24h: -3.5,
        marketCap: 3100000000,
        volume24h: 260000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'VeChain',
        simbolo: 'VET',
        precoAtual: 0.025,
        variacao24h: -4.8,
        marketCap: 1800000000,
        volume24h: 120000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Dogecoin',
        simbolo: 'DOGE',
        precoAtual: 0.12,
        variacao24h: -6.2,
        marketCap: 16800000000,
        volume24h: 1500000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Apecoin',
        simbolo: 'APE',
        precoAtual: 1.25,
        variacao24h: -7.4,
        marketCap: 780000000,
        volume24h: 210000000,
        ultimaAtualizacao: new Date()
      },
      {
        nome: 'Decentraland',
        simbolo: 'MANA',
        precoAtual: 0.39,
        variacao24h: -5.9,
        marketCap: 840000000,
        volume24h: 170000000,
        ultimaAtualizacao: new Date()
      }
    ];
    
    await db.collection('criptomoedas').insertMany(defaultCryptos);
    console.log('Criptomoedas initialized with default values');
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
}

// Make DB available to routes
app.use((req, res, next) => {
  req.db = db;
  req.ObjectId = ObjectId;
  next();
});

// Public Routes
app.use('/auth', authRoutes);
app.use('/cripto', criptoRoutes);

// Protected Routes (require authentication)
app.use('/carteira', authMiddleware, carteiraRoutes);
app.use('/usuario', authMiddleware, usuarioRoutes);
app.use('/historico', authMiddleware, historicoRoutes);
app.use('/graficos', authMiddleware, graficosRoutes);
app.use('/mercado', mercadoRoutes);

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
