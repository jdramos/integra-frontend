import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import VerifiedIcon from '@mui/icons-material/Verified';
import { getMyCompany, updateMyCompany } from '../../api/company';

const emptyForm = {
  name: '',
  description: '',
  website: '',
  location: '',
  logo_url: ''
};

function isValidUrl(value) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

export default function CompanyProfilePage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [originalForm, setOriginalForm] = useState(emptyForm);
  const [form, setForm] = useState(emptyForm);

  const setValue = (field, value) => {
    setMessage('');
    setError('');
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const errors = useMemo(() => {
    const currentErrors = {};

    if (!form.name.trim()) {
      currentErrors.name = 'El nombre de la empresa es obligatorio.';
    }

    if (form.website && !isValidUrl(form.website)) {
      currentErrors.website = 'Ingresa una URL válida. Ejemplo: https://empresa.com';
    }

    if (form.logo_url && !isValidUrl(form.logo_url)) {
      currentErrors.logo_url = 'Ingresa una URL válida para el logo.';
    }

    if (form.description && form.description.length > 1000) {
      currentErrors.description = 'La descripción no debe superar los 1000 caracteres.';
    }

    return currentErrors;
  }, [form]);

  const hasErrors = Object.keys(errors).length > 0;

  const profileProgress = useMemo(() => {
    const fields = ['name', 'description', 'website', 'location', 'logo_url'];
    const completed = fields.filter((field) => String(form[field] || '').trim()).length;
    return Math.round((completed / fields.length) * 100);
  }, [form]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(originalForm);
  }, [form, originalForm]);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getMyCompany();

        const nextForm = {
          name: data?.name || '',
          description: data?.description || '',
          website: data?.website || '',
          location: data?.location || '',
          logo_url: data?.logo_url || ''
        };

        setForm(nextForm);
        setOriginalForm(nextForm);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'No se pudo cargar la información de la empresa.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, []);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage('');
    }, 3500);

    return () => clearTimeout(timer);
  }, [message]);

  const handleRestore = () => {
    setForm(originalForm);
    setMessage('');
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (hasErrors) {
      setError('Revisa los campos marcados antes de guardar.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      await updateMyCompany(form);

      setOriginalForm(form);
      setMessage('Empresa actualizada correctamente.');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'No se pudo actualizar la empresa.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">
            Cargando perfil de empresa...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)',
            color: 'white'
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={form.logo_url}
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: 'white',
                  color: 'primary.main'
                }}
              >
                <BusinessIcon fontSize="large" />
              </Avatar>

              <Box>
                <Typography variant="h4" fontWeight={800}>
                  Perfil de empresa
                </Typography>
                <Typography sx={{ opacity: 0.85 }}>
                  Esta información aparecerá en tus vacantes públicas.
                </Typography>
              </Box>
            </Stack>

            <Chip
              icon={<VerifiedIcon />}
              label={`${profileProgress}% completado`}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'white',
                fontWeight: 700,
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4 }}>
          <Stack spacing={1} mb={3}>
            <Typography variant="h5" fontWeight={800}>
              Información general
            </Typography>
            <Typography color="text.secondary">
              Mantén tu perfil actualizado para generar más confianza en los candidatos.
            </Typography>
          </Stack>

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack component="form" spacing={2.2} onSubmit={handleSave}>
            <TextField
              label="Nombre de la empresa"
              value={form.name}
              onChange={(e) => setValue('name', e.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
              fullWidth
              required
            />

            <TextField
              label="Descripción"
              multiline
              minRows={5}
              value={form.description}
              onChange={(e) => setValue('description', e.target.value)}
              error={Boolean(errors.description)}
              helperText={
                errors.description ||
                `${form.description.length}/1000 caracteres`
              }
              fullWidth
            />

            <TextField
              label="Sitio web"
              value={form.website}
              onChange={(e) => setValue('website', e.target.value)}
              error={Boolean(errors.website)}
              helperText={errors.website || 'Ejemplo: https://miempresa.com'}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LanguageIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              label="Ubicación"
              value={form.location}
              onChange={(e) => setValue('location', e.target.value)}
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
              label="URL del logo"
              value={form.logo_url}
              onChange={(e) => setValue('logo_url', e.target.value)}
              error={Boolean(errors.logo_url)}
              helperText={errors.logo_url || 'Debe ser una imagen accesible por URL pública.'}
              fullWidth
            />

            <Divider />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              justifyContent="flex-end"
            >
              <Button
                variant="outlined"
                startIcon={<RestoreIcon />}
                onClick={handleRestore}
                disabled={!hasChanges || saving}
              >
                Restaurar
              </Button>

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                disabled={saving || !hasChanges}
              >
                {saving ? 'Guardando...' : 'Guardar empresa'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Stack spacing={3}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800}>
              Marca empleadora
            </Typography>

            <Typography color="text.secondary" mt={1} mb={2}>
              Completa tu perfil para que tus vacantes se vean más confiables.
            </Typography>

            <LinearProgress
              variant="determinate"
              value={profileProgress}
              sx={{ height: 10, borderRadius: 5, mb: 1.5 }}
            />

            <Typography variant="body2" color="text.secondary">
              Perfil completado al {profileProgress}%.
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} mb={2}>
              Vista previa
            </Typography>

            <Stack spacing={2} alignItems="center" textAlign="center">
              <Avatar
                src={form.logo_url}
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: 'primary.main'
                }}
              >
                <BusinessIcon fontSize="large" />
              </Avatar>

              <Box>
                <Typography variant="h6" fontWeight={800}>
                  {form.name || 'Nombre de la empresa'}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {form.location || 'Ubicación no definida'}
                </Typography>
              </Box>

              {form.website && isValidUrl(form.website) && (
                <Chip
                  icon={<LanguageIcon />}
                  label="Sitio web disponible"
                  color="primary"
                  variant="outlined"
                />
              )}

              <Typography variant="body2" color="text.secondary">
                {form.description ||
                  'Aquí se mostrará la descripción de la empresa para que los candidatos conozcan mejor tu marca.'}
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
}