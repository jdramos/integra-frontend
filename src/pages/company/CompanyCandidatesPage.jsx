import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { Link as RouterLink } from 'react-router-dom';
import { searchCandidates } from '../../api/company';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import { saveCandidateForCompany } from '../../api/company';
import useCatalog from '../../hooks/useCatalog';

export default function CompanyCandidatesPage() {
  const { labels: departments } = useCatalog('nicaragua_departments');
  const [filters, setFilters] = useState({
    q: '',
    location: '',
    experience: '',
    minScore: '',
    sort: 'score_desc',
    jobId: ''
  });

  const [rows, setRows] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [job, setJob] = useState(null);

  const setValue = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const loadRows = async () => {
    const result = await searchCandidates(filters);

    setRows(result.candidates || []);
    setTopCandidates(result.topCandidates || []);
    setJob(result.job || null);
  };

  useEffect(() => {
    loadRows();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  };


  const handleSaveCandidate = async (id) => {
  await saveCandidateForCompany(id);
  alert('Candidato guardado');
};

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, borderRadius: 4, position: 'sticky', top: 90 }}>
          <Typography variant="h6" mb={2}>
            Buscar candidatos
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Nombre, puesto o habilidad"
              value={filters.q}
              onChange={(e) => setValue('q', e.target.value)}
            />

            <TextField
              select
              label="Ubicación"
              value={filters.location}
              onChange={(e) => setValue('location', e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Experiencia mínima"
              value={filters.experience}
              onChange={(e) => setValue('experience', e.target.value)}
            />

            <TextField
              label="Score mínimo"
              value={filters.minScore}
              onChange={(e) => setValue('minScore', e.target.value)}
              placeholder="Ej: 70"
            />

            <TextField
              label="ID de vacante para matching"
              value={filters.jobId}
              onChange={(e) => setValue('jobId', e.target.value)}
              placeholder="Ej: 1"
            />

            <TextField
              select
              label="Ordenar por"
              value={filters.sort}
              onChange={(e) => setValue('sort', e.target.value)}
            >
              <MenuItem value="score_desc">Mejor score</MenuItem>
              <MenuItem value="experience_desc">Más experiencia</MenuItem>
              <MenuItem value="experience_asc">Menos experiencia</MenuItem>
              <MenuItem value="name_asc">Nombre A-Z</MenuItem>
            </TextField>

            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={loadRows}
            >
              Buscar
            </Button>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={9}>
        <Stack spacing={3}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography variant="h4">Talento disponible</Typography>
                <Typography color="text.secondary">
                  Ranking automático por perfil, experiencia, habilidades y match.
                </Typography>

                {job && (
                  <Chip
                    sx={{ mt: 1 }}
                    color="primary"
                    label={`Matching contra: ${job.title}`}
                  />
                )}
              </Box>

              <Chip
                icon={<WorkspacePremiumIcon />}
                color="primary"
                label={`${rows.length} candidatos encontrados`}
                sx={{ fontWeight: 800 }}
              />
            </Stack>
          </Paper>

          {topCandidates.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <StarIcon color="warning" />
                <Typography variant="h5">
                  Top candidatos
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                {topCandidates.map((candidate, index) => (
                  <Grid item xs={12} md={4} key={candidate.id}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                      <Stack direction="row" spacing={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {candidate.name?.charAt(0)}
                        </Avatar>

                        <Box flex={1}>
                          <Typography
                            fontWeight={900}
                            component={RouterLink}
                            to={`/company/candidates/${candidate.id}`}
                            sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                          >
                            #{index + 1} {candidate.name}
                          </Typography>

                          <Typography variant="body2" color="primary.main" fontWeight={700}>
                            {candidate.headline}
                          </Typography>

                          <Chip
                            size="small"
                            color={getScoreColor(candidate.score)}
                            label={`${candidate.score}% match`}
                            sx={{ mt: 1, fontWeight: 800 }}
                          />
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          <Grid container spacing={2}>
            {rows.map((row) => (
              <Grid item xs={12} md={6} key={row.id}>
                <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                  <Stack direction="row" spacing={2}>
                    <Avatar
                      src={row.photo_url || ''}
                      sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
                    >
                      {row.name?.charAt(0)}
                    </Avatar>

                    <Box flex={1}>
                      <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Box>
                          <Typography
                            variant="h6"
                            component={RouterLink}
                            to={`/company/candidates/${row.id}`}
                            sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                          >
                            {row.name}
                          </Typography>
                          <Typography color="primary.main" fontWeight={800}>
                            {row.headline}
                          </Typography>
                          <Typography color="text.secondary">
                            {row.location || 'Sin ubicación'}
                          </Typography>
                        </Box>

                        <Chip
                          color={getScoreColor(row.score)}
                          label={`${row.score}%`}
                          sx={{ fontWeight: 900 }}
                        />
                      </Stack>

                      <Box mt={2}>
                        <LinearProgress
                          variant="determinate"
                          value={Number(row.score || 0)}
                          sx={{ height: 8, borderRadius: 99 }}
                        />
                      </Box>
                    </Box>
                  </Stack>

                  <Grid container spacing={1} mt={2}>
                    <Grid item xs={6}>
                      <Chip
                        fullWidth
                        label={`${row.experience_years || 0} años exp.`}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Chip
                        fullWidth
                        label={row.education_level || 'Sin educación'}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Chip
                        fullWidth
                        label={row.age ? `${row.age} años` : 'Edad N/D'}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Chip
                        fullWidth
                        label={row.location || 'Sin ubicación'}
                      />
                    </Grid>
                  </Grid>

                  <Typography mt={2}>
                    {row.summary || 'Sin resumen profesional.'}
                  </Typography>

                  <Typography mt={2} color="text.secondary">
                    Habilidades: {row.skills || 'Sin habilidades'}
                  </Typography>

                  {row.matchedSkills?.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="body2" fontWeight={800}>
                        Skills que coinciden:
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                        {row.matchedSkills.map((skill) => (
                          <Chip
                            key={skill}
                            size="small"
                            color="success"
                            label={skill}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {row.missingSkills?.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="body2" fontWeight={800}>
                        Skills faltantes:
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                        {row.missingSkills.map((skill) => (
                          <Chip
                            key={skill}
                            size="small"
                            color="warning"
                            label={skill}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Stack direction="row" spacing={1} mt={2}>
                    <Button
                      variant="contained"
                      component={RouterLink}
                      to={`/company/candidates/${row.id}`}
                    >
                      Ver detalle
                    </Button>

                   <Button
                    variant="outlined"
                    startIcon={<BookmarkAddIcon />}
                    onClick={() => handleSaveCandidate(row.id)}
                  >
                    Guardar candidato
                  </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
}