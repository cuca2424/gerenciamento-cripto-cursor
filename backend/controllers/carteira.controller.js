const { ObjectId } = require('mongodb');

// Controller para as operações relacionadas às carteiras

// Criar uma nova carteira
exports.createWallet = async (req, res) => {
  try {
    const { nome } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'Nome da carteira é obrigatório' });
    }
    
    const newWallet = {
      userId: req.userId,
      nome,
      ativos: [],
      saldoTotal: 0,
      aporteTotal: 0,
      lucro: 0,
      percentualLucro: 0,
      dataCriacao: new Date()
    };
    
    const result = await req.db.collection('carteiras').insertOne(newWallet);
    
    res.status(201).json({
      message: 'Carteira criada com sucesso',
      carteira: { ...newWallet, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Erro ao criar carteira:', error);
    res.status(500).json({ error: 'Erro ao criar carteira' });
  }
};

// Adicionar um aporte de criptomoeda na carteira
exports.addAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, quantidade, valorUnitario } = req.body;
    
    // Validar se o ID é um ObjectId válido
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID da carteira inválido' });
    }
    
    if (!nome || !quantidade || !valorUnitario) {
      return res.status(400).json({ error: 'Nome, quantidade e valor unitário são obrigatórios' });
    }
    
    // Buscar a carteira
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new ObjectId(id),
      userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    // Buscar usuário para verificar saldo
    const user = await req.db.collection('usuarios').findOne({ _id: new ObjectId(req.userId) });
    
    const valorTotal = quantidade * valorUnitario;
    
    if (valorTotal > user.saldoReais) {
      return res.status(400).json({ error: 'Saldo em reais insuficiente para este aporte' });
    }
    
    // Verificar se a criptomoeda existe na tabela de criptomoedas
    const cryptoData = await req.db.collection('cripto').findOne({ nome });
    if (!cryptoData) {
      return res.status(404).json({ error: 'Criptomoeda não encontrada na base de dados' });
    }
    
    // Atualizar saldo do usuário
    await req.db.collection('usuarios').updateOne(
      { _id: new ObjectId(req.userId) },
      { 
        $inc: { 
          saldoReais: -valorTotal,
          aporteTotal: valorTotal 
        } 
      }
    );
    
    // Verificar se o ativo já existe na carteira
    const existingAssetIndex = wallet.ativos.findIndex(a => a.nome === nome);
    
    let updatedAtivos = [...wallet.ativos];
    
    if (existingAssetIndex >= 0) {
      // Atualizar ativo existente
      const existingAsset = wallet.ativos[existingAssetIndex];
      const newQuantity = existingAsset.quantidade + quantidade;
      const newTotal = existingAsset.valorTotal + valorTotal;
      const newAvgPrice = newTotal / newQuantity;
      
      updatedAtivos[existingAssetIndex] = {
        ...existingAsset,
        quantidade: newQuantity,
        valorUnitario: newAvgPrice,
        valorTotal: newTotal,
        precoAtual: cryptoData.preco
      };
    } else {
      // Adicionar novo ativo
      updatedAtivos.push({
        nome,
        quantidade,
        valorUnitario,
        valorTotal,
        precoAtual: cryptoData.preco
      });
    }
    
    // Atualizar a carteira
    await req.db.collection('carteiras').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ativos: updatedAtivos,
          saldoTotal: wallet.saldoTotal + valorTotal,
          aporteTotal: wallet.aporteTotal + valorTotal
        } 
      }
    );
    
    // Registrar no histórico
    await req.db.collection('historico').insertOne({
      userId: req.userId,
      carteiraId: new ObjectId(id),
      tipo: 'compra',
      ativo: nome,
      quantidade,
      preco: valorUnitario,
      valorTotal,
      data: new Date()
    });
    
    res.json({ message: 'Ativo adicionado com sucesso' });
  } catch (error) {
    console.error('Erro ao adicionar ativo:', error);
    res.status(500).json({ error: 'Erro ao adicionar ativo' });
  }
};

