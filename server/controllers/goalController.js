const asyncHandler = require('express-async-handler');
const Goal = require('../models/Goal');

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
const getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(goals);
});

// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
const createGoal = asyncHandler(async (req, res) => {
  const { title, targetAmount, deadline, description, category } = req.body;

  if (!title || !targetAmount || !deadline) {
    res.status(400);
    throw new Error('Please provide title, target amount, and deadline');
  }

  const goal = await Goal.create({
    user: req.user.id,
    title,
    targetAmount,
    deadline,
    description,
    category,
  });

  res.status(201).json(goal);
});

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  if (goal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedGoal = await Goal.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedGoal);
});

// @desc    Add money to goal
// @route   PATCH /api/goals/:id/contribute
// @access  Private
const contributeToGoal = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  if (goal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  goal.savedAmount += parseFloat(amount);

  // Auto-complete if target reached
  if (goal.savedAmount >= goal.targetAmount) {
    goal.status = 'completed';
  }

  await goal.save();
  res.json(goal);
});

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  if (goal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await goal.deleteOne();
  res.json({ id: req.params.id, message: 'Goal deleted' });
});

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  contributeToGoal,
  deleteGoal,
};
