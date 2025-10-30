const asyncHandler = require('express-async-handler');
const Loan = require('../models/Loan');

// @desc    Calculate EMI
// @route   POST /api/loans/calculate-emi
// @access  Private
const calculateEMI = asyncHandler(async (req, res) => {
  const { amount, interestRate, tenure } = req.body;

  if (!amount || !interestRate || !tenure) {
    res.status(400);
    throw new Error('Please provide amount, interest rate, and tenure');
  }

  const principal = parseFloat(amount);
  const monthlyRate = parseFloat(interestRate) / 12 / 100;
  const months = parseInt(tenure);

  // EMI Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
              (Math.pow(1 + monthlyRate, months) - 1);

  const totalAmount = emi * months;
  const totalInterest = totalAmount - principal;

  res.json({
    emi: Math.round(emi),
    totalAmount: Math.round(totalAmount),
    totalInterest: Math.round(totalInterest),
    principal,
    tenure: months,
  });
});

// @desc    Get loans for user
// @route   GET /api/loans
// @access  Private
const getLoans = asyncHandler(async (req, res) => {
  const loans = await Loan.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(loans);
});

// @desc    Create a loan application
// @route   POST /api/loans
// @access  Private
const createLoan = asyncHandler(async (req, res) => {
  const { loanType, amount, interestRate, tenure, description } = req.body;

  if (!loanType || !amount || !interestRate || !tenure) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Calculate EMI
  const principal = parseFloat(amount);
  const monthlyRate = parseFloat(interestRate) / 12 / 100;
  const months = parseInt(tenure);
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
              (Math.pow(1 + monthlyRate, months) - 1);

  const loan = await Loan.create({
    user: req.user.id,
    loanType,
    amount: principal,
    interestRate,
    tenure: months,
    emi: Math.round(emi),
    remainingAmount: principal,
    description,
    status: 'pending',
  });

  res.status(201).json(loan);
});

// @desc    Update loan status (approve/reject)
// @route   PUT /api/loans/:id/status
// @access  Private
const updateLoanStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  if (loan.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  loan.status = status;
  
  if (status === 'active') {
    const today = new Date();
    loan.nextPaymentDate = new Date(today.setMonth(today.getMonth() + 1));
  }

  await loan.save();
  res.json(loan);
});

// @desc    Make EMI payment
// @route   POST /api/loans/:id/pay
// @access  Private
const makePayment = asyncHandler(async (req, res) => {
  const { amount, paymentMethod } = req.body;
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  if (loan.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const paymentAmount = parseFloat(amount);

  // Update loan amounts
  loan.paidAmount += paymentAmount;
  loan.remainingAmount -= paymentAmount;

  // Add to payment history
  loan.paymentHistory.push({
    amount: paymentAmount,
    date: new Date(),
    paymentMethod: paymentMethod || 'online',
  });

  // Update next payment date
  if (loan.remainingAmount > 0) {
    const nextDate = new Date(loan.nextPaymentDate);
    loan.nextPaymentDate = new Date(nextDate.setMonth(nextDate.getMonth() + 1));
  } else {
    loan.status = 'completed';
    loan.remainingAmount = 0;
  }

  await loan.save();
  res.json(loan);
});

// @desc    Get loan by ID
// @route   GET /api/loans/:id
// @access  Private
const getLoanById = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  if (loan.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.json(loan);
});

// @desc    Delete loan
// @route   DELETE /api/loans/:id
// @access  Private
const deleteLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  if (loan.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await loan.deleteOne();
  res.json({ id: req.params.id, message: 'Loan deleted' });
});

module.exports = {
  calculateEMI,
  getLoans,
  createLoan,
  updateLoanStatus,
  makePayment,
  getLoanById,
  deleteLoan,
};
