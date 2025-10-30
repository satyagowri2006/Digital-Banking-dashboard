const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// @desc    Get transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id })
    .populate('account', 'accountNumber accountType')
    .sort({ createdAt: -1 });
  res.status(200).json(transactions);
});

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = asyncHandler(async (req, res) => {
  const { account, type, amount, category, description } = req.body;

  if (!account || !type || !amount) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const accountDoc = await Account.findById(account);

  if (!accountDoc) {
    res.status(404);
    throw new Error('Account not found');
  }

  // Check for user authorization
  if (accountDoc.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // Update account balance
  if (type === 'deposit') {
    accountDoc.balance += amount;
  } else if (type === 'withdrawal') {
    if (accountDoc.balance < amount) {
      res.status(400);
      throw new Error('Insufficient balance');
    }
    accountDoc.balance -= amount;
  }

  await accountDoc.save();

  const transaction = await Transaction.create({
    user: req.user.id,
    account,
    type,
    amount,
    category,
    description,
  });

  res.status(201).json(transaction);
});

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate(
    'account'
  );

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  if (transaction.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  res.status(200).json(transaction);
});

module.exports = {
  getTransactions,
  createTransaction,
  getTransaction,
};
