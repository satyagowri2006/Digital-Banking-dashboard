const Goal = require('../models/Goal');

// Utility functions related to goals

async function calculateGoalProgress(goalId) {
  const goal = await Goal.findById(goalId);
  if (!goal) return null;
  return (goal.savedAmount / goal.targetAmount) * 100;
}

module.exports = { calculateGoalProgress };
