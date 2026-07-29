import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { getCandidateByIdForCompany } from '../../api/company';

export default function CompanyCandidateDetailPage() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCandidate = async () => {
      try {
        const data = await getCandidateByIdForCompany(id);
        setCandidate(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'No se pudo cargar el candidato');
      }
    };

    loadCandidate();
  }, [id]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!candidate) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          {!candidate.canSeeContact && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Tu plan actual no permite ver datos de contacto ni descargar CV.
              Actualiza a PRO para desbloquear esta información.
            </Alert>
          )}

          <Grid container spacing={2} mt={2}>

             <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={900} color="primary">
                {candidate.score || 0}%
                </Typography>
                <Typography variant="caption">Match</Typography>
            </Paper>
            </Grid>
            
            <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={900}>
                    {candidate.age || '--'}
                </Typography>
                <Typography variant="caption">Edad</Typography>
                </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={900}>
                    {candidate.experience_years || 0}
                </Typography>
                <Typography variant="caption">Años exp.</Typography>
                </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={900}>
                    {candidate.education_level || '--'}
                </Typography>
                <Typography variant="caption">Educación</Typography>
                </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={900}>
                    {candidate.location || '--'}
                </Typography>
                <Typography variant="caption">Ubicación</Typography>
                </Paper>
            </Grid>
            
           
            
            </Grid>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <Avatar
              src={candidate.photo_url || ''}
              sx={{
                width: 110,
                height: 110,
                bgcolor: 'primary.main',
                fontSize: 42
              }}
            >
              {candidate.name?.charAt(0)}
            </Avatar>

            <Box flex={1}>
              <Typography variant="h4" fontWeight={900}>
                {candidate.name}
              </Typography>

              <Typography variant="h6" color="primary.main" fontWeight={800}>
                {candidate.headline || 'Profesional'}
              </Typography>

              <Typography color="text.secondary" mt={0.5}>
                {candidate.location || 'Sin ubicación'}
              </Typography>

              <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                <Chip label={`${candidate.experience_years || 0} años de experiencia`} />
                {candidate.education_level && (
                  <Chip label={candidate.education_level} />
                )}
                {candidate.plan && (
                  <Chip color="primary" label={`Tu plan: ${candidate.plan}`} />
                )}
              </Stack>
            </Box>
          </Stack>

          <Typography variant="h6" mt={4}>
            Resumen profesional
          </Typography>
          <Typography mt={1} sx={{ whiteSpace: 'pre-wrap' }}>
            {candidate.summary || 'Sin resumen registrado.'}
          </Typography>

          <Typography variant="h6" mt={4}>
            Habilidades
          </Typography>
          <Typography mt={1}>
            {candidate.skills || 'Sin habilidades registradas.'}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" mb={2}>
            Contacto del candidato
          </Typography>

          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                {candidate.canSeeContact ? <EmailIcon color="primary" /> : <LockIcon color="warning" />}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Correo
                  </Typography>
                  <Typography fontWeight={800}>
                    {candidate.canSeeContact
                      ? candidate.email || 'Sin correo'
                      : 'Bloqueado'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                {candidate.canSeeContact ? <DescriptionIcon color="primary" /> : <LockIcon color="warning" />}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    CV
                  </Typography>

                  {candidate.canSeeContact && candidate.cv_url ? (
                    <Button
                      href={candidate.cv_url}
                      target="_blank"
                      rel="noreferrer"
                      sx={{ p: 0, minWidth: 0 }}
                    >
                      Ver CV
                    </Button>
                  ) : (
                    <Typography fontWeight={800}>Bloqueado</Typography>
                  )}
                </Box>
              </Stack>
            </Paper>

            {!candidate.canSeeContact && (
              <Button variant="contained" fullWidth>
                Actualizar a PRO
              </Button>
            )}

            <Button component={RouterLink} to="/company/candidates" variant="outlined" fullWidth>
              Volver a candidatos
            </Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}