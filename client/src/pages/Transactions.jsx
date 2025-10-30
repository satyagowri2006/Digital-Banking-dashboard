import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getTransactions, createTransaction } from '../api/transactionApi';
import { getAccounts } from '../api/accountApi';
import { setTransactions, addTransaction } from '../state/transactionSlice';
import { setAccounts } from '../state/accountSlice';
import './Pages.css';

const Transactions = () => {
  const dispatch = useDispatch();
  const { transactions } = useSelector((state) => state.transaction);
  const { accounts } = useSelector((state) => state.account);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    account: '',
    type: 'deposit',
    amount: '',
    category: 'other',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transData, accountData] = await Promise.all([
        getTransactions(),
        getAccounts()
      ]);
      dispatch(setTransactions(transData));
      dispatch(setAccounts(accountData));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newTransaction = await createTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      dispatch(addTransaction(newTransaction));
      setShowForm(false);
      setFormData({
        account: '',
        type: 'deposit',
        amount: '',
        category: 'other',
        description: ''
      });
      alert('Transaction successful!');
      fetchData(); // Refresh to update balances
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert(error.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' || t.type === filter
  );

  const getTypeColor = (type) => {
    switch(type) {
      case 'deposit': return '#4caf50';
      case 'withdrawal': return '#f44336';
      case 'transfer': return '#2196f3';
      default: return '#666';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1>Transactions</h1>
            <button 
              className="btn-primary" 
              onClick={() => setShowForm(!showForm)}
              style={{ padding: '10px 20px' }}
            >
              {showForm ? 'Cancel' : '+ New Transaction'}
            </button>
          </div>

          {showForm && (
            <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
              <h3>Create New Transaction</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Account</label>
                  <select
                    name="account"
                    value={formData.account}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts.map(acc => (
                      <option key={acc._id} value={acc._id}>
                        {acc.accountNumber} - {acc.accountType} (₹{acc.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Transaction Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="form-control"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="bills">Bills</option>
                    <option value="salary">Salary</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., Grocery shopping"
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : 'Submit Transaction'}
                </button>
              </form>
            </div>
          )}

          {/* Filter Buttons */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <button 
              className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={filter === 'deposit' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('deposit')}
            >
              Deposits
            </button>
            <button 
              className={filter === 'withdrawal' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('withdrawal')}
            >
              Withdrawals
            </button>
          </div>

          {/* Transaction List */}
          <div className="card" style={{ padding: '20px' }}>
            <h3>Transaction History</h3>
            {filteredTransactions.length === 0 ? (
              <p>No transactions yet. Create your first transaction!</p>
            ) : (
              <div style={{ marginTop: '15px' }}>
                {filteredTransactions.map((transaction) => (
                  <div 
                    key={transaction._id} 
                    style={{
                      padding: '15px',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span 
                          style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: 'white',
                            backgroundColor: getTypeColor(transaction.type),
                            textTransform: 'uppercase'
                          }}
                        >
                          {transaction.type}
                        </span>
                        <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                          {transaction.category}
                        </span>
                      </div>
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                        {transaction.description || 'No description'}
                      </p>
                      <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p 
                        style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          margin: '0',
                          color: transaction.type === 'deposit' ? '#4caf50' : '#f44336'
                        }}
                      >
                        {transaction.type === 'deposit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                        {transaction.account?.accountNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Transactions;
