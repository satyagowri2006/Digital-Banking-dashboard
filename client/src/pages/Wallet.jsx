import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./Wallet.css";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingWallet, setCreatingWallet] = useState(false);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const fetchWalletDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/wallet/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWallet(response.data);
      setError("");
    } catch (err) {
      setWallet(null);
      setError(err.response?.data?.message || "Failed to fetch wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    setCreatingWallet(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/wallet/initialize`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setError("");
      await fetchWalletDetails();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create wallet.");
    } finally {
      setCreatingWallet(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />

        <main className="dashboard-content">
          <h1>My Wallet</h1>

          {error && <div className="error-message">{error}</div>}

          {!wallet && error === "Wallet not found" && (
            <button className="btn-primary" onClick={handleCreateWallet} disabled={creatingWallet}>
              {creatingWallet ? "Creating Wallet..." : "Create Wallet"}
            </button>
          )}

          {wallet && (
            <>
              {/* Dual Card Layout */}
              <div className="wallet-card-container">
                {/* Balance Card */}
                <div className="wallet-card balance-card">
                  <h3>Available Balance</h3>
                  <h2 className="balance">₹ {wallet.balance || 0}</h2>
                  <p className="upi-id">UPI: {wallet.upiId}</p>
                  <p className="phone">Phone: {wallet.phoneNumber}</p>
                </div>

                {/* QR Code Card */}
                <div className="wallet-card qr-card">
                  <h3>Your QR Code</h3>
                  {wallet?.qrCode && (
                    <div className="qr-container">
                      <img src={wallet.qrCode} alt="QR Code" className="qr-image" />
                      <p>{wallet.upiId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs">
                {["overview", "send", "topup", "qr", "bills"].map((tab) => (
                  <button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Screens */}
              {activeTab === "overview" && <OverviewTab wallet={wallet} />}
              {activeTab === "send" && <SendMoneyTab token={token} />}
              {activeTab === "topup" && (
                <TopupTab token={token} onSuccess={fetchWalletDetails} />
              )}
              {activeTab === "qr" && <QRCodeTab wallet={wallet} />}
              {activeTab === "bills" && (
                <BillsTab token={token} onSuccess={fetchWalletDetails} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

/* ------------ CHILD COMPONENTS ------------ */

const OverviewTab = ({ wallet }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTransferHistory();
  }, []);

  const fetchTransferHistory = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/wallet/transfer-history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory(response.data);
    } catch {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-screen">
      <h3>Recent Transactions</h3>
      {loading ? (
        <p>Loading transactions...</p>
      ) : history.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        <ul className="transaction-list">
          {history.slice(0, 5).map((txn) => (
            <li key={txn._id} className="transaction-item">
              <span>{txn.transferType}</span>
              <span className={txn.senderId === wallet.userId ? "debit" : "credit"}>
                {txn.senderId === wallet.userId ? "-" : "+"} ₹{txn.amount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SendMoneyTab = ({ token }) => {
  const [formData, setFormData] = useState({
    recipientPhoneOrUPI: "",
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const handleSendMoney = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/wallet/send-money`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Money transferred successfully!");
      setFormData({ recipientPhoneOrUPI: "", amount: "", description: "" });
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-screen">
      <form onSubmit={handleSendMoney} className="form">
        <input
          type="text"
          name="recipientPhoneOrUPI"
          placeholder="Recipient Phone or UPI ID"
          value={formData.recipientPhoneOrUPI}
          onChange={(e) =>
            setFormData({ ...formData, recipientPhoneOrUPI: e.target.value })
          }
          required
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Money"}
        </button>
      </form>
      {message && <p className={message.includes("successfully") ? "success" : "error"}>{message}</p>}
    </div>
  );
};

const TopupTab = ({ token, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank Transfer");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const handleTopup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/api/wallet/topup`,
        { amount: parseFloat(amount), method },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Wallet topped up successfully!");
      setAmount("");
      onSuccess();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Top-up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-screen">
      <form onSubmit={handleTopup} className="form">
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option>Bank Transfer</option>
          <option>Card</option>
          <option>UPI</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Top-up Now"}
        </button>
      </form>
      {message && <p className={message.includes("successfully") ? "success" : "error"}>{message}</p>}
    </div>
  );
};

const QRCodeTab = ({ wallet }) => {
  return (
    <div className="tab-screen qr-center">
      <h3>Your QR Code</h3>
      <img src={wallet.qrCode} alt="QR Code" className="qr-large" />
      <p>{wallet.upiId}</p>
    </div>
  );
};

const BillsTab = ({ token, onSuccess }) => {
  const [billType, setBillType] = useState("Electricity");
  const [billData, setBillData] = useState({
    billNumber: "",
    billAmount: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const handleBillPayment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/api/wallet/bill-payment`,
        {
          billType,
          billAmount: parseFloat(billData.billAmount),
          billNumber: billData.billNumber,
          description: "Bill Payment",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Bill payment successful!");
      setBillData({ billAmount: "", billNumber: "" });
      onSuccess();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-screen">
      <form onSubmit={handleBillPayment} className="form">
        <select value={billType} onChange={(e) => setBillType(e.target.value)}>
          <option>Electricity</option>
          <option>Water</option>
          <option>Gas</option>
          <option>Internet</option>
          <option>Insurance</option>
        </select>

        <input
          type="text"
          placeholder="Bill Number"
          value={billData.billNumber}
          onChange={(e) =>
            setBillData({ ...billData, billNumber: e.target.value })
          }
          required
        />

        <input
          type="number"
          placeholder="Bill Amount"
          value={billData.billAmount}
          onChange={(e) =>
            setBillData({ ...billData, billAmount: e.target.value })
          }
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Pay Bill"}
        </button>
      </form>
      {message && <p className={message.includes("successful") ? "success" : "error"}>{message}</p>}
    </div>
  );
};

export default Wallet;
