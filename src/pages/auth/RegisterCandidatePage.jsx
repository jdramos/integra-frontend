import React, { useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { registerCandidate } from '../../api/auth';
import { FcGoogle } from "react-icons/fc";

export default function RegisterCandidatePage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    headline: '',
    location: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const setValue = (field, value) => setForm({ ...form, [field]: value });

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('');
  setError('');

  try {
    const res = await registerCandidate(form);

    const token = res?.token || res?.data?.token;
    const user = res?.user || res?.data?.user;

    if (token) {
      localStorage.setItem('jobboard_token', token);

      if (user) {
        localStorage.setItem('jobboard_user', JSON.stringify(user));
      }

      window.location.href = '/candidate/dashboard';
      return;
    }

    setMessage('Cuenta creada. Ahora puedes iniciar sesión.');
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
          <TextField label="Contraseña" type="password" value={form.password} onChange={(e) => setValue('password', e.target.value)} />
          <TextField label="Titular profesional" placeholder="Ej: Desarrollador React" value={form.headline} onChange={(e) => setValue('headline', e.target.value)} />
          <TextField label="Ubicación" placeholder="Ej: Managua, Nicaragua" value={form.location} onChange={(e) => setValue('location', e.target.value)} />
          <Button type="submit" size="large" variant="contained">Crear cuenta gratis</Button>
          <Button component={RouterLink} to="/login">Ya tengo cuenta</Button>
          <Button
            fullWidth
            size="large"
            variant="outlined"
            onClick={() => {
              window.location.href =
               import.meta.env.VITE_API_BASE_URL + "/auth/google";
            }}
          >
            Continuar con Google
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
