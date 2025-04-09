import React, { useState } from 'react';

function DepositoSaque() {
  const [activeTab, setActiveTab] = useState('deposito');
  const [valor, setValor] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para processar o depósito/saque
    console.log('Processando operação:', { valor, tipo: activeTab });
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
              <div className="display-4 mb-2">{formatCurrency(15000)}</div>
              <div className="text-muted">Disponível para saque</div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h2 className="card-title mb-4">Depósito e Saque</h2>
              
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
                  <form onSubmit={handleSubmit} className="mt-4">
                    <div className="mb-4">
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
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg px-5">
                      Realizar Depósito
                    </button>
                  </form>
                </div>

                <div className={`tab-pane fade ${activeTab === 'saque' ? 'show active' : ''}`}>
                  <form onSubmit={handleSubmit} className="mt-4">
                    <div className="mb-4">
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
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg px-5">
                      Solicitar Saque
                    </button>
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