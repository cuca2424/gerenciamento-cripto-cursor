const { ObjectId } = require('mongodb');

async function seedDatabase(db) {
  try {
    // Clear existing collections
    await db.collection('carteiras').deleteMany({});
    await db.collection('cripto').deleteMany({});
    await db.collection('historico').deleteMany({});
    await db.collection('usuarios').deleteMany({});

    // Create test user
    const userId = new ObjectId();
    await db.collection('usuarios').insertOne({
      _id: userId,
      nome: 'Usuário Teste',
      email: 'teste@email.com',
      senha: '$2b$10$X7Q8Y9Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z', // senha: 123456
      saldo: 10000,
      createdAt: new Date()
    });

    // Create test wallets
    const carteiraId = new ObjectId();
    await db.collection('carteiras').insertOne({
      _id: carteiraId,
      userId: userId,
      nome: 'Carteira Principal',
      ativos: [],
      saldoTotal: 0,
      aporteTotal: 0,
      lucro: 0,
      percentualLucro: 0,
      dataCriacao: new Date()
    });

    // Create test cryptocurrencies
    const criptos = [
      { nome: 'Bitcoin', sigla: 'BTC', preco: 200000 },
      { nome: 'Ethereum', sigla: 'ETH', preco: 10000 },
      { nome: 'Cardano', sigla: 'ADA', preco: 2 },
      { nome: 'Solana', sigla: 'SOL', preco: 100 },
      { nome: 'Polkadot', sigla: 'DOT', preco: 20 }
    ];

    await db.collection('cripto').insertMany(criptos);

    console.log('Banco de dados populado com sucesso!');
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
    throw error;
  }
}

module.exports = seedDatabase; 