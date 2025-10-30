const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Loan = require('../models/Loan');

// @desc    Get financial summary
// @route   GET /api/reports/summary
// @access  Private
const getFinancialSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get all accounts
  const accounts = await Account.find({ user: userId });
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Get transactions
  const transactions = await Transaction.find({ user: userId });
  const totalIncome = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  // Get budgets
  const budgets = await Budget.find({ user: userId });

  // Get goals
  const goals = await Goal.find({ user: userId });
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;

  // Get loans
  const loans = await Loan.find({ user: userId });
  const activeLoans = loans.filter(l => l.status === 'active');
  const totalLoanAmount = activeLoans.reduce((sum, l) => sum + l.remainingAmount, 0);
  const totalEMI = activeLoans.reduce((sum, l) => sum + l.emi, 0);

  res.json({
    totalBalance,
    totalIncome,
    totalExpense,
    netSavings: totalIncome - totalExpense,
    accountsCount: accounts.length,
    transactionsCount: transactions.length,
    budgetsCount: budgets.length,
    activeGoals,
    completedGoals,
    activeLoansCount: activeLoans.length,
    totalLoanAmount,
    totalMonthlyEMI: totalEMI,
  });
});

// @desc    Get spending by category
// @route   GET /api/reports/spending-by-category
// @access  Private
const getSpendingByCategory = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const matchQuery = {
    user: req.user.id,
    type: 'withdrawal',
  };

  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const categoryData = await Transaction.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.json(categoryData);
});

// @desc    Get monthly trends
// @route   GET /api/reports/monthly-trends
// @access  Private
const getMonthlyTrends = asyncHandler(async (req, res) => {
  const { months = 6 } = req.query;
  const monthsAgo = new Date();
  monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

  const trends = await Transaction.aggregate([
    {
      $match: {
        user: req.user.id,
        createdAt: { $gte: monthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Format data for charts
  const formattedData = {};
  trends.forEach(item => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    if (!formattedData[key]) {
      formattedData[key] = { month: key, income: 0, expense: 0 };
    }
    if (item._id.type === 'deposit') {
      formattedData[key].income = item.total;
    } else if (item._id.type === 'withdrawal') {
      formattedData[key].expense = item.total;
    }
  });

  res.json(Object.values(formattedData));
});

// @desc    Get budget vs actual spending
// @route   GET /api/reports/budget-analysis
// @access  Private
const getBudgetAnalysis = asyncHandler(async (req, res) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const budgets = await Budget.find({
    user: req.user.id,
    month: currentMonth,
    year: currentYear,
  });

  const analysis = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await Transaction.aggregate([
        {
          $match: {
            user: req.user.id,
            category: budget.category,
            type: 'withdrawal',
            createdAt: {
              $gte: new Date(currentYear, currentMonth - 1, 1),
              $lt: new Date(currentYear, currentMonth, 1),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      const spentAmount = spent.length > 0 ? spent[0].total : 0;
      const percentage = (spentAmount / budget.limit) * 100;

      return {
        category: budget.category,
        budget: budget.limit,
        spent: spentAmount,
        remaining: budget.limit - spentAmount,
        percentage: percentage.toFixed(1),
        status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good',
      };
    })
  );

  res.json(analysis);
});

// @desc    Get goal progress report
// @route   GET /api/reports/goals-progress
// @access  Private
const getGoalsProgress = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ user: req.user.id });

  const report = goals.map(goal => ({
    title: goal.title,
    targetAmount: goal.targetAmount,
    savedAmount: goal.savedAmount,
    progress: ((goal.savedAmount / goal.targetAmount) * 100).toFixed(1),
    status: goal.status,
    deadline: goal.deadline,
    daysLeft: Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)),
  }));

  res.json(report);
});

// @desc    Get recent transactions
// @route   GET /api/reports/recent-transactions
// @access  Private
const getRecentTransactions = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const transactions = await Transaction.find({ user: req.user.id })
    .populate('account', 'accountNumber accountType')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json(transactions);
});

// @desc    Export financial data
// @route   GET /api/reports/export
// @access  Private
const exportFinancialData = asyncHandler(async (req, res) => {
  const { type } = req.query; // transactions, budgets, goals, loans

  let data;
  switch (type) {
    case 'transactions':
      data = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
      break;
    case 'budgets':
      data = await Budget.find({ user: req.user.id });
      break;
    case 'goals':
      data = await Goal.find({ user: req.user.id });
      break;
    case 'loans':
      data = await Loan.find({ user: req.user.id });
      break;
    default:
      res.status(400);
      throw new Error('Invalid export type');
  }

  res.json(data);
});

module.exports = {
  getFinancialSummary,
  getSpendingByCategory,
  getMonthlyTrends,
  getBudgetAnalysis,
  getGoalsProgress,
  getRecentTransactions,
  exportFinancialData,
};
