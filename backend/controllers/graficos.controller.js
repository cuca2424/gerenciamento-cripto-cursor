// Controller para operações relacionadas a gráficos

// Retorna dados para um gráfico de pizza, mostrando a porcentagem de cada ativo dentro da carteira
exports.getWalletPieChart = async (req, res) => {
  try {
    const { id } = req.params;
    
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new req.ObjectId(id),
      userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    if (!wallet.ativos || wallet.ativos.length === 0) {
      return res.json({ labels: [], data: [], backgroundColor: [] });
    }
    
    // Atualizar preços dos ativos com base na tabela de criptomoedas
    let saldoAtualTotal = 0;
    const ativosAtualizados = [];
    
    for (const ativo of wallet.ativos) {
      const cryptoData = await req.db.collection('criptomoedas').findOne({ nome: ativo.nome });
      
      if (cryptoData) {
        const valorAtual = ativo.quantidade * cryptoData.precoAtual;
        saldoAtualTotal += valorAtual;
        ativosAtualizados.push({
          nome: ativo.nome,
          valor: valorAtual,
          quantidade: ativo.quantidade
        });
      } else {
        saldoAtualTotal += ativo.valorTotal;
        ativosAtualizados.push({
          nome: ativo.nome,
          valor: ativo.valorTotal,
          quantidade: ativo.quantidade
        });
      }
    }

    // Ordenar por valor (maior para menor)
    ativosAtualizados.sort((a, b) => b.valor - a.valor);
    
    // Definir cores para os ativos
    const colors = [
      '#f7931a', // Bitcoin
      '#627eea', // Ethereum
      '#0033ad', // Cardano
      '#00ffbd', // Solana
      '#e6007a', // Polkadot
      '#00b8d9', // Outros
      '#6554c0',
      '#ff8800',
      '#36b37e',
      '#ff5630'
    ];
    
    res.json({
      labels: ativosAtualizados.map(a => a.nome),
      data: ativosAtualizados.map(a => a.valor),
      backgroundColor: ativosAtualizados.map((_, index) => colors[index % colors.length])
    });
  } catch (error) {
    console.error('Erro ao obter dados para gráfico de pizza:', error);
    res.status(500).json({ error: 'Erro ao obter dados para gráfico de pizza' });
  }
};

// Retorna dados para um gráfico de pizza, mostrando a distribuição percentual dos ativos no total do usuário
exports.getGeneralPieChart = async (req, res) => {
  try {
    // Buscar todas as carteiras do usuário
    const wallets = await req.db.collection('carteiras').find({ userId: req.userId }).toArray();
    
    if (!wallets || wallets.length === 0) {
      return res.json({ 
        labels: [], 
        data: [], 
        backgroundColor: []
      });
    }

    // Objeto para agrupar ativos por nome
    const ativosAgregados = {};

    // Processar cada carteira
    for (let wallet of wallets) {
      if (wallet.ativos && wallet.ativos.length > 0) {
        for (const ativo of wallet.ativos) {
          const cryptoData = await req.db.collection('criptomoedas').findOne({ nome: ativo.nome });
          
          if (cryptoData) {
            const valorAtual = ativo.quantidade * cryptoData.precoAtual;
            if (ativosAgregados[ativo.nome]) {
              ativosAgregados[ativo.nome].valor += valorAtual;
              ativosAgregados[ativo.nome].quantidade += ativo.quantidade;
            } else {
              ativosAgregados[ativo.nome] = {
                nome: ativo.nome,
                valor: valorAtual,
                quantidade: ativo.quantidade
              };
            }
          } else {
            if (ativosAgregados[ativo.nome]) {
              ativosAgregados[ativo.nome].valor += ativo.valorTotal;
              ativosAgregados[ativo.nome].quantidade += ativo.quantidade;
            } else {
              ativosAgregados[ativo.nome] = {
                nome: ativo.nome,
                valor: ativo.valorTotal,
                quantidade: ativo.quantidade
              };
            }
          }
        }
      }
    }

    // Se não houver ativos, retornar arrays vazios
    if (Object.keys(ativosAgregados).length === 0) {
      return res.json({ 
        labels: [], 
        data: [], 
        backgroundColor: []
      });
    }

    // Converter o objeto em um array
    const ativosAtualizados = Object.values(ativosAgregados);

    // Ordenar por valor (maior para menor)
    ativosAtualizados.sort((a, b) => b.valor - a.valor);

    // Definir cores para os ativos
    const colors = [
      '#f7931a', // Bitcoin
      '#627eea', // Ethereum
      '#0033ad', // Cardano
      '#00ffbd', // Solana
      '#e6007a', // Polkadot
      '#00b8d9', // Outros
      '#6554c0',
      '#ff8800',
      '#36b37e',
      '#ff5630'
    ];

    res.json({
      labels: ativosAtualizados.map(a => a.nome),
      data: ativosAtualizados.map(a => a.valor),
      backgroundColor: ativosAtualizados.map((_, index) => colors[index % colors.length])
    });
  } catch (error) {
    console.error('Erro ao obter dados para gráfico de pizza geral:', error);
    res.status(500).json({ error: 'Erro ao obter dados para gráfico de pizza geral' });
  }
};

