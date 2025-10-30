import React, { useState, useEffect } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  getFinancialSummary,
  getSpendingByCategory,
  getMonthlyTrends,
  getBudgetAnalysis,
  getGoalsProgress,
  exportData,
} from '../api/reportApi';
import './Pages.css';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState([]);
  const [goalsProgress, setGoalsProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [summaryRes, categoryRes, trendsRes, budgetRes, goalsRes] = await Promise.all([
        getFinancialSummary(),
        getSpendingByCategory(),
        getMonthlyTrends(6),
        getBudgetAnalysis(),
        getGoalsProgress(),
      ]);

      setSummary(summaryRes);
      setCategoryData(categoryRes);
      setTrendsData(trendsRes);
      setBudgetAnalysis(budgetRes);
      setGoalsProgress(goalsRes);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const data = await exportData(type);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  // Chart data configurations
  const categoryChartData = {
    labels: categoryData.map(c => c._id),
    datasets: [
      {
        label: 'Spending by Category',
        data: categoryData.map(c => c.total),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  const trendsChartData = {
    labels: trendsData.map(t => t.month),
    datasets: [
      {
        label: 'Income',
        data: trendsData.map(t => t.income),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Expense',
        data: trendsData.map(t => t.expense),
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const budgetChartData = {
    labels: budgetAnalysis.map(b => b.category),
    datasets: [
      {
        label: 'Budget',
        data: budgetAnalysis.map(b => b.budget),
        backgroundColor: '#2196f3',
      },
      {
        label: 'Spent',
        data: budgetAnalysis.map(b => b.spent),
        backgroundColor: '#ff9800',
      },
    ],
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="dashboard-container">
          <Sidebar />
          <main className="dashboard-content">
            <h1>Reports & Analytics</h1>
            <p>Loading data...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1>Reports & Analytics</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-primary" 
                onClick={() => handleExport('transactions')}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Export Transactions
              </button>
              <button 
                className="btn-primary" 
                onClick={fetchAllData}
                style={{ padding: '8px 16px', fontSize: '14px', background: '#4caf50' }}
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
            {['overview', 'spending', 'trends', 'budget', 'goals'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: activeTab === tab ? '#2196f3' : 'transparent',
                  color: activeTab === tab ? 'white' : '#666',
                  cursor: 'pointer',
                  borderRadius: '4px 4px 0 0',
                  textTransform: 'capitalize',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && summary && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Total Balance</p>
                  <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>
                    ₹{summary.totalBalance.toLocaleString()}
                  </p>
                </div>
                <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Total Income</p>
                  <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>
                    ₹{summary.totalIncome.toLocaleString()}
                  </p>
                </div>
                <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Total Expense</p>
                  <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>
                    ₹{summary.totalExpense.toLocaleString()}
                  </p>
                </div>
                <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Net Savings</p>
                  <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>
                    ₹{summary.netSavings.toLocaleString()}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Accounts</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
                    {summary.accountsCount}
                  </p>
                </div>
                <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Transactions</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
                    {summary.transactionsCount}
                  </p>
                </div>
                <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Active Goals</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
                    {summary.activeGoals}
                  </p>
                </div>
                <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Active Loans</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
                    {summary.activeLoansCount}
                  </p>
                </div>
                <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Monthly EMI</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>
                    ₹{summary.totalMonthlyEMI.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Spending Tab */}
          {activeTab === 'spending' && (
            <div className="card" style={{ padding: '30px' }}>
              <h2>Spending by Category</h2>
              {categoryData.length === 0 ? (
                <p>No spending data available</p>
              ) : (
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                  <Pie data={categoryChartData} />
                </div>
              )}
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="card" style={{ padding: '30px' }}>
              <h2>Income vs Expense Trends (Last 6 Months)</h2>
              {trendsData.length === 0 ? (
                <p>No trends data available</p>
              ) : (
                <Line data={trendsChartData} options={{ responsive: true, maintainAspectRatio: true }} />
              )}
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <div>
              <div className="card" style={{ padding: '30px', marginBottom: '20px' }}>
                <h2>Budget vs Actual Spending</h2>
                {budgetAnalysis.length === 0 ? (
                  <p>No budget data available</p>
                ) : (
                  <Bar data={budgetChartData} options={{ responsive: true }} />
                )}
              </div>

              <div style={{ display: 'grid', gap: '15px' }}>
                {budgetAnalysis.map((budget, index) => (
                  <div key={index} className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0, textTransform: 'capitalize' }}>{budget.category}</h4>
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                          ₹{budget.spent.toLocaleString()} / ₹{budget.budget.toLocaleString()}
                        </p>
                      </div>
                      <div style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        background: budget.status === 'good' ? '#4caf50' : budget.status === 'warning' ? '#ff9800' : '#f44336'
                      }}>
                        {budget.percentage}%
                      </div>
                    </div>
                    <div style={{ marginTop: '10px', width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(budget.percentage, 100)}%`,
                        height: '100%',
                        background: budget.status === 'good' ? '#4caf50' : budget.status === 'warning' ? '#ff9800' : '#f44336'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div style={{ display: 'grid', gap: '15px' }}>
              {goalsProgress.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                  <p>No goals data available</p>
                </div>
              ) : (
                goalsProgress.map((goal, index) => (
                  <div key={index} className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ margin: 0 }}>{goal.title}</h4>
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                          ₹{goal.savedAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                        </p>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: 'white',
                        background: goal.status === 'completed' ? '#4caf50' : '#2196f3',
                        textTransform: 'uppercase'
                      }}>
                        {goal.status}
                      </span>
                    </div>
                    <div style={{ marginTop: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>{goal.progress}% Complete</span>
                        <span style={{ fontSize: '14px', color: goal.daysLeft < 0 ? '#f44336' : '#666' }}>
                          {goal.daysLeft < 0 ? 'Overdue' : `${goal.daysLeft} days left`}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(goal.progress, 100)}%`,
                          height: '100%',
                          background: goal.status === 'completed' ? '#4caf50' : '#2196f3'
                        }} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Reports;
