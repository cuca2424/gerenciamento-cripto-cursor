import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const PieChart = ({ height }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'middle',
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
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 5,
              borderWidth: 0,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 5
            },
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {d}%',
              fontSize: 12,
              color: '#666'
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
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

      chartInstance.current.setOption(option);

      // Adiciona listener para redimensionamento
      const handleResize = () => {
        chartInstance.current?.resize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.current?.dispose();
      };
    }
  }, []);

  return (
    <div className="card" style={{ height }}>
      <div className="card-body p-3">
        <h5 className="card-title mb-3 fw-bold">Distribuição de Criptomoedas</h5>
        <div className="border-bottom mb-3"></div>
        <div 
          ref={chartRef} 
          style={{ 
            width: '100%', 
            height: 'calc(100% - 30px)',
            minHeight: '300px' // Altura mínima para garantir que o gráfico seja visível
          }} 
        />
      </div>
    </div>
  );
};

export default PieChart; 