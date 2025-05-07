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
      custoTotalCriptos: 0,
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
    const { nome, quantidade, valorUnitario, moeda = 'BRL' } = req.body;
    
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

    // Buscar cotação do dólar
    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    if (!cotacaoDolar) {
      return res.status(500).json({ error: 'Cotação do dólar não encontrada' });
    }

    // Converter para BRL se o valor vier em USD
    const valorUnitarioBRL = moeda === 'USD' ? valorUnitario * cotacaoDolar.valor : valorUnitario;
    const valorTotalBRL = quantidade * valorUnitarioBRL;
    
    // Buscar usuário para verificar saldo
    const user = await req.db.collection('usuarios').findOne({ _id: new req.ObjectId(req.userId) });
    
    // Verificar saldo em reais (convertendo se necessário)
    if (moeda === 'USD') {
      // Se o valor foi informado em USD, verificar se o usuário tem saldo em reais equivalente
      if (valorTotalBRL > user.saldoReais) {
        return res.status(400).json({ error: 'Saldo insuficiente para este aporte' });
      }
    } else {
      if (valorTotalBRL > user.saldoReais) {
        return res.status(400).json({ error: 'Saldo insuficiente para este aporte' });
      }
    }
    
    // Verificar se a criptomoeda existe na tabela de criptomoedas
    const cryptoData = await req.db.collection('criptomoedas_teste').findOne({ nome });
    if (!cryptoData) {
      return res.status(404).json({ error: 'Criptomoeda não encontrada na base de dados' });
    }
    
    // Converter o preço atual da cripto de USD para BRL
    const precoAtualBRL = cryptoData.precoAtual * cotacaoDolar.valor;
    
    // Atualizar saldo do usuário (sempre em reais)
    await req.db.collection('usuarios').updateOne(
      { _id: new req.ObjectId(req.userId) },
      { 
        $inc: { 
          saldoReais: -valorTotalBRL,
          aporteTotal: valorTotalBRL 
        } 
      }
    );
    
    // Verificar se o ativo já existe na carteira
    const existingAssetIndex = wallet.ativos.findIndex(a => a.nome === nome);
    
    let updatedAtivos = [...wallet.ativos];
    let novoCustoTotalCriptos = wallet.custoTotalCriptos || 0;
    
    if (existingAssetIndex >= 0) {
      // Atualizar ativo existente
      const existingAsset = wallet.ativos[existingAssetIndex];
      const newQuantity = existingAsset.quantidade + quantidade;
      const newTotal = existingAsset.valorTotal + valorTotalBRL;
      const newAvgPrice = newTotal / newQuantity;
      
      updatedAtivos[existingAssetIndex] = {
        ...existingAsset,
        quantidade: newQuantity,
        valorUnitario: newAvgPrice,
        valorTotal: newTotal,
        precoAtual: precoAtualBRL // Usar o preço em BRL
      };
      
      novoCustoTotalCriptos = novoCustoTotalCriptos - existingAsset.valorTotal + newTotal;
    } else {
      // Adicionar novo ativo
      updatedAtivos.push({
        nome,
        quantidade,
        valorUnitario: valorUnitarioBRL,
        valorTotal: valorTotalBRL,
        percentual: 0,
        precoAtual: precoAtualBRL // Usar o preço em BRL
      });
      
      novoCustoTotalCriptos += valorTotalBRL;
    }
    
    // Calcular o valor atual total dos ativos com base nos preços atuais
    const saldoAtualTotal = updatedAtivos.reduce((total, ativo) => {
      return total + (ativo.quantidade * ativo.precoAtual); // precoAtual já está em BRL
    }, 0);
    
    // Atualizar totais da carteira
    const newAporteTotal = wallet.aporteTotal + valorTotalBRL;
    
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
          custoTotalCriptos: novoCustoTotalCriptos,
          lucro: lucro,
          percentualLucro: percentualLucro
        } 
      }
    );
    
    // Registrar no histórico
    await req.db.collection('historico').insertOne({
      userId: req.userId,
      tipo: 'compra',
      descricao: moeda === 'USD' 
        ? `Comprou ${quantidade} ${nome} por US$ ${valorUnitario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cada` 
        : `Comprou ${quantidade} ${nome} por R$ ${valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cada`,
      valor: valorTotalBRL,
      moedaOriginal: moeda,
      valorOriginal: moeda === 'USD' ? valorUnitario * quantidade : null,
      data: new Date(),
      carteiraId: new req.ObjectId(id),
      carteiraNome: wallet.nome
    });
    
    // Preparar resposta com valores em ambas as moedas
    const response = {
      message: 'Aporte adicionado com sucesso',
      brl: {
      saldoAtual: saldoAtualTotal,
      lucro: lucro,
      percentualLucro: percentualLucro
      },
      usd: {
        saldoAtual: saldoAtualTotal / cotacaoDolar.valor,
        lucro: lucro / cotacaoDolar.valor,
        percentualLucro: percentualLucro // Percentual é o mesmo independente da moeda
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Erro ao adicionar aporte:', error);
    res.status(500).json({ error: 'Erro ao adicionar aporte' });
  }
};

