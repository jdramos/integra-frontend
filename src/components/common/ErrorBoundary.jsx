import React from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Error no controlado:', error, info);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Paper sx={{ p: 5, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={900} mb={1.5}>
            Algo salió mal
          </Typography>

          <Typography color="text.secondary" mb={3}>
            Ocurrió un error inesperado. Puedes volver al inicio e intentarlo de nuevo.
          </Typography>

          {import.meta.env.DEV && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: 'grey.100',
                textAlign: 'left',
                fontSize: 13,
                fontFamily: 'monospace',
                overflowX: 'auto'
              }}
            >
              {String(this.state.error?.message || this.state.error)}
            </Box>
          )}

          <Button variant="contained" onClick={this.handleReload}>
            Volver al inicio
          </Button>
        </Paper>
      </Container>
    );
  }
}
