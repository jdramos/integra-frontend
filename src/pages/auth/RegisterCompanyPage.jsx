import React, { useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { registerCompany } from '../../api/auth';

export default function RegisterCompanyPage() {
  const [form, setForm] = useState({
    companyName: '',
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const setValue = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await registerCompany(form);
      setMessage('Empresa registrada con plan de prueba. Ya puedes iniciar sesión.');
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo registrar la empresa');
    }
  };

  return (
    <Box maxWidth={560} mx="auto">
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" mb={1}>Publica vacantes</Typography>
        <Typography color="text.secondary" mb={3}>Las empresas pagan por planes mensuales.</Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <TextField label="Nombre de la empresa" value={form.companyName} onChange={(e) => setValue('companyName', e.target.value)} />
          <TextField label="Nombre del administrador" value={form.name} onChange={(e) => setValue('name', e.target.value)} />
          <TextField label="Correo" value={form.email} onChange={(e) => setValue('email', e.target.value)} />
          <TextField label="Contraseña" type="password" value={form.password} onChange={(e) => setValue('password', e.target.value)} />
          <Button type="submit" size="large" variant="contained">Registrar empresa</Button>
          <Button component={RouterLink} to="/login">Ya tengo cuenta</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
