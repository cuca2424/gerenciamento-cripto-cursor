import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import CardBase from './CardBase';

const MarketThermometer = ({ height }) => {
  const btcDominanceRef = useRef(null);
  const fearGreedRef = useRef(null);
  const altcoinSeasonRef = useRef(null);
  const btcDominanceInstance = useRef(null);
  const fearGreedInstance = useRef(null);
  const altcoinSeasonInstance = useRef(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Função para buscar os dados de mercado
  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/mercado`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do mercado');
      }

      const data = await response.json();
      console.log('Dados do mercado recebidos:', data);
      setMarketData(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar dados do mercado:', err);
      setError('Falha ao carregar os dados do mercado');
      setMarketData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (valor, type) => {
    if (type === 'fearGreed') {
      if (valor >= 75) return '#00b747'; // Ganância Extrema - Verde escuro
      if (valor >= 60) return '#28a745'; // Ganância - Verde normal
      if (valor >= 40) return '#ffc107'; // Neutro - Amarelo
      if (valor >= 25) return '#fd7e14'; // Medo - Laranja
      return '#dc3545'; // Medo Extremo - Vermelho
    } else if (type === 'altcoin') {
      if (valor >= 75) return '#007bff'; // Altcoin Season forte - Azul forte
      if (valor >= 60) return '#6495ED'; // Altcoin Season - Azul médio
      if (valor >= 40) return '#808080'; // Neutro - Cinza
      if (valor >= 25) return '#CD7F32'; // Bitcoin Season - Bronze
      return '#ffd700'; // Bitcoin Season forte - Dourado
    } else { // BTC Dominance
      return '#f7931a'; // Cor padrão do Bitcoin
    }
  };

  const getFearGreedLabel = (valor) => {
    if (valor >= 75) return 'Ganância Extrema';
    if (valor >= 60) return 'Ganância';
    if (valor >= 40) return 'Neutro';
    if (valor >= 25) return 'Medo';
    return 'Medo Extremo';
  };

  const getAltcoinSeasonLabel = (valor) => {
    if (valor >= 75) return 'Altcoin Season Forte';
    if (valor >= 60) return 'Altcoin Season';
    if (valor >= 40) return 'Neutro';
    if (valor >= 25) return 'Bitcoin Season';
    return 'Bitcoin Season Forte';
  };

  const initCharts = () => {
    if (!marketData) return;
    
    // Inicializar o gráfico BTC Dominance
    if (btcDominanceRef.current) {
      if (btcDominanceInstance.current) {
        btcDominanceInstance.current.dispose();
      }

      btcDominanceInstance.current = echarts.init(btcDominanceRef.current);
      
      const btcColor = getStatusColor(marketData.dominanciaBTC.valor, 'btc');
      
      const btcDominanceOption = {
        tooltip: {
          formatter: params => {
            return `
            <div style="padding: 5px;">
              <div style="font-weight: bold;">${marketData.dominanciaBTC.valor.toFixed(1)}%</div>
              <div style="font-size: 12px;">Tendência: ${marketData.dominanciaBTC.tendencia}</div>
            </div>
            `;
          }
        },
        series: [
          {
            type: 'gauge',
            center: ['50%', '60%'],
            radius: '100%',
            startAngle: 180,
            endAngle: 0,
            progress: {
              show: true,
              width: 18,
              itemStyle: {
                color: btcColor
              }
            },
            itemStyle: {
              color: btcColor,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            },
            axisLine: {
              lineStyle: {
                width: 18,
                color: [[1, '#e9ecef']]
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            anchor: {
              show: true,
              showAbove: true,
              size: 25,
              itemStyle: {
                color: btcColor
              }
            },
            title: {
              show: false
            },
            detail: {
              valueAnimation: true,
              fontSize: 30,
              offsetCenter: [0, '70%'],
              color: '#5e6e82',
              formatter: function(value) {
                return value.toFixed(1) + '%';
              }
            },
            data: [
              {
                value: marketData.dominanciaBTC.valor,
                name: 'Dominância BTC',
                detail: {
                  fontSize: 20,
                  color: '#5e6e82',
                  offsetCenter: [0, '40%']
                }
              }
            ]
          }
        ]
      };
      
      btcDominanceInstance.current.setOption(btcDominanceOption);
    }
    
    // Inicializar o gráfico Fear & Greed
    if (fearGreedRef.current) {
      if (fearGreedInstance.current) {
        fearGreedInstance.current.dispose();
      }
      
      fearGreedInstance.current = echarts.init(fearGreedRef.current);
      
      const fearGreedColor = getStatusColor(marketData.indiceMedoGanancia.valor, 'fearGreed');
      
      const fearGreedOption = {
        tooltip: {
          formatter: params => {
            return `
            <div style="padding: 5px;">
              <div style="font-weight: bold;">${marketData.indiceMedoGanancia.valor}</div>
              <div style="font-size: 12px;">${marketData.indiceMedoGanancia.classificacao}</div>
            </div>
            `;
          }
        },
        series: [
          {
            type: 'gauge',
            center: ['50%', '60%'],
            radius: '100%',
            startAngle: 180,
            endAngle: 0,
            progress: {
              show: true,
              width: 18,
              itemStyle: {
                color: fearGreedColor
              }
            },
            itemStyle: {
              color: fearGreedColor,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            },
            axisLine: {
              lineStyle: {
                width: 18,
                color: [[1, '#e9ecef']]
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            anchor: {
              show: true,
              showAbove: true,
              size: 25,
              itemStyle: {
                color: fearGreedColor
              }
            },
            title: {
              show: false
            },
            detail: {
              valueAnimation: true,
              fontSize: 30,
              offsetCenter: [0, '70%'],
              color: '#5e6e82'
            },
            data: [
              {
                value: marketData.indiceMedoGanancia.valor,
                name: 'Medo e Ganância',
                detail: {
                  fontSize: 20,
                  color: '#5e6e82',
                  offsetCenter: [0, '40%']
                }
              }
            ]
          }
        ]
      };
      
      fearGreedInstance.current.setOption(fearGreedOption);
    }
    
    // Inicializar o gráfico Altcoin Season
    if (altcoinSeasonRef.current) {
      if (altcoinSeasonInstance.current) {
        altcoinSeasonInstance.current.dispose();
      }
      
      altcoinSeasonInstance.current = echarts.init(altcoinSeasonRef.current);
      
      const altcoinColor = getStatusColor(marketData.altcoinSeason.valor, 'altcoin');
      
      const altcoinSeasonOption = {
        tooltip: {
          formatter: params => {
            return `
            <div style="padding: 5px;">
              <div style="font-weight: bold;">${marketData.altcoinSeason.valor}</div>
              <div style="font-size: 12px;">${marketData.altcoinSeason.status}</div>
            </div>
            `;
          }
        },
        series: [
          {
            type: 'gauge',
            center: ['50%', '60%'],
            radius: '100%',
            startAngle: 180,
            endAngle: 0,
            progress: {
              show: true,
              width: 18,
              itemStyle: {
                color: altcoinColor
              }
            },
            itemStyle: {
              color: altcoinColor,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            },
            axisLine: {
              lineStyle: {
                width: 18,
                color: [[1, '#e9ecef']]
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            anchor: {
              show: true,
              showAbove: true,
              size: 25,
              itemStyle: {
                color: altcoinColor
              }
            },
            title: {
              show: false
            },
            detail: {
              valueAnimation: true,
              fontSize: 30,
              offsetCenter: [0, '70%'],
              color: '#5e6e82'
            },
            data: [
              {
                value: marketData.altcoinSeason.valor,
                name: 'Altcoin Season',
                detail: {
                  fontSize: 20,
                  color: '#5e6e82',
                  offsetCenter: [0, '40%']
                }
              }
            ]
          }
        ]
      };
      
      altcoinSeasonInstance.current.setOption(altcoinSeasonOption);
    }
  };

  useEffect(() => {
    // Buscar dados do mercado
    fetchMarketData();

    // Função para atualizar os dados periodicamente
    const intervalId = setInterval(() => {
      fetchMarketData();
    }, 300000); // Atualizar a cada 5 minutos

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (marketData) {
      // Inicializar os gráficos após dados serem carregados
      setTimeout(() => {
        initCharts();
      }, 100);
    }
  }, [marketData]);

  useEffect(() => {
    const handleResize = () => {
      if (btcDominanceInstance.current) {
        btcDominanceInstance.current.resize();
      }
      if (fearGreedInstance.current) {
        fearGreedInstance.current.resize();
      }
      if (altcoinSeasonInstance.current) {
        altcoinSeasonInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (btcDominanceInstance.current) {
        btcDominanceInstance.current.dispose();
      }
      if (fearGreedInstance.current) {
        fearGreedInstance.current.dispose();
      }
      if (altcoinSeasonInstance.current) {
        altcoinSeasonInstance.current.dispose();
      }
    };
  }, []);

  return (
    <CardBase title="Termômetro do Mercado" height={height}>
      <div className="d-flex flex-column" style={{ height: `calc(${height}px - 50px - 15px)` }}>
        {loading && !marketData ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : error ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="alert alert-danger">{error}</div>
          </div>
        ) : (
          <div className="row align-items-center h-100">
            {/* BTC Dominance - Gauge Chart */}
            <div className="col-4 d-flex flex-column justify-content-center">
              <div className="text-center mb-3">
                <h6 className="mb-0 fs-7 fs-md-8 fs-lg-9">Dominância BTC</h6>
                {marketData && (
                  <small className="text-muted">
                    {marketData.dominanciaBTC.tendencia}
                  </small>
                )}
              </div>
              <div 
                ref={btcDominanceRef} 
                className="d-flex align-items-center justify-content-center"
                style={{ 
                  width: '100%', 
                  height: '180px'
                }} 
              />
            </div>

            {/* Fear & Greed Index - Gauge Chart */}
            <div className="col-4 d-flex flex-column justify-content-center">
              <div className="text-center mb-3">
                <h6 className="mb-0 fs-7 fs-md-8 fs-lg-9">Índice Medo e Ganância</h6>
                {marketData && (
                  <small className={`text-${marketData.indiceMedoGanancia.valor >= 50 ? 'success' : 'danger'}`}>
                    {marketData.indiceMedoGanancia.classificacao}
                  </small>
                )}
              </div>
              <div 
                ref={fearGreedRef} 
                className="d-flex align-items-center justify-content-center"
                style={{ 
                  width: '100%', 
                  height: '180px'
                }} 
              />
            </div>

            {/* Altcoin Season Index - Gauge Chart */}
            <div className="col-4 d-flex flex-column justify-content-center">
              <div className="text-center mb-3">
                <h6 className="mb-0 fs-7 fs-md-8 fs-lg-9">Índice Altcoin Season</h6>
                {marketData && (
                  <small className={`text-${marketData.altcoinSeason.status === 'Altcoin Season' ? 'primary' : (marketData.altcoinSeason.status === 'Bitcoin Season' ? 'warning' : 'muted')}`}>
                    {marketData.altcoinSeason.status}
                  </small>
                )}
              </div>
              <div 
                ref={altcoinSeasonRef} 
                className="d-flex align-items-center justify-content-center"
                style={{ 
                  width: '100%', 
                  height: '180px'
                }} 
              />
            </div>
          </div>
        )}
      </div>
    </CardBase>
  );
};

export default MarketThermometer; 