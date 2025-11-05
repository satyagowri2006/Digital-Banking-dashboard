const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  phoneNumber: { type: String, unique: true, required: true },
  upiId: { type: String, unique: true, sparse: true },
  qrCode: { type: String },
  topupHistory: [{ amount: Number, date: Date, method: String }],
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
