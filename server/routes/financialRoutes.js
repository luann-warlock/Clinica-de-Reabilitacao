const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');

// Rotas de Pagamentos
router.get('/payments', financialController.getPayments);
router.post('/payments', financialController.createPayment);
router.put('/payments/:id', financialController.updatePayment);
router.patch('/payments/:id/pay', financialController.registerPayment);
router.delete('/payments/:id', financialController.deletePayment);

// Rotas de Despesas
router.get('/expenses', financialController.getExpenses);
router.post('/expenses', financialController.createExpense);

// Rotas de Relatórios
router.get('/reports', financialController.getFinancialReports);
router.get('/stats', financialController.getQuickStats);

module.exports = router;