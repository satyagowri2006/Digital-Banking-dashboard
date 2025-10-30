import API from './axiosConfig';

export const getFinancialSummary = async () => {
  const response = await API.get('/reports/summary');
  return response.data;
};

export const getSpendingByCategory = async (startDate, endDate) => {
  const response = await API.get('/reports/spending-by-category', {
    params: { startDate, endDate },
  });
  return response.data;
};

export const getMonthlyTrends = async (months = 6) => {
  const response = await API.get('/reports/monthly-trends', {
    params: { months },
  });
  return response.data;
};

export const getBudgetAnalysis = async () => {
  const response = await API.get('/reports/budget-analysis');
  return response.data;
};

export const getGoalsProgress = async () => {
  const response = await API.get('/reports/goals-progress');
  return response.data;
};

export const getRecentTransactions = async (limit = 10) => {
  const response = await API.get('/reports/recent-transactions', {
    params: { limit },
  });
  return response.data;
};

export const exportData = async (type) => {
  const response = await API.get('/reports/export', {
    params: { type },
  });
  return response.data;
};
