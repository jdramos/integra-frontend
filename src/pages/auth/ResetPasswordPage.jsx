import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordRequest } from '../../api/auth';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('El enlace no es válido. Solicita uno nuevo.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setSaving(true);
      const data = await resetPasswordRequest(token, password);
      setMessage(data?.message || 'Contraseña actualizada correctamente.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo restablecer la contraseña');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box maxWidth={460} mx="auto">
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" mb={1}>
          Restablecer contraseña
        </Typography>

        <Typography color="text.secondary" mb={3}>
          Ingresa tu nueva contraseña.
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!token && !message && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Este enlace no incluye un token válido. Solicita uno nuevo desde la página de recuperación.
          </Alert>
        )}

        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <TextField
            label="Nueva contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Confirmar contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            required
          />

          <Button
            type="submit"
            size="large"
            variant="contained"
            disabled={saving || !token}
            sx={{ py: 1.2, borderRadius: 3 }}
          >
            {saving ? 'Guardando...' : 'Restablecer contraseña'}
          </Button>

          <Button component={RouterLink} to="/login">
            Volver a iniciar sesión
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
