import React, { useEffect, useState } from 'react';
import { Avatar, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import WorkIcon from '@mui/icons-material/Work';
import { getPublicJobs } from '../../api/jobs';
import { getCandidateEducation, getCandidateExperiences, getMyProfile } from '../../api/candidate';
import OnboardingChecklist from '../../components/common/OnboardingChecklist';

export default function CandidateFeedPage() {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);

  useEffect(() => {
    getPublicJobs().then(setJobs);
    Promise.all([getMyProfile(), getCandidateExperiences(), getCandidateEducation()])
      .then(([profileData, experienceData, educationData]) => {
        setProfile(profileData);
        setExperiences(experienceData);
        setEducation(educationData);
      });
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, borderRadius: 4, textAlign: 'center' }}>
          <Avatar sx={{ width: 84, height: 84, mx: 'auto', bgcolor: 'primary.main', fontSize: 32 }}>
            {profile?.name?.charAt(0) || 'C'}
          </Avatar>
          <Typography variant="h6" mt={2}>{profile?.name}</Typography>
          <Typography color="text.secondary">{profile?.headline}</Typography>
          <Typography variant="body2" mt={1}>{profile?.location}</Typography>
          <Button sx={{ mt: 2 }} fullWidth variant="outlined" component={RouterLink} to="/candidate/profile">
            Editar perfil
          </Button>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Stack spacing={2}>
          <OnboardingChecklist
            title="Completa tu perfil profesional"
            description="Un perfil completo mejora tu visibilidad ante las empresas."
            steps={[
              { label: "Agrega titular, ubicación y resumen", complete: Boolean(profile?.headline && profile?.location && profile?.summary), to: "/candidate/profile" },
              { label: "Sube tu currículum", complete: Boolean(profile?.cv_url), to: "/candidate/profile" },
              { label: "Registra tu experiencia laboral", complete: experiences.length > 0, to: "/candidate/profile" },
              { label: "Registra tu formación académica", complete: education.length > 0, to: "/candidate/profile" },
              { label: "Define tus preferencias laborales", complete: Boolean(profile?.professional_area && profile?.job_type && profile?.work_mode), to: "/candidate/profile" },
            ]}
          />
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h5">Empleos para ti</Typography>
            <Typography color="text.secondary">Vacantes recientes según tu perfil profesional.</Typography>
          </Paper>

          {jobs.map((job) => (
            <Paper key={job.id} sx={{ p: 3, borderRadius: 4 }}>
              <Stack direction="row" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}><WorkIcon /></Avatar>
                <div>
                  <Typography variant="h6" color="primary.main" component={RouterLink} to={`/jobs/${job.id}`} sx={{ textDecoration: 'none' }}>
                    {job.title}
                  </Typography>
                  <Typography fontWeight={700}>{job.company_name}</Typography>
                  <Typography color="text.secondary">{job.location} · {job.modality}</Typography>
                  <Typography mt={1}>{job.description?.slice(0, 140)}...</Typography>
                  <Button sx={{ mt: 1 }} variant="contained" component={RouterLink} to={`/jobs/${job.id}`}>Ver empleo</Button>
                </div>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6">Consejo</Typography>
          <Typography color="text.secondary" mt={1}>
            Completa tus habilidades, experiencia y escolaridad para aparecer mejor en las búsquedas de empresas.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
