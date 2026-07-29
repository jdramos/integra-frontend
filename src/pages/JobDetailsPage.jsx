import React, { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import BusinessIcon from "@mui/icons-material/Business";
import PlaceIcon from "@mui/icons-material/Place";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import PaidIcon from "@mui/icons-material/Paid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";

import { Link as RouterLink, useParams } from "react-router-dom";
import { applyToJob, getJobById } from "../api/jobs";
import useAuth from "../auth/AuthContext";

export default function JobDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getJobById(id);
      setJob(data);
      setAlreadyApplied(Boolean(data?.already_applied));
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la vacante.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setMessage("");
    setError("");

    try {
      setApplying(true);

      await applyToJob(id, {
        cover_letter: "Estoy interesado en esta vacante.",
      });

      setAlreadyApplied(true);
      setMessage("Postulación enviada correctamente.");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "No se pudo aplicar. Puede que ya hayas enviado una postulación."
      );
    } finally {
      setApplying(false);
    }
  };

  const salaryText = getSalaryText(job);

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
        <Typography mt={2} color="text.secondary">
          Cargando vacante...
        </Typography>
      </Stack>
    );
  }

  if (!job) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        No se encontró la vacante.
      </Alert>
    );
  }

  return (
    <Box>
      {message && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: { xs: 2.5, md: 4 },
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                mx: { xs: -2.5, md: -4 },
                mt: { xs: -2.5, md: -4 },
                mb: 3,
                p: { xs: 2.5, md: 4 },
                background: "linear-gradient(135deg, #0057B8 0%, #003E8A 100%)",
                color: "#fff",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar
                  sx={{
                    bgcolor: "#fff",
                    color: "primary.main",
                    width: 68,
                    height: 68,
                  }}
                >
                  <BusinessIcon fontSize="large" />
                </Avatar>

                <Box flex={1}>
                  <Typography variant="h4" fontWeight={900}>
                    {job.title}
                  </Typography>

                  <Typography variant="h6" sx={{ opacity: 0.92 }}>
                    {job.company_name || "Empresa"}
                  </Typography>

                  <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                    {job.location && (
                      <Chip
                        icon={<PlaceIcon />}
                        label={job.location}
                        sx={chipWhiteStyle}
                      />
                    )}

                    {job.modality && (
                      <Chip icon={<WorkIcon />} label={job.modality} sx={chipWhiteStyle} />
                    )}

                    {job.education_level && (
                      <Chip
                        icon={<SchoolIcon />}
                        label={job.education_level}
                        sx={chipWhiteStyle}
                      />
                    )}

                    {salaryText && (
                      <Chip icon={<PaidIcon />} label={salaryText} sx={chipWhiteStyle} />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Box>

            <Section title="Descripción">
              {job.description || "No se especificó descripción."}
            </Section>

            <Section title="Habilidades requeridas">
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {parseSkills(job.skills_required).length > 0 ? (
                  parseSkills(job.skills_required).map((skill) => (
                    <Chip key={skill} label={skill} color="primary" variant="outlined" />
                  ))
                ) : (
                  <Typography color="text.secondary">No especificadas.</Typography>
                )}
              </Stack>
            </Section>

            {job.requirements && (
              <Section title="Requisitos">
                {job.requirements}
              </Section>
            )}

            {job.benefits && (
              <Section title="Beneficios">
                {job.benefits}
              </Section>
            )}

            <Divider sx={{ my: 3 }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {user?.role === "CANDIDATE" ? (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SendIcon />}
                  onClick={handleApply}
                  disabled={applying || alreadyApplied}
                >
                  {alreadyApplied
                    ? "Ya aplicaste"
                    : applying
                    ? "Enviando..."
                    : "Aplicar gratis"}
                </Button>
              ) : !user ? (
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/login"
                >
                  Iniciar sesión para aplicar
                </Button>
              ) : null}

              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackIcon />}
                component={RouterLink}
                to="/jobs"
              >
                Volver
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4, mb: 3 }}>
            <Typography variant="h6" fontWeight={900}>
              Acerca de la empresa
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center" mt={2}>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <BusinessIcon />
              </Avatar>

              <Box>
                <Typography fontWeight={900}>
                  {job.company_name || "Empresa"}
                </Typography>
                <Typography color="text.secondary" fontSize={13}>
                  Empresa registrada
                </Typography>
              </Box>
            </Stack>

            <Typography color="text.secondary" mt={2}>
              {job.company_description || "Empresa registrada en Integra RH."}
            </Typography>

            {job.website && (
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                href={job.website}
                target="_blank"
                rel="noreferrer"
              >
                Sitio web
              </Button>
            )}
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={900}>
              Resumen de la vacante
            </Typography>

            <InfoRow label="Ubicación" value={job.location} />
            <InfoRow label="Modalidad" value={job.modality} />
            <InfoRow label="Tipo" value={job.job_type} />
            <InfoRow
              label="Experiencia"
              value={`${job.experience_years || 0}+ años`}
            />
            <InfoRow label="Escolaridad" value={job.education_level} />
            <InfoRow label="Salario" value={salaryText} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Box mt={4}>
      <Typography variant="h6" fontWeight={900} mb={1}>
        {title}
      </Typography>

      {typeof children === "string" ? (
        <Typography color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
          {children}
        </Typography>
      ) : (
        children
      )}
    </Box>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={2}
      sx={{ py: 1.3, borderBottom: "1px solid #eef2f7" }}
    >
      <Typography color="text.secondary" fontSize={14}>
        {label}
      </Typography>
      <Typography fontWeight={800} textAlign="right" fontSize={14}>
        {value}
      </Typography>
    </Stack>
  );
}

function parseSkills(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSalaryText(job) {
  if (!job) return "";

  const min = Number(job.salary_min || 0);
  const max = Number(job.salary_max || 0);

  if (min > 0 && max > 0) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min > 0) return `Desde $${min.toLocaleString()}`;
  if (max > 0) return `Hasta $${max.toLocaleString()}`;

  return "";
}

const chipWhiteStyle = {
  bgcolor: "rgba(255,255,255,0.16)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.25)",
  "& .MuiChip-icon": {
    color: "#fff",
  },
};