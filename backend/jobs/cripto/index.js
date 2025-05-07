const { fetchAllCryptosFromAPI } = require('./fetchAllCryptosFromAPI');
const { fetchCotacaoDolar } = require('./fetchCotacaoDolar');
const { syncHistoricalPrices } = require('./syncHistoricalPrices');
const { calculateIndicators } = require('./calculateIndicators');
const { updateCryptoSummary } = require('./updateCryptoSummary');
const { calculateIndicatorsTest } = require('./calculateIndicatorsTest');

const atualizarCriptos = async (db) => {
  const cotacaoDolar = await fetchCotacaoDolar(db);
  const criptos = await fetchAllCryptosFromAPI();

  for (const cripto of criptos) {
    console.log('Atualizando preços da cripto: ', cripto);
    await syncHistoricalPrices(db, cripto);

    const historico = await db.collection('precos_teste').findOne({ nome: cripto.name });
    if (!historico) continue;

    const indicadores = calculateIndicatorsTest(historico.precos, cotacaoDolar);

    await updateCryptoSummary(db, cotacaoDolar, cripto, indicadores);

  } 

  console.log('✅ Finalizado: atualização de preços completa.');
};

module.exports = atualizarCriptos; 