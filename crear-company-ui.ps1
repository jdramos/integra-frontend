$base = "src/pages/company"
$components = "$base/components"

New-Item -ItemType Directory -Force -Path $components | Out-Null

@'
import React from "react";
import { Chip } from "@mui/material";

export default function MatchChip({ value = 0 }) {
  const color = value >= 90 ? "success" : value >= 80 ? "primary" : "warning";

  return (
    <Chip
      size="small"
      color={color}
      label={`${value}% ajuste`}
      sx={{ fontWeight: 800 }}
    />
  );
}
'@ | Set-Content "$components/MatchChip.jsx" -Encoding UTF8

@'
import React from "react";
import { Avatar, Box, Paper, Stack, Typography } from "@mui/material";

const primary = "#0057B8";

export default function CompanyStatCard({ icon, title, value, subtitle }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: "1px solid #E5EAF2",
        height: "100%",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: "#EAF2FF", color: primary }}>
          {icon}
        </Avatar>

        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>

          <Typography variant="h5" fontWeight={900}>
            {value}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
'@ | Set-Content "$components/CompanyStatCard.jsx" -Encoding UTF8

@'
import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import MatchChip from "./MatchChip";

const primary = "#0057B8";

export default function CandidateCard({ candidate, compact = false, onView }) {
  const Wrapper = compact ? Paper : Card;

  return (
    <Wrapper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #E5EAF2",
      }}
    >
      <CardContent component={compact ? Box : undefined}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" spacing={2}>
            <Avatar sx={{ bgcolor: "#EAF2FF", color: primary }}>
              {candidate.name?.[0] || "C"}
            </Avatar>

            <Box>
              <Typography fontWeight={900}>{candidate.name}</Typography>

              <Typography variant="body2" color="text.secondary">
                {candidate.title} · {candidate.location}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {candidate.experience} años experiencia · {candidate.education} · C${" "}
                {Number(candidate.expectedSalary || 0).toLocaleString()}
              </Typography>
            </Box>
          </Stack>

          <Stack alignItems={{ xs: "flex-start", md: "flex-end" }}>
            <MatchChip value={candidate.match} />

            {candidate.risk && (
              <Typography variant="caption" color="text.secondary">
                Riesgo: {candidate.risk}
              </Typography>
            )}

            {onView && (
              <Button size="small" sx={{ mt: 1 }} onClick={() => onView(candidate)}>
                Ver perfil
              </Button>
            )}
          </Stack>
        </Stack>

        {!compact && (
          <Box mt={2}>
            <LinearProgress
              variant="determinate"
              value={candidate.match || 0}
              sx={{ height: 8, borderRadius: 999 }}
            />
          </Box>
        )}
      </CardContent>
    </Wrapper>
  );
}
'@ | Set-Content "$components/CandidateCard.jsx" -Encoding UTF8

@'
import React from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import MatchChip from "./MatchChip";

export default function JobCard({ job, onEdit, onApplicants }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid #E5EAF2",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography fontWeight={900}>{job.title}</Typography>

            <Chip
              size="small"
              label={job.status === "OPEN" ? "Abierta" : "Cerrada"}
              color={job.status === "OPEN" ? "success" : "default"}
              sx={{ fontWeight: 800 }}
            />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {job.location} · {job.modality}
          </Typography>

          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            <Chip size="small" label={`${job.applicants || 0} postulantes`} />
            <Chip size="small" label={`${job.matched || 0} compatibles`} />
            <MatchChip value={job.score || 0} />
          </Stack>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => onApplicants?.(job)}>
            Ver postulantes
          </Button>

          <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit?.(job)}>
            Editar
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
'@ | Set-Content "$components/JobCard.jsx" -Encoding UTF8

@'
import React from "react";
import { Button, Grid, Stack, TextField, Typography, Chip } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";

const primary = "#0057B8";

