import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import CandidateDetailModal from "./components/CandidateDetailModal";

import CandidateCard from "./components/CandidateCard";
import { searchCandidates } from "../../api/company";

const primary = "#0057B8";

const initialFilters = {
  jobId: "",
  sort: "score_desc",
  q: "",
  location: "",
  education_level: "",
  min_experience: "",
  max_salary: "",
  availability: "",
  professional_area: "",
};

export default function CandidateSearchTab({ candidates = [], jobs = [] }) {
  const [filters, setFilters] = useState(initialFilters);
  const [rows, setRows] = useState(candidates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  const setFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const normalizeCandidate = (candidate) => ({
    id: candidate.id,
    name:
      candidate.name ||
      candidate.full_name ||
      candidate.candidate_name ||
      "Candidato",
    title:
      candidate.title ||
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
  });

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");

      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "")
      );

      const data = await searchCandidates(params);
      const list = Array.isArray(data)
        ? data
        : data?.candidates || [];

      const normalized = list.map(normalizeCandidate);
      
      setRows(normalized);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "No se pudieron buscar candidatos"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setRows(candidates);
    setError("");
  };

  return (
    <>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
        mb={2}
      >
        <Box>
          <Typography variant="h6" fontWeight={900}>
            Buscar candidatos
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Filtra perfiles por ubicación, experiencia, escolaridad y salario.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<CleaningServicesIcon />}
            onClick={handleClear}
            disabled={loading}
          >
            Limpiar
          </Button>

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={loading}
            sx={{ bgcolor: primary }}
          >
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} mb={3}>

        <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          size="small"
          label="Comparar contra vacante"
          value={filters.jobId}
          onChange={(e) => setFilter("jobId", e.target.value)}
        >
          <MenuItem value="">Sin vacante específica</MenuItem>

          {jobs.map((job) => (
            <MenuItem key={job.id} value={job.id}>
              {job.title} · {job.location}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          size="small"
          label="Ordenar por"
          value={filters.sort || "score_desc"}
          onChange={(e) => setFilter("sort", e.target.value)}
        >
          <MenuItem value="score_desc">Mayor compatibilidad</MenuItem>
          <MenuItem value="experience_desc">Mayor experiencia</MenuItem>
          <MenuItem value="salary_asc">Menor salario esperado</MenuItem>
          <MenuItem value="name_asc">Nombre A-Z</MenuItem>
        </TextField>
      </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Nombre, cargo o palabra clave"
            value={filters.q}
            onChange={(e) => setFilter("q", e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Ubicación"
            value={filters.location}
            onChange={(e) => setFilter("location", e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Área profesional"
            value={filters.professional_area}
            onChange={(e) => setFilter("professional_area", e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Escolaridad"
            value={filters.education_level}
            onChange={(e) => setFilter("education_level", e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="Secundaria">Secundaria</MenuItem>
            <MenuItem value="Técnico">Técnico</MenuItem>
            <MenuItem value="Universidad">Universidad</MenuItem>
            <MenuItem value="Postgrado">Postgrado</MenuItem>
            <MenuItem value="Maestría">Maestría</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Experiencia mínima"
            value={filters.min_experience}
            onChange={(e) => setFilter("min_experience", e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Salario máximo"
            value={filters.max_salary}
            onChange={(e) => setFilter("max_salary", e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Disponibilidad"
            value={filters.availability}
            onChange={(e) => setFilter("availability", e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="Inmediata">Inmediata</MenuItem>
            <MenuItem value="15 días">15 días</MenuItem>
            <MenuItem value="30 días">30 días</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Stack spacing={2}>
        {rows.length === 0 ? (
          <Alert severity="info">
            No se encontraron candidatos con los filtros seleccionados.
          </Alert>
        ) : (
          rows.map((candidate) => (
       <CandidateCard
          key={candidate.id}
          candidate={candidate}
          compact
          onView={(candidate) => {
            setSelectedCandidate(candidate);
            setOpenDetail(true);
          }}
        />
          ))
        )}
      </Stack>

      <CandidateDetailModal
        open={openDetail}
        candidate={selectedCandidate}
        onClose={() => setOpenDetail(false)}
      />

    </>
  );
}