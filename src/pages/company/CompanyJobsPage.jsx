import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimelineIcon from '@mui/icons-material/Timeline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link as RouterLink } from 'react-router-dom';
import { createJob, getMyJobs, updateJob, updateJobStatus } from '../../api/jobs';

const initialForm = {
  title: '',
  description: '',
  location: '',
  modality: 'PRESENCIAL',
  salary_min: '',
  salary_max: '',
  experience_years: '',
  education_level: '',
  skills_required: ''
};

const modalityOptions = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'REMOTO', label: 'Remoto' },
  { value: 'HIBRIDO', label: 'Híbrido' }
];

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingJobId, setEditingJobId] = useState(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [loadingJobs, setLoadingJobs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingStatusId, setChangingStatusId] = useState(null);

  const isEditing = Boolean(editingJobId);

  const setValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const stats = useMemo(() => {
    const total = jobs.length;
    const open = jobs.filter((job) => job.status === 'OPEN').length;
    const paused = jobs.filter((job) => job.status === 'PAUSED').length;
    const applicants = jobs.reduce(
      (acc, job) => acc + Number(job.applications_count || 0),
      0
    );

    return { total, open, paused, applicants };
  }, [jobs]);

  const loadJobs = async () => {
    try {
      setLoadingJobs(true);
      setError('');

      const data = await getMyJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudieron cargar las vacantes');
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const validateForm = () => {
    if (!form.title.trim()) return 'El título del puesto es obligatorio.';
    if (!form.description.trim()) return 'La descripción es obligatoria.';
    if (!form.location.trim()) return 'La ubicación es obligatoria.';

    if (form.salary_min && Number(form.salary_min) < 0) {
      return 'El salario mínimo no puede ser negativo.';
    }

    if (form.salary_max && Number(form.salary_max) < 0) {
      return 'El salario máximo no puede ser negativo.';
    }

    if (
      form.salary_min &&
      form.salary_max &&
      Number(form.salary_min) > Number(form.salary_max)
    ) {
      return 'El salario mínimo no puede ser mayor que el salario máximo.';
    }

    if (form.experience_years && Number(form.experience_years) < 0) {
      return 'Los años de experiencia no pueden ser negativos.';
    }

    return '';
  };

  const buildPayload = () => ({
    ...form,
    salary_min: form.salary_min === '' ? null : Number(form.salary_min),
    salary_max: form.salary_max === '' ? null : Number(form.salary_max),
    experience_years:
      form.experience_years === '' ? null : Number(form.experience_years)
  });

  const resetForm = () => {
    setForm(initialForm);
    setEditingJobId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await updateJob(editingJobId, buildPayload());
        setMessage('Vacante actualizada correctamente.');
      } else {
        await createJob(buildPayload());
        setMessage('Vacante publicada correctamente.');
      }

      resetForm();
      await loadJobs();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (isEditing ? 'No se pudo actualizar la vacante' : 'No se pudo crear la vacante')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (job) => {
    setMessage('');
    setError('');
    setEditingJobId(job.id);

    setForm({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      modality: job.modality || 'PRESENCIAL',
      salary_min: job.salary_min ?? '',
      salary_max: job.salary_max ?? '',
      experience_years: job.experience_years ?? '',
      education_level: job.education_level || '',
      skills_required: job.skills_required || ''
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeStatus = async (id, status) => {
    try {
      setChangingStatusId(id);
      setMessage('');
      setError('');

      await updateJobStatus(id, status);
      await loadJobs();

      setMessage(
        status === 'OPEN'
          ? 'Vacante abierta correctamente.'
          : 'Vacante pausada correctamente.'
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo cambiar el estado');
    } finally {
      setChangingStatusId(null);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salario no definido';
    if (min && max) return `C$ ${Number(min).toLocaleString()} - C$ ${Number(max).toLocaleString()}`;
    if (min) return `Desde C$ ${Number(min).toLocaleString()}`;
    return `Hasta C$ ${Number(max).toLocaleString()}`;
  };

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: 4,
          color: 'white',
          background: 'linear-gradient(135deg, #0B2E59 0%, #1565C0 100%)',
          boxShadow: '0 14px 35px rgba(11,46,89,0.25)'
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Gestión de vacantes
            </Typography>
            <Typography sx={{ opacity: 0.9, mt: 0.5 }}>
              Publicá, editá, pausá y revisá postulantes desde un solo lugar.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip icon={<WorkIcon />} label={`${stats.total} vacantes`} sx={chipHeaderSx} />
            <Chip label={`${stats.open} abiertas`} sx={chipHeaderSx} />
            <Chip label={`${stats.paused} pausadas`} sx={chipHeaderSx} />
            <Chip icon={<PeopleIcon />} label={`${stats.applicants} postulantes`} sx={chipHeaderSx} />
          </Stack>
        </Stack>
      </Paper>

      {(message || error) && (
        <Box sx={{ mb: 3 }}>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: isEditing ? 'primary.main' : 'divider',
              position: 'sticky',
              top: 88
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              {isEditing ? <EditIcon color="primary" /> : <AddCircleIcon color="primary" />}
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  {isEditing ? 'Editar vacante' : 'Publicar vacante'}
                </Typography>
                {isEditing && (
                  <Typography variant="body2" color="text.secondary">
                    Estás modificando una vacante publicada.
                  </Typography>
                )}
              </Box>
            </Stack>

            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
              <TextField
                label="Título del puesto"
                value={form.title}
                onChange={(e) => setValue('title', e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Descripción"
                multiline
                minRows={4}
                value={form.description}
                onChange={(e) => setValue('description', e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Ubicación"
                value={form.location}
                onChange={(e) => setValue('location', e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                select
                label="Modalidad"
                value={form.modality}
                onChange={(e) => setValue('modality', e.target.value)}
                fullWidth
              >
                {modalityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Salario mínimo"
                    type="number"
                    value={form.salary_min}
                    onChange={(e) => setValue('salary_min', e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">C$</InputAdornment>
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Salario máximo"
                    type="number"
                    value={form.salary_max}
                    onChange={(e) => setValue('salary_max', e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">C$</InputAdornment>
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Años de experiencia"
                type="number"
                value={form.experience_years}
                onChange={(e) => setValue('experience_years', e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimelineIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                label="Escolaridad"
                value={form.education_level}
                onChange={(e) => setValue('education_level', e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                label="Habilidades requeridas"
                placeholder="Ej: Excel, ventas, atención al cliente"
                value={form.skills_required}
                onChange={(e) => setValue('skills_required', e.target.value)}
                fullWidth
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={saving}
                  startIcon={
                    saving ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : isEditing ? (
                      <SaveIcon />
                    ) : (
                      <AddCircleIcon />
                    )
                  }
                  sx={{ py: 1.3, borderRadius: 3, fontWeight: 800 }}
                  fullWidth
                >
                  {saving
                    ? isEditing
                      ? 'Guardando...'
                      : 'Publicando...'
                    : isEditing
                      ? 'Guardar cambios'
                      : 'Publicar vacante'}
                </Button>

                {isEditing && (
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    disabled={saving}
                    startIcon={<CancelIcon />}
                    onClick={resetForm}
                    sx={{ py: 1.3, borderRadius: 3, fontWeight: 800 }}
                    fullWidth
                  >
                    Cancelar
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight={800}>
              Mis vacantes
            </Typography>

            {loadingJobs && <CircularProgress size={24} />}
          </Stack>

          {!loadingJobs && jobs.length === 0 && (
            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                textAlign: 'center',
                border: '1px dashed',
                borderColor: 'divider'
              }}
            >
              <WorkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" fontWeight={800}>
                Todavía no tenés vacantes
              </Typography>
              <Typography color="text.secondary">
                Creá tu primera vacante desde el formulario de la izquierda.
              </Typography>
            </Paper>
          )}

          <Stack spacing={2}>
            {jobs.map((job) => {
              const isOpen = job.status === 'OPEN';
              const isChanging = changingStatusId === job.id;
              const isSelected = editingJobId === job.id;

              return (
                <Paper
                  key={job.id}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected ? 'primary.50' : 'background.paper',
                    transition: '0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
                    }
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                    spacing={2}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                        <Typography variant="h6" fontWeight={800}>
                          {job.title}
                        </Typography>

                        <Chip
                          size="small"
                          label={isOpen ? 'Abierta' : 'Pausada'}
                          color={isOpen ? 'success' : 'default'}
                          sx={{ fontWeight: 700 }}
                        />

                        {isSelected && (
                          <Chip
                            size="small"
                            label="Editando"
                            color="primary"
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </Stack>

                      <Typography color="text.secondary" mb={1}>
                        {job.location || 'Sin ubicación'} · {job.modality || 'Sin modalidad'}
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          icon={<PeopleIcon />}
                          label={`${job.applications_count || 0} postulantes`}
                          variant="outlined"
                        />

                        <Chip
                          icon={<AttachMoneyIcon />}
                          label={formatSalary(job.salary_min, job.salary_max)}
                          variant="outlined"
                        />

                        {job.experience_years !== null && job.experience_years !== undefined && (
                          <Chip
                            icon={<TimelineIcon />}
                            label={`${job.experience_years} años exp.`}
                            variant="outlined"
                          />
                        )}

                        {job.education_level && (
                          <Chip
                            icon={<SchoolIcon />}
                            label={job.education_level}
                            variant="outlined"
                          />
                        )}
                      </Stack>

                      {job.skills_required && (
                        <>
                          <Divider sx={{ my: 1.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            <strong>Habilidades:</strong> {job.skills_required}
                          </Typography>
                        </>
                      )}
                    </Box>

                    <Stack
                      direction={{ xs: 'row', sm: 'column' }}
                      spacing={1}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      <Button
                        component={RouterLink}
                        to={`/company/jobs/${job.id}/applicants`}
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        sx={{ borderRadius: 3, fontWeight: 800 }}
                        fullWidth
                      >
                        Postulantes
                      </Button>

                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(job)}
                        sx={{ borderRadius: 3, fontWeight: 800 }}
                        fullWidth
                      >
                        Editar
                      </Button>

                      {isOpen ? (
                        <Button
                          color="warning"
                          variant="outlined"
                          disabled={isChanging}
                          startIcon={
                            isChanging ? <CircularProgress size={18} /> : <PauseCircleIcon />
                          }
                          onClick={() => changeStatus(job.id, 'PAUSED')}
                          sx={{ borderRadius: 3, fontWeight: 800 }}
                          fullWidth
                        >
                          Pausar
                        </Button>
                      ) : (
                        <Button
                          color="success"
                          variant="outlined"
                          disabled={isChanging}
                          startIcon={
                            isChanging ? <CircularProgress size={18} /> : <PlayCircleIcon />
                          }
                          onClick={() => changeStatus(job.id, 'OPEN')}
                          sx={{ borderRadius: 3, fontWeight: 800 }}
                          fullWidth
                        >
                          Abrir
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

const chipHeaderSx = {
  bgcolor: 'rgba(255,255,255,0.16)',
  color: 'white',
  fontWeight: 800,
  '& .MuiChip-icon': {
    color: 'white'
  }
};