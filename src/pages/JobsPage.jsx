import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import WorkIcon from '@mui/icons-material/Work';

import { applyToJob, getPublicJobs, getSavedJobIds, saveJob, unsaveJob, reportJob } from '../api/jobs';
import useAuth from '../auth/AuthContext';
import JobDetailPanel from '../components/jobs/JobDetailPanel';
import ApplicationQuestionsDialog from '../components/jobs/ApplicationQuestionsDialog';
import { useSearchParams } from 'react-router-dom';

export default function JobsPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState(() => ({
    q: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    modality: searchParams.get('modality') || ''
  }));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [viewedJobs, setViewedJobs] = useState([]);
  const [applyingJob, setApplyingJob] = useState(null);
  const [applying, setApplying] = useState(false);

  const setValue = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (date) => {
    if (!date) return 'Sin fecha';

    return new Date(date).toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const getDaysAgo = (date) => {
    if (!date) return '';

    const created = new Date(date);
    const today = new Date();
    const diffDays = Math.floor((today - created) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Publicado hoy';
    if (diffDays === 1) return 'Publicado ayer';

    return `Publicado hace ${diffDays} días`;
  };

  const getJobStatusLabel = (status) => {
    const labels = {
      OPEN: 'Abierta',
      PAUSED: 'Pausada',
      CLOSED: 'Cerrada',
      HIRED: 'Contratado'
    };

    return labels[status] || status || 'Abierta';
  };

  const getJobStatusColor = (status) => {
    const colors = {
      OPEN: 'success',
      PAUSED: 'warning',
      CLOSED: 'default',
      HIRED: 'info'
    };

    return colors[status] || 'default';
  };

  const isNewJob = (date) => {
    if (!date) return false;

    const created = new Date(date);
    const today = new Date();
    const diffDays = Math.floor((today - created) / (1000 * 60 * 60 * 24));

    return diffDays <= 3;
  };

  const formatCurrency = (value) => {
    if (!value) return null;

    return new Intl.NumberFormat('es-NI', {
      style: 'currency',
      currency: 'NIO',
      minimumFractionDigits: 0
    }).format(Number(value));
  };

  const getSalaryLabel = (job) => {
    if (!job?.salary_min && !job?.salary_max) return '';

    if (job.salary_min && job.salary_max) {
      return `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`;
    }

    if (job.salary_min) return `Desde ${formatCurrency(job.salary_min)}`;

    return `Hasta ${formatCurrency(job.salary_max)}`;
  };

  const getMatchLabel = (job) => {
    const score =
      70 +
      (job?.experience_years ? 8 : 0) +
      (job?.education_level ? 7 : 0) +
      (job?.skills_required ? 10 : 0);

    if (score >= 90) return 'Alta coincidencia';
    if (score >= 80) return 'Buena coincidencia';

    return 'Coincidencia media';
  };

  const getMatchColor = (job) => {
    const label = getMatchLabel(job);

    if (label === 'Alta coincidencia') return 'success';
    if (label === 'Buena coincidencia') return 'primary';

    return 'default';
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);

    setViewedJobs((prev) => {
      if (prev.includes(job.id)) return prev;
      return [...prev, job.id];
    });
  };

  const toggleSaveJob = async (jobId) => {
    const saved = savedJobs.includes(jobId);
    setSavedJobs((prev) => saved ? prev.filter((id) => id !== jobId) : [...prev, jobId]);
    if (user?.role !== 'CANDIDATE') return;
    try { if (saved) await unsaveJob(jobId); else await saveJob(jobId); }
    catch { setSavedJobs((prev) => saved ? [...prev, jobId] : prev.filter((id) => id !== jobId)); }
  };

  const loadJobs = async () => {
    setLoading(true);
    setError('');

    try {
      const rows = await getPublicJobs(filters);
      const data = Array.isArray(rows) ? rows : [];

      setJobs(data);

      if (!selectedJob || !data.some((job) => job.id === selectedJob.id)) {
        setSelectedJob(data[0] || null);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudieron cargar las vacantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      q: searchParams.get('q') || '',
      location: searchParams.get('location') || '',
      modality: searchParams.get('modality') || current.modality
    }));
  }, [searchParams]);

  useEffect(() => {
    if (user?.role === 'CANDIDATE') getSavedJobIds().then(setSavedJobs).catch(() => {});
  }, [user?.role]);

  useEffect(() => {
    const delay = setTimeout(() => {
      loadJobs();
    }, 450);

    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleApply = async (job) => {
    if (job?.screening_questions?.length) {
      setApplyingJob(job);
      return;
    }
    await submitApplication(job.id, []);
  };

  const submitApplication = async (jobId, answers) => {
    setMessage('');
    setError('');

    try {
      setApplying(true);
      await applyToJob(jobId, {
        cover_letter: 'Estoy interesado en esta vacante.',
        answers
      });

      setMessage('Postulación enviada correctamente.');
      setApplyingJob(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo enviar la postulación');
    } finally {
      setApplying(false);
    }
  };

  const handleReport = async (jobId) => {
    const details = window.prompt('Describe brevemente el problema con esta vacante:');
    if (!details) return;
    try { await reportJob(jobId, { reason: 'CONTENT', details }); setMessage('Reporte enviado para revisión.'); }
    catch (err) { setError(err?.response?.data?.message || 'No se pudo enviar el reporte'); }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 68px)',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(180deg, ${alpha(theme.palette.primary.dark, 0.18)} 0%, ${theme.palette.background.default} 260px)`
          : 'linear-gradient(180deg, #f4f8ff 0%, #f7f8fb 240px, #ffffff 100%)'
      }}
    >
      {message && (
        <Alert severity="success" sx={{ borderRadius: 0 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          maxWidth: 1440,
          mx: 'auto',
          px: 2,
          py: 2,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '38% 62%' },
          minHeight: 'calc(100vh - 68px)'
        }}
      >
        <Box
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'rgba(15,23,42,0.08)',
            borderRadius: 4,
            overflow: 'hidden',
            height: 'calc(100vh - 100px)',
            boxShadow: '0 12px 32px rgba(15,23,42,0.06)'
          }}
        >
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography variant="h6" fontWeight={900}>
              Empleos recomendados
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Vacantes seleccionadas según tus búsquedas y preferencias.
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {loading ? 'Buscando...' : `${jobs.length} resultados`}
            </Typography>

            <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" useFlexGap>
              <Chip
                label="Remoto"
                size="small"
                onClick={() => setValue('modality', 'REMOTO')}
                color={filters.modality === 'REMOTO' ? 'primary' : 'default'}
              />
              <Chip
                label="Presencial"
                size="small"
                onClick={() => setValue('modality', 'PRESENCIAL')}
                color={filters.modality === 'PRESENCIAL' ? 'primary' : 'default'}
              />
              <Chip
                label="Híbrido"
                size="small"
                onClick={() => setValue('modality', 'HIBRIDO')}
                color={filters.modality === 'HIBRIDO' ? 'primary' : 'default'}
              />
              <Chip
                label="Todas"
                size="small"
                onClick={() => setValue('modality', '')}
                variant={filters.modality === '' ? 'filled' : 'outlined'}
              />
            </Stack>
          </Box>

          <Divider />

          <Box sx={{ height: 'calc(100% - 125px)', overflowY: 'auto' }}>
            {loading &&
              [1, 2, 3, 4].map((item) => (
                <Box
                  key={item}
                  sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Stack direction="row" spacing={2}>
                    <Skeleton variant="rounded" width={64} height={64} />
                    <Box flex={1}>
                      <Skeleton width="80%" height={28} />
                      <Skeleton width="45%" />
                      <Skeleton width="65%" />
                      <Skeleton width="35%" />
                    </Box>
                  </Stack>
                </Box>
              ))}

            {!loading &&
              jobs.map((job) => {
                const selected = selectedJob?.id === job.id;
                const viewed = viewedJobs.includes(job.id);
                const saved = savedJobs.includes(job.id);

                return (
                  <Box
                    key={job.id}
                    onClick={() => handleSelectJob(job)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      bgcolor: selected ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.08) : 'background.paper',
                      borderLeft: selected ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                      borderBottom: '1px solid rgba(15,23,42,0.08)',
                      boxShadow: selected ? 'inset 0 0 0 1px rgba(11,102,195,0.15)' : 'none',
                      transition: 'all .18s ease',
                      '&:hover': {
                        bgcolor: selected
                          ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.26 : 0.08)
                          : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.10 : 0.03),
                        transform: 'translateX(2px)'
                      }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar
                        variant="rounded"
                        src={job.logo_url || ''}
                        sx={{
                          width: 62,
                          height: 62,
                          bgcolor: 'primary.main',
                          borderRadius: 3
                        }}
                      >
                        {!job.logo_url && <WorkIcon />}
                      </Avatar>

                      <Box flex={1} minWidth={0}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography
                            fontWeight={900}
                            color="primary.main"
                            sx={{ fontSize: 17 }}
                            noWrap
                          >
                            {job.title}
                          </Typography>

                          {saved && (
                            <Chip
                              label="Guardado"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Stack>

                        <Typography fontWeight={700} noWrap>
                          {job.company_name}
                        </Typography>

                        <Typography color="text.secondary" noWrap>
                          {job.location || 'Sin ubicación'} {job.modality ? `(${job.modality})` : ''}
                        </Typography>

                        {getSalaryLabel(job) && (
                          <Typography color="text.secondary" variant="body2">
                            {getSalaryLabel(job)}
                          </Typography>
                        )}

                        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
                          <Chip size="small" variant="outlined" label={getDaysAgo(job.created_at)} />
                          <Chip
                            size="small"
                            label={getJobStatusLabel(job.status)}
                            color={getJobStatusColor(job.status)}
                          />
                          {isNewJob(job.created_at) && (
                            <Chip size="small" label="Nueva" color="primary" />
                          )}
                          <Chip
                            size="small"
                            label={getMatchLabel(job)}
                            color={getMatchColor(job)}
                            variant="outlined"
                          />
                        </Stack>

                        {viewed && (
                          <Typography variant="caption" color="text.secondary" mt={0.75} display="block">
                            Visto
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                );
              })}

            {!loading && jobs.length === 0 && (
              <Box
                sx={{
                  p: 5,
                  textAlign: 'center',
                  color: 'text.secondary'
                }}
              >
                <WorkIcon sx={{ fontSize: 46, color: 'text.disabled', mb: 1 }} />
                <Typography fontWeight={900} color="text.primary">
                  No hay vacantes disponibles
                </Typography>
                <Typography>
                  Prueba cambiando los filtros o busca otra ubicación.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <JobDetailPanel
          job={selectedJob}
          user={user}
          onApply={handleApply}
          onReport={handleReport}
          formatDate={formatDate}
          getDaysAgo={getDaysAgo}
          getJobStatusLabel={getJobStatusLabel}
          getJobStatusColor={getJobStatusColor}
          isNewJob={isNewJob}
          getSalaryLabel={getSalaryLabel}
          getMatchLabel={getMatchLabel}
          getMatchColor={getMatchColor}
          savedJobs={savedJobs}
          toggleSaveJob={toggleSaveJob}
        />
        <ApplicationQuestionsDialog
          job={applyingJob}
          open={Boolean(applyingJob)}
          loading={applying}
          onClose={() => setApplyingJob(null)}
          onSubmit={(answers) => submitApplication(applyingJob.id, answers)}
        />
      </Box>
    </Box>
  );
}
