const atualizarDolar = async (db) => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/exchange_rates');
    const data = await response.json();

    const btcToUsd = data.rates.usd.value;
    const btcToBrl = data.rates.brl.value;

    const usdToBrl = btcToBrl / btcToUsd;
    console.log(`Taxa de USD para BRL: ${usdToBrl.toFixed(2)}`);

    // Atualiza o documento na coleção 'cotacao_dolar'
    const result = await db.collection('cotacao_dolar').updateOne(
      { _id: new ObjectId('6807e21c7cbff16a78b98a28') },
      {
        $set: {
          valor: usdToBrl,
          ultimaAtualizacao: new Date()
        }
      }
    );

    if (result.modifiedCount === 1) {
      console.log('Cotação do dólar atualizada com sucesso.');
    } else {
      console.log('Nenhum documento foi atualizado. Verifique o _id fornecido.');
    }

    return usdToBrl;

  } catch (error) {
    console.error('Erro ao buscar a taxa de câmbio:', error);
  }
};

module.exports = atualizarDolar;
