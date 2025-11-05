const Wallet = require('../models/Wallet');
const Transfer = require('../models/Transfer');
const User = require('../models/User');
const QRCode = require('qrcode');

/** Helper: Extract userId safely */
function getUserId(req) {
  return req.user?._id;
}

/** ---------------------- Init Wallet ---------------------- */
const initializeWallet = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized user' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let wallet = await Wallet.findOne({ userId });
    if (wallet) return res.status(400).json({ message: 'Wallet already exists' });

    /** UPI ID Option A: name + last 4 digits of phone */
    const namePart = user.name?.trim().toLowerCase().replace(/\s+/g, '') || 'user';
    const phonePart = user.phone ? user.phone.slice(-4) : Math.floor(1000 + Math.random() * 9000);

    const upiId = `${namePart}${phonePart}@bank`;

    const qrData = JSON.stringify({
      upiId,
      phoneNumber: user.phone || '',
      userId: userId.toString(),
    });

    const qrCode = await QRCode.toDataURL(qrData);

    wallet = new Wallet({
      userId,
      phoneNumber: user.phone || '',
      upiId,
      qrCode,
    });

    await wallet.save();

    res.status(201).json({
      message: 'Wallet created successfully',
      wallet,
    });

  } catch (error) {
    console.error('Initialize Wallet Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/** ---------------------- Get Wallet Details ---------------------- */
const getWalletDetails = async (req, res) => {
  try {
    const userId = getUserId(req);

    const wallet = await Wallet.findOne({ userId }).populate(
      'userId',
      'name email phone'
    );

    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    res.status(200).json(wallet);

  } catch (error) {
    console.error('Wallet Details Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/** ---------------------- Top-Up Wallet ---------------------- */
const topupWallet = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { amount, method } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Amount must be positive' });

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    wallet.balance += amount;

    wallet.topupHistory.push({
      amount,
      method: method || 'Bank Transfer',
      date: new Date(),
    });

    await wallet.save();

    res.status(200).json({
      message: 'Wallet topped up successfully',
      newBalance: wallet.balance,
      wallet,
    });

  } catch (error) {
    console.error('Top-up Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/** ---------------------- Send Money ---------------------- */
const sendMoney = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { recipientPhoneOrUPI, amount, description } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Amount must be positive' });

    const senderWallet = await Wallet.findOne({ userId });
    if (!senderWallet) return res.status(404).json({ message: 'Sender wallet not found' });

    if (senderWallet.balance < amount)
      return res.status(400).json({ message: 'Insufficient balance' });

    const recipientWallet = await Wallet.findOne({
      $or: [{ phoneNumber: recipientPhoneOrUPI }, { upiId: recipientPhoneOrUPI }],
    });

    if (!recipientWallet) return res.status(404).json({ message: 'Recipient not found' });

    if (senderWallet.userId.toString() === recipientWallet.userId.toString())
      return res.status(400).json({ message: 'Cannot transfer to yourself' });

    const transactionId = `TXN${Date.now()}`;

    const transfer = new Transfer({
      senderId: userId,
      receiverId: recipientWallet.userId,
      amount,
      status: 'completed',
      transactionId,
      description,
      transferType: 'wallet',
    });

    senderWallet.balance -= amount;
    recipientWallet.balance += amount;

    await Promise.all([transfer.save(), senderWallet.save(), recipientWallet.save()]);

    res.status(200).json({
      message: 'Money transferred successfully',
      transactionId,
      transfer,
    });

  } catch (error) {
    console.error('Send Money Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/** ---------------------- Transfer History ---------------------- */
const getTransferHistory = async (req, res) => {
  try {
    const userId = getUserId(req);

    const transfers = await Transfer.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate('senderId', 'name phone')
      .populate('receiverId', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json(transfers);

  } catch (error) {
    console.error('Transfer History Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/** ---------------------- Generate QR Code ---------------------- */
const generateQRCode = async (req, res) => {
  try {
    const userId = getUserId(req);

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    res.status(200).json({
      qrCode: wallet.qrCode,
      upiId: wallet.upiId,
      phoneNumber: wallet.phoneNumber,
    });

  } catch (error) {
    console.error('Generate QR Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/** ---------------------- Scan QR ---------------------- */
const scanQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;

    const data = JSON.parse(qrData);

    const wallet = await Wallet.findOne({
      $or: [{ upiId: data.upiId }, { phoneNumber: data.phoneNumber }],
    }).populate('userId', 'name email');

    if (!wallet) return res.status(404).json({ message: 'Recipient not found' });

    res.status(200).json({
      recipientName: wallet.userId.name,
      upiId: wallet.upiId,
      phoneNumber: wallet.phoneNumber,
    });

  } catch (error) {
    console.error('Scan QR Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/** ---------------------- Bill Payment ---------------------- */
const billPayment = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { billType, billAmount, billNumber, description } = req.body;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    if (wallet.balance < billAmount)
      return res.status(400).json({ message: 'Insufficient balance' });

    wallet.balance -= billAmount;

    const transfer = new Transfer({
      senderId: userId,
      amount: billAmount,
      status: 'completed',
      transactionId: `BILL${Date.now()}`,
      description: `${billType} - ${billNumber} - ${description}`,
      transferType: 'bill_payment',
    });

    await Promise.all([wallet.save(), transfer.save()]);

    res.status(200).json({
      message: 'Bill payment successful',
      newBalance: wallet.balance,
    });

  } catch (error) {
    console.error('Bill Payment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/** ---------------------- Mobile Recharge ---------------------- */
const mobileRecharge = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { phoneNumber, rechargeAmount, operatorName } = req.body;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    if (wallet.balance < rechargeAmount)
      return res.status(400).json({ message: 'Insufficient balance' });

    wallet.balance -= rechargeAmount;

    const transfer = new Transfer({
      senderId: userId,
      amount: rechargeAmount,
      status: 'completed',
      transactionId: `RECHARGE${Date.now()}`,
      description: `Mobile Recharge - ${phoneNumber} - ${operatorName}`,
      transferType: 'mobile_recharge',
    });

    await Promise.all([wallet.save(), transfer.save()]);

    res.status(200).json({
      message: 'Mobile recharge successful',
      newBalance: wallet.balance,
    });

  } catch (error) {
    console.error('Mobile Recharge Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  initializeWallet,
  getWalletDetails,
  topupWallet,
  sendMoney,
  getTransferHistory,
  generateQRCode,
  scanQRCode,
  billPayment,
  mobileRecharge,
};
