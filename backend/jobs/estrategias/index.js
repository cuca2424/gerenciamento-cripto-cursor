const verificarEstrategias = async (db) => {
  console.log('Simulação: Verificando estratégias...');

  async function verificarEstrategiasEDispararNotificacoes() {
    const estrategias = await Estrategia.find();
  
    for (const estrategia of estrategias) {
      const { tipo, filtros, nome, notificacoes = [], deletados = [] } = estrategia;
  
      const criptosAcionadas = verificarFiltros(filtros);
      if (!Array.isArray(criptosAcionadas) || criptosAcionadas.length === 0) {
        continue;
      }
  
      let mensagem = "";
      if (criptosAcionadas.length === 1) {
        mensagem = `🔔 A cripto ${criptosAcionadas[0]} acionou a estratégia "${nome}".`;
      } else {
        const lista = criptosAcionadas.join(', ');
        mensagem = `🔔 As criptos ${lista} acionaram a estratégia "${nome}".`;
      }
  
      if (tipo === 'pessoal') {
        if (estrategia.notificacoes === true) {
          console.log(`[✔️] Notificar ${estrategia.usuario}: ${mensagem}`);
          // await sendNotification(estrategia.usuario, mensagem);
        }
      }
  
      if (tipo === 'global') {
        for (const userId of notificacoes) {
          const userIdStr = userId.toString();
          const foiDeletado = deletados.some(id => id.toString() === userIdStr);
  
          if (!foiDeletado) {
            console.log(`[✔️] Notificar ${userId}: ${mensagem}`);
            // await sendNotification(userId, mensagem);
          }
        }
      }
    }
  }
  
  // Aqui vai a lógica de verificação das estratégias
};

module.exports = verificarEstrategias; 