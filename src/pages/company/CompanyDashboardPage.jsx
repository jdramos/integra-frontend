import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Alert,
} from "@mui/material";

import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import CompanyStatCard from "./components/CompanyStatCard";
import CandidateCard from "./components/CandidateCard";
import JobCard from "./components/JobCard";

import CompanyProfileTab from "./CompanyProfileTab";
import CompanyJobsTab from "./CompanyJobsTab";
import CandidateSearchTab from "./CandidateSearchTab";
import CandidateMatchingTab from "./CandidateMatchingTab";
import CompanyAnalyticsSummary from "./CompanyAnalyticsSummary";

import {
  getMyCompany,
  getMyJobs,
  searchCandidates,
} from "../../api/company";
import JobFormModal from "./components/JobFormModal";
import OnboardingChecklist from "../../components/common/OnboardingChecklist";

const primary = "#0057B8";
const primaryDark = "#003E8A";

export default function CompanyDashboardPage() {
  const [tab, setTab] = useState(0);

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openJobModal, setOpenJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [companyData, jobsData, candidatesData] = await Promise.all([
        getMyCompany(),
        getMyJobs(),
        searchCandidates({}),
      ]);

      setCompany(companyData || null);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setCandidates(Array.isArray(candidatesData) ? candidatesData : []);
    } catch (err) {
      console.error("ERROR cargando panel empresa:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "No se pudo cargar el panel de empresa"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const normalizedCandidates = useMemo(() => {
    return candidates.map((candidate) => ({
      id: candidate.id,
      name:
        candidate.name ||
        candidate.full_name ||
        candidate.candidate_name ||
        "Candidato",
      title:
        candidate.title ||
        candidate.profession ||
        candidate.position ||
        "Perfil profesional",
      location: candidate.location || candidate.city || "Sin ubicación",
      experience:
        candidate.experience ||
        candidate.years_experience ||
        candidate.experience_years ||
        0,
      education:
        candidate.education ||
        candidate.education_level ||
        candidate.schooling ||
        "No especificada",
      expectedSalary:
        candidate.expectedSalary ||
        candidate.expected_salary ||
        candidate.salary_expectation ||
        0,
      availability: candidate.availability || "No especificada",
      match:
        candidate.match ||
        candidate.match_score ||
        candidate.score ||
        candidate.compatibility ||
        0,
      risk: candidate.risk || candidate.risk_level || "Bajo",
    }));
  }, [candidates]);

