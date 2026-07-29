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

import CandidateFeedPage from './pages/candidate/CandidateFeedPage';
import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import CandidateApplicationsPage from './pages/candidate/CandidateApplicationsPage';
import CandidateLayout from "./layouts/CandidateLayout";
import CandidateJobsPage from "./pages/candidate/CandidateJobsPage";

import CompanyCandidateDetailPage from './pages/company/CompanyCandidateDetailPage';
import CompanyDashboardPage from './pages/company/CompanyDashboardPage';
import CompanyJobsPage from './pages/company/CompanyJobsPage';
import CompanyApplicantsPage from './pages/company/CompanyApplicantsPage';
import CompanyCandidatesPage from './pages/company/CompanyCandidatesPage';
import CompanyProfilePage from './pages/company/CompanyProfilePage';
import CompanySavedCandidatesPage from './pages/company/CompanySavedCandidatesPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './components/admin/users/AdminUsersPage';

import CompanyInterviewsPage from "./pages/company/CompanyInterviewsPage";
import CompanyPipelinePage from "./pages/company/CompanyPipelinePage";

import OAuthSuccessPage from "./pages/OAuthSuccessPage";

const COMPANY_ROLES = ['COMPANY', 'COMPANY_ADMIN'];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-candidate" element={<RegisterCandidatePage />} />
          <Route path="/register-company" element={<RegisterCompanyPage />} />

          <Route
            path="/feed"
            element={
              <ProtectedRoute roles={['CANDIDATE']}>
                <CandidateFeedPage />
              </ProtectedRoute>
            }
          />
          <Route path="/oauth-success" element={<OAuthSuccessPage />} />

          <Route path="/candidate" element={<CandidateLayout />}>
            <Route index element={<CandidateFeedPage />} />
            <Route path="profile" element={<CandidateProfilePage />} />
            <Route path="applications" element={<CandidateApplicationsPage />} />
          </Route>


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

          <Route path="/jobs" element={<CandidateJobsPage />} />

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

          <Route path="/company/interviews" element={<CompanyInterviewsPage />} />

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


          <Route
            path="/company/pipeline"
            element={<CompanyPipelinePage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />


        </Route>
      </Routes>
    </BrowserRouter>
  );
}