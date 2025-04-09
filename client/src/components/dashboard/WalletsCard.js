import React from 'react';
import CardBase from './CardBase';

const WalletsCard = ({ height }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const carteiras = [
    {
      nome: 'Carteira Principal',
      saldo: 50000,
      variacao: 12.5
    },
    {
      nome: 'Carteira de Trading',
      saldo: 25000,
      variacao: -5.2
    }
  ];

  return (
    <CardBase title="Minhas Carteiras" height={height}>
      <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
        {carteiras.map((carteira, index) => (
          <div key={index} className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">{carteira.nome}</h6>
              <div>
                <span className="fw-bold">{formatCurrency(carteira.saldo)}</span>
                <span className={`ms-2 ${carteira.variacao >= 0 ? 'text-success' : 'text-danger'}`}>
                  {carteira.variacao >= 0 ? '+' : ''}{carteira.variacao.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardBase>
  );
};

export default WalletsCard; 