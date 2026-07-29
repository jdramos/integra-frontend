import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterCandidatePage from './pages/auth/RegisterCandidatePage';
import RegisterCompanyPage from './pages/auth/RegisterCompanyPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

const CandidateFeedPage = React.lazy(() => import('./pages/candidate/CandidateFeedPage'));
const CandidateApplicationsPage = React.lazy(() => import('./pages/candidate/CandidateApplicationsPage'));

const CompanyCandidateDetailPage = React.lazy(() => import('./pages/company/CompanyCandidateDetailPage'));
const CompanyDashboardPage = React.lazy(() => import('./pages/company/CompanyDashboardPage'));
const CompanyJobsPage = React.lazy(() => import('./pages/company/CompanyJobsPage'));
const CompanyApplicantsPage = React.lazy(() => import('./pages/company/CompanyApplicantsPage'));
const CompanyCandidatesPage = React.lazy(() => import('./pages/company/CompanyCandidatesPage'));
const CompanyProfilePage = React.lazy(() => import('./pages/company/CompanyProfilePage'));
const CompanySavedCandidatesPage = React.lazy(() => import('./pages/company/CompanySavedCandidatesPage'));
const PersonnelPayrollPage = React.lazy(() => import('./pages/company/PersonnelPayrollPage'));
const PersonnelModuleHomePage = React.lazy(() => import('./pages/company/PersonnelModuleHomePage'));
const PersonnelLeavePage = React.lazy(() => import('./pages/company/PersonnelLeavePage'));
const PersonnelPayrollRunsPage = React.lazy(() => import('./pages/company/PersonnelPayrollRunsPage'));
const PersonnelDocumentsPage = React.lazy(() => import('./pages/company/PersonnelDocumentsPage'));
const PersonnelAttendancePage = React.lazy(() => import('./pages/company/PersonnelAttendancePage'));
const PersonnelBenefitsPage = React.lazy(() => import('./pages/company/PersonnelBenefitsPage'));
const PersonnelSettlementsPage = React.lazy(() => import('./pages/company/PersonnelSettlementsPage'));
const PersonnelSettingsPage = React.lazy(() => import('./pages/company/PersonnelSettingsPage'));
const PersonnelReportsPage = React.lazy(() => import('./pages/company/PersonnelReportsPage'));

const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = React.lazy(() => import('./components/admin/users/AdminUsersPage'));
const AdminBillingPage = React.lazy(() => import('./pages/admin/AdminBillingPage'));
const AdminCatalogsPage = React.lazy(() => import('./pages/admin/AdminCatalogsPage'));
const AdminPlansPage = React.lazy(() => import('./pages/admin/AdminPlansPage'));
const AdminJobsPage = React.lazy(() => import('./pages/admin/AdminJobsPage'));
const AdminStaffPage = React.lazy(() => import('./pages/admin/AdminStaffPage'));
const AdminJobReportsPage = React.lazy(() => import('./pages/admin/AdminJobReportsPage'));
const AdminAuditLogPage = React.lazy(() => import('./pages/admin/AdminAuditLogPage'));
const AdminSystemStatusPage = React.lazy(() => import('./pages/admin/AdminSystemStatusPage'));

const CompanyInterviewsPage = React.lazy(() => import('./pages/company/CompanyInterviewsPage'));
const CompanyPipelinePage = React.lazy(() => import('./pages/company/CompanyPipelinePage'));

const CandidateProfilePage = React.lazy(() => import('./pages/candidate/CandidateProfile/index'));
const MessagesPage = React.lazy(() => import('./pages/messages/MessagesPage'));

import OAuthSuccessPage from "./pages/OAuthSuccessPage";
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
const AccountSettingsPage = React.lazy(() => import('./pages/AccountSettingsPage'));

