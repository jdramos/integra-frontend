import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LinkIcon from '@mui/icons-material/Link';
import SaveIcon from '@mui/icons-material/Save';
import BadgeIcon from '@mui/icons-material/Badge';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TranslateIcon from '@mui/icons-material/Translate';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { getMyProfile, updateMyProfile } from '../../api/candidate';

const SKILLS_OPTIONS = [
  'React',
  'Node.js',
  'JavaScript',
  'TypeScript',
  'HTML',
  'CSS',
  'Material UI',
  'MySQL',
  'SQL Server',
  'Excel',
  'Power BI',
  'Ventas',
  'Atención al cliente',
  'Caja',
  'Contabilidad',
  'Administración',
  'Recursos Humanos',
  'Marketing Digital',
  'Diseño Gráfico',
  'Inglés',
  'Liderazgo',
  'Trabajo en equipo',
  'Comunicación',
  'Resolución de problemas',
  'Servicio al cliente'
];

const LANGUAGE_OPTIONS = [
  'Español',
  'Inglés básico',
  'Inglés intermedio',
  'Inglés avanzado',
  'Francés',
  'Portugués'
];

const PROFESSIONAL_AREAS = [
  'Tecnología',
  'Ventas',
  'Administración',
  'Contabilidad',
  'Recursos Humanos',
  'Marketing',
  'Operaciones',
  'Logística',
  'Atención al cliente',
  'Finanzas',
  'Legal',
  'Diseño',
  'Educación',
  'Salud',
  'Otro'
];

const EDUCATION_LEVELS = [
  'Primaria',
  'Secundaria',
  'Técnico',
  'Universitario',
  'Licenciatura',
  'Ingeniería',
  'Maestría',
  'Doctorado'
];

const EXPERIENCE_LEVELS = [
  'Sin experiencia',
  'Junior',
  'Semi Senior',
  'Senior',
  'Supervisor',
  'Gerencial'
];

const AVAILABILITY_OPTIONS = [
  'Inmediata',
  '15 días',
  '30 días',
  'Más de 30 días'
];

const JOB_TYPES = [
  'Tiempo completo',
  'Medio tiempo',
  'Por proyecto',
  'Temporal',
  'Pasantía'
];

const WORK_MODES = [
  'Presencial',
  'Remoto',
  'Híbrido'
];

const PROFILE_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Buscando empleo' },
  { value: 'OPEN_TO_OFFERS', label: 'Abierto a ofertas' },
  { value: 'NOT_AVAILABLE', label: 'No disponible' }
];

const LICENSE_TYPES = [
  'Categoría 1',
  'Categoría 2',
  'Categoría 3',
  'Categoría 4',
  'Categoría 5',
  'Categoría 6',
  'Categoría 7',
  'Categoría 8',
  'Profesional'
];

