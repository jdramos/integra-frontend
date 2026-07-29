import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SaveIcon from "@mui/icons-material/Save";

import useCatalog from "../../../../hooks/useCatalog";

export default function CandidatePreferencesTab({
  form,
  setValue,
  saving,
  onSave,
}) {
  const { labels: jobTypes } = useCatalog("job_types_candidate");
  const { labels: workModes } = useCatalog("work_modes_candidate");
  const { labels: availabilityOptions } = useCatalog("availability_options");
  const { items: profileStatusOptions } = useCatalog("profile_status");
  const { labels: licenseTypes } = useCatalog("license_types");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave();
  };

  return (
    <Stack component="form" spacing={3} onSubmit={handleSubmit}>
      <SectionTitle
        title="Preferencias laborales"
        subtitle="Define el tipo de oportunidad que buscas y tu disponibilidad."
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            select
            label="Tipo de jornada"
            value={jobTypes.includes(form.job_type) ? form.job_type : ""}
            onChange={(event) =>
              setValue("job_type", event.target.value)
            }
            fullWidth
          >
            {jobTypes.map((item) => (
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
            value={workModes.includes(form.work_mode) ? form.work_mode : ""}
            onChange={(event) =>
              setValue("work_mode", event.target.value)
            }
            fullWidth
          >
            {workModes.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            label="Disponibilidad para iniciar"
            value={availabilityOptions.includes(form.availability) ? form.availability : ""}
            onChange={(event) =>
              setValue("availability", event.target.value)
            }
            fullWidth
          >
            {availabilityOptions.map((item) => (
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
            onChange={(event) =>
              setValue("expected_salary", event.target.value)
            }
            fullWidth
            inputProps={{
              min: 0,
              step: "0.01",
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            select
            label="Estado del perfil"
            value={form.profile_status}
            onChange={(event) =>
              setValue("profile_status", event.target.value)
            }
            fullWidth
          >
            {profileStatusOptions.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <SectionTitle
        title="Movilidad y disponibilidad adicional"
        subtitle="Esta información ayuda a filtrar oportunidades compatibles contigo."
      />

      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(form.has_driver_license)}
                onChange={(event) =>
                  setValue(
                    "has_driver_license",
                    event.target.checked
                  )
                }
              />
            }
            label="Tengo licencia de conducir"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(form.has_vehicle)}
                onChange={(event) =>
                  setValue("has_vehicle", event.target.checked)
                }
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
              onChange={(event) =>
                setValue("license_type", event.target.value)
              }
              fullWidth
            >
              {licenseTypes.map((item) => (
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
                checked={Boolean(form.willing_to_travel)}
                onChange={(event) =>
                  setValue(
                    "willing_to_travel",
                    event.target.checked
                  )
                }
              />
            }
            label="Disponible para viajar"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(form.willing_to_relocate)}
                onChange={(event) =>
                  setValue(
                    "willing_to_relocate",
                    event.target.checked
                  )
                }
              />
            }
            label="Disponible para cambiar de residencia"
          />
        </Grid>
      </Grid>

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
          {saving
            ? "Guardando..."
            : "Guardar preferencias"}
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
        <Typography
          variant="body2"
          color="text.secondary"
          mt={0.4}
        >
          {subtitle}
        </Typography>
      )}

      <Divider sx={{ mt: 1.5 }} />
    </Box>
  );
}