const COMPANY_ROLES = ['COMPANY', 'COMPANY_ADMIN', 'COMPANY_USER'];
const PERSONNEL_ROLES = ['COMPANY', 'COMPANY_ADMIN'];

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <React.Suspense fallback={<div style={{padding:32,textAlign:'center'}}>Cargando...</div>}><Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-candidate" element={<RegisterCandidatePage />} />
          <Route path="/register-company" element={<RegisterCompanyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/account" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />

          <Route
            path="/feed"
            element={
              <ProtectedRoute roles={['CANDIDATE']}>
                <CandidateFeedPage />
              </ProtectedRoute>
            }
          />
          <Route path="/oauth-success" element={<OAuthSuccessPage />} />

          <Route
            path="/candidate/profile"
            element={
              <ProtectedRoute roles={['CANDIDATE']}>
                <CandidateProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/applications"
            element={
              <ProtectedRoute roles={['CANDIDATE']}>
                <CandidateApplicationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/messages"
            element={
              <ProtectedRoute roles={['CANDIDATE']}>
                <MessagesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company"
            element={
              <ProtectedRoute roles={COMPANY_ROLES}>
                <CompanyDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/jobs"
            element={
              <ProtectedRoute roles={COMPANY_ROLES}>
                <CompanyJobsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/interviews"
            element={
              <ProtectedRoute roles={COMPANY_ROLES}>
                <CompanyInterviewsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/jobs/:jobId/applicants"
            element={
              <ProtectedRoute roles={COMPANY_ROLES}>
                <CompanyApplicantsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/candidates"
            element={
              <ProtectedRoute roles={COMPANY_ROLES}>
                <CompanyCandidatesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/candidates/:id"
            element={
              <ProtectedRoute roles={COMPANY_ROLES}>
                <CompanyCandidateDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/profile"
            element={
              <ProtectedRoute roles={COMPANY_ROLES}>
                <CompanyProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/saved-candidates"
            element={
              <ProtectedRoute roles={COMPANY_ROLES}>
                <CompanySavedCandidatesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/messages"
            element={
              <ProtectedRoute roles={COMPANY_ROLES}>
                <MessagesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/personnel"
            element={
              <ProtectedRoute roles={PERSONNEL_ROLES} requiredModule="personnel_payroll_enabled">
                <PersonnelModuleHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/personnel/employees"
            element={
              <ProtectedRoute roles={PERSONNEL_ROLES} requiredModule="personnel_payroll_enabled">
                <PersonnelPayrollPage />
              </ProtectedRoute>
            }
          />
          <Route path="/company/personnel/leave" element={<ProtectedRoute roles={PERSONNEL_ROLES} requiredModule="personnel_payroll_enabled"><PersonnelLeavePage /></ProtectedRoute>} />
          <Route path="/company/personnel/payroll" element={<ProtectedRoute roles={PERSONNEL_ROLES} requiredModule="personnel_payroll_enabled"><PersonnelPayrollRunsPage /></ProtectedRoute>} />
          <Route path="/company/personnel/documents" element={<ProtectedRoute roles={PERSONNEL_ROLES} requiredModule="personnel_payroll_enabled"><PersonnelDocumentsPage /></ProtectedRoute>} />
          <Route path="/company/personnel/attendance" element={<ProtectedRoute roles={PERSONNEL_ROLES} requiredModule="personnel_payroll_enabled"><PersonnelAttendancePage /></ProtectedRoute>} />
          <Route path="/company/personnel/benefits" element={<ProtectedRoute roles={PERSONNEL_ROLES} requiredModule="personnel_payroll_enabled"><PersonnelBenefitsPage /></ProtectedRoute>} />
          <Route path="/company/personnel/settlements" element={<ProtectedRoute roles={PERSONNEL_ROLES} requiredModule="personnel_payroll_enabled"><PersonnelSettlementsPage /></ProtectedRoute>} />
          <Route path="/company/personnel/settings" element={<ProtectedRoute roles={PERSONNEL_ROLES} requiredModule="personnel_payroll_enabled"><PersonnelSettingsPage /></ProtectedRoute>} />
          <Route path="/company/personnel/reports" element={<ProtectedRoute roles={PERSONNEL_ROLES} requiredModule="personnel_payroll_enabled"><PersonnelReportsPage /></ProtectedRoute>} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/billing" element={<ProtectedRoute roles={['ADMIN']}><AdminBillingPage /></ProtectedRoute>} />
          <Route path="/admin/catalogs" element={<ProtectedRoute roles={['ADMIN']}><AdminCatalogsPage /></ProtectedRoute>} />
          <Route path="/admin/plans" element={<ProtectedRoute roles={['ADMIN']}><AdminPlansPage /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute roles={['ADMIN']}><AdminJobsPage /></ProtectedRoute>} />
          <Route path="/admin/staff" element={<ProtectedRoute roles={['ADMIN']}><AdminStaffPage /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={['ADMIN']}><AdminJobReportsPage /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute roles={['ADMIN']}><AdminAuditLogPage /></ProtectedRoute>} />
          <Route path="/admin/system" element={<ProtectedRoute roles={['ADMIN']}><AdminSystemStatusPage /></ProtectedRoute>} />


          <Route
            path="/company/pipeline"
            element={
              <ProtectedRoute roles={COMPANY_ROLES}>
                <CompanyPipelinePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />


        </Route>
      </Routes></React.Suspense>
    </BrowserRouter>
  );
}
