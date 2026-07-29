import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmailRequest } from '../../api/auth';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [state, setState] = useState({ loading: true, error: '', message: '' });
  useEffect(() => {
    const token = params.get('token');
    if (!token) return setState({ loading: false, error: 'Enlace inválido', message: '' });
    verifyEmailRequest(token).then((r) => setState({ loading: false, error: '', message: r.message }))
      .catch((e) => setState({ loading: false, error: e?.response?.data?.message || 'No se pudo verificar', message: '' }));
  }, [params]);
  return <Box maxWidth={520} mx="auto"><Paper sx={{p:4,borderRadius:4}}><Stack spacing={2} alignItems="center">
    <Typography variant="h4">Verificación de correo</Typography>{state.loading && <CircularProgress />}
    {state.message && <Alert severity="success">{state.message}</Alert>}{state.error && <Alert severity="error">{state.error}</Alert>}
    {!state.loading && <Button component={Link} to="/login" variant="contained">Iniciar sesión</Button>}
  </Stack></Paper></Box>;
}
