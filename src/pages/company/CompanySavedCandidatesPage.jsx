import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Link as RouterLink } from 'react-router-dom';
import {
  getSavedCandidatesForCompany,
  unsaveCandidateForCompany
} from '../../api/company';
import EmptyState from '../../components/common/EmptyState';

export default function CompanySavedCandidatesPage() {
  const [rows, setRows] = useState([]);

  const loadRows = async () => {
    setRows(await getSavedCandidatesForCompany());
  };

  useEffect(() => {
    loadRows();
  }, []);

  const handleRemove = async (id) => {
    await unsaveCandidateForCompany(id);
    loadRows();
  };

  return (
    <>
      <Typography variant="h4" mb={2}>
        Candidatos guardados
      </Typography>

      {rows.length === 0 && (
        <EmptyState
          title="No tienes candidatos guardados"
          text="Busca candidatos y guárdalos para revisarlos después."
        />
      )}

      <Grid container spacing={2}>
        {rows.map((row) => (
          <Grid item xs={12} md={6} key={row.saved_id}>
            <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
              <Stack direction="row" spacing={2}>
                <Avatar
                  src={row.photo_url || ''}
                  sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}
                >
                  {row.name?.charAt(0)}
                </Avatar>

                <div>
                  <Typography variant="h6">{row.name}</Typography>
                  <Typography color="primary.main" fontWeight={800}>
                    {row.headline}
                  </Typography>
                  <Typography color="text.secondary">
                    {row.location}
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    {row.experience_years} años exp. · {row.education_level}
                  </Typography>
                </div>
              </Stack>

              <Typography mt={2}>
                {row.summary || 'Sin resumen profesional.'}
              </Typography>

              <Typography mt={2} color="text.secondary">
                Habilidades: {row.skills || 'Sin habilidades'}
              </Typography>

              <Stack direction="row" spacing={1} mt={2}>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to={`/company/candidates/${row.id}`}
                >
                  Ver detalle
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => handleRemove(row.id)}
                >
                  Quitar
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}