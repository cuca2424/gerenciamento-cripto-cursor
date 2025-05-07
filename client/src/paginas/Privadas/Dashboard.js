import React, { useState, useEffect } from 'react';
import MetricCard from '../../components/dashboard/MetricCard';
import MarketVariations from '../../components/dashboard/MarketVariations';
import EmptyCard from '../../components/dashboard/EmptyCard';
import OverviewCard from '../../components/dashboard/OverviewCard';
import WalletsCard from '../../components/dashboard/WalletsCard';
import MarketThermometer from '../../components/dashboard/MarketThermometer';
import useAvailableHeight from '../../hooks/useAvailableHeight';
import { useCurrency } from "../../contexts/CurrencyContext";

function Dashboard() {
  const { currency } = useCurrency();
  const [overviewData, setOverviewData] = useState({
    brl: {
      saldoReais: 0,
      saldoCarteiras: 0,
      aporteTotal: 0,
      lucroRealizado: 0,
      percentualLucro: 0
    },
    usd: {
      saldoReais: 0,
      saldoCarteiras: 0,
      aporteTotal: 0,
      lucroRealizado: 0,
      percentualLucro: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Considerando que temos um header de 64px e os cards de métricas com 120px + 24px de margem
  const availableHeight = windowHeight - 200;
  const cardHeight = availableHeight / 2 - 12;
  const fullWidthCardHeight = availableHeight - 12;

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
          brl: {
            saldoReais: data.brl.saldoReais || 0,
            saldoCarteiras: data.brl.saldoCarteiras || 0,
            aporteTotal: data.brl.aporteTotal || 0,
            lucroRealizado: data.brl.lucroRealizado || 0,
            percentualLucro: data.brl.percentualLucro || 0
          },
          usd: {
            saldoReais: data.usd.saldoReais || 0,
            saldoCarteiras: data.usd.saldoCarteiras || 0,
            aporteTotal: data.usd.aporteTotal || 0,
            lucroRealizado: data.usd.lucroRealizado || 0,
            percentualLucro: data.usd.percentualLucro || 0
          }
        });

        console.log('Overview data => ', data);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  useEffect(() => {
    if (loading) {
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = '';
    }
    return () => {
      document.body.style.overflowY = '';
    };
  }, [loading]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL',
      currencyDisplay: 'symbol'
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
      <div className="container-fluid px-0 pt-2">
        <div className="row g-3 mb-3 mx-0" style={{height: "118px"}}>
          {[...Array(4)].map((_, index) => (
            <div key={index} className="col-6 col-lg-3">
              <div className="card h-100">
                <div className="card-body d-flex align-items-center justify-content-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row g-3 mx-0">
          <div className="col-12 col-lg-9">
            <div className="card" style={{ height: windowWidth < 992 ? fullWidthCardHeight : cardHeight }}>
              <div className="card-body d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card" style={{ height: cardHeight }}>
              <div className="card-body d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-6">
            <div className="card" style={{ height: cardHeight }}>
              <div className="card-body d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card" style={{ height: windowWidth < 768 ? 400 : cardHeight }}>
              <div className="card-body d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            </div>
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
    <div className="container-fluid px-0 pt-2" style={{ 
      height: '100%', 
      overflowY: windowWidth < 992 ? 'auto' : 'hidden'
    }}>
      {/* Cards de Métricas */}
      <div className="row g-3 mb-3 mx-0">
        <div className="col-12 col-sm-6 col-md-3">
          <MetricCard
            title={`Saldo em ${currency === 'USD' ? 'Dólares' : 'Reais'}`}
            value={formatCurrency(overviewData[currency.toLowerCase()]?.saldoReais || 0)}
            centered
          />
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <MetricCard
            title="Saldo em Cripto"
            value={
              <div className="d-flex align-items-center justify-content-center">
                <span>{formatCurrency(overviewData[currency.toLowerCase()]?.saldoCarteiras || 0)}</span>
                <span className={`badge ms-2 ${(overviewData[currency.toLowerCase()]?.aporteTotal > 0 ? (overviewData[currency.toLowerCase()]?.saldoCarteiras / overviewData[currency.toLowerCase()]?.aporteTotal - 1) * 100 : 0) >= 0 ? 'bg-success' : 'bg-danger'}`}>
                  {formatPercentage(overviewData[currency.toLowerCase()]?.aporteTotal > 0 ? (overviewData[currency.toLowerCase()]?.saldoCarteiras / overviewData[currency.toLowerCase()]?.aporteTotal - 1) * 100 : 0)}
                </span>
              </div>
            }
            centered
          />
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <MetricCard
            title="Custo das Criptos"
            value={formatCurrency(overviewData[currency.toLowerCase()]?.aporteTotal || 0)}
            centered
          />
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <MetricCard
            title={(overviewData[currency.toLowerCase()]?.lucroRealizado ?? 0) >= 0 ? 'Lucro Realizado' : 'Prejuízo Realizado'}
            titleClassName={(overviewData[currency.toLowerCase()]?.lucroRealizado ?? 0) >= 0 ? 'text-success' : 'text-danger'}
            value={
              <div className={`${(overviewData[currency.toLowerCase()]?.lucroRealizado ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(overviewData[currency.toLowerCase()]?.lucroRealizado || 0)}
              </div>
            }
            centered
          />
        </div>
      </div>

      {/* Container para os cards grandes */}
      <div className="row g-3 mx-0">
        {/* Visão Geral - Ocupa col-lg-9 em telas grandes, col-12 em menores */}
        <div className="col-12 col-lg-7">
          <OverviewCard height={windowWidth < 992 ? fullWidthCardHeight : cardHeight} />
        </div>

        {/* Carteiras - Ocupa col-lg-3 em telas grandes, col-md-6 em médias, col-12 em pequenas */}
        <div className="col-12 col-md-6 col-lg-5">
          <WalletsCard height={cardHeight} />
        </div>

        {/* Maiores Variações - Ocupa col-lg-6 em telas grandes, col-md-6 em médias, col-12 em pequenas */}
        <div className="col-12 col-md-6 col-lg-6">
          <MarketVariations height={cardHeight} />
        </div>

        {/* Termômetro - Ocupa col-lg-6 em telas grandes, col-12 em menores */}
        <div className="col-12 col-lg-6">
          <MarketThermometer 
            height={windowWidth < 768 ? 800 : cardHeight} 
            style={windowWidth < 768 ? { marginTop: '2rem' } : {}} 
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;