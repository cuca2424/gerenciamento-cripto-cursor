const express = require('express');
const router = express.Router();
const carteiraController = require('../controllers/carteira.controller');

// Rotas da carteira
router.post('/', carteiraController.createWallet);
router.get('/', carteiraController.getAllWallets);
router.get('/:id', carteiraController.getWallet);
router.post('/:id/ativos', carteiraController.addAsset);
router.delete('/:id/ativos', carteiraController.sellAsset);
router.get('/:id/ativos', carteiraController.getAssets);
router.get('/:id/saldo', carteiraController.getWalletBalance);
router.get('/resumo', carteiraController.getWalletSummary);

module.exports = router;
