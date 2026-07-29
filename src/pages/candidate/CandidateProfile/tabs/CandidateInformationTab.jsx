import React from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BadgeIcon from "@mui/icons-material/Badge";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SchoolIcon from "@mui/icons-material/School";
import TranslateIcon from "@mui/icons-material/Translate";
import WorkIcon from "@mui/icons-material/Work";
import SaveIcon from "@mui/icons-material/Save";

import useCatalog from "../../../../hooks/useCatalog";

export default function CandidateInformationTab({
  form,
  setValue,
  skillsArray,
  languagesArray,
  saving,
  onSave,
}) {
  const { labels: skillsOptions } = useCatalog("skills");
  const { labels: languageOptions } = useCatalog("languages");
  const { labels: professionalAreas } = useCatalog("professional_areas");
  const { labels: educationLevels } = useCatalog("education_levels");
  const { labels: experienceLevels } = useCatalog("experience_levels");
  const { labels: departments } = useCatalog("nicaragua_departments");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave();
  };

  return (
    <Stack component="form" spacing={3} onSubmit={handleSubmit}>
      <SectionTitle
        title="Información principal"
        subtitle="Estos datos formarán la presentación principal de tu perfil."
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Nombre completo"
            value={form.name}
            onChange={(event) => setValue("name", event.target.value)}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            label="Ubicación"
            value={form.location}
            onChange={(event) => setValue("location", event.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon />
                </InputAdornment>
              ),
            }}
          >
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <TextField
        label="Titular profesional"
        placeholder="Ej: Contador Senior | Analista financiero | Desarrollador Full Stack"
        value={form.headline}
        onChange={(event) => setValue("headline", event.target.value)}
        fullWidth
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <WorkIcon />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Resumen profesional"
        placeholder="Describe tu experiencia, fortalezas, logros y el tipo de oportunidad que buscas..."
        multiline
        minRows={5}
        value={form.summary}
        onChange={(event) => setValue("summary", event.target.value)}
        fullWidth
        inputProps={{
          maxLength: 2000,
        }}
        helperText={`${form.summary?.length || 0}/2000 caracteres`}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Fecha de nacimiento"
            type="date"
            value={form.birth_date}
            onChange={(event) => setValue("birth_date", event.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            label="Área profesional"
            value={form.professional_area}
            onChange={(event) =>
              setValue("professional_area", event.target.value)
            }
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessCenterIcon />
                </InputAdornment>
              ),
            }}
          >
            {professionalAreas.map((area) => (
              <MenuItem key={area} value={area}>
                {area}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <SectionTitle
        title="Formación y experiencia"
        subtitle="Esta información ayuda a las empresas a identificar rápidamente tu nivel profesional."
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Nivel de experiencia"
            value={form.experience_level}
            onChange={(event) =>
              setValue("experience_level", event.target.value)
            }
            fullWidth
          >
            {experienceLevels.map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Años de experiencia"
            type="number"
            value={form.experience_years}
            onChange={(event) =>
              setValue("experience_years", event.target.value)
            }
            fullWidth
            inputProps={{
              min: 0,
              max: 60,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WorkIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Nivel académico"
            value={form.education_level}
            onChange={(event) =>
              setValue("education_level", event.target.value)
            }
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SchoolIcon />
                </InputAdornment>
              ),
            }}
          >
            {educationLevels.map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Autocomplete
        multiple
        freeSolo
        options={skillsOptions}
        value={skillsArray}
        onChange={(_, newValue) => {
          setValue("skills", newValue.join(", "));
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={`${option}-${index}`}
              label={option}
              color="primary"
              variant="outlined"
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Habilidades"
            placeholder="Selecciona o escribe una habilidad"
            helperText="Puedes seleccionar habilidades existentes o escribir nuevas."
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <AutoAwesomeIcon />
                  </InputAdornment>

                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <Autocomplete
        multiple
        freeSolo
        options={languageOptions}
        value={languagesArray}
        onChange={(_, newValue) => {
          setValue("languages", newValue.join(", "));
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={`${option}-${index}`}
              label={option}
              color="secondary"
              variant="outlined"
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Idiomas"
            placeholder="Selecciona o escribe un idioma"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <TranslateIcon />
                  </InputAdornment>

                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          pt: 1,
        }}
      >
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={saving}
          startIcon={
            saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          sx={{
            minWidth: 190,
            py: 1.2,
            borderRadius: 3,
            fontWeight: 800,
            textTransform: "none",
          }}
        >
          {saving ? "Guardando..." : "Guardar información"}
        </Button>
      </Box>
    </Stack>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={900}>
        {title}
      </Typography>

      {subtitle && (
        <Typography variant="body2" color="text.secondary" mt={0.4}>
          {subtitle}
        </Typography>
      )}

      <Divider sx={{ mt: 1.5 }} />
    </Box>
  );
}