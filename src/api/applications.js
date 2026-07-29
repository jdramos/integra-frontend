import api from "./axios";

export const updateApplicationStatus = async (id, status) => {
  const res = await api.patch(`/applications/${id}/status`, { status });
  return res.data;
};