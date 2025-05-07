import React, { useState, useEffect } from 'react';
import { FaFilter, FaSort, FaSortUp, FaSortDown, FaTrash, FaRedo } from 'react-icons/fa';
import { useCurrency } from "../../contexts/CurrencyContext";

function Filtros() {
  const { currency } = useCurrency();
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('diario');
  const [selectedInterval, setSelectedInterval] = useState('14');
  const [modalSelectedPeriod, setModalSelectedPeriod] = useState('');
  const [modalSelectedInterval, setModalSelectedInterval] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [tableHeight, setTableHeight] = useState(0);
  const [rowHeight, setRowHeight] = useState(0);
  const [newFilter, setNewFilter] = useState({
    indicador: 'rsi',
    tipo: 'lento',
    periodo: '7',
    timeframe: '4h',
    operador: '>',
    valor: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'capitalizacao',
    direction: 'desc'
  });
  const [selectedIndicador, setSelectedIndicador] = useState(null);
  const [selectedIndicadorFilter, setSelectedIndicadorFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Novos estados para o dropdown de valores
  const [showValueDropdown, setShowValueDropdown] = useState(false);
  const [selectedValueItem, setSelectedValueItem] = useState(null);
  const [filteredValues, setFilteredValues] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [inputValues, setInputValues] = useState({});

  const indicadores = [
    {
      nome: 'RSI',
      tipos: ['lento', 'rapido'],
      periodos: ['7', '14'],
      timeframes: ['4h', 'diario', 'semanal', 'mensal']
    },
    {
      nome: 'MACD',
      tipos: ['lento', 'rapido'],
      periodos: ['7', '14'],
      timeframes: ['4h', 'diario', 'semanal', 'mensal']
    },
    {
      nome: 'ESTOCÁSTICO',
      tipos: ['lento', 'rapido'],
      periodos: ['7', '14'],
      timeframes: ['4h', 'diario', 'semanal', 'mensal']
    },
    {
      nome: 'EMA',
      tipos: [''],
      periodos: ['20', '50', '100'],
      timeframes: ['diario']
    }
  ];

  // Estilos para o card da tabela
  const cardStyles = {
    semFiltros: {
      height: 'calc(100vh - 149px)',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    },
    comFiltros: {
      height: 'calc(100vh - 149px)',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'desc' ? <FaSortUp /> : <FaSortDown />;
  };

  const getSortedCryptos = () => {
    if (!sortConfig.key) return cryptos;

    return [...cryptos].sort((a, b) => {
      let aValue = a;
      let bValue = b;

      // Adjust the key based on currency for specific fields
      let key = sortConfig.key;
      if (currency === 'USD') {
        if (key === 'precoAtual') key = 'precoAtualDolar';
        else if (key === 'volume24h') key = 'volume24hDolar';
        else if (key === 'capitalizacao') key = 'capitalizacaoDolar';
      }

      // Navegar através do objeto para obter o valor correto
      const keys = key.split('.');
      keys.forEach(k => {
        if (aValue) aValue = aValue[k];
        if (bValue) bValue = bValue[k];
      });

      // Se o valor for um array, pegar o último elemento
      if (Array.isArray(aValue)) aValue = aValue[aValue.length - 1];
      if (Array.isArray(bValue)) bValue = bValue[bValue.length - 1];

      // Converter para número se possível
      if (!isNaN(aValue) && !isNaN(bValue)) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (aValue < bValue) return sortConfig.direction === 'desc' ? 1 : -1;
      if (aValue > bValue) return sortConfig.direction === 'desc' ? -1 : 1;
      return 0;
    });
  };

  // Calcular índices para paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const sortedCryptos = getSortedCryptos();
  const currentItems = sortedCryptos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(cryptos.length / itemsPerPage);

  // Função para mudar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Resetar para a primeira página quando os filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [cryptos]);

  // Carregar filtros do localStorage ao iniciar
  useEffect(() => {
    const savedFilters = localStorage.getItem('savedFilters');
    if (savedFilters) {
      const parsedFilters = JSON.parse(savedFilters);
      setFilters(parsedFilters);
      fetchCryptos(parsedFilters);
    } else {
      fetchCryptos();
    }
  }, []);

  // Adicionar logs para debug
  useEffect(() => {
    if (cryptos.length > 0) {
      console.log('Dados das criptomoedas:', cryptos[0]);
      console.log('Estrutura dos indicadores:', cryptos[0].indicadores);
    }
  }, [cryptos]);

  // Medir a altura da tabela e das linhas
  useEffect(() => {
    const measureTable = () => {
      const cardElement = document.getElementById('cryptoTableCard');
      if (cardElement) {
        // Altura total do card menos padding e margens
        const cardStyle = window.getComputedStyle(cardElement);
        const cardPadding = parseFloat(cardStyle.paddingTop) + parseFloat(cardStyle.paddingBottom);
        
        // Alturas fixas
        const headerHeight = 30; // Altura fixa do cabeçalho da tabela
        const footerHeight = 110; // Altura fixa do rodapé (pagination + info)
        
        // Altura disponível para as linhas
        const availableHeight = cardElement.clientHeight - cardPadding - headerHeight - footerHeight;
        
        setTableHeight(availableHeight);
      }

      const firstRow = document.querySelector('tbody tr');
      if (firstRow) {
        const rowHeight = firstRow.clientHeight;
        setRowHeight(rowHeight);
      }
    };

    // Medir após o carregamento dos dados
    if (!loading && cryptos.length > 0) {
      // Pequeno delay para garantir que o DOM foi renderizado
      setTimeout(measureTable, 100);
    }

    // Adicionar listener para redimensionamento da janela
    window.addEventListener('resize', measureTable);
    return () => window.removeEventListener('resize', measureTable);
  }, [loading, cryptos]);

  // Calcular o número de itens por página com base na altura disponível
  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (rowHeight > 0 && tableHeight > 0) {
        // Calcular quantos itens cabem na altura disponível
        const itemsThatFit = Math.floor(tableHeight / rowHeight);
        // Garantir pelo menos 5 itens por página
        const newItemsPerPage = Math.max(5, itemsThatFit);
        setItemsPerPage(newItemsPerPage);
      }
    };

    calculateItemsPerPage();
  }, [tableHeight, rowHeight]);

  const fetchCryptos = async (filtersToApply = []) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let response;
      if (filtersToApply.length > 0) {
        // Se houver filtros, aplicar filtragem
        console.log('Filtros a serem aplicados:', JSON.stringify(filtersToApply, null, 2));
        response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/cripto/filtrar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filters: filtersToApply })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erro na resposta do servidor:', errorText);
          throw new Error(`Erro ao filtrar criptomoedas: ${errorText}`);
        }
      } else {
        // Se não houver filtros, buscar todas as criptomoedas
        console.log('Buscando todas as criptomoedas');
        response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/cripto/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erro na resposta do servidor:', errorText);
          throw new Error(`Erro ao carregar criptomoedas: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      setCryptos(data);
    } catch (err) {
      console.error('Erro detalhado:', err);
      setError(err.message || 'Erro ao carregar criptomoedas');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setNewFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddFilter = (indicador, tipo, periodo, timeframe, operador, valor) => {
    console.log('valor: ', valor);
    // Se o valor for uma string que representa um indicador (ex: "RSI LENTO (7, 4H)")
    let formattedValue = valor;
    console.log('tipo do valor: ', typeof valor === 'string');
    if (typeof valor === 'string') {
      // Substitui ESTOCÁSTICO por ESTOCASTICO no início da string
      const valorNormalizado = valor.replace(/^ESTOCÁSTICO/, 'ESTOCASTICO');
      console.log('valor normalizado: ', valorNormalizado);
      
      // Extrai as informações do indicador do formato de exibição
      const match = valorNormalizado.match(/([A-Z]+)(?:\s+([A-Z]+))?\s+\((\d+),\s*([A-Z0-9]+)\)/);
      if (match) {
        const [_, indicadorValor, tipoValor, periodoValor, timeframeValor] = match;
        
        // Converte o timeframe para o formato esperado
        const timeframeMap = {
          'D': 'diario',
          'S': 'semanal',
          'M': 'mensal',
          '4H': '4h'
        };

        // Cria o objeto no formato esperado pelo backend
        formattedValue = {
          indicador: indicadorValor.toLowerCase(),
          tipo: tipoValor ? tipoValor.toLowerCase() : '',
          periodo: `periodo${periodoValor}`,
          timeframe: timeframeMap[timeframeValor] || timeframeValor.toLowerCase()
        };
      }
    } else if (!isNaN(valor)) {
      // Se for um número, converte para float
      formattedValue = parseFloat(valor);
    }

    const novoFiltro = {
      indicador: indicador.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      tipo: tipo || '',
      periodo: `periodo${periodo}`,
      timeframe: timeframe,
      operador: operador,
      valor: formattedValue,
      useCurrent: true
    };
    
    setFilters(prev => {
      // Remove filtro existente com mesmo indicador, tipo, periodo e timeframe
      const filtrosSemDuplicados = prev.filter(f => 
        !(f.indicador === novoFiltro.indicador && 
          f.tipo === novoFiltro.tipo && 
          f.periodo === novoFiltro.periodo && 
          f.timeframe === novoFiltro.timeframe)
      );

      // Adiciona o novo filtro
      const newFilters = [...filtrosSemDuplicados, novoFiltro];
      
      // Aplica os filtros e salva no localStorage
      const filtersToApply = newFilters.map(filter => ({
        indicador: filter.indicador,
        timeframe: filter.timeframe,
        periodo: filter.periodo,
        operador: filter.operador,
        valor: filter.valor,
        tipo: filter.tipo,
        useCurrent: true
      }));
      
      // Salva no localStorage antes de aplicar os filtros
      localStorage.setItem('savedFilters', JSON.stringify(newFilters));
      
      // Aplica os filtros após salvar
      fetchCryptos(filtersToApply);
      
      return newFilters;
    });
  };

  const handleRemoveFilter = (indicador, tipo, periodo, timeframe) => {
    setFilters(prev => {
      const indicadorNormalizado = indicador.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const newFilters = prev.filter(filter => 
        !(filter.indicador === indicadorNormalizado && 
          filter.tipo === tipo && 
          filter.periodo === `periodo${periodo}` && 
          filter.timeframe === timeframe)
      );
      
      // Atualiza o localStorage com os filtros restantes
      localStorage.setItem('savedFilters', JSON.stringify(newFilters));
      
      if (newFilters.length === 0) {
        fetchCryptos();
      } else {
        const filtersToApply = newFilters.map(filter => ({
          indicador: filter.indicador,
          timeframe: filter.timeframe,
          periodo: filter.periodo,
          operador: filter.operador,
          valor: filter.valor,
          tipo: filter.tipo,
          useCurrent: true
        }));
        fetchCryptos(filtersToApply);
      }
      return newFilters;
    });
  };

  const getFilterLabel = (indicador, tipo, periodo, timeframe) => {
    const tipoStr = tipo ? ` ${tipo.toUpperCase()}` : '';
    const timeframeStr = timeframe === 'diario' ? 'D' : 
                        timeframe === 'semanal' ? 'S' : 
                        timeframe === 'mensal' ? 'M' : '4H';
    return `${indicador}${tipoStr} (${periodo}, ${timeframeStr})`;
  };

  const formatCurrency = (value) => {
    // Se o valor for muito pequeno (menor que 0.0001), usar mais casas decimais
    const minimumFractionDigits = Math.abs(value) < 0.0001 ? 8 : 2;
    const maximumFractionDigits = Math.abs(value) < 0.0001 ? 8 : 2;

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL',
      currencyDisplay: 'symbol',
      minimumFractionDigits,
      maximumFractionDigits
    }).format(value);
  };

  const truncateText = (text, maxLength = 20) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '0.00%';
    return `${value > 0 ? '+' : ''}${Number(value).toFixed(2)}%`;
  };

  const handleApplyFilters = () => {
    if (filters.length === 0) {
      // Se não houver filtros, buscar todas as criptomoedas
      fetchCryptos();
      setShowFilterModal(false);
      return;
    }

    const filtersToApply = filters.map(filter => {
      let timeframe = modalSelectedPeriod || filter.timeframe;
      let periodo = modalSelectedInterval || filter.periodo;
      
      // Ajustar o timeframe e periodo com base no tipo para RSI, Estocástico e MACD
      if (filter.indicador === 'rsi' || filter.indicador === 'estocastico' || filter.indicador === 'macd') {
        timeframe = filter.tipo;
        periodo = filter.periodo;
      }
      
      return {
        indicador: filter.indicador,
        timeframe,
        periodo,
        operador: filter.operador,
        valor: parseFloat(filter.valor),
        tipo: filter.tipo,
        useCurrent: true
      };
    });

    console.log('Filtros a serem aplicados:', filtersToApply);
    fetchCryptos(filtersToApply);
    setShowFilterModal(false);
  };

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  const handleIntervalChange = (e) => {
    setSelectedInterval(e.target.value);
  };

  const handleIndicadorFilterChange = (e) => {
    setSelectedIndicadorFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getFilteredIndicadores = () => {
    return indicadores.map(indicador => {
      // Se tiver um indicador selecionado e não for o atual, pula
      if (selectedIndicadorFilter) {
        const indicadorNormalizado = indicador.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const filtroNormalizado = selectedIndicadorFilter.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (indicadorNormalizado !== filtroNormalizado) {
          return null;
        }
      }

      // Se tiver um termo de pesquisa, filtra por ele
      if (searchTerm) {
        // Criar uma string completa com todas as informações do indicador
        const searchableText = indicador.tipos.map(tipo => {
          return indicador.periodos.map(periodo => {
            return indicador.timeframes.map(timeframe => {
              return getFilterLabel(indicador.nome, tipo, periodo, timeframe).toLowerCase();
            }).join(' ');
          }).join(' ');
        }).join(' ');

        const searchNormalizado = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const textoNormalizado = searchableText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        if (!textoNormalizado.includes(searchNormalizado)) {
          return null;
        }
      }

      // Para EMA, só mostra se for diário ou se não tiver período selecionado
      if (indicador.nome === 'EMA') {
        if (modalSelectedPeriod && modalSelectedPeriod !== 'diario') {
          return null;
        }
        
        // Se tiver um intervalo selecionado, mostra apenas a EMA correspondente
        if (modalSelectedInterval) {
          return {
            ...indicador,
            periodos: [modalSelectedInterval],
            timeframes: ['diario']
          };
        }
        
        // Se não tiver intervalo selecionado, mostra todas as EMAs
        return {
          ...indicador,
          periodos: ['20', '50', '100'],
          timeframes: ['diario']
        };
      }
      
      // Para outros indicadores, filtra os períodos e timeframes
      const filteredPeriodos = indicador.periodos.filter(periodo => {
        if (!modalSelectedInterval) return true; // Se não houver intervalo selecionado, mostra todos
        return periodo === modalSelectedInterval;
      });

      const filteredTimeframes = indicador.timeframes.filter(timeframe => {
        if (!modalSelectedPeriod) return true; // Se não houver período selecionado, mostra todos
        return timeframe === modalSelectedPeriod;
      });

      return {
        ...indicador,
        periodos: filteredPeriodos,
        timeframes: filteredTimeframes
      };
    }).filter(indicador => indicador !== null);
  };

  const handleSaveFilters = () => {
    // Converte os filtros para o formato esperado pelo backend
    const formattedFilters = filters.map(filter => {
      // Se o valor for uma string que representa um indicador (ex: "EMA (100, D)")
      if (typeof filter.valor === 'string' && filter.valor.includes('(')) {
 

        // Extrai as informações do indicador do formato de exibição
        const match = filter.valor.match(/([A-Z]+)(?:\s+([A-Z]+))?\s+\((\d+),\s*([A-Z])\)/);
        

        if (match) {
          const [_, indicador, tipo, periodo, timeframe] = match;
          
          // Converte o timeframe para o formato esperado
          const timeframeMap = {
            'D': 'diario',
            'S': 'semanal',
            'M': 'mensal',
            '4H': '4h'
          };

          // Retorna o filtro com o valor convertido para o formato de objeto
          return {
            ...filter,
            valor: {
              indicador: indicador.toLowerCase(),
              tipo: tipo ? tipo.toLowerCase() : '',
              periodo: `periodo${periodo}`,
              timeframe: timeframeMap[timeframe] || timeframe.toLowerCase()
            }
          };
        }
      }
      
      // Se não for um indicador, mantém o valor como está
      return filter;
    });

    // Salva os filtros formatados no localStorage
    console.log(formattedFilters)
    localStorage.setItem('savedFilters', JSON.stringify(formattedFilters));
    setShowFilterModal(false);
  };

  // Modifica o onChange do select de condição
  const handleConditionChange = (e, item) => {
    const operador = e.target.value;
    const input = e.target.closest('tr').querySelector('input[type="text"]');
    const valor = input ? input.value : '';
    
    if (operador === '') {
      // Se a condição for limpa, remove o filtro
      handleRemoveFilter(
        item.indicador.nome,
        item.tipo,
        item.periodo,
        item.timeframe
      );
    } else {
      // Adiciona ou atualiza o filtro com o valor atual
      handleAddFilter(
        item.indicador.nome,
        item.tipo,
        item.periodo,
        item.timeframe,
        operador,
        valor
      );
    }
  };

  // Adiciona handler para tecla Enter
  const handleKeyPress = (e, item) => {
    if (e.key === 'Enter' && filteredValues.length > 0) {
      e.preventDefault();
      handleValueSelect(filteredValues[0], item);
    }
  };

  // Função para filtrar valores baseado na busca
  const handleValueSearch = (searchTerm, item) => {
    const itemKey = `${item.indicador.nome}-${item.tipo}-${item.periodo}-${item.timeframe}`;
    setInputValues(prev => ({
      ...prev,
      [itemKey]: searchTerm
    }));
    
    const select = document.querySelector(`tr[data-key="${itemKey}"] select`);
    const operador = select ? select.value : '';
    
    // Se for um operador de cruzamento, força a seleção de um indicador
    if (operador === 'cruzamento_ascendente' || operador === 'cruzamento_descendente') {
      // Para texto, apenas atualiza o estado do input e mostra o dropdown
      if (searchTerm.trim() === '') {
        setFilteredValues(getAvailableValues().slice(0, 5));
        setActiveDropdown(itemKey);
        return;
      }

      const filtered = getAvailableValues()
        .filter(value => 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5);

      setFilteredValues(filtered);
      setActiveDropdown(itemKey);
      return;
    }
    
    // Se for um número, aplica o filtro automaticamente
    if (/^\d*\.?\d*$/.test(searchTerm)) {
      if (searchTerm === '') {
      handleRemoveFilter(
        item.indicador.nome,
        item.tipo,
        item.periodo,
        item.timeframe
      );
    } else {
        // Verifica se já existe um filtro com este indicador
        const existingFilter = filters.find(f => 
          f.indicador === item.indicador.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') && 
          f.tipo === item.tipo && 
          f.periodo === `periodo${item.periodo}` && 
          f.timeframe === item.timeframe
        );

        // Usa o operador existente se houver, senão usa '>'
        const operadorToUse = existingFilter ? existingFilter.operador : '>';

        handleAddFilter(
          item.indicador.nome,
          item.tipo,
          item.periodo,
          item.timeframe,
          operadorToUse,
          searchTerm
        );
      }
      setActiveDropdown(null);
      return;
    }
    
    // Para texto, apenas atualiza o estado do input e mostra o dropdown
    if (searchTerm.trim() === '') {
      setFilteredValues(getAvailableValues().slice(0, 5));
      setActiveDropdown(itemKey);
      return;
    }

    const filtered = getAvailableValues()
      .filter(value => 
        value.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);

    setFilteredValues(filtered);
    setActiveDropdown(itemKey);
  };

  // Função para selecionar um valor do dropdown
  const handleValueSelect = (value, item) => {
    const itemKey = `${item.indicador.nome}-${item.tipo}-${item.periodo}-${item.timeframe}`;
    const select = document.querySelector(`tr[data-key="${itemKey}"] select`);
    const operador = select ? select.value : '';
    
    // Se o valor for uma string que representa um indicador (ex: "RSI LENTO (7, 4H)")
    if (typeof value === 'string' && value.includes('(')) {
      // Substitui ESTOCÁSTICO por ESTOCASTICO no início da string
      const valorNormalizado = value.replace(/^ESTOCÁSTICO/, 'ESTOCASTICO');
      
      // Extrai as informações do indicador do formato de exibição
      const match = valorNormalizado.match(/([A-Z]+)(?:\s+([A-Z]+))?\s+\((\d+),\s*([A-Z0-9]+)\)/);
      if (match) {
        const [_, indicador, tipo, periodo, timeframe] = match;
        
        // Converte o timeframe para o formato esperado
        const timeframeMap = {
          'D': 'diario',
          'S': 'semanal',
          'M': 'mensal',
          '4H': '4h'
        };

        // Cria o objeto no formato esperado pelo backend
        const indicatorValue = {
          indicador: indicador.toLowerCase(),
          tipo: tipo ? tipo.toLowerCase() : '',
          periodo: `periodo${periodo}`,
          timeframe: timeframeMap[timeframe] || timeframe.toLowerCase()
        };

        // Aplica o filtro com o valor convertido
      handleAddFilter(
        item.indicador.nome,
        item.tipo,
        item.periodo,
        item.timeframe,
        operador || '>',
          indicatorValue
        );
      }
    } else {
      // Se for um número, aplica normalmente
      handleAddFilter(
        item.indicador.nome,
        item.tipo,
        item.periodo,
        item.timeframe,
        operador || '>',
        parseFloat(value)
      );
    }
    
    setInputValues(prev => ({
      ...prev,
      [itemKey]: value
    }));
    setActiveDropdown(null);
  };

  // Função para obter valores disponíveis para o dropdown
  const getAvailableValues = () => {
    const values = [];
    
    // Adiciona valores numéricos comuns
    values.push('0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100');
    
    // Adiciona outros indicadores como opções
    getFilteredIndicadores().forEach(indicador => {
      indicador.tipos.forEach(tipo => {
        indicador.periodos.forEach(periodo => {
          indicador.timeframes.forEach(timeframe => {
            // Cria a string de exibição do indicador
            const displayValue = `${indicador.nome.toUpperCase()} ${tipo ? tipo.toUpperCase() : ''} (${periodo}, ${timeframe.toUpperCase()})`.trim();
            values.push(displayValue);
          });
        });
      });
    });
    
    return values;
  };

  // Função para formatar o valor do indicador
  const formatIndicatorValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      const { indicador, tipo, periodo, timeframe } = value;
      const periodoNum = periodo.replace('periodo', '');
      const timeframeMap = {
        'diario': 'D',
        'semanal': 'S',
        'mensal': 'M',
        '4h': '4H'
      };
      const timeframeStr = timeframeMap[timeframe] || timeframe.toUpperCase();
      const tipoStr = tipo ? ` ${tipo.toUpperCase()}` : '';
      return `${indicador.toUpperCase()}${tipoStr} (${periodoNum}, ${timeframeStr})`;
    }
    return value;
  };

  return (
    <div className="container-fluid px-2 py-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Filtros</h2>
        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm"
            value={selectedPeriod}
            onChange={handlePeriodChange}
            style={{ width: '120px' }}
          >
            <option value="4h">4 Horas</option>
            <option value="diario">Diário</option>
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
          </select>
          <select
            className="form-select form-select-sm"
            value={selectedInterval}
            onChange={handleIntervalChange}
            style={{ width: '120px' }}
          >
            <option value="7">7</option>
            <option value="14">14</option>
          </select>
          <button 
            className="btn btn-outline-secondary d-flex align-items-center"
            onClick={() => setShowFilterModal(true)}
          >
            <FaFilter className="me-2" /> Definir Filtros ({filters.length})
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="row g-3">
        <div className="col-12">
          <div 
            id="cryptoTableCard"
            className="card"
            style={cardStyles.semFiltros}
          >
            <div className="card-body p-3 pb-0 pt-1 d-flex flex-column h-100">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-3">Carregando criptomoedas...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                </div>
              ) : cryptos.length === 0 ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="alert alert-warning" role="alert">
                    Nenhuma criptomoeda encontrada com os filtros selecionados.
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-responsive flex-grow-1">
                    <table className="table table-sm fs-10">
                      <thead>
                        <tr>
                          <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer', minWidth: '140px' }}>
                            CRIPTOMOEDA {getSortIcon('nome')}
                          </th>
                          <th onClick={() => handleSort('precoAtual')} style={{ cursor: 'pointer', minWidth: '150px' }}>
                            PREÇO ATUAL {getSortIcon('precoAtual')}
                          </th>
                          <th onClick={() => handleSort('capitalizacao')} style={{ cursor: 'pointer', minWidth: '200px' }}>
                            CAPITALIZAÇÃO DE MERCADO {getSortIcon('capitalizacao')}
                          </th>
                          <th onClick={() => handleSort('volume24h')} style={{ cursor: 'pointer', minWidth: '150px' }}>
                            VOLUME 24H {getSortIcon('volume24h')}
                          </th>
                          <th onClick={() => handleSort(`indicadores.rsi.rapido.${selectedPeriod}.periodo${selectedInterval}`)} style={{ cursor: 'pointer', minWidth: '100px' }}>
                            RSI RÁPIDO {getSortIcon(`indicadores.rsi.rapido.${selectedPeriod}.periodo${selectedInterval}`)}
                          </th>
                          <th onClick={() => handleSort(`indicadores.rsi.lento.${selectedPeriod}.periodo${selectedInterval}`)} style={{ cursor: 'pointer', minWidth: '100px' }}>
                            RSI LENTO {getSortIcon(`indicadores.rsi.lento.${selectedPeriod}.periodo${selectedInterval}`)}
                          </th>
                          <th onClick={() => handleSort(`indicadores.estocastico.rapido.${selectedPeriod}.periodo${selectedInterval}`)} style={{ cursor: 'pointer', minWidth: '140px' }}>
                            ESTOCÁSTICO RÁPIDO {getSortIcon(`indicadores.estocastico.rapido.${selectedPeriod}.periodo${selectedInterval}`)}
                          </th>
                          <th onClick={() => handleSort(`indicadores.estocastico.lento.${selectedPeriod}.periodo${selectedInterval}`)} style={{ cursor: 'pointer', minWidth: '140px' }}>
                            ESTOCÁSTICO LENTO {getSortIcon(`indicadores.estocastico.lento.${selectedPeriod}.periodo${selectedInterval}`)}
                          </th>
                          <th onClick={() => handleSort(`indicadores.macd.${selectedPeriod}.macd`)} style={{ cursor: 'pointer', minWidth: '100px' }}>
                            MACD RÁPIDO {getSortIcon(`indicadores.macd.${selectedPeriod}.macd`)}
                          </th>
                          <th onClick={() => handleSort(`indicadores.macd.${selectedPeriod}.signal`)} style={{ cursor: 'pointer', minWidth: '100px' }}>
                            MACD LENTO {getSortIcon(`indicadores.macd.${selectedPeriod}.signal`)}
                          </th>
                          <th onClick={() => handleSort(`indicadores.ema.rapido.${currency === 'USD' ? 'usd' : 'brl'}.diario.periodo20`)} style={{ cursor: 'pointer', minWidth: '100px' }}>
                            EMA 20D {getSortIcon(`indicadores.ema.rapido.${currency === 'USD' ? 'usd' : 'brl'}.diario.periodo20`)}
                          </th>
                          <th onClick={() => handleSort(`indicadores.ema.rapido.${currency === 'USD' ? 'usd' : 'brl'}.diario.periodo50`)} style={{ cursor: 'pointer', minWidth: '100px' }}>
                            EMA 50D {getSortIcon(`indicadores.ema.rapido.${currency === 'USD' ? 'usd' : 'brl'}.diario.periodo50`)}
                          </th>
                          <th onClick={() => handleSort(`indicadores.ema.rapido.${currency === 'USD' ? 'usd' : 'brl'}.diario.periodo100`)} style={{ cursor: 'pointer', minWidth: '100px' }}>
                            EMA 100D {getSortIcon(`indicadores.ema.rapido.${currency === 'USD' ? 'usd' : 'brl'}.diario.periodo100`)}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map(crypto => (
                          <tr key={crypto._id}>
                            <td>
                              <div className="d-flex align-items-center gap-1">
                                <img 
                                  src={crypto.url_imagem || 'https://logospng.org/wp-content/uploads/bitcoin.png'} 
                                  alt={crypto.nome}
                                  style={{ width: '18px', height: '18px' }}
                                />
                                <div className="d-flex align-items-center gap-1">
                                  <strong title={crypto.nome}>{truncateText(crypto.nome, 15)}</strong>
                                  <small className="text-muted">({crypto.simbolo})</small>
                                </div>
                              </div>
                            </td>
                            <td className="fw-bold">
                              {formatCurrency(currency === 'USD' ? crypto.precoAtual : crypto.precoAtualReal)}
                              <span className={`ms-2 ${crypto.variacao24h >= 0 ? 'text-success' : 'text-danger'}`}>
                                ({formatPercentage(crypto.variacao24h)})
                              </span>
                            </td>
                            <td className="fw-bold">
                              {currency === 'USD' ? 
                                formatCurrency(crypto.capitalizacao) :
                                formatCurrency(crypto.capitalizacaoReal)
                              }
                            </td>
                            <td className="fw-bold">
                              {currency === 'USD' ? 
                                formatCurrency(crypto.volume24h) :
                                formatCurrency(crypto.volume24hReal)
                              }
                            </td>
                            <td className="fw-bold">
                              {crypto.indicadores?.rsi?.rapido?.[selectedPeriod]?.[`periodo${selectedInterval}`]
                                ? parseFloat(Array.isArray(crypto.indicadores.rsi.rapido[selectedPeriod][`periodo${selectedInterval}`]) 
                                    ? crypto.indicadores.rsi.rapido[selectedPeriod][`periodo${selectedInterval}`][1]
                                    : crypto.indicadores.rsi.rapido[selectedPeriod][`periodo${selectedInterval}`]).toFixed(2)
                                : '-'}
                            </td>
                            <td className="fw-bold">
                              {crypto.indicadores?.rsi?.lento?.[selectedPeriod]?.[`periodo${selectedInterval}`]
                                ? parseFloat(Array.isArray(crypto.indicadores.rsi.lento[selectedPeriod][`periodo${selectedInterval}`]) 
                                    ? crypto.indicadores.rsi.lento[selectedPeriod][`periodo${selectedInterval}`][1]
                                    : crypto.indicadores.rsi.lento[selectedPeriod][`periodo${selectedInterval}`]).toFixed(2)
                                : '-'}
                            </td>
                            <td className="fw-bold">
                              {crypto.indicadores?.estocastico?.rapido?.[selectedPeriod]?.[`periodo${selectedInterval}`]
                                ? parseFloat(Array.isArray(crypto.indicadores.estocastico.rapido[selectedPeriod][`periodo${selectedInterval}`]) 
                                    ? crypto.indicadores.estocastico.rapido[selectedPeriod][`periodo${selectedInterval}`][1]
                                    : crypto.indicadores.estocastico.rapido[selectedPeriod][`periodo${selectedInterval}`]).toFixed(2)
                                : '-'}
                            </td>
                            <td className="fw-bold">
                              {crypto.indicadores?.estocastico?.lento?.[selectedPeriod]?.[`periodo${selectedInterval}`]
                                ? parseFloat(Array.isArray(crypto.indicadores.estocastico.lento[selectedPeriod][`periodo${selectedInterval}`]) 
                                    ? crypto.indicadores.estocastico.lento[selectedPeriod][`periodo${selectedInterval}`][1]
                                    : crypto.indicadores.estocastico.lento[selectedPeriod][`periodo${selectedInterval}`]).toFixed(2)
                                : '-'}
                            </td>
                            <td className="fw-bold">
                              {crypto.indicadores?.macd?.[selectedPeriod]?.macd
                                ? parseFloat(Array.isArray(crypto.indicadores.macd[selectedPeriod].macd) 
                                    ? crypto.indicadores.macd[selectedPeriod].macd[1]
                                    : crypto.indicadores.macd[selectedPeriod].macd).toFixed(4)
                                : '-'}
                            </td>
                            <td className="fw-bold">
                              {crypto.indicadores?.macd?.[selectedPeriod]?.signal
                                ? parseFloat(Array.isArray(crypto.indicadores.macd[selectedPeriod].signal) 
                                    ? crypto.indicadores.macd[selectedPeriod].signal[1]
                                    : crypto.indicadores.macd[selectedPeriod].signal).toFixed(4)
                                : '-'}
                            </td>
                            <td className="fw-bold">
                              {crypto.indicadores?.ema?.rapido?.[currency === 'USD' ? 'usd' : 'brl']?.diario?.periodo20
                                ? formatCurrency(Array.isArray(crypto.indicadores.ema.rapido[currency === 'USD' ? 'usd' : 'brl'].diario.periodo20) 
                                    ? crypto.indicadores.ema.rapido[currency === 'USD' ? 'usd' : 'brl'].diario.periodo20[1]
                                    : crypto.indicadores.ema.rapido[currency === 'USD' ? 'usd' : 'brl'].diario.periodo20)
                                : '-'}
                            </td>
                            <td className="fw-bold">
                              {crypto.indicadores?.ema?.rapido?.[currency === 'USD' ? 'usd' : 'brl']?.diario?.periodo50
                                ? formatCurrency(Array.isArray(crypto.indicadores.ema.rapido[currency === 'USD' ? 'usd' : 'brl'].diario.periodo50) 
                                    ? crypto.indicadores.ema.rapido[currency === 'USD' ? 'usd' : 'brl'].diario.periodo50[1]
                                    : crypto.indicadores.ema.rapido[currency === 'USD' ? 'usd' : 'brl'].diario.periodo50)
                                : '-'}
                            </td>
                            <td className="fw-bold">
                              {crypto.indicadores?.ema?.rapido?.[currency === 'USD' ? 'usd' : 'brl']?.diario?.periodo100
                                ? formatCurrency(Array.isArray(crypto.indicadores.ema.rapido[currency === 'USD' ? 'usd' : 'brl'].diario.periodo100) 
                                    ? crypto.indicadores.ema.rapido[currency === 'USD' ? 'usd' : 'brl'].diario.periodo100[1]
                                    : crypto.indicadores.ema.rapido[currency === 'USD' ? 'usd' : 'brl'].diario.periodo100)
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <nav className="mt-auto">
                      <ul className="pagination justify-content-center mb-3">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Anterior
                          </button>
                        </li>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                          <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => paginate(number)}
                            >
                              {number}
                            </button>
                          </li>
                        ))}
                        
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Próxima
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Filtro */}
      {showFilterModal && (
        <div className="modal-backdrop fade show" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1040
        }} onClick={() => setShowFilterModal(false)}></div>
      )}
      
      {showFilterModal && (
        <div className="modal fade show" style={{
          display: 'block',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1050,
          overflow: 'auto'
        }} tabIndex="-1" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '1200px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Definir Filtro</h5>
                <button type="button" className="btn-close" onClick={() => setShowFilterModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '700px', height: '700px', overflowY: 'auto' }}>
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Pesquisar</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Digite para filtrar..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>
                    <div className="col-md-2 px-1">
                      <label className="form-label">Indicador</label>
                      <select
                        className="form-select"
                        value={selectedIndicadorFilter}
                        onChange={handleIndicadorFilterChange}
                      >
                        <option value="">Todos</option>
                        <option value="rsi">RSI</option>
                        <option value="macd">MACD</option>
                        <option value="estocastico">ESTOCÁSTICO</option>
                        <option value="ema">EMA</option>
                      </select>
                    </div>
                    <div className="col-md-2 px-1">
                      <label className="form-label">Período</label>
                      <select
                        className="form-select"
                        value={modalSelectedPeriod}
                        onChange={(e) => setModalSelectedPeriod(e.target.value)}
                      >
                        <option value="">Todos</option>
                        <option value="4h">4 Horas</option>
                        <option value="diario">Diário</option>
                        <option value="semanal">Semanal</option>
                        <option value="mensal">Mensal</option>
                      </select>
                    </div>
                    <div className="col-md-2 ps-1">
                      <label className="form-label">Intervalo</label>
                      <select
                        className="form-select"
                        value={modalSelectedInterval}
                        onChange={(e) => setModalSelectedInterval(e.target.value)}
                      >
                        <option value="">Todos</option>
                        <option value="7">7</option>
                        <option value="14">14</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-0">
                    <div className="col-lg-6 pe-lg-2">
                      <table className="table table-sm mb-0">
                        <tbody>
                          {(() => {
                            const items = [];
                            getFilteredIndicadores().forEach(indicador => {
                              indicador.tipos.forEach(tipo => {
                                indicador.periodos.forEach(periodo => {
                                  indicador.timeframes.forEach(timeframe => {
                                    items.push({ indicador, tipo, periodo, timeframe });
                                  });
                                });
                              });
                            });

                            // Aplicar filtro de pesquisa nos itens
                            const filteredItems = searchTerm 
                              ? items.filter(item => {
                                  const label = getFilterLabel(item.indicador.nome, item.tipo, item.periodo, item.timeframe);
                                  return label.toLowerCase().includes(searchTerm.toLowerCase());
                                })
                              : items;

                            return filteredItems.filter((_, index) => index % 2 === 0).map(item => (
                              <tr key={`${item.indicador.nome}-${item.tipo}-${item.periodo}-${item.timeframe}`}>
                                <td className="align-middle fs-9" style={{ width: '40%' }}>
                                  {getFilterLabel(item.indicador.nome, item.tipo, item.periodo, item.timeframe)}
                                </td>
                                <td style={{ width: '35%' }}>
                                  <select
                                    className="form-select form-select-sm"
                                    placeholder="Condição"
                                    style={{ width: '120px' }}
                                    value={filters.find(f => 
                                      f.indicador === item.indicador.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') && 
                                      f.tipo === item.tipo && 
                                      f.periodo === `periodo${item.periodo}` && 
                                      f.timeframe === item.timeframe
                                    )?.operador || ''}
                                    onChange={(e) => handleConditionChange(e, item)}
                                  >
                                    <option value="">Condição</option>
                                    <option value=">">Maior que</option>
                                    <option value="<">Menor que</option>
                                    <option value=">=">Maior ou igual a</option>
                                    <option value="<=">Menor ou igual a</option>
                                    <option value="=">Igual a</option>
                                    <option value="cruzamento_ascendente">Cruzamento Ascendente</option>
                                    <option value="cruzamento_descendente">Cruzamento Descendente</option>
                                  </select>
                                </td>
                                <td style={{ width: '25%' }}>
                                  <div className="position-relative">
                                  <input
                                      type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Valor"
                                      style={{ width: '180px' }}
                                      value={inputValues[`${item.indicador.nome}-${item.tipo}-${item.periodo}-${item.timeframe}`] || 
                                             formatIndicatorValue(filters.find(f => 
                                               f.indicador === item.indicador.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') && 
                                      f.tipo === item.tipo && 
                                      f.periodo === `periodo${item.periodo}` && 
                                      f.timeframe === item.timeframe
                                             )?.valor) || ''}
                                      onChange={(e) => handleValueSearch(e.target.value, item)}
                                      onKeyPress={(e) => handleKeyPress(e, item)}
                                      onFocus={() => {
                                        setActiveDropdown(null);
                                      }}
                                      onBlur={() => {
                                        setTimeout(() => {
                                          setActiveDropdown(null);
                                        }, 200);
                                      }}
                                    />
                                    {activeDropdown === `${item.indicador.nome}-${item.tipo}-${item.periodo}-${item.timeframe}` && (
                                      <ul className="dropdown-menu show" style={{ maxHeight: '300px', overflowY: 'auto', width: '180px' }}>
                                        {filteredValues.length > 0 ? (
                                          filteredValues.map((value, index) => (
                                            <li key={index}>
                                              <a
                                                className="dropdown-item"
                                                href="#!"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  handleValueSelect(value, item);
                                                }}
                                              >
                                                {value}
                                              </a>
                                            </li>
                                          ))
                                        ) : (
                                          <li>
                                            <a className="dropdown-item" href="#!">
                                              Nenhuma correspondência
                                            </a>
                                          </li>
                                        )}
                                      </ul>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                    <div className="col-lg-6 ps-lg-2 mt-3 mt-lg-0">
                      <table className="table table-sm mb-0">
                        <tbody>
                          {(() => {
                            const items = [];
                            getFilteredIndicadores().forEach(indicador => {
                              indicador.tipos.forEach(tipo => {
                                indicador.periodos.forEach(periodo => {
                                  indicador.timeframes.forEach(timeframe => {
                                    items.push({ indicador, tipo, periodo, timeframe });
                                  });
                                });
                              });
                            });

                            // Aplicar filtro de pesquisa nos itens
                            const filteredItems = searchTerm 
                              ? items.filter(item => {
                                  const label = getFilterLabel(item.indicador.nome, item.tipo, item.periodo, item.timeframe);
                                  return label.toLowerCase().includes(searchTerm.toLowerCase());
                                })
                              : items;

                            return filteredItems.filter((_, index) => index % 2 === 1).map(item => (
                              <tr key={`${item.indicador.nome}-${item.tipo}-${item.periodo}-${item.timeframe}`}>
                                <td className="align-middle fs-9" style={{ width: '40%' }}>
                                  {getFilterLabel(item.indicador.nome, item.tipo, item.periodo, item.timeframe)}
                                </td>
                                <td style={{ width: '35%' }}>
                                  <select
                                    className="form-select form-select-sm"
                                    placeholder="Condição"
                                    style={{ width: '120px' }}
                                    value={filters.find(f => 
                                      f.indicador === item.indicador.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') && 
                                      f.tipo === item.tipo && 
                                      f.periodo === `periodo${item.periodo}` && 
                                      f.timeframe === item.timeframe
                                    )?.operador || ''}
                                    onChange={(e) => handleConditionChange(e, item)}
                                  >
                                    <option value="">Condição</option>
                                    <option value=">">Maior que</option>
                                    <option value="<">Menor que</option>
                                    <option value=">=">Maior ou igual a</option>
                                    <option value="<=">Menor ou igual a</option>
                                    <option value="=">Igual a</option>
                                    <option value="cruzamento_ascendente">Cruzamento Ascendente</option>
                                    <option value="cruzamento_descendente">Cruzamento Descendente</option>
                                  </select>
                                </td>
                                <td style={{ width: '25%' }}>
                                  <div className="position-relative">
                                  <input
                                      type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Valor"
                                      style={{ width: '180px' }}
                                      value={inputValues[`${item.indicador.nome}-${item.tipo}-${item.periodo}-${item.timeframe}`] || 
                                             formatIndicatorValue(filters.find(f => 
                                               f.indicador === item.indicador.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') && 
                                      f.tipo === item.tipo && 
                                      f.periodo === `periodo${item.periodo}` && 
                                      f.timeframe === item.timeframe
                                             )?.valor) || ''}
                                      onChange={(e) => handleValueSearch(e.target.value, item)}
                                      onKeyPress={(e) => handleKeyPress(e, item)}
                                      onFocus={() => {
                                        setActiveDropdown(null);
                                      }}
                                      onBlur={() => {
                                        setTimeout(() => {
                                          setActiveDropdown(null);
                                        }, 200);
                                      }}
                                    />
                                    {activeDropdown === `${item.indicador.nome}-${item.tipo}-${item.periodo}-${item.timeframe}` && (
                                      <ul className="dropdown-menu show my-0" style={{ maxHeight: '300px', overflowY: 'auto', width: '180px' }}>
                                        {filteredValues.length > 0 ? (
                                          filteredValues.map((value, index) => (
                                            <li key={index}>
                                              <a
                                                className="dropdown-item"
                                                href="#!"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  handleValueSelect(value, item);
                                                }}
                                              >
                                                {value}
                                              </a>
                                            </li>
                                          ))
                                        ) : (
                                          <li>
                                            <a className="dropdown-item" href="#!">
                                              Nenhuma correspondência
                                            </a>
                                          </li>
                                        )}
                                      </ul>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-danger me-2"
                  onClick={() => {
                    setFilters([]);
                    localStorage.removeItem('savedFilters');
                    fetchCryptos();
                    setShowFilterModal(false);
                  }}
                >
                  <FaRedo className="me-2" /> Limpar Filtros
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveFilters}
                >
                  Definir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Filtros;