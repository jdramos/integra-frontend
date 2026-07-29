import api from './axios';

export const getPersonnelOverview = async () => (await api.get('/personnel/overview')).data.data;
export const getPersonnelEmployees = async () => (await api.get('/personnel/employees')).data.data || [];
export const createPersonnelEmployee = async (payload) => (await api.post('/personnel/employees', payload)).data.data;
export const updatePersonnelEmployee = async (id, payload) => (await api.put(`/personnel/employees/${id}`, payload)).data.data;
export const getPersonnelLeaveRequests = async () => (await api.get('/personnel/leave-requests')).data.data || [];
export const getPersonnelLeaveBalances = async () => (await api.get('/personnel/leave-balances')).data.data || [];
export const createPersonnelLeaveRequest = async (payload) => (await api.post('/personnel/leave-requests', payload)).data.data;
export const reviewPersonnelLeaveRequest = async (id, status, notes = '') => (await api.patch(`/personnel/leave-requests/${id}/review`, { status, notes })).data.data;
export const getPersonnelPayrollRuns = async () => (await api.get('/personnel/payroll-runs')).data.data || [];
export const getPersonnelPayrollRun = async (id) => (await api.get(`/personnel/payroll-runs/${id}`)).data.data;
export const getPersonnelPayrollRunEvents = async (id) => (await api.get(`/personnel/payroll-runs/${id}/events`)).data.data || [];
export const createPersonnelPayrollRun = async (payload) => (await api.post('/personnel/payroll-runs', payload)).data.data;
export const approvePersonnelPayrollRun = async (id) => (await api.patch(`/personnel/payroll-runs/${id}/approve`)).data.data;
export const markPersonnelPayrollRunPaid = async (id, payload) => (await api.patch(`/personnel/payroll-runs/${id}/paid`, payload)).data.data;
export const voidPersonnelPayrollRun = async (id, reason) => (await api.patch(`/personnel/payroll-runs/${id}/void`, { reason })).data.data;
export const updatePersonnelPayrollItem = async (id, payload) => (await api.patch(`/personnel/payroll-items/${id}`, payload)).data.data;
export const getPersonnelPayrollMovements = async () => (await api.get('/personnel/payroll-movements')).data.data || [];
export const createPersonnelPayrollMovement = async (payload) => (await api.post('/personnel/payroll-movements', payload)).data.data;
export const cancelPersonnelPayrollMovement = async (id) => (await api.patch(`/personnel/payroll-movements/${id}/cancel`)).data.data;
export const getPersonnelDocuments = async () => (await api.get('/personnel/documents')).data.data || [];
export const createPersonnelDocument = async (formData) => (await api.post('/personnel/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data;
export const archivePersonnelDocument = async (id) => (await api.patch(`/personnel/documents/${id}/archive`)).data.data;
export const getPersonnelAttendance = async (params = {}) => (await api.get('/personnel/attendance', { params })).data.data || [];
export const getPersonnelAttendanceSummary = async (params = {}) => (await api.get('/personnel/attendance-summary', { params })).data.data || [];
export const savePersonnelAttendance = async (payload) => (await api.post('/personnel/attendance', payload)).data.data;
export const getPersonnelBenefitRuns = async () => (await api.get('/personnel/benefit-runs')).data.data || [];
export const getPersonnelBenefitRun = async (id) => (await api.get(`/personnel/benefit-runs/${id}`)).data.data;
export const createPersonnelThirteenthMonth = async (payload) => (await api.post('/personnel/benefit-runs/thirteenth-month', payload)).data.data;
export const approvePersonnelBenefitRun = async (id) => (await api.patch(`/personnel/benefit-runs/${id}/approve`)).data.data;
export const getPersonnelSettlements = async () => (await api.get('/personnel/settlements')).data.data || [];
export const createPersonnelSettlement = async (payload) => (await api.post('/personnel/settlements', payload)).data.data;
export const approvePersonnelSettlement = async (id) => (await api.patch(`/personnel/settlements/${id}/approve`)).data.data;
export const getPersonnelExchangeRates = async () => (await api.get('/personnel/exchange-rates')).data.data || [];
export const savePersonnelExchangeRate = async (payload) => (await api.post('/personnel/exchange-rates', payload)).data.data;
export const getPersonnelInssSettings = async () => (await api.get('/personnel/inss-settings')).data.data || [];
export const savePersonnelInssSetting = async (payload) => (await api.post('/personnel/inss-settings', payload)).data.data;
export const getPersonnelIrSettings = async () => (await api.get('/personnel/ir-settings')).data.data || [];
export const savePersonnelIrSetting = async (payload) => (await api.post('/personnel/ir-settings', payload)).data.data;
export const getPersonnelPayrollPolicy = async () => (await api.get('/personnel/payroll-policy')).data.data;
export const updatePersonnelPayrollPolicy = async (payload) => (await api.put('/personnel/payroll-policy', payload)).data.data;
export const getPersonnelPayrollReport = async (params = {}) => (await api.get('/personnel/reports/payroll', { params })).data.data;
export const getPersonnelPayrollReportItems = async (params = {}) => (await api.get('/personnel/reports/payroll/items', { params })).data.data || [];
export const getPersonnelPayrollObligations = async (params = {}) => (await api.get('/personnel/reports/payroll/obligations', { params })).data.data;
export const getPersonnelAnnualIrReconciliation = async (year) => (await api.get('/personnel/reports/ir-annual', { params: { year } })).data.data;
export const savePersonnelIrOpeningBalance = async (employeeId, payload) => (await api.put(`/personnel/reports/ir-annual/${employeeId}/opening-balance`, payload)).data.data;

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


export const getPublicCompanies = async (params = {}) => {
  const { data } = await api.get('/company/public', { params });
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

export const requestPlanUpgrade = async (payload = {}) => {
  const { data } = await api.post('/company/upgrade-request', payload);
  return data;
};

export const getPlans = async () => {
  const { data } = await api.get('/plans');
  return data.data || [];
};
