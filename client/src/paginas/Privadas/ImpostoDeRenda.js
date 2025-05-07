import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MetricCard from '../../components/dashboard/MetricCard';

function ImpostoDeRenda() {
  const [vendas, setVendas] = useState([]);
  const [vendasPorMes, setVendasPorMes] = useState({});
  const [totais, setTotais] = useState({ brl: { valorVenda: 0, lucroPrejuizo: 0 }, usd: { valorVenda: 0, lucroPrejuizo: 0 } });
  const [prejuizoAcumuladoFinal, setPrejuizoAcumuladoFinal] = useState({ brl: 0, usd: 0 });
  const [impostoTotal, setImpostoTotal] = useState({ brl: 0, usd: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [periodo, setPeriodo] = useState('ano_atual');
  const { currency, cotacaoDolar } = useCurrency();

  useEffect(() => {
    fetchVendas();
  }, [dataInicio, dataFim, periodo]);

  const fetchVendas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }
      
      let url = `${process.env.REACT_APP_ENDPOINT_API}/imposto/vendas`;
      const params = new URLSearchParams();
      
      if (periodo !== 'personalizado') {
        params.append('periodo', periodo);
      } else {
        if (dataInicio) {
          params.append('dataInicio', dataInicio.toISOString().split('T')[0]);
        }
        if (dataFim) {
          params.append('dataFim', dataFim.toISOString().split('T')[0]);
        }
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Erro ao buscar vendas');
      }
      
      const data = await response.json();
      setVendas(data.vendas || []);
      setVendasPorMes(data.vendasPorMes || {});
      setTotais(data.totais || { brl: { valorVenda: 0, lucroPrejuizo: 0 }, usd: { valorVenda: 0, lucroPrejuizo: 0 } });
      setPrejuizoAcumuladoFinal(data.prejuizoAcumuladoFinal || { brl: 0, usd: 0 });
      setImpostoTotal(data.impostoTotal || { brl: 0, usd: 0 });
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      setError(error.message || 'Erro ao carregar vendas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodoChange = (e) => {
    const value = e.target.value;
    setPeriodo(value);
    
    const hoje = new Date();
    let inicio = new Date();
    let fim = new Date();
    
    switch (value) {
      case 'este_mes':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        break;
      case 'ultimos_3_meses':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
        break;
      case 'ultimos_6_meses':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
        break;
      case 'ano_atual':
        inicio = new Date(hoje.getFullYear(), 0, 1);
        break;
      // case 'personalizado':
      //   // Não altera as datas, mantém os date pickers
      //   return;
      default:
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }
    
    setDataInicio(inicio);
    setDataFim(fim);
  };

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      let url = `${process.env.REACT_APP_ENDPOINT_API}/imposto/relatorio`;
      const params = new URLSearchParams();
      
      if (periodo !== 'personalizado') {
        params.append('periodo', periodo);
      } else {
        if (dataInicio) {
          params.append('dataInicio', dataInicio.toISOString().split('T')[0]);
        }
        if (dataFim) {
          params.append('dataFim', dataFim.toISOString().split('T')[0]);
        }
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar relatório');
      }

      // Criar um blob do PDF
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      
      // Criar um link temporário para download
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `relatorio_imposto_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      setError(error.message || 'Erro ao baixar relatório. Tente novamente mais tarde.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL',
      currencyDisplay: 'symbol'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularImposto = (lucro) => {
    // Alíquota de 15% sobre o lucro
    return lucro * 0.15;
  };

  if (loading) {
    return (
      <div className="container-fluid px-0 pt-2">
        <div className="row g-3 mb-3 mx-0" style={{height: "118px"}}>
          {[...Array(4)].map((_, index) => (
            <div key={index} className="col-6 col-lg-3">
              <div className="card h-100 position-relative">
                <div className="card-body p-0">
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row g-3 mx-0">
          <div className="col-12">
            <div className="card">
              <div className="card-body p-0 position-relative" style={{ minHeight: "200px" }}>
                <div className="position-absolute top-50 start-50 translate-middle">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
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

  const totalVendas = currency === 'BRL' ? totais.brl.valorVenda : totais.usd.valorVenda;
  const lucroPrejuizo = currency === 'BRL' ? totais.brl.lucroPrejuizo : totais.usd.lucroPrejuizo;
  const prejuizoAcumulado = currency === 'BRL' ? prejuizoAcumuladoFinal.brl : prejuizoAcumuladoFinal.usd;
  const impostoDevido = currency === 'BRL' ? impostoTotal.brl : impostoTotal.usd;
  
  // Ordenar meses do mais recente para o mais antigo para exibição
  const vendasPorMesOrdenadas = Object.entries(vendasPorMes)
    .sort(([mesAnoA], [mesAnoB]) => {
      const [anoA, mesA] = mesAnoA.split('-');
      const [anoB, mesB] = mesAnoB.split('-');
      const dataA = new Date(anoA, mesA - 1);
      const dataB = new Date(anoB, mesB - 1);
      return dataB - dataA; // Ordena do mais recente para o mais antigo
    });

  return (
    <div className="container-fluid px-2 py-2">
      {/* Cards de Métricas */}
      <div className="row g-3 mb-3">
        {/* Card 1 - Total de Vendas */}
        <div className="col-6 col-lg-3">
          <MetricCard
            title="Total de Vendas"
            value={formatCurrency(totalVendas)}
            centered
            height="118px"
          />
        </div>

        {/* Card 2 - Lucro/Prejuízo */}
        <div className="col-6 col-lg-3">
          <MetricCard
            title={lucroPrejuizo >= 0 ? 'Lucro Realizado' : 'Prejuízo Realizado'}
            value={
              <div className={`${lucroPrejuizo >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(lucroPrejuizo)}
              </div>
            }
            centered
            height="118px"
          />
        </div>

        {/* Card 3 - Prejuízo Acumulado */}
        <div className="col-6 col-lg-3">
          <MetricCard
            title="Prejuízo Acumulado"
            value={
              <div className="text-danger">
                {formatCurrency(prejuizoAcumulado)}
              </div>
            }
            centered
            height="118px"
          />
        </div>

        {/* Card 4 - Imposto Devido */}
        <div className="col-6 col-lg-3">
          <MetricCard
            title="Imposto Devido"
            value={
              <div>
                {formatCurrency(impostoDevido)}
              </div>
            }
            centered
            height="118px"
          />
        </div>
      </div>

      {/* Tabela de Impostos por Mês */}
      {Object.keys(vendasPorMes).length > 0 && (
        <div className="row mt-2">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="card-title mb-0">Imposto de Renda por Mês</h3>
                  <div className="d-flex gap-2">
                    <select 
                      className="form-select form-select-sm" 
                      value={periodo} 
                      onChange={handlePeriodoChange}
                      style={{ width: '150px' }}
                    >
                      <option value="este_mes">Este mês</option>
                      <option value="ultimos_3_meses">Últimos 3 meses</option>
                      <option value="ultimos_6_meses">Últimos 6 meses</option>
                      <option value="ano_atual">Ano atual</option>
                      {/* <option value="personalizado">Personalizado</option> */}
                    </select>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={handleDownloadPDF}
                    >
                      <i className="fas fa-download me-1"></i>
                      PDF
                    </button>
                  </div>
                </div>

                {/* Date Pickers para período personalizado */}
                {/* {periodo === 'personalizado' && (
                  <div className="mb-3">
                    <div className="d-flex gap-2">
                      <DatePicker
                        selected={dataInicio}
                        onChange={setDataInicio}
                        dateFormat="dd/MM/yyyy"
                        className="form-control form-control-sm"
                        placeholderText="Data inicial"
                      />
                      <DatePicker
                        selected={dataFim}
                        onChange={setDataFim}
                        dateFormat="dd/MM/yyyy"
                        className="form-control form-control-sm"
                        placeholderText="Data final"
                      />
                    </div>
                  </div>
                )} */}

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Mês/Ano</th>
                        <th>Total de Vendas</th>
                        <th>Lucro/Prejuízo</th>
                        <th>Prejuízo Acumulado</th>
                        <th>Lucro Ajustado</th>
                        <th>Alíquota</th>
                        <th>Imposto Devido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendasPorMesOrdenadas.map(([mesAno, dados]) => {
                        const [ano, mes] = mesAno.split('-');
                        const mesFormatado = new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                        const isLucro = currency === 'BRL' ? dados.lucroPrejuizo >= 0 : dados.usd.lucroPrejuizo >= 0;
                        const classeCor = isLucro ? 'text-success' : 'text-danger';
                        
                        return (
                          <tr key={mesAno}>
                            <td>{mesFormatado}</td>
                            <td>{formatCurrency(currency === 'BRL' ? dados.totalVendas : dados.usd.totalVendas)}</td>
                            <td className={classeCor}>
                              {formatCurrency(currency === 'BRL' ? dados.lucroPrejuizo : dados.usd.lucroPrejuizo)}
                            </td>
                            <td className="text-danger">
                              {formatCurrency(dados.prejuizoAcumuladoMes)}
                            </td>
                            <td className={dados.lucroAjustado >= 0 ? 'text-success' : 'text-danger'}>
                              {formatCurrency(dados.lucroAjustado)}
                            </td>
                            <td>{dados.aliquota}</td>
                            <td>
                              {formatCurrency(dados.imposto)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Vendas */}
      <div className="row mt-3">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title mb-4">Histórico de Vendas</h3>
              <div className="table-responsive">
                <table className="table table-hover">
                  {vendas.length > 0 ? (
                    <>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Ativo</th>
                          <th>Quantidade</th>
                          <th>Preço Médio</th>
                          <th>Valor da Venda</th>
                          <th>Lucro/Prejuízo</th>
                          <th>Carteira</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendas.map((venda, index) => {
                          const valores = currency === 'BRL' ? venda.brl : venda.usd;
                          const isLucro = valores.lucroPrejuizo >= 0;
                          const classeCor = isLucro ? 'text-success' : 'text-danger';
                          
                          return (
                            <tr key={index}>
                              <td>{formatDate(venda.dataVenda)}</td>
                              <td>{venda.ativo}</td>
                              <td>{venda.quantidade}</td>
                              <td>{formatCurrency(valores.precoMedio)}</td>
                              <td>{formatCurrency(valores.valorVenda)}</td>
                              <td className={classeCor}>
                                {formatCurrency(valores.lucroPrejuizo)}
                              </td>
                              <td>{venda.carteiraNome}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </>
                  ) : (
                    <tbody>
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          Nenhuma venda encontrada no período selecionado
                        </td>
                      </tr>
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImpostoDeRenda;