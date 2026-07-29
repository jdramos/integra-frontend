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

export const forgotPasswordRequest = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPasswordRequest = async (token, password) => {
  const { data } = await api.post('/auth/reset-password', { token, password });
  return data;
};

export const getSession = async () => (await api.get('/auth/me')).data.data;
export const logoutRequest = async () => (await api.post('/auth/logout')).data.data;
export const verifyEmailRequest = async (token) => (await api.post('/auth/verify-email', { token })).data;
export const resendVerificationRequest = async (email) => (await api.post('/auth/resend-verification', { email })).data;
export const changePasswordRequest = async (payload) => (await api.post('/auth/change-password', payload)).data;
export const deactivateAccountRequest = async (password) => (await api.post('/auth/account/deactivate', { password })).data;
export const exportAccountRequest = async () => (await api.get('/auth/account/export', { responseType: 'blob' })).data;
