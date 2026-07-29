import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Box,
  Divider,
} from '@mui/material';

import {
  WorkOutline,
  Visibility,
  Groups,
  Event,
  Handshake,
  CheckCircle,
  Cancel,
  LocationOn,
  School,
  Timeline,
} from '@mui/icons-material';

import { Link as RouterLink, useParams } from 'react-router-dom';

import {
  getApplicantsByJob,
  updateApplicationStatus,
  getJobPipelineAnalytics,
} from '../../api/jobs';
import { getCandidateCvViewUrlForCompany } from '../../api/candidate';

import EmptyState from '../../components/common/EmptyState';
import ApplicationTimeline from './components/ApplicationTimeline';

const statusConfig = {
  APPLIED: { label: 'Aplicado', color: 'default', icon: <WorkOutline fontSize="small" /> },
  REVIEWED: { label: 'Revisado', color: 'info', icon: <Visibility fontSize="small" /> },
  SHORTLISTED: { label: 'Preseleccionado', color: 'warning', icon: <Groups fontSize="small" /> },
  INTERVIEW: { label: 'Entrevista', color: 'secondary', icon: <Event fontSize="small" /> },
  OFFER: { label: 'Oferta', color: 'primary', icon: <Handshake fontSize="small" /> },
  HIRED: { label: 'Contratado', color: 'success', icon: <CheckCircle fontSize="small" /> },
  REJECTED: { label: 'Rechazado', color: 'error', icon: <Cancel fontSize="small" /> },
};

export default function CompanyApplicantsPage() {
  const { jobId } = useParams();

  const [rows, setRows] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loadingCvId, setLoadingCvId] = useState(null);
  const [cvError, setCvError] = useState('');

  const loadRows = async () => {
    try {
      const [applicantsData, analyticsData] = await Promise.all([
        getApplicantsByJob(jobId),
        getJobPipelineAnalytics(jobId),
      ]);

      setRows(applicantsData || []);
      setAnalytics(analyticsData || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRows();
  }, [jobId]);

  const handleStatus = async (applicationId, status) => {
    try {
      await updateApplicationStatus(applicationId, status);
      loadRows();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewCv = async (candidateUserId) => {
    try {
      setLoadingCvId(candidateUserId);
      const data = await getCandidateCvViewUrlForCompany(candidateUserId);
      window.open(data.url, '_blank', 'noreferrer');
    } catch (err) {
      setCvError(err?.response?.data?.message || 'No se pudo abrir el CV.');
    } finally {
      setLoadingCvId(null);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Postulantes
          </Typography>

          <Typography color="text.secondary">
            Gestiona el pipeline de candidatos de esta vacante
          </Typography>
        </Box>

        <Chip label={`${rows.length} candidatos`} color="primary" />
      </Stack>

      <Grid container spacing={2} mb={3}>
        {Object.keys(statusConfig).map((key) => {
          const found = analytics.find((item) => item.status === key);
          const total = Number(found?.total || 0);
          const config = statusConfig[key];

          return (
            <Grid item xs={12} sm={6} md={3} key={key}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 38,
                      height: 38,
                    }}
                  >
                    {config.icon}
                  </Avatar>

                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      {total}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {config.label}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {rows.length === 0 && (
        <EmptyState
          title="Sin postulantes"
          text="Aún no hay candidatos aplicando a esta vacante."
        />
      )}

      <Grid container spacing={2}>
        {rows.map((row) => {
          const status = statusConfig[row.status] || statusConfig.APPLIED;

          return (
            <Grid item xs={12} md={6} lg={4} key={row.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 5,
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                  transition: '0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 3,
                  },
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 58,
                        height: 58,
                        bgcolor: 'primary.main',
                        fontWeight: 800,
                        fontSize: 22,
                      }}
                    >
                      {row.name?.charAt(0)}
                    </Avatar>

                    <Box flex={1}>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        component={RouterLink}
                        to={`/company/candidates/${row.candidate_user_id}`}
                        sx={{ color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                      >
                        {row.name}
                      </Typography>

                      <Typography color="primary.main" fontWeight={700}>
                        {row.headline || 'Sin headline'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {row.location || 'Sin ubicación'}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Timeline sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {row.experience_years || 0} años de experiencia
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <School sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {row.education_level || 'No especificado'}
                      </Typography>
                    </Stack>
                  </Stack>

                  {row.summary && (
                    <Typography variant="body2" color="text.secondary">
                      {row.summary}
                    </Typography>
                  )}

                  {row.skills && (
                    <Box>
                      <Typography fontWeight={700} mb={1}>
                        Habilidades
                      </Typography>

                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {String(row.skills)
                          .split(',')
                          .map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill.trim()}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                      </Stack>
                    </Box>
                  )}

                  {row.screening_answers?.length > 0 && (
                    <Box>
                      <Typography fontWeight={800} mb={1}>Respuestas de preselección</Typography>
                      <Stack spacing={1}>
                        {row.screening_answers.map((answer, index) => (
                          <Box key={index} sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight={700}>{answer.question_text}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                              {answer.answer_text}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Divider />

                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Chip
                      icon={status.icon}
                      label={status.label}
                      color={status.color}
                      sx={{ fontWeight: 700 }}
                    />

                    <TextField
                      select
                      size="small"
                      label="Estado"
                      value={row.status || 'APPLIED'}
                      onChange={(e) => handleStatus(row.id, e.target.value)}
                      sx={{ minWidth: 190 }}
                    >
                      <MenuItem value="APPLIED">Aplicado</MenuItem>
                      <MenuItem value="REVIEWED">Revisado</MenuItem>
                      <MenuItem value="SHORTLISTED">Preseleccionado</MenuItem>
                      <MenuItem value="INTERVIEW">Entrevista</MenuItem>
                      <MenuItem value="OFFER">Oferta</MenuItem>
                      <MenuItem value="HIRED">Contratado</MenuItem>
                      <MenuItem value="REJECTED">Rechazado</MenuItem>
                    </TextField>
                  </Stack>

                  <Stack direction="row" spacing={1} mt={1}>
                    {row.cv_url && (
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={loadingCvId === row.candidate_user_id}
                        onClick={() => handleViewCv(row.candidate_user_id)}
                      >
                        {loadingCvId === row.candidate_user_id ? 'Abriendo...' : 'Ver CV'}
                      </Button>
                    )}

                    {row.linkedin_url && (
                      <Button variant="outlined" href={row.linkedin_url} target="_blank" fullWidth>
                        LinkedIn
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Snackbar
        open={Boolean(cvError)}
        autoHideDuration={4000}
        onClose={() => setCvError('')}
      >
        <Alert severity="error" onClose={() => setCvError('')}>
          {cvError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
