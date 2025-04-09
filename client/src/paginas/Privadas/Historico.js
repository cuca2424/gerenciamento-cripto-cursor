import React, { useState, useMemo } from 'react';

function Historico() {
  const [filtro, setFiltro] = useState({
    busca: '',
    tipo: 'todos'
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Dados de exemplo
  const transacoes = [
    {
      id: 1,
      data: '2024-03-01',
      tipo: 'Depósito',
      descricao: 'Depósito via PIX',
      valor: 1000
    },
    {
      id: 2,
      data: '2024-02-28',
      tipo: 'Compra',
      descricao: 'Compra de Bitcoin',
      valor: 500
    },
    {
      id: 3,
      data: '2024-02-25',
      tipo: 'Venda',
      descricao: 'Venda de Ethereum',
      valor: 2000
    },
    {
      id: 4,
      data: '2024-02-20',
      tipo: 'Saque',
      descricao: 'Saque para conta bancária',
      valor: 300
    }
  ];

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltro(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filtrar transações com base na busca e tipo
  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(transacao => {
      const buscaMatch = filtro.busca === '' || 
        transacao.descricao.toLowerCase().includes(filtro.busca.toLowerCase()) ||
        formatDate(transacao.data).includes(filtro.busca) ||
        formatCurrency(transacao.valor).includes(filtro.busca);

      const tipoMatch = filtro.tipo === 'todos' || 
        transacao.tipo.toLowerCase() === filtro.tipo.toLowerCase();

      return buscaMatch && tipoMatch;
    });
  }, [filtro.busca, filtro.tipo]);

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
                    {transacoesFiltradas.map(transacao => (
                      <tr key={transacao.id}>
                        <td>{formatDate(transacao.data)}</td>
                        <td>
                          <span className={`badge ${
                            transacao.tipo === 'Depósito' ? 'bg-success' :
                            transacao.tipo === 'Saque' ? 'bg-danger' :
                            transacao.tipo === 'Compra' ? 'bg-primary' :
                            'bg-info'
                          }`}>
                            {transacao.tipo}
                          </span>
                        </td>
                        <td>{transacao.descricao}</td>
                        <td>{formatCurrency(transacao.valor)}</td>
                      </tr>
                    ))}
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