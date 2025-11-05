const express = require('express');
const walletController = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/initialize', protect, walletController.initializeWallet);
router.get('/details', protect, walletController.getWalletDetails);
router.post('/topup', protect, walletController.topupWallet);
router.post('/send-money', protect, walletController.sendMoney);
router.get('/transfer-history', protect, walletController.getTransferHistory);
router.get('/generate-qr', protect, walletController.generateQRCode); // ✅ GET not POST
router.post('/scan-qr', protect, walletController.scanQRCode);
router.post('/bill-payment', protect, walletController.billPayment);
router.post('/mobile-recharge', protect, walletController.mobileRecharge);

module.exports = router;