// Retorna dados para um gráfico de linha ou barras, mostrando a relação entre aporte e saldo da carteira
exports.getWalletPerformanceChart = async (req, res) => {
  try {
    const { id } = req.params;
    
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new req.ObjectId(id),
      userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    // Buscar histórico de operações da carteira
    const history = await req.db.collection('historico')
      .find({ 
        carteiraId: new req.ObjectId(id),
        userId: req.userId
      })
      .sort({ data: 1 })
      .toArray();
    
    // Atualizar o saldo atual da carteira com base nos preços da tabela de criptomoedas
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
    
    // Para fins de demonstração, vamos simular dados de 6 meses
    // Em uma aplicação real, isso seria calculado a partir do histórico
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    
    // Simular crescimento gradual do aporte e saldo
    const aporteData = [
      wallet.aporteTotal * 0.3, 
      wallet.aporteTotal * 0.5, 
      wallet.aporteTotal * 0.7, 
      wallet.aporteTotal * 0.8, 
      wallet.aporteTotal * 0.9, 
      wallet.aporteTotal
    ];
    
    const saldoData = [
      wallet.aporteTotal * 0.28, 
      wallet.aporteTotal * 0.48, 
      wallet.aporteTotal * 0.75, 
      wallet.aporteTotal * 0.9, 
      wallet.aporteTotal * 1.05, 
      saldoAtual
    ];
    
    res.json({
      labels: months,
      datasets: [
        {
          label: 'Aporte',
          data: aporteData,
          borderColor: '#9b87f5',
          backgroundColor: 'rgba(155, 135, 245, 0.1)',
        },
        {
          label: 'Saldo',
          data: saldoData,
          borderColor: '#00e4ca',
          backgroundColor: 'rgba(0, 228, 202, 0.1)',
        }
      ]
    });
  } catch (error) {
    console.error('Erro ao obter dados para gráfico de performance:', error);
    res.status(500).json({ error: 'Erro ao obter dados para gráfico de performance' });
  }
};

