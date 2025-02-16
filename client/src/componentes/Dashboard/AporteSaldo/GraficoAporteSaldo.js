import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

function GraficoAporteSaldo() {
  const chartRef = useRef(null);

  useEffect(() => {
    const { getColor, getData, getDates } = window.phoenix.utils;
   
    const tooltipFormatter = (params) => {
      const currentDate = dayjs(params[0].axisValue);
      const prevDate = currentDate.subtract(1, 'month');

      const result = params.map((param, index) => ({
        value: param.value,
        date: index > 0 ? prevDate : currentDate,
        color: param.color,
      }));

      let tooltipItem = ``;
      result.forEach((el, index) => {
        tooltipItem += `<h6 class="fs-9 text-body-tertiary ${
          index > 0 && 'mb-0'
        }"><span class="fas fa-circle me-2" style="color:${el.color}"></span>
        ${el.date.format('MMM DD')} : ${el.value}
      </h6>`;
      });
      return `<div class='ms-1'>${tooltipItem}</div>`;
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
          transitionDuration: 0,
          axisPointer: { type: 'none' },
          formatter: tooltipFormatter,
          extraCssText: 'z-index: 1000',
        },
        xAxis: [
          {
            type: 'category',
            data: getDates(
              new Date('5/1/2022'),
              new Date('5/7/2022'),
              1000 * 60 * 60 * 24
            ).map((date) => dayjs(date).format('DD MMM')),
            show: true,
            boundaryGap: false,
            axisLine: {
              show: true,
              lineStyle: { color: getColor('secondary-bg') },
            },
            axisTick: { show: false },
            axisLabel: {
              color: getColor('secondary-color'),
              align: 'left',
              fontFamily: 'Nunito Sans',
              fontWeight: 600,
              fontSize: 12.8,
            },
          },
        ],
        yAxis: {
          show: false,
          type: 'value',
          boundaryGap: false,
        },
        series: [
          {
            type: 'line',
            data: [150, 100, 300, 200, 250, 180, 250],
            showSymbol: false,
            lineStyle: { width: 2, color: getColor('secondary-bg') },
          },
          {
            type: 'line',
            data: [200, 150, 250, 100, 500, 400, 600],
            showSymbol: false,
            lineStyle: { width: 2, color: getColor('primary') },
          },
        ],
        grid: { left: 0, right: 0, top: 5, bottom: 20 },
      };

      chart.setOption(options);

      const handleResize = () => {
        if (chart) {
          chart.resize();
        }
      };

      const resizeObserver = new ResizeObserver(() => {
        chart.resize();
      });

      resizeObserver.observe(chartRef.current);

      return () => {
        chart.dispose();
      };
    }
  }, []);

  return <div ref={chartRef} style={{height: "100%", width: "100%"}}/>;
};

export default GraficoAporteSaldo;
