const express = require('express');
const router = express.Router();
const {
  getAccounts,
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
} = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAccounts).post(protect, createAccount);
router
  .route('/:id')
  .get(protect, getAccount)
  .put(protect, updateAccount)
  .delete(protect, deleteAccount);

module.exports = router;
