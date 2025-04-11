// Controller para as operações relacionadas às carteiras

// Criar uma nova carteira
exports.createWallet = async (req, res) => {
  try {
    const { nome } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'Nome da carteira é obrigatório' });
    }
    
    const newWallet = {
      userId: req.userId, // Associar ao usuário atual
      nome,
      ativos: [],
      saldoTotal: 0,
      aporteTotal: 0,
      lucro: 0,
      percentualLucro: 0,
      dataCriacao: new Date()
    };
    
    const result = await req.db.collection('carteiras').insertOne(newWallet);
    
    // Registrar no histórico
    await req.db.collection('historico').insertOne({
      userId: req.userId, // Associar ao usuário atual
      tipo: 'criacao',
      descricao: `Criou a carteira ${nome}`,
      valor: 0,
      data: new Date(),
      carteiraId: result.insertedId,
      carteiraNome: nome
    });
    
    res.status(201).json({
      id: result.insertedId,
      ...newWallet
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
    
    if (!nome || !quantidade || !valorUnitario) {
      return res.status(400).json({ error: 'Nome, quantidade e valor unitário são obrigatórios' });
    }
    
    // Buscar a carteira
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new req.ObjectId(id),
      userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    // Buscar usuário para verificar saldo
    const user = await req.db.collection('usuarios').findOne({ _id: new req.ObjectId(req.userId) });
    
    const valorTotal = quantidade * valorUnitario;
    
    if (valorTotal > user.saldoReais) {
      return res.status(400).json({ error: 'Saldo em reais insuficiente para este aporte' });
    }
    
    // Verificar se a criptomoeda existe na tabela de criptomoedas
    const cryptoData = await req.db.collection('criptomoedas').findOne({ nome });
    if (!cryptoData) {
      return res.status(404).json({ error: 'Criptomoeda não encontrada na base de dados' });
    }
    
    // Atualizar saldo do usuário
    await req.db.collection('usuarios').updateOne(
      { _id: new req.ObjectId(req.userId) },
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
        precoAtual: cryptoData.precoAtual
      };
    } else {
      // Adicionar novo ativo
      updatedAtivos.push({
        nome,
        quantidade,
        valorUnitario,
        valorTotal,
        percentual: 0,
        precoAtual: cryptoData.precoAtual
      });
    }
    
    // Calcular o valor atual total dos ativos com base nos preços atuais
    const saldoAtualTotal = updatedAtivos.reduce((total, ativo) => {
      return total + (ativo.quantidade * ativo.precoAtual);
    }, 0);
    
    // Atualizar totais da carteira
    const newAporteTotal = wallet.aporteTotal + valorTotal;
    
    // Recalcular percentuais com base no saldo atual total
    updatedAtivos = updatedAtivos.map(ativo => ({
      ...ativo,
      percentual: (ativo.quantidade * ativo.precoAtual / saldoAtualTotal) * 100
    }));
    
    // Calcular lucro e percentual de lucro
    const lucro = saldoAtualTotal - newAporteTotal;
    const percentualLucro = newAporteTotal > 0 ? (lucro / newAporteTotal) * 100 : 0;
    
    // Atualizar a carteira
    await req.db.collection('carteiras').updateOne(
      { _id: new req.ObjectId(id) },
      { 
        $set: { 
          ativos: updatedAtivos,
          saldoTotal: saldoAtualTotal,
          aporteTotal: newAporteTotal,
          lucro: lucro,
          percentualLucro: percentualLucro
        } 
      }
    );
    
    // Registrar no histórico
    await req.db.collection('historico').insertOne({
      userId: req.userId,
      tipo: 'compra',
      descricao: `Comprou ${quantidade} ${nome}`,
      valor: valorTotal,
      data: new Date(),
      carteiraId: new req.ObjectId(id),
      carteiraNome: wallet.nome
    });
    
    res.json({
      message: `Compra de ${quantidade} ${nome} realizada com sucesso`,
      saldoRestante: user.saldoReais - valorTotal
    });
  } catch (error) {
    console.error('Erro ao adicionar ativo:', error);
    res.status(500).json({ error: 'Erro ao adicionar ativo' });
  }
};

