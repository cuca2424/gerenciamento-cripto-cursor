import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

/**
 * Componente de Gráfico de Pizza
 * @param {Object} props
 * @param {number} props.height - Altura do container do gráfico
 * @param {Object} props.data - Dados para o gráfico
 * @param {string[]} props.data.labels - Nomes dos segmentos
 * @param {number[]} props.data.data - Valores dos segmentos
 * @param {string[]} props.data.backgroundColor - Cores dos segmentos
 * @param {string} [props.title] - Título do gráfico (opcional)
 */
const PieChart = ({ height, data, title = "Distribuição de Criptomoedas" }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      console.log('PieChart data:', data);
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      chartInstance.current = echarts.init(chartRef.current);

      const option = {
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: '#fff',
          borderColor: '#e9ecef',
          textStyle: { color: '#5e6e82' },
          borderWidth: 1,
          formatter: (params) => {
            const total = data.data.reduce((sum, value) => sum + value, 0);
            const percentual = ((params.value / total) * 100).toFixed(2);
            
            // Formatar o valor em reais
            const valor = params.value;
            const valorFormatado = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(valor);
            
            // Mostrar nome, valor total em reais e porcentagem
            return `${params.name}: ${valorFormatado} (${percentual}%)`;
          }
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
            name: data.labels.length > 0 ? 'Distribuição' : '',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: false,
            itemStyle: {},
            label: {
              show: false,
              position: 'center'
            },
            labelLine: {
              show: false
            },
            data: data.labels.map((label, index) => ({
              value: data.data[index],
              name: label,
              itemStyle: { color: data.backgroundColor[index] }
            }))
          }
        ]
      };

      chartInstance.current.setOption(option);

      const handleResize = () => {
        chartInstance.current?.resize();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartInstance.current) {
          chartInstance.current.dispose();
        }
      };
    }
  }, [data]);

  return (
    <div 
      ref={chartRef} 
      style={{ 
        width: '100%', 
        height: height,
        minHeight: '200px',
        paddingTop: '10px'
      }}
    />
  );
};

export default PieChart; 