const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getBudgets, createBudget, calculateBudgetProgress } = require('../controllers/budgetController');

router.get('/', protect, getBudgets);
router.post('/', protect, createBudget);
router.get('/:id/spent', protect, calculateBudgetProgress);

module.exports = router;
