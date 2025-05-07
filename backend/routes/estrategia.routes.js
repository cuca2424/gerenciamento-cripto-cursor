const express = require('express');
const router = express.Router();
const estrategiaController = require('../controllers/estrategia.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas para estratégias
router.post('/', estrategiaController.createEstrategia);
router.get('/', estrategiaController.getEstrategias);
router.put('/:id', estrategiaController.updateEstrategia);
router.delete('/:id', estrategiaController.deleteEstrategia);
router.put('/:id/notificacoes', estrategiaController.toggleNotificacoes);

module.exports = router; 