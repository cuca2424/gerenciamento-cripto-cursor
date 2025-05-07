const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.getVendas = async (req, res) => {
  try {
    const { dataInicio, dataFim, periodo } = req.query;
    
    // Buscar todas as vendas do usuário
    const vendas = await req.db.collection('imposto_de_renda')
      .find({ userId: req.userId })
      .sort({ dataVenda: -1 })
      .toArray();
    
    // Buscar cotação do dólar para converter valores
    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    // Encontrar o primeiro e último mês com vendas
    const primeiroMes = vendas.length > 0 ? 
      new Date(vendas[vendas.length - 1].dataVenda) : 
      new Date();
    const ultimoMes = vendas.length > 0 ? 
      new Date(vendas[0].dataVenda) : 
      new Date();

    // Garantir que tenhamos pelo menos 12 meses de histórico
    const dataInicioHistorico = new Date(ultimoMes);
    dataInicioHistorico.setMonth(dataInicioHistorico.getMonth() - 11); // 12 meses atrás (incluindo o mês atual)

    // Inicializar vendasPorMes com todos os meses entre o primeiro e último mês
    const vendasPorMes = {};
    let dataAtual = new Date(dataInicioHistorico.getFullYear(), dataInicioHistorico.getMonth(), 1);
    
    while (dataAtual <= ultimoMes) {
      const mesAno = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, '0')}`;
      vendasPorMes[mesAno] = {
        totalVendas: 0,
        lucroPrejuizo: 0,
        imposto: 0,
        prejuizoAcumuladoMes: 0,
        lucroAjustado: 0,
        aliquota: '0%',
        usd: {
          totalVendas: 0,
          lucroPrejuizo: 0,
          imposto: 0
        }
      };
      // Avançar para o próximo mês
      dataAtual = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 1);
    }

    // Agrupar vendas por mês
    vendas.forEach(venda => {
      const data = new Date(venda.dataVenda);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      
      if (vendasPorMes[mesAno]) {
        vendasPorMes[mesAno].totalVendas += venda.valorVenda;
        vendasPorMes[mesAno].lucroPrejuizo += venda.lucroPrejuizo;
        
        // Calcular valores em USD
        if (cotacaoDolar) {
          vendasPorMes[mesAno].usd.totalVendas += venda.valorVenda / cotacaoDolar.valor;
          vendasPorMes[mesAno].usd.lucroPrejuizo += venda.lucroPrejuizo / cotacaoDolar.valor;
        }
      }
    });

    // Ordenar meses do mais antigo para o mais recente
    const vendasPorMesOrdenadas = Object.entries(vendasPorMes)
      .sort(([mesAnoA], [mesAnoB]) => {
        const [anoA, mesA] = mesAnoA.split('-');
        const [anoB, mesB] = mesAnoB.split('-');
        const dataA = new Date(anoA, mesA - 1);
        const dataB = new Date(anoB, mesB - 1);
        return dataA - dataB;
      });

    // Calcular prejuízo acumulado e lucro ajustado para cada mês
    let prejuizoAcumuladoMes = 0;
    const vendasPorMesComPrejuizo = vendasPorMesOrdenadas.map(([mesAno, dados]) => {
      const lucroMes = dados.lucroPrejuizo;
      let lucroAjustado = lucroMes;
      
      if (lucroMes < 0) {
        prejuizoAcumuladoMes += Math.abs(lucroMes);
      } else if (prejuizoAcumuladoMes > 0) {
        lucroAjustado = Math.max(0, lucroMes - prejuizoAcumuladoMes);
        prejuizoAcumuladoMes = Math.max(0, prejuizoAcumuladoMes - lucroMes);
      }
      
      // Calcular alíquota e imposto com base no lucro ajustado
      let aliquota = '0%';
      let imposto = 0;
      
      if (lucroAjustado > 0 && dados.totalVendas > 35000) {
        if (lucroAjustado <= 5000) {
          aliquota = '15%';
          imposto = lucroAjustado * 0.15;
        } else if (lucroAjustado <= 10000) {
          aliquota = '17,5%';
          imposto = lucroAjustado * 0.175;
        } else if (lucroAjustado <= 30000) {
          aliquota = '20%';
          imposto = lucroAjustado * 0.20;
        } else {
          aliquota = '22,5%';
          imposto = lucroAjustado * 0.225;
        }
      } else if (lucroMes < 0) {
        aliquota = '-';
      }
      
      // Adicionar os novos campos ao objeto de dados
      return {
        mesAno,
        dados: {
          ...dados,
          prejuizoAcumuladoMes,
          lucroAjustado,
          aliquota,
          imposto
        }
      };
    });

    // Converter de volta para o formato original
    const vendasPorMesAtualizado = {};
    vendasPorMesComPrejuizo.forEach(({ mesAno, dados }) => {
      vendasPorMesAtualizado[mesAno] = dados;
    });

    // Determinar o período a ser retornado
    let dataInicioPeriodo = new Date();
    let dataFimPeriodo = new Date();
    
    if (periodo && periodo !== 'personalizado') {
      switch (periodo) {
        case 'este_mes':
          dataInicioPeriodo = new Date(ultimoMes.getFullYear(), ultimoMes.getMonth(), 1);
          dataFimPeriodo = ultimoMes;
          break;
        case 'ultimos_3_meses':
          dataInicioPeriodo = new Date(ultimoMes.getFullYear(), ultimoMes.getMonth() - 2, 1);
          dataFimPeriodo = ultimoMes;
          break;
        case 'ultimos_6_meses':
          dataInicioPeriodo = new Date(ultimoMes.getFullYear(), ultimoMes.getMonth() - 5, 1);
          dataFimPeriodo = ultimoMes;
          break;
        case 'ano_atual':
          dataInicioPeriodo = new Date(ultimoMes.getFullYear(), 0, 1);
          dataFimPeriodo = ultimoMes;
          break;
      }
    } else {
      // Se for período personalizado ou não houver período definido, usar as datas específicas
      if (dataInicio) {
        dataInicioPeriodo = new Date(dataInicio);
        dataInicioPeriodo.setHours(0, 0, 0, 0);
        dataInicioPeriodo.setHours(dataInicioPeriodo.getHours() - 3);
      }
      if (dataFim) {
        dataFimPeriodo = new Date(dataFim);
        dataFimPeriodo.setHours(23, 59, 59, 999);
        dataFimPeriodo.setHours(dataFimPeriodo.getHours() - 3);
      }
    }

    // Filtrar vendasPorMes pelo período solicitado
    const vendasPorMesFiltrado = {};
    Object.keys(vendasPorMesAtualizado).forEach(mes => {
      const [ano, mesNum] = mes.split('-');
      const dataMes = new Date(ano, mesNum - 1);
      
      if (dataMes >= dataInicioPeriodo && dataMes <= dataFimPeriodo) {
        vendasPorMesFiltrado[mes] = vendasPorMesAtualizado[mes];
      }
    });

    // Calcular imposto total apenas para os meses filtrados
    let impostoTotalBRL = 0;
    let impostoTotalUSD = 0;
    Object.values(vendasPorMesFiltrado).forEach(dados => {
      impostoTotalBRL += dados.imposto;
      if (cotacaoDolar) {
        impostoTotalUSD += dados.imposto / cotacaoDolar.valor;
      }
    });

    // Filtrar vendas pelo período solicitado
    const vendasFiltradas = vendas.filter(venda => {
      const dataVenda = new Date(venda.dataVenda);
      return dataVenda >= dataInicioPeriodo && dataVenda <= dataFimPeriodo;
    });

    // Estruturar vendas com valores em BRL e USD
    const vendasFormatadas = vendasFiltradas.map(venda => ({
      ativo: venda.ativo,
      quantidade: venda.quantidade,
      dataVenda: venda.dataVenda,
      carteiraId: venda.carteiraId,
      carteiraNome: venda.carteiraNome,
      brl: {
        valorVenda: venda.valorVenda,
        precoMedio: venda.precoMedio,
        lucroPrejuizo: venda.lucroPrejuizo
      },
      usd: {
        valorVenda: cotacaoDolar ? venda.valorVenda / cotacaoDolar.valor : 0,
        precoMedio: cotacaoDolar ? venda.precoMedio / cotacaoDolar.valor : 0,
        lucroPrejuizo: cotacaoDolar ? venda.lucroPrejuizo / cotacaoDolar.valor : 0
      }
    }));
    
    // Calcular totais em BRL
    const totais = vendasFiltradas.reduce((acc, venda) => {
      acc.valorVenda += venda.valorVenda;
      acc.lucroPrejuizo += venda.lucroPrejuizo;
      return acc;
    }, {
      valorVenda: 0,
      lucroPrejuizo: 0
    });
    
    // Preparar resposta com valores em BRL e USD
    const response = {
      vendas: vendasFormatadas,
      vendasPorMes: vendasPorMesFiltrado,
      totais: {
        brl: {
          valorVenda: totais.valorVenda,
          lucroPrejuizo: totais.lucroPrejuizo
        },
        usd: {
          valorVenda: cotacaoDolar ? totais.valorVenda / cotacaoDolar.valor : 0,
          lucroPrejuizo: cotacaoDolar ? totais.lucroPrejuizo / cotacaoDolar.valor : 0
        }
      },
      prejuizoAcumuladoFinal: {
        brl: vendasPorMesComPrejuizo.length > 0 
          ? vendasPorMesComPrejuizo[vendasPorMesComPrejuizo.length - 1].dados.prejuizoAcumuladoMes 
          : 0,
        usd: cotacaoDolar && vendasPorMesComPrejuizo.length > 0
          ? vendasPorMesComPrejuizo[vendasPorMesComPrejuizo.length - 1].dados.prejuizoAcumuladoMes / cotacaoDolar.valor
          : 0
      },
      impostoTotal: {
        brl: impostoTotalBRL,
        usd: impostoTotalUSD
      }
    };

    // Filtrar a resposta para incluir apenas os meses do período solicitado
    const responseFiltrada = {
      ...response,
      vendasPorMes: Object.fromEntries(
        Object.entries(response.vendasPorMes)
          .filter(([mesAno]) => {
            const [ano, mes] = mesAno.split('-');
            const dataMes = new Date(ano, mes - 1);
            return dataMes >= dataInicioPeriodo && dataMes <= dataFimPeriodo;
          })
      )
    };
    
    console.log('response', responseFiltrada);
    
    res.json(responseFiltrada);
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ error: 'Erro ao buscar vendas' });
  }
};

exports.gerarRelatorioPDF = async (req, res) => {
  try {
    // Definir o ano atual
    const anoAtual = new Date().getFullYear();
    const dataInicioAno = new Date(anoAtual, 0, 1); // 01/01/anoAtual
    const dataFimAno = new Date(anoAtual, 11, 31); // 31/12/anoAtual
    
    // Buscar todas as vendas do usuário do ano atual
    const vendas = await req.db.collection('imposto_de_renda')
      .find({ 
        userId: req.userId,
        dataVenda: {
          $gte: dataInicioAno,
          $lte: dataFimAno
        }
      })
      .sort({ dataVenda: -1 })
      .toArray();
    
    // Buscar cotação do dólar para converter valores
    const cotacaoDolar = await req.db.collection('cotacao_dolar').findOne(
      {},
      { sort: { timestamp: -1 } }
    );

    // Buscar saldos atuais das carteiras
    const carteiras = await req.db.collection('carteiras')
      .find({ userId: req.userId })
      .toArray();

    // Calcular saldos finais e valores de aquisição
    const resumoCriptomoedas = {};
    carteiras.forEach(carteira => {
      carteira.ativos.forEach(ativo => {
        if (!resumoCriptomoedas[ativo.nome]) {
          resumoCriptomoedas[ativo.nome] = {
            saldoFinal: 0,
            valorAquisicao: 0,
            valorAtual: 0
          };
        }
        resumoCriptomoedas[ativo.nome].saldoFinal += ativo.quantidade;
        resumoCriptomoedas[ativo.nome].valorAquisicao += ativo.valorAquisicao;
        resumoCriptomoedas[ativo.nome].valorAtual += ativo.valorAtual;
      });
    });

    // Inicializar vendasPorMes com todos os meses do ano atual
    const vendasPorMes = {};
    let dataAtual = new Date(anoAtual, 0, 1); // Começa em janeiro
    
    while (dataAtual <= dataFimAno) {
      const mesAno = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, '0')}`;
      vendasPorMes[mesAno] = {
        totalVendas: 0,
        lucroPrejuizo: 0,
        imposto: 0,
        prejuizoAcumuladoMes: 0,
        lucroAjustado: 0,
        aliquota: '0%',
        usd: {
          totalVendas: 0,
          lucroPrejuizo: 0,
          imposto: 0
        }
      };
      dataAtual = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 1);
    }

    // Agrupar vendas por mês
    vendas.forEach(venda => {
      const data = new Date(venda.dataVenda);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      
      if (vendasPorMes[mesAno]) {
        vendasPorMes[mesAno].totalVendas += venda.valorVenda;
        vendasPorMes[mesAno].lucroPrejuizo += venda.lucroPrejuizo;
        
        if (cotacaoDolar) {
          vendasPorMes[mesAno].usd.totalVendas += venda.valorVenda / cotacaoDolar.valor;
          vendasPorMes[mesAno].usd.lucroPrejuizo += venda.lucroPrejuizo / cotacaoDolar.valor;
        }
      }
    });

    // Ordenar meses do mais antigo para o mais recente
    const vendasPorMesOrdenadas = Object.entries(vendasPorMes)
      .sort(([mesAnoA], [mesAnoB]) => {
        const [anoA, mesA] = mesAnoA.split('-');
        const [anoB, mesB] = mesAnoB.split('-');
        const dataA = new Date(anoA, mesA - 1);
        const dataB = new Date(anoB, mesB - 1);
        return dataA - dataB;
      });

    // Calcular prejuízo acumulado e lucro ajustado
    let prejuizoAcumuladoMes = 0;
    const vendasPorMesComPrejuizo = vendasPorMesOrdenadas.map(([mesAno, dados]) => {
      const lucroMes = dados.lucroPrejuizo;
      let lucroAjustado = lucroMes;
      
      if (lucroMes < 0) {
        prejuizoAcumuladoMes += Math.abs(lucroMes);
      } else if (prejuizoAcumuladoMes > 0) {
        lucroAjustado = Math.max(0, lucroMes - prejuizoAcumuladoMes);
        prejuizoAcumuladoMes = Math.max(0, prejuizoAcumuladoMes - lucroMes);
      }
      
      let aliquota = '0%';
      let imposto = 0;
      
      if (lucroAjustado > 0 && dados.totalVendas > 35000) {
        if (lucroAjustado <= 5000) {
          aliquota = '15%';
          imposto = lucroAjustado * 0.15;
        } else if (lucroAjustado <= 10000) {
          aliquota = '17,5%';
          imposto = lucroAjustado * 0.175;
        } else if (lucroAjustado <= 30000) {
          aliquota = '20%';
          imposto = lucroAjustado * 0.20;
        } else {
          aliquota = '22,5%';
          imposto = lucroAjustado * 0.225;
        }
      } else if (lucroMes < 0) {
        aliquota = '-';
      }
      
      return {
        mesAno,
        dados: {
          ...dados,
          prejuizoAcumuladoMes,
          lucroAjustado,
          aliquota,
          imposto
        }
      };
    });

    // Criar o PDF
    const doc = new PDFDocument();
    const fileName = `relatorio_imposto_${anoAtual}.pdf`;
    const filePath = path.join(__dirname, '..', 'temp', fileName);
    
    // Garantir que o diretório temp existe
    if (!fs.existsSync(path.join(__dirname, '..', 'temp'))) {
      fs.mkdirSync(path.join(__dirname, '..', 'temp'));
    }

    // Configurar o stream de escrita
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Página 1: Cabeçalho e Operações de Compra e Venda
    doc.fontSize(20).text('Relatório de Imposto de Renda', { align: 'center' });
    doc.moveDown();

    // Informações do ano-calendário
    doc.fontSize(12).text(`Ano-calendário: ${anoAtual}`, 50, doc.y);
    doc.text(`Período de apuração: 01/01/${anoAtual} a 31/12/${anoAtual}`, 50, doc.y + 20);
    doc.moveDown(2);

    // 1. Operações de Compra e Venda
    doc.fontSize(14).text('1. Operações de Compra e Venda', 50, doc.y);
    doc.moveDown();

    // Tabela de Operações
    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidth = 100;
    const rowHeight = 30;

    // Cabeçalho da tabela de operações
    doc.fontSize(12).text('Mês/Ano', tableLeft, tableTop);
    doc.text('Total Vendas', tableLeft + colWidth, tableTop);
    doc.text('Lucro/Prejuízo', tableLeft + colWidth * 2, tableTop);
    doc.text('Prejuízo Acum.', tableLeft + colWidth * 3, tableTop);
    doc.text('Lucro Ajustado', tableLeft + colWidth * 4, tableTop);
    doc.text('Alíquota', tableLeft + colWidth * 5, tableTop);
    doc.text('Imposto Devido', tableLeft + colWidth * 6, tableTop);

    // Dados da tabela de operações
    let y = tableTop + rowHeight;
    let impostoTotal = 0;
    vendasPorMesComPrejuizo.forEach(({ mesAno, dados }) => {
      const [ano, mes] = mesAno.split('-');
      const mesFormatado = new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      doc.fontSize(10).text(mesFormatado, tableLeft, y);
      doc.text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.totalVendas), tableLeft + colWidth, y);
      doc.text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.lucroPrejuizo), tableLeft + colWidth * 2, y);
      doc.text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.prejuizoAcumuladoMes), tableLeft + colWidth * 3, y);
      doc.text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.lucroAjustado), tableLeft + colWidth * 4, y);
      doc.text(dados.aliquota, tableLeft + colWidth * 5, y);
      doc.text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.imposto), tableLeft + colWidth * 6, y);
      
      impostoTotal += dados.imposto;
      y += rowHeight;
    });

    // Página 2: Resumo Final
    doc.addPage();
    doc.fontSize(14).text('2. Resumo Final', 50, doc.y);
    doc.moveDown();

    // Calcular totais
    const totalVendas = vendasPorMesComPrejuizo.reduce((acc, { dados }) => acc + dados.totalVendas, 0);
    const totalLucroPrejuizo = vendasPorMesComPrejuizo.reduce((acc, { dados }) => acc + dados.lucroPrejuizo, 0);

    // Tabela de resumo final
    const tableTopResumoFinal = doc.y;
    const tableLeftResumoFinal = 50;
    const colWidthResumoFinal = 200;
    const rowHeightResumoFinal = 30;

    // Cabeçalho da tabela de resumo final
    doc.fontSize(12).text('Item', tableLeftResumoFinal, tableTopResumoFinal);
    doc.text('Valor', tableLeftResumoFinal + colWidthResumoFinal, tableTopResumoFinal);

    // Dados da tabela de resumo final
    let yResumoFinal = tableTopResumoFinal + rowHeightResumoFinal;
    
    // Total de Vendas
    doc.fontSize(12).text('Total de Vendas', tableLeftResumoFinal, yResumoFinal);
    doc.text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalVendas), tableLeftResumoFinal + colWidthResumoFinal, yResumoFinal);
    yResumoFinal += rowHeightResumoFinal;

    // Lucro/Prejuízo
    doc.fontSize(12).text('Lucro/Prejuízo', tableLeftResumoFinal, yResumoFinal);
    doc.text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalLucroPrejuizo), tableLeftResumoFinal + colWidthResumoFinal, yResumoFinal);
    yResumoFinal += rowHeightResumoFinal;

    // Imposto Devido Total
    doc.fontSize(12).text('Imposto Devido Total', tableLeftResumoFinal, yResumoFinal);
    doc.text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(impostoTotal), tableLeftResumoFinal + colWidthResumoFinal, yResumoFinal);

    // Finalizar o PDF
    doc.end();

    // Enviar o arquivo
    stream.on('finish', () => {
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Erro ao enviar arquivo:', err);
          res.status(500).json({ error: 'Erro ao gerar relatório' });
        }
        // Limpar o arquivo temporário
        fs.unlinkSync(filePath);
      });
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}; 