// Vender um ativo por real
exports.sellAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, quantidade, valorUnitario } = req.body;
    
    if (!nome || !quantidade || !valorUnitario) {
      return res.status(400).json({ error: 'Nome, quantidade e valor unitário são obrigatórios' });
    }
    
    // Buscar a carteira
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new req.ObjectId(id),
      userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    // Verificar se o ativo existe na carteira
    const existingAssetIndex = wallet.ativos.findIndex(a => a.nome === nome);
    
    if (existingAssetIndex === -1) {
      return res.status(404).json({ error: `Ativo ${nome} não encontrado na carteira` });
    }
    
    const existingAsset = wallet.ativos[existingAssetIndex];
    
    if (existingAsset.quantidade < quantidade) {
      return res.status(400).json({ error: `Quantidade insuficiente de ${nome} para venda` });
    }
    
    const valorVenda = quantidade * valorUnitario;
    const valorCusto = quantidade * existingAsset.valorUnitario;
    const lucroVenda = valorVenda - valorCusto;
    
    // Atualizar saldo do usuário
    await req.db.collection('usuarios').updateOne(
      { _id: new req.ObjectId(req.userId) },
      { $inc: { saldoReais: valorVenda } }
    );
    
    // Atualizar ativo na carteira
    let updatedAtivos = [...wallet.ativos];
    updatedAtivos[existingAssetIndex] = {
      ...existingAsset,
      quantidade: existingAsset.quantidade - quantidade,
      valorTotal: (existingAsset.quantidade - quantidade) * existingAsset.valorUnitario
    };
    
    // Remover ativo se quantidade for zero
    if (updatedAtivos[existingAssetIndex].quantidade === 0) {
      updatedAtivos = updatedAtivos.filter((_, index) => index !== existingAssetIndex);
    }
    
    // Recalcular valor atual total dos ativos com base nos preços atuais
    const saldoAtualTotal = updatedAtivos.reduce((total, ativo) => {
      return total + (ativo.quantidade * ativo.precoAtual);
    }, 0);
    
    // Recalcular percentuais com base no saldo atual total
    if (saldoAtualTotal > 0) {
      updatedAtivos = updatedAtivos.map(ativo => ({
        ...ativo,
        percentual: (ativo.quantidade * ativo.precoAtual / saldoAtualTotal) * 100
      }));
    }
    
    // Calcular o lucro e percentual de lucro
    const lucro = saldoAtualTotal - wallet.aporteTotal;
    const percentualLucro = wallet.aporteTotal > 0 ? (lucro / wallet.aporteTotal) * 100 : 0;
    
    // Atualizar a carteira
    await req.db.collection('carteiras').updateOne(
      { _id: new req.ObjectId(id) },
      { 
        $set: { 
          ativos: updatedAtivos,
          saldoTotal: saldoAtualTotal,
          lucro: lucro,
          percentualLucro: percentualLucro
        } 
      }
    );
    
    // Registrar no histórico
    await req.db.collection('historico').insertOne({
      userId: req.userId,
      tipo: 'venda',
      descricao: `Vendeu ${quantidade} ${nome}`,
      valor: valorVenda,
      lucro: lucroVenda,
      data: new Date(),
      carteiraId: new req.ObjectId(id),
      carteiraNome: wallet.nome
    });
    
    const resultMessage = lucroVenda >= 0 
      ? `Venda realizada com lucro de R$ ${lucroVenda.toFixed(2)}` 
      : `Venda realizada com prejuízo de R$ ${Math.abs(lucroVenda).toFixed(2)}`;
    
    res.json({
      message: `Venda de ${quantidade} ${nome} realizada com sucesso. ${resultMessage}`,
      lucroVenda,
      saldoAtualizado: valorVenda
    });
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
      _id: new req.ObjectId(id),
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
      { _id: new req.ObjectId(id) },
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
    const updatedWallet = await req.db.collection('carteiras').findOne({ _id: new req.ObjectId(id) });
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
        _id: new req.ObjectId(id),
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
        const valorAtual = ativo.quantidade * cryptoData.precoAtual;
        const valorInicial = ativo.quantidade * ativo.valorUnitario;
        const variacao = valorInicial > 0 ? ((valorAtual - valorInicial) / valorInicial) * 100 : 0;
        
        return {
          ...ativo,
          precoAtual: cryptoData.precoAtual,
          valorAtual: valorAtual,
          variacao: variacao
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
    
    const wallet = await req.db.collection('carteiras').findOne(
      { 
        _id: new req.ObjectId(id),
        userId: req.userId
      }
    );
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    // Calcular saldo atual com base nos preços atuais das criptomoedas
    let saldoAtual = 0;
    
    if (wallet.ativos && wallet.ativos.length > 0) {
      for (const ativo of wallet.ativos) {
        const cryptoData = await req.db.collection('criptomoedas').findOne({ nome: ativo.nome });
        if (cryptoData) {
          saldoAtual += ativo.quantidade * cryptoData.precoAtual;
        } else {
          saldoAtual += ativo.valorTotal;
        }
      }
    }
    
    // Calcular lucro e percentual de lucro
    const lucro = saldoAtual - wallet.aporteTotal;
    const percentualLucro = wallet.aporteTotal > 0 ? (lucro / wallet.aporteTotal) * 100 : 0;
    
    res.json({
      saldoTotal: saldoAtual,
      aporteTotal: wallet.aporteTotal,
      lucro: lucro,
      percentualLucro: percentualLucro
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
    
    // Adiciona verificação de propriedade da carteira
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new req.ObjectId(id),
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
    
    res.json(wallet);
  } catch (error) {
    console.error('Erro ao obter carteira:', error);
    res.status(500).json({ error: 'Erro ao obter carteira' });
  }
};

// Deletar uma carteira
exports.deleteWallet = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar a carteira para verificar se existe e pertence ao usuário
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new req.ObjectId(id),
      userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    // Deletar a carteira
    const result = await req.db.collection('carteiras').deleteOne({ 
      _id: new req.ObjectId(id),
      userId: req.userId
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    // Registrar no histórico
    await req.db.collection('historico').insertOne({
      userId: req.userId,
      tipo: 'exclusao',
      descricao: `Excluiu a carteira ${wallet.nome}`,
      valor: 0,
      data: new Date(),
      carteiraId: new req.ObjectId(id),
      carteiraNome: wallet.nome
    });
    
    res.json({ message: 'Carteira excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir carteira:', error);
    res.status(500).json({ error: 'Erro ao excluir carteira' });
  }
};
