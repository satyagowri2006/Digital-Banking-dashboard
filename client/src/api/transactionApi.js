import API from './axiosConfig';

export const getTransactions = async () => {
  const response = await API.get('/transactions');
  return response.data;
};

export const createTransaction = async (transactionData) => {
  const response = await API.post('/transactions', transactionData);
  return response.data;
};

export const getTransaction = async (id) => {
  const response = await API.get(`/transactions/${id}`);
  return response.data;
};
