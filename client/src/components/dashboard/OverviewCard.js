import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const OverviewCard = ({ height }) => {
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const lineChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  const initCharts = () => {
    if (lineChartRef.current && pieChartRef.current) {
      // Dispose existing instances if they exist
      if (lineChartInstance.current) {
        lineChartInstance.current.dispose();
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.dispose();
      }

      // Initialize new instances
      lineChartInstance.current = echarts.init(lineChartRef.current);
      pieChartInstance.current = echarts.init(pieChartRef.current);
      
      // Configuração do gráfico de linhas
      const lineChartOption = {
        tooltip: {
          trigger: 'axis',
          padding: [7, 10],
          backgroundColor: '#fff',
          borderColor: '#e9ecef',
          textStyle: { color: '#5e6e82' },
          borderWidth: 1,
          formatter: (params) => {
            const month = params[0].name;
            const saldo = params[0].value;
            const aporte = params[1].value;
            
            return `
            <div>
              <h6 class="fs-9 text-body-tertiary mb-0">
                <span class="fas fa-circle me-1" style='color:${params[0].borderColor}'></span>
                Saldo: ${saldo}
              </h6>
              <h6 class="fs-9 text-body-tertiary mb-0">
                <span class="fas fa-circle me-1" style='color:${params[1].borderColor}'></span>
                Aporte: ${aporte}
              </h6>
            </div>
            `;
          }
        },
        xAxis: {
          type: 'category',
          data: ['Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#e9ecef'
            }
          },
          axisTick: { show: false },
          axisLabel: {
            color: '#5e6e82',
            formatter: value => value.substring(0, 3),
            margin: 15
          },
          splitLine: { show: false }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false
          },
          boundaryGap: false,
          axisLabel: {
            show: true,
            color: '#5e6e82',
            margin: 15
          },
          axisTick: { show: false },
          axisLine: { show: false }
        },
        series: [
          {
            name: 'Saldo',
            type: 'line',
            data: [900, 960, 1250, 1700, 1600, 1800],
            itemStyle: {
              color: '#fff',
              borderColor: '#0d6efd',
              borderWidth: 2
            },
            lineStyle: {
              color: '#0d6efd'
            },
            showSymbol: false,
            symbol: 'circle',
            symbolSize: 10,
            smooth: false,
            hoverAnimation: true
          },
          {
            name: 'Aporte',
            type: 'line',
            data: [750, 800, 950, 1050, 1350, 1250],
            itemStyle: {
              color: '#fff',
              borderColor: '#6c757d',
              borderWidth: 2
            },
            lineStyle: {
              color: '#6c757d'
            },
            showSymbol: false,
            symbol: 'circle',
            symbolSize: 10,
            smooth: false,
            hoverAnimation: true
          }
        ],
        grid: { 
          right: '5%', 
          left: '5%', 
          bottom: '5%', 
          top: '5%',
          containLabel: true
        }
      };

      // Configuração do gráfico de pizza (mantendo a configuração existente)
      const pieChartOption = {
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: '#fff',
          borderColor: '#e9ecef',
          textStyle: { color: '#5e6e82' },
          borderWidth: 1,
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'right',
          textStyle: {
            color: '#666',
            fontSize: 12
          }
        },
        series: [
          {
            name: 'Distribuição',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: false,
            itemStyle: {
            },
            label: {
              show: false,
              position: 'center'
            },
            labelLine: {
              show: false
            },
            data: [
              { 
                value: 1048, 
                name: 'Bitcoin',
                itemStyle: { color: '#f7931a' }
              },
              { 
                value: 735, 
                name: 'Ethereum',
                itemStyle: { color: '#627eea' }
              },
              { 
                value: 580, 
                name: 'Cardano',
                itemStyle: { color: '#0033ad' }
              },
              { 
                value: 484, 
                name: 'Solana',
                itemStyle: { color: '#00ffbd' }
              },
              { 
                value: 300, 
                name: 'Polkadot',
                itemStyle: { color: '#e6007a' }
              }
            ]
          }
        ]
      };

      lineChartInstance.current.setOption(lineChartOption);
      pieChartInstance.current.setOption(pieChartOption);

      // Force resize after initialization
      setTimeout(() => {
        lineChartInstance.current?.resize();
        pieChartInstance.current?.resize();
      }, 0);
    }
  };

  useEffect(() => {
    initCharts();

    const handleResize = () => {
      lineChartInstance.current?.resize();
      pieChartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (lineChartInstance.current) {
        lineChartInstance.current.dispose();
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.dispose();
      }
    };
  }, []);

  return (
    <div style={{ height, padding: '20px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-bold">Visão Geral do Mercado</h5>
      </div>
      <div className="border-bottom mb-3"></div>
      <div className="row g-0 h-100">
        <div className="col-md-6 pe-2">
          <div 
            ref={lineChartRef} 
            style={{ 
              width: '100%', 
              height: 'calc(100% - 20px)',
              minHeight: '200px'
            }} 
          />
        </div>
        <div className="col-md-6 ps-2">
          <div 
            ref={pieChartRef} 
            style={{ 
              width: '100%', 
              height: 'calc(100% - 20px)',
              minHeight: '200px'
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default OverviewCard; 