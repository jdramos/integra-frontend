import api from "./axios";

export const getCompanyInterviews = async () => {
  const res = await api.get("/interviews/company");
  return res.data?.data || [];
};

export const getCandidateInterviews = async () => {
  const res = await api.get("/interviews/candidate");
  return res.data?.data || [];
};

export const createInterview = async (payload) => {
  const res = await api.post("/interviews", payload);
  return res.data;
};

export const updateInterview = async (id, payload) => {
  const res = await api.put(`/interviews/${id}`, payload);
  return res.data;
};

export const updateInterviewStatus = async (id, status) => {
  const res = await api.patch(`/interviews/${id}/status`, { status });
  return res.data;
};

export const deleteInterview = async (id) => {
  const res = await api.delete(`/interviews/${id}`);
  return res.data;
};