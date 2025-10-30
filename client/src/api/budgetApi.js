import API from './axiosConfig';

export const getBudgets = async () => {
  const res = await API.get('/budgets');
  return res.data;
};

export const createBudget = async (data) => {
  const res = await API.post('/budgets', data);
  return res.data;
};

export const getBudgetProgress = async (id) => {
  const res = await API.get(`/budgets/${id}/spent`);
  return res.data;
};
