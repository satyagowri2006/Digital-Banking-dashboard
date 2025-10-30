import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getGoals, createGoal, contributeToGoal, deleteGoal } from '../api/goalApi';
import { setGoals, addGoal, updateGoalState, removeGoal } from '../state/goalSlice';
import './Pages.css';

const Goals = () => {
  const dispatch = useDispatch();
  const { goals } = useSelector((state) => state.goal);
  const [showForm, setShowForm] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    description: '',
    category: 'savings',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await getGoals();
      dispatch(setGoals(data));
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newGoal = await createGoal({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
      });
      dispatch(addGoal(newGoal));
      setShowForm(false);
      setFormData({
        title: '',
        targetAmount: '',
        deadline: '',
        description: '',
        category: 'savings',
      });
      alert('Goal created successfully!');
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (goalId) => {
    if (!contributionAmount || contributionAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    try {
      const updatedGoal = await contributeToGoal(goalId, parseFloat(contributionAmount));
      dispatch(updateGoalState(updatedGoal));
      setShowContributeModal(null);
      setContributionAmount('');
      if (updatedGoal.status === 'completed') {
        alert('🎉 Congratulations! Goal completed!');
      } else {
        alert('Contribution added successfully!');
      }
    } catch (error) {
      console.error('Error contributing to goal:', error);
      alert('Failed to add contribution');
    }
  };

  const handleDelete = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(goalId);
        dispatch(removeGoal(goalId));
        alert('Goal deleted successfully');
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateProgress = (goal) => {
    return Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysLeft = (deadline) => {
    const today = new Date();
    const end = new Date(deadline);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'active': return '#2196f3';
      case 'paused': return '#ff9800';
      default: return '#999';
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1>Financial Goals</h1>
            <button 
              className="btn-primary" 
              onClick={() => setShowForm(!showForm)}
              style={{ padding: '10px 20px' }}
            >
              {showForm ? 'Cancel' : '+ Create Goal'}
            </button>
          </div>

          {/* Create Goal Form */}
          {showForm && (
            <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
              <h3>Create New Goal</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Goal Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., Buy a Car"
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
                    <option value="savings">Savings</option>
                    <option value="investment">Investment</option>
                    <option value="purchase">Purchase</option>
                    <option value="education">Education</option>
                    <option value="travel">Travel</option>
                    <option value="emergency">Emergency Fund</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Amount (₹)</label>
                  <input
                    type="number"
                    name="targetAmount"
                    value={formData.targetAmount}
                    onChange={handleChange}
                    className="form-control"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    placeholder="Add notes about this goal..."
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Goal'}
                </button>
              </form>
            </div>
          )}

          {/* Goals Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {goals.length === 0 ? (
              <p>No goals yet. Create your first financial goal!</p>
            ) : (
              goals.map((goal) => {
                const progress = calculateProgress(goal);
                const daysLeft = getDaysLeft(goal.deadline);

                return (
                  <div key={goal._id} className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ margin: '0 0 5px 0' }}>{goal.title}</h3>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: 'white',
                          backgroundColor: getStatusColor(goal.status),
                          textTransform: 'uppercase'
                        }}>
                          {goal.status}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDelete(goal._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f44336',
                          cursor: 'pointer',
                          fontSize: '20px'
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', textTransform: 'capitalize' }}>
                      {goal.category}
                    </p>

                    <div style={{ marginTop: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontWeight: 'bold' }}>₹{goal.savedAmount.toLocaleString()}</span>
                        <span style={{ color: '#666' }}>₹{goal.targetAmount.toLocaleString()}</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${progress}%`,
                          height: '100%',
                          backgroundColor: goal.status === 'completed' ? '#4caf50' : '#2196f3',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                        {progress.toFixed(1)}% Complete
                      </p>
                    </div>

                    {goal.description && (
                      <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                        {goal.description}
                      </p>
                    )}

                    <p style={{ fontSize: '12px', color: daysLeft < 0 ? '#f44336' : '#666', marginTop: '10px' }}>
                      {daysLeft < 0 
                        ? `Overdue by ${Math.abs(daysLeft)} days` 
                        : daysLeft === 0 
                        ? 'Deadline Today!' 
                        : `${daysLeft} days left`}
                    </p>

                    {goal.status !== 'completed' && (
                      <button 
                        className="btn-primary" 
                        style={{ width: '100%', marginTop: '15px' }}
                        onClick={() => setShowContributeModal(goal._id)}
                      >
                        Add Contribution
                      </button>
                    )}

                    {/* Contribute Modal */}
                    {showContributeModal === goal._id && (
                      <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                      }}>
                        <div className="card" style={{ padding: '30px', maxWidth: '400px', width: '90%' }}>
                          <h3>Add Contribution</h3>
                          <p>To: {goal.title}</p>
                          <div className="form-group">
                            <label>Amount (₹)</label>
                            <input
                              type="number"
                              value={contributionAmount}
                              onChange={(e) => setContributionAmount(e.target.value)}
                              className="form-control"
                              min="1"
                              placeholder="Enter amount"
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                              className="btn-primary" 
                              onClick={() => handleContribute(goal._id)}
                              style={{ flex: 1 }}
                            >
                              Contribute
                            </button>
                            <button 
                              className="btn-primary" 
                              onClick={() => {
                                setShowContributeModal(null);
                                setContributionAmount('');
                              }}
                              style={{ flex: 1, background: '#999' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Goals;
