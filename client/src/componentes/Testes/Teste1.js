import React, {useEffect, useRef} from "react";
import * as echarts from "echarts";
import dayjs from "dayjs";

function AporteSaldo({aportes, saldos}) {
    const chartRef = useRef(null); 

  useEffect(() => {
    const { getColor, getData, getPastDates, getItemFromStore } = window.phoenix.utils;

    const days = aportes.length;
    const dates = getPastDates(days);

    const currentMonthData = saldos;
    const prevMonthData = aportes;

    const tooltipFormatter = (params) => {
      const currentDate = dayjs(params[0].axisValue);
      const prevDate = dayjs(params[0].axisValue).subtract(1, 'month');

      return params
        .map((param, index) => {
          const date = index > 0 ? prevDate : currentDate;
          return `
            <h6 class="fs-9 text-body-tertiary ${index > 0 && 'mb-0'}">
              <span class="fas fa-circle me-2" style="color:${param.color}"></span>
              ${date.format('DD MMM')} : ${param.value}
            </h6>
          `;
        })
        .join('');
    };

    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);

      const options = {
        tooltip: {
          trigger: 'axis',
          padding: 10,
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          formatter: tooltipFormatter,
          extraCssText: 'z-index: 1000',
        },
        xAxis: [
          {
            type: 'category',
            data: dates,
            axisLabel: {
              formatter: (value) => dayjs(value).format('DD MMM, YY'),
              color: getColor('secondary-color'),
              fontWeight: 700,
            },
          },
        ],
        yAxis: {
          axisLabel: {
            formatter: (value) => `${value / 1000}k`,
            color: getColor('body-color'),
          },
          splitLine: {
            lineStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? getColor('body-highlight-bg')
                  : getColor('secondary-bg'),
            },
          },
        },
        series: [
          {
            type: 'line',
            data: prevMonthData,
            lineStyle: { width: 3, color: getColor('info-lighter') },
          },
          {
            type: 'line',
            data: currentMonthData,
            lineStyle: { width: 3, color: getColor('primary') },
          },
        ],
      };

      chart.setOption(options);

      setTimeout(() => {
        chart.resize();
      }, 100)

      window.addEventListener('resize', () => chart.resize());

      return () => {
        chart.dispose();
      };
    }
  }, []);

  return(
    <div ref={chartRef} />
    ) 
}

export default AporteSaldo;