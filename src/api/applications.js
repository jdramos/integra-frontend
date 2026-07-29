import api from "./axios";

export const getApplicationsByJob = async (jobId) => {
  const res = await api.get(`/company/jobs/${jobId}/applications`);
  return res.data?.data || res.data;
};

export const updateApplicationStatus = async (id, status) => {
  const res = await api.patch(`/applications/${id}/status`, { status });
  return res.data;
};