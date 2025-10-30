import API from './axiosConfig';

export const getUserProfile = async () => {
  const response = await API.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await API.put('/users/profile', userData);
  return response.data;
};
