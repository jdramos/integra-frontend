import React from 'react';
import { Box, Typography } from '@mui/material';

export default function EmptyState({ title = 'Sin registros', text = 'No hay información para mostrar.' }) {
  return (
    <Box textAlign="center" py={6}>
      <Typography variant="h6" fontWeight={800}>{title}</Typography>
      <Typography color="text.secondary">{text}</Typography>
    </Box>
  );
}
