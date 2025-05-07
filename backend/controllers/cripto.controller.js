// Controller para operações relacionadas a criptomoedas

// Obter todas as criptomoedas
exports.getAllCryptos = async (req, res) => {
  try {
    const cryptos = await req.db.collection('criptomoedas_teste').find({}).toArray();
    res.json(cryptos);
  } catch (error) {
    console.error('Erro ao listar criptomoedas:', error);
    res.status(500).json({ error: 'Erro ao listar criptomoedas' });
  }
};

// Obter uma criptomoeda específica pelo nome
exports.getCryptoByName = async (req, res) => {
  try {
    const { nome } = req.params;
    
    const crypto = await req.db.collection('criptomoedas').findOne({ nome });
    
    if (!crypto) {
      return res.status(404).json({ error: 'Criptomoeda não encontrada' });
    }
    
    res.json(crypto);
  } catch (error) {
    console.error('Erro ao obter criptomoeda:', error);
    res.status(500).json({ error: 'Erro ao obter criptomoeda' });
  }
};

// Adicionar ou atualizar uma criptomoeda
exports.updateCrypto = async (req, res) => {
  try {
    const { nome, simbolo, precoAtual, variacao24h, marketCap, volume24h } = req.body;
    
    if (!nome || !precoAtual) {
      return res.status(400).json({ error: 'Nome e preço atual são obrigatórios' });
    }
    
    const result = await req.db.collection('criptomoedas').updateOne(
      { nome },
      { 
        $set: { 
          nome,
          simbolo,
          precoAtual,
          variacao24h,
          marketCap,
          volume24h,
          ultimaAtualizacao: new Date()
        }
      },
      { upsert: true }
    );
    
    if (result.upsertedCount > 0) {
      res.status(201).json({ message: 'Criptomoeda adicionada com sucesso' });
    } else {
      res.json({ message: 'Criptomoeda atualizada com sucesso' });
    }
  } catch (error) {
    console.error('Erro ao adicionar/atualizar criptomoeda:', error);
    res.status(500).json({ error: 'Erro ao adicionar/atualizar criptomoeda' });
  }
};

// Excluir uma criptomoeda
exports.deleteCrypto = async (req, res) => {
  try {
    const { nome } = req.params;
    
    const result = await req.db.collection('criptomoedas').deleteOne({ nome });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Criptomoeda não encontrada' });
    }
    
    res.json({ message: 'Criptomoeda excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir criptomoeda:', error);
    res.status(500).json({ error: 'Erro ao excluir criptomoeda' });
  }
};

// Função auxiliar para obter o valor de um indicador
const getIndicatorValue = (crypto, indicador, tipo, timeframe, periodo, useCurrent = true) => {
  try {
    let indicadorValue;
    
    // Normalizar o nome do indicador
    const normalizedIndicador = indicador.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    switch (normalizedIndicador) {
      case 'rsi':
        if (timeframe && periodo) {
          const rawValue = crypto.indicadores.rsi[tipo]?.[timeframe]?.[periodo];
          indicadorValue = Array.isArray(rawValue) 
            ? parseFloat(rawValue[useCurrent ? 1 : 0])
            : rawValue ? parseFloat(rawValue) : null;
        }
        break;
      
      case 'estocastico':
        if (timeframe && periodo) {
          const rawValue = crypto.indicadores.estocastico[tipo]?.[timeframe]?.[periodo];
          indicadorValue = Array.isArray(rawValue)
            ? parseFloat(rawValue[useCurrent ? 1 : 0])
            : rawValue ? parseFloat(rawValue) : null;
        }
        break;
      
      case 'ema':
        if (timeframe && periodo) {
          // Ajuste para acessar a estrutura correta da EMA
          const moeda = timeframe === 'usd' || timeframe === 'brl' ? timeframe : 'usd';
          const rawValue = crypto.indicadores.ema.rapido?.[moeda]?.diario?.[periodo];
          indicadorValue = Array.isArray(rawValue)
            ? parseFloat(rawValue[useCurrent ? 1 : 0])
            : rawValue ? parseFloat(rawValue) : null;
        }
        break;

      case 'macd':
        if (timeframe) {
          // Ajuste para acessar a estrutura correta do MACD
          const rawValue = tipo === 'macd' 
            ? crypto.indicadores.macd[timeframe]?.macd
            : crypto.indicadores.macd[timeframe]?.signal;
          indicadorValue = Array.isArray(rawValue)
            ? parseFloat(rawValue[useCurrent ? 1 : 0])
            : rawValue ? parseFloat(rawValue) : null;
        }
        break;
    }
    return indicadorValue;
  } catch (error) {
    console.error('Erro ao acessar indicador:', error);
    return null;
  }
};

