function manterUltimosDoisValores(antigo = {}, novo = {}) {
  if (typeof novo !== 'object' || novo === null) return novo;

  const resultado = {};

  for (const chave in novo) {
    const valNovo = novo[chave];
    const valAntigo = antigo?.[chave];

    if (typeof valNovo === 'object' && valNovo !== null && !Array.isArray(valNovo)) {
      resultado[chave] = manterUltimosDoisValores(valAntigo || {}, valNovo);
    } else {
      const anterior = Array.isArray(valAntigo) && valAntigo.length === 2
        ? valAntigo[1]
        : valAntigo ?? valNovo;

      resultado[chave] = [anterior, valNovo];
    }
  }

  return resultado;
}

async function updateCryptoSummary(db, cotacaoDolar, crypto, indicadores) {
  const docAtual = await db.collection('criptomoedas_teste').findOne({ nome: crypto.name });
  const indicadoresAntigos = docAtual?.indicadores || {};

  const indicadoresComHistorico = manterUltimosDoisValores(indicadoresAntigos, indicadores);

  await db.collection('criptomoedas_teste').updateOne(
    { nome: crypto.name },
    {
      $set: {
        nome: crypto.name,
        simbolo: crypto.symbol,
        url_imagem: crypto.image,
        precoAtual: crypto.current_price,
        precoAtualReal: crypto.current_price * cotacaoDolar,
        variacao24h: crypto.price_change_percentage_24h, 
        volume24h: crypto.total_volume,
        volume24hReal: crypto.total_volume * cotacaoDolar,
        capitalizacao: crypto.market_cap,
        capitalizacaoReal: crypto.market_cap * cotacaoDolar,
        indicadores: indicadoresComHistorico,
      },
    },
    { upsert: true }
  );
}

module.exports = { updateCryptoSummary };
