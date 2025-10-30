const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getGoals,
  createGoal,
  updateGoal,
  contributeToGoal,
  deleteGoal,
} = require('../controllers/goalController');

router.route('/').get(protect, getGoals).post(protect, createGoal);
router.route('/:id').put(protect, updateGoal).delete(protect, deleteGoal);
router.patch('/:id/contribute', protect, contributeToGoal);

module.exports = router;
