const mongoose = require('mongoose');

const estrategiaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  filtros: [{
    indicador: String,
    tipo: String,
    periodo: String,
    timeframe: String,
    operador: String,
    valor: Number
  }],
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  notificacoes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  tipo: {
    type: String,
    enum: ['pessoal', 'global'],
    default: 'pessoal'
  },
  deletados: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Estrategia', estrategiaSchema); 