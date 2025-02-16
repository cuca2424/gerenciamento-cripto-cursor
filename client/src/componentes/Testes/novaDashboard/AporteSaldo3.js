import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

function AporteSaldo3({ dados }) {
    const { getColor } = window.phoenix.utils;
    const chartRef = useRef(null);
    const instanceRef = useRef(null);
    const [dadosGrafico, setDadosGrafico] = useState({});

    console.log("999999999999999999999999999999999999999999999")
    console.log("dados gráfico normal => ", dadosGrafico)

    const meses = [
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
        'Janeiro',
        'Fevereiro'
    ]

    useEffect(() => {
        if (dados) {
            setDadosGrafico({
                meses: meses,
                aportes: dados.aportes,
                saldos: dados.saldos,
            });
        } else {
            setDadosGrafico([
                {
                    meses: meses,
                    aportes: [
                        0, 0, 0, 0, 0, 0
                    ],
                    saldos: [
                        0, 0, 0, 0, 0, 0
                    ]
                }
            ]);
        }
    }, [dados]);

    useEffect(() => {
        if (!chartRef.current) return;

        if (!instanceRef.current) {
            instanceRef.current = echarts.init(chartRef.current);
        }

        const months = [
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro'
          ];
        
          const data1 = [
            100, 200, 300, 400, 500, 600
          ];
        
          const data2 = [
            200, 400, 600, 800, 1000, 1200
          ];

        const tooltipFormatter = params => {
            const month = params[0].name; // O mês da série (comum para ambas)
            const saldo = params[0].value;  // Valor de data2 (saldo)
            const aporte = params[1].value; // Valor de data1 (aporte)
            
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
