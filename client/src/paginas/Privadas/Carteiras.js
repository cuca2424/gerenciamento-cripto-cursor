import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaArrowLeft, FaChartLine, FaHistory, FaExchangeAlt } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';

function Carteiras() {
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
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);

  const [carteiras, setCarteiras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCarteiras();
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
                saldo: 0,
                aporte: 0,
                lucro: 0,
                variacao: 0
              };
            }

            const saldoData = await saldoResponse.json();
            return {
              ...carteira,
              saldo: saldoData.saldoTotal || 0,
              aporte: saldoData.aporteTotal || 0,
              lucro: saldoData.lucro || 0,
              variacao: saldoData.percentualLucro || 0
            };
          } catch (error) {
            console.error(`Erro ao processar carteira ${carteira._id}:`, error);
            return {
              ...carteira,
              saldo: 0,
              aporte: 0,
              lucro: 0,
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
      console.log('Using token:', token);

      // Buscar detalhes da carteira
      const walletResponse = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteira/${walletId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!walletResponse.ok) {
        const walletError = await walletResponse.text();
        console.error('Wallet Error:', walletError);
        throw new Error(`Erro ao carregar carteira: ${walletError}`);
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
        const saldoError = await saldoResponse.text();
        console.error('Saldo Error:', saldoError);
        throw new Error(`Erro ao carregar saldo: ${saldoError}`);
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
        const ativosError = await ativosResponse.text();
        console.error('Ativos Error:', ativosError);
        throw new Error(`Erro ao carregar ativos: ${ativosError}`);
      }

      const ativosData = await ativosResponse.json();
      console.log('Dados dos ativos recebidos:', ativosData);

      // Verificar se os dados do saldo estão presentes
      if (!saldoData || typeof saldoData !== 'object') {
        console.error('Dados do saldo inválidos:', saldoData);
        throw new Error('Dados do saldo inválidos');
      }

      // Garantir que os valores numéricos sejam tratados corretamente
      const saldoTotal = parseFloat(saldoData.saldoTotal) || 0;
      const aporteTotal = parseFloat(saldoData.aporteTotal) || 0;
      const lucroTotal = parseFloat(saldoData.lucro) || 0;
      const variacao = parseFloat(saldoData.percentualLucro) || 0;

      // Processar os ativos para garantir que todos os valores numéricos sejam tratados
      const processedAtivos = ativosData.map(ativo => {
        const valorUnitario = parseFloat(ativo.valorUnitario) || 0;
        const precoAtual = parseFloat(ativo.precoAtual) || 0;
        const quantidade = parseFloat(ativo.quantidade) || 0;
        const valorAtual = quantidade * precoAtual;
        
        // Calcular a variação percentual usando o preço médio e o preço atual
        const variacaoAtivo = valorUnitario > 0 
          ? ((precoAtual - valorUnitario) / valorUnitario) * 100 
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
          aporte: aporteTotal,
          lucro: lucroTotal,
          variacao: variacao
        }
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
      currency: 'BRL'
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
          valorUnitario: preco
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
      setSaldoDisponivel(data.saldoReais || 0);

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
  };

  const handleConfirmAddAporte = async () => {
    if (!selectedWalletForDetail?._id) {
      setError('Carteira inválida');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Validar se todos os campos foram preenchidos
      if (!addAporteFormData.cripto || !addAporteFormData.preco || !addAporteFormData.quantidade) {
        setError('Por favor, preencha todos os campos');
        return;
      }

      // Converter e validar os valores numéricos
      const quantidade = parseFloat(addAporteFormData.quantidade);
      const valorUnitario = parseFloat(addAporteFormData.preco);

      if (isNaN(quantidade) || isNaN(valorUnitario)) {
        setError('Por favor, insira valores numéricos válidos');
        return;
      }

      const valorTotal = quantidade * valorUnitario;

      // Verificar se o usuário tem saldo suficiente
      if (valorTotal > saldoDisponivel) {
        setError(`Saldo insuficiente. Saldo disponível: ${formatCurrency(saldoDisponivel)}`);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/carteira/${selectedWalletForDetail._id}/aporte`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: addAporteFormData.cripto,
          quantidade: quantidade,
          valorUnitario: valorUnitario
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro ao adicionar aporte:', errorData);
        throw new Error(`Erro ao adicionar aporte: ${errorData}`);
      }

      const responseData = await response.json();
      console.log('Aporte Response Data:', responseData);

      // Atualizar os detalhes da carteira após adicionar o aporte
      await fetchWalletDetails(selectedWalletForDetail._id);

      // Limpar o formulário e fechar o modal
      setAddAporteFormData({
        cripto: '',
        preco: '',
        quantidade: ''
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
                      <span className="text-muted">Aporte Total:</span>
                      <span className="fw-bold">{formatCurrency(carteira.aporte)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Saldo Total:</span>
                      <span className="fw-bold">{formatCurrency(carteira.saldo)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Lucro Total:</span>
                      <div className="d-flex align-items-center">
                        <span className={`fw-bold ${carteira.lucro >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatCurrency(carteira.lucro)}
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
              <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <h6 className="text-muted">Saldo Total</h6>
                    <h3 className="mb-0">{formatCurrency(walletDetails?.saldo?.total ?? 0)}</h3>
              </div>
            </div>
          </div>
              <div className="col-md-4">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <h6 className="text-muted">Aporte Total</h6>
                    <h3 className="mb-0">{formatCurrency(walletDetails?.saldo?.aporte ?? 0)}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <h6 className="text-muted">Lucro Total</h6>
                    <h3 className={`mb-0 ${(walletDetails?.saldo?.lucro ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(walletDetails?.saldo?.lucro ?? 0)}
                      <span className={`badge ms-2 ${(walletDetails?.saldo?.variacao ?? 0) >= 0 ? 'bg-success' : 'bg-danger'}`}>
                        {formatPercentage(walletDetails?.saldo?.variacao ?? 0)}
                  </span>
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
                            <th className="py-3 ps-4 w-20">Criptomoeda</th>
                            <th className="py-3 w-15">Quantidade</th>
                            <th className="py-3 w-15">Preço Médio</th>
                            <th className="py-3 w-15">Preço Atual</th>
                            <th className="py-3 w-15">Valor Total</th>
                            <th className="py-3 w-15">Variação</th>
                            <th className="py-3 pe-4 w-15 text-end">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                          {walletDetails.ativos?.length > 0 ? (
                            walletDetails.ativos.map(ativo => (
                              <tr key={ativo._id}>
                                <td className="align-middle ps-4">{ativo.nome}</td>
                                <td className="align-middle">{ativo.quantidade}</td>
                                <td className="align-middle">{formatCurrency(ativo.valorUnitario)}</td>
                                <td className="align-middle">{formatCurrency(ativo.precoAtual)}</td>
                                <td className="align-middle">{formatCurrency(ativo.valorAtual)}</td>
                                <td className="align-middle">
                                  <span className={`badge ${ativo.variacao >= 0 ? 'bg-success' : 'bg-danger'}`}>
                                    {formatPercentage(ativo.variacao)}
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
                              <td colSpan="6" className="text-center py-4">
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
          onClick={handleCancelSell}
        ></div>
      )}
      
      {showSellModal && (
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
                <h5 className="modal-title">Vender {assetToSell?.nome}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCancelSell}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Quantidade Disponível</label>
                    <input
                      type="text"
                      className="form-control"
                      value={assetToSell?.quantidade}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantidade a Vender</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantidade"
                      value={sellFormData.quantidade}
                      onChange={handleSellFormChange}
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
                    <label className="form-label">Preço de Venda</label>
                    <input
                      type="number"
                      className="form-control"
                      name="preco"
                      value={sellFormData.preco}
                      onChange={handleSellFormChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Valor Total da Venda</label>
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
                  className="btn btn-outline-secondary"
                  onClick={handleConfirmSell}
                  disabled={parseFloat(sellFormData.quantidade) > parseFloat(assetToSell?.quantidade)}
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
          onClick={handleCancelAddAporte}
        ></div>
      )}
      
      {showAddAporteModal && (
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
                <h5 className="modal-title">Adicionar Aporte</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCancelAddAporte}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Saldo Disponível</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formatCurrency(saldoDisponivel)}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Criptomoeda</label>
                    <input
                      type="text"
                      className="form-control"
                      name="cripto"
                      value={addAporteFormData.cripto}
                      onChange={handleAddAporteFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Preço de Compra</label>
                    <input
                      type="number"
                      className="form-control"
                      name="preco"
                      value={addAporteFormData.preco}
                      onChange={handleAddAporteFormChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantidade</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantidade"
                      value={addAporteFormData.quantidade}
                      onChange={handleAddAporteFormChange}
                      min="0"
                      step="0.00000001"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Valor Total do Aporte</label>
                    <input
                      type="text"
                      className={`form-control ${(addAporteFormData.quantidade || 0) * (addAporteFormData.preco || 0) > saldoDisponivel ? 'is-invalid' : ''}`}
                      value={formatCurrency(
                        (addAporteFormData.quantidade || 0) * (addAporteFormData.preco || 0)
                      )}
                      readOnly
                    />
                    {(addAporteFormData.quantidade || 0) * (addAporteFormData.preco || 0) > saldoDisponivel && (
                      <div className="invalid-feedback">
                        Saldo insuficiente para este aporte
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={handleCancelAddAporte}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={handleConfirmAddAporte}
                  disabled={(addAporteFormData.quantidade || 0) * (addAporteFormData.preco || 0) > saldoDisponivel}
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