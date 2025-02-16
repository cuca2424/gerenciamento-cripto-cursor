import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

function GraficoPizza({ dados }) {
    const { getColor } = window.phoenix.utils;
    const chartRef = useRef(null);
    const instanceRef = useRef(null);
    const [dadosGrafico, setDadosGrafico] = useState([]);

    const cores = [
        getColor("primary"),
        getColor("warning"),
        getColor("danger"),
        getColor("info"),
        getColor("secondary"),
        getColor("success"),
        getColor("success")
    ];

    const escolherCor = (index) => cores[index % cores.length];

    useEffect(() => {
        if (dados && dados.length > 0) {
            setDadosGrafico(dados.map((dado, index) => ({
                value: dado.saldoTotal,
                name: dado.nome,
                itemStyle: { color: escolherCor(index) },
            })));
        } else {
            setDadosGrafico([
                //{ value: 1, name: 'Carregando', itemStyle: { color: getColor('danger') } }
            ]);
        }
    }, [dados]);

    useEffect(() => {
        if (!chartRef.current) return;

        if (!instanceRef.current) {
            instanceRef.current = echarts.init(chartRef.current);
        }

        instanceRef.current.setOption({
            legend: {
                orient: 'vertical',
                left: 'right',
                textStyle: {
                  color: getColor('success')
                }
            },
            tooltip: {
                trigger: 'item',
                padding: [7, 10],
                backgroundColor: getColor('body-highlight-bg'),
                borderColor: getColor('border-color'),
                textStyle: { color: getColor('light-text-emphasis') },
                borderWidth: 1,
                transitionDuration: 0,
                axisPointer: {
                  type: 'none'
                }
              },
            series: [
                {
                    type: "pie",
                    radius: ['40%', '70%'],
                    center: ['50%', '55%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: false,
                        position: 'center'
                    },
                    labelLine: {
                        show: false
                    },
                    data: dadosGrafico
                }
            ]
        });
    }, [dadosGrafico]);

    return (
        <div
            ref={chartRef}
            style={{
                minHeight: "320px",
                width: "100%",
                userSelect: "none",
                WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
                position: "relative",
            }}
        ></div>
    );
}

export default GraficoPizza;
