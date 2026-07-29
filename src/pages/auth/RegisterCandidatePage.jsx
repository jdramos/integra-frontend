import React, { useState } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { registerCandidate } from '../../api/auth';
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import useCatalog from '../../hooks/useCatalog';

export default function RegisterCandidatePage() {
  const facebookLoginEnabled = import.meta.env.VITE_ENABLE_FACEBOOK_LOGIN === 'true';
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    headline: '',
    location: '',
    accept_terms: false
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { labels: departments } = useCatalog('nicaragua_departments');

  const setValue = (field, value) => setForm({ ...form, [field]: value });

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('');
  setError('');

  try {
    const res = await registerCandidate(form);

    setMessage('Cuenta creada. Revisa tu correo para verificarla antes de iniciar sesión.');
  } catch (err) {
    setError(err?.response?.data?.message || 'No se pudo registrar');
  }
};

  return (
    <Box maxWidth={560} mx="auto">
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" mb={1}>Crear perfil gratis</Typography>
        <Typography color="text.secondary" mb={3}>Los candidatos no pagan nada.</Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <TextField label="Nombre completo" value={form.name} onChange={(e) => setValue('name', e.target.value)} />
          <TextField label="Correo" value={form.email} onChange={(e) => setValue('email', e.target.value)} />
          <TextField label="Contraseña" type="password" inputProps={{ minLength: 8 }} helperText="Mínimo 8 caracteres" value={form.password} onChange={(e) => setValue('password', e.target.value)} />
          <TextField label="Titular profesional" placeholder="Ej: Desarrollador React" value={form.headline} onChange={(e) => setValue('headline', e.target.value)} />
          <TextField select label="Ubicación" value={form.location} onChange={(e) => setValue('location', e.target.value)}>
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </TextField>
          <FormControlLabel control={<Checkbox required checked={form.accept_terms} onChange={(e)=>setValue('accept_terms',e.target.checked)}/>} label={<span>Acepto los <RouterLink to="/terms">términos</RouterLink> y la <RouterLink to="/privacy">política de privacidad</RouterLink></span>} />
          <Button type="submit" size="large" variant="contained">Crear cuenta gratis</Button>
          <Button component={RouterLink} to="/login">Ya tengo cuenta</Button>
          <Button
            fullWidth
            size="large"
            variant="outlined"
            disabled={!form.accept_terms}
            onClick={() => {
              window.location.href =
               import.meta.env.VITE_API_BASE_URL + "/auth/google";
            }}
          >
            Continuar con Google
          </Button>
          {facebookLoginEnabled && (
            <Button
              fullWidth
              size="large"
              variant="outlined"
              startIcon={<FaFacebook color="#1877F2" />}
              disabled={!form.accept_terms}
              onClick={() => {
                window.location.href =
                  import.meta.env.VITE_API_BASE_URL + "/auth/facebook";
              }}
            >
              Continuar con Facebook
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
