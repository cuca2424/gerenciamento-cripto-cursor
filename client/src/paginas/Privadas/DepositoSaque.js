import React, { useState, useEffect } from 'react';

function DepositoSaque() {
  const [activeTab, setActiveTab] = useState('deposito');
  const [valor, setValor] = useState('');
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    // Buscar saldo atual do usuário
    const fetchSaldo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/usuario/geral`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar saldo');
        }

        const data = await response.json();
        setSaldoAtual(data.saldoReais || 0);
      } catch (err) {
        setMensagem({ texto: 'Erro ao carregar saldo', tipo: 'danger' });
      }
    };

    fetchSaldo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ texto: '', tipo: '' });

    try {
      const token = localStorage.getItem('token');
      const valorNumerico = parseFloat(valor);
      
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        throw new Error('Valor inválido');
      }

      if (activeTab === 'saque' && valorNumerico > saldoAtual) {
        throw new Error('Saldo insuficiente para saque.');
      }

      const endpoint = activeTab === 'deposito' ? 'deposito' : 'saque';
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/usuario/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ valor: valorNumerico })
      });

      const data = await response.json();
      console.log('Resposta completa do backend:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar operação');
      }

      // Verificar a estrutura da resposta
      if (typeof data.saldoAtual === 'undefined') {
        console.error('Estrutura da resposta inesperada:', data);
        // Se não tiver saldoAtual, tenta usar outro campo ou mantém o saldo atual
        setMensagem({ 
          texto: data.message || 'Operação realizada com sucesso', 
          tipo: 'success' 
        });
        return;
      }

      // Tentar converter o novo saldo
      const novoSaldo = Number(data.saldoAtual);
      console.log('Novo saldo convertido:', novoSaldo);

      if (isNaN(novoSaldo)) {
        console.error('Valor inválido recebido:', data.saldoAtual);
        // Se a conversão falhar, mantém o saldo atual
        setMensagem({ 
          texto: data.message || 'Operação realizada com sucesso', 
          tipo: 'success' 
        });
        return;
      }

      // Atualizar saldo após operação bem-sucedida
      setSaldoAtual(novoSaldo);
      setValor('');
      setMensagem({ 
        texto: `${data.message} Novo saldo: ${formatCurrency(novoSaldo)}`, 
        tipo: 'success' 
      });
    } catch (err) {
      setMensagem({ texto: err.message, tipo: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center">
              <h4 className="card-title mb-3">Saldo Atual</h4>
              <div className="display-4 mb-2">{formatCurrency(saldoAtual)}</div>
              <div className="text-muted">Disponível para saque</div>
            </div>
          </div>

          {mensagem.texto && (
            <div className={`alert alert-${mensagem.tipo} mb-4`} role="alert">
              {mensagem.texto}
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title mb-4 text-center">Depósito e Saque</h2>
              
              <ul className="nav nav-tabs nav-fill mb-4" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'deposito' ? 'active text-primary border-bottom border-2 border-primary' : 'text-muted'}`}
                    onClick={() => setActiveTab('deposito')}
                    type="button"
                    role="tab"
                  >
                    Depósito
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'saque' ? 'active text-primary border-bottom border-2 border-primary' : 'text-muted'}`}
                    onClick={() => setActiveTab('saque')}
                    type="button"
                    role="tab"
                  >
                    Saque
                  </button>
                </li>
              </ul>

              <div className="tab-content">
                <div className={`tab-pane fade ${activeTab === 'deposito' ? 'show active' : ''}`}>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4 text-center">
                      <label className="form-label h5">Valor do Depósito</label>
                      <div className="input-group input-group-lg mx-auto" style={{ maxWidth: '300px' }}>
                        <span className="input-group-text">R$</span>
                        <input
                          type="number"
                          className="form-control"
                          value={valor}
                          onChange={(e) => setValor(e.target.value)}
                          placeholder="0,00"
                          step="0.01"
                          min="0"
                          required
                          disabled={loading}
                        />
                      </div>
                      <small className="text-muted mt-2 d-block" style={{ visibility: 'hidden' }}>
                        &nbsp;
                      </small>
                    </div>

                    <div className="text-center">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg px-5"
                        disabled={loading}
                      >
                        {loading ? 'Processando...' : 'Realizar Depósito'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className={`tab-pane fade ${activeTab === 'saque' ? 'show active' : ''}`}>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4 text-center">
                      <label className="form-label h5">Valor do Saque</label>
                      <div className="input-group input-group-lg mx-auto" style={{ maxWidth: '300px' }}>
                        <span className="input-group-text">R$</span>
                        <input
                          type="number"
                          className="form-control"
                          value={valor}
                          onChange={(e) => setValor(e.target.value)}
                          placeholder="0,00"
                          step="0.01"
                          min="0"
                          max={saldoAtual}
                          required
                          disabled={loading}
                        />
                      </div>
                      <small className={`mt-2 d-block ${parseFloat(valor) > saldoAtual ? 'text-danger' : 'text-muted'}`}>
                        {parseFloat(valor) > saldoAtual ? 
                          'Saldo insuficiente para realizar o saque.' : 
                          `Saldo disponível: ${formatCurrency(saldoAtual)}`
                        }
                      </small>
                    </div>

                    <div className="text-center">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg px-5"
                        disabled={loading || saldoAtual <= 0 || parseFloat(valor) > saldoAtual}
                      >
                        {loading ? 'Processando...' : 'Solicitar Saque'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepositoSaque; 