import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getBudgets, createBudget, getBudgetProgress } from '../api/budgetApi';
import './Pages.css';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    limit: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    const data = await getBudgets();
    setBudgets(data);
  };

  const refreshBudget = async (id) => {
    const updated = await getBudgetProgress(id);
    setBudgets(budgets.map(b => (b._id === id ? updated : b)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const budget = await createBudget(formData);
    setBudgets([...budgets, budget]);
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-content">
          <h1>Budget Tracking</h1>
          
          <div className="card" style={{ padding: '20px' }}>
            <h3>Add New Budget</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="form-control"
                >
                  <option value="">Select Category</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="bills">Bills</option>
                  <option value="shopping">Shopping</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>
              <div className="form-group">
                <label>Limit (₹)</label>
                <input
                  type="number"
                  value={formData.limit}
                  onChange={(e) => setFormData({...formData, limit: e.target.value})}
                  className="form-control"
                />
              </div>
              <button type="submit" className="btn-primary">Add Budget</button>
            </form>
          </div>

          <h3 style={{ marginTop: '30px' }}>My Budgets</h3>
          <div className="budget-list">
            {budgets.map((b) => (
              <div key={b._id} className="card" style={{ margin: '10px 0', padding: '20px' }}>
                <h4>{b.category.toUpperCase()}</h4>
                <p>
                  ₹{b.spent?.toLocaleString() || 0} / ₹{b.limit.toLocaleString()} spent
                </p>
                <progress 
                  value={b.spent} 
                  max={b.limit} 
                  style={{ width: '100%' }}>
                </progress>
                <div>
                  <button className="btn-primary" style={{ marginTop: '10px' }}
                    onClick={() => refreshBudget(b._id)}>
                    Refresh Spending
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Budgets;
