import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { getJobReports, updateJobReport } from '../../api/admin';

export default function AdminJobReportsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setRows(await getJobReports());
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudieron cargar los reportes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const change = async (id, status) => {
    try {
      setUpdatingId(id);
      setError('');
      await updateJobReport(id, status);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo actualizar el reporte.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={900}>Reportes de vacantes</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Paper sx={{ overflow: 'auto' }}>
        {loading ? (
          <Stack alignItems="center" py={7}><CircularProgress /></Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow><TableCell>Vacante</TableCell><TableCell>Empresa</TableCell><TableCell>Motivo</TableCell><TableCell>Estado</TableCell><TableCell>Acciones</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {rows.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>{report.company_name}</TableCell>
                  <TableCell>{report.reason}<Typography variant="caption" display="block">{report.details}</Typography></TableCell>
                  <TableCell><Chip label={report.status} /></TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Button disabled={updatingId === report.id} onClick={() => change(report.id, 'REVIEWED')}>Revisado</Button>
                    <Button disabled={updatingId === report.id} color="success" onClick={() => change(report.id, 'ACTIONED')}>Acción tomada</Button>
                    <Button disabled={updatingId === report.id} onClick={() => change(report.id, 'DISMISSED')}>Descartar</Button>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}>No hay reportes de vacantes.</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}