// Função auxiliar para comparar valores com base no operador
const compareValues = (value, target, operator) => {
  switch (operator) {
    case '>':
      return value > target;
    case '<':
      return value < target;
    case '>=':
      return value >= target;
    case '<=':
      return value <= target;
    case '=':
      return value === target;
    default:
      return false;
  }
};

// Filtrar criptomoedas por indicadores
exports.filterCryptosByIndicators = async (req, res) => {
  try {
    const { filters } = req.body;
    if (!filters || !Array.isArray(filters) || filters.length === 0) {
      return res.status(400).json({ error: 'Filtros inválidos' });
    }

    // Buscar todas as criptomoedas
    const allCryptos = await req.db.collection('criptomoedas_teste').find({}).toArray();
    
    // Filtrar criptomoedas
    const filteredCryptos = allCryptos.filter(crypto => {
      return filters.every(filter => {
        const { indicador, timeframe, periodo, operador, valor, tipo, useCurrent = true } = filter;
        
        // Verificar se o indicador existe na criptomoeda
        if (!crypto.indicadores || !crypto.indicadores[indicador]) {
          return false;
        }

        // Obter o valor do indicador principal
        const indicadorValue = getIndicatorValue(crypto, indicador, tipo, timeframe, periodo, useCurrent);
        
        // Se não encontrou o valor do indicador ou é inválido, retorna false
        if (indicadorValue === null || isNaN(indicadorValue)) {
          return false;
        }

        // Verificar se o valor é um indicador ou um número
        let compareValue;
        if (typeof valor === 'object' && valor.indicador) {
          // Se for um objeto com indicador, obtém o valor do indicador de comparação
          const { indicador: targetIndicador, tipo: targetTipo, timeframe: targetTimeframe, periodo: targetPeriodo } = valor;

          // Verificar se o indicador alvo existe
          if (!crypto.indicadores || !crypto.indicadores[targetIndicador]) {
            return false;
          }

          compareValue = getIndicatorValue(crypto, targetIndicador, targetTipo, targetTimeframe, targetPeriodo, useCurrent);

          // Se não encontrou o valor do indicador alvo ou é inválido, retorna false
          if (compareValue === null || isNaN(compareValue)) {
            return false;
          }
        } else {
          // Se não for um objeto, converte para número
          compareValue = parseFloat(valor);
          
          // Se o valor não for um número válido, retorna false
          if (isNaN(compareValue)) {
            return false;
          }
        }

        console.log(valor);
        console.log(indicadorValue, compareValue, operador);

        // Comparar o valor com o filtro
        return compareValues(indicadorValue, compareValue, operador);
      });
    });

    res.json(filteredCryptos);
  } catch (error) {
    console.error('Erro ao filtrar criptomoedas:', error);
    res.status(500).json({ error: 'Erro ao filtrar criptomoedas' });
  }
};

// Obter apenas os nomes das criptomoedas
exports.getAllCryptoNames = async (req, res) => {
  try {
    const cryptos = await req.db.collection('criptomoedas')
      .find({})
      .project({ nome: 1 })
      .toArray();
    
    const names = cryptos.map(crypto => crypto.nome);
    res.json(names);
  } catch (error) {
    console.error('Erro ao listar nomes das criptomoedas:', error);
    res.status(500).json({ error: 'Erro ao listar nomes das criptomoedas' });
  }
};
