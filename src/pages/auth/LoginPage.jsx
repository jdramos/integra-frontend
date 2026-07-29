import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';

import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

import useAuth from '../../auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

  const setValue = (field, value) =>
    setForm({ ...form, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await login(form);

      if (user.role === 'COMPANY_ADMIN') {
        navigate('/company');
      } else if (user.role === 'CANDIDATE') {
        navigate('/feed');
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('LOGIN ERROR:', err);

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'No se pudo iniciar sesión'
      );
    }
  };

  return (
    <Box maxWidth={460} mx="auto">
      <Paper
        sx={{
          p: 4,
          borderRadius: 4
        }}
      >
        <Typography variant="h4" mb={1}>
          Iniciar sesión
        </Typography>

        <Typography color="text.secondary" mb={3}>
          Accede a tu cuenta profesional.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* LOGIN GOOGLE */}
        <Button
          fullWidth
          size="large"
          variant="outlined"
          startIcon={<FcGoogle />}
          sx={{
            py: 1.2,
            mb: 2,
            textTransform: 'none',
            fontSize: 16,
            borderRadius: 3
          }}
          onClick={() => {
            window.location.href =
              import.meta.env.VITE_API_BASE_URL +
              '/auth/google';
          }}
        >
          Continuar con Google
        </Button>

        <Divider sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            o continúa con correo
          </Typography>
        </Divider>

        <Stack
          component="form"
          spacing={2}
          onSubmit={handleSubmit}
        >
          <TextField
            label="Correo"
            value={form.email}
            onChange={(e) =>
              setValue('email', e.target.value)
            }
            fullWidth
          />

          <TextField
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={(e) =>
              setValue('password', e.target.value)
            }
            fullWidth
          />

          <Button
            type="submit"
            size="large"
            variant="contained"
            sx={{
              py: 1.2,
              borderRadius: 3
            }}
          >
            Entrar
          </Button>
        </Stack>

        <Stack mt={3} spacing={1}>
          <Typography variant="body2">
            Demo admin: admin@joblink.com / 123456
          </Typography>

          <Typography variant="body2">
            Demo empresa: empresa@joblink.com / 123456
          </Typography>

          <Typography variant="body2">
            Demo candidato: candidato@joblink.com / 123456
          </Typography>

          <Button
            component={RouterLink}
            to="/register-candidate"
          >
            Crear cuenta de candidato gratis
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}