import React, { useState, useEffect } from 'react';

function Historico() {
  const [filtro, setFiltro] = useState({
    busca: '',
    tipo: 'todos'
  });
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/historico/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar histórico');
        }

        const data = await response.json();
        setTransacoes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltro(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filtrar transações com base na busca e tipo
  const transacoesFiltradas = transacoes.filter(transacao => {
    const buscaMatch = filtro.busca === '' || 
      transacao.descricao.toLowerCase().includes(filtro.busca.toLowerCase()) ||
      formatDate(transacao.data).includes(filtro.busca) ||
      formatCurrency(transacao.valor).includes(filtro.busca);

    const tipoMatch = filtro.tipo === 'todos' || 
      transacao.tipo.toLowerCase() === filtro.tipo.toLowerCase();

    return buscaMatch && tipoMatch;
  });

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
                <p className="mt-3">Carregando histórico...</p>
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
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title mb-4">Histórico de Transações</h2>
              
              <div className="row g-3 mb-4">
                <div className="col-md-8">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Pesquisar transações..."
                      name="busca"
                      value={filtro.busca}
                      onChange={handleFiltroChange}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <select 
                    className="form-select form-select-lg"
                    name="tipo"
                    value={filtro.tipo}
                    onChange={handleFiltroChange}
                  >
                    <option value="todos">Todos os tipos</option>
                    <option value="deposito">Depósito</option>
                    <option value="saque">Saque</option>
                    <option value="compra">Compra</option>
                    <option value="venda">Venda</option>
                    <option value="exclusao">Exclusão</option>
                    <option value="criacao">Criação</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Tipo</th>
                      <th>Descrição</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacoesFiltradas.length > 0 ? (
                      transacoesFiltradas.map(transacao => (
                        <tr key={transacao.id}>
                          <td>{formatDate(transacao.data)}</td>
                          <td>
                            <span className={`badge ${
                              transacao.tipo === 'deposito' ? 'bg-success' :
                              transacao.tipo === 'saque' ? 'bg-danger' :
                              transacao.tipo === 'compra' ? 'bg-primary' :
                              transacao.tipo === 'venda' ? 'bg-info' :
                              transacao.tipo === 'exclusao' ? 'bg-warning' :
                              transacao.tipo === 'criacao' ? 'bg-secondary' :
                              'bg-dark'
                            }`} style={{ 
                              minWidth: '100px', 
                              display: 'inline-block',
                              textAlign: 'center'
                            }}>
                              {transacao.tipo.charAt(0).toUpperCase() + transacao.tipo.slice(1)}
                            </span>
                          </td>
                          <td>{transacao.descricao}</td>
                          <td>{formatCurrency(transacao.valor)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">Nenhuma transação encontrada</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Historico; 