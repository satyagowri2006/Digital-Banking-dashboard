const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Placeholder - implement notification controllers
router.get('/', protect, (req, res) => {
  res.json({ message: 'Notification routes' });
});

module.exports = router;
