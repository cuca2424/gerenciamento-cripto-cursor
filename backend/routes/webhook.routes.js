const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// Esta rota precisa do body raw
router.post('/', express.raw({ type: 'application/json' }), webhookController.handleWebhook);

module.exports = router; 