// Vender um ativo por real
exports.sellAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, quantidade, preco } = req.body;
    
    // Validar se o ID é um ObjectId válido
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID da carteira inválido' });
    }
    
    if (!nome || !quantidade || !preco) {
      return res.status(400).json({ error: 'Nome, quantidade e preço são obrigatórios' });
    }
    
    // Buscar a carteira
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new ObjectId(id),
      userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    const ativo = wallet.ativos.find(a => a.nome === nome);
    if (!ativo || ativo.quantidade < quantidade) {
      return res.status(400).json({ error: 'Quantidade insuficiente do ativo' });
    }
    
    const valorTotal = quantidade * preco;
    const lucro = valorTotal - (quantidade * ativo.valorUnitario);
    
    // Atualizar saldo do usuário
    await req.db.collection('usuarios').updateOne(
      { _id: new ObjectId(req.userId) },
      { $inc: { saldoReais: valorTotal } }
    );
    
    // Atualizar carteira
    if (ativo.quantidade === quantidade) {
      // Remover ativo se vender tudo
    await req.db.collection('carteiras').updateOne(
        { _id: new ObjectId(id) },
        {
          $pull: { ativos: { nome } },
          $inc: {
            saldoTotal: -valorTotal,
            aporteTotal: -(quantidade * ativo.valorUnitario),
            lucro
          }
        }
      );
    } else {
      // Atualizar quantidade e valores
      await req.db.collection('carteiras').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            'ativos.$[elem].quantidade': ativo.quantidade - quantidade
          },
          $inc: {
            saldoTotal: -valorTotal,
            aporteTotal: -(quantidade * ativo.valorUnitario),
            lucro
          }
        },
        { arrayFilters: [{ 'elem.nome': nome }] }
      );
    }
    
    // Registrar no histórico
    await req.db.collection('historico').insertOne({
      userId: req.userId,
      carteiraId: new ObjectId(id),
      tipo: 'venda',
      ativo: nome,
      quantidade,
      preco,
      valorTotal,
      lucro,
      data: new Date()
    });
    
    res.json({ message: 'Ativo vendido com sucesso' });
  } catch (error) {
    console.error('Erro ao vender ativo:', error);
    res.status(500).json({ error: 'Erro ao vender ativo' });
  }
};

// Atualizar preços e valores das carteiras
exports.updateWalletPrices = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar a carteira
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new ObjectId(id),
      userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    if (!wallet.ativos || wallet.ativos.length === 0) {
      return res.json(wallet);
    }
    
    // Atualizar preços de cada ativo com base na tabela de criptomoedas
    let updatedAtivos = [];
    
    for (const ativo of wallet.ativos) {
      // Buscar preço atual na tabela de criptomoedas
      const cryptoData = await req.db.collection('criptomoedas').findOne({ nome: ativo.nome });
      
      if (cryptoData) {
        updatedAtivos.push({
          ...ativo,
          precoAtual: cryptoData.precoAtual,
          valorAtual: ativo.quantidade * cryptoData.precoAtual
        });
      } else {
        // Manter o preço anterior se não encontrar
        updatedAtivos.push(ativo);
      }
    }
    
    // Calcular o valor atual total dos ativos com base nos preços atuais
    const saldoAtualTotal = updatedAtivos.reduce((total, ativo) => {
      return total + (ativo.quantidade * ativo.precoAtual);
    }, 0);
    
    // Recalcular percentuais
    if (saldoAtualTotal > 0) {
      updatedAtivos = updatedAtivos.map(ativo => ({
        ...ativo,
        percentual: (ativo.quantidade * ativo.precoAtual / saldoAtualTotal) * 100
      }));
    }
    
    // Calcular lucro e percentual de lucro
    const lucro = saldoAtualTotal - wallet.aporteTotal;
    const percentualLucro = wallet.aporteTotal > 0 ? (lucro / wallet.aporteTotal) * 100 : 0;
    
    // Atualizar a carteira
    await req.db.collection('carteiras').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ativos: updatedAtivos,
          saldoTotal: saldoAtualTotal,
          lucro: lucro,
          percentualLucro: percentualLucro,
          ultimaAtualizacao: new Date()
        } 
      }
    );
    
    // Retornar carteira atualizada
    const updatedWallet = await req.db.collection('carteiras').findOne({ _id: new ObjectId(id) });
    res.json(updatedWallet);
  } catch (error) {
    console.error('Erro ao atualizar preços da carteira:', error);
    res.status(500).json({ error: 'Erro ao atualizar preços da carteira' });
  }
};

