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
import { Link as RouterLink } from 'react-router-dom';
import { forgotPasswordRequest } from '../../api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      setSending(true);
      const data = await forgotPasswordRequest(email);
      setMessage(data?.message || 'Si el correo existe, te enviamos un enlace para restablecer tu contraseña.');
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo procesar la solicitud');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box maxWidth={460} mx="auto">
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" mb={1}>
          Recuperar contraseña
        </Typography>

        <Typography color="text.secondary" mb={3}>
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <TextField
            label="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />

          <Button type="submit" size="large" variant="contained" disabled={sending} sx={{ py: 1.2, borderRadius: 3 }}>
            {sending ? 'Enviando...' : 'Enviar enlace'}
          </Button>

          <Button component={RouterLink} to="/login">
            Volver a iniciar sesión
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
