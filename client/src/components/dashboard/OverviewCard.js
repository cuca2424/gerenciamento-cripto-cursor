import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import PieChart from './PieChart';

const { getColor } = window.phoenix.utils;

const OverviewCard = ({ height }) => {
  const lineChartRef = useRef(null);
  const lineChartInstance = useRef(null);
  const [selectedWallet, setSelectedWallet] = useState('Todas as Carteiras');
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pieChartData, setPieChartData] = useState({
    labels: [],
    data: [],
    backgroundColor: []
  });

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
        labels: data.labels || [],
        data: data.data || [],
        backgroundColor: data.backgroundColor || []
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
        labels: data.labels || [],
        data: data.data || [],
        backgroundColor: data.backgroundColor || []
      });
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
      // Em caso de erro, definir valores vazios
      setPieChartData({
        labels: [],
        data: [],
        backgroundColor: []
      });
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
    } else {
      // Encontrar o ID da carteira selecionada
      const selectedWalletObj = wallets.find(wallet => wallet.nome === selectedWallet);
      if (selectedWalletObj) {
        fetchWalletPieChartData(selectedWalletObj._id);
      }
    }
  }, [selectedWallet, wallets]);

  const initCharts = () => {
    if (lineChartRef.current) {
      // Dispose existing instances if they exist
      if (lineChartInstance.current) {
        lineChartInstance.current.dispose();
      }

      // Initialize new instances
      lineChartInstance.current = echarts.init(lineChartRef.current);
      
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
            show: true,
            lineStyle: {
              color: getColor("tertiary-bg")
            }
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
              borderColor: window.phoenix.utils.getColor('primary'),
              borderWidth: 2
            },
            lineStyle: {
              color: window.phoenix.utils.getColor('primary')
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
              borderColor: getColor('secondary'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('secondary-bg')
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

      lineChartInstance.current.setOption(lineChartOption);

      // Force resize after initialization
      setTimeout(() => {
        lineChartInstance.current?.resize();
      }, 0);
    }
  };

  useEffect(() => {
    initCharts();

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
            className="dropdown-menu py-1" 
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

export default OverviewCard; 