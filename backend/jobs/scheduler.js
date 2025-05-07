const cron = require('node-cron');

class Scheduler {
  constructor(db) {
    this.db = db;
    this.jobs = [];
  }

  // Adiciona um novo job à lista
  addJob(name, task) {
    this.jobs.push({
      name,
      task: () => this.executeJob(name, task)
    });
  }

  // Executa um job específico com tratamento de erro
  async executeJob(name, task) {
    try {
      console.log(`[${new Date().toISOString()}] Iniciando job: ${name}`);
      await task(this.db);
      console.log(`[${new Date().toISOString()}] Job finalizado com sucesso: ${name}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Erro no job ${name}:`, error);
    }
  }

  // Inicia todos os jobs registrados
  start() {
    // Executa a cada 10 segundos
    setInterval(() => {
      this.jobs.forEach(job => job.task());
    }, 100000); // 10000 ms = 10 segundos

    console.log('Scheduler iniciado - Jobs serão executados a cada 10 segundos');
  }
}

module.exports = Scheduler; 