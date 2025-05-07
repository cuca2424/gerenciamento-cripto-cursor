// Controller para operações relacionadas a gráficos

// Retorna dados para um gráfico de pizza, mostrando a porcentagem de cada ativo dentro da carteira
exports.getWalletPieChart = async (req, res) => {
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
    
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new req.ObjectId(id),
      userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    if (!wallet.ativos || wallet.ativos.length === 0) {
      return res.json({ 
        brl: { labels: [], data: [], backgroundColor: [] },
        usd: { labels: [], data: [], backgroundColor: [] }
      });
    }
    
    // Atualizar preços dos ativos com base na tabela de criptomoedas
    let saldoAtualTotalUSD = 0;
    const ativosAtualizados = [];
    
    for (const ativo of wallet.ativos) {
      const cryptoData = await req.db.collection('criptomoedas_teste').findOne({ nome: ativo.nome });
      
      if (cryptoData) {
        // O preço já está em USD
        const valorAtualUSD = ativo.quantidade * cryptoData.precoAtual;
        saldoAtualTotalUSD += valorAtualUSD;
        ativosAtualizados.push({
          nome: ativo.nome,
          valorUSD: valorAtualUSD,
          valorBRL: valorAtualUSD * cotacaoDolar.valor,
          quantidade: ativo.quantidade
        });
      } else {
        // Se não encontrar o preço, assume que o valorTotal está em BRL
        const valorAtualUSD = ativo.valorTotal / cotacaoDolar.valor;
        saldoAtualTotalUSD += valorAtualUSD;
        ativosAtualizados.push({
          nome: ativo.nome,
          valorUSD: valorAtualUSD,
          valorBRL: ativo.valorTotal,
          quantidade: ativo.quantidade
        });
      }
    }

    // Ordenar por valor (maior para menor)
    ativosAtualizados.sort((a, b) => b.valorUSD - a.valorUSD);
    
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
      brl: {
        labels: ativosAtualizados.map(a => a.nome),
        data: ativosAtualizados.map(a => a.valorBRL),
        backgroundColor: ativosAtualizados.map((_, index) => colors[index % colors.length])
      },
      usd: {
      labels: ativosAtualizados.map(a => a.nome),
        data: ativosAtualizados.map(a => a.valorUSD),
      backgroundColor: ativosAtualizados.map((_, index) => colors[index % colors.length])
      }
    });
  } catch (error) {
    console.error('Erro ao obter dados para gráfico de pizza:', error);
    res.status(500).json({ error: 'Erro ao obter dados para gráfico de pizza' });
  }
};

