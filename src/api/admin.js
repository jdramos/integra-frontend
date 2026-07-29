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

export const getAdminPlansAll = async () => {
  const { data } = await api.get("/admin/plans");
  return data.data;
};

export const createAdminPlan = async (payload) => {
  const { data } = await api.post("/admin/plans", payload);
  return data.data;
};

export const updateAdminPlan = async (id, payload) => {
  const { data } = await api.put(`/admin/plans/${id}`, payload);
  return data.data;
};

export const deleteAdminPlan = async (id) => {
  const { data } = await api.delete(`/admin/plans/${id}`);
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

export const getAdminJobs = async (params = {}) => (await api.get("/admin/jobs", { params })).data.data || [];
export const createAdminJob = async (payload) => (await api.post("/admin/jobs", payload)).data.data;
export const updateAdminJob = async (id, payload) => (await api.put(`/admin/jobs/${id}`, payload)).data.data;
export const deleteAdminJob = async (id) => (await api.delete(`/admin/jobs/${id}`)).data.data;

export const getBillingInvoices = async () => (await api.get("/admin/billing/invoices")).data.data;
export const createManualInvoice = async (payload) => (await api.post("/admin/billing/invoices", payload)).data.data;
export const getBillingSummary = async () => (await api.get("/admin/billing/summary")).data.data;
export const markInvoicePaid = async (id, payload) => (await api.patch(`/admin/billing/invoices/${id}/pay`, payload)).data.data;
export const resendInvoiceNotice = async (id) => (await api.post(`/admin/billing/invoices/${id}/notice`)).data.data;
export const voidInvoice = async (id, reason) => (await api.patch(`/admin/billing/invoices/${id}/void`, { reason })).data.data;
export const runBillingReminders = async () => (await api.post('/admin/billing/reminders/run')).data.data;
export const getJobReports = async () => (await api.get('/admin/job-reports')).data.data || [];
export const updateJobReport = async (id,status) => (await api.patch(`/admin/job-reports/${id}`,{status})).data.data;
export const getAdminAuditLog = async (params = {}) => (await api.get('/admin/audit-log', { params })).data.data;
export const getAdminSystemStatus = async () => (await api.get('/admin/system-status')).data.data;

export const getAdminStaff = async () => (await api.get('/admin/staff')).data.data;
export const createAdminStaff = async (payload) => (await api.post('/admin/staff', payload)).data.data;
export const updateAdminStaff = async (id, payload) => (await api.put(`/admin/staff/${id}`, payload)).data.data;
export const updateAdminStaffStatus = async (id, active) => (await api.patch(`/admin/staff/${id}/status`, { active })).data.data;
