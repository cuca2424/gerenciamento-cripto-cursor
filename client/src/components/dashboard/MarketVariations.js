import React from 'react';
import CardBase from './CardBase';

const MarketVariations = ({ height }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Dados de exemplo para as variações de criptomoedas
  const variacoes = [
    { nome: 'Bitcoin', sigla: 'BTC', variacao: 12.5, preco: 250000 },
    { nome: 'Ethereum', sigla: 'ETH', variacao: 8.3, preco: 12000 },
    { nome: 'Ripple', sigla: 'XRP', variacao: 5.7, preco: 3.20 },
    { nome: 'Binance Coin', sigla: 'BNB', variacao: 4.2, preco: 1500 },
    { nome: 'Polygon', sigla: 'MATIC', variacao: 3.8, preco: 4.50 },
    { nome: 'Chainlink', sigla: 'LINK', variacao: 3.1, preco: 60 },
    { nome: 'Uniswap', sigla: 'UNI', variacao: 2.8, preco: 45 },
    { nome: 'Aave', sigla: 'AAVE', variacao: 2.5, preco: 320 },
    { nome: 'Litecoin', sigla: 'LTC', variacao: 2.2, preco: 450 },
    { nome: 'Stellar', sigla: 'XLM', variacao: 1.9, preco: 2.80 },
    { nome: 'Cardano', sigla: 'ADA', variacao: -15.2, preco: 2.5 },
    { nome: 'Solana', sigla: 'SOL', variacao: -7.8, preco: 850 },
    { nome: 'Polkadot', sigla: 'DOT', variacao: -6.4, preco: 120 },
    { nome: 'Avalanche', sigla: 'AVAX', variacao: -5.9, preco: 180 },
    { nome: 'Cosmos', sigla: 'ATOM', variacao: -4.7, preco: 90 },
    { nome: 'Near', sigla: 'NEAR', variacao: -3.9, preco: 25 },
    { nome: 'Algorand', sigla: 'ALGO', variacao: -3.5, preco: 8.50 },
    { nome: 'VeChain', sigla: 'VET', variacao: -3.2, preco: 1.20 },
    { nome: 'Fantom', sigla: 'FTM', variacao: -2.8, preco: 3.40 },
    { nome: 'Tezos', sigla: 'XTZ', variacao: -2.5, preco: 15 }
  ];

  return (
    <CardBase title="Maiores Variações" height={height}>
      <div className="row g-0">
        <div className="col-6 pe-2">
          <h6 className="text-success mb-2 small">Maiores Altas</h6>
          <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
            {variacoes
              .filter(crypto => crypto.variacao > 0)
              .sort((a, b) => b.variacao - a.variacao)
              .map(crypto => (
                <div key={crypto.sigla} className="mb-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <div style={{ fontSize: '0.85rem' }}>
                      <span className="fw-bold">{crypto.sigla}</span>
                      <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>({crypto.nome})</span>
                    </div>
                    <div className="text-end" style={{ fontSize: '0.85rem' }}>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formatCurrency(crypto.preco)}</span>
                      <span className="text-success fw-bold ms-2">{formatPercentage(crypto.variacao)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="col-6 ps-2">
          <h6 className="text-danger mb-2 small">Maiores Baixas</h6>
          <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
            {variacoes
              .filter(crypto => crypto.variacao < 0)
              .sort((a, b) => a.variacao - b.variacao)
              .map(crypto => (
                <div key={crypto.sigla} className="mb-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <div style={{ fontSize: '0.85rem' }}>
                      <span className="fw-bold">{crypto.sigla}</span>
                      <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>({crypto.nome})</span>
                    </div>
                    <div className="text-end" style={{ fontSize: '0.85rem' }}>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formatCurrency(crypto.preco)}</span>
                      <span className="text-danger fw-bold ms-2">{formatPercentage(crypto.variacao)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </CardBase>
  );
};

export default MarketVariations; 