export default function CandidateProfilePage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    headline: '',
    summary: '',
    location: '',
    experience_years: '',
    education_level: '',
    skills: '',
    cv_url: '',
    photo_url: '',

    birth_date: '',
    availability: '',
    job_type: '',
    work_mode: '',
    expected_salary: '',
    experience_level: '',
    professional_area: '',
    languages: '',
    has_driver_license: false,
    license_type: '',
    has_vehicle: false,
    willing_to_travel: false,
    willing_to_relocate: false,
    last_position: '',
    last_company: '',
    profile_status: 'ACTIVE'
  });

  const setValue = (field, value) => {
    setMessage('');
    setError('');
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const splitValue = (value) => {
    return String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const skillsArray = useMemo(() => splitValue(form.skills), [form.skills]);
  const languagesArray = useMemo(() => splitValue(form.languages), [form.languages]);

  const profileCompletion = useMemo(() => {
    const fields = [
      form.name,
      form.headline,
      form.summary,
      form.location,
      form.experience_years,
      form.education_level,
      form.skills,
      form.cv_url,
      form.photo_url,
      form.birth_date,
      form.availability,
      form.job_type,
      form.work_mode,
      form.expected_salary,
      form.experience_level,
      form.professional_area,
      form.languages,
      form.last_position,
      form.profile_status
    ];

    const completed = fields.filter((value) => String(value || '').trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  }, [form]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await getMyProfile();

        if (data) {
          setForm({
            name: data.name || '',
            headline: data.headline || '',
            summary: data.summary || '',
            location: data.location || '',
            experience_years: data.experience_years ?? '',
            education_level: data.education_level || '',
            skills: data.skills || '',
            cv_url: data.cv_url || '',
            photo_url: data.photo_url || '',

            birth_date: data.birth_date ? String(data.birth_date).slice(0, 10) : '',
            availability: data.availability || '',
            job_type: data.job_type || '',
            work_mode: data.work_mode || '',
            expected_salary: data.expected_salary ?? '',
            experience_level: data.experience_level || '',
            professional_area: data.professional_area || '',
            languages: data.languages || '',
            has_driver_license: Number(data.has_driver_license || 0) === 1,
            license_type: data.license_type || '',
            has_vehicle: Number(data.has_vehicle || 0) === 1,
            willing_to_travel: Number(data.willing_to_travel || 0) === 1,
            willing_to_relocate: Number(data.willing_to_relocate || 0) === 1,
            last_position: data.last_position || '',
            last_company: data.last_company || '',
            profile_status: data.profile_status || 'ACTIVE'
          });
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'No se pudo cargar tu perfil.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const validate = () => {
    if (!form.name.trim()) return 'El nombre es obligatorio.';
    if (!form.headline.trim()) return 'El titular profesional es obligatorio.';

    if (form.experience_years !== '' && Number(form.experience_years) < 0) {
      return 'Los años de experiencia no pueden ser negativos.';
    }

    if (form.expected_salary !== '' && Number(form.expected_salary) < 0) {
      return 'La pretensión salarial no puede ser negativa.';
    }

    if (form.has_driver_license && !form.license_type) {
      return 'Selecciona el tipo de licencia.';
    }

    return '';
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError('');

      await updateMyProfile({
        ...form,
        experience_years:
          form.experience_years === '' || form.experience_years == null
            ? 0
            : Number(form.experience_years),
        expected_salary:
          form.expected_salary === '' || form.expected_salary == null
            ? null
            : Number(form.expected_salary),
        has_driver_license: form.has_driver_license ? 1 : 0,
        has_vehicle: form.has_vehicle ? 1 : 0,
        willing_to_travel: form.willing_to_travel ? 1 : 0,
        willing_to_relocate: form.willing_to_relocate ? 1 : 0,
        license_type: form.has_driver_license ? form.license_type : ''
      });

      setMessage('Perfil actualizado correctamente.');
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 5, borderRadius: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography mt={2} color="text.secondary">
          Cargando tu perfil...
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box
            sx={{
              p: 4,
              color: '#fff',
              background: 'linear-gradient(135deg, #0F172A 0%, #1D4ED8 100%)'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={form.photo_url}
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '3px solid rgba(255,255,255,0.35)'
                }}
              >
                <PersonIcon fontSize="large" />
              </Avatar>

              <Box>
                <Typography variant="h4" fontWeight={800}>
                  Mi perfil profesional
                </Typography>
                <Typography sx={{ opacity: 0.85 }}>
                  Completa tu perfil para mejorar tu visibilidad ante empresas.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ p: 4 }}>
            <Stack spacing={2} mb={3}>
              {message && <Alert severity="success">{message}</Alert>}
              {error && <Alert severity="error">{error}</Alert>}

              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.8}>
                  <Typography variant="body2" fontWeight={700}>
                    Completitud del perfil
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight={800}>
                    {profileCompletion}%
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    height: 10,
                    borderRadius: 99,
                    bgcolor: 'grey.200',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      width: `${profileCompletion}%`,
                      height: '100%',
                      bgcolor:
                        profileCompletion >= 80
                          ? 'success.main'
                          : profileCompletion >= 50
                            ? 'warning.main'
                            : 'error.main',
                      transition: '0.3s'
                    }}
                  />
                </Box>
              </Box>
            </Stack>

            <Stack component="form" spacing={3} onSubmit={handleSave}>
              <SectionTitle title="Información principal" />

              <TextField
                label="Nombre completo"
                value={form.name}
                onChange={(e) => setValue('name', e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                label="Titular profesional"
                placeholder="Ej: Desarrollador Full Stack | Ejecutivo de ventas | Contador"
                value={form.headline}
                onChange={(e) => setValue('headline', e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                label="Resumen profesional"
                placeholder="Describe tu experiencia, fortalezas y el tipo de oportunidad que buscas..."
                multiline
                minRows={4}
                value={form.summary}
                onChange={(e) => setValue('summary', e.target.value)}
                fullWidth
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Fecha de nacimiento"
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => setValue('birth_date', e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Ubicación"
                    placeholder="Ej: Managua, Nicaragua"
                    value={form.location}
                    onChange={(e) => setValue('location', e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>

              <SectionTitle title="Perfil laboral para matching" />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Área profesional"
                    value={form.professional_area}
                    onChange={(e) => setValue('professional_area', e.target.value)}
                    fullWidth
                  >
                    {PROFESSIONAL_AREAS.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Nivel de experiencia"
                    value={form.experience_level}
                    onChange={(e) => setValue('experience_level', e.target.value)}
                    fullWidth
                  >
                    {EXPERIENCE_LEVELS.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Años de experiencia"
                    type="number"
                    value={form.experience_years}
                    onChange={(e) => setValue('experience_years', e.target.value)}
                    fullWidth
                    inputProps={{ min: 0 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Escolaridad"
                    value={form.education_level}
                    onChange={(e) => setValue('education_level', e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SchoolIcon />
                        </InputAdornment>
                      )
                    }}
                  >
                    {EDUCATION_LEVELS.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Tipo de jornada"
                    value={form.job_type}
                    onChange={(e) => setValue('job_type', e.target.value)}
                    fullWidth
                  >
                    {JOB_TYPES.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Modalidad preferida"
                    value={form.work_mode}
                    onChange={(e) => setValue('work_mode', e.target.value)}
                    fullWidth
                  >
                    {WORK_MODES.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Disponibilidad"
                    value={form.availability}
                    onChange={(e) => setValue('availability', e.target.value)}
                    fullWidth
                  >
                    {AVAILABILITY_OPTIONS.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Pretensión salarial"
                    type="number"
                    value={form.expected_salary}
                    onChange={(e) => setValue('expected_salary', e.target.value)}
                    fullWidth
                    inputProps={{ min: 0 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>

              <Autocomplete
                multiple
                options={SKILLS_OPTIONS}
                value={skillsArray}
                onChange={(event, newValue) => {
                  setValue('skills', newValue.join(', '));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      color="primary"
                      variant="outlined"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Habilidades"
                    placeholder="Selecciona habilidades"
                    helperText="Selecciona una o varias habilidades de la lista."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <AutoAwesomeIcon />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />

              <Autocomplete
                multiple
                options={LANGUAGE_OPTIONS}
                value={languagesArray}
                onChange={(event, newValue) => {
                  setValue('languages', newValue.join(', '));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      color="secondary"
                      variant="outlined"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Idiomas"
                    placeholder="Selecciona idiomas"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <TranslateIcon />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />

              <SectionTitle title="Experiencia reciente" />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Último cargo desempeñado"
                    value={form.last_position}
                    onChange={(e) => setValue('last_position', e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessCenterIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Última empresa"
                    value={form.last_company}
                    onChange={(e) => setValue('last_company', e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <SectionTitle title="Disponibilidad adicional" />

              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.has_driver_license}
                        onChange={(e) => setValue('has_driver_license', e.target.checked)}
                      />
                    }
                    label="Tengo licencia de conducir"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.has_vehicle}
                        onChange={(e) => setValue('has_vehicle', e.target.checked)}
                      />
                    }
                    label="Tengo vehículo propio"
                  />
                </Grid>

                {form.has_driver_license && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="Tipo de licencia"
                      value={form.license_type}
                      onChange={(e) => setValue('license_type', e.target.value)}
                      fullWidth
                    >
                      {LICENSE_TYPES.map((item) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.willing_to_travel}
                        onChange={(e) => setValue('willing_to_travel', e.target.checked)}
                      />
                    }
                    label="Disponible para viajar"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.willing_to_relocate}
                        onChange={(e) => setValue('willing_to_relocate', e.target.checked)}
                      />
                    }
                    label="Disponible para cambiar residencia"
                  />
                </Grid>
              </Grid>

              <SectionTitle title="Enlaces y estado" />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Estado del perfil"
                    value={form.profile_status}
                    onChange={(e) => setValue('profile_status', e.target.value)}
                    fullWidth
                  >
                    {PROFILE_STATUS_OPTIONS.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="URL del CV"
                    placeholder="https://..."
                    value={form.cv_url}
                    onChange={(e) => setValue('cv_url', e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="URL de foto"
                    placeholder="https://..."
                    value={form.photo_url}
                    onChange={(e) => setValue('photo_url', e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{
                  py: 1.3,
                  borderRadius: 3,
                  fontWeight: 800,
                  textTransform: 'none'
                }}
              >
                {saving ? 'Guardando...' : 'Guardar perfil'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            position: { md: 'sticky' },
            top: { md: 90 }
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <Avatar
              src={form.photo_url}
              sx={{
                width: 110,
                height: 110,
                bgcolor: 'primary.main',
                boxShadow: 3
              }}
            >
              <PersonIcon sx={{ fontSize: 54 }} />
            </Avatar>

            <Box textAlign="center">
              <Typography variant="h6" fontWeight={800}>
                {form.name || 'Tu nombre'}
              </Typography>
              <Typography color="primary" fontWeight={700}>
                {form.headline || 'Titular profesional'}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {form.location || 'Ubicación'}
              </Typography>
            </Box>

            <Divider flexItem />

            <Stack spacing={1.2} width="100%">
              <InfoRow label="Área" value={form.professional_area || 'No definido'} />
              <InfoRow label="Experiencia" value={form.experience_years ? `${form.experience_years} años` : 'No definido'} />
              <InfoRow label="Nivel" value={form.experience_level || 'No definido'} />
              <InfoRow label="Escolaridad" value={form.education_level || 'No definido'} />
              <InfoRow label="Modalidad" value={form.work_mode || 'No definido'} />
              <InfoRow label="Jornada" value={form.job_type || 'No definido'} />
              <InfoRow label="Disponibilidad" value={form.availability || 'No definido'} />
              <InfoRow label="Salario esperado" value={form.expected_salary ? `C$ ${Number(form.expected_salary).toLocaleString()}` : 'No definido'} />
              <InfoRow label="CV" value={form.cv_url ? 'Disponible' : 'No agregado'} />
            </Stack>

            {form.summary && (
              <>
                <Divider flexItem />
                <Typography variant="body2" color="text.secondary">
                  {form.summary}
                </Typography>
              </>
            )}

            {skillsArray.length > 0 && (
              <>
                <Divider flexItem />
                <Typography variant="subtitle2" fontWeight={800}>
                  Habilidades
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
                  {skillsArray.slice(0, 10).map((skill) => (
                    <Chip key={skill} label={skill} size="small" />
                  ))}
                </Stack>
              </>
            )}

            <Alert severity="info" sx={{ mt: 1 }}>
              Estos datos ayudan a que las empresas encuentren tu perfil por criterios.
            </Alert>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}

function SectionTitle({ title }) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={800}>
        {title}
      </Typography>
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}