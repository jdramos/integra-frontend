import api from './axios';

export const getMyCompany = async () => {
  const { data } = await api.get('/company/me');
  return data.data;
};

export const updateMyCompany = async (payload) => {
  const { data } = await api.put('/company/me', payload);
  return data.data;
};

// Vacantes empresa
export const getMyJobs = async () => {
  const { data } = await api.get('/company/jobs');
  return data.data;
};

export const createCompanyJob = async (payload) => {
  const { data } = await api.post('/company/jobs', payload);
  return data.data;
};

export const updateJobStatus = async (jobId, status) => {
  const { data } = await api.patch(`/company/jobs/${jobId}/status`, { status });
  return data.data;
};

// Postulantes por vacante
export const getJobApplicants = async (jobId) => {
  const { data } = await api.get(`/company/jobs/${jobId}/applicants`);
  return data.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const { data } = await api.patch(`/company/applications/${applicationId}/status`, {
    status,
  });
  return data.data;
};

// Candidatos
export const searchCandidates = async (params = {}) => {
  const { data } = await api.get('/company/candidates/search', { params });
  return data.data;
};

export const getCandidateByIdForCompany = async (id) => {
  const { data } = await api.get(`/company/candidates/${id}`);
  return data.data;
};

export const saveCandidateForCompany = async (id, payload = {}) => {
  const { data } = await api.post(`/company/candidates/${id}/save`, payload);
  return data.data;
};

export const unsaveCandidateForCompany = async (id) => {
  const { data } = await api.delete(`/company/candidates/${id}/save`);
  return data.data;
};


export const getSavedCandidatesForCompany = async () => {
  const { data } = await api.get('/company/saved-candidates');
  return data.data;
};


export const getPublicCompanies = async () => {
  const { data } = await api.get('/company/public');
  return data.data;
};

export const updateCompanyJob = async (jobId, payload) => {
  const { data } = await api.put(`/company/jobs/${jobId}`, payload);
  return data.data;
};

export const getCompanyAnalyticsSummary = async () => {
  const res = await api.get("/company/analytics/summary");
  return res.data.data || {};
};