// Retorna dados para um gráfico de linha ou barras, mostrando a relação entre aporte e saldo geral
exports.getGeneralPerformanceChart = async (req, res) => {
  try {
    // Buscar todas as carteiras do usuário
    const wallets = await req.db.collection('carteiras').find({ userId: req.userId }).toArray();
    
    if (!wallets || wallets.length === 0) {
      return res.json({
        labels: [],
        datasets: []
      });
    }
    
    // Atualizar saldos de cada carteira com base nos preços atuais
    let saldoTotal = 0;
    
    for (let wallet of wallets) {
      if (wallet.ativos && wallet.ativos.length > 0) {
        let saldoAtual = 0;
        
        for (const ativo of wallet.ativos) {
          const cryptoData = await req.db.collection('criptomoedas').findOne({ nome: ativo.nome });
          
          if (cryptoData) {
            saldoAtual += ativo.quantidade * cryptoData.precoAtual;
          } else {
            saldoAtual += ativo.valorTotal;
          }
        }
        
        wallet.saldoTotal = saldoAtual;
        saldoTotal += saldoAtual;
      }
    }
    
    // Calcular totais
    const totalAporte = wallets.reduce((sum, wallet) => sum + wallet.aporteTotal, 0);
    
    // Para fins de demonstração, vamos simular dados de 6 meses
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    
    // Simular crescimento gradual do aporte e saldo
    const aporteData = [
      totalAporte * 0.3, 
      totalAporte * 0.5, 
      totalAporte * 0.7, 
      totalAporte * 0.8, 
      totalAporte * 0.9, 
      totalAporte
    ];
    
    const saldoData = [
      totalAporte * 0.28, 
      totalAporte * 0.48, 
      totalAporte * 0.75, 
      totalAporte * 0.9, 
      totalAporte * 1.05, 
      saldoTotal
    ];
    
    res.json({
      labels: months,
      datasets: [
        {
          label: 'Aporte Total',
          data: aporteData,
          borderColor: '#9b87f5',
          backgroundColor: 'rgba(155, 135, 245, 0.1)',
        },
        {
          label: 'Saldo Total',
          data: saldoData,
          borderColor: '#00e4ca',
          backgroundColor: 'rgba(0, 228, 202, 0.1)',
        }
      ]
    });
  } catch (error) {
    console.error('Erro ao obter dados para gráfico de performance geral:', error);
    res.status(500).json({ error: 'Erro ao obter dados para gráfico de performance geral' });
  }
};

// Retorna as criptomoedas com as maiores variações nas últimas 24 horas
exports.getHighestVariations = async (req, res) => {
  try {
    // Buscar todas as criptomoedas
    const allCryptos = await req.db.collection('criptomoedas').find({}).toArray();
    
    if (!allCryptos || allCryptos.length === 0) {
      return res.status(404).json({ error: 'Nenhuma criptomoeda encontrada' });
    }
    
    console.log("Total de criptomoedas encontradas:", allCryptos.length);
    
    // Processar e organizar as criptomoedas pela variação
    const processedCryptos = allCryptos.map(crypto => ({
      nome: crypto.nome,
      sigla: crypto.simbolo || '',
      precoAtual: crypto.precoAtual || 0,
      variacao24h: crypto.variacao24h || 0
    }));
    
    // Separar as criptomoedas em positivas e negativas
    const positiveCryptos = processedCryptos.filter(crypto => crypto.variacao24h > 0);
    const negativeCryptos = processedCryptos.filter(crypto => crypto.variacao24h < 0);
    
    console.log("Total de criptomoedas com variação positiva:", positiveCryptos.length);
    console.log("Total de criptomoedas com variação negativa:", negativeCryptos.length);
    
    // Ordenar as criptomoedas positivas (maior para menor)
    positiveCryptos.sort((a, b) => b.variacao24h - a.variacao24h);
    
    // Pegar as 10 com maiores variações positivas
    const positiveVariations = positiveCryptos.slice(0, 10);
    
    // Ordenar as criptomoedas negativas (menor para maior - mais negativas primeiro)
    negativeCryptos.sort((a, b) => a.variacao24h - b.variacao24h);
    
    // Pegar as 10 com maiores variações negativas
    const negativeVariations = negativeCryptos.slice(0, 10);
    
    // Resposta final com as 10 maiores variações positivas e 10 maiores variações negativas
    const response = {
      positivas: positiveVariations || [],
      negativas: negativeVariations || []
    };
    
    console.log("Resposta final:", 
      { 
        positivas: response.positivas.length, 
        negativas: response.negativas.length 
      }
    );
    
    res.json(response);
  } catch (error) {
    console.error('Erro ao obter as maiores variações:', error);
    res.status(500).json({ error: 'Erro ao obter as maiores variações' });
  }
};
