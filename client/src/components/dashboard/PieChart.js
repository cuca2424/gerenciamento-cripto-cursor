import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useCurrency } from "../../contexts/CurrencyContext";

/**
 * Componente de Gráfico de Pizza
 * @param {Object} props
 * @param {number} props.height - Altura do container do gráfico
 * @param {Object} props.data - Dados para o gráfico em ambas as moedas
 * @param {Object} props.data.brl - Dados em BRL
 * @param {Object} props.data.usd - Dados em USD
 * @param {string} [props.title] - Título do gráfico (opcional)
 */
const PieChart = ({ height, data, title = "Distribuição de Criptomoedas" }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { currency } = useCurrency();

  useEffect(() => {
    if (chartRef.current) {
      console.log('PieChart data:', data);
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      chartInstance.current = echarts.init(chartRef.current);

      // Usar os dados da moeda selecionada
      const currencyData = data[currency.toLowerCase()];

      const option = {
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: '#fff',
          borderColor: '#e9ecef',
          textStyle: { color: '#5e6e82' },
          borderWidth: 1,
          formatter: (params) => {
            const total = currencyData.data.reduce((sum, value) => sum + value, 0);
            const percentual = ((params.value / total) * 100).toFixed(2);
            
            // Formatar o valor na moeda correta
            const valor = params.value;
            const valorFormatado = new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'pt-BR', {
              style: 'currency',
              currency: currency
            }).format(valor);
            
            // Mostrar nome, valor total na moeda selecionada e porcentagem
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
            name: currencyData.labels.length > 0 ? 'Distribuição' : '',
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
            data: currencyData.labels.map((label, index) => ({
              value: currencyData.data[index],
              name: label,
              itemStyle: { color: currencyData.backgroundColor[index] }
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
  }, [data, currency]);

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