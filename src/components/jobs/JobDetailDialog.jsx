import React from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function JobDetailDialog({
  open,
  job,
  user,
  onClose,
  onApply,
  formatDate,
  getDaysAgo,
  getJobStatusLabel,
  getJobStatusColor,
  isNewJob
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight={800}>
          {job?.title}
        </Typography>

        <Typography color="text.secondary">
          {job?.company_name}
        </Typography>

        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
          <Chip label={getDaysAgo(job?.created_at)} />
          <Chip variant="outlined" label={formatDate(job?.created_at)} />

          <Chip
            label={getJobStatusLabel(job?.status)}
            color={getJobStatusColor(job?.status)}
          />

          {isNewJob(job?.created_at) && (
            <Chip label="Nueva" color="primary" />
          )}
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={job?.location || 'Sin ubicación'} />
            <Chip label={job?.modality || 'Sin modalidad'} />
            <Chip label={`${job?.experience_years || 0}+ años experiencia`} />

            {job?.education_level && (
              <Chip label={job.education_level} />
            )}
          </Stack>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Descripción del empleo
            </Typography>

            <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {job?.description || 'No hay descripción disponible.'}
            </Typography>
          </Box>

          {job?.skills_required && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Habilidades requeridas
              </Typography>

              <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {job.skills_required}
              </Typography>
            </Box>
          )}

          {(job?.salary_min || job?.salary_max) && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Salario
              </Typography>

              <Typography color="text.secondary">
                {job?.salary_min || 0} - {job?.salary_max || 0}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>
          Cerrar
        </Button>

        {user?.role === 'CANDIDATE' ? (
          <Button
            variant="contained"
            onClick={() => onApply(job.id)}
          >
            Aplicar gratis
          </Button>
        ) : !user ? (
          <Button
            variant="contained"
            component={RouterLink}
            to="/login"
          >
            Iniciar sesión para aplicar
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}