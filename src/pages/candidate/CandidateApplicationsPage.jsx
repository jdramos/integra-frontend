import React, { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Chip,
  Grid,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@mui/lab';
import { Link as RouterLink } from 'react-router-dom';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import { getMyApplications } from '../../api/jobs';
import EmptyState from '../../components/common/EmptyState';

const STATUS_META = {
  APPLIED: { label: 'Postulado', color: 'default' },
  REVIEWED: { label: 'Revisado', color: 'info' },
  SCREENING: { label: 'En revisión', color: 'info' },
  SHORTLISTED: { label: 'Preseleccionado', color: 'secondary' },
  INTERVIEW: { label: 'Entrevista', color: 'warning' },
  TECHNICAL: { label: 'Prueba técnica', color: 'warning' },
  OFFER: { label: 'Oferta', color: 'success' },
  HIRED: { label: 'Contratado', color: 'success' },
  REJECTED: { label: 'No seleccionado', color: 'error' },
};

const FILTERS = [
  { key: 'ALL', label: 'Todas' },
  { key: 'IN_PROGRESS', label: 'En proceso', statuses: ['APPLIED', 'REVIEWED', 'SCREENING', 'SHORTLISTED'] },
  { key: 'INTERVIEW', label: 'Entrevistas', statuses: ['INTERVIEW', 'TECHNICAL'] },
  { key: 'OFFER', label: 'Ofertas / Contratado', statuses: ['OFFER', 'HIRED'] },
  { key: 'REJECTED', label: 'No seleccionado', statuses: ['REJECTED'] },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO', minimumFractionDigits: 0 }).format(Number(value));
}

function getSalaryLabel(row) {
  if (!row.salary_min && !row.salary_max) return '';
  if (row.salary_min && row.salary_max) return `${formatCurrency(row.salary_min)} - ${formatCurrency(row.salary_max)}`;
  if (row.salary_min) return `Desde ${formatCurrency(row.salary_min)}`;
  return `Hasta ${formatCurrency(row.salary_max)}`;
}

function getDaysAgo(date) {
  const created = new Date(date);
  const diffDays = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  return `Hace ${diffDays} días`;
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('es-NI', { dateStyle: 'medium', timeStyle: 'short' });
}

function eventLabel(event) {
  if (event.event_type === 'APPLICATION_SUBMITTED') return 'Postulación enviada';
  if (event.event_type === 'PROFILE_VIEWED') return 'La empresa revisó tu perfil';
  if (event.event_type === 'CV_VIEWED') return 'La empresa abrió tu CV';
  if (event.event_type === 'STATUS_CHANGED') return `Estado actualizado a ${STATUS_META[event.new_status]?.label || event.new_status}`;
  return 'Actividad en tu postulación';
}

function eventIcon(event) {
  if (event.event_type === 'APPLICATION_SUBMITTED') return <SendIcon fontSize="small" />;
  if (event.event_type === 'PROFILE_VIEWED') return <VisibilityIcon fontSize="small" />;
  if (event.event_type === 'CV_VIEWED') return <DescriptionIcon fontSize="small" />;
  if (event.new_status === 'HIRED') return <CheckCircleIcon fontSize="small" />;
  if (event.new_status === 'REJECTED') return <CancelIcon fontSize="small" />;
  return <TrendingUpIcon fontSize="small" />;
}

function eventColor(event) {
  if (event.event_type === 'CV_VIEWED' || event.event_type === 'PROFILE_VIEWED') return 'info';
  if (event.new_status === 'HIRED') return 'success';
  if (event.new_status === 'REJECTED') return 'error';
  return 'primary';
}

export default function CandidateApplicationsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getMyApplications()
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const inProgress = rows.filter((r) => ['APPLIED', 'REVIEWED', 'SCREENING', 'SHORTLISTED'].includes(r.status)).length;
    const interviews = rows.filter((r) => ['INTERVIEW', 'TECHNICAL'].includes(r.status)).length;
    const offers = rows.filter((r) => ['OFFER', 'HIRED'].includes(r.status)).length;
    return { total: rows.length, inProgress, interviews, offers };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const activeFilter = FILTERS.find((f) => f.key === filter);
    return rows.filter((row) => {
      if (activeFilter?.statuses && !activeFilter.statuses.includes(row.status)) return false;
      if (search.trim()) {
        const term = search.trim().toLowerCase();
        return row.title?.toLowerCase().includes(term) || row.company_name?.toLowerCase().includes(term);
      }
      return true;
    });
  }, [rows, filter, search]);

  return (
    <>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={900} mb={0.5}>Mis postulaciones</Typography>
        <Typography color="text.secondary">Sigue el estado de cada vacante a la que aplicaste.</Typography>
      </Box>

      {loading ? (
        <Grid container spacing={2} mb={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} md={3} key={i}>
              <Skeleton variant="rounded" height={92} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2} mb={3}>
          {[
            { label: 'Total', value: stats.total, color: 'text.primary' },
            { label: 'En proceso', value: stats.inProgress, color: 'info.main' },
            { label: 'Entrevistas', value: stats.interviews, color: 'warning.main' },
            { label: 'Ofertas / Contratado', value: stats.offers, color: 'success.main' },
          ].map((card) => (
            <Grid item xs={6} md={3} key={card.label}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
                <Typography variant="h4" fontWeight={900} color={card.color}>{card.value}</Typography>
                <Typography variant="body2" color="text.secondary">{card.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && rows.length > 0 && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={3} alignItems={{ sm: 'center' }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap flex={1}>
            {FILTERS.map((f) => (
              <Chip
                key={f.key}
                label={f.label}
                onClick={() => setFilter(f.key)}
                color={filter === f.key ? 'primary' : 'default'}
                variant={filter === f.key ? 'filled' : 'outlined'}
                sx={{ fontWeight: 700 }}
              />
            ))}
          </Stack>

          <TextField
            size="small"
            placeholder="Buscar por cargo o empresa"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      )}

      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: 4 }} />
          ))}
        </Stack>
      ) : rows.length === 0 ? (
        <EmptyState title="Aún no has aplicado" text="Explora empleos y aplica gratis." />
      ) : filteredRows.length === 0 ? (
        <EmptyState title="Sin resultados" text="Ningún postulación coincide con el filtro o la búsqueda." />
      ) : (
        <Stack spacing={2}>
          {filteredRows.map((row) => {
            const status = STATUS_META[row.status] || { label: row.status, color: 'default' };
            const salaryLabel = getSalaryLabel(row);

            return (
              <Paper
                key={row.id}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'box-shadow .2s ease',
                  '&:hover': { boxShadow: '0 8px 24px rgba(15,23,42,0.08)' },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar
                    variant="rounded"
                    src={row.company_logo_url || ''}
                    sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'primary.main' }}
                  >
                    {!row.company_logo_url && <WorkIcon />}
                  </Avatar>

                  <Box flex={1} minWidth={0}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" rowGap={1}>
                      <Box minWidth={0}>
                        <Typography
                          variant="h6"
                          fontWeight={900}
                          component={RouterLink}
                          to={`/jobs/${row.job_id}`}
                          sx={{ color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                        >
                          {row.title}
                        </Typography>
                        <Typography fontWeight={700} color="text.secondary">{row.company_name}</Typography>
                      </Box>

                      <Chip label={status.label} color={status.color} sx={{ fontWeight: 800 }} />
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1}>
                      {row.location && <Chip size="small" variant="outlined" label={row.location} />}
                      {row.modality && <Chip size="small" variant="outlined" label={row.modality} />}
                      {row.professional_area && <Chip size="small" variant="outlined" label={row.professional_area} />}
                      {salaryLabel && <Chip size="small" variant="outlined" color="success" label={salaryLabel} />}
                      {['CLOSED', 'PAUSED'].includes(row.job_status) && (
                        <Chip size="small" variant="outlined" color="default" label="Vacante ya no disponible" />
                      )}
                    </Stack>

                    <Typography variant="body2" color="text.secondary" mt={1.5}>
                      Aplicaste {getDaysAgo(row.created_at)} · {formatDate(row.created_at)}
                    </Typography>
                  </Box>
                </Stack>

                <Accordion elevation={0} disableGutters sx={{ mt: 2, bgcolor: 'transparent', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 0 }}>
                    <Typography fontWeight={800} variant="body2">Ver historial de la postulación</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0 }}>
                    <Timeline sx={{ p: 0, m: 0, '& .MuiTimelineItem-root:before': { flex: 0, padding: 0 } }}>
                      {(row.history || []).map((event, index) => (
                        <TimelineItem key={`${event.event_type}-${event.event_at}-${index}`}>
                          <TimelineOppositeContent sx={{ flex: 0.001, px: 0 }} />
                          <TimelineSeparator>
                            <TimelineDot color={eventColor(event)} sx={{ display: 'grid', placeItems: 'center' }}>
                              {eventIcon(event)}
                            </TimelineDot>
                            {index < row.history.length - 1 && <TimelineConnector />}
                          </TimelineSeparator>
                          <TimelineContent sx={{ pb: 2.5 }}>
                            <Typography fontWeight={800} variant="body2">{eventLabel(event)}</Typography>
                            <Typography variant="caption" color="text.secondary">{formatDate(event.event_at)}</Typography>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            );
          })}
        </Stack>
      )}
    </>
  );
}
