const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  transactionId: { type: String, unique: true },
  description: { type: String },
  transferType: { type: String, enum: ['wallet', 'bill_payment', 'mobile_recharge'], default: 'wallet' },
}, { timestamps: true });

module.exports = mongoose.model('Transfer', transferSchema);
