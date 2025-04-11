const express = require('express');
const router = express.Router();
const carteiraController = require('../controllers/carteira.controller');

// Criar uma nova carteira
router.post('/', carteiraController.createWallet);

// Adicionar um aporte de criptomoeda na carteira
router.post('/:id/aporte', carteiraController.addAsset);

// Vender um ativo por real
router.post('/:id/venda', carteiraController.sellAsset);

// Listar ativos de uma carteira
router.get('/:id/ativos', carteiraController.getAssets);

// Mostrar saldo, aporte e lucro da carteira
router.get('/:id/saldo', carteiraController.getWalletBalance);

// Obter todas as carteiras
router.get('/', carteiraController.getAllWallets);

// Obter uma carteira específica
router.get('/:id', carteiraController.getWallet);

// Deletar uma carteira
router.delete('/:id', carteiraController.deleteWallet);

module.exports = router;
