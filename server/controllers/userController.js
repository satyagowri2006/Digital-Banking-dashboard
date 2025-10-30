const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404); throw new Error('User not found');
  }
  // basic data update scaffold
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  await user.save();
  res.json(user);
});

module.exports = { getUserProfile, updateUserProfile };
