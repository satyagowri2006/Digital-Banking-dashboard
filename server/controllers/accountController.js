const asyncHandler = require('express-async-handler');
const Account = require('../models/Account');

// @desc    Get user accounts
// @route   GET /api/accounts
// @access  Private
const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ user: req.user.id });
  res.status(200).json(accounts);
});

// @desc    Create new account
// @route   POST /api/accounts
// @access  Private
const createAccount = asyncHandler(async (req, res) => {
  const { accountType, balance } = req.body;

  // Generate random account number
  const accountNumber = 'ACC' + Math.floor(Math.random() * 1000000000);

  const account = await Account.create({
    user: req.user.id,
    accountNumber,
    accountType,
    balance: balance || 0,
  });

  res.status(201).json(account);
});

// @desc    Get single account
// @route   GET /api/accounts/:id
// @access  Private
const getAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);

  if (!account) {
    res.status(404);
    throw new Error('Account not found');
  }

  // Check for user
  if (account.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  res.status(200).json(account);
});

// @desc    Update account
// @route   PUT /api/accounts/:id
// @access  Private
const updateAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);

  if (!account) {
    res.status(404);
    throw new Error('Account not found');
  }

  // Check for user
  if (account.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedAccount = await Account.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedAccount);
});

// @desc    Delete account
// @route   DELETE /api/accounts/:id
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);

  if (!account) {
    res.status(404);
    throw new Error('Account not found');
  }

  // Check for user
  if (account.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await account.deleteOne();

  res.status(200).json({ id: req.params.id });
});

module.exports = {
  getAccounts,
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
};
