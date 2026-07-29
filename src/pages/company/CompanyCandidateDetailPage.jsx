import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { getCandidateByIdForCompany, requestPlanUpgrade, getPlans } from '../../api/company';
import { getCandidateCvViewUrlForCompany } from '../../api/candidate';

const PROFILE_STATUS_LABELS = {
  ACTIVE: 'Buscando empleo',
  OPEN_TO_OFFERS: 'Abierto a ofertas',
  NOT_AVAILABLE: 'No disponible'
};

function formatMonthYear(value) {
  return value ? String(value).slice(0, 7) : '';
}

function formatRange(startDate, endDate, isCurrent) {
  const start = startDate ? formatMonthYear(startDate) : '?';
  const end = isCurrent ? 'Actualidad' : endDate ? formatMonthYear(endDate) : '?';
  return `${start} — ${end}`;
}

function InfoItem({ label, value }) {
  if (!value) return null;

  return (
    <Grid item xs={6} sm={4} md={3}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={800}>{value}</Typography>
    </Grid>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" mt={4} mb={1}>
      {icon}
      <Typography variant="h6" fontWeight={900}>
        {title}
      </Typography>
    </Stack>
  );
}

export default function CompanyCandidateDetailPage() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState('');
  const [cvError, setCvError] = useState('');
  const [loadingCv, setLoadingCv] = useState(false);

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState('');
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [sendingUpgrade, setSendingUpgrade] = useState(false);
  const [upgradeSent, setUpgradeSent] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');
  const [availablePlans, setAvailablePlans] = useState([]);

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

  useEffect(() => {
    getPlans().then(setAvailablePlans).catch(() => setAvailablePlans([]));
  }, []);

  const handleViewCv = async () => {
    try {
      setLoadingCv(true);
      setCvError('');
      const data = await getCandidateCvViewUrlForCompany(id);
      window.open(data.url, '_blank', 'noreferrer');
    } catch (err) {
      setCvError(err?.response?.data?.message || 'No se pudo abrir el CV.');
    } finally {
      setLoadingCv(false);
    }
  };

  const handleOpenUpgrade = () => {
    setUpgradeSent(false);
    setUpgradeError('');
    setUpgradeMessage('');
    setUpgradePlan(availablePlans[0]?.code || '');
    setUpgradeOpen(true);
  };

  const handleSendUpgrade = async () => {
    try {
      setSendingUpgrade(true);
      setUpgradeError('');

      await requestPlanUpgrade({
        plan_code: upgradePlan,
        message: upgradeMessage,
      });

      setUpgradeSent(true);
    } catch (err) {
      setUpgradeError(err?.response?.data?.message || 'No se pudo enviar la solicitud.');
    } finally {
      setSendingUpgrade(false);
    }
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!candidate) {
    return null;
  }

  const skillsArray = String(candidate.skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const languagesArray = String(candidate.languages || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const experiences = candidate.experiences || [];
  const education = candidate.education || [];
  const certificates = candidate.certificates || [];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
          {candidate.cover_url && (
            <Box
              sx={{
                height: 140,
                background: `url("${candidate.cover_url}") center/cover no-repeat`
              }}
            />
          )}

          <Box sx={{ p: 4 }}>
            {!candidate.canSeeContact && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Tu plan actual no permite ver datos de contacto ni descargar CV.
                Actualiza tu plan para desbloquear esta información.
              </Alert>
            )}

            <Grid container spacing={2} mb={3}>
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

                <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
                  <Chip label={`${candidate.experience_years || 0} años de experiencia`} />
                  {candidate.education_level && <Chip label={candidate.education_level} />}
                  {candidate.profile_status && (
                    <Chip
                      color={candidate.profile_status === 'NOT_AVAILABLE' ? 'default' : 'success'}
                      label={PROFILE_STATUS_LABELS[candidate.profile_status] || candidate.profile_status}
                    />
                  )}
                  {candidate.plan && <Chip color="primary" label={`Tu plan: ${candidate.plan}`} />}
                </Stack>
              </Box>
            </Stack>

            <Divider sx={{ mt: 4 }} />

            <SectionTitle icon={<BusinessCenterIcon color="primary" />} title="Información profesional" />

            <Grid container spacing={2}>
              <InfoItem label="Área profesional" value={candidate.professional_area} />
              <InfoItem label="Nivel de experiencia" value={candidate.experience_level} />
              <InfoItem label="Modalidad preferida" value={candidate.work_mode} />
              <InfoItem label="Tipo de jornada" value={candidate.job_type} />
              <InfoItem label="Disponibilidad" value={candidate.availability} />
              <InfoItem
                label="Pretensión salarial"
                value={
                  candidate.expected_salary
                    ? `C$ ${Number(candidate.expected_salary).toLocaleString()}`
                    : ''
                }
              />
              <InfoItem label="Último cargo" value={candidate.last_position} />
              <InfoItem label="Última empresa" value={candidate.last_company} />
              <InfoItem
                label="Licencia de conducir"
                value={
                  candidate.has_driver_license
                    ? candidate.license_type
                      ? `Sí (${candidate.license_type})`
                      : 'Sí'
                    : ''
                }
              />
              <InfoItem label="Vehículo propio" value={candidate.has_vehicle ? 'Sí' : ''} />
              <InfoItem label="Disponible para viajar" value={candidate.willing_to_travel ? 'Sí' : ''} />
              <InfoItem
                label="Disponible para reubicarse"
                value={candidate.willing_to_relocate ? 'Sí' : ''}
              />
            </Grid>

            <Typography variant="h6" mt={4} fontWeight={900}>
              Resumen profesional
            </Typography>
            <Typography mt={1} sx={{ whiteSpace: 'pre-wrap' }}>
              {candidate.summary || 'Sin resumen registrado.'}
            </Typography>

            <Typography variant="h6" mt={4} fontWeight={900}>
              Habilidades
            </Typography>
            {skillsArray.length ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1}>
                {skillsArray.map((skill) => (
                  <Chip key={skill} label={skill} size="small" />
                ))}
              </Stack>
            ) : (
              <Typography mt={1} color="text.secondary">
                Sin habilidades registradas.
              </Typography>
            )}

            {languagesArray.length > 0 && (
              <>
                <Typography variant="h6" mt={4} fontWeight={900}>
                  Idiomas
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1}>
                  {languagesArray.map((lang) => (
                    <Chip key={lang} label={lang} size="small" color="secondary" variant="outlined" />
                  ))}
                </Stack>
              </>
            )}

            <SectionTitle icon={<BusinessCenterIcon color="primary" />} title="Experiencia laboral" />
            {experiences.length ? (
              <Stack spacing={1.5}>
                {experiences.map((item) => (
                  <Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                    <Typography fontWeight={800}>{item.position}</Typography>
                    <Typography color="text.secondary">{item.company_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatRange(item.start_date, item.end_date, item.is_current)}
                    </Typography>
                    {item.description && (
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {item.description}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">Sin experiencia registrada.</Typography>
            )}

            <SectionTitle icon={<SchoolIcon color="primary" />} title="Educación" />
            {education.length ? (
              <Stack spacing={1.5}>
                {education.map((item) => (
                  <Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                    <Typography fontWeight={800}>{item.degree}</Typography>
                    <Typography color="text.secondary">{item.institution}</Typography>
                    {item.field_of_study && (
                      <Typography variant="body2" color="text.secondary">
                        {item.field_of_study}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {formatRange(item.start_date, item.end_date, item.is_current)}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">Sin educación registrada.</Typography>
            )}

            <SectionTitle icon={<WorkspacePremiumIcon color="primary" />} title="Certificaciones" />
            {certificates.length ? (
              <Stack spacing={1.5}>
                {certificates.map((item) => (
                  <Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                    <Typography fontWeight={800}>{item.name}</Typography>
                    {item.issuer && <Typography color="text.secondary">{item.issuer}</Typography>}
                    {item.issue_date && (
                      <Typography variant="caption" color="text.secondary">
                        Emitido: {formatMonthYear(item.issue_date)}
                        {item.expiration_date && ` · Vence: ${formatMonthYear(item.expiration_date)}`}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">Sin certificaciones registradas.</Typography>
            )}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 4, position: { md: 'sticky' }, top: { md: 90 } }}>
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
                      onClick={handleViewCv}
                      disabled={loadingCv}
                      sx={{ p: 0, minWidth: 0 }}
                    >
                      {loadingCv ? 'Abriendo...' : 'Ver CV'}
                    </Button>
                  ) : (
                    <Typography fontWeight={800}>Bloqueado</Typography>
                  )}
                </Box>
              </Stack>

              {cvError && (
                <Alert severity="error" sx={{ mt: 1.5, borderRadius: 3 }}>
                  {cvError}
                </Alert>
              )}
            </Paper>

            {!candidate.canSeeContact && (
              <Button variant="contained" fullWidth onClick={handleOpenUpgrade}>
                Actualizar plan
              </Button>
            )}

            <Button component={RouterLink} to="/company/candidates" variant="outlined" fullWidth>
              Volver a candidatos
            </Button>
          </Stack>
        </Paper>
      </Grid>

      <Dialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={900}>Actualizar plan</DialogTitle>

        <DialogContent>
          {upgradeSent ? (
            <Alert severity="success" sx={{ mt: 1 }}>
              ¡Solicitud enviada! Pronto nos pondremos en contacto contigo para activar tu nuevo plan.
            </Alert>
          ) : (
            <Stack spacing={2} mt={1}>
              <Typography color="text.secondary">
                Cuéntanos qué plan te interesa y te contactaremos para activarlo.
              </Typography>

              {upgradeError && <Alert severity="error">{upgradeError}</Alert>}

              <TextField
                select
                label="Plan de interés"
                value={upgradePlan}
                onChange={(e) => setUpgradePlan(e.target.value)}
                fullWidth
              >
                {availablePlans.map((plan) => (
                  <MenuItem key={plan.code} value={plan.code}>
                    {plan.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Mensaje (opcional)"
                multiline
                minRows={3}
                value={upgradeMessage}
                onChange={(e) => setUpgradeMessage(e.target.value)}
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUpgradeOpen(false)}>
            {upgradeSent ? 'Cerrar' : 'Cancelar'}
          </Button>

          {!upgradeSent && (
            <Button
              variant="contained"
              onClick={handleSendUpgrade}
              disabled={sendingUpgrade}
              sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
            >
              {sendingUpgrade ? 'Enviando...' : 'Enviar solicitud'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
