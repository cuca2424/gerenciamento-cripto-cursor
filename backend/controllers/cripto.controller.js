
// Controller para operações relacionadas a criptomoedas

// Obter todas as criptomoedas
exports.getAllCryptos = async (req, res) => {
  try {
    const cryptos = await req.db.collection('criptomoedas').find({}).toArray();
    res.json(cryptos);
  } catch (error) {
    console.error('Erro ao listar criptomoedas:', error);
    res.status(500).json({ error: 'Erro ao listar criptomoedas' });
  }
};

// Obter uma criptomoeda específica pelo nome
exports.getCryptoByName = async (req, res) => {
  try {
    const { nome } = req.params;
    
    const crypto = await req.db.collection('criptomoedas').findOne({ nome });
    
    if (!crypto) {
      return res.status(404).json({ error: 'Criptomoeda não encontrada' });
    }
    
    res.json(crypto);
  } catch (error) {
    console.error('Erro ao obter criptomoeda:', error);
    res.status(500).json({ error: 'Erro ao obter criptomoeda' });
  }
};

// Adicionar ou atualizar uma criptomoeda
exports.updateCrypto = async (req, res) => {
  try {
    const { nome, simbolo, precoAtual, variacao24h, marketCap, volume24h } = req.body;
    
    if (!nome || !precoAtual) {
      return res.status(400).json({ error: 'Nome e preço atual são obrigatórios' });
    }
    
    const result = await req.db.collection('criptomoedas').updateOne(
      { nome },
      { 
        $set: { 
          nome,
          simbolo,
          precoAtual,
          variacao24h,
          marketCap,
          volume24h,
          ultimaAtualizacao: new Date()
        }
      },
      { upsert: true }
    );
    
    if (result.upsertedCount > 0) {
      res.status(201).json({ message: 'Criptomoeda adicionada com sucesso' });
    } else {
      res.json({ message: 'Criptomoeda atualizada com sucesso' });
    }
  } catch (error) {
    console.error('Erro ao adicionar/atualizar criptomoeda:', error);
    res.status(500).json({ error: 'Erro ao adicionar/atualizar criptomoeda' });
  }
};

// Excluir uma criptomoeda
exports.deleteCrypto = async (req, res) => {
  try {
    const { nome } = req.params;
    
    const result = await req.db.collection('criptomoedas').deleteOne({ nome });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Criptomoeda não encontrada' });
    }
    
    res.json({ message: 'Criptomoeda excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir criptomoeda:', error);
    res.status(500).json({ error: 'Erro ao excluir criptomoeda' });
  }
};
