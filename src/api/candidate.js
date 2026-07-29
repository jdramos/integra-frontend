import api from './axios';

export const getMyProfile = async () => {
  const { data } = await api.get('/candidate/me');
  return data.data;
};

export const updateMyProfile = async (payload) => {
  const { data } = await api.put('/candidate/me', payload);
  return data.data;
};

export const getCandidateProfile = async (id) => {
  const res = await api.get(`/candidate/${id}/profile`);
  return res.data?.data || null;
};

export const getCandidateNotes = async (candidateId) => {
  const res = await api.get(`/candidates/${candidateId}/notes`);
  return res.data?.data || [];
};

export const createCandidateNote = async (candidateId, payload) => {
  const res = await api.post(
    `/candidates/${candidateId}/notes`,
    payload
  );

  return res.data?.data;
};

export const applyToJob = async (jobId) => {
  const res = await api.post(`/candidate/jobs/${jobId}/apply`);
  return res.data?.data || res.data;
};