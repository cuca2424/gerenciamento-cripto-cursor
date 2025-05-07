import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaArrowLeft, FaChartLine, FaHistory, FaExchangeAlt } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrency } from "../../contexts/CurrencyContext";

function Carteiras() {
  const { currency } = useCurrency();
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: ''
  });
  
  // Estado para o modal de confirmação de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState(null);
  
  // Estado para controlar a visualização detalhada
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'detail'
  const [selectedWalletForDetail, setSelectedWalletForDetail] = useState(null);
  const [walletDetails, setWalletDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Estados para venda de ativos
  const [showSellModal, setShowSellModal] = useState(false);
  const [assetToSell, setAssetToSell] = useState(null);
  const [sellFormData, setSellFormData] = useState({
    quantidade: '',
    preco: ''
  });

  // Estados para adicionar aporte
  const [showAddAporteModal, setShowAddAporteModal] = useState(false);
  const [addAporteFormData, setAddAporteFormData] = useState({
    cripto: '',
    preco: '',
    quantidade: ''
  });
  const [saldoDisponivel, setSaldoDisponivel] = useState({
    brl: 0,
    usd: 0
  });

  // Novo estado para lista de criptomoedas e busca
  const [cryptoNames, setCryptoNames] = useState([]);
  const [cryptoSearch, setCryptoSearch] = useState('');
  const [filteredCryptos, setFilteredCryptos] = useState([]);
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);

  const [carteiras, setCarteiras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Adicionar estado para validação
  const [formErrors, setFormErrors] = useState({
    cripto: false,
    preco: false,
    quantidade: false
  });

  useEffect(() => {
    fetchCarteiras();
    fetchCryptoNames(); // Adicionar chamada para buscar nomes das criptos
    if (id) {
      setViewMode('detail');
      fetchWalletDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && carteiras.length > 0) {
      const carteira = carteiras.find(c => c._id === id);
      if (carteira) {
        setSelectedWalletForDetail(carteira);
      }
    }
  }, [carteiras, id]);

  const fetchCarteiras = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteira/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar carteiras');
      }

      const carteirasData = await response.json();
      
      // Para cada carteira, buscar seu saldo
      const carteirasComSaldo = await Promise.all(
        carteirasData.map(async (carteira) => {
          try {
            const saldoResponse = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteira/${carteira._id}/saldo`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (!saldoResponse.ok) {
              console.error(`Erro ao buscar saldo da carteira ${carteira._id}`);
              return {
                ...carteira,
                saldo: { brl: 0, usd: 0 },
                custoTotalCriptos: { brl: 0, usd: 0 },
                lucro: { brl: 0, usd: 0 },
                variacao: 0
              };
            }

            const saldoData = await saldoResponse.json();
            return {
              ...carteira,
              saldo: {
                brl: saldoData.brl?.saldoTotal || 0,
                usd: saldoData.usd?.saldoTotal || 0
              },
              custoTotalCriptos: {
                brl: saldoData.brl?.custoTotalCriptos || 0,
                usd: saldoData.usd?.custoTotalCriptos || 0
              },
              lucro: {
                brl: saldoData.brl?.lucro || 0,
                usd: saldoData.usd?.lucro || 0
              },
              variacao: saldoData.brl?.percentualLucro || 0 // Percentual é o mesmo para ambas moedas
            };
          } catch (error) {
            console.error(`Erro ao processar carteira ${carteira._id}:`, error);
            return {
              ...carteira,
              saldo: { brl: 0, usd: 0 },
              custoTotalCriptos: { brl: 0, usd: 0 },
              lucro: { brl: 0, usd: 0 },
              variacao: 0
            };
          }
        })
      );

      console.log('Carteiras carregadas:', carteirasComSaldo);
      setCarteiras(carteirasComSaldo);
    } catch (err) {
      console.error('Erro ao carregar carteiras:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletDetails = async (walletId) => {
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching wallet details for ID:', walletId);

      // Buscar detalhes da carteira
      const walletResponse = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteira/${walletId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!walletResponse.ok) {
        throw new Error('Erro ao carregar carteira');
      }

      const walletData = await walletResponse.json();
      console.log('Wallet Data:', walletData);

      // Buscar saldo da carteira
      const saldoResponse = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteira/${walletId}/saldo`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!saldoResponse.ok) {
        throw new Error('Erro ao carregar saldo');
      }

      const saldoData = await saldoResponse.json();
      console.log('Saldo Data:', saldoData);

      // Buscar ativos da carteira
      const ativosResponse = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteira/${walletId}/ativos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!ativosResponse.ok) {
        throw new Error('Erro ao carregar ativos');
      }

      const ativosData = await ativosResponse.json();
      console.log('Dados dos ativos recebidos:', ativosData);

      // Verificar se os dados do saldo estão presentes
      if (!saldoData || typeof saldoData !== 'object') {
        throw new Error('Dados do saldo inválidos');
      }

      // Garantir que os valores numéricos sejam tratados corretamente para ambas as moedas
      const saldoTotal = {
        brl: parseFloat(saldoData.brl?.saldoTotal) || 0,
        usd: parseFloat(saldoData.usd?.saldoTotal) || 0
      };
      
      const custoTotalCriptos = {
        brl: parseFloat(saldoData.brl?.custoTotalCriptos) || 0,
        usd: parseFloat(saldoData.usd?.custoTotalCriptos) || 0
      };
      
      const lucroTotal = {
        brl: parseFloat(saldoData.brl?.lucro) || 0,
        usd: parseFloat(saldoData.usd?.lucro) || 0
      };

      const lucroRealizado = {
        brl: parseFloat(saldoData.brl?.lucroRealizado) || 0,
        usd: parseFloat(saldoData.usd?.lucroRealizado) || 0
      };
      
      const variacao = parseFloat(saldoData.brl?.percentualLucro) || 0; // Percentual é o mesmo para ambas moedas

      // Processar os ativos para garantir que todos os valores numéricos sejam tratados
      const processedAtivos = ativosData.map(ativo => {
        const valorUnitario = {
          brl: parseFloat(ativo.valorUnitario) || 0,
          usd: parseFloat(ativo.valorUnitarioDolar) || 0
        };
        
        const precoAtual = {
          brl: parseFloat(ativo.precoAtual) || 0,
          usd: parseFloat(ativo.precoAtualDolar) || 0
        };
        
        const quantidade = parseFloat(ativo.quantidade) || 0;
        
        const valorAtual = {
          brl: quantidade * precoAtual.brl,
          usd: quantidade * precoAtual.usd
        };
        
        // Calcular a variação percentual usando o preço médio e o preço atual
        const variacaoAtivo = valorUnitario.brl > 0 
          ? ((precoAtual.brl - valorUnitario.brl) / valorUnitario.brl) * 100 
          : 0;

        return {
          ...ativo,
          quantidade,
          valorUnitario,
          precoAtual,
          valorAtual,
          variacao: variacaoAtivo
        };
      });

      console.log('Ativos processados:', processedAtivos);

      setWalletDetails({
        ...walletData,
        ativos: processedAtivos,
        saldo: {
          total: saldoTotal,
          aporte: custoTotalCriptos,
          lucro: lucroTotal,
          variacao: variacao
        },
        custoTotalCriptos,
        lucroRealizado
      });

      console.log('Wallet details => ', {
        saldo: {
          total: saldoTotal,
          aporte: custoTotalCriptos,
          lucro: lucroTotal,
          variacao: variacao
        },
        custoTotalCriptos,
        lucroRealizado
      });

    } catch (err) {
      console.error('Error in fetchWalletDetails:', err);
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Prevenir scroll do body quando o modal estiver aberto
  useEffect(() => {
    if (showModal || showDeleteModal || showSellModal || showAddAporteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal, showDeleteModal, showSellModal, showAddAporteModal]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL',
      currencyDisplay: 'symbol'
    }).format(value);
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '0.00%';
    return `${value > 0 ? '+' : ''}${Number(value).toFixed(2)}%`;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const handleOpenModal = () => {
      setFormData({
      nome: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      nome: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteira/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar carteira');
      }

      await fetchCarteiras();
    handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = (wallet) => {
    setWalletToDelete(wallet);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (walletToDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteira/${walletToDelete._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao excluir carteira');
        }

        await fetchCarteiras();
      setShowDeleteModal(false);
      setWalletToDelete(null);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setWalletToDelete(null);
  };

  const handleWalletClick = async (wallet) => {
    console.log('Wallet click - carteira recebida:', wallet);
    console.log('Wallet ID:', wallet?._id);
    console.log('Wallet nome:', wallet?.nome);
    
    if (!wallet || !wallet._id) {
      console.error('Wallet or wallet ID is missing:', wallet);
      setError('Carteira inválida');
      return;
    }

    console.log('Selected wallet:', wallet);
    setSelectedWalletForDetail(wallet);
    setViewMode('detail');
    await fetchWalletDetails(wallet._id);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedWalletForDetail(null);
    setWalletDetails(null);
    navigate('/carteiras');
  };

  const handleSellAsset = (asset) => {
    setAssetToSell(asset);
    setSellFormData({
      quantidade: '',
      preco: ''
    });
    setShowSellModal(true);
  };

  const handleSellFormChange = (e) => {
    const { name, value } = e.target;
    setSellFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirmSell = async () => {
    if (!assetToSell || !selectedWalletForDetail?._id) {
      setError('Dados inválidos para venda');
      return;
    }

    try {
      // Validar campos
      if (!sellFormData.quantidade || !sellFormData.preco) {
        setError('Por favor, preencha todos os campos');
        return;
      }

      const quantidade = parseFloat(sellFormData.quantidade);
      const preco = parseFloat(sellFormData.preco);

      if (isNaN(quantidade) || isNaN(preco)) {
        setError('Por favor, insira valores numéricos válidos');
        return;
      }

      if (quantidade <= 0 || preco <= 0) {
        setError('Quantidade e preço devem ser maiores que zero');
        return;
      }

      if (quantidade > assetToSell.quantidade) {
        setError(`Quantidade excede o disponível (${assetToSell.quantidade})`);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteira/${selectedWalletForDetail._id}/venda`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: assetToSell.nome,
          quantidade: quantidade,
          valorUnitario: preco,
          moeda: currency // Adicionar a moeda selecionada na requisição
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro ao realizar venda:', errorData);
        throw new Error(`Erro ao realizar venda: ${errorData}`);
      }

      const responseData = await response.json();
      console.log('Venda Response Data:', responseData);

      // Atualizar os detalhes da carteira após a venda
      await fetchWalletDetails(selectedWalletForDetail._id);

      // Limpar o formulário e fechar o modal
      setSellFormData({
        quantidade: '',
        preco: ''
      });
      setShowSellModal(false);
      setAssetToSell(null);
    } catch (err) {
      console.error('Error in handleConfirmSell:', err);
      setError(err.message);
    }
  };

  const handleCancelSell = () => {
    setShowSellModal(false);
    setAssetToSell(null);
    setSellFormData({
      quantidade: '',
      preco: ''
    });
  };

  const handleAddAporte = async () => {
    try {
      // Buscar saldo do usuário
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/usuario/geral`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar saldo do usuário');
      }

      const data = await response.json();
      setSaldoDisponivel({
        brl: data.brl?.saldoReais || 0,
        usd: data.usd?.saldoReais || 0
      });

      setShowAddAporteModal(true);
      setAddAporteFormData({
        cripto: '',
        preco: '',
        quantidade: ''
      });
    } catch (err) {
      console.error('Erro ao carregar saldo:', err);
      setError(err.message);
    }
  };

  const handleAddAporteFormChange = (e) => {
    const { name, value } = e.target;
    setAddAporteFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar campos numéricos
    if (name === 'preco' || name === 'quantidade') {
      const numValue = parseFloat(value);
      setFormErrors(prev => ({
        ...prev,
        [name]: isNaN(numValue) || numValue <= 0
      }));
    }
  };

  const handleConfirmAddAporte = async () => {
    if (!selectedWalletForDetail?._id) {
      setError('Carteira inválida');
      return;
    }

    try {
      // Validar se a criptomoeda selecionada existe na lista
      const isCryptoValid = cryptoNames.includes(addAporteFormData.cripto);
      
      // Validar campos numéricos
      const quantidade = parseFloat(addAporteFormData.quantidade);
      const valorUnitario = parseFloat(addAporteFormData.preco);
      
      // Atualizar todos os erros
      const newErrors = {
        cripto: !isCryptoValid,
        preco: isNaN(valorUnitario) || valorUnitario <= 0,
        quantidade: isNaN(quantidade) || quantidade <= 0
      };
      
      setFormErrors(newErrors);

      // Verificar se há algum erro
      if (Object.values(newErrors).some(error => error)) {
        return;
      }

      const valorTotal = quantidade * valorUnitario;

      // Verificar se o usuário tem saldo suficiente na moeda atual
      const saldoAtual = saldoDisponivel[currency.toLowerCase()];
      if (valorTotal > saldoAtual) {
        setError(`Saldo insuficiente. Saldo disponível: ${formatCurrency(saldoAtual)}`);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteira/${selectedWalletForDetail._id}/aporte`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: addAporteFormData.cripto,
          quantidade: quantidade,
          valorUnitario: valorUnitario,
          moeda: currency // Adicionar a moeda selecionada na requisição
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro ao adicionar aporte: ${errorData}`);
      }

      await fetchWalletDetails(selectedWalletForDetail._id);
      
      // Limpar formulário e fechar modal
      setAddAporteFormData({
        cripto: '',
        preco: '',
        quantidade: ''
      });
      setCryptoSearch('');
      setFormErrors({
        cripto: false,
        preco: false,
        quantidade: false
      });
      setShowAddAporteModal(false);
    } catch (err) {
      console.error('Error in handleConfirmAddAporte:', err);
      setError(err.message);
    }
  };

  const handleCancelAddAporte = () => {
    setShowAddAporteModal(false);
    setAddAporteFormData({
      cripto: '',
      preco: '',
      quantidade: ''
    });
  };

  // Nova função para buscar nomes das criptomoedas
  const fetchCryptoNames = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/cripto/names`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar nomes das criptomoedas');
      }

      const names = await response.json();
      setCryptoNames(names);
      setFilteredCryptos(names);
    } catch (err) {
      console.error('Erro ao carregar nomes das criptomoedas:', err);
      setError(err.message);
    }
  };

  // Nova função para filtrar criptomoedas baseado na busca
  const handleCryptoSearch = (searchTerm) => {
    setCryptoSearch(searchTerm);
    setAddAporteFormData(prev => ({
      ...prev,
      cripto: searchTerm
    }));
    
    // Se o campo estiver vazio, mostrar todas as opções (limitadas a 5)
    if (searchTerm.trim() === '') {
      setFilteredCryptos(cryptoNames.slice(0, 5));
      setShowCryptoDropdown(true);
      setFormErrors(prev => ({
        ...prev,
        cripto: false
      }));
      return;
    }

    // Filtrar as criptomoedas que correspondem ao termo de busca
    const filtered = cryptoNames
      .filter(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);

    setFilteredCryptos(filtered);
    setShowCryptoDropdown(true);

    // Atualizar o estado de erro se não houver correspondências
    setFormErrors(prev => ({
      ...prev,
      cripto: filtered.length === 0
    }));
  };

  // Modificar handleCryptoSelect para garantir que o dropdown seja fechado
  const handleCryptoSelect = (cryptoName) => {
    setAddAporteFormData(prev => ({
      ...prev,
      cripto: cryptoName
    }));
    setCryptoSearch(cryptoName);
    setShowCryptoDropdown(false);
    setFormErrors(prev => ({
      ...prev,
      cripto: false
    }));
  };

  // Modificar função para lidar com o pressionamento de teclas
  const handleKeyDown = (e, nextFieldId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Se o dropdown estiver visível e houver opções, seleciona a primeira
      if (showCryptoDropdown && filteredCryptos.length > 0) {
        handleCryptoSelect(filteredCryptos[0]);
        return;
      }
      
      // Se já tiver uma criptomoeda selecionada, move para o próximo campo
      if (addAporteFormData.cripto && nextFieldId) {
        const nextField = document.getElementById(nextFieldId);
        if (nextField) {
          nextField.focus();
        }
      }
    }
  };

  // Renderização da lista de carteiras
  const renderWalletList = () => {
    return (
      <div className="container-fluid px-2 py-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Carteiras</h2>
          <button 
            className="btn btn-outline-secondary d-flex align-items-center"
            onClick={handleOpenModal}
          >
            <FaPlus className="me-2" /> Nova Carteira
          </button>
        </div>

        <div className="row g-3">
          {carteiras.map(carteira => (
            <div key={carteira._id} className="col-md-6 col-xxl-4">
              <div 
                className="card h-100 shadow-sm cursor-pointer" 
                onClick={() => {
                  console.log('Card clicked - carteira:', carteira);
                  handleWalletClick(carteira);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{carteira.nome}</h5>
                  <div onClick={e => e.stopPropagation()}>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteClick(carteira)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-muted">{carteira.descricao}</p>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Custo Total:</span>
                      <span className="fw-bold">{formatCurrency(carteira.custoTotalCriptos[currency.toLowerCase()])}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Saldo Total:</span>
                      <span className="fw-bold">{formatCurrency(carteira.saldo[currency.toLowerCase()])}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Lucro Total:</span>
                      <div className="d-flex align-items-center">
                        <span className={`fw-bold ${carteira.lucro[currency.toLowerCase()] >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatCurrency(carteira.lucro[currency.toLowerCase()])}
                        </span>
                        <span className={`badge ms-2 ${carteira.variacao >= 0 ? 'bg-success' : 'bg-danger'}`}>
                          {formatPercentage(carteira.variacao)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderização da visualização detalhada da carteira
  const renderWalletDetail = () => {
    if (!selectedWalletForDetail) return null;

    return (
      <div className="container-fluid px-2 py-2">
        <div className="d-flex align-items-center mb-3">
          <button 
            className="btn btn-outline-secondary me-3"
            onClick={handleBackToList}
          >
            <FaArrowLeft className="me-2" /> Voltar
          </button>
          <h2 className="mb-0">{selectedWalletForDetail.nome}</h2>
        </div>

        {loadingDetails ? (
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-3">Carregando detalhes da carteira...</p>
            </div>
          </div>
        ) : walletDetails ? (
          <>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <h6 className="text-muted">Saldo Total</h6>
                    <h3 className="mb-0">{formatCurrency(walletDetails.saldo.total[currency.toLowerCase()])}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <h6 className="text-muted">Custo das Criptos</h6>
                    <h3 className="mb-0">{formatCurrency(walletDetails.custoTotalCriptos[currency.toLowerCase()])}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <h6 className="text-muted">
                      {walletDetails.saldo.lucro[currency.toLowerCase()] >= 0 ? 'Lucro Atual' : 'Prejuízo Atual'}
                    </h6>
                    <h3 className={`mb-0 ${walletDetails.saldo.lucro[currency.toLowerCase()] >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(walletDetails.saldo.lucro[currency.toLowerCase()])}
                      <span className={`badge ms-2 ${walletDetails.saldo.variacao >= 0 ? 'bg-success' : 'bg-danger'}`}>
                        {formatPercentage(walletDetails.saldo.variacao)}
                      </span>
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <h6 className="text-muted">
                      {walletDetails.lucroRealizado[currency.toLowerCase()] >= 0 ? 'Lucro Realizado' : 'Prejuízo Realizado'}
                    </h6>
                    <h3 className={`mb-0 ${walletDetails.lucroRealizado[currency.toLowerCase()] >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(walletDetails.lucroRealizado[currency.toLowerCase()])}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Ativos da Carteira</h5>
                    <button 
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                      onClick={handleAddAporte}
                    >
                      <FaPlus className="me-2" /> Adicionar Aporte
                    </button>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th className="py-3 ps-4">Criptomoeda</th>
                            <th className="py-3">Quantidade</th>
                            <th className="py-3">Preço Médio</th>
                            <th className="py-3">Preço Atual</th>
                            <th className="py-3">Valor Total</th>
                            <th className="py-3">Variação</th>
                            <th className="py-3 pe-4 text-end">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {walletDetails.ativos?.length > 0 ? (
                            walletDetails.ativos.map(ativo => (
                              <tr key={ativo._id}>
                                <td className="align-middle ps-4">{ativo.nome}</td>
                                <td className="align-middle">{ativo.quantidade}</td>
                                <td className="align-middle">{formatCurrency(ativo[currency.toLowerCase()]?.valorUnitario || 0)}</td>
                                <td className="align-middle">{formatCurrency(ativo[currency.toLowerCase()]?.precoAtual || 0)}</td>
                                <td className="align-middle">{formatCurrency(ativo[currency.toLowerCase()]?.valorAtual || 0)}</td>
                                <td className="align-middle">
                                  <span className={`badge ${(ativo[currency.toLowerCase()]?.variacao || 0) >= 0 ? 'bg-success' : 'bg-danger'}`}>
                                    {formatPercentage(ativo[currency.toLowerCase()]?.variacao || 0)}
                                  </span>
                                </td>
                                <td className="align-middle pe-4 text-end">
                                  <button 
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => handleSellAsset(ativo)}
                                  >
                                    Vender
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center py-4">
                                Nenhum ativo encontrado nesta carteira
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="alert alert-warning" role="alert">
            Não foi possível carregar os detalhes da carteira
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
                <p className="mt-3">Carregando carteiras...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'list' ? renderWalletList() : renderWalletDetail()}

      {/* Modal de adição/edição */}
      {showModal && (
        <div 
          className="modal-backdrop fade show" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1040
          }}
          onClick={handleCloseModal}
        ></div>
      )}
      
      {showModal && (
        <div 
          className="modal fade show" 
          style={{
            display: 'block',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050,
            overflow: 'auto'
          }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="modal-dialog modal-dialog-centered" 
            style={{ maxWidth: '500px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nova Carteira</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nome da Carteira</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div 
          className="modal-backdrop fade show" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1040
          }}
          onClick={handleCancelDelete}
        ></div>
      )}
      
      {showDeleteModal && (
        <div 
          className="modal fade show" 
          style={{
            display: 'block',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050,
            overflow: 'auto'
          }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="modal-dialog modal-dialog-centered" 
            style={{ maxWidth: '400px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Exclusão</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCancelDelete}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>Tem certeza que deseja excluir a carteira <strong>{walletToDelete?.nome}</strong>?</p>
                <p className="text-danger">Esta ação não pode ser desfeita.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCancelDelete}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de venda de ativo */}
      {showSellModal && (
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
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Vender {assetToSell?.nome}</h5>
                <button type="button" className="btn-close" onClick={handleCancelSell} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Quantidade Disponível</label>
                    <input
                      type="text"
                      id="quantidadeDisponivelInput"
                      className="form-control"
                      value={assetToSell?.quantidade}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantidade a Vender</label>
                    <input
                      type="number"
                      id="quantidadeVendaInput"
                      className="form-control"
                      name="quantidade"
                      value={sellFormData.quantidade}
                      onChange={handleSellFormChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          document.getElementById('precoVendaInput').focus();
                        }
                      }}
                      min="0"
                      max={assetToSell?.quantidade}
                      step="0.00000001"
                      required
                    />
                    {parseFloat(sellFormData.quantidade) > parseFloat(assetToSell?.quantidade) && (
                      <div className="invalid-feedback d-block">
                        Quantidade excede o disponível
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Preço de Venda ({currency})</label>
                    <input
                      type="number"
                      id="precoVendaInput"
                      className="form-control"
                      name="preco"
                      value={sellFormData.preco}
                      onChange={handleSellFormChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          document.getElementById('sellButton').focus();
                        }
                      }}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Valor Total da Venda ({currency})</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formatCurrency(
                        isNaN(sellFormData.quantidade * sellFormData.preco)
                          ? 0
                          : sellFormData.quantidade * sellFormData.preco
                      )}
                      readOnly
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={handleCancelSell}
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  id="sellButton" 
                  className="btn btn-outline-secondary"
                  onClick={handleConfirmSell}
                  disabled={
                    !sellFormData.quantidade || 
                    !sellFormData.preco || 
                    parseFloat(sellFormData.quantidade) > parseFloat(assetToSell?.quantidade) ||
                    parseFloat(sellFormData.quantidade) <= 0 ||
                    parseFloat(sellFormData.preco) <= 0
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.target.disabled) {
                      e.preventDefault();
                      handleConfirmSell();
                    }
                  }}
                >
                  Confirmar Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de adicionar aporte */}
      {showAddAporteModal && (
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
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Adicionar Aporte</h5>
                <button type="button" className="btn-close" onClick={handleCancelAddAporte} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Saldo Disponível</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formatCurrency(saldoDisponivel[currency.toLowerCase()])}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Criptomoeda</label>
                    <div className="position-relative">
                      <input
                        type="text"
                        id="cryptoInput"
                        className={`form-control ${formErrors.cripto ? 'is-invalid' : ''}`}
                        value={cryptoSearch}
                        onChange={(e) => handleCryptoSearch(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'precoInput')}
                        onFocus={() => {
                          const initial = cryptoNames.slice(0, 5);
                          setFilteredCryptos(initial);
                          setShowCryptoDropdown(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowCryptoDropdown(false);
                          }, 200);
                        }}
                        placeholder="Digite para buscar..."
                        required
                      />
                      {formErrors.cripto && (
                        <div className="invalid-feedback">
                          Selecione uma criptomoeda válida da lista
                        </div>
                      )}
                      {showCryptoDropdown && (
                        <ul className="dropdown-menu w-100 show">
                          {filteredCryptos.length > 0 ? (
                            filteredCryptos.map((name, index) => (
                              <li key={index}>
                                <a
                                  className="dropdown-item"
                                  href="#!"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleCryptoSelect(name);
                                    // Focar no próximo campo após selecionar
                                    const nextField = document.getElementById('precoInput');
                                    if (nextField) {
                                      nextField.focus();
                                    }
                                  }}
                                >
                                  {name}
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
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Preço de Compra</label>
                    <input
                      type="number"
                      id="precoInput"
                      className={`form-control ${formErrors.preco ? 'is-invalid' : ''}`}
                      name="preco"
                      value={addAporteFormData.preco}
                      onChange={handleAddAporteFormChange}
                      onKeyDown={(e) => handleKeyDown(e, 'quantidadeInput')}
                      min="0"
                      step="0.01"
                      required
                    />
                    {formErrors.preco && (
                      <div className="invalid-feedback">
                        Digite um preço válido maior que zero
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantidade</label>
                    <input
                      type="number"
                      id="quantidadeInput"
                      className={`form-control ${formErrors.quantidade ? 'is-invalid' : ''}`}
                      name="quantidade"
                      value={addAporteFormData.quantidade}
                      onChange={handleAddAporteFormChange}
                      onKeyDown={(e) => handleKeyDown(e, 'addButton')}
                      min="0"
                      step="0.00000001"
                      required
                    />
                    {formErrors.quantidade && (
                      <div className="invalid-feedback">
                        Digite uma quantidade válida maior que zero
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Valor Total do Aporte</label>
                    <input
                      type="text"
                      className={`form-control ${(addAporteFormData.quantidade || 0) * (addAporteFormData.preco || 0) > saldoDisponivel[currency.toLowerCase()] ? 'is-invalid' : ''}`}
                      value={formatCurrency(
                        (addAporteFormData.quantidade || 0) * (addAporteFormData.preco || 0)
                      )}
                      readOnly
                    />
                    {(addAporteFormData.quantidade || 0) * (addAporteFormData.preco || 0) > saldoDisponivel[currency.toLowerCase()] && (
                      <div className="invalid-feedback">
                        Saldo insuficiente para este aporte
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancelAddAporte}>
                  Cancelar
                </button>
                <button 
                  type="button" 
                  id="addButton"
                  className="btn btn-outline-secondary"
                  onClick={handleConfirmAddAporte}
                  disabled={
                    Object.values(formErrors).some(error => error) || 
                    !addAporteFormData.cripto || 
                    !addAporteFormData.preco || 
                    !addAporteFormData.quantidade ||
                    (addAporteFormData.quantidade || 0) * (addAporteFormData.preco || 0) > saldoDisponivel[currency.toLowerCase()]
                  }
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Carteiras; 