const express = require('express');
const router = express.Router();
const criptoController = require('../controllers/cripto.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rotas públicas
router.get('/', criptoController.getAllCryptos);
router.get('/names', criptoController.getAllCryptoNames);
router.get('/:nome', criptoController.getCryptoByName);
router.post('/filtrar', criptoController.filterCryptosByIndicators);

// Rotas protegidas (apenas admin pode modificar criptomoedas)
router.post('/', authMiddleware, criptoController.updateCrypto);
router.put('/:nome', authMiddleware, criptoController.updateCrypto);
router.delete('/:nome', authMiddleware, criptoController.deleteCrypto);

module.exports = router;
