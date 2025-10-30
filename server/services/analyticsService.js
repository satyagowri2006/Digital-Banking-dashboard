// Analytics service: custom business logic for reporting, statistics, etc.

const Transaction = require('../models/Transaction');

async function getSpendingTrends(userId) {
  // Aggregate last 6 months spending by category
  return await Transaction.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: { category: '$category', month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } }
  ]);
}

module.exports = { getSpendingTrends };
