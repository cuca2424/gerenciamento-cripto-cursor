
// Controller para as operações relacionadas ao usuário

// Adicionar saldo em reais à conta geral
exports.deposit = async (req, res) => {
  try {
    const { valor } = req.body;
    
    if (!valor || valor <= 0) {
      return res.status(400).json({ error: 'Valor inválido para depósito' });
    }
    
    // Atualizar saldo do usuário
    await req.db.collection('usuarios').updateOne(
      { _id: new req.ObjectId(req.userId) },
      { $inc: { saldoReais: valor } }
    );
    
    // Registrar no histórico
    await req.db.collection('historico').insertOne({
      userId: req.userId,
      tipo: 'deposito',
      descricao: `Depositou em reais`,
      valor,
      data: new Date()
    });
    
    // Retornar usuário atualizado
    const updatedUser = await req.db.collection('usuarios').findOne(
      { _id: new req.ObjectId(req.userId) }
    );
    
    res.json({
      message: `Depósito de R$ ${valor.toFixed(2)} realizado com sucesso`,
      saldoAtual: updatedUser.saldoReais
    });
  } catch (error) {
    console.error('Erro ao realizar depósito:', error);
    res.status(500).json({ error: 'Erro ao realizar depósito' });
  }
};

// Sacar saldo em reais da conta geral
exports.withdraw = async (req, res) => {
  try {
    const { valor } = req.body;
    
    if (!valor || valor <= 0) {
      return res.status(400).json({ error: 'Valor inválido para saque' });
    }
    
    // Verificar saldo disponível
    const user = await req.db.collection('usuarios').findOne({ _id: new req.ObjectId(req.userId) });
    
    if (valor > user.saldoReais) {
      return res.status(400).json({ error: 'Saldo insuficiente para saque' });
    }
    
    // Atualizar saldo do usuário
    await req.db.collection('usuarios').updateOne(
      { _id: new req.ObjectId(req.userId) },
      { $inc: { saldoReais: -valor } }
    );
    
    // Registrar no histórico
    await req.db.collection('historico').insertOne({
      userId: req.userId,
      tipo: 'saque',
      descricao: `Sacou em reais`,
      valor,
      data: new Date()
    });
    
    // Retornar usuário atualizado
    const updatedUser = await req.db.collection('usuarios').findOne({ _id: new req.ObjectId(req.userId) });
    
    res.json({
      message: `Saque de R$ ${valor.toFixed(2)} realizado com sucesso`,
      saldoAtual: updatedUser.saldoReais
    });
  } catch (error) {
    console.error('Erro ao realizar saque:', error);
    res.status(500).json({ error: 'Erro ao realizar saque' });
  }
};

// Mostrar saldo, aporte e lucro geral do usuário (considerando todas as carteiras)
exports.getOverview = async (req, res) => {
  try {
    // Buscar dados do usuário
    const user = await req.db.collection('usuarios').findOne({ _id: new req.ObjectId(req.userId) });
    
    // Buscar todas as carteiras do usuário
    const wallets = await req.db.collection('carteiras').find({ userId: req.userId }).toArray();
    
    // Calcular totais
    const saldoCarteiras = wallets.reduce((sum, wallet) => sum + wallet.saldoTotal, 0);
    const aporteTotal = wallets.reduce((sum, wallet) => sum + wallet.aporteTotal, 0);
    const lucroTotal = saldoCarteiras - aporteTotal;
    const percentualLucro = aporteTotal > 0 ? (lucroTotal / aporteTotal) * 100 : 0;
    
    res.json({
      saldoReais: user.saldoReais,
      aporteTotal,
      saldoCarteiras,
      lucroTotal,
      percentualLucro
    });
  } catch (error) {
    console.error('Erro ao obter visão geral do usuário:', error);
    res.status(500).json({ error: 'Erro ao obter visão geral do usuário' });
  }
};

// Obter dados do usuário
exports.getUser = async (req, res) => {
  try {
    const user = await req.db.collection('usuarios').findOne({ _id: new req.ObjectId(req.userId) });
    res.json(user);
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json({ error: 'Erro ao obter dados do usuário' });
  }
};
