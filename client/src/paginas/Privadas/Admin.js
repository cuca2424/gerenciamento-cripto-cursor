import React, { useState, useEffect } from 'react';
import { useUser } from "../../contexts/UserContext";
import { FaFilter, FaSort, FaSortUp, FaSortDown, FaTrash } from 'react-icons/fa';
import { useCurrency } from "../../contexts/CurrencyContext";
import MetricCard from '../../components/dashboard/MetricCard';

function Admin() {
  const { user } = useUser();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estrategiasGlobais, setEstrategiasGlobais] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [emailFilter, setEmailFilter] = useState('');
  const [showEstrategiaModal, setShowEstrategiaModal] = useState(false);
  const [novaEstrategia, setNovaEstrategia] = useState({
    nome: '',
    filtros: []
  });
  const [editingStrategyId, setEditingStrategyId] = useState(null);
  const [filtros, setFiltros] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('diario');
  const [selectedInterval, setSelectedInterval] = useState('14');
  const [modalSelectedPeriod, setModalSelectedPeriod] = useState('');
  const [modalSelectedInterval, setModalSelectedInterval] = useState('');
  const [selectedIndicadorFilter, setSelectedIndicadorFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'nome',
    direction: 'asc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [tableHeight, setTableHeight] = useState(0);
  const [rowHeight, setRowHeight] = useState(0);

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

  // Verificar se o usuário é admin
  useEffect(() => {
    console.log('User object:', user);
    console.log('User role:', user?.role);
    console.log('API Endpoint:', process.env.REACT_APP_ENDPOINT_API);
    
    if (!user) {
      setError('Usuário não autenticado');
    } else if (user.role !== 'admin') {
      console.log('User role is not admin:', user.role);
      setError('Acesso negado. Apenas administradores podem acessar esta página.');
    } else {
      console.log('Usuário é admin, carregando estratégias...');
      carregarEstrategiasGlobais();
      carregarUsuarios();
    }
    setLoading(false);
  }, [user]);

  // Carregar estratégias globais
  useEffect(() => {
    if (user?.role === 'admin') {
      carregarEstrategiasGlobais();
    }
  }, [user]);

  // Carregar usuários
  const carregarUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token não encontrado no localStorage');
        setError('Token de autenticação não encontrado');
        return;
      }

      const url = `${process.env.REACT_APP_ENDPOINT_API}/admin/usuarios`;
      console.log('Tentando carregar usuários:', {
        url,
        token: token.substring(0, 10) + '...'
      });
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao carregar usuários: ${errorText}`);
      }

      const data = await response.json();
      console.log('Usuários carregados com sucesso:', data);
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários: ' + error.message);
    }
  };

  // Atualizar status do usuário
  const atualizarStatusUsuario = async (id, novoStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token não encontrado no localStorage');
        setError('Token de autenticação não encontrado');
        return;
      }

      const url = `${process.env.REACT_APP_ENDPOINT_API}/admin/usuarios/${id}/status`;
      console.log('Tentando atualizar status do usuário:', {
        url,
        id,
        novoStatus,
        token: token.substring(0, 10) + '...'
      });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ativo: novoStatus })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao atualizar status do usuário: ${errorText}`);
      }

      // Atualizar lista de usuários após a mudança
      await carregarUsuarios();
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      setError('Erro ao atualizar status do usuário: ' + error.message);
    }
  };

  // Atualizar role do usuário
  const atualizarRoleUsuario = async (id, novoRole) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token não encontrado no localStorage');
        setError('Token de autenticação não encontrado');
        return;
      }

      const url = `${process.env.REACT_APP_ENDPOINT_API}/admin/usuarios/${id}/role`;
      console.log('Tentando atualizar role do usuário:', {
        url,
        id,
        novoRole,
        token: token.substring(0, 10) + '...'
      });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: novoRole })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao atualizar role do usuário: ${errorText}`);
      }

      // Atualizar lista de usuários após a mudança
      await carregarUsuarios();
    } catch (error) {
      console.error('Erro ao atualizar role do usuário:', error);
      setError('Erro ao atualizar role do usuário: ' + error.message);
    }
  };

  const carregarEstrategiasGlobais = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token não encontrado no localStorage');
        setError('Token de autenticação não encontrado');
        return;
      }

      const url = `${process.env.REACT_APP_ENDPOINT_API}/admin/estrategias-globais`;
      console.log('Tentando carregar estratégias globais:', {
        url,
        token: token.substring(0, 10) + '...',
        user: {
          id: user?.id,
          role: user?.role
        }
      });
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Resposta do servidor:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro detalhado na resposta:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Erro ao carregar estratégias globais: ${errorText}`);
      }

      const data = await response.json();
      console.log('Dados recebidos com sucesso:', data);
      setEstrategiasGlobais(data);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar estratégias globais:', error);
      setError('Erro ao carregar estratégias globais: ' + error.message);
    }
  };

  const handleAddFilter = (indicador, tipo, periodo, timeframe, operador, valor) => {
    const novoFiltro = {
      indicador: indicador.toLowerCase(),
      tipo: tipo || '',
      periodo: `periodo${periodo}`,
      timeframe: timeframe,
      operador: operador,
      valor: parseFloat(valor),
      useCurrent: true
    };
    
    setFiltros(prev => {
      const filtrosSemDuplicados = prev.filter(f => 
        !(f.indicador === novoFiltro.indicador && 
          f.tipo === novoFiltro.tipo && 
          f.periodo === novoFiltro.periodo && 
          f.timeframe === novoFiltro.timeframe)
      );

      return [...filtrosSemDuplicados, novoFiltro];
    });
  };

  const handleRemoveFilter = (indicador, tipo, periodo, timeframe) => {
    setFiltros(prev => prev.filter(filter => 
      !(filter.indicador === indicador.toLowerCase() && 
        filter.tipo === tipo && 
        filter.periodo === `periodo${periodo}` && 
        filter.timeframe === timeframe)
    ));
  };

  const handleCreateEstrategia = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token não encontrado no localStorage');
        setError('Token de autenticação não encontrado');
        return;
      }

      const url = `${process.env.REACT_APP_ENDPOINT_API}/admin/estrategias-globais`;
      const payload = {
        nome: novaEstrategia.nome,
        filtros: filtros
      };

      console.log('Tentando criar estratégia global:', {
        url,
        payload,
        token: token.substring(0, 10) + '...'
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Resposta do servidor:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro ao criar estratégia:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Erro ao criar estratégia global: ${errorText}`);
      }

      const data = await response.json();
      console.log('Estratégia criada com sucesso:', data);
      setEstrategiasGlobais(prev => [...prev, data]);
      setShowEstrategiaModal(false);
      setNovaEstrategia({ nome: '', filtros: [] });
      setFiltros([]);
      setError(null);
    } catch (error) {
      console.error('Erro ao criar estratégia global:', error);
      setError('Erro ao criar estratégia global: ' + error.message);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const handleConditionChange = (e, item) => {
    const operador = e.target.value;
    const input = e.target.closest('tr').querySelector('input[type="number"]');
    const valor = input ? input.value : '';
    
    if (operador === '') {
      handleRemoveFilter(
        item.indicador.nome,
        item.tipo,
        item.periodo,
        item.timeframe
      );
    } else {
      handleAddFilter(
        item.indicador.nome,
        item.tipo,
        item.periodo,
        item.timeframe,
        operador,
        valor || '0'
      );
    }
  };

  const handleValueChange = (e, item) => {
    const valor = e.target.value;
    const select = e.target.closest('tr').querySelector('select');
    const operador = select ? select.value : '';
    
    if (valor === '') {
      handleRemoveFilter(
        item.indicador.nome,
        item.tipo,
        item.periodo,
        item.timeframe
      );
    } else {
      handleAddFilter(
        item.indicador.nome,
        item.tipo,
        item.periodo,
        item.timeframe,
        operador || '>',
        valor
      );
    }
  };

  const getFilterLabel = (indicador, tipo, periodo, timeframe) => {
    const tipoStr = tipo ? ` ${tipo.toUpperCase()}` : '';
    const timeframeStr = timeframe === 'diario' ? 'D' : 
                        timeframe === 'semanal' ? 'S' : 
                        timeframe === 'mensal' ? 'M' : '4H';
    return `${indicador}${tipoStr} (${periodo}, ${timeframeStr})`;
  };

  const handleDeleteEstrategia = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token não encontrado no localStorage');
        setError('Token de autenticação não encontrado');
        return;
      }

      const url = `${process.env.REACT_APP_ENDPOINT_API}/admin/estrategias-globais/${id}`;
      console.log('Tentando deletar estratégia:', {
        url,
        id,
        token: token.substring(0, 10) + '...'
      });

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Resposta do servidor:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro ao deletar estratégia:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Erro ao deletar estratégia: ${errorText}`);
      }

      setEstrategiasGlobais(prev => prev.filter(estrategia => estrategia._id !== id));
    } catch (error) {
      console.error('Erro ao deletar estratégia global:', error);
      setError('Erro ao deletar estratégia global');
    }
  };

  const handleEditStrategy = async (strategy) => {
    setNovaEstrategia({
      nome: strategy.nome,
      filtros: strategy.filtros || []
    });
    setFiltros(strategy.filtros || []);
    setShowEstrategiaModal(true);
    setEditingStrategyId(strategy._id);
  };

  const handleUpdateStrategy = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token não encontrado no localStorage');
        setError('Token de autenticação não encontrado');
        return;
      }

      const url = `${process.env.REACT_APP_ENDPOINT_API}/admin/estrategias-globais/${editingStrategyId}`;
      const payload = {
        nome: novaEstrategia.nome,
        filtros: filtros
      };

      console.log('Tentando atualizar estratégia global:', {
        url,
        payload,
        token: token.substring(0, 10) + '...'
      });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao atualizar estratégia global: ${errorText}`);
      }

      const data = await response.json();
      setEstrategiasGlobais(prev => 
        prev.map(strategy => 
          strategy._id === editingStrategyId ? data : strategy
        )
      );
      setShowEstrategiaModal(false);
      setEditingStrategyId(null);
      setNovaEstrategia({ nome: '', filtros: [] });
      setFiltros([]);
      setError(null);
    } catch (error) {
      console.error('Erro ao atualizar estratégia global:', error);
      setError('Erro ao atualizar estratégia global: ' + error.message);
    }
  };

  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchesStatus = filtro === 'todos' ? true :
                         filtro === 'ativos' ? usuario.ativo :
                         filtro === 'inativos' ? !usuario.ativo :
                         filtro === 'admin' ? usuario.role === 'admin' : true;
    
    const matchesEmail = usuario.email.toLowerCase().startsWith(emailFilter.toLowerCase());
    
    return matchesStatus && matchesEmail;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-2 py-2">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

<h2 className='mb-4 mt-1'>Painel Administrativo</h2>

      {/* Cards de Métricas */}
      <div className="row g-3 mb-3">
        {/* Card 1 - Total de Usuários */}
        <div className="col-6 col-lg-4">
          <MetricCard
            title="Total de Usuários"
            value={usuarios.length}
            centered
            height="118px"
          />
        </div>

        {/* Card 2 - Usuários Ativos */}
        <div className="col-6 col-lg-4">
          <MetricCard
            title="Usuários Ativos"
            value={
              <div className="text-success">
                {usuarios.filter(usuario => usuario.ativo).length}
              </div>
            }
            centered
            height="118px"
          />
        </div>

        {/* Card 3 - Usuários Inativos */}
        <div className="col-6 col-lg-4">
          <MetricCard
            title="Usuários Inativos"
            value={
              <div className="text-danger">
                {usuarios.filter(usuario => !usuario.ativo).length}
              </div>
            }
            centered
            height="118px"
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12">
          
      
          {/* Seção de Estratégias Globais */}
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Estratégias Globais</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowEstrategiaModal(true)}
              >
                Nova Estratégia Global
              </button>
            </div>
            <div className="card-body p-3">
              <div className="table-responsive">
                <table className="table w-100">
                  <thead>
                    <tr>
                      <th className="w-25 text-center">Nome</th>
                      <th className="w-25 text-center">Notificações Ativas</th>
                      <th className="w-25 text-center">Remoções</th>
                      <th className="w-25 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estrategiasGlobais.map(estrategia => (
                      <tr key={estrategia._id}>
                        <td className="w-25 text-center">{estrategia.nome}</td>
                        <td className="w-25 text-center">
                          <span className={`badge ${estrategia.notificacoes?.length > 0 ? 'bg-success' : 'bg-secondary'}`}>
                            {estrategia.notificacoes?.length || 0} usuários
                          </span>
                        </td>
                        <td className="w-25 text-center">
                          <span className="badge bg-danger">
                            {estrategia.deletados?.length || 0} usuários
                          </span>
                        </td>
                        <td className="w-25 text-center">
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleEditStrategy(estrategia)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteEstrategia(estrategia._id)}
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Seção de Usuários */}
          <div className="card mb-2">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Gerenciamento de Usuários</h3>
              <div className="d-flex align-items-center gap-2">

                <div className="d-flex align-items-center">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por email..."
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    style={{ width: '200px' }}
                  />
                </div>

                <div className="d-flex align-items-center">
                  <select 
                    className="form-select w-auto"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  >
                    <option value="todos">Todos</option>
                    <option value="ativos">Ativos</option>
                    <option value="inativos">Inativos</option>
                    <option value="admin">Administradores</option>
                  </select>
                </div>

              </div>
            </div>
            <div className="card-body p-3">
              <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th className="text-center">Nome</th>
                      <th className="text-center">Email</th>
                      <th className="text-center">Role</th>
                      <th className="text-center">Ativar/Desativar</th>
                      <th className="text-center">Alterar Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map(usuario => (
                      <tr key={usuario._id}>
                        <td className="text-center">{usuario.nome}</td>
                        <td className="text-center">{usuario.email}</td>
                        <td className="text-center">
                          <span className={`badge ${usuario.role === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>
                            {usuario.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className={`btn btn-sm ${usuario.ativo ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => atualizarStatusUsuario(usuario._id, !usuario.ativo)}
                          >
                            {usuario.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                        </td>
                        <td className="text-center">
                          <button
                            className={`btn btn-sm ${usuario.role === 'admin' ? 'btn-warning' : 'btn-primary'}`}
                            onClick={() => atualizarRoleUsuario(usuario._id, usuario.role === 'admin' ? 'user' : 'admin')}
                          >
                            {usuario.role === 'admin' ? 'Tornar User' : 'Tornar Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Nova Estratégia */}
      {showEstrategiaModal && (
        <>
          <div className="modal-backdrop fade show" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1040
          }} onClick={() => setShowEstrategiaModal(false)} />
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
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '1000px', width: '1000px' }} onClick={e => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingStrategyId ? 'Editar Estratégia Global' : 'Nova Estratégia Global'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowEstrategiaModal(false)} aria-label="Close" />
                </div>
                <div className="modal-body" style={{ maxHeight: '700px', height: '700px', overflowY: 'auto' }}>
                  <form>
                    {/* Campo do nome da estratégia */}
                    <div className="row mb-3">
                      <div className="col-md-12">
                        <label className="form-label">Nome da Estratégia</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Digite o nome da estratégia..."
                          value={novaEstrategia.nome}
                          onChange={(e) => setNovaEstrategia(prev => ({ ...prev, nome: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Campos de filtro */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Pesquisar</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Digite para filtrar..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="col-md-2 px-1">
                        <label className="form-label">Indicador</label>
                        <select
                          className="form-select"
                          value={selectedIndicadorFilter}
                          onChange={(e) => setSelectedIndicadorFilter(e.target.value)}
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

                    {/* Tabela de indicadores */}
                    <div className="row">
                      <div className="col-md-6 pe-2">
                        <table className="table table-sm mb-0">
                          <tbody>
                            {/* Primeira coluna de indicadores */}
                            {(() => {
                              const items = [];
                              indicadores.forEach(indicador => {
                                indicador.tipos.forEach(tipo => {
                                  indicador.periodos.forEach(periodo => {
                                    indicador.timeframes.forEach(timeframe => {
                                      items.push({ indicador, tipo, periodo, timeframe });
                                    });
                                  });
                                });
                              });

                              const filteredItems = searchTerm 
                                ? items.filter(item => {
                                    const label = getFilterLabel(item.indicador.nome, item.tipo, item.periodo, item.timeframe);
                                    return label.toLowerCase().includes(searchTerm.toLowerCase());
                                  })
                                : items;

                              return filteredItems.filter((_, index) => index % 2 === 0).map(item => (
                                <tr key={`${item.indicador.nome}-${item.tipo}-${item.periodo}-${item.timeframe}`}>
                                  <td className="align-middle fs-9" style={{ minWidth: '220px' }}>
                                    {getFilterLabel(item.indicador.nome, item.tipo, item.periodo, item.timeframe)}
                                  </td>
                                  <td>
                                    <select
                                      className="form-select form-select-sm"
                                      placeholder="Condição"
                                      value={filtros.find(f => 
                                        f.indicador === item.indicador.nome.toLowerCase() && 
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
                                    </select>
                                  </td>
                                  <td style={{ width: '100px' }}>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      step="0.01"
                                      placeholder="Valor"
                                      value={filtros.find(f => 
                                        f.indicador === item.indicador.nome.toLowerCase() && 
                                        f.tipo === item.tipo && 
                                        f.periodo === `periodo${item.periodo}` && 
                                        f.timeframe === item.timeframe
                                      )?.valor || ''}
                                      onChange={(e) => handleValueChange(e, item)}
                                    />
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                      <div className="col-md-6 pe-2">
                        <table className="table table-sm mb-0">
                          <tbody>
                            {/* Segunda coluna de indicadores */}
                            {(() => {
                              const items = [];
                              indicadores.forEach(indicador => {
                                indicador.tipos.forEach(tipo => {
                                  indicador.periodos.forEach(periodo => {
                                    indicador.timeframes.forEach(timeframe => {
                                      items.push({ indicador, tipo, periodo, timeframe });
                                    });
                                  });
                                });
                              });

                              const filteredItems = searchTerm 
                                ? items.filter(item => {
                                    const label = getFilterLabel(item.indicador.nome, item.tipo, item.periodo, item.timeframe);
                                    return label.toLowerCase().includes(searchTerm.toLowerCase());
                                  })
                                : items;

                              return filteredItems.filter((_, index) => index % 2 === 1).map(item => (
                                <tr key={`${item.indicador.nome}-${item.tipo}-${item.periodo}-${item.timeframe}`}>
                                  <td className="align-middle fs-9" style={{ minWidth: '220px' }}>
                                    {getFilterLabel(item.indicador.nome, item.tipo, item.periodo, item.timeframe)}
                                  </td>
                                  <td>
                                    <select
                                      className="form-select form-select-sm"
                                      placeholder="Condição"
                                      value={filtros.find(f => 
                                        f.indicador === item.indicador.nome.toLowerCase() && 
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
                                    </select>
                                  </td>
                                  <td style={{ width: '100px' }}>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      step="0.01"
                                      placeholder="Valor"
                                      value={filtros.find(f => 
                                        f.indicador === item.indicador.nome.toLowerCase() && 
                                        f.tipo === item.tipo && 
                                        f.periodo === `periodo${item.periodo}` && 
                                        f.timeframe === item.timeframe
                                      )?.valor || ''}
                                      onChange={(e) => handleValueChange(e, item)}
                                    />
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
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowEstrategiaModal(false);
                      setEditingStrategyId(null);
                      setNovaEstrategia({ nome: '', filtros: [] });
                      setFiltros([]);
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={editingStrategyId ? handleUpdateStrategy : handleCreateEstrategia}
                  >
                    {editingStrategyId ? 'Atualizar Estratégia' : 'Criar Estratégia'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Admin; 