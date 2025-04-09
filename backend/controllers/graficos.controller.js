const { ObjectId } = require('mongodb');

// Controller para operações relacionadas a gráficos

// Retorna dados para um gráfico de pizza, mostrando a porcentagem de cada ativo dentro da carteira
exports.getWalletPieChart = async (req, res) => {
  try {
    const { id } = req.params;
    
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new ObjectId(id),
      userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    if (!wallet.ativos || wallet.ativos.length === 0) {
      return res.json({ labels: [], data: [], backgroundColor: [] });
    }
    
    // Atualizar preços dos ativos com base na tabela de criptomoedas
    let updatedAtivos = [...wallet.ativos];
    let saldoAtualTotal = 0;
    
    for (let i = 0; i < updatedAtivos.length; i++) {
      const ativo = updatedAtivos[i];
      const cryptoData = await req.db.collection('criptomoedas').findOne({ nome: ativo.nome });
      
      if (cryptoData) {
        updatedAtivos[i].precoAtual = cryptoData.precoAtual;
        updatedAtivos[i].valorAtual = ativo.quantidade * cryptoData.precoAtual;
        saldoAtualTotal += updatedAtivos[i].valorAtual;
      } else {
        saldoAtualTotal += ativo.valorTotal;
      }
    }
    
    // Recalcular percentuais com base no saldo atual
    if (saldoAtualTotal > 0) {
      updatedAtivos = updatedAtivos.map(ativo => ({
        ...ativo,
        percentual: ((ativo.valorAtual || ativo.valorTotal) / saldoAtualTotal) * 100
      }));
    }
    
    // Definir cores para os ativos
    const colors = [
      '#00e4ca', '#9b87f5', '#ff9332', '#1199fa', '#2ebd85', '#ff4c4c',
      '#00b8d9', '#6554c0', '#ff8800', '#36b37e', '#ff5630', '#6554c0'
    ];
    
    // Formatar dados para o gráfico de pizza
    const labels = updatedAtivos.map(a => a.nome);
    const data = updatedAtivos.map(a => a.percentual);
    const backgroundColor = updatedAtivos.map((_, index) => colors[index % colors.length]);
    
    res.json({
      labels,
      data,
      backgroundColor
    });
  } catch (error) {
    console.error('Erro ao obter dados para gráfico de pizza:', error);
    res.status(500).json({ error: 'Erro ao obter dados para gráfico de pizza' });
  }
};

// Retorna dados para um gráfico de pizza, mostrando a distribuição percentual dos ativos no total do usuário
exports.getGeneralPieChart = async (req, res) => {
  try {
    const wallets = await req.db.collection('carteiras').find({ userId: req.userId }).toArray();
    
    if (!wallets || wallets.length === 0) {
      return res.json({ labels: [], data: [], backgroundColor: [] });
    }
    
    // Atualizar saldos de cada carteira com base nos preços atuais
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
      }
    }
    
    // Calcular valor total de todas as carteiras
    const totalValue = wallets.reduce((sum, wallet) => sum + wallet.saldoTotal, 0);
    
    if (totalValue === 0) {
      return res.json({ labels: [], data: [], backgroundColor: [] });
    }
    
    // Calcular percentual de cada carteira
    const walletData = wallets.map(wallet => ({
      name: wallet.nome,
      value: wallet.saldoTotal,
      percentage: (wallet.saldoTotal / totalValue) * 100
    }));
    
    // Definir cores para as carteiras
    const colors = [
      '#00e4ca', '#9b87f5', '#ff9332', '#1199fa', '#2ebd85', '#ff4c4c',
      '#00b8d9', '#6554c0', '#ff8800', '#36b37e', '#ff5630', '#6554c0'
    ];
    
    res.json({
      labels: walletData.map(w => w.name),
      data: walletData.map(w => w.percentage),
      backgroundColor: walletData.map((_, index) => colors[index % colors.length])
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
      _id: new ObjectId(id),
      userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    // Buscar histórico de operações da carteira
    const history = await req.db.collection('historico')
      .find({ 
        carteiraId: new ObjectId(id),
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
