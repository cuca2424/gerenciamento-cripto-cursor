import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CardBase from './CardBase';

const WalletsCard = ({ height }) => {
  const navigate = useNavigate();
  const [carteiras, setCarteiras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCarteiras();
  }, []);

  const handleWalletClick = (carteira) => {
    navigate(`/carteiras/${carteira._id}`);
  };

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

  return (
    <CardBase title="Minhas Carteiras" height={height}>
      <div style={{ maxHeight: '100%', overflowY: 'auto', paddingTop: '0' }}>
        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : carteiras.length === 0 ? (
          <div className="text-center py-3">
            <p className="text-muted mb-0">Nenhuma carteira encontrada</p>
          </div>
        ) : (
          carteiras.map((carteira, index) => (
            <div 
              key={index} 
              className={`py-2 cursor-pointer ${index < carteiras.length - 1 ? 'border-bottom' : ''}`}
              onClick={() => handleWalletClick(carteira)}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0" style={{ fontSize: '1.05rem' }}>{carteira.nome}</h5>
                <div>
                  <span className="fw-bold">{formatCurrency(carteira.saldo)}</span>
                  <span className={`ms-2 ${carteira.variacao >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatPercentage(carteira.variacao)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </CardBase>
  );
};

export default WalletsCard; 