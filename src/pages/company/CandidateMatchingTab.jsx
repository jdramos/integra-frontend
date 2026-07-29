import React, { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import SearchIcon from "@mui/icons-material/Search";

import CandidateCard from "./components/CandidateCard";
import CandidateDetailModal from "./components/CandidateDetailModal";
import { searchCandidates } from "../../api/company";

const primary = "#0057B8";

function normalizeCandidate(candidate) {
  return {
    ...candidate,
    id: candidate.id,
    name:
      candidate.name ||
      candidate.full_name ||
      candidate.candidate_name ||
      "Candidato",
    title:
      candidate.title ||
      candidate.headline ||
      candidate.profession ||
      candidate.professional_area ||
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
    matchedSkills: candidate.matchedSkills || [],
    missingSkills: candidate.missingSkills || [],
    scoreBreakdown: candidate.scoreBreakdown || null,
  };
}

export default function CandidateMatchingTab({ candidates = [], jobs = [] }) {
  const [selectedJobId, setSelectedJobId] = useState("");
  const [rows, setRows] = useState(candidates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  const selectedJob = useMemo(() => {
    return jobs.find((j) => String(j.id) === String(selectedJobId));
  }, [jobs, selectedJobId]);

  const rankedCandidates = useMemo(() => {
    return [...rows].map(normalizeCandidate).sort((a, b) => {
      const aScore = Number(a.match || a.match_score || a.score || 0);
      const bScore = Number(b.match || b.match_score || b.score || 0);
      return bScore - aScore;
    });
  }, [rows]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await searchCandidates({
        jobId: selectedJobId,
        sort: "score_desc",
      });

      const list = Array.isArray(data) ? data : data?.candidates || [];
      setRows(list);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "No se pudo calcular el ranking"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedJobId("");
    setRows(candidates);
    setError("");
  };

  return (
    <Stack spacing={3}>
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
          spacing={2}
          justifyContent="space-between"
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <WorkspacePremiumIcon sx={{ color: primary }} />

              <Typography variant="h6" fontWeight={900}>
                Ranking inteligente de candidatos
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Selecciona una vacante para recalcular compatibilidad real.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              select
              size="small"
              label="Vacante"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              sx={{ minWidth: 320 }}
            >
              <MenuItem value="">Todas las vacantes</MenuItem>

              {jobs.map((job) => (
                <MenuItem key={job.id} value={job.id}>
                  {job.title} · {job.location}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading || !selectedJobId}
              sx={{ bgcolor: primary }}
            >
              {loading ? "Calculando..." : "Calcular"}
            </Button>

            <Button variant="outlined" onClick={handleClear} disabled={loading}>
              Limpiar
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      {selectedJob && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 4,
            border: "1px solid #E5EAF2",
            bgcolor: "#F8FBFF",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Vacante
              </Typography>
              <Typography fontWeight={900}>{selectedJob.title}</Typography>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                Modalidad
              </Typography>
              <Typography fontWeight={800}>
                {selectedJob.work_mode || selectedJob.modality || "N/D"}
              </Typography>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                Experiencia
              </Typography>
              <Typography fontWeight={800}>
                {selectedJob.experience_years || 0} años
              </Typography>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                Escolaridad
              </Typography>
              <Typography fontWeight={800}>
                {selectedJob.education_level || "N/D"}
              </Typography>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                Salario máximo
              </Typography>
              <Typography fontWeight={800}>
                C$ {Number(selectedJob.salary_max || 0).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {loading ? (
        <Stack alignItems="center" py={5} spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">
            Calculando compatibilidad...
          </Typography>
        </Stack>
      ) : rankedCandidates.length === 0 ? (
        <Alert severity="info">
          No hay candidatos disponibles para comparar.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {rankedCandidates.map((candidate, index) => (
            <Paper
              key={candidate.id}
              elevation={0}
              sx={{
                p: 0,
                borderRadius: 4,
                border:
                  index === 0 && selectedJobId
                    ? "2px solid #0057B8"
                    : "1px solid #E5EAF2",
                overflow: "hidden",
              }}
            >
              {index === 0 && selectedJobId && (
                <Box
                  sx={{
                    px: 2,
                    py: 0.8,
                    bgcolor: "#0057B8",
                    color: "white",
                  }}
                >
                  <Typography variant="caption" fontWeight={900}>
                    #1 Mejor candidato recomendado para esta vacante
                  </Typography>
                </Box>
              )}

              <CandidateCard
                candidate={candidate}
                compact
                onView={(candidate) => {
                  setSelectedCandidate(candidate);
                  setOpenDetail(true);
                }}
              />
            </Paper>
          ))}
        </Stack>
      )}

      <CandidateDetailModal
        open={openDetail}
        candidate={selectedCandidate}
        onClose={() => setOpenDetail(false)}
      />
    </Stack>
  );
}