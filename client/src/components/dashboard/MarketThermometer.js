import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import CardBase from './CardBase';

const MarketThermometer = ({ height }) => {
  const btcDominanceRef = useRef(null);
  const fearGreedRef = useRef(null);
  const altcoinSeasonRef = useRef(null);
  const btcDominanceInstance = useRef(null);
  const fearGreedInstance = useRef(null);
  const altcoinSeasonInstance = useRef(null);

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const indicadores = [
    {
      nome: 'Dominância BTC',
      valor: 48.5,
      variacao: 2.3,
      cor: '#f7931a'
    },
    {
      nome: 'Índice Medo e Ganância',
      valor: 75,
      variacao: 5,
      cor: '#28a745'
    },
    {
      nome: 'Índice Altcoin Season',
      valor: 65,
      variacao: 8,
      cor: '#007bff'
    }
  ];

  const getStatusColor = (valor) => {
    if (valor >= 80) return 'text-success';
    if (valor >= 60) return 'text-info';
    if (valor >= 40) return 'text-warning';
    return 'text-danger';
  };

  const initCharts = () => {
    // Inicializar o gráfico BTC Dominance
    if (btcDominanceRef.current) {
      if (btcDominanceInstance.current) {
        btcDominanceInstance.current.dispose();
      }
      
      btcDominanceInstance.current = echarts.init(btcDominanceRef.current);
      
      const btcDominanceOption = {
        tooltip: {
          trigger: 'axis',
          padding: [7, 10],
          backgroundColor: '#fff',
          borderColor: '#e9ecef',
          textStyle: { color: '#5e6e82' },
          borderWidth: 1,
          formatter: params => {
            return `
            <div>
              <h6 class="fs-9 text-body-tertiary mb-0">
                <span class="fas fa-circle me-1" style='color:${params[0].color}'></span>
                ${params[0].name} : ${params[0].value}
              </h6>
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
                color: '#f7931a'
              }
            },
            itemStyle: {
              color: '#f7931a',
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
                color: '#f7931a'
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
                value: 48.5,
                name: 'BTC Dominance',
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
      
      const fearGreedOption = {
        tooltip: {
          trigger: 'axis',
          padding: [7, 10],
          backgroundColor: '#fff',
          borderColor: '#e9ecef',
          textStyle: { color: '#5e6e82' },
          borderWidth: 1,
          formatter: params => {
            return `
            <div>
              <h6 class="fs-9 text-body-tertiary mb-0">
                <span class="fas fa-circle me-1" style='color:${params[0].color}'></span>
                ${params[0].name} : ${params[0].value}
              </h6>
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
                color: '#28a745'
              }
            },
            itemStyle: {
              color: '#28a745',
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
                color: '#28a745'
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
                value: 75,
                name: 'Fear & Greed',
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
      
      const altcoinSeasonOption = {
        tooltip: {
          trigger: 'axis',
          padding: [7, 10],
          backgroundColor: '#fff',
          borderColor: '#e9ecef',
          textStyle: { color: '#5e6e82' },
          borderWidth: 1,
          formatter: params => {
            return `
            <div>
              <h6 class="fs-9 text-body-tertiary mb-0">
                <span class="fas fa-circle me-1" style='color:${params[0].color}'></span>
                ${params[0].name} : ${params[0].value}
              </h6>
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
                color: '#007bff'
              }
            },
            itemStyle: {
              color: '#007bff',
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
                color: '#007bff'
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
                value: 65,
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
    // Inicializar os gráficos após o componente ser montado
    setTimeout(() => {
      initCharts();
    }, 100);

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
      <div style={{ paddingTop: '15px' }}>
        {/* Três gráficos lado a lado */}
        <div className="row">
          {/* BTC Dominance - Gauge Chart */}
          <div className="col-4">
            <div className="text-center mb-3">
              <h6 className="mb-0 fs-7">{indicadores[0].nome}</h6>
            </div>
            <div 
              ref={btcDominanceRef} 
              style={{ 
                width: '100%', 
                height: '180px',
                marginTop: '10px'
              }} 
            />
          </div>

          {/* Fear & Greed Index - Gauge Chart */}
          <div className="col-4">
            <div className="text-center mb-3">
              <h6 className="mb-0 fs-7">{indicadores[1].nome}</h6>
            </div>
            <div 
              ref={fearGreedRef} 
              style={{ 
                width: '100%', 
                height: '180px',
                marginTop: '10px'
              }} 
            />
          </div>

          {/* Altcoin Season Index - Gauge Chart */}
          <div className="col-4">
            <div className="text-center mb-3">
              <h6 className="mb-0 fs-7">{indicadores[2].nome}</h6>
            </div>
            <div 
              ref={altcoinSeasonRef} 
              style={{ 
                width: '100%', 
                height: '180px',
                marginTop: '10px'
              }} 
            />
          </div>
        </div>
      </div>
    </CardBase>
  );
};

export default MarketThermometer; 