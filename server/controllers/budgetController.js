const asyncHandler = require('express-async-handler');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc Get budgets
// @route GET /api/budgets
// @access Private
const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await Budget.find({ user: req.user.id });
  res.json(budgets);
});

// @desc Create budget
// @route POST /api/budgets
// @access Private
const createBudget = asyncHandler(async (req, res) => {
  const { category, limit, month, year } = req.body;
  if (!category || !limit || !month || !year) {
    res.status(400);
    throw new Error('All fields are required');
  }

  const budgetExists = await Budget.findOne({ 
    user: req.user.id, 
    category, 
    month, 
    year 
  });

  if (budgetExists) {
    res.status(400);
    throw new Error('Budget for this category and month already exists');
  }

  const budget = await Budget.create({
    user: req.user.id,
    category,
    limit,
    month,
    year
  });

  res.status(201).json(budget);
});

// @desc Calculate spending
// @route GET /api/budgets/:id/spent
// @access Private
const calculateBudgetProgress = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id);
  if (!budget) {
    res.status(404);
    throw new Error('Budget not found');
  }

  const totalSpent = await Transaction.aggregate([
    {
      $match: {
        user: budget.user,
        category: budget.category,
        createdAt: {
          $gte: new Date(budget.year, budget.month - 1, 1),
          $lt: new Date(budget.year, budget.month, 1)
        },
        type: { $ne: 'deposit' } // only expenses
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  const spent = totalSpent.length ? totalSpent[0].total : 0;
  budget.spent = spent;
  await budget.save();

  res.json({ ...budget.toObject(), spent });
});

module.exports = { getBudgets, createBudget, calculateBudgetProgress };
