const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Placeholder routes - implement controllers as needed
router.get('/profile', protect, (req, res) => {
  res.json({ message: 'User profile route' });
});

module.exports = router;
