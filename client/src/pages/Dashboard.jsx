import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import WidgetCard from '../components/WidgetCard';
import { getAccounts } from '../api/accountApi';
import { getTransactions } from '../api/transactionApi';
import { setAccounts } from '../state/accountSlice';
import { setTransactions } from '../state/transactionSlice';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { accounts } = useSelector((state) => state.account);
  const { transactions } = useSelector((state) => state.transaction);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [accountsData, transactionsData] = await Promise.all([
        getAccounts(),
        getTransactions()
      ]);
      dispatch(setAccounts(accountsData));
      dispatch(setTransactions(transactionsData));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const recentTransactions = transactions.slice(0, 5); // Last 5 transactions

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type) => {
    return type === 'deposit' ? '#4caf50' : '#f44336';
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-content">
          <h1>Welcome, {user?.name || 'User'}!</h1>

          {/* Widgets */}
          <div className="widgets-grid">
            <WidgetCard
              title="Total Balance"
              value={`₹${totalBalance.toLocaleString()}`}
              icon="💰"
              color="#4caf50"
            />
            <WidgetCard
              title="Accounts"
              value={accounts.length}
              icon="🏦"
              color="#2196f3"
            />
            <WidgetCard
              title="Transactions"
              value={transactions.length}
              icon="💳"
              color="#ff9800"
            />
            <WidgetCard
              title="Active Goals"
              value="0"
              icon="🎯"
              color="#9c27b0"
            />
          </div>

          {/* Recent Transactions */}
          <div className="dashboard-section">
            <h2>Recent Transactions</h2>
            {recentTransactions.length === 0 ? (
              <div className="empty-state">
                <p>No transactions yet. Start by adding an account and making your first transaction!</p>
              </div>
            ) : (
              <div className="transaction-list">
                {recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="transaction-item">
                    <div className="transaction-info">
                      <div className="transaction-type-badge"
                        style={{ backgroundColor: getTypeColor(transaction.type) }}>
                        {transaction.type}
                      </div>
                      <div className="transaction-details">
                        <span className="transaction-category">
                          {transaction.category}
                        </span>
                        <span className="transaction-date">
                          {formatDate(transaction.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="transaction-amount"
                      style={{ color: getTypeColor(transaction.type) }}>
                      {transaction.type === 'deposit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
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

export default Dashboard;
