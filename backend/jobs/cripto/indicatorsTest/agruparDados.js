const { DateTime } = require('luxon');

// Função para agrupar os dados por dia, semana, mês e 4 horas com timestamp zerado no fuso horário de Nova York
function agruparDados(dados) {
    let agrupadosDiarios = {};
    let agrupadosSemana = {};
    let agrupadosMes = {};
    let agrupados4Horas = {};
  
    dados.forEach((vela) => {
      // Extrair a data do timestamp (dia) no formato ISO
      const data = new Date(vela.timestamp).toISOString().split('T')[0]; // "YYYY-MM-DD"
      const [ano, mes, dia] = data.split('-');
  
      const dataNY = DateTime.fromObject({ year: Number(ano), month: Number(mes), day: Number(dia) });
  
      const dataNY4h = DateTime.fromISO(vela.timestamp, { setZone: true }); // sem timezon
  
      const horaSegmentada = Math.floor((dataNY4h.hour - 1) / 4) * 4 + 1;
  
      const data4h = dataNY4h.set({
        hour: horaSegmentada,
        minute: 0,
        second: 0,
        millisecond: 0
      });
  
      // -------- Agrupar dados 4h --------
      const chave4h = data4h.toUTC().toISO(); // Exemplo: '2025-04-29T08:00:00.000Z'
  
      if (!agrupados4Horas[chave4h]) {
        agrupados4Horas[chave4h] = {
          max: vela.max,
          min: vela.min,
          close: vela.close,
        };
      } else {
        agrupados4Horas[chave4h].max = Math.max(agrupados4Horas[chave4h].max, vela.max);
        agrupados4Horas[chave4h].min = Math.min(agrupados4Horas[chave4h].min, vela.min);
        agrupados4Horas[chave4h].close = vela.close;
      }
  
      
  
      // -------- Agrupar dados diários --------
      if (!agrupadosDiarios[data]) {
        agrupadosDiarios[data] = {
          max: vela.max,
          min: vela.min,
          close: vela.close,
        };
      } else {
        agrupadosDiarios[data].max = Math.max(agrupadosDiarios[data].max, vela.max);
        agrupadosDiarios[data].min = Math.min(agrupadosDiarios[data].min, vela.min);
        agrupadosDiarios[data].close = vela.close;
      }
  
      // -------- Agrupar dados semanais --------
      const segundaFeira = dataNY.minus({ days: dataNY.weekday - 1 }).toISODate();
  
      if (!agrupadosSemana[segundaFeira]) {
        agrupadosSemana[segundaFeira] = {
          max: vela.max,
          min: vela.min,
          close: vela.close,
        };
      } else {
        agrupadosSemana[segundaFeira].max = Math.max(agrupadosSemana[segundaFeira].max, vela.max);
        agrupadosSemana[segundaFeira].min = Math.min(agrupadosSemana[segundaFeira].min, vela.min);
        agrupadosSemana[segundaFeira].close = vela.close;
      }
  
      // -------- Agrupar dados mensais --------
      const mesKey = `${ano}-${mes}`;
  
      if (!agrupadosMes[mesKey]) {
        agrupadosMes[mesKey] = {
          max: vela.max,
          min: vela.min,
          close: vela.close,
        };
      } else {
        agrupadosMes[mesKey].max = Math.max(agrupadosMes[mesKey].max, vela.max);
        agrupadosMes[mesKey].min = Math.min(agrupadosMes[mesKey].min, vela.min);
        agrupadosMes[mesKey].close = vela.close;
      }
    });
  
    // Função para converter o agrupamento em velas com timestamp ajustado
  const gerarVelas = (agrupados) => {
    return Object.keys(agrupados).map((chave) => {
      let dataLuxon;
  
      if (chave.endsWith('Z')) { // Se a data já estiver no formato ISO com UTC
        return {
          timestamp: chave, // Retorna a data exatamente como está
          max: agrupados[chave].max,
          min: agrupados[chave].min,
          close: agrupados[chave].close,
        };
  
      } else if (chave.length === 10) { // Formato "YYYY-MM-DD" (diário e semanal)
        dataLuxon = DateTime.fromISO(chave, { zone: 'America/New_York' });
  
        return {
          timestamp: `${dataLuxon.toISODate()}T00:00:00.000Z`, // Ajusta para ter "Z" no final, mas não altera a data
          max: agrupados[chave].max,
          min: agrupados[chave].min,
          close: agrupados[chave].close,
        };
  
      } else { // Formato "YYYY-MM" (mensal)
        const [ano, mes] = chave.split('-');
        dataLuxon = DateTime.fromObject({ year: Number(ano), month: Number(mes), day: 1 }, { setZone: false });
  
        return {
          timestamp: `${dataLuxon.toISODate()}T00:00:00.000Z`, // Ajusta para ter "Z" no final, mas não altera a data
          max: agrupados[chave].max,
          min: agrupados[chave].min,
          close: agrupados[chave].close,
        };
      }
    });
  };
  
  
    // Gerar velas diárias, semanais, mensais e de 4 horas
    const velasDiarias = gerarVelas(agrupadosDiarios);
    const velasSemana = gerarVelas(agrupadosSemana);
    const velasMes = gerarVelas(agrupadosMes);
    const velas4Horas = gerarVelas(agrupados4Horas);
  
    // Retornar as últimas 10 velas de cada tipo
    return {
      "4h": velas4Horas,
      "diario": velasDiarias,
      "semanal": velasSemana,
      "mensal": velasMes
    };
  }

module.exports = { agruparDados };



