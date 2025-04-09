
// Controller para as operações relacionadas ao histórico

// Exibir histórico de operações
exports.getHistory = async (req, res) => {
  try {
    const history = await req.db.collection('historico')
      .find({ userId: req.userId })
      .sort({ data: -1 })
      .toArray();
    
    // Formatar o histórico para o padrão da API
    const formattedHistory = history.map(item => ({
      id: item._id,
      data: item.data.toISOString().split('T')[0],
      tipo: item.tipo,
      descricao: item.descricao,
      valor: item.valor,
      carteiraId: item.carteiraId,
      carteiraNome: item.carteiraNome,
      lucro: item.lucro
    }));
    
    res.json(formattedHistory);
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ error: 'Erro ao obter histórico' });
  }
};
