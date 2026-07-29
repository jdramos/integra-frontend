import React, { useState } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { registerCompany } from '../../api/auth';

export default function RegisterCompanyPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '',
    name: '',
    email: '',
    password: '',
    accept_terms: false
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const setValue = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!form.accept_terms) {
      setError('Debes aceptar los términos y la política de privacidad');
      return;
    }

    try {
      await registerCompany(form);
      navigate('/login', {
        replace: true,
        state: {
          registrationMessage: 'Empresa registrada correctamente. Ya puedes iniciar sesión.',
          email: form.email
        }
      });
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
          <TextField required label="Nombre de la empresa" value={form.companyName} onChange={(e) => setValue('companyName', e.target.value)} />
          <TextField required label="Nombre del administrador" value={form.name} onChange={(e) => setValue('name', e.target.value)} />
          <TextField required type="email" label="Correo" value={form.email} onChange={(e) => setValue('email', e.target.value)} />
          <TextField required label="Contraseña" type="password" inputProps={{ minLength: 8 }} helperText="Mínimo 8 caracteres" value={form.password} onChange={(e) => setValue('password', e.target.value)} />
          <Box sx={{ border: '1px solid', borderColor: form.accept_terms ? 'primary.main' : 'divider', borderRadius: 2, px: 1.5, py: 0.75, bgcolor: 'grey.50' }}>
            <FormControlLabel
              sx={{ m: 0, alignItems: 'flex-start' }}
              control={<Checkbox required checked={form.accept_terms} onChange={(e) => setValue('accept_terms', e.target.checked)} />}
              label={<Typography component="span" variant="body2" sx={{ display: 'block', pt: 1 }}>Acepto los <RouterLink to="/terms">términos</RouterLink> y la <RouterLink to="/privacy">política de privacidad</RouterLink>.</Typography>}
            />
          </Box>
          <Button disabled={!form.accept_terms} type="submit" size="large" variant="contained">Registrar empresa</Button>
          <Button component={RouterLink} to="/login">Ya tengo cuenta</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
