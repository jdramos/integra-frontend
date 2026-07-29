import React from 'react';
import { Paper, Stack, Typography } from '@mui/material';

export default function StatCard({ title, value, icon }) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h4" fontWeight={900}>{value}</Typography>
        </Stack>
        {icon}
      </Stack>
    </Paper>
  );
}