// Retorna dados para um gráfico de pizza, mostrando a distribuição percentual dos ativos no total do usuário
exports.getGeneralPieChart = async (req, res) => {
  try {
    // Buscar cotação do dólar
    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    if (!cotacaoDolar) {
      return res.status(500).json({ error: 'Cotação do dólar não encontrada' });
    }
    
    // Buscar todas as carteiras do usuário
    const wallets = await req.db.collection('carteiras').find({ userId: req.userId }).toArray();
    
    if (!wallets || wallets.length === 0) {
      return res.json({ 
        brl: { labels: [], data: [], backgroundColor: [] },
        usd: { labels: [], data: [], backgroundColor: [] }
      });
    }

    // Objeto para agrupar ativos por nome
    const ativosAgregados = {};

    // Processar cada carteira
    for (let wallet of wallets) {
      if (wallet.ativos && wallet.ativos.length > 0) {
        for (const ativo of wallet.ativos) {
          const cryptoData = await req.db.collection('criptomoedas_teste').findOne({ nome: ativo.nome });
          
          if (cryptoData) {
            // O preço já está em USD
            const valorAtualUSD = ativo.quantidade * cryptoData.precoAtual;
            const valorAtualBRL = valorAtualUSD * cotacaoDolar.valor;
            
            if (ativosAgregados[ativo.nome]) {
              ativosAgregados[ativo.nome].valorUSD += valorAtualUSD;
              ativosAgregados[ativo.nome].valorBRL += valorAtualBRL;
              ativosAgregados[ativo.nome].quantidade += ativo.quantidade;
            } else {
              ativosAgregados[ativo.nome] = {
                nome: ativo.nome,
                valorUSD: valorAtualUSD,
                valorBRL: valorAtualBRL,
                quantidade: ativo.quantidade
              };
            }
          } else {
            // Se não encontrar o preço, assume que o valorTotal está em BRL
            const valorAtualUSD = ativo.valorTotal / cotacaoDolar.valor;
            if (ativosAgregados[ativo.nome]) {
              ativosAgregados[ativo.nome].valorUSD += valorAtualUSD;
              ativosAgregados[ativo.nome].valorBRL += ativo.valorTotal;
              ativosAgregados[ativo.nome].quantidade += ativo.quantidade;
            } else {
              ativosAgregados[ativo.nome] = {
                nome: ativo.nome,
                valorUSD: valorAtualUSD,
                valorBRL: ativo.valorTotal,
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
        brl: { labels: [], data: [], backgroundColor: [] },
        usd: { labels: [], data: [], backgroundColor: [] }
      });
    }

    // Converter o objeto em um array
    const ativosAtualizados = Object.values(ativosAgregados);

    // Ordenar por valor em USD (maior para menor)
    ativosAtualizados.sort((a, b) => b.valorUSD - a.valorUSD);

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
      brl: {
        labels: ativosAtualizados.map(a => a.nome),
        data: ativosAtualizados.map(a => a.valorBRL),
        backgroundColor: ativosAtualizados.map((_, index) => colors[index % colors.length])
      },
      usd: {
      labels: ativosAtualizados.map(a => a.nome),
        data: ativosAtualizados.map(a => a.valorUSD),
      backgroundColor: ativosAtualizados.map((_, index) => colors[index % colors.length])
      }
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
    
    // Buscar cotação do dólar uma única vez no início
    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    if (!cotacaoDolar) {
      return res.status(500).json({ error: 'Cotação do dólar não encontrada' });
    }

    const dolarRate = cotacaoDolar.valor;
    
    const wallet = await req.db.collection('carteiras').findOne({ 
      _id: new req.ObjectId(id),
      userId: req.userId
    });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }
    
    // Buscar histórico de operações da carteira dos últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // incluindo o mês atual
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    const history = await req.db.collection('historico')
      .find({ 
        carteiraId: new req.ObjectId(id),
        userId: req.userId,
        data: { $gte: sixMonthsAgo }
      })
      .sort({ data: 1 })
      .toArray();
    
    // Inicializar os últimos 6 meses
    const monthlyData = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = {
        aporte: { usd: 0, brl: 0 },
        saldo: { usd: 0, brl: 0 },
        ativos: {},
        custoPorAtivo: {} // Novo campo para rastrear o custo por ativo
      };
    }

    // Processar histórico
    history.forEach(op => {
      const key = `${op.data.getFullYear()}-${String(op.data.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) return;

      const [_, qtdStr, ativo] = op.descricao.split(' ');
      const qtd = parseFloat(qtdStr);

      if (op.tipo === 'compra') {
        monthlyData[key].ativos[ativo] = (monthlyData[key].ativos[ativo] || 0) + qtd;
        monthlyData[key].aporte.brl += op.valor;
        monthlyData[key].aporte.usd += op.valorDolar || (op.valor / dolarRate);
        
        // Armazenar o custo por ativo
        if (!monthlyData[key].custoPorAtivo[ativo]) {
          monthlyData[key].custoPorAtivo[ativo] = {
            brl: 0,
            usd: 0,
            quantidade: 0
          };
        }
        monthlyData[key].custoPorAtivo[ativo].brl += op.valor;
        monthlyData[key].custoPorAtivo[ativo].usd += op.valorDolar || (op.valor / dolarRate);
        monthlyData[key].custoPorAtivo[ativo].quantidade += qtd;
      } else if (op.tipo === 'venda') {
        monthlyData[key].ativos[ativo] = (monthlyData[key].ativos[ativo] || 0) - qtd;
        
        // Calcular o custo proporcional da venda
        let custoTotalBRL = 0;
        let custoTotalUSD = 0;
        let quantidadeTotal = 0;
        
        // Somar todos os custos anteriores do ativo
        for (const prevKey of Object.keys(monthlyData).sort()) {
          if (prevKey > key) break;
          if (monthlyData[prevKey].custoPorAtivo[ativo]) {
            custoTotalBRL += monthlyData[prevKey].custoPorAtivo[ativo].brl;
            custoTotalUSD += monthlyData[prevKey].custoPorAtivo[ativo].usd;
            quantidadeTotal += monthlyData[prevKey].custoPorAtivo[ativo].quantidade;
          }
        }
        
        // Calcular o custo proporcional da quantidade vendida
        if (quantidadeTotal > 0) {
          const proporcao = qtd / quantidadeTotal;
          const custoVendaBRL = custoTotalBRL * proporcao;
          const custoVendaUSD = custoTotalUSD * proporcao;
          
          // Diminuir o aporte proporcionalmente
          monthlyData[key].aporte.brl -= custoVendaBRL;
          monthlyData[key].aporte.usd -= custoVendaUSD;
          
          // Atualizar o custo por ativo
          if (!monthlyData[key].custoPorAtivo[ativo]) {
            monthlyData[key].custoPorAtivo[ativo] = {
              brl: 0,
              usd: 0,
              quantidade: 0
            };
          }
          monthlyData[key].custoPorAtivo[ativo].brl -= custoVendaBRL;
          monthlyData[key].custoPorAtivo[ativo].usd -= custoVendaUSD;
          monthlyData[key].custoPorAtivo[ativo].quantidade -= qtd;
        }
      }
    });
    
    // Ordenar meses
    const sortedMonths = Object.keys(monthlyData).sort();
    
    // Calcular saldos acumulados
    for (let i = 0; i < sortedMonths.length; i++) {
      const monthKey = sortedMonths[i];
      const [year, month] = monthKey.split('-');
      let saldoMesUSD = 0;
      let saldoMesBRL = 0;
      let custoAcumuladoUSD = 0;
      let custoAcumuladoBRL = 0;

      const ativosAcumulados = {};

      for (let j = 0; j <= i; j++) {
        const prevKey = sortedMonths[j];
        const data = monthlyData[prevKey];

        for (const [ativo, qtd] of Object.entries(data.ativos)) {
          ativosAcumulados[ativo] = (ativosAcumulados[ativo] || 0) + qtd;
        }

        custoAcumuladoUSD += data.aporte.usd;
        custoAcumuladoBRL += data.aporte.brl;
      }

      for (const [ativo, qtd] of Object.entries(ativosAcumulados)) {
        if (qtd <= 0) continue;

        const crypto = await req.db.collection('precos_teste').findOne({ nome: ativo });
        if (!crypto?.precos?.length) continue;

        const precos = crypto.precos.filter(p => {
          const d = new Date(p.timestamp);
          return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(month);
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const preco = precos[0];
        if (!preco) continue;

        saldoMesUSD += qtd * preco.close;
        saldoMesBRL += qtd * preco.close * dolarRate;
      }

      monthlyData[monthKey].saldo = { usd: saldoMesUSD, brl: saldoMesBRL };
      monthlyData[monthKey].aporte = { usd: custoAcumuladoUSD, brl: custoAcumuladoBRL };
    }

    const labels = sortedMonths.map(key => {
      const [y, m] = key.split('-');
      const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${nomes[parseInt(m) - 1]}/${y.slice(-2)}`;
    });
    
    res.json({
      labels,
      datasets: {
        brl: [
          {
            label: 'Custo Total (BRL)',
            data: sortedMonths.map(key => monthlyData[key].aporte.brl),
            borderColor: '#9b87f5',
            backgroundColor: 'rgba(155, 135, 245, 0.1)',
          },
          {
            label: 'Valor Total (BRL)',
            data: sortedMonths.map(key => monthlyData[key].saldo.brl),
            borderColor: '#00e4ca',
            backgroundColor: 'rgba(0, 228, 202, 0.1)',
          }
        ],
        usd: [
          {
            label: 'Custo Total (USD)',
            data: sortedMonths.map(key => monthlyData[key].aporte.usd),
          borderColor: '#9b87f5',
          backgroundColor: 'rgba(155, 135, 245, 0.1)',
        },
        {
            label: 'Valor Total (USD)',
            data: sortedMonths.map(key => monthlyData[key].saldo.usd),
          borderColor: '#00e4ca',
          backgroundColor: 'rgba(0, 228, 202, 0.1)',
        }
      ]
      }
    });

  } catch (error) {
    console.error('Erro ao obter dados para gráfico de performance:', error);
    res.status(500).json({ error: 'Erro ao obter dados para gráfico de performance' });
  }
};


// Retorna dados para um gráfico de linha ou barras, mostrando a relação entre aporte e saldo geral
exports.getGeneralPerformanceChart = async (req, res) => {
  try {
    const wallets = await req.db.collection('carteiras').find({ userId: req.userId }).toArray();
    if (!wallets.length) {
      return res.json({
        labels: [],
        datasets: { brl: [], usd: [] }
      });
    }

    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne({}, { sort: { timestamp: -1 } });
    if (!cotacaoDolar) {
      return res.status(500).json({ error: 'Cotação do dólar não encontrada' });
    }
    const dolarRate = cotacaoDolar.valor;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    const history = await req.db.collection('historico')
      .find({ 
        userId: req.userId,
        carteiraId: { $in: wallets.map(w => w._id) },
        data: { $gte: sixMonthsAgo }
      })
      .sort({ data: 1 })
      .toArray();
    
    const monthlyData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = {
        aporte: { usd: 0, brl: 0 },
        saldo: { usd: 0, brl: 0 },
        ativos: {},
        custoPorAtivo: {} // Novo campo para rastrear o custo por ativo
      };
    }

    history.forEach(op => {
      const key = `${op.data.getFullYear()}-${String(op.data.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) return;
      const [_, qtdStr, ativo] = op.descricao.split(' ');
      const qtd = parseFloat(qtdStr);
      if (op.tipo === 'compra') {
        monthlyData[key].ativos[ativo] = (monthlyData[key].ativos[ativo] || 0) + qtd;
        monthlyData[key].aporte.brl += op.valor;
        monthlyData[key].aporte.usd += op.valorDolar || (op.valor / dolarRate);
        
        // Armazenar o custo por ativo
        if (!monthlyData[key].custoPorAtivo[ativo]) {
          monthlyData[key].custoPorAtivo[ativo] = {
            brl: 0,
            usd: 0,
            quantidade: 0
          };
        }
        monthlyData[key].custoPorAtivo[ativo].brl += op.valor;
        monthlyData[key].custoPorAtivo[ativo].usd += op.valorDolar || (op.valor / dolarRate);
        monthlyData[key].custoPorAtivo[ativo].quantidade += qtd;
      } else if (op.tipo === 'venda') {
        monthlyData[key].ativos[ativo] = (monthlyData[key].ativos[ativo] || 0) - qtd;
        
        // Calcular o custo proporcional da venda
        let custoTotalBRL = 0;
        let custoTotalUSD = 0;
        let quantidadeTotal = 0;
        
        // Somar todos os custos anteriores do ativo
        for (const prevKey of Object.keys(monthlyData).sort()) {
          if (prevKey > key) break;
          if (monthlyData[prevKey].custoPorAtivo[ativo]) {
            custoTotalBRL += monthlyData[prevKey].custoPorAtivo[ativo].brl;
            custoTotalUSD += monthlyData[prevKey].custoPorAtivo[ativo].usd;
            quantidadeTotal += monthlyData[prevKey].custoPorAtivo[ativo].quantidade;
          }
        }
        
        // Calcular o custo proporcional da quantidade vendida
        if (quantidadeTotal > 0) {
          const proporcao = qtd / quantidadeTotal;
          const custoVendaBRL = custoTotalBRL * proporcao;
          const custoVendaUSD = custoTotalUSD * proporcao;
          
          // Diminuir o aporte proporcionalmente
          monthlyData[key].aporte.brl -= custoVendaBRL;
          monthlyData[key].aporte.usd -= custoVendaUSD;
          
          // Atualizar o custo por ativo
          if (!monthlyData[key].custoPorAtivo[ativo]) {
            monthlyData[key].custoPorAtivo[ativo] = {
              brl: 0,
              usd: 0,
              quantidade: 0
            };
          }
          monthlyData[key].custoPorAtivo[ativo].brl -= custoVendaBRL;
          monthlyData[key].custoPorAtivo[ativo].usd -= custoVendaUSD;
          monthlyData[key].custoPorAtivo[ativo].quantidade -= qtd;
        }
      }
    });
    
    const sortedMonths = Object.keys(monthlyData).sort();
    
    for (let i = 0; i < sortedMonths.length; i++) {
      const key = sortedMonths[i];
      const [year, month] = key.split('-');
      let saldoUSD = 0;
      let saldoBRL = 0;
      let aporteUSD = 0;
      let aporteBRL = 0;
      const ativosAcumulados = {};

      for (let j = 0; j <= i; j++) {
        const prevKey = sortedMonths[j];
        const data = monthlyData[prevKey];
        aporteUSD += data.aporte.usd;
        aporteBRL += data.aporte.brl;
        for (const [ativo, qtd] of Object.entries(data.ativos)) {
          ativosAcumulados[ativo] = (ativosAcumulados[ativo] || 0) + qtd;
        }
      }

      for (const [ativo, qtd] of Object.entries(ativosAcumulados)) {
        if (qtd <= 0) continue;
        const crypto = await req.db.collection('precos_teste').findOne({ nome: ativo });
        if (!crypto?.precos?.length) continue;

        const precos = crypto.precos.filter(p => {
          const d = new Date(p.timestamp);
          return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(month);
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const preco = precos[0];
        if (!preco) continue;

        saldoUSD += qtd * preco.close;
        saldoBRL += qtd * preco.close * dolarRate;
      }

      monthlyData[key].saldo = { usd: saldoUSD, brl: saldoBRL };
      monthlyData[key].aporte = { usd: aporteUSD, brl: aporteBRL };
    }

    const labels = sortedMonths.map(k => {
      const [y, m] = k.split('-');
      const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${nomes[parseInt(m) - 1]}/${y.slice(-2)}`;
    });
    
    res.json({
      labels,
      datasets: {
        brl: [
          {
            label: 'Custo Total (BRL)',
            data: sortedMonths.map(k => monthlyData[k].aporte.brl),
            borderColor: '#9b87f5',
            backgroundColor: 'rgba(155, 135, 245, 0.1)',
          },
          {
            label: 'Valor Total (BRL)',
            data: sortedMonths.map(k => monthlyData[k].saldo.brl),
            borderColor: '#00e4ca',
            backgroundColor: 'rgba(0, 228, 202, 0.1)',
          }
        ],
        usd: [
          {
            label: 'Custo Total (USD)',
            data: sortedMonths.map(k => monthlyData[k].aporte.usd),
          borderColor: '#9b87f5',
          backgroundColor: 'rgba(155, 135, 245, 0.1)',
        },
        {
            label: 'Valor Total (USD)',
            data: sortedMonths.map(k => monthlyData[k].saldo.usd),
          borderColor: '#00e4ca',
          backgroundColor: 'rgba(0, 228, 202, 0.1)',
        }
      ]
      }
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
    const allCryptos = await req.db.collection('criptomoedas_teste').find({}).toArray();
    
    if (!allCryptos || allCryptos.length === 0) {
      return res.status(404).json({ error: 'Nenhuma criptomoeda encontrada' });
    }
    
    // Processar e organizar as criptomoedas pela variação
    const processedCryptos = allCryptos.map(crypto => ({
      nome: crypto.nome,
      sigla: crypto.simbolo || '',
      preco: {
        brl: crypto.precoAtualReal || 0,
        usd: crypto.precoAtual || 0
      },
      variacao24h: crypto.variacao24h || 0
    }));
    
    // Ordenar todas as criptomoedas por variação (maior para menor)
    processedCryptos.sort((a, b) => b.variacao24h - a.variacao24h);
    
    // Pegar os 10 primeiros (maiores variações positivas)
    const top10 = processedCryptos.slice(0, 10);
    
    // Pegar os 10 últimos (maiores variações negativas)
    const bottom10 = processedCryptos.slice(-10);
    
    // Resposta final com as 10 maiores e 10 menores variações
    const response = {
      positivas: top10,
      negativas: bottom10
    };
    
    res.json(response);
  } catch (error) {
    console.error('Erro ao obter as maiores variações:', error);
    res.status(500).json({ error: 'Erro ao obter as maiores variações' });
  }
};