// Vender um ativo por real
exports.sellAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, quantidade, valorUnitario, moeda = 'BRL' } = req.body;
    
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

    // Se a moeda for USD, converter para BRL
    let valorUnitarioEmReais = valorUnitario;
    if (moeda === 'USD') {
      // Buscar cotação do dólar
      const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
        {},
        { sort: { timestamp: -1 } }
      );

      if (!cotacaoDolar) {
        return res.status(500).json({ error: 'Cotação do dólar não encontrada' });
      }

      valorUnitarioEmReais = valorUnitario * cotacaoDolar.valor;
    }
    
    // Verificar se o ativo existe na carteira
    const existingAssetIndex = wallet.ativos.findIndex(a => a.nome === nome);
    if (existingAssetIndex === -1) {
      return res.status(404).json({ error: 'Ativo não encontrado na carteira' });
    }
    
    const existingAsset = wallet.ativos[existingAssetIndex];
    
    // Verificar se há quantidade suficiente para venda
    if (existingAsset.quantidade < quantidade) {
      return res.status(400).json({ error: 'Quantidade insuficiente para venda' });
    }
    
    // Calcular valor da venda e lucro
    const valorVenda = quantidade * valorUnitarioEmReais;
    const custoMedio = existingAsset.valorUnitario;
    const lucroVenda = valorVenda - (custoMedio * quantidade);
    
    // Atualizar saldo do usuário
    await req.db.collection('usuarios').updateOne(
      { _id: new req.ObjectId(req.userId) },
      { $inc: { saldoReais: valorVenda } }
    );
    
    // Atualizar ativo na carteira
    let updatedAtivos = [...wallet.ativos];
    const novaQuantidade = existingAsset.quantidade - quantidade;
    const novoValorTotal = novaQuantidade * existingAsset.valorUnitario;
    
    if (novaQuantidade === 0) {
      // Remover ativo se quantidade for zero
      updatedAtivos = updatedAtivos.filter((_, index) => index !== existingAssetIndex);
    } else {
      // Atualizar quantidade e valor total
      updatedAtivos[existingAssetIndex] = {
        ...existingAsset,
        quantidade: novaQuantidade,
        valorTotal: novoValorTotal
      };
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
    
    // Calcular novo custo total das criptos
    const novoCustoTotalCriptos = updatedAtivos.reduce((total, ativo) => {
      return total + (ativo.quantidade * ativo.valorUnitario);
    }, 0);
    
    // Atualizar a carteira com o lucro realizado e total de vendas
    await req.db.collection('carteiras').updateOne(
      { _id: new req.ObjectId(id) },
      { 
        $set: { 
          ativos: updatedAtivos,
          saldoTotal: saldoAtualTotal,
          custoTotalCriptos: novoCustoTotalCriptos,
          lucro: lucro,
          percentualLucro: percentualLucro
        },
        $inc: {
          lucroRealizado: lucroVenda,
          totalVendas: valorVenda
        }
      }
    );
    
    // Registrar no histórico
    await req.db.collection('historico').insertOne({
      userId: req.userId,
      tipo: 'venda',
      descricao: moeda === 'USD'
        ? `Vendeu ${quantidade} ${nome} por US$ ${valorUnitario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cada`
        : `Vendeu ${quantidade} ${nome} por R$ ${valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cada`,
      valor: valorVenda,
      moedaOriginal: moeda,
      valorOriginal: moeda === 'USD' ? valorUnitario * quantidade : null,
      data: new Date(),
      carteiraId: new req.ObjectId(id),
      carteiraNome: wallet.nome
    });
    
    // Registrar na coleção de imposto de renda
    await req.db.collection('imposto_de_renda').insertOne({
      userId: req.userId,
      ativo: nome,
      quantidade: quantidade,
      valorVenda: valorVenda,
      precoMedio: custoMedio,
      lucroPrejuizo: lucroVenda,
      dataVenda: new Date(),
      carteiraId: new req.ObjectId(id),
      carteiraNome: wallet.nome,
      moeda: moeda
    });
    
    // Buscar cotação do dólar para o retorno
    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    // Preparar resposta com valores em ambas as moedas
    const response = {
      message: 'Venda realizada com sucesso',
      brl: {
      lucro: lucroVenda,
      saldoAtual: saldoAtualTotal
      },
      usd: {
        lucro: cotacaoDolar ? lucroVenda / cotacaoDolar.valor : 0,
        saldoAtual: cotacaoDolar ? saldoAtualTotal / cotacaoDolar.valor : 0
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Erro ao vender ativo:', error);
    res.status(500).json({ error: 'Erro ao vender ativo' });
  }
};

// Atualizar preços e valores das carteiras
exports.updateWalletPrices = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar cotação do dólar
    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    if (!cotacaoDolar) {
      return res.status(500).json({ error: 'Cotação do dólar não encontrada' });
    }
    
    // Buscar a carteira
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new req.ObjectId(id),
      userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    if (!wallet.ativos || wallet.ativos.length === 0) {
      return res.json({
        _id: wallet._id,
        nome: wallet.nome,
        ativos: [],
        brl: {
          saldoTotal: 0,
          custoTotalCriptos: 0,
          lucro: 0,
          percentualLucro: 0
        },
        usd: {
          saldoTotal: 0,
          custoTotalCriptos: 0,
          lucro: 0,
          percentualLucro: 0
        },
        dataCriacao: wallet.dataCriacao
      });
    }
    
    // Atualizar preços de cada ativo com base na tabela de criptomoedas
    let updatedAtivos = [];
    let saldoAtualUSD = 0;
    let custoTotalCriptosUSD = 0;
    
    for (const ativo of wallet.ativos) {
      // Buscar preço atual na tabela de criptomoedas
      const cryptoData = await req.db.collection('criptomoedas_teste').findOne({ nome: ativo.nome });
      
      if (cryptoData) {
        // O preço já está em USD
        const valorAtualUSD = ativo.quantidade * cryptoData.precoAtual;
        saldoAtualUSD += valorAtualUSD;
        // O valorUnitario está em BRL, então convertemos para USD para o cálculo do custo
        custoTotalCriptosUSD += ativo.quantidade * (ativo.valorUnitario / cotacaoDolar.valor);
        
        updatedAtivos.push({
          ...ativo,
          precoAtual: cryptoData.precoAtual, // Preço em USD
          valorAtual: valorAtualUSD * cotacaoDolar.valor, // Valor em BRL
          precoAtualUSD: cryptoData.precoAtual, // Preço em USD
          valorAtualUSD: valorAtualUSD // Valor em USD
        });
      } else {
        updatedAtivos.push(ativo);
        saldoAtualUSD += ativo.valorTotal / cotacaoDolar.valor;
        custoTotalCriptosUSD += ativo.valorTotal / cotacaoDolar.valor;
      }
    }
    
    // Recalcular percentuais com base no valor em USD
    if (saldoAtualUSD > 0) {
      updatedAtivos = updatedAtivos.map(ativo => ({
        ...ativo,
        percentual: (ativo.valorAtualUSD / saldoAtualUSD) * 100
      }));
    }
    
    // Calcular lucro e percentual de lucro em USD primeiro
    const lucroUSD = saldoAtualUSD - custoTotalCriptosUSD;
    const percentualLucro = custoTotalCriptosUSD > 0 ? (lucroUSD / custoTotalCriptosUSD) * 100 : 0;

    // Converter valores para BRL
    const saldoAtualBRL = saldoAtualUSD * cotacaoDolar.valor;
    const custoTotalCriptosBRL = custoTotalCriptosUSD * cotacaoDolar.valor;
    const lucroBRL = lucroUSD * cotacaoDolar.valor;
    
    // Atualizar a carteira
    const updatedWallet = {
      _id: wallet._id,
      nome: wallet.nome,
      ativos: updatedAtivos,
      brl: {
        saldoTotal: saldoAtualBRL,
        custoTotalCriptos: custoTotalCriptosBRL,
        lucro: lucroBRL,
        percentualLucro: percentualLucro
      },
      usd: {
        saldoTotal: saldoAtualUSD,
        custoTotalCriptos: custoTotalCriptosUSD,
        lucro: lucroUSD,
        percentualLucro: percentualLucro // Percentual é o mesmo independente da moeda
      },
      dataCriacao: wallet.dataCriacao,
      ultimaAtualizacao: new Date()
    };

    // Salvar no banco
    await req.db.collection('carteiras').updateOne(
      { _id: new req.ObjectId(id) },
      { $set: updatedWallet }
    );
    
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
    
    // Buscar cotação do dólar
    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    if (!cotacaoDolar) {
      return res.status(500).json({ error: 'Cotação do dólar não encontrada' });
    }
    
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
      const cryptoData = await req.db.collection('criptomoedas_teste').findOne({ nome: ativo.nome });
      if (cryptoData) {
        // O preço atual já está em USD
        const valorAtualUSD = ativo.quantidade * cryptoData.precoAtual;
        // O valorUnitario está em BRL, então convertemos para USD para o cálculo
        const valorInicialUSD = ativo.quantidade * (ativo.valorUnitario / cotacaoDolar.valor);
        const variacaoUSD = valorInicialUSD > 0 ? ((valorAtualUSD - valorInicialUSD) / valorInicialUSD) * 100 : 0;
        
        // Calcular valores em BRL
        const valorAtualBRL = valorAtualUSD * cotacaoDolar.valor;
        const valorInicialBRL = ativo.quantidade * ativo.valorUnitario;
        
        return {
          nome: ativo.nome,
          quantidade: ativo.quantidade,
          brl: {
            valorUnitario: ativo.valorUnitario,
            precoAtual: cryptoData.precoAtual * cotacaoDolar.valor, // Converter USD para BRL
            valorAtual: valorAtualBRL,
            valorInicial: valorInicialBRL,
            variacao: variacaoUSD // Variação percentual é a mesma independente da moeda
          },
          usd: {
            valorUnitario: ativo.valorUnitario / cotacaoDolar.valor,
            precoAtual: cryptoData.precoAtual, // Já está em USD
            valorAtual: valorAtualUSD,
            valorInicial: valorInicialUSD,
            variacao: variacaoUSD
          }
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

    // Buscar cotação do dólar
    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne({}, { sort: { timestamp: -1 } });
    if (!cotacaoDolar) {
      return res.status(500).json({ error: 'Cotação do dólar não encontrada' });
    }
    
    // Calcular saldo atual e custo total das criptomoedas atuais
    let saldoAtualUSD = 0;
    let custoTotalCriptosUSD = 0;
    
    if (wallet.ativos && wallet.ativos.length > 0) {
      for (const ativo of wallet.ativos) {
        const cryptoData = await req.db.collection('criptomoedas_teste').findOne({ nome: ativo.nome });
        if (cryptoData) {
          // O preço já está em USD, então usamos direto para USD
          saldoAtualUSD += ativo.quantidade * cryptoData.precoAtual;
          // O valorUnitario está em BRL, então convertemos para USD
          custoTotalCriptosUSD += ativo.quantidade * (ativo.valorUnitario / cotacaoDolar.valor);
        } else {
          // Se não encontrar o preço atual, usa o valor total convertido para USD
          saldoAtualUSD += ativo.valorTotal / cotacaoDolar.valor;
          custoTotalCriptosUSD += ativo.valorTotal / cotacaoDolar.valor;
        }
      }
    }
    
    // Calcular valores em USD primeiro (já que os preços estão em USD)
    const lucroUSD = saldoAtualUSD - custoTotalCriptosUSD;
    const percentualLucro = custoTotalCriptosUSD > 0 ? (lucroUSD / custoTotalCriptosUSD) * 100 : 0;

    // Converter valores para BRL
    const saldoAtualBRL = saldoAtualUSD * cotacaoDolar.valor;
    const custoTotalCriptosBRL = custoTotalCriptosUSD * cotacaoDolar.valor;
    const lucroBRL = lucroUSD * cotacaoDolar.valor;
    
    // Incluir lucro realizado na resposta
    const lucroRealizadoBRL = wallet.lucroRealizado || 0;
    const lucroRealizadoUSD = lucroRealizadoBRL / cotacaoDolar.valor;
    
    res.json({
      brl: {
        saldoTotal: saldoAtualBRL,
        custoTotalCriptos: custoTotalCriptosBRL,
        lucro: lucroBRL,
        percentualLucro: percentualLucro,
        lucroRealizado: lucroRealizadoBRL
      },
      usd: {
        saldoTotal: saldoAtualUSD,
        custoTotalCriptos: custoTotalCriptosUSD,
        lucro: lucroUSD,
        percentualLucro: percentualLucro,
        lucroRealizado: lucroRealizadoUSD
      }
    });
  } catch (error) {
    console.error('Erro ao obter saldo da carteira:', error);
    res.status(500).json({ error: 'Erro ao obter saldo da carteira' });
  }
};

// Obter todas as carteiras
exports.getAllWallets = async (req, res) => {
  try {
    // Buscar cotação do dólar
    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    if (!cotacaoDolar) {
      return res.status(500).json({ error: 'Cotação do dólar não encontrada' });
    }

    // Filtrar carteiras pelo userId
    const wallets = await req.db.collection('carteiras')
      .find({ userId: req.userId })
      .toArray();
      
    // Atualizar cada carteira com preços atuais
    const walletsWithCurrencies = await Promise.all(wallets.map(async (wallet) => {
      if (wallet.ativos && wallet.ativos.length > 0) {
        let saldoAtual = 0;
        let custoTotalCriptos = 0;
        
        for (let i = 0; i < wallet.ativos.length; i++) {
          const ativo = wallet.ativos[i];
          const cryptoData = await req.db.collection('criptomoedas_teste').findOne({ nome: ativo.nome });
          
          if (cryptoData) {
            wallet.ativos[i].precoAtual = cryptoData.precoAtual;
            wallet.ativos[i].valorAtual = ativo.quantidade * cryptoData.precoAtual;
            saldoAtual += wallet.ativos[i].valorAtual;
            custoTotalCriptos += ativo.quantidade * ativo.valorUnitario;
          } else {
            saldoAtual += ativo.valorTotal;
            custoTotalCriptos += ativo.valorTotal;
          }
        }
        
        // Recalcular percentuais
        if (saldoAtual > 0) {
          wallet.ativos.forEach(ativo => {
            ativo.percentual = (ativo.valorAtual / saldoAtual) * 100;
          });
        }
        
        // Calcular valores em BRL
        const lucroBRL = saldoAtual - custoTotalCriptos;
        const percentualLucroBRL = custoTotalCriptos > 0 ? (lucroBRL / custoTotalCriptos) * 100 : 0;

        // Calcular valores em USD
        const saldoAtualUSD = saldoAtual / cotacaoDolar.valor;
        const custoTotalCriptosUSD = custoTotalCriptos / cotacaoDolar.valor;
        const lucroUSD = lucroBRL / cotacaoDolar.valor;

        // Incluir lucro realizado
        const lucroRealizadoBRL = wallet.lucroRealizado || 0;
        const lucroRealizadoUSD = lucroRealizadoBRL / cotacaoDolar.valor;

        // Retornar objeto com valores em ambas as moedas
        return {
          _id: wallet._id,
          nome: wallet.nome,
          ativos: wallet.ativos.map(ativo => ({
            ...ativo,
            valorAtualUSD: ativo.valorAtual / cotacaoDolar.valor,
            precoAtualUSD: ativo.precoAtual / cotacaoDolar.valor
          })),
          brl: {
            saldoTotal: saldoAtual,
            custoTotalCriptos: custoTotalCriptos,
            lucro: lucroBRL,
            percentualLucro: percentualLucroBRL,
            lucroRealizado: lucroRealizadoBRL
          },
          usd: {
            saldoTotal: saldoAtualUSD,
            custoTotalCriptos: custoTotalCriptosUSD,
            lucro: lucroUSD,
            percentualLucro: percentualLucroBRL,
            lucroRealizado: lucroRealizadoUSD
          },
          dataCriacao: wallet.dataCriacao
        };
      }
      
      // Se não tiver ativos, retornar carteira zerada em ambas as moedas
      return {
        _id: wallet._id,
        nome: wallet.nome,
        ativos: [],
        brl: {
          saldoTotal: 0,
          custoTotalCriptos: 0,
          lucro: 0,
          percentualLucro: 0,
          lucroRealizado: wallet.lucroRealizado || 0
        },
        usd: {
          saldoTotal: 0,
          custoTotalCriptos: 0,
          lucro: 0,
          percentualLucro: 0,
          lucroRealizado: (wallet.lucroRealizado || 0) / cotacaoDolar.valor
        },
        dataCriacao: wallet.dataCriacao
      };
    }));
    
    res.json(walletsWithCurrencies);
  } catch (error) {
    console.error('Erro ao listar carteiras:', error);
    res.status(500).json({ error: 'Erro ao listar carteiras' });
  }
};

// Obter uma carteira específica
exports.getWallet = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar cotação do dólar
    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    if (!cotacaoDolar) {
      return res.status(500).json({ error: 'Cotação do dólar não encontrada' });
    }
    
    // Adiciona verificação de propriedade da carteira
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new req.ObjectId(id),
      userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    // Atualizar preços e valores com base nos preços atuais
    if (wallet.ativos && wallet.ativos.length > 0) {
      let saldoAtual = 0;
      let custoTotalCriptos = 0;
      
      for (let i = 0; i < wallet.ativos.length; i++) {
        const ativo = wallet.ativos[i];
        const cryptoData = await req.db.collection('criptomoedas_teste').findOne({ nome: ativo.nome });
        
        if (cryptoData) {
          wallet.ativos[i].precoAtual = cryptoData.precoAtual;
          wallet.ativos[i].valorAtual = ativo.quantidade * cryptoData.precoAtual;
          saldoAtual += wallet.ativos[i].valorAtual;
          custoTotalCriptos += ativo.quantidade * ativo.valorUnitario;
        } else {
          saldoAtual += ativo.valorTotal;
          custoTotalCriptos += ativo.valorTotal;
        }
      }
      
      // Recalcular percentuais
      if (saldoAtual > 0) {
        wallet.ativos.forEach(ativo => {
          ativo.percentual = (ativo.valorAtual / saldoAtual) * 100;
        });
      }
      
      // Calcular valores em BRL
      const lucroBRL = saldoAtual - custoTotalCriptos;
      const percentualLucroBRL = custoTotalCriptos > 0 ? (lucroBRL / custoTotalCriptos) * 100 : 0;

      // Calcular valores em USD
      const saldoAtualUSD = saldoAtual / cotacaoDolar.valor;
      const custoTotalCriptosUSD = custoTotalCriptos / cotacaoDolar.valor;
      const lucroUSD = lucroBRL / cotacaoDolar.valor;

      // Incluir lucro realizado
      const lucroRealizadoBRL = wallet.lucroRealizado || 0;
      const lucroRealizadoUSD = lucroRealizadoBRL / cotacaoDolar.valor;

      // Retornar objeto com valores em ambas as moedas
      const response = {
        _id: wallet._id,
        nome: wallet.nome,
        ativos: wallet.ativos.map(ativo => ({
          ...ativo,
          valorAtualUSD: ativo.valorAtual / cotacaoDolar.valor,
          precoAtualUSD: ativo.precoAtual / cotacaoDolar.valor
        })),
        brl: {
          saldoTotal: saldoAtual,
          custoTotalCriptos: custoTotalCriptos,
          lucro: lucroBRL,
          percentualLucro: percentualLucroBRL,
          lucroRealizado: lucroRealizadoBRL
        },
        usd: {
          saldoTotal: saldoAtualUSD,
          custoTotalCriptos: custoTotalCriptosUSD,
          lucro: lucroUSD,
          percentualLucro: percentualLucroBRL,
          lucroRealizado: lucroRealizadoUSD
        },
        dataCriacao: wallet.dataCriacao
      };
      
      res.json(response);
    } else {
      // Se não tiver ativos, retornar carteira zerada em ambas as moedas
      res.json({
        _id: wallet._id,
        nome: wallet.nome,
        ativos: [],
        brl: {
          saldoTotal: 0,
          custoTotalCriptos: 0,
          lucro: 0,
          percentualLucro: 0,
          lucroRealizado: wallet.lucroRealizado || 0
        },
        usd: {
          saldoTotal: 0,
          custoTotalCriptos: 0,
          lucro: 0,
          percentualLucro: 0,
          lucroRealizado: (wallet.lucroRealizado || 0) / cotacaoDolar.valor
        },
        dataCriacao: wallet.dataCriacao
      });
    }
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
