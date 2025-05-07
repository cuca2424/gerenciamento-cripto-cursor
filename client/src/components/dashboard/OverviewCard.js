import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import PieChart from './PieChart';
import { useCurrency } from '../../contexts/CurrencyContext';

const { getColor } = window.phoenix.utils;

const OverviewCard = ({ height }) => {
  const { currency } = useCurrency();
  const lineChartRef = useRef(null);
  const lineChartInstance = useRef(null);
  const [selectedWallet, setSelectedWallet] = useState('Todas as Carteiras');
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pieChartData, setPieChartData] = useState({
    brl: {
      labels: [],
      data: [],
      backgroundColor: []
    },
    usd: {
      labels: [],
      data: [],
      backgroundColor: []
    }
  });
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: {
      brl: [
        { data: [] }, // Custo BRL
        { data: [] }  // Valor BRL
      ],
      usd: [
        { data: [] }, // Custo USD
        { data: [] }  // Valor USD
      ]
    }
  });

  const getLastSixMonths = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = date.toLocaleString('pt-BR', { month: 'short' });
      const year = date.getFullYear().toString().slice(-2);
      months.push(`${month}/${year}`);
    }
    return months;
  };

  const fetchWalletPieChartData = async (walletId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/graficos/pizza/carteira/${walletId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do gráfico da carteira');
      }

      const data = await response.json();
      console.log('Wallet pie chart data:', data);
      setPieChartData({
        brl: {
          labels: data.brl?.labels || [],
          data: data.brl?.data || [],
          backgroundColor: data.brl?.backgroundColor || []
        },
        usd: {
          labels: data.usd?.labels || [],
          data: data.usd?.data || [],
          backgroundColor: data.usd?.backgroundColor || []
        }
      });
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico da carteira:', error);
    }
  };

  const fetchPieChartData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_ENDPOINT_API}/graficos/pizza/geral`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do gráfico');
      }

      const data = await response.json();
      console.log('Dados recebidos do endpoint /graficos/pizza/geral:', data);
      
      setPieChartData({
        brl: {
          labels: data.brl?.labels || [],
          data: data.brl?.data || [],
          backgroundColor: data.brl?.backgroundColor || []
        },
        usd: {
          labels: data.usd?.labels || [],
          data: data.usd?.data || [],
          backgroundColor: data.usd?.backgroundColor || []
        }
      });
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
      // Em caso de erro, definir valores vazios
      setPieChartData({
        brl: { labels: [], data: [], backgroundColor: [] },
        usd: { labels: [], data: [], backgroundColor: [] }
      });
    }
  };

  const validateChartData = (data) => {
    console.log('Validando dados:', {
      hasData: !!data,
      hasLabels: !!data?.labels,
      hasDatasets: !!data?.datasets,
      hasBRL: !!data?.datasets?.brl,
      hasUSD: !!data?.datasets?.usd,
      labelsLength: data?.labels?.length
    });

    if (!data || !data.labels || !data.datasets) return false;
    if (data.labels.length !== 6) return false;
    
    const currentCurrency = currency.toLowerCase();
    const datasets = data.datasets[currentCurrency];
    
    console.log('Datasets para moeda atual:', {
      currency: currentCurrency,
      datasets: datasets,
      isArray: Array.isArray(datasets),
      length: datasets?.length,
      dataLengths: datasets?.map(d => d.data?.length)
    });
    
    if (!datasets || !Array.isArray(datasets) || datasets.length !== 2) {
      console.log('Datasets inválidos para a moeda:', currentCurrency);
      return false;
    }
    if (!datasets[0].data || !datasets[1].data) {
      console.log('Dados ausentes nos datasets');
      return false;
    }
    if (datasets[0].data.length !== 6 || datasets[1].data.length !== 6) {
      console.log('Comprimento dos dados incorreto');
      return false;
    }
    return true;
  };

  const transformChartData = (data) => {
    console.log('Transformando dados:', {
      originalData: data,
      labels: data.labels,
      brlDatasets: data.datasets?.brl,
      usdDatasets: data.datasets?.usd
    });

    // Garantir que os dados estão no formato correto
    const transformed = {
      labels: data.labels.map(label => {
        const [month, year] = label.split('/');
        return `${month}/${year}`;
      }),
      datasets: {
        brl: data.datasets.brl.map(dataset => ({
          ...dataset,
          data: dataset.data.map(value => Number(value) || 0)
        })),
        usd: data.datasets.usd.map(dataset => ({
          ...dataset,
          data: dataset.data.map(value => Number(value) || 0)
        }))
      }
    };

    console.log('Dados transformados:', transformed);
    return transformed;
  };

  const calculateYAxisScale = (data) => {
    const currentCurrency = currency.toLowerCase();
    const datasets = data.datasets[currentCurrency] || [];
    
    // Extrair todos os valores dos datasets atuais
    const allValues = datasets.reduce((acc, dataset) => {
      if (dataset && dataset.data) {
        return [...acc, ...dataset.data];
      }
      return acc;
    }, []);
    
    const maxValue = Math.max(...allValues, 0);
    const interval = Math.ceil(maxValue / 5 / 1000) * 1000;
    
    console.log('Calculando escala do eixo Y:', {
      currency: currentCurrency,
      allValues,
      maxValue,
      interval
    });
    
    return {
      max: Math.ceil(maxValue / interval) * interval || 10000,
      interval: interval || 2000
    };
  };

  const fetchPerformanceData = async (walletId) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = walletId 
        ? `${process.env.REACT_APP_ENDPOINT_API}/graficos/aporte-saldo/carteira/${walletId}`
        : `${process.env.REACT_APP_ENDPOINT_API}/graficos/aporte-saldo/geral`;
      
      console.log('Buscando dados de:', endpoint);

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados de performance');
      }

      const data = await response.json();
      console.log('Dados brutos recebidos:', data);
      
      if (!validateChartData(data)) {
        console.log('Dados inválidos, usando valores padrão');
        const defaultData = {
          labels: getLastSixMonths(),
          datasets: {
            brl: [
              { data: Array(6).fill(0) },
              { data: Array(6).fill(0) }
            ],
            usd: [
              { data: Array(6).fill(0) },
              { data: Array(6).fill(0) }
            ]
          }
        };
        console.log('Dados padrão:', defaultData);
        setLineChartData(defaultData);
      } else {
        const transformedData = transformChartData(data);
        console.log('Dados válidos transformados:', transformedData);
        setLineChartData(transformedData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados de performance:', error);
      const errorData = {
        labels: getLastSixMonths(),
        datasets: {
          brl: [
            { data: Array(6).fill(0) },
            { data: Array(6).fill(0) }
          ],
          usd: [
            { data: Array(6).fill(0) },
            { data: Array(6).fill(0) }
          ]
        }
      };
      console.log('Dados de erro:', errorData);
      setLineChartData(errorData);
    }
  };

  useEffect(() => {
    const fetchWallets = async () => {
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

        const data = await response.json();
        setWallets(data);
      } catch (error) {
        console.error('Erro ao buscar carteiras:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
    fetchPieChartData();
  }, []);

  // Carregar dados do gráfico quando a carteira selecionada mudar
  useEffect(() => {
    if (selectedWallet === 'Todas as Carteiras') {
      fetchPieChartData();
      fetchPerformanceData();
    } else {
      // Encontrar o ID da carteira selecionada
      const selectedWalletObj = wallets.find(wallet => wallet.nome === selectedWallet);
      if (selectedWalletObj) {
        fetchWalletPieChartData(selectedWalletObj._id);
        fetchPerformanceData(selectedWalletObj._id);
      }
    }
  }, [selectedWallet, wallets]);

  // Atualizar o gráfico quando a moeda mudar
  useEffect(() => {
    initCharts();
  }, [currency, lineChartData]);

  // Remover o useEffect anterior que só dependia do lineChartData
  useEffect(() => {
    const handleResize = () => {
      lineChartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (lineChartInstance.current) {
        lineChartInstance.current.dispose();
      }
    };
  }, []);

  const initCharts = () => {
    if (lineChartRef.current) {
      if (lineChartInstance.current) {
        lineChartInstance.current.dispose();
      }

      lineChartInstance.current = echarts.init(lineChartRef.current);
      
      const currentCurrency = currency.toLowerCase();
      const datasets = lineChartData.datasets[currentCurrency] || [];
      
      console.log('Inicializando gráfico:', {
        currency: currentCurrency,
        availableCurrencies: Object.keys(lineChartData.datasets || {}),
        datasetsForCurrency: datasets,
        labels: lineChartData.labels
      });
      
      const yAxisScale = calculateYAxisScale(lineChartData);
      
      const lineChartOption = {
        tooltip: {
          trigger: 'axis',
          padding: [7, 10],
          backgroundColor: '#fff',
          borderColor: '#e9ecef',
          textStyle: { color: '#5e6e82' },
          borderWidth: 1,
          formatter: (params) => {
            if (!params || params.length === 0) return '';
            
            const month = params[0].name;
            const valor = params[1]?.value || 0; // Invertido para mostrar Valor primeiro
            const custo = params[0]?.value || 0;
            
            return `
            <div>
              <h6 class="fs-9 text-body-tertiary mb-0">
                <span class="fas fa-circle me-1" style='color:${params[1]?.borderColor}'></span>
                Valor: ${new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'pt-BR', { 
                  style: 'currency', 
                  currency: currency 
                }).format(valor)}
              </h6>
              <h6 class="fs-9 text-body-tertiary mb-0">
                <span class="fas fa-circle me-1" style='color:${params[0]?.borderColor}'></span>
                Custo: ${new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'pt-BR', { 
                  style: 'currency', 
                  currency: currency 
                }).format(custo)}
              </h6>
            </div>
            `;
          }
        },
        grid: { 
          right: '5%', 
          left: '5%', 
          bottom: '5%', 
          top: '5%',
          containLabel: true,
          width: 'auto',
          height: 'auto'
        },
        xAxis: {
          type: 'category',
          data: lineChartData.labels || [],
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#e9ecef'
            }
          },
          axisTick: { show: false },
          axisLabel: {
            color: '#5e6e82',
            margin: 15,
            interval: 0
          },
          splitLine: { show: false }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true,
            lineStyle: {
              color: getColor("tertiary-bg")
            }
          },
          boundaryGap: false,
          min: 0,
          max: yAxisScale.max,
          interval: yAxisScale.interval,
          axisLabel: {
            show: true,
            color: '#5e6e82',
            margin: 15,
            formatter: (value) => {
              if (value >= 1000000) {
                return `${currency} ${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `${currency} ${(value / 1000).toFixed(1)}K`;
              }
              return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'pt-BR', { 
                style: 'currency', 
                currency: currency,
                maximumFractionDigits: 0
              }).format(value);
            }
          },
          axisTick: { show: false },
          axisLine: { show: false }
        },
        series: [
          {
            name: 'Custo',
            type: 'line',
            data: datasets[0]?.data || Array(6).fill(0),
            itemStyle: {
              color: '#fff',
              borderColor: getColor('secondary'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('secondary-bg')
            },
            showSymbol: true,
            symbol: 'circle',
            symbolSize: 6,
            smooth: false,
            hoverAnimation: true
          },
          {
            name: 'Valor',
            type: 'line',
            data: datasets[1]?.data || Array(6).fill(0),
            itemStyle: {
              color: '#fff',
              borderColor: window.phoenix.utils.getColor('primary'),
              borderWidth: 2
            },
            lineStyle: {
              color: window.phoenix.utils.getColor('primary')
            },
            showSymbol: true,
            symbol: 'circle',
            symbolSize: 6,
            smooth: false,
            hoverAnimation: true
          }
        ]
      };

      console.log('Opções finais do gráfico:', {
        labels: lineChartOption.xAxis.data,
        custoData: lineChartOption.series[0].data,
        valorData: lineChartOption.series[1].data
      });

      lineChartInstance.current.setOption(lineChartOption);

      setTimeout(() => {
        if (lineChartInstance.current) {
          lineChartInstance.current.resize({
            width: 'auto',
            height: 'auto'
          });
        }
      }, 0);
    }
  };

  // Atualizar as funções de dropdown
  const handleSelectAllWallets = () => {
    setSelectedWallet('Todas as Carteiras');
    // O useEffect acima vai carregar os dados do gráfico geral
  };

  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet.nome);
    // O useEffect acima vai carregar os dados do gráfico específico da carteira
  };

  return (
    <div style={{ height, padding: '20px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3" style={{ height: '13px' }}>
        <h5 className="mb-0 fw-bold">Visão Geral</h5>
        <div className="dropdown">
          <button 
            className="btn btn-phoenix-secondary dropdown-toggle py-1 px-3 d-flex align-items-center" 
            type="button" 
            id="walletDropdown" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
            style={{ 
              height: '32px', 
              fontSize: '14px',
              width: '200px',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {selectedWallet}
            </span>
          </button>
          <ul 
            className="dropdown-menu py-1 custom-scrollbar" 
            aria-labelledby="walletDropdown" 
            style={{ 
              width: '200px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            <li className="py-1">
              <button 
                className="dropdown-item py-2" 
                onClick={handleSelectAllWallets}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                Todas as Carteiras
              </button>
            </li>
            {wallets.map((wallet) => (
              <li key={wallet._id} className="py-1">
                <button 
                  className="dropdown-item py-2" 
                  onClick={() => handleSelectWallet(wallet)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {wallet.nome}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-bottom mb-0 pb-0"></div>
      <div className="row g-0 " style={{ overflow: 'hidden', height: 'calc(100% - 13px)' }}>
        <div className="col-md-6 pe-2 border-end">
          <div 
            ref={lineChartRef} 
            style={{ 
              width: '100%', 
              height: '100%',
              minHeight: '200px',
              paddingTop: '10px'
            }} 
          />
        </div>
        <div className="col-md-6 ps-2">
          <PieChart 
            height="100%"
            data={pieChartData}
            title="Distribuição de Ativos"
          />
        </div>
      </div>
    </div>
  );
};

const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: ${getColor('tertiary-bg')};
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: ${getColor('secondary')};
    border-radius: 2px;
  }
  
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: ${getColor('secondary')} ${getColor('tertiary-bg')};
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default OverviewCard; 