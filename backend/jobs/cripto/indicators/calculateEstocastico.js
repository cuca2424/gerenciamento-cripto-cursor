function calculateEstocastico(velas) {
    const periodos = [7, 14];
    const tempos = ['4h', 'diario', 'semanal', 'mensal'];
  
    const resultado = {
      estocastico: {
        rapido: {},
        lento: {}
      }
    };
  
    tempos.forEach((tempo) => {
      const dados = velas[tempo];
      resultado.estocastico.rapido[tempo] = {};
      resultado.estocastico.lento[tempo] = {};
  
      periodos.forEach((periodo) => {
        if (dados.length < periodo + 2) {
          resultado.estocastico.rapido[tempo][`periodo${periodo}`] = null;
          resultado.estocastico.lento[tempo][`periodo${periodo}`] = null;
          return;
        }
  
        // Calcular %K Rápido
        const recentes = dados.slice(-periodo);
        const highs = recentes.map(v => v.max);
        const lows = recentes.map(v => v.min);
        const closes = recentes.map(v => v.close);
  
        const highestHigh = Math.max(...highs);
        const lowestLow = Math.min(...lows);
        const closeAtual = closes[closes.length - 1];
  
        const percentK = ((closeAtual - lowestLow) / (highestHigh - lowestLow)) * 100;
  
        // Calcular %D Rápido (média dos últimos 3 %K)
        const ksRecentes = [];
        for (let i = dados.length - periodo - 2; i <= dados.length - 1; i++) {
          const janela = dados.slice(i, i + periodo);
          const h = Math.max(...janela.map(v => v.max));
          const l = Math.min(...janela.map(v => v.min));
          const c = janela[janela.length - 1].close;
          const k = ((c - l) / (h - l)) * 100;
          ksRecentes.push(k);
        }
  
        const percentD = ksRecentes.slice(-3).reduce((a, b) => a + b, 0) / 3;
  
        resultado.estocastico.rapido[tempo][`periodo${periodo}`] = percentK.toFixed(1);
        resultado.estocastico.lento[tempo][`periodo${periodo}`] = percentD.toFixed(1);
      });
    });
  
    return resultado;
  }
  

module.exports = { calculateEstocastico };