export default function CompanyProfileTab({ company, setCompany }) {
  const setValue = (field, value) => {
    setCompany((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <BusinessIcon sx={{ color: primary }} />
        <Typography variant="h6" fontWeight={900}>
          Información de la empresa
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" label="Nombre comercial" value={company.name || ""} onChange={(e) => setValue("name", e.target.value)} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" label="Industria" value={company.industry || ""} onChange={(e) => setValue("industry", e.target.value)} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" label="Ubicación" value={company.location || ""} onChange={(e) => setValue("location", e.target.value)} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" label="Sitio web" value={company.website || ""} onChange={(e) => setValue("website", e.target.value)} />
        </Grid>

        <Grid item xs={12}>
          <TextField fullWidth multiline minRows={4} label="Descripción" value={company.description || ""} onChange={(e) => setValue("description", e.target.value)} />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1} mt={3}>
        <Button variant="contained" sx={{ bgcolor: primary }}>
          Guardar cambios
        </Button>

        <Chip label={company.plan || "Plan actual"} color="primary" />

        <Chip
          label={company.status === "ACTIVE" ? "Activa" : "Inactiva"}
          color={company.status === "ACTIVE" ? "success" : "default"}
        />
      </Stack>
    </>
  );
}
'@ | Set-Content "$base/CompanyProfileTab.jsx" -Encoding UTF8

@'
import React from "react";
import { Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import JobCard from "./components/JobCard";

const primary = "#0057B8";

export default function CompanyJobsTab({ jobs = [] }) {
  return (
    <>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
        mb={2}
      >
        <Typography variant="h6" fontWeight={900}>
          Vacantes publicadas
        </Typography>

        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: primary }}>
          Agregar vacante
        </Button>
      </Stack>

      <Stack spacing={2}>
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </Stack>
    </>
  );
}
'@ | Set-Content "$base/CompanyJobsTab.jsx" -Encoding UTF8

@'
import React, { useMemo, useState } from "react";
import { Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import CandidateCard from "./components/CandidateCard";

export default function CandidateSearchTab({ candidates = [] }) {
  const [filters, setFilters] = useState({
    location: "",
    education: "",
    minExperience: "",
  });

  const setFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const byLocation = filters.location
        ? c.location?.toLowerCase().includes(filters.location.toLowerCase())
        : true;

      const byEducation = filters.education
        ? c.education === filters.education
        : true;

      const byExperience = filters.minExperience
        ? Number(c.experience || 0) >= Number(filters.minExperience)
        : true;

      return byLocation && byEducation && byExperience;
    });
  }, [candidates, filters]);

  return (
    <>
      <Typography variant="h6" fontWeight={900} mb={2}>
        Buscar candidatos
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <TextField fullWidth size="small" label="Ubicación" value={filters.location} onChange={(e) => setFilter("location", e.target.value)} />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField select fullWidth size="small" label="Escolaridad" value={filters.education} onChange={(e) => setFilter("education", e.target.value)}>
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="Técnico">Técnico</MenuItem>
            <MenuItem value="Universidad">Universidad</MenuItem>
            <MenuItem value="Secundaria">Secundaria</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField fullWidth size="small" type="number" label="Experiencia mínima" value={filters.minExperience} onChange={(e) => setFilter("minExperience", e.target.value)} />
        </Grid>
      </Grid>

      <Stack spacing={2}>
        {filteredCandidates.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} compact onView={() => {}} />
        ))}
      </Stack>
    </>
  );
}
'@ | Set-Content "$base/CandidateSearchTab.jsx" -Encoding UTF8

@'
import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

const primary = "#0057B8";

