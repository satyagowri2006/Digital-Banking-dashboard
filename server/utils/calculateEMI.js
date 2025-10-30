/**
 * Calculate EMI (Equated Monthly Installment)
 * Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
 * P = Principal loan amount
 * R = Monthly interest rate
 * N = Loan tenure in months
 */

const calculateEMI = (principal, annualRate, months) => {
  const monthlyRate = annualRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
              (Math.pow(1 + monthlyRate, months) - 1);
  
  const totalAmount = emi * months;
  const totalInterest = totalAmount - principal;
  
  return {
    emi: Math.round(emi),
    totalAmount: Math.round(totalAmount),
    totalInterest: Math.round(totalInterest),
  };
};

module.exports = calculateEMI;
