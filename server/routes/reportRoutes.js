const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getFinancialSummary,
  getSpendingByCategory,
  getMonthlyTrends,
  getBudgetAnalysis,
  getGoalsProgress,
  getRecentTransactions,
  exportFinancialData,
} = require('../controllers/reportController');

router.get('/summary', protect, getFinancialSummary);
router.get('/spending-by-category', protect, getSpendingByCategory);
router.get('/monthly-trends', protect, getMonthlyTrends);
router.get('/budget-analysis', protect, getBudgetAnalysis);
router.get('/goals-progress', protect, getGoalsProgress);
router.get('/recent-transactions', protect, getRecentTransactions);
router.get('/export', protect, exportFinancialData);

module.exports = router;
