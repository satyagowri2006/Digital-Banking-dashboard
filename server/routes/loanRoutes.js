const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  calculateEMI,
  getLoans,
  createLoan,
  updateLoanStatus,
  makePayment,
  getLoanById,
  deleteLoan,
} = require('../controllers/loanController');

router.post('/calculate-emi', protect, calculateEMI);
router.route('/').get(protect, getLoans).post(protect, createLoan);
router.route('/:id').get(protect, getLoanById).delete(protect, deleteLoan);
router.put('/:id/status', protect, updateLoanStatus);
router.post('/:id/pay', protect, makePayment);

module.exports = router;
