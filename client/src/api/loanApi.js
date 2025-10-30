import API from './axiosConfig';

export const calculateEMI = async (data) => {
  const response = await API.post('/loans/calculate-emi', data);
  return response.data;
};

export const getLoans = async () => {
  const response = await API.get('/loans');
  return response.data;
};

export const createLoan = async (loanData) => {
  const response = await API.post('/loans', loanData);
  return response.data;
};

export const updateLoanStatus = async (id, status) => {
  const response = await API.put(`/loans/${id}/status`, { status });
  return response.data;
};

export const makePayment = async (id, amount, paymentMethod) => {
  const response = await API.post(`/loans/${id}/pay`, { amount, paymentMethod });
  return response.data;
};

export const getLoanById = async (id) => {
  const response = await API.get(`/loans/${id}`);
  return response.data;
};

export const deleteLoan = async (id) => {
  const response = await API.delete(`/loans/${id}`);
  return response.data;
};
