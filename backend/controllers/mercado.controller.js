// Controller para operações relacionadas a informações de mercado

// Obter todas as informações de mercado
exports.getMarketInfo = async (req, res) => {
  try {
    const marketInfo = await req.db.collection('mercado').findOne({});
    
    if (!marketInfo) {
      return res.status(404).json({ error: 'Informações de mercado não encontradas' });
    }
    
    res.json(marketInfo);
  } catch (error) {
    console.error('Erro ao obter informações de mercado:', error);
    res.status(500).json({ error: 'Erro ao obter informações de mercado' });
  }
};

// Obter apenas o índice de medo e ganância
exports.getFearGreedIndex = async (req, res) => {
  try {
    const marketInfo = await req.db.collection('mercado').findOne({}, { projection: { indiceMedoGanancia: 1, _id: 0 } });
    
    if (!marketInfo || !marketInfo.indiceMedoGanancia) {
      return res.status(404).json({ error: 'Índice de medo e ganância não encontrado' });
    }
    
    res.json(marketInfo.indiceMedoGanancia);
  } catch (error) {
    console.error('Erro ao obter índice de medo e ganância:', error);
    res.status(500).json({ error: 'Erro ao obter índice de medo e ganância' });
  }
};

// Obter apenas informações sobre altcoin season
exports.getAltcoinSeason = async (req, res) => {
  try {
    const marketInfo = await req.db.collection('mercado').findOne({}, { projection: { altcoinSeason: 1, _id: 0 } });
    
    if (!marketInfo || !marketInfo.altcoinSeason) {
      return res.status(404).json({ error: 'Informações de altcoin season não encontradas' });
    }
    
    res.json(marketInfo.altcoinSeason);
  } catch (error) {
    console.error('Erro ao obter informações de altcoin season:', error);
    res.status(500).json({ error: 'Erro ao obter informações de altcoin season' });
  }
};

// Obter apenas informações sobre dominância do Bitcoin
exports.getBtcDominance = async (req, res) => {
  try {
    const marketInfo = await req.db.collection('mercado').findOne({}, { projection: { dominanciaBTC: 1, _id: 0 } });
    
    if (!marketInfo || !marketInfo.dominanciaBTC) {
      return res.status(404).json({ error: 'Informações de dominância do Bitcoin não encontradas' });
    }
    
    res.json(marketInfo.dominanciaBTC);
  } catch (error) {
    console.error('Erro ao obter informações de dominância do Bitcoin:', error);
    res.status(500).json({ error: 'Erro ao obter informações de dominância do Bitcoin' });
  }
};

// Atualizar informações de mercado (apenas para administradores)
exports.updateMarketInfo = async (req, res) => {
  try {
    const { indiceMedoGanancia, altcoinSeason, dominanciaBTC } = req.body;
    
    // Validação dos dados
    if (!indiceMedoGanancia && !altcoinSeason && !dominanciaBTC) {
      return res.status(400).json({ error: 'Nenhuma informação fornecida para atualização' });
    }
    
    // Preparar o objeto de atualização
    const updateObj = {};
    
    if (indiceMedoGanancia) {
      updateObj.indiceMedoGanancia = {
        ...indiceMedoGanancia,
        ultimaAtualizacao: new Date()
      };
    }
    
    if (altcoinSeason) {
      updateObj.altcoinSeason = {
        ...altcoinSeason,
        ultimaAtualizacao: new Date()
      };
    }
    
    if (dominanciaBTC) {
      updateObj.dominanciaBTC = {
        ...dominanciaBTC,
        ultimaAtualizacao: new Date()
      };
    }
    
    const result = await req.db.collection('mercado').updateOne(
      {},
      { $set: updateObj },
      { upsert: true }
    );
    
    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return res.status(404).json({ error: 'Falha ao atualizar informações de mercado' });
    }
    
    res.json({ message: 'Informações de mercado atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar informações de mercado:', error);
    res.status(500).json({ error: 'Erro ao atualizar informações de mercado' });
  }
}; 