export default function CandidateMatchingTab({ candidates = [] }) {
  return (
    <>
      <Typography variant="h6" fontWeight={900} mb={2}>
        Matching y KPIs de compatibilidad
      </Typography>

      <Grid container spacing={2}>
        {candidates.map((candidate) => (
          <Grid item xs={12} md={4} key={candidate.id}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid #E5EAF2",
                height: "100%",
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "#EAF2FF", color: primary }}>
                      {candidate.name?.[0] || "C"}
                    </Avatar>

                    <Box>
                      <Typography fontWeight={900}>{candidate.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {candidate.title}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Typography variant="body2">Compatibilidad general</Typography>

                  <LinearProgress
                    variant="determinate"
                    value={candidate.match || 0}
                    sx={{ height: 10, borderRadius: 999 }}
                  />

                  <Typography variant="h4" fontWeight={900}>
                    {candidate.match || 0}%
                  </Typography>

                  <Stack spacing={0.8}>
                    <Typography variant="body2">Experiencia: {candidate.experience} años</Typography>
                    <Typography variant="body2">Escolaridad: {candidate.education}</Typography>
                    <Typography variant="body2">Ubicación: {candidate.location}</Typography>
                    <Typography variant="body2">
                      Salario esperado: C$ {Number(candidate.expectedSalary || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">Riesgo: {candidate.risk}</Typography>
                  </Stack>

                  <Button variant="outlined" fullWidth>
                    Comparar con vacante
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
'@ | Set-Content "$base/CandidateMatchingTab.jsx" -Encoding UTF8

@'
import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
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

const primary = "#0057B8";
const primaryDark = "#003E8A";

const mockCompany = {
  name: "Comercial Ramos S.A.",
  industry: "Servicios financieros",
  location: "Managua, Nicaragua",
  website: "https://empresa.com",
  description: "Empresa enfocada en soluciones financieras, atención al cliente y crecimiento comercial.",
  plan: "Plan Profesional",
  status: "ACTIVE",
};

const mockJobs = [
  { id: 1, title: "Asesor de crédito", location: "Managua", modality: "Presencial", status: "OPEN", applicants: 38, matched: 12, score: 86 },
  { id: 2, title: "Ejecutivo comercial", location: "Masaya", modality: "Híbrido", status: "OPEN", applicants: 24, matched: 8, score: 79 },
  { id: 3, title: "Analista administrativo", location: "Granada", modality: "Presencial", status: "CLOSED", applicants: 17, matched: 4, score: 71 },
];

const mockCandidates = [
  { id: 1, name: "María López", title: "Asesora de crédito", location: "Managua", experience: 4, education: "Universidad", expectedSalary: 18000, availability: "Inmediata", match: 94, risk: "Bajo" },
  { id: 2, name: "Carlos Mendoza", title: "Ejecutivo de ventas", location: "Masaya", experience: 3, education: "Técnico", expectedSalary: 15000, availability: "15 días", match: 87, risk: "Medio" },
  { id: 3, name: "Ana Martínez", title: "Atención al cliente", location: "Managua", experience: 2, education: "Universidad", expectedSalary: 14000, availability: "Inmediata", match: 78, risk: "Bajo" },
];

export default function CompanyDashboardPage() {
  const [tab, setTab] = useState(0);
  const [company, setCompany] = useState(mockCompany);

  const stats = useMemo(() => {
    const openJobs = mockJobs.filter((j) => j.status === "OPEN").length;
    const totalApplicants = mockJobs.reduce((sum, j) => sum + Number(j.applicants || 0), 0);
    const bestCandidate = Math.max(...mockCandidates.map((c) => Number(c.match || 0)));
    const avgJobScore = Math.round(mockJobs.reduce((sum, j) => sum + Number(j.score || 0), 0) / mockJobs.length);

    return { openJobs, totalApplicants, bestCandidate, avgJobScore };
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#F6F8FB", minHeight: "100vh" }}>
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
            >
              Buscar candidatos
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <CompanyStatCard icon={<WorkIcon />} title="Vacantes activas" value={stats.openJobs} subtitle="Publicadas actualmente" />
        </Grid>

        <Grid item xs={12} md={3}>
          <CompanyStatCard icon={<PeopleIcon />} title="Postulaciones" value={stats.totalApplicants} subtitle="Candidatos recibidos" />
        </Grid>

        <Grid item xs={12} md={3}>
          <CompanyStatCard icon={<TrendingUpIcon />} title="Mejor candidato" value={`${stats.bestCandidate}%`} subtitle="Mayor compatibilidad" />
        </Grid>

        <Grid item xs={12} md={3}>
          <CompanyStatCard icon={<AssignmentTurnedInIcon />} title="Score vacantes" value={`${stats.avgJobScore}%`} subtitle="Promedio de ajuste" />
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
                  {mockCandidates.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12} md={5}>
                <Typography variant="h6" fontWeight={900} mb={2}>
                  Estado de vacantes
                </Typography>

                <Stack spacing={2}>
                  {mockJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "#EAF2FF", color: primary }}>
                    {company.name?.[0] || "E"}
                  </Avatar>

                  <Box>
                    <Typography fontWeight={900}>{company.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {company.plan} · {company.location}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          )}

          {tab === 1 && (
            <CompanyProfileTab company={company} setCompany={setCompany} />
          )}

          {tab === 2 && (
            <CompanyJobsTab jobs={mockJobs} />
          )}

          {tab === 3 && (
            <CandidateSearchTab candidates={mockCandidates} />
          )}

          {tab === 4 && (
            <CandidateMatchingTab candidates={mockCandidates} />
          )}
        </Box>
      </Paper>
    </Box>
  );
}
'@ | Set-Content "$base/CompanyDashboardPage.jsx" -Encoding UTF8

Write-Host "Archivos creados correctamente." -ForegroundColor Green