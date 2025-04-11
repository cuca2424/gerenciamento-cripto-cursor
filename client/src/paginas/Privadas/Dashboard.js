import React, { useState, useEffect } from 'react';
import MetricCard from '../../components/dashboard/MetricCard';
import MarketVariations from '../../components/dashboard/MarketVariations';
import EmptyCard from '../../components/dashboard/EmptyCard';
import OverviewCard from '../../components/dashboard/OverviewCard';
import WalletsCard from '../../components/dashboard/WalletsCard';
import MarketThermometer from '../../components/dashboard/MarketThermometer';
import useAvailableHeight from '../../hooks/useAvailableHeight';

function Dashboard() {
  const [overviewData, setOverviewData] = useState({
    saldoReais: 0,
    saldoCripto: 0,
    aporteTotal: 0,
    lucroTotal: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Considerando que temos um header de 64px e os cards de métricas com 120px + 24px de margem
  const availableHeight = useAvailableHeight(200);
  const cardHeight = availableHeight / 2 - 12; // Dividir por 2 e subtrair metade do gap (24px/2)
  const fullWidthCardHeight = availableHeight - 12; // Altura maior para quando ocupar a tela toda

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/usuario/geral`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar dados do usuário');
        }

        const data = await response.json();
        setOverviewData({
          saldoReais: data.saldoReais || 0,
          saldoCripto: data.saldoCarteiras || 0,
          aporteTotal: data.aporteTotal || 0,
          lucroTotal: data.lucroTotal || 0
        });
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

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

  if (loading) {
    return (
      <div className="container-fluid px-0 py-2">
        <div className="row g-3 mb-3 mx-0">
          <div className="col-6 col-lg-3">
            <MetricCard title="Carregando..." value="..." centered />
          </div>
          <div className="col-6 col-lg-3">
            <MetricCard title="Carregando..." value="..." centered />
          </div>
          <div className="col-6 col-lg-3">
            <MetricCard title="Carregando..." value="..." centered />
          </div>
          <div className="col-6 col-lg-3">
            <MetricCard title="Carregando..." value="..." centered />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid px-0 py-2">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0 py-2">
      {/* Cards de Métricas */}
      <div className="row g-3 mb-3 mx-0">
        <div className="col-6 col-lg-3">
          <MetricCard
            title="Saldo em Reais"
            value={formatCurrency(overviewData.saldoReais)}
            centered
          />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard
            title="Saldo em Cripto"
            value={formatCurrency(overviewData.saldoCripto)}
            centered
          />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard
            title="Total de Aportes"
            value={formatCurrency(overviewData.aporteTotal)}
            centered
          />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard
            title="Lucro Total"
            value={formatCurrency(overviewData.lucroTotal)}
            centered
          />
        </div>
      </div>

      {/* Container para os cards grandes */}
      <div className="row g-3 mx-0">
        {/* Visão Geral - Ocupa col-lg-9 em telas grandes, col-12 em menores */}
        <div className="col-12 col-lg-9">
          <OverviewCard height={window.innerWidth < 992 ? fullWidthCardHeight : cardHeight} />
        </div>

        {/* Carteiras - Ocupa col-lg-3 em telas grandes, col-md-6 em médias, col-12 em pequenas */}
        <div className="col-12 col-md-6 col-lg-3">
          <WalletsCard height={cardHeight} />
        </div>

        {/* Maiores Variações - Ocupa col-lg-6 em telas grandes, col-md-6 em médias, col-12 em pequenas */}
        <div className="col-12 col-md-6 col-lg-6">
          <MarketVariations height={cardHeight} />
        </div>

        {/* Termômetro - Ocupa col-lg-6 em telas grandes, col-12 em menores */}
        <div className="col-12 col-lg-6">
          <MarketThermometer height={cardHeight} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;