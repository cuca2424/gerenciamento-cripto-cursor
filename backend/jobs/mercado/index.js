const { ObjectId } = require('mongodb');
const getFearGreedData = require('./fearGreed');
const getAltcoinSeasonData = require('./altcoinSeason');
const getBTCDominanceData = require('./btcDominance');

const atualizarMercado = async (db) => {
  try {
    // Buscar todos os dados em paralelo
    const [fearGreedData, altcoinSeasonData, btcDominanceData] = await Promise.all([
      getFearGreedData(),
      getAltcoinSeasonData(),
      getBTCDominanceData()
    ]);


    // Atualizar cada campo individualmente
    await db.collection('mercado').updateOne(
      { _id: new ObjectId('67f8d98ba3ec7de988d8e4d8') },
      { $set: { indiceMedoGanancia: fearGreedData } },
      { upsert: true }
    );

    await db.collection('mercado').updateOne(
      { _id: new ObjectId('67f8d98ba3ec7de988d8e4d8') },
      { $set: { altcoinSeason: altcoinSeasonData } },
      { upsert: true }
    );

    await db.collection('mercado').updateOne(
      { _id: new ObjectId('67f8d98ba3ec7de988d8e4d8') },
      { $set: { dominanciaBTC: btcDominanceData } },
      { upsert: true }
    );

    console.log('Dados de mercado atualizados com sucesso');
    return {
      // indiceMedoGanancia: fearGreedData,
      // altcoinSeason: altcoinSeasonData,
      dominanciaBTC: btcDominanceData
    };
  } catch (error) {
    console.error('Erro ao atualizar dados de mercado:', error);
    throw error;
  }
};

module.exports = atualizarMercado; 