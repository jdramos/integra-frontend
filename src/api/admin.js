import api from "./axios";

export const getAdminDashboard = async () => {
  const { data } = await api.get("/admin/dashboard");
  return data.data;
};

export const getAdminCompanies = async () => {
  const { data } = await api.get("/admin/companies");
  return data.data;
};

export const getAdminCompanyById = async (companyId) => {
  const { data } = await api.get(`/admin/companies/${companyId}`);
  return data.data;
};

export const createAdminCompany = async (payload) => {
  const { data } = await api.post("/admin/companies", payload);
  return data.data;
};

export const updateAdminCompany = async (companyId, payload) => {
  const { data } = await api.put(`/admin/companies/${companyId}`, payload);
  return data.data;
};

export const updateAdminCompanyStatus = async (
  companyId,
  status,
  reason = ""
) => {
  const { data } = await api.patch(`/admin/companies/${companyId}/status`, {
    status,
    reason,
  });

  return data.data;
};

export const getAdminPlans = async () => {
  const { data } = await api.get("/plans");
  return data.data;
};

export const getAdminCompanyUsers = async (companyId) => {
  const { data } = await api.get(`/admin/companies/${companyId}/users`);
  return data.data;
};

export const createAdminCompanyUser = async (companyId, payload) => {
  const { data } = await api.post(`/admin/companies/${companyId}/users`, payload);
  return data.data;
};

export const updateAdminCompanyUser = async (userId, payload) => {
  const { data } = await api.put(`/admin/company-users/${userId}`, payload);
  return data.data;
};

export const updateAdminCompanyUserStatus = async (userId, active) => {
  const { data } = await api.patch(`/admin/company-users/${userId}/status`, {
    active,
  });

  return data.data;
};