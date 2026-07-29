import api from './axios';

export const getPublicJobs = async (params = {}) => {
  const { data } = await api.get('/jobs', { params });
  return data.data;
};

export const getJobById = async (id) => {
  const { data } = await api.get(`/jobs/${id}`);
  return data.data;
};

export const getMyJobs = async () => {
  const { data } = await api.get('/company/jobs');
  return data.data;
};

export const createJob = async (payload) => {
  const { data } = await api.post('/company/jobs', payload);
  return data.data;
};

export const updateJob = async (id, payload) => {
  const { data } = await api.put(`/jobs/${id}`, payload);
  return data?.data || data;
};

export const updateJobStatus = async (id, status) => {
  const { data } = await api.patch(`/company/jobs/${id}/status`, { status });
  return data.data;
};
export const repostJob = async (id, expires_at) => (await api.post(`/company/jobs/${id}/repost`, { expires_at })).data.data;

export const applyToJob = async (jobId, payload) => {
  const { data } = await api.post(`/candidate/jobs/${jobId}/apply`, payload);
  return data.data;
};

export const getMyApplications = async () => {
  const { data } = await api.get('/candidate/applications');
  return data.data;
};

export const getApplicantsByJob = async (jobId) => {
  const { data } = await api.get(`/company/jobs/${jobId}/applicants`);
  return data.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const { data } = await api.patch(`/company/applications/${applicationId}/status`, { status });
  return data.data;
};


export const getCompanyJobsList = async () => {
  const res = await api.get("/jobs/company/list");
  return res.data?.data || [];
};

export const getJobApplicantsForInterview = async (jobId) => {
  const res = await api.get(`/jobs/${jobId}/applicants`);
  return res.data?.data || [];
};

export const getJobPipeline = async (jobId) => {
  const res = await api.get(`/jobs/${jobId}/pipeline`);
  return res.data?.data || {};
};

export const getPipelineStats = async (jobId) => {
  const res = await api.get(`/jobs/${jobId}/pipeline-stats`);
  return res.data?.data || {};
};

export const getJobPipelineAnalytics = async (jobId) => {
  const res = await api.get(`/company/jobs/${jobId}/analytics/pipeline`);
  return res.data.data || [];
};
export const getSavedJobIds = async () => (await api.get('/candidate/saved-jobs')).data.data || [];
export const saveJob = async (jobId) => (await api.put(`/candidate/saved-jobs/${jobId}`)).data.data;
export const unsaveJob = async (jobId) => (await api.delete(`/candidate/saved-jobs/${jobId}`)).data.data;
export const reportJob = async (jobId,payload) => (await api.post(`/jobs/${jobId}/report`,payload)).data.data;

export const getApplicationHistory = async (applicationId) => {
  const res = await api.get(
    `/company/applications/${applicationId}/history`
  );

  return res.data.data || [];
};
