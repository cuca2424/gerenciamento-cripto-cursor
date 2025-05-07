// Controller para as operações relacionadas ao usuário

// Adicionar saldo em reais à conta geral
exports.deposit = async (req, res) => {
  try {
    const { valor, moeda } = req.body;
    
    if (!valor || valor <= 0) {
      return res.status(400).json({ error: 'Valor inválido para depósito' });
    }

    let valorEmReais = valor;

    // Se a moeda for USD, converter para BRL
    if (moeda === 'USD') {
      // Buscar cotação mais recente do dólar
      const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
        {},
        { sort: { timestamp: -1 } }
      );

      if (!cotacaoDolar) {
        return res.status(500).json({ error: 'Não foi possível obter a cotação do dólar' });
      }

      valorEmReais = valor * cotacaoDolar.valor;
    }
    
    // Atualizar saldo do usuário
    await req.db.collection('usuarios').updateOne(
      { _id: new req.ObjectId(req.userId) },
      { $inc: { saldoReais: valorEmReais } }
    );
    
    // Registrar no histórico
    await req.db.collection('historico').insertOne({
      userId: req.userId,
      tipo: 'deposito',
      descricao: `Depósito em ${moeda === 'USD' ? 'dólares' : 'reais'}`,
      valor: valorEmReais,
      valorOriginal: valor,
      moedaOriginal: moeda,
      data: new Date()
    });
    
    // Retornar usuário atualizado com saldo em ambas as moedas
    const updatedUser = await req.db.collection('usuarios').findOne(
      { _id: new req.ObjectId(req.userId) }
    );

    // Buscar cotação do dólar para retornar o saldo em USD também
    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    const response = {
      message: `Depósito de ${moeda === 'USD' ? '$' : 'R$'} ${valor.toFixed(2)} realizado com sucesso`,
      brl: {
        saldoReais: updatedUser.saldoReais
      },
      usd: {
        saldoReais: cotacaoDolar ? updatedUser.saldoReais / cotacaoDolar.valor : 0
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Erro ao realizar depósito:', error);
    res.status(500).json({ error: 'Erro ao realizar depósito' });
  }
};

// Sacar saldo em reais da conta geral
exports.withdraw = async (req, res) => {
  try {
    const { valor, moeda } = req.body;
    
    if (!valor || valor <= 0) {
      return res.status(400).json({ error: 'Valor inválido para saque' });
    }

    let valorEmReais = valor;

    // Se a moeda for USD, converter para BRL
    if (moeda === 'USD') {
      // Buscar cotação mais recente do dólar
      const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
        {},
        { sort: { timestamp: -1 } }
      );

      if (!cotacaoDolar) {
        return res.status(500).json({ error: 'Não foi possível obter a cotação do dólar' });
      }

      valorEmReais = valor * cotacaoDolar.valor;
    }
    
    // Verificar saldo disponível
    const user = await req.db.collection('usuarios').findOne({ _id: new req.ObjectId(req.userId) });
    
    if (valorEmReais > user.saldoReais) {
      return res.status(400).json({ error: 'Saldo insuficiente para saque' });
    }
    
    // Atualizar saldo do usuário
    await req.db.collection('usuarios').updateOne(
      { _id: new req.ObjectId(req.userId) },
      { $inc: { saldoReais: -valorEmReais } }
    );
    
    // Registrar no histórico
    await req.db.collection('historico').insertOne({
      userId: req.userId,
      tipo: 'saque',
      descricao: `Saque em ${moeda === 'USD' ? 'dólares' : 'reais'}`,
      valor: valorEmReais,
      valorOriginal: valor,
      moedaOriginal: moeda,
      data: new Date()
    });
    
    // Retornar usuário atualizado com saldo em ambas as moedas
    const updatedUser = await req.db.collection('usuarios').findOne(
      { _id: new req.ObjectId(req.userId) }
    );

    // Buscar cotação do dólar para retornar o saldo em USD também
    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    const response = {
      message: `Saque de ${moeda === 'USD' ? '$' : 'R$'} ${valor.toFixed(2)} realizado com sucesso`,
      brl: {
        saldoReais: updatedUser.saldoReais
      },
      usd: {
        saldoReais: cotacaoDolar ? updatedUser.saldoReais / cotacaoDolar.valor : 0
      }
    };
    
    res.json(response);
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

    // Buscar cotação do dólar
    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne();
    const valorDolar = cotacaoDolar?.valor || 4.95; // Valor padrão caso não encontre
    
    // Calcular totais em BRL
    const saldoCarteiras = wallets.reduce((sum, wallet) => sum + (wallet.saldoTotal || 0), 0);
    const custoTotalCriptos = wallets.reduce((sum, wallet) => sum + (wallet.custoTotalCriptos || 0), 0);
    const totalLucroRealizado = wallets.reduce((sum, wallet) => sum + (wallet.lucroRealizado || 0), 0);
    
    const percentualLucro = custoTotalCriptos > 0 ? (totalLucroRealizado / custoTotalCriptos) * 100 : 0;
    
    // Converter valores para USD
    const saldoReaisUSD = user.saldoReais / valorDolar;
    const saldoCarteirasUSD = saldoCarteiras / valorDolar;
    const custoTotalCriptosUSD = custoTotalCriptos / valorDolar;
    const totalLucroRealizadoUSD = totalLucroRealizado / valorDolar;
    
    res.json({
      brl: {
        saldoReais: user.saldoReais,
        saldoCarteiras,
        aporteTotal: custoTotalCriptos,
        lucroRealizado: totalLucroRealizado,
        percentualLucro
      },
      usd: {
        saldoReais: saldoReaisUSD,
        saldoCarteiras: saldoCarteirasUSD,
        aporteTotal: custoTotalCriptosUSD,
        lucroRealizado: totalLucroRealizadoUSD,
        percentualLucro // Mesmo valor pois é uma porcentagem
      }
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

// Atualizar telefone do usuário
exports.updatePhone = async (req, res) => {
    try {
        const { telefone } = req.body;

        // Atualizar telefone no banco de dados
        const result = await req.db.collection('usuarios').updateOne(
            { _id: new req.ObjectId(req.userId) },
            { $set: { telefone: telefone } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado"
            });
        }

        // Retornar sucesso
        res.json({
            message: "Telefone atualizado com sucesso",
            telefone: telefone
        });

    } catch (error) {
        console.error('Erro ao atualizar telefone:', error);
        res.status(500).json({
            message: "Erro ao atualizar telefone"
        });
    }
};
