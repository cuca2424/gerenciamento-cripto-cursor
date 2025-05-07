const { DateTime } = require('luxon');
const { getHistoricalPrices } = require('./getHistoricalPrices');

async function syncHistoricalPrices(db, crypto) {
  const historicoCol = db.collection('precos_teste');
  const now = DateTime.now().setZone('America/New_York');  // Hora atual em Nova York

  // Arredonda para o início da hora no fuso horário de Nova York e depois converte para UTC
  const rounded = now.startOf('hour').toUTC().toISO();  

  const precoAtual = crypto.current_price;

  const doc = await historicoCol.findOne({ nome: crypto.name });

  // Caso não exista nenhum histórico: buscar histórico completo
  if (!doc) {
    const historico = await getHistoricalPrices(crypto.id);
    await historicoCol.insertOne({
      nome: crypto.name,
      precos: historico.precos
    });
    return;
  }

  const precos = doc.precos || [];
  const index = precos.findIndex(p => p.timestamp === rounded);

  // 🟡 Se a vela existir, mas com timestamp diferente (por exemplo 8:32), atualize para o início da hora (8:00)
  if (index !== -1) {
    const velaTimestamp = DateTime.fromISO(precos[index].timestamp);
    const diffHoras = now.diff(velaTimestamp, 'hours').hours;

    // Se a vela estiver dentro de uma janela de 59 minutos, atualize o preço
    if (diffHoras < 1) {
      const vela = precos[index];
      const updatedVela = {
        ...vela,
        close: precoAtual,
        max: Math.max(precoAtual, vela.max),
        min: Math.min(precoAtual, vela.min)
      };
      precos[index] = updatedVela;
    }
  } else {
    const ultimaVelaTimestamp = DateTime.fromISO(precos[precos.length - 1].timestamp);
    const diffHoras = now.diff(ultimaVelaTimestamp, 'hours').hours;

    // Se a diferença for maior que 2 horas, chama a função getHistoricalPrices para atualizar os dados
    if (diffHoras > 2) {
      const historico = await getHistoricalPrices(crypto.id);
      await historicoCol.updateOne(
        { nome: crypto.name },
        { $set: { precos: historico.precos } }
      );
      return;  // Interrompe o processo, já que o histórico foi atualizado
    }

    // Se não tiver a vela, cria uma nova para o início da hora
    precos.push({
      timestamp: rounded,
      max: precoAtual,
      min: precoAtual,
      close: precoAtual
    });
  }

  // Excluir vela de 3 dias atrás, a menos que seja 00:00:00
  const threeDaysAgo = now.minus({ days: 30 }).startOf('day');  // Data de 3 dias atrás, meia-noite
  const velaParaExcluirIndex = precos.findIndex(p => {
    const velaTimestamp = DateTime.fromISO(p.timestamp);
    return velaTimestamp.hasSame(threeDaysAgo, 'day') && velaTimestamp.toFormat('HH:mm:ss') !== '00:00:00';
  });

  if (velaParaExcluirIndex !== -1) {
    precos.splice(velaParaExcluirIndex, 1);  // Remove a vela
  }

  await historicoCol.updateOne(
    { nome: crypto.name },
    { $set: { precos } }
  );
}

module.exports = { syncHistoricalPrices };
