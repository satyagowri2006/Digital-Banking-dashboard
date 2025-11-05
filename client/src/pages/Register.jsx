import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/authApi';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '' 
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // ✅ Basic phone validation (10 digits only)
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be 10 digits');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      alert('✅ Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background UI same as Login */}
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

      {/* Register Card Overlay */}
      <div className="auth-overlay">
        <div className="auth-card">
          <div className="auth-logo">🏦</div>
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join us to manage your finances</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>👤 Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your name"
                className="auth-input"
              />
            </div>

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
              <label>📱 Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter 10-digit phone number"
                maxLength="10"
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
                minLength="6"
                placeholder="Create a password (min 6 characters)"
                className="auth-input"
              />
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <p className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
