import React, { useEffect, useState } from 'react';
import { Alert, Box, Chip, CircularProgress, MenuItem, Pagination, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { getAdminAuditLog } from '../../api/admin';

const actionColors = { POST: 'success', PUT: 'info', PATCH: 'warning', DELETE: 'error' };

export default function AdminAuditLogPage() {
  const [data, setData] = useState({ rows: [], pagination: { page: 1, pages: 1, total: 0 } });
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getAdminAuditLog({ page, action })
      .then((response) => { if (active) setData(response); })
      .catch((err) => { if (active) setError(err?.response?.data?.message || 'No se pudo cargar la auditoría.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, action]);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4" fontWeight={900}>Registro de auditoría</Typography>
        <Typography color="text.secondary">Acciones administrativas sensibles realizadas en la plataforma.</Typography>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
        <Typography fontWeight={700}>{data.pagination.total || 0} acciones registradas</Typography>
        <TextField select size="small" label="Tipo de acción" value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} sx={{ minWidth: 190 }}>
          <MenuItem value="">Todas</MenuItem>
          {['POST', 'PUT', 'PATCH', 'DELETE'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </TextField>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      <Paper sx={{ overflow: 'auto' }}>
        {loading ? <Stack alignItems="center" py={7}><CircularProgress /></Stack> : (
          <Table size="small">
            <TableHead><TableRow><TableCell>Fecha</TableCell><TableCell>Administrador</TableCell><TableCell>Acción</TableCell><TableCell>Recurso</TableCell><TableCell>Resultado</TableCell><TableCell>IP</TableCell></TableRow></TableHead>
            <TableBody>
              {data.rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(row.created_at).toLocaleString('es-NI')}</TableCell>
                  <TableCell><Typography variant="body2" fontWeight={700}>{row.user_name || 'Usuario eliminado'}</Typography><Typography variant="caption" color="text.secondary">{row.user_email}</Typography></TableCell>
                  <TableCell><Chip size="small" label={row.action} color={actionColors[row.action] || 'default'} /></TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{row.path}</Typography>{row.target_id && <Typography variant="caption">ID: {row.target_id}</Typography>}</TableCell>
                  <TableCell><Chip size="small" label={row.status_code} color={row.status_code < 400 ? 'success' : 'error'} variant="outlined" /></TableCell>
                  <TableCell>{row.ip_address || '—'}</TableCell>
                </TableRow>
              ))}
              {!data.rows.length && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}>No hay acciones para mostrar.</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </Paper>
      {data.pagination.pages > 1 && <Pagination page={page} count={data.pagination.pages} onChange={(_, value) => setPage(value)} color="primary" sx={{ alignSelf: 'center' }} />}
    </Stack>
  );
}
