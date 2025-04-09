import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaArrowLeft, FaChartLine, FaHistory, FaExchangeAlt } from 'react-icons/fa';

function Carteiras() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });
  
  // Estado para o modal de confirmação de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState(null);
  
  // Estado para controlar a visualização detalhada
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'detail'
  const [selectedWalletForDetail, setSelectedWalletForDetail] = useState(null);

  // Dados de exemplo para carteiras
  const [carteiras, setCarteiras] = useState([
    {
      id: 1,
      nome: 'Carteira Principal',
      descricao: 'Carteira para investimentos de longo prazo',
      saldo: 25000,
      aporte: 20000,
      lucro: 5000,
      variacao: 25.0,
      dataCriacao: '2023-01-15',
      ultimaAtualizacao: '2023-06-20',
      transacoes: [
        { id: 1, tipo: 'compra', cripto: 'Bitcoin', quantidade: 0.1, valor: 5000, data: '2023-02-10' },
        { id: 2, tipo: 'compra', cripto: 'Ethereum', quantidade: 1.5, valor: 7500, data: '2023-03-15' },
        { id: 3, tipo: 'venda', cripto: 'Cardano', quantidade: 500, valor: 2500, data: '2023-05-20' }
      ]
    },
    {
      id: 2,
      nome: 'Carteira de Trading',
      descricao: 'Carteira para operações de curto prazo',
      saldo: 15000,
      aporte: 18000,
      lucro: -3000,
      variacao: -16.7,
      dataCriacao: '2023-03-10',
      ultimaAtualizacao: '2023-06-18',
      transacoes: [
        { id: 4, tipo: 'compra', cripto: 'Bitcoin', quantidade: 0.05, valor: 2500, data: '2023-04-05' },
        { id: 5, tipo: 'compra', cripto: 'Solana', quantidade: 25, valor: 5000, data: '2023-04-15' },
        { id: 6, tipo: 'venda', cripto: 'Polkadot', quantidade: 50, valor: 2000, data: '2023-05-10' }
      ]
    },
    {
      id: 3,
      nome: 'Carteira de Poupança',
      descricao: 'Carteira para reserva de emergência',
      saldo: 50000,
      aporte: 45000,
      lucro: 5000,
      variacao: 11.1,
      dataCriacao: '2023-02-20',
      ultimaAtualizacao: '2023-06-19',
      transacoes: [
        { id: 7, tipo: 'compra', cripto: 'Bitcoin', quantidade: 0.3, valor: 15000, data: '2023-03-01' },
        { id: 8, tipo: 'compra', cripto: 'Ethereum', quantidade: 2.0, valor: 10000, data: '2023-04-10' }
      ]
    }
  ]);

  // Prevenir scroll do body quando o modal estiver aberto
  useEffect(() => {
    if (showModal || showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal, showDeleteModal]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const handleOpenModal = (type, wallet = null) => {
    setModalType(type);
    if (wallet) {
      setSelectedWallet(wallet);
      setFormData({
        nome: wallet.nome,
        descricao: wallet.descricao
      });
    } else {
      setSelectedWallet(null);
      setFormData({
        nome: '',
        descricao: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedWallet(null);
    setFormData({
      nome: '',
      descricao: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalType === 'add') {
      const newWallet = {
        id: carteiras.length + 1,
        ...formData,
        saldo: 0,
        aporte: 0,
        lucro: 0,
        variacao: 0,
        dataCriacao: new Date().toISOString().split('T')[0],
        ultimaAtualizacao: new Date().toISOString().split('T')[0],
        transacoes: []
      };
      setCarteiras(prev => [...prev, newWallet]);
    } else if (modalType === 'edit') {
      setCarteiras(prev => 
        prev.map(wallet => 
          wallet.id === selectedWallet.id 
            ? { 
                ...wallet, 
                nome: formData.nome,
                descricao: formData.descricao
              } 
            : wallet
        )
      );
    }
    
    handleCloseModal();
  };

  const handleDeleteClick = (wallet) => {
    setWalletToDelete(wallet);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (walletToDelete) {
      setCarteiras(prev => prev.filter(wallet => wallet.id !== walletToDelete.id));
      setShowDeleteModal(false);
      setWalletToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setWalletToDelete(null);
  };

  const handleWalletClick = (wallet) => {
    setSelectedWalletForDetail(wallet);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedWalletForDetail(null);
  };

  // Renderização da lista de carteiras
  const renderWalletList = () => {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Carteiras</h2>
          <button 
            className="btn btn-primary d-flex align-items-center"
            onClick={() => handleOpenModal('add')}
          >
            <FaPlus className="me-2" /> Nova Carteira
          </button>
        </div>

        <div className="row">
          {carteiras.map(carteira => (
            <div key={carteira.id} className="col-md-4 mb-4">
              <div 
                className="card h-100 shadow-sm cursor-pointer" 
                onClick={() => handleWalletClick(carteira)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{carteira.nome}</h5>
                  <div onClick={e => e.stopPropagation()}>
                    <button 
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={() => handleOpenModal('edit', carteira)}
                    >
                      <FaEdit />
                    </button>
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
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center mb-4">
          <button 
            className="btn btn-outline-secondary me-3"
            onClick={handleBackToList}
          >
            <FaArrowLeft className="me-2" /> Voltar
          </button>
          <h2 className="mb-0">{selectedWalletForDetail.nome}</h2>
        </div>

        {/* Cards de estatísticas no topo */}
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <h6 className="text-muted">Aporte Total</h6>
                <h3 className="mb-0">{formatCurrency(selectedWalletForDetail.aporte)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <h6 className="text-muted">Saldo Total</h6>
                <h3 className="mb-0">{formatCurrency(selectedWalletForDetail.saldo)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <h6 className="text-muted">Lucro Total</h6>
                <h3 className={`mb-0 ${selectedWalletForDetail.lucro >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(selectedWalletForDetail.lucro)}
                  <span className={`badge ms-2 ${selectedWalletForDetail.variacao >= 0 ? 'bg-success' : 'bg-danger'}`}>
                    {formatPercentage(selectedWalletForDetail.variacao)}
                  </span>
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Informações da carteira */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Informações da Carteira</h5>
                <div>
                  <button 
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => handleOpenModal('edit', selectedWalletForDetail)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDeleteClick(selectedWalletForDetail)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p className="text-muted mb-4">{selectedWalletForDetail.descricao}</p>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Data de Criação:</strong> {formatDate(selectedWalletForDetail.dataCriacao)}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Última Atualização:</strong> {formatDate(selectedWalletForDetail.ultimaAtualizacao)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Histórico de Transações</h5>
                <button className="btn btn-sm btn-outline-primary">
                  <FaPlus className="me-1" /> Nova Transação
                </button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Criptomoeda</th>
                        <th>Quantidade</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWalletForDetail.transacoes.map(transacao => (
                        <tr key={transacao.id}>
                          <td>{formatDate(transacao.data)}</td>
                          <td>
                            <span className={`badge ${transacao.tipo === 'compra' ? 'bg-success' : 'bg-danger'}`}>
                              {transacao.tipo === 'compra' ? 'Compra' : 'Venda'}
                            </span>
                          </td>
                          <td>{transacao.cripto}</td>
                          <td>{transacao.quantidade}</td>
                          <td>{formatCurrency(transacao.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Distribuição de Ativos</h5>
              </div>
              <div className="card-body">
                <div className="text-center p-4">
                  <p className="text-muted">Gráfico de distribuição de ativos será exibido aqui</p>
                  <div className="bg-light rounded p-4">
                    <FaChartLine size={50} className="text-muted" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Ações Rápidas</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary">
                    <FaExchangeAlt className="me-2" /> Transferir para outra carteira
                  </button>
                  <button className="btn btn-outline-success">
                    <FaPlus className="me-2" /> Adicionar fundos
                  </button>
                  <button className="btn btn-outline-danger">
                    <FaTrash className="me-2" /> Remover fundos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                <h5 className="modal-title">
                  {modalType === 'add' ? 'Nova Carteira' : 'Editar Carteira'}
                </h5>
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
                  <div className="mb-3">
                    <label className="form-label">Descrição</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  {modalType === 'add' ? 'Adicionar' : 'Salvar'}
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
    </>
  );
}

export default Carteiras; 