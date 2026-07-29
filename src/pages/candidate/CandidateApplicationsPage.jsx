import React, { useEffect, useState } from 'react';
import { Chip, Paper, Stack, Typography } from '@mui/material';
import { getMyApplications } from '../../api/jobs';
import EmptyState from '../../components/common/EmptyState';

export default function CandidateApplicationsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getMyApplications().then(setRows);
  }, []);

  return (
    <>
      <Typography variant="h4" mb={2}>Mis postulaciones</Typography>

      <Stack spacing={2}>
        {rows.length === 0 && <EmptyState title="Aún no has aplicado" text="Explora empleos y aplica gratis." />}

        {rows.map((row) => (
          <Paper key={row.id} sx={{ p: 3, borderRadius: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <div>
                <Typography variant="h6">{row.title}</Typography>
                <Typography fontWeight={700}>{row.company_name}</Typography>
                <Typography color="text.secondary">{row.location} · {row.modality}</Typography>
                <Typography variant="body2" mt={1}>Aplicaste el {row.created_at}</Typography>
              </div>
              <Chip label={row.status} color="primary" />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </>
  );
}
