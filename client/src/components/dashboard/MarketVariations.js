import React, { useState, useMemo, useEffect } from 'react';
import CardBase from './CardBase';

const MarketVariations = ({ height }) => {
  const [showProfits, setShowProfits] = useState(true);
  const [variacoes, setVariacoes] = useState({
    positivas: [],
    negativas: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVariations();
  }, []);

  useEffect(() => {
    // Log para debug
    console.log("Dados carregados:", variacoes);
    console.log("Variações positivas:", variacoes.positivas.length);
    console.log("Variações negativas:", variacoes.negativas.length);
  }, [variacoes]);

  const fetchVariations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/graficos/maiores-variacoes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar variações do mercado');
      }

      const data = await response.json();
      setVariacoes({
        positivas: data.positivas || [],
        negativas: data.negativas || []
      });
    } catch (err) {
      console.error('Erro ao buscar variações:', err);
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

  // Calcular quantos itens cabem no espaço disponível
  const calculateMaxItems = useMemo(() => {
    // Altura do título + margens + padding
    const headerHeight = 42;
    // Altura do toggle quando visível
    const toggleHeight = 46;
    // Altura de cada item
    const itemHeight = 30;
    // Altura disponível para os itens
    const availableHeight = height - headerHeight - (window.innerWidth < 1400 ? toggleHeight : 0);
    // Quantidade máxima de itens que cabem
    return Math.floor(availableHeight / itemHeight);
  }, [height]);

  // Filtrar e ordenar as variações para telas pequenas
  const filteredVariations = showProfits 
    ? variacoes.positivas.slice(0, calculateMaxItems)
    : variacoes.negativas.slice(0, calculateMaxItems);

  if (loading) {
    return (
      <CardBase title="Maiores Variações" height={height}>
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </CardBase>
    );
  }

  if (error) {
    return (
      <CardBase title="Maiores Variações" height={height}>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </CardBase>
    );
  }

  return (
    <CardBase title="Maiores Variações" height={height}>
      {/* Toggle para telas grandes */}
      <div className="d-xxl-none d-flex justify-content-between align-items-center mb-3">
        <h6 className={`mb-0 small ${showProfits ? 'text-success' : 'text-danger'}`}>
          {showProfits ? 'Maiores Altas' : 'Maiores Baixas'}
        </h6>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="variationToggle"
            checked={showProfits}
            onChange={() => setShowProfits(!showProfits)}
          />
          <label className="form-check-label" htmlFor="variationToggle">
            {showProfits ? 'Altas' : 'Baixas'}
          </label>
        </div>
      </div>

      {/* Conteúdo para telas grandes */}
      <div className="d-xxl-none" style={{ maxHeight: '100%', overflowY: 'auto' }}>
        {filteredVariations.map(crypto => (
          <div key={crypto.sigla} className="mb-1">
            <div className="d-flex justify-content-between align-items-center">
              <div style={{ fontSize: '0.85rem' }}>
                <span className="fw-bold">{crypto.sigla}</span>
                <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>({crypto.nome})</span>
              </div>
              <div className="text-end" style={{ fontSize: '0.85rem' }}>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formatCurrency(crypto.precoAtual)}</span>
                <span className={`${crypto.variacao24h >= 0 ? 'text-success' : 'text-danger'} fw-bold ms-2`}>
                  {formatPercentage(crypto.variacao24h)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conteúdo para telas extra grandes */}
      <div className="d-none d-xxl-block">
        <div className="row g-0">
          <div className="col-xxl-6 pe-2">
            <h6 className="text-success mb-2 small">Maiores Altas</h6>
            <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
              {variacoes.positivas
                .slice(0, calculateMaxItems)
                .map(crypto => (
                  <div key={crypto.sigla} className="mb-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <div style={{ fontSize: '0.85rem' }}>
                        <span className="fw-bold">{crypto.sigla}</span>
                        <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>({crypto.nome})</span>
                      </div>
                      <div className="text-end" style={{ fontSize: '0.85rem' }}>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formatCurrency(crypto.precoAtual)}</span>
                        <span className="text-success fw-bold ms-2">{formatPercentage(crypto.variacao24h)}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="col-xxl-6 ps-2">
            <h6 className="text-danger mb-2 small">Maiores Baixas</h6>
            <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
              {variacoes.negativas
                .slice(0, calculateMaxItems)
                .map(crypto => (
                  <div key={crypto.sigla} className="mb-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <div style={{ fontSize: '0.85rem' }}>
                        <span className="fw-bold">{crypto.sigla}</span>
                        <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>({crypto.nome})</span>
                      </div>
                      <div className="text-end" style={{ fontSize: '0.85rem' }}>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formatCurrency(crypto.precoAtual)}</span>
                        <span className="text-danger fw-bold ms-2">{formatPercentage(crypto.variacao24h)}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </CardBase>
  );
};

export default MarketVariations; 