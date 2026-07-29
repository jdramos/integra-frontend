import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import WorkIcon from '@mui/icons-material/Work';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export default function JobDetailPanel({
  job,
  user,
  onApply,
  onReport,
  formatDate,
  getDaysAgo,
  getJobStatusLabel,
  getJobStatusColor,
  isNewJob,
  getSalaryLabel,
  getMatchLabel,
  getMatchColor,
  savedJobs,
  toggleSaveJob
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const softPrimary = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.08);

  const handleContactCompany = () => {
    if (!job?.company_id) return;
    navigate('/candidate/messages', {
      state: {
        startCompanyId: job.company_id,
        startCompanyName: job.company_name,
        startCompanyPhoto: job.logo_url,
      },
    });
  };
  if (!job) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 4,
          border: '1px solid rgba(15,23,42,0.08)',
          height: 'calc(100vh - 100px)',
          boxShadow: '0 12px 32px rgba(15,23,42,0.06)',
          display: 'grid',
          placeItems: 'center'
        }}
      >
        <Box textAlign="center">
          <WorkIcon sx={{ fontSize: 46, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" fontWeight={900}>
            Selecciona una vacante
          </Typography>
          <Typography color="text.secondary">
            El detalle aparecerá aquí.
          </Typography>
        </Box>
      </Box>
    );
  }

  const saved = savedJobs.includes(job.id);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 4,
        border: '1px solid rgba(15,23,42,0.08)',
        overflow: 'hidden',
        height: 'calc(100vh - 100px)',
        boxShadow: '0 12px 32px rgba(15,23,42,0.06)'
      }}
    >
      <Box
        sx={{
          height: 8,
          background: 'linear-gradient(90deg, #0B66C3, #2BB3FF)'
        }}
      />

      <Box sx={{ height: 'calc(100% - 8px)', overflowY: 'auto' }}>
        <Box
          sx={{
            px: 4,
            py: 3,
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.dark, 0.14)} 100%)`
              : 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)'
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack direction="row" spacing={2}>
              <Avatar
                variant="rounded"
                src={job.logo_url || ''}
                sx={{
                  width: 58,
                  height: 58,
                  bgcolor: 'primary.main',
                  borderRadius: 3,
                  boxShadow: '0 8px 18px rgba(11,102,195,0.18)'
                }}
              >
                {!job.logo_url && <WorkIcon />}
              </Avatar>

              <Box>
                <Typography fontWeight={800} color="primary.main">
                  {job.company_name}
                </Typography>

                <Typography variant="h4" fontWeight={900} mt={1}>
                  {job.title}
                </Typography>

                <Typography color="text.secondary" mt={1}>
                  {job.location || 'Sin ubicación'} · {getDaysAgo(job.created_at)}
                </Typography>

                {getSalaryLabel(job) && (
                  <Typography color="text.secondary">
                    {getSalaryLabel(job)}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button sx={{ minWidth: 40, color: 'text.secondary' }}>
                <ShareIcon />
              </Button>
              <Button sx={{ minWidth: 40, color: 'text.secondary' }}>
                <MoreHorizIcon />
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} mt={3} flexWrap="wrap" useFlexGap>
            <Chip label={job.modality || 'Sin modalidad'} sx={{ fontWeight: 700, bgcolor: softPrimary }} />
            <Chip label={`${job.experience_years || 0}+ años experiencia`} sx={{ fontWeight: 700, bgcolor: softPrimary }} />

            {job.education_level && (
              <Chip label={job.education_level} sx={{ fontWeight: 700, bgcolor: softPrimary }} />
            )}

            <Chip
              label={getMatchLabel(job)}
              color={getMatchColor(job)}
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />
          </Stack>

          <Stack direction="row" spacing={1.5} mt={3}>
            {user?.role === 'CANDIDATE' ? (
              <Button
                variant="contained"
                onClick={() => onApply(job)}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  py: 1,
                  fontWeight: 900,
                  textTransform: 'none',
                  boxShadow: '0 8px 18px rgba(11,102,195,0.24)'
                }}
              >
                Solicitar empleo
              </Button>
            ) : !user ? (
              <Button
                variant="contained"
                component={RouterLink}
                to="/login"
                sx={{
                  borderRadius: 999,
                  px: 3,
                  py: 1,
                  fontWeight: 900,
                  textTransform: 'none',
                  boxShadow: '0 8px 18px rgba(11,102,195,0.24)'
                }}
              >
                Iniciar sesión para aplicar
              </Button>
            ) : null}

            <Button
              variant={saved ? 'contained' : 'outlined'}
              startIcon={saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              onClick={() => toggleSaveJob(job.id)}
              sx={{
                borderRadius: 999,
                px: 3,
                py: 1,
                fontWeight: 900,
                textTransform: 'none'
              }}
            >
              {saved ? 'Guardado' : 'Guardar'}
            </Button>
            {user?.role === 'CANDIDATE' && job.company_id && !job.is_company_confidential && (
              <Button
                variant="outlined"
                startIcon={<ChatBubbleOutlineIcon />}
                onClick={handleContactCompany}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  py: 1,
                  fontWeight: 900,
                  textTransform: 'none'
                }}
              >
                Contactar a la empresa
              </Button>
            )}
            {user?.role === 'CANDIDATE' && <Button color="error" onClick={() => onReport?.(job.id)}>Reportar</Button>}
          </Stack>

          <Stack direction="row" spacing={1} mt={3} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={formatDate(job.created_at)} variant="outlined" />

            <Chip
              size="small"
              label={getJobStatusLabel(job.status)}
              color={getJobStatusColor(job.status)}
            />

            {isNewJob(job.created_at) && (
              <Chip size="small" label="Nueva" color="primary" />
            )}
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: 4, py: 3 }}>
          <Typography variant="h5" fontWeight={900} mb={2}>
            Acerca del empleo
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              whiteSpace: 'pre-line',
              lineHeight: 1.75,
              fontSize: 16
            }}
          >
            {job.description || 'No hay descripción disponible.'}
          </Typography>

          {job.skills_required && (
            <Box mt={4}>
              <Typography variant="h5" fontWeight={900} mb={2}>
                Habilidades requeridas
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  whiteSpace: 'pre-line',
                  lineHeight: 1.75,
                  fontSize: 16
                }}
              >
                {job.skills_required}
              </Typography>
            </Box>
          )}

          {(job.salary_min || job.salary_max) && (
            <Box mt={4}>
              <Typography variant="h5" fontWeight={900} mb={2}>
                Salario
              </Typography>

              <Typography color="text.secondary" fontSize={16}>
                {getSalaryLabel(job)}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
