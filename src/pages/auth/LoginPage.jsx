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

import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

import useAuth from '../../auth/AuthContext';
import { resendVerificationRequest } from '../../api/auth';

export default function LoginPage() {
  const facebookLoginEnabled = import.meta.env.VITE_ENABLE_FACEBOOK_LOGIN === 'true';
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: location.state?.email || '',
    password: ''
  });

  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const oauthError = new URLSearchParams(location.search).get('oauth_error');

  const setValue = (field, value) =>
    setForm({ ...form, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setNeedsVerification(false);
    setSubmitting(true);

    try {
      const user = await login(form);

      if (['COMPANY', 'COMPANY_ADMIN', 'COMPANY_USER'].includes(user.role)) {
        navigate('/company');
      } else if (user.role === 'CANDIDATE') {
        navigate('/feed');
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setNeedsVerification(err?.response?.status === 403 && String(err?.response?.data?.message || '').includes('verificar'));
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'No se pudo iniciar sesión'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!form.email.trim()) {
      setError('Ingresa tu correo para reenviar la verificación.');
      return;
    }
    try {
      setResending(true);
      setError('');
      const response = await resendVerificationRequest(form.email.trim());
      setSuccess(response?.message || 'Si la cuenta está pendiente, enviamos un nuevo enlace de verificación.');
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo reenviar el enlace. Inténtalo nuevamente.');
    } finally {
      setResending(false);
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
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {location.state?.registrationMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {location.state.registrationMessage}
          </Alert>
        )}
        {oauthError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {oauthError === 'facebook_not_configured'
              ? 'El acceso con Facebook todavía no está configurado.'
              : 'No se pudo iniciar sesión con Facebook. Verifica que tu cuenta comparta un correo e inténtalo nuevamente.'}
          </Alert>
        )}
        {needsVerification && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleResendVerification} disabled={resending}>
                {resending ? 'Enviando...' : 'Reenviar enlace'}
              </Button>
            }
          >
            Revisa también la carpeta de correo no deseado.
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

        {facebookLoginEnabled && (
          <Button
            fullWidth
            size="large"
            variant="outlined"
            startIcon={<FaFacebook color="#1877F2" />}
            sx={{
              py: 1.2,
              mb: 2,
              textTransform: 'none',
              fontSize: 16,
              borderRadius: 3
            }}
            onClick={() => {
              window.location.href = import.meta.env.VITE_API_BASE_URL + '/auth/facebook';
            }}
          >
            Continuar con Facebook
          </Button>
        )}

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

          <Box textAlign="right" mt={-1}>
            <Typography
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              color="primary"
              sx={{ textDecoration: 'none' }}
            >
              ¿Olvidaste tu contraseña?
            </Typography>
          </Box>

          <Button
            type="submit"
            size="large"
            variant="contained"
            disabled={submitting}
            sx={{
              py: 1.2,
              borderRadius: 3
            }}
          >
            {submitting ? 'Ingresando...' : 'Entrar'}
          </Button>
        </Stack>

        <Stack mt={3} spacing={1}>
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
