import API from './axiosConfig';

export const register = async (userData) => {
  const response = await API.post('/api/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await API.post('/api/auth/login', credentials);
  return response.data;
};

export const getMe = async () => {
  const response = await API.get('/api/auth/me');
  return response.data;
};