const normalizedJobs = useMemo(() => {
  return jobs.map((job) => ({
    ...job,

    id: job.id,
    title: job.title || "Vacante",
    description: job.description || "",
    location: job.location || "",
    modality: job.modality || job.work_mode || "PRESENCIAL",

    salary_min: job.salary_min ?? "",
    salary_max: job.salary_max ?? "",
    experience_years: job.experience_years ?? "",
    education_level: job.education_level || "",
    skills_required: job.skills_required || "",
    professional_area: job.professional_area || "",
    experience_level: job.experience_level || "",
    job_type: job.job_type || "FULL_TIME",
    work_mode: job.work_mode || job.modality || "PRESENCIAL",
    availability_required: job.availability_required || "",
    languages_required: job.languages_required || "",

    requires_driver_license: Number(job.requires_driver_license || 0),
    requires_vehicle: Number(job.requires_vehicle || 0),
    requires_travel: Number(job.requires_travel || 0),
    allows_relocation: Number(job.allows_relocation || 0),

    status: job.status || "OPEN",
    applicants: job.applicants || job.applicants_count || 0,
    matched: job.matched || job.matched_count || 0,
    score: job.score || job.match_score || 0,
  }));
}, [jobs]);

  const stats = useMemo(() => {
    const openJobs = normalizedJobs.filter((j) => j.status === "OPEN").length;

    const totalApplicants = normalizedJobs.reduce(
      (sum, j) => sum + Number(j.applicants || 0),
      0
    );

    const bestCandidate =
      normalizedCandidates.length > 0
        ? Math.max(...normalizedCandidates.map((c) => Number(c.match || 0)))
        : 0;

    const avgJobScore =
      normalizedJobs.length > 0
        ? Math.round(
            normalizedJobs.reduce((sum, j) => sum + Number(j.score || 0), 0) /
              normalizedJobs.length
          )
        : 0;

    return {
      openJobs,
      totalApplicants,
      bestCandidate,
      avgJobScore,
    };
  }, [normalizedJobs, normalizedCandidates]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#F6F8FB",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">
            Cargando panel de empresa...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#F6F8FB", minHeight: "100vh" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 5,
          color: "white",
          background: `linear-gradient(135deg, ${primaryDark}, ${primary})`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={900}>
              Panel de empresa
            </Typography>

            <Typography sx={{ opacity: 0.9 }}>
              Gestiona tu perfil, vacantes, candidatos y compatibilidad laboral.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingJob(null);
                setOpenJobModal(true);
              }}
              sx={{
                bgcolor: "white",
                color: primaryDark,
                fontWeight: 800,
                "&:hover": { bgcolor: "#EEF4FF" },
              }}
            >
              Nueva vacante
            </Button>

            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.6)",
                fontWeight: 800,
              }}
              onClick={() => setTab(3)}
            >
              Buscar candidatos
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box mb={3}>
        <OnboardingChecklist
          title="Configura tu empresa"
          description="Completa estos pasos para generar confianza y comenzar a recibir candidatos."
          steps={[
            { label: "Completa ubicación, sitio web y descripción", complete: Boolean(company?.location && company?.website && company?.description), onClick: () => setTab(1) },
            { label: "Agrega el logotipo de la empresa", complete: Boolean(company?.logo_url), onClick: () => setTab(1) },
            { label: "Publica tu primera vacante", complete: jobs.length > 0, onClick: () => { setEditingJob(null); setOpenJobModal(true); } },
          ]}
        />
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <CompanyStatCard
            icon={<WorkIcon />}
            title="Vacantes activas"
            value={stats.openJobs}
            subtitle="Publicadas actualmente"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <CompanyStatCard
            icon={<PeopleIcon />}
            title="Postulaciones"
            value={stats.totalApplicants}
            subtitle="Candidatos recibidos"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <CompanyStatCard
            icon={<TrendingUpIcon />}
            title="Mejor candidato"
            value={`${stats.bestCandidate}%`}
            subtitle="Mayor compatibilidad"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <CompanyStatCard
            icon={<AssignmentTurnedInIcon />}
            title="Score vacantes"
            value={`${stats.avgJobScore}%`}
            subtitle="Promedio de ajuste"
          />
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid #E5EAF2",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: "1px solid #E5EAF2",
            "& .MuiTab-root": {
              fontWeight: 800,
              textTransform: "none",
            },
          }}
        >
          <Tab label="Resumen" />
          <Tab label="Perfil de empresa" />
          <Tab label="Vacantes" />
          <Tab label="Buscar candidatos" />
          <Tab label="Matching / KPIs" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" fontWeight={900} mb={2}>
                  Mejores candidatos sugeridos
                </Typography>

                <Stack spacing={2}>
                  {normalizedCandidates.length === 0 ? (
                    <Alert severity="info">
                      Todavía no hay candidatos sugeridos.
                    </Alert>
                  ) : (
                    normalizedCandidates.slice(0, 5).map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                      />
                    ))
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} md={5}>
                <Typography variant="h6" fontWeight={900} mb={2}>
                  Estado de vacantes
                </Typography>

                <Stack spacing={2}>
                  {normalizedJobs.length === 0 ? (
                    <Alert severity="info">
                      Todavía no has publicado vacantes.
                    </Alert>
                  ) : (
                    normalizedJobs.slice(0, 5).map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onEdit={(job) => {
                        setEditingJob(job);
                        setOpenJobModal(true);
                      }}
                      onApplicants={(job) => {
                        setTab(2);
                      }}
                    />
                    ))
                  )}
                </Stack>

                <Divider sx={{ my: 3 }} />

                {company && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "#EAF2FF", color: primary }}>
                      {company.name?.[0] || "E"}
                    </Avatar>

                    <Box>
                      <Typography fontWeight={900}>
                        {company.name || "Empresa"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {company.plan_name || company.plan || "Sin plan"} ·{" "}
                        {company.location || "Sin ubicación"}
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Grid>
            </Grid>
          )}

          {tab === 1 && company && (
            <CompanyProfileTab company={company} setCompany={setCompany} />
          )}

          {tab === 2 && (
            <CompanyJobsTab
              jobs={normalizedJobs}
              onReload={loadDashboard}
            />
          )}

          {tab === 3 && (
            <CandidateSearchTab
              candidates={normalizedCandidates}
              jobs={normalizedJobs}
            />
          )}

          {tab === 4 && (
            <CandidateMatchingTab
              candidates={normalizedCandidates}
              jobs={normalizedJobs}
            />
          )}

          <JobFormModal
          open={openJobModal}
          editingJob={editingJob}
          onClose={() => setOpenJobModal(false)}
          onSaved={loadDashboard}
        />

        </Box>
      </Paper>
    </Box>
  );
}
