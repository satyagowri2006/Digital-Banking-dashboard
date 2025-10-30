import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  calculateEMI, 
  getLoans, 
  createLoan, 
  makePayment, 
  updateLoanStatus,
  deleteLoan 
} from '../api/loanApi';
import { setLoans, addLoan, updateLoanState, removeLoan } from '../state/loanSlice';
import './Pages.css';

const Loans = () => {
  const dispatch = useDispatch();
  const { loans } = useSelector((state) => state.loan);
  
  const [activeTab, setActiveTab] = useState('calculator'); // calculator, apply, myloans
  const [calculatorData, setCalculatorData] = useState({
    amount: '',
    interestRate: '',
    tenure: '',
  });
  const [emiResult, setEmiResult] = useState(null);
  
  const [loanForm, setLoanForm] = useState({
    loanType: 'personal',
    amount: '',
    interestRate: '',
    tenure: '',
    description: '',
  });
  
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const data = await getLoans();
      dispatch(setLoans(data));
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const handleCalculate = async () => {
    if (!calculatorData.amount || !calculatorData.interestRate || !calculatorData.tenure) {
      alert('Please fill all fields');
      return;
    }
    
    try {
      const result = await calculateEMI(calculatorData);
      setEmiResult(result);
    } catch (error) {
      console.error('Error calculating EMI:', error);
      alert('Failed to calculate EMI');
    }
  };

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newLoan = await createLoan({
        ...loanForm,
        amount: parseFloat(loanForm.amount),
        interestRate: parseFloat(loanForm.interestRate),
        tenure: parseInt(loanForm.tenure),
      });
      dispatch(addLoan(newLoan));
      setLoanForm({
        loanType: 'personal',
        amount: '',
        interestRate: '',
        tenure: '',
        description: '',
      });
      setActiveTab('myloans');
      alert('Loan application submitted successfully!');
    } catch (error) {
      console.error('Error applying for loan:', error);
      alert('Failed to apply for loan');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (loanId) => {
    if (!paymentAmount || paymentAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    
    try {
      const updatedLoan = await makePayment(loanId, parseFloat(paymentAmount), 'online');
      dispatch(updateLoanState(updatedLoan));
      setPaymentModal(null);
      setPaymentAmount('');
      
      if (updatedLoan.status === 'completed') {
        alert('🎉 Congratulations! Loan fully paid!');
      } else {
        alert('Payment successful!');
      }
    } catch (error) {
      console.error('Error making payment:', error);
      alert('Payment failed');
    }
  };

  const handleStatusChange = async (loanId, newStatus) => {
    try {
      const updatedLoan = await updateLoanStatus(loanId, newStatus);
      dispatch(updateLoanState(updatedLoan));
      alert(`Loan ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating loan status:', error);
      alert('Failed to update loan status');
    }
  };

  const handleDelete = async (loanId) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        await deleteLoan(loanId);
        dispatch(removeLoan(loanId));
        alert('Loan deleted successfully');
      } catch (error) {
        console.error('Error deleting loan:', error);
        alert('Failed to delete loan');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'active': return '#2196f3';
      case 'pending': return '#ff9800';
      case 'completed': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#999';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-content">
          <h1>Loan Management</h1>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
            <button 
              className={activeTab === 'calculator' ? 'tab-active' : 'tab'}
              onClick={() => setActiveTab('calculator')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: activeTab === 'calculator' ? '#2196f3' : 'transparent',
                color: activeTab === 'calculator' ? 'white' : '#666',
                cursor: 'pointer',
                borderRadius: '4px 4px 0 0'
              }}
            >
              EMI Calculator
            </button>
            <button 
              className={activeTab === 'apply' ? 'tab-active' : 'tab'}
              onClick={() => setActiveTab('apply')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: activeTab === 'apply' ? '#2196f3' : 'transparent',
                color: activeTab === 'apply' ? 'white' : '#666',
                cursor: 'pointer',
                borderRadius: '4px 4px 0 0'
              }}
            >
              Apply for Loan
            </button>
            <button 
              className={activeTab === 'myloans' ? 'tab-active' : 'tab'}
              onClick={() => setActiveTab('myloans')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: activeTab === 'myloans' ? '#2196f3' : 'transparent',
                color: activeTab === 'myloans' ? 'white' : '#666',
                cursor: 'pointer',
                borderRadius: '4px 4px 0 0'
              }}
            >
              My Loans ({loans.length})
            </button>
          </div>

          {/* EMI Calculator Tab */}
          {activeTab === 'calculator' && (
            <div className="card" style={{ padding: '30px', maxWidth: '600px' }}>
              <h2>EMI Calculator</h2>
              <div className="form-group">
                <label>Loan Amount (₹)</label>
                <input
                  type="number"
                  value={calculatorData.amount}
                  onChange={(e) => setCalculatorData({ ...calculatorData, amount: e.target.value })}
                  className="form-control"
                  placeholder="e.g., 500000"
                />
              </div>
              <div className="form-group">
                <label>Interest Rate (% per annum)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calculatorData.interestRate}
                  onChange={(e) => setCalculatorData({ ...calculatorData, interestRate: e.target.value })}
                  className="form-control"
                  placeholder="e.g., 10.5"
                />
              </div>
              <div className="form-group">
                <label>Loan Tenure (months)</label>
                <input
                  type="number"
                  value={calculatorData.tenure}
                  onChange={(e) => setCalculatorData({ ...calculatorData, tenure: e.target.value })}
                  className="form-control"
                  placeholder="e.g., 24"
                />
              </div>
              <button className="btn-primary" onClick={handleCalculate}>
                Calculate EMI
              </button>

              {emiResult && (
                <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                  <h3>EMI Breakdown</h3>
                  <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
                    <div>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Monthly EMI</p>
                      <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
                        ₹{emiResult.emi.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Total Amount Payable</p>
                      <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                        ₹{emiResult.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Total Interest</p>
                      <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#f44336' }}>
                        ₹{emiResult.totalInterest.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Principal Amount</p>
                      <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                        ₹{emiResult.principal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Apply for Loan Tab */}
          {activeTab === 'apply' && (
            <div className="card" style={{ padding: '30px', maxWidth: '600px' }}>
              <h2>Apply for Loan</h2>
              <form onSubmit={handleApplyLoan}>
                <div className="form-group">
                  <label>Loan Type</label>
                  <select
                    value={loanForm.loanType}
                    onChange={(e) => setLoanForm({ ...loanForm, loanType: e.target.value })}
                    className="form-control"
                  >
                    <option value="personal">Personal Loan</option>
                    <option value="home">Home Loan</option>
                    <option value="car">Car Loan</option>
                    <option value="education">Education Loan</option>
                    <option value="business">Business Loan</option>
                    <option value="gold">Gold Loan</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={loanForm.amount}
                    onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Interest Rate (% per annum)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={loanForm.interestRate}
                    onChange={(e) => setLoanForm({ ...loanForm, interestRate: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tenure (months)</label>
                  <input
                    type="number"
                    value={loanForm.tenure}
                    onChange={(e) => setLoanForm({ ...loanForm, tenure: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Purpose / Description</label>
                  <textarea
                    value={loanForm.description}
                    onChange={(e) => setLoanForm({ ...loanForm, description: e.target.value })}
                    className="form-control"
                    rows="3"
                    placeholder="Describe the purpose of this loan..."
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          )}

          {/* My Loans Tab */}
          {activeTab === 'myloans' && (
            <div>
              {loans.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                  <p>No loans yet. Apply for your first loan!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {loans.map((loan) => {
                    const progress = ((loan.paidAmount / loan.amount) * 100).toFixed(1);
                    
                    return (
                      <div key={loan._id} className="card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <h3 style={{ margin: '0 0 10px 0', textTransform: 'capitalize' }}>
                              {loan.loanType} Loan
                            </h3>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              color: 'white',
                              backgroundColor: getStatusColor(loan.status),
                              textTransform: 'uppercase'
                            }}>
                              {loan.status}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleDelete(loan._id)}
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

                        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Loan Amount</p>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                              ₹{loan.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Monthly EMI</p>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#2196f3' }}>
                              ₹{loan.emi.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Interest Rate</p>
                            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                              {loan.interestRate}% p.a.
                            </p>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Tenure</p>
                            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                              {loan.tenure} months
                            </p>
                          </div>
                        </div>

                        <div style={{ marginTop: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontSize: '14px', color: '#666' }}>Paid</span>
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                              ₹{loan.paidAmount.toLocaleString()} / ₹{loan.amount.toLocaleString()}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${progress}%`,
                              height: '100%',
                              backgroundColor: loan.status === 'completed' ? '#4caf50' : '#2196f3',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            {progress}% Complete
                          </p>
                        </div>

                        {loan.description && (
                          <p style={{ fontSize: '14px', color: '#666', marginTop: '15px', fontStyle: 'italic' }}>
                            "{loan.description}"
                          </p>
                        )}

                        {loan.nextPaymentDate && loan.status === 'active' && (
                          <p style={{ fontSize: '12px', color: '#ff9800', marginTop: '10px' }}>
                            Next Payment: {formatDate(loan.nextPaymentDate)}
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                          {loan.status === 'pending' && (
                            <>
                              <button 
                                className="btn-primary" 
                                onClick={() => handleStatusChange(loan._id, 'approved')}
                                style={{ flex: 1, background: '#4caf50' }}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn-primary" 
                                onClick={() => handleStatusChange(loan._id, 'rejected')}
                                style={{ flex: 1, background: '#f44336' }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          {loan.status === 'approved' && (
                            <button 
                              className="btn-primary" 
                              onClick={() => handleStatusChange(loan._id, 'active')}
                              style={{ flex: 1 }}
                            >
                              Activate Loan
                            </button>
                          )}
                          
                          {loan.status === 'active' && (
                            <button 
                              className="btn-primary" 
                              onClick={() => setPaymentModal(loan._id)}
                              style={{ flex: 1 }}
                            >
                              Make Payment
                            </button>
                          )}
                        </div>

                        {/* Payment History */}
                        {loan.paymentHistory && loan.paymentHistory.length > 0 && (
                          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Payment History</h4>
                            {loan.paymentHistory.slice(-3).reverse().map((payment, index) => (
                              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                                <span style={{ fontSize: '12px', color: '#666' }}>
                                  {formatDate(payment.date)}
                                </span>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#4caf50' }}>
                                  ₹{payment.amount.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Payment Modal */}
          {paymentModal && (
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
                <h3>Make EMI Payment</h3>
                <div className="form-group">
                  <label>Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="form-control"
                    placeholder="Enter amount"
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn-primary" 
                    onClick={() => handlePayment(paymentModal)}
                    style={{ flex: 1 }}
                  >
                    Pay Now
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={() => {
                      setPaymentModal(null);
                      setPaymentAmount('');
                    }}
                    style={{ flex: 1, background: '#999' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Loans;
