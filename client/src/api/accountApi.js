import API from './axiosConfig';

export const getAccounts = async () => {
  const response = await API.get('/accounts');
  return response.data;
};

export const createAccount = async (accountData) => {
  const response = await API.post('/accounts', accountData);
  return response.data;
};

export const getAccount = async (id) => {
  const response = await API.get(`/accounts/${id}`);
  return response.data;
};

export const updateAccount = async (id, accountData) => {
  const response = await API.put(`/accounts/${id}`, accountData);
  return response.data;
};

export const deleteAccount = async (id) => {
  const response = await API.delete(`/accounts/${id}`);
  return response.data;
};
