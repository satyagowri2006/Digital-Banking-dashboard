import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../api/authApi';
import { setUser } from '../state/userSlice';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      dispatch(setUser(data));
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Blurred Dashboard Preview Background */}
      <div className="auth-background">
        <div className="preview-dashboard">
          <div className="preview-navbar">
            <div className="preview-brand">🏦 Banking Dashboard</div>
            <div className="preview-user">User Profile</div>
          </div>
          <div className="preview-content">
            <div className="preview-sidebar">
              <div className="preview-menu-item">📊 Dashboard</div>
              <div className="preview-menu-item">🏦 Accounts</div>
              <div className="preview-menu-item">💳 Transactions</div>
              <div className="preview-menu-item">💰 Budgets</div>
              <div className="preview-menu-item">🎯 Goals</div>
              <div className="preview-menu-item">🏠 Loans</div>
              <div className="preview-menu-item">📈 Reports</div>
            </div>
            <div className="preview-main">
              <h1>Dashboard Overview</h1>
              <div className="preview-widgets">
                <div className="preview-widget">
                  <div className="widget-title">Total Balance</div>
                  <div className="widget-value">₹1,24,500</div>
                </div>
                <div className="preview-widget">
                  <div className="widget-title">Accounts</div>
                  <div className="widget-value">3</div>
                </div>
                <div className="preview-widget">
                  <div className="widget-title">Transactions</div>
                  <div className="widget-value">45</div>
                </div>
                <div className="preview-widget">
                  <div className="widget-title">Active Goals</div>
                  <div className="widget-value">2</div>
                </div>
              </div>
              <div className="preview-chart">
                <div className="chart-placeholder">📊 Financial Analytics</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Card Overlay */}
      <div className="auth-overlay">
        <div className="auth-card">
          <div className="auth-logo">🏦</div>
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Login to access your banking dashboard</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>📧 Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="auth-input"
              />
            </div>
            <div className="form-group">
              <label>🔒 Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="auth-input"
              />
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>
          
          <p className="auth-link">
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
