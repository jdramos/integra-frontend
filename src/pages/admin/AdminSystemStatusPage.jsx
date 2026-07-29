import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Grid, Paper, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import EmailIcon from '@mui/icons-material/Email';
import CloudIcon from '@mui/icons-material/Cloud';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { getAdminSystemStatus } from '../../api/admin';

const labels = {
  operational: ['Operativo', 'success'], configured: ['Configurado', 'success'],
  degraded: ['Con incidencias', 'warning'], disabled: ['Desactivado', 'warning'],
  not_configured: ['No configurado', 'error'],
};

function StatusCard({ title, icon, service, children }) {
  const [label, color] = labels[service?.status] || [service?.status || 'Desconocido', 'default'];
  return (
    <Paper elevation={0} sx={{ p: 2.5, height: '100%', borderRadius: 4 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center"><Box color="primary.main">{icon}</Box><Typography fontWeight={900}>{title}</Typography></Stack>
          <Chip size="small" label={label} color={color} />
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

const dateText = (value) => value ? new Date(value).toLocaleString('es-NI') : 'Sin ejecuciones';

export default function AdminSystemStatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setLoading(true); setError(''); setStatus(await getAdminSystemStatus()); }
    catch (err) { setError(err?.response?.data?.message || 'No se pudo comprobar el sistema.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
        <Box><Typography variant="h4" fontWeight={900}>Estado del sistema</Typography><Typography color="text.secondary">Diagnóstico operativo sin exposición de credenciales.</Typography></Box>
        <Button startIcon={<RefreshIcon />} variant="outlined" onClick={load} disabled={loading}>Actualizar</Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {loading && !status ? <Stack alignItems="center" py={8}><CircularProgress /></Stack> : status && (
        <>
          <Alert severity={Object.values(status.configuration).every(Boolean) ? 'success' : 'warning'}>
            Entorno {status.environment} · tiempo activo {Math.floor(status.uptime_seconds / 60)} minutos · comprobado {dateText(status.checked_at)}
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><StatusCard title="Base de datos" icon={<StorageIcon />} service={status.services.database}><Typography color="text.secondary">Latencia: {status.services.database.latency_ms} ms</Typography></StatusCard></Grid>
            <Grid item xs={12} md={6}><StatusCard title="Correo transaccional" icon={<EmailIcon />} service={status.services.email}><Typography color="text.secondary">Proveedor: {status.services.email.provider}</Typography><Typography variant="body2">Últimas 24 h: {Number(status.services.email.accepted_24h || 0)} aceptados, {Number(status.services.email.failed_24h || 0)} fallidos</Typography><Typography variant="caption">Último aceptado: {dateText(status.services.email.last_accepted_at)}</Typography></StatusCard></Grid>
            <Grid item xs={12} md={6}><StatusCard title="Almacenamiento de archivos" icon={<CloudIcon />} service={status.services.storage}><Typography color="text.secondary">Proveedor: {status.services.storage.provider}</Typography><Typography variant="body2">Bucket: {status.services.storage.bucket || 'No definido'}</Typography></StatusCard></Grid>
            <Grid item xs={12} md={6}><StatusCard title="Recordatorios de cobro" icon={<ScheduleIcon />} service={status.services.billing_scheduler}><Typography color="text.secondary">Última ejecución: {dateText(status.services.billing_scheduler.last_run_at)}</Typography><Typography variant="body2">Último éxito: {dateText(status.services.billing_scheduler.last_success_at)}</Typography>{status.services.billing_scheduler.last_error && <Alert severity="error">{status.services.billing_scheduler.last_error}</Alert>}</StatusCard></Grid>
          </Grid>
          <Paper sx={{ p: 2.5, borderRadius: 4 }}><Typography fontWeight={900} mb={1}>Configuración crítica</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>{Object.entries({ 'URL del frontend': status.configuration.frontend_url, 'Secreto JWT seguro': status.configuration.jwt_secret, 'CORS configurado': status.configuration.cors_origins }).map(([name, ready]) => <Chip key={name} label={`${name}: ${ready ? 'Correcto' : 'Pendiente'}`} color={ready ? 'success' : 'error'} variant="outlined" />)}</Stack></Paper>
        </>
      )}
    </Stack>
  );
}
