import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import WorkIcon from "@mui/icons-material/Work";
import PlaceIcon from "@mui/icons-material/Place";
import BusinessIcon from "@mui/icons-material/Business";
import SendIcon from "@mui/icons-material/Send";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { Link as RouterLink } from "react-router-dom";
import { applyToJob, getPublicJobs } from "../../api/jobs";
import EmptyState from "../../components/common/EmptyState";

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getPublicJobs();
      setJobs(data || []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las vacantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const term = q.toLowerCase().trim();

    if (!term) return jobs;

    return jobs.filter((job) => {
      return (
        job.title?.toLowerCase().includes(term) ||
        job.company_name?.toLowerCase().includes(term) ||
        job.location?.toLowerCase().includes(term) ||
        job.modality?.toLowerCase().includes(term)
      );
    });
  }, [jobs, q]);

  const handleApply = async (jobId) => {
    try {
      setApplyingId(jobId);
      setMessage("");
      setError("");

      await applyToJob(jobId);

      setMessage("Postulación enviada correctamente.");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "No se pudo enviar la postulación. Puede que ya hayas aplicado."
      );
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, #0057B8 0%, #003E8A 100%)",
          color: "#fff",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={900}>
              Buscar empleos
            </Typography>
            <Typography sx={{ opacity: 0.9 }}>
              Explora vacantes disponibles y postúlate directamente desde tu panel.
            </Typography>
          </Box>

          <Chip
            label={`${filteredJobs.length} vacantes`}
            sx={{
              bgcolor: "#fff",
              color: "primary.main",
              fontWeight: 900,
              width: "fit-content",
            }}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 4 }}>
        <TextField
          fullWidth
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por puesto, empresa, ubicación o modalidad..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

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

      {loading ? (
        <Stack alignItems="center" py={8}>
          <CircularProgress />
          <Typography mt={2} color="text.secondary">
            Cargando vacantes...
          </Typography>
        </Stack>
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          title="No hay vacantes disponibles"
          text="Prueba con otra búsqueda o vuelve más tarde."
        />
      ) : (
        <Grid container spacing={2.5}>
          {filteredJobs.map((job) => (
            <Grid item xs={12} md={6} lg={4} key={job.id}>
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  height: "100%",
                  border: "1px solid #e5e7eb",
                  transition: "0.2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 14px 35px rgba(15,23,42,0.12)",
                  },
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <WorkIcon />
                    </Avatar>

                    <Box>
                      <Typography fontWeight={900} fontSize={18}>
                        {job.title}
                      </Typography>
                      <Stack direction="row" spacing={0.7} alignItems="center">
                        <BusinessIcon fontSize="small" color="action" />
                        <Typography color="text.secondary" fontSize={14}>
                          {job.company_name || "Empresa"}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {job.location && (
                      <Chip
                        size="small"
                        icon={<PlaceIcon />}
                        label={job.location}
                        variant="outlined"
                      />
                    )}

                    {job.modality && (
                      <Chip size="small" label={job.modality} color="primary" />
                    )}

                    {job.job_type && (
                      <Chip size="small" label={job.job_type} variant="outlined" />
                    )}
                  </Stack>

                  <Typography color="text.secondary" fontSize={14}>
                    {job.description
                      ? `${job.description.slice(0, 150)}${
                          job.description.length > 150 ? "..." : ""
                        }`
                      : "Sin descripción disponible."}
                  </Typography>

                  <Stack direction="row" spacing={1} mt="auto">
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      component={RouterLink}
                      to={`/jobs/${job.id}`}
                    >
                      Ver
                    </Button>

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<SendIcon />}
                      disabled={applyingId === job.id}
                      onClick={() => handleApply(job.id)}
                    >
                      {applyingId === job.id ? "Enviando..." : "Aplicar"}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}