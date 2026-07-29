import api from './axios';

export const loginRequest = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data.data;
};

export const registerCandidate = async (payload) => {
  const { data } = await api.post('/auth/register-candidate', payload);
  return data.data;
};

export const registerCompany = async (payload) => {
  const { data } = await api.post('/auth/register-company', payload);
  return data.data;
};
