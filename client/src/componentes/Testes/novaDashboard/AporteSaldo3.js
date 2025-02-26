import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

function AporteSaldo3({ dados }) {
    const { getColor } = window.phoenix.utils;
    const chartRef = useRef(null);
    const instanceRef = useRef(null);
    const [dadosGrafico, setDadosGrafico] = useState({});

    const mapMeses = {
      "01": "Janeiro",
      "02": "Fevereiro",
      "03": "Março",
      "04": "Abril",
      "05": "Maio",
      "06": "Junho",
      "07": "Julho",
      "08": "Agosto",
      "09": "Setembro",
      "10": "Outubro",
      "11": "Novembro",
      "12": "Dezembro",
    };
    
// Função para pegar os últimos 6 meses
const getUltimos6Meses = () => {
  const meses = [];
  const hoje = new Date();
  
  for (let i = 0; i < 6; i++) {
      const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesFormatado = mesAnterior.toISOString().split("T")[0]; // Formato: "YYYY-MM-DD"
      meses.push(mesFormatado);
  }

  return meses.reverse(); // Reverte para ter do mês mais antigo para o mais recente
};


    useEffect(() => {
        if (dados && Object.keys(dados).length > 0) {
            const meses = Object.keys(dados);
            const aportes = [];
            const saldos = [];

            meses.forEach((mes) => {
                if (dados[mes]) {
                    aportes.push(dados[mes].aportes);
                    saldos.push(dados[mes].saldos);
                } else {
                    aportes.push(0); // Se não tiver dados para o mês, coloca 0
                    saldos.push(0);
                }
            });

            const mesesConvertidos = meses.map(mes => {
              const [ano, mesNumero] = mes.split("-");
              return mapMeses[mesNumero];
            });

            setDadosGrafico({
                meses: mesesConvertidos,
                aportes: aportes,
                saldos: saldos,
            });
        } else {
            // Caso não tenha dados, inicializar com 0 para todos os meses
            const mesesUltimos6 = getUltimos6Meses();
            console.log("ultimos 6 meses => ", mesesUltimos6)

            const mesesConvertidos = mesesUltimos6.map(mes => {
              const [ano, mesNumero, dia] = mes.split("-");
              return mapMeses[mesNumero]; 
            });

            setDadosGrafico({
                meses: mesesConvertidos,
                aportes: Array(6).fill(0),
                saldos: Array(6).fill(0),
            });
        }
    }, [dados]);

    useEffect(() => {
        if (!chartRef.current) return;

        if (!instanceRef.current) {
            instanceRef.current = echarts.init(chartRef.current);
        }

        instanceRef.current.resize();

        const tooltipFormatter = (params) => {
            const month = params[0].name;
            const saldo = params[0].value;
            const aporte = params[1].value;

            return `
                <div>
                    <h6 class="fs-9 text-body-tertiary mb-0">
                        <span class="fas fa-circle me-1" style='color:${params[0].borderColor}'></span>
                        Saldo: $${(saldo ?? 0).toFixed(2)}
                    </h6>
                    <h6 class="fs-9 text-body-tertiary mb-0">
                        <span class="fas fa-circle me-1" style='color:${params[1].borderColor}'></span>
                        Aporte: $${(aporte ?? 0).toFixed(2)}
                    </h6>
                </div>
            `;
        };

        instanceRef.current.setOption({
            tooltip: {
                trigger: 'axis',
                padding: [7, 10],
                backgroundColor: getColor('body-highlight-bg'),
                borderColor: getColor('border-color'),
                textStyle: { color: getColor('light-text-emphasis') },
                borderWidth: 1,
                transitionDuration: 0,
                formatter: tooltipFormatter,
                axisPointer: {
                  type: 'none'
                }
            },
            xAxis: {
                type: 'category',
                data: dadosGrafico.meses,
                boundaryGap: false,
                axisLine: {
                  lineStyle: {
                    color: getColor('tertiary-bg')
                  }
                },
                axisTick: { show: false },
                axisLabel: {
                  color: getColor('quaternary-color'),
                  formatter: value => value.substring(0, 3),
                  margin: 15
                },
                splitLine: {
                  show: false
                }
            },
            yAxis: {
                type: 'value',
                splitLine: {
                  lineStyle: {
                    type: 'dashed',
                    color: getColor('secondary-bg')
                  }
                },
                boundaryGap: false,
                axisLabel: {
                  show: true,
                  color: getColor('quaternary-color'),
                  margin: 15
                },
                axisTick: { show: false },
                axisLine: { show: false },
                min: 0
            },
            series: [
                {
                  type: 'line',
                  data: dadosGrafico.saldos,
                  itemStyle: {
                    color: getColor('body-highlight-bg'),
                    borderColor: getColor('primary'),
                    borderWidth: 2
                  },
                  lineStyle: {
                    color: getColor('primary')
                  },
                  showSymbol: false,
                  symbol: 'circle',
                  symbolSize: 10,
                  smooth: false,
                  hoverAnimation: true
                },
                {
                  type: 'line',
                  data: dadosGrafico.aportes,
                  itemStyle: {
                    color: getColor('secondary-bg'),
                    borderColor: getColor('secondary'),
                    borderWidth: 2
                  },
                  lineStyle: {
                    color: getColor('secondary')
                  },
                  showSymbol: false,
                  symbol: 'circle',
                  symbolSize: 10,
                  smooth: false,
                  hoverAnimation: true
                }
            ],
            grid: { right: '3%', left: '10%', bottom: '10%', top: '5%' }
        });
    }, [dadosGrafico]);

    return (
        <div
            ref={chartRef}
            style={{
                height: "100%",
                width: "100%",
                userSelect: "none",
                WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
                position: "relative",
                objectFit: "contain"
            }}
        ></div>
    );
}

export default AporteSaldo3;