// Listar ativos de uma carteira
exports.getAssets = async (req, res) => {
  try {
    const { id } = req.params;
    
    const wallet = await req.db.collection('carteiras').findOne(
      { 
        _id: new ObjectId(id),
        userId: req.userId
      },
      { projection: { ativos: 1 } }
    );
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    // Atualizar preços dos ativos com base na tabela de criptomoedas
    const updatedAtivos = await Promise.all(wallet.ativos.map(async (ativo) => {
      const cryptoData = await req.db.collection('criptomoedas').findOne({ nome: ativo.nome });
      if (cryptoData) {
        return {
          ...ativo,
          precoAtual: cryptoData.precoAtual,
          valorAtual: ativo.quantidade * cryptoData.precoAtual
        };
      }
      return ativo;
    }));
    
    res.json(updatedAtivos);
  } catch (error) {
    console.error('Erro ao listar ativos:', error);
    res.status(500).json({ error: 'Erro ao listar ativos' });
  }
};

// Mostrar saldo, aporte e lucro da carteira
exports.getWalletBalance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new ObjectId(id),
        userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    let saldoReais = 0;
    let saldoCripto = 0;
    let lucroTotal = 0;
    let lucroPercentual = 0;
    
    if (wallet.ativos && wallet.ativos.length > 0) {
      for (const ativo of wallet.ativos) {
        const cryptoData = await req.db.collection('cripto').findOne({ nome: ativo.nome });
        
        if (cryptoData) {
          const valorAtual = ativo.quantidade * cryptoData.preco;
          saldoCripto += valorAtual;
          
          // Calcular lucro para este ativo
          const lucroAtivo = valorAtual - (ativo.quantidade * ativo.precoMedio);
          lucroTotal += lucroAtivo;
        }
      }
    }
    
    // Calcular saldo em reais (aporte total + lucro)
    saldoReais = wallet.aporteTotal + lucroTotal;
    
    // Calcular percentual de lucro
    if (wallet.aporteTotal > 0) {
      lucroPercentual = (lucroTotal / wallet.aporteTotal) * 100;
    }
    
    res.json({
      saldoReais,
      saldoCripto,
      aporteTotal: wallet.aporteTotal,
      lucroTotal,
      lucroPercentual
    });
  } catch (error) {
    console.error('Erro ao obter saldo da carteira:', error);
    res.status(500).json({ error: 'Erro ao obter saldo da carteira' });
  }
};

// Obter todas as carteiras
exports.getAllWallets = async (req, res) => {
  try {
    // Filtrar carteiras pelo userId
    const wallets = await req.db.collection('carteiras')
      .find({ userId: req.userId })
      .toArray();
      
    // Atualizar cada carteira com preços atuais
    for (let wallet of wallets) {
      if (wallet.ativos && wallet.ativos.length > 0) {
        let saldoAtual = 0;
        
        for (let i = 0; i < wallet.ativos.length; i++) {
          const ativo = wallet.ativos[i];
          const cryptoData = await req.db.collection('criptomoedas').findOne({ nome: ativo.nome });
          
          if (cryptoData) {
            wallet.ativos[i].precoAtual = cryptoData.precoAtual;
            wallet.ativos[i].valorAtual = ativo.quantidade * cryptoData.precoAtual;
            saldoAtual += wallet.ativos[i].valorAtual;
          } else {
            saldoAtual += ativo.valorTotal;
          }
        }
        
        // Recalcular percentuais
        if (saldoAtual > 0) {
          wallet.ativos.forEach(ativo => {
            ativo.percentual = (ativo.valorAtual / saldoAtual) * 100;
          });
        }
        
        // Atualizar saldo total, lucro e percentual de lucro
        wallet.saldoTotal = saldoAtual;
        wallet.lucro = saldoAtual - wallet.aporteTotal;
        wallet.percentualLucro = wallet.aporteTotal > 0 ? (wallet.lucro / wallet.aporteTotal) * 100 : 0;
      }
    }
    
    res.json(wallets);
  } catch (error) {
    console.error('Erro ao listar carteiras:', error);
    res.status(500).json({ error: 'Erro ao listar carteiras' });
  }
};

// Obter uma carteira específica
exports.getWallet = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar se o ID é um ObjectId válido
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID da carteira inválido' });
    }
    
    // Adiciona verificação de propriedade da carteira
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new ObjectId(id),
      userId: req.userId // Verificar se a carteira pertence ao usuário
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    // Atualizar preços e valores com base nos preços atuais
    if (wallet.ativos && wallet.ativos.length > 0) {
      let saldoAtual = 0;
      
      for (let i = 0; i < wallet.ativos.length; i++) {
        const ativo = wallet.ativos[i];
        const cryptoData = await req.db.collection('cripto').findOne({ nome: ativo.nome });
        
        if (cryptoData) {
          wallet.ativos[i].precoAtual = cryptoData.preco;
          wallet.ativos[i].valorAtual = ativo.quantidade * cryptoData.preco;
          saldoAtual += wallet.ativos[i].valorAtual;
        } else {
          saldoAtual += ativo.valorTotal;
        }
      }
      
      // Recalcular percentuais
      if (saldoAtual > 0) {
        wallet.ativos.forEach(ativo => {
          ativo.percentual = (ativo.valorAtual / saldoAtual) * 100;
        });
      }
      
      // Atualizar saldo total, lucro e percentual de lucro
      wallet.saldoTotal = saldoAtual;
      wallet.lucro = saldoAtual - wallet.aporteTotal;
      wallet.percentualLucro = wallet.aporteTotal > 0 ? (wallet.lucro / wallet.aporteTotal) * 100 : 0;
    }
    
    res.json(wallet);
  } catch (error) {
    console.error('Erro ao obter carteira:', error);
    res.status(500).json({ error: 'Erro ao obter carteira' });
  }
};

// Obter resumo das carteiras
exports.getWalletSummary = async (req, res) => {
  try {
    // Buscar todas as carteiras do usuário
    const carteiras = await req.db.collection('carteiras')
      .find({ userId: req.userId })
      .toArray();
    
    let saldoReais = 0;
    let saldoCripto = 0;
    let aporteTotal = 0;
    let lucroTotal = 0;
    
    // Calcular totais de todas as carteiras
    for (const carteira of carteiras) {
      aporteTotal += carteira.aporteTotal || 0;
      
      if (carteira.ativos && carteira.ativos.length > 0) {
        for (const ativo of carteira.ativos) {
          const cripto = await req.db.collection('cripto').findOne({ nome: ativo.nome });
          if (cripto) {
            const valorAtual = ativo.quantidade * cripto.preco;
            saldoCripto += valorAtual;
            lucroTotal += valorAtual - (ativo.quantidade * ativo.precoMedio);
          }
        }
      }
    }
    
    // Calcular saldo em reais
    saldoReais = aporteTotal + lucroTotal;
    
    // Calcular percentual de lucro
    const lucroPercentual = aporteTotal > 0 ? (lucroTotal / aporteTotal) * 100 : 0;
    
    res.json({
      saldoReais,
      saldoCripto,
      aporteTotal,
      lucroTotal,
      lucroPercentual
    });
  } catch (error) {
    console.error('Erro ao obter resumo das carteiras:', error);
    res.status(500).json({ error: 'Erro ao obter resumo das carteiras' });
  }
};
