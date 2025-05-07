const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');
const adminAuth = require('../middleware/adminAuth');

// Middleware para verificar se o usuário é admin
router.use(auth, adminAuth);

// Rotas de usuários
router.get('/usuarios', adminController.listarUsuarios);
router.put('/usuarios/:id/status', adminController.atualizarStatusUsuario);
router.put('/usuarios/:id/role', adminController.atualizarRoleUsuario);

// Rotas de estratégias globais
router.get('/estrategias-globais', adminController.listarEstrategiasGlobais);
router.post('/estrategias-globais', adminController.criarEstrategiaGlobal);
router.put('/estrategias-globais/:id', adminController.atualizarEstrategiaGlobal);
router.delete('/estrategias-globais/:id', adminController.deletarEstrategiaGlobal);

module.exports = router; 