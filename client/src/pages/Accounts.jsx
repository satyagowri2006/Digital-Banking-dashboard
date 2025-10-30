import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getAccounts, createAccount } from '../api/accountApi';
import { setAccounts, addAccount } from '../state/accountSlice';
import './Pages.css';

const Accounts = () => {
  const dispatch = useDispatch();
  const { accounts } = useSelector((state) => state.account);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    accountType: 'savings',
    balance: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      dispatch(setAccounts(data));
    } catch (error) {
      console.error('Error fetching accounts:', error);
      alert('Failed to fetch accounts');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newAccount = await createAccount(formData);
      dispatch(addAccount(newAccount));
      setShowForm(false);
      setFormData({ accountType: 'savings', balance: 0 });
      alert('Account created successfully!');
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1>My Accounts</h1>
            <button 
              className="btn-primary" 
              onClick={() => setShowForm(!showForm)}
              style={{ padding: '10px 20px' }}
            >
              {showForm ? 'Cancel' : '+ Add Account'}
            </button>
          </div>

          {showForm && (
            <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
              <h3>Create New Account</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Account Type</label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                    <option value="fixed_deposit">Fixed Deposit</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Initial Balance</label>
                  <input
                    type="number"
                    name="balance"
                    value={formData.balance}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {accounts.length === 0 ? (
              <p>No accounts yet. Create your first account!</p>
            ) : (
              accounts.map((account) => (
                <div key={account._id} className="card" style={{ padding: '20px' }}>
                  <h3 style={{ textTransform: 'capitalize' }}>
                    {account.accountType.replace('_', ' ')} Account
                  </h3>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Account No: {account.accountNumber}
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
                    ₹{account.balance.toLocaleString()}
                  </p>
                  <p style={{ fontSize: '12px' }}>
                    Status: <span style={{ 
                      color: account.status === 'active' ? 'green' : 'red',
                      fontWeight: 'bold'
                    }}>
                      {account.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Accounts;
