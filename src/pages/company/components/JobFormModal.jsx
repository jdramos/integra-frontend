import React, { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import WorkIcon from "@mui/icons-material/Work";
import SaveIcon from "@mui/icons-material/Save";

import { createCompanyJob, updateCompanyJob } from "../../../api/company";

const primary = "#0057B8";

const initialState = {
  title: "",
  description: "",
  location: "",
  modality: "PRESENCIAL",
  salary_min: "",
  salary_max: "",
  experience_years: "",
  education_level: "",
  skills_required: "",
  professional_area: "",
  experience_level: "",
  job_type: "FULL_TIME",
  work_mode: "PRESENCIAL",
  availability_required: "",
  languages_required: "",
  requires_driver_license: false,
  requires_vehicle: false,
  requires_travel: false,
  allows_relocation: false,
};

export default function JobFormModal({
  open,
  onClose,
  onSaved,
  editingJob = null,
}) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (editingJob) {
      setForm({
        title: editingJob.title || "",
        description: editingJob.description || "",
        location: editingJob.location || "",
        modality: editingJob.modality || "PRESENCIAL",
        salary_min: editingJob.salary_min || "",
        salary_max: editingJob.salary_max || "",
        experience_years: editingJob.experience_years || "",
        education_level: editingJob.education_level || "",
        skills_required: editingJob.skills_required || "",
        professional_area: editingJob.professional_area || "",
        experience_level: editingJob.experience_level || "",
        job_type: editingJob.job_type || "FULL_TIME",
        work_mode: editingJob.work_mode || editingJob.modality || "PRESENCIAL",
        availability_required: editingJob.availability_required || "",
        languages_required: editingJob.languages_required || "",
        requires_driver_license: Boolean(editingJob.requires_driver_license),
        requires_vehicle: Boolean(editingJob.requires_vehicle),
        requires_travel: Boolean(editingJob.requires_travel),
        allows_relocation: Boolean(editingJob.allows_relocation),
      });
    } else {
      setForm(initialState);
    }

    setError("");
    setSuccess("");
  }, [editingJob, open]);

  const setValue = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!form.title.trim()) {
        setError("El título de la vacante es requerido");
        return;
      }

      if (!form.description.trim()) {
        setError("La descripción de la vacante es requerida");
        return;
      }

      const payload = {
        ...form,
        salary_min: form.salary_min === "" ? null : Number(form.salary_min),
        salary_max: form.salary_max === "" ? null : Number(form.salary_max),
        experience_years:
          form.experience_years === "" ? null : Number(form.experience_years),
        requires_driver_license: form.requires_driver_license ? 1 : 0,
        requires_vehicle: form.requires_vehicle ? 1 : 0,
        requires_travel: form.requires_travel ? 1 : 0,
        allows_relocation: form.allows_relocation ? 1 : 0,
      };

      if (editingJob?.id) {
        await updateCompanyJob(editingJob.id, payload);
      } else {
        await createCompanyJob(payload);
      }

      setSuccess(
        editingJob
          ? "Vacante actualizada correctamente"
          : "Vacante creada correctamente"
      );

      await onSaved?.();

      setTimeout(() => {
        onClose?.();
      }, 700);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "No se pudo guardar la vacante"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <WorkIcon sx={{ color: primary }} />

          <Box>
            <Typography variant="h6" fontWeight={900}>
              {editingJob ? "Editar vacante" : "Nueva vacante"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Define los criterios que necesitas para encontrar el mejor talento.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Título de la vacante"
                fullWidth
                required
                value={form.title}
                onChange={(e) => setValue("title", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth
                required
                multiline
                minRows={4}
                value={form.description}
                onChange={(e) => setValue("description", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Ubicación"
                fullWidth
                value={form.location}
                onChange={(e) => setValue("location", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Modalidad"
                fullWidth
                value={form.modality}
                onChange={(e) => {
                  setValue("modality", e.target.value);
                  setValue("work_mode", e.target.value);
                }}
              >
                <MenuItem value="PRESENCIAL">Presencial</MenuItem>
                <MenuItem value="REMOTO">Remoto</MenuItem>
                <MenuItem value="HIBRIDO">Híbrido</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Tipo de empleo"
                fullWidth
                value={form.job_type}
                onChange={(e) => setValue("job_type", e.target.value)}
              >
                <MenuItem value="FULL_TIME">Tiempo completo</MenuItem>
                <MenuItem value="PART_TIME">Medio tiempo</MenuItem>
                <MenuItem value="CONTRACT">Contrato</MenuItem>
                <MenuItem value="TEMPORARY">Temporal</MenuItem>
                <MenuItem value="INTERNSHIP">Pasantía</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Área profesional"
                fullWidth
                value={form.professional_area}
                onChange={(e) => setValue("professional_area", e.target.value)}
                placeholder="Ej: Contabilidad, Ventas, Tecnología"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Nivel experiencia"
                fullWidth
                value={form.experience_level}
                onChange={(e) => setValue("experience_level", e.target.value)}
              >
                <MenuItem value="">No especificado</MenuItem>
                <MenuItem value="JUNIOR">Junior</MenuItem>
                <MenuItem value="MID">Intermedio</MenuItem>
                <MenuItem value="SENIOR">Senior</MenuItem>
                <MenuItem value="MANAGER">Gerencial</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                type="number"
                label="Años experiencia"
                fullWidth
                value={form.experience_years}
                onChange={(e) => setValue("experience_years", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Escolaridad requerida"
                fullWidth
                value={form.education_level}
                onChange={(e) => setValue("education_level", e.target.value)}
                placeholder="Ej: Universidad, Técnico, Secundaria"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                type="number"
                label="Salario mínimo"
                fullWidth
                value={form.salary_min}
                onChange={(e) => setValue("salary_min", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                type="number"
                label="Salario máximo"
                fullWidth
                value={form.salary_max}
                onChange={(e) => setValue("salary_max", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Habilidades / requisitos"
                fullWidth
                multiline
                minRows={4}
                value={form.skills_required}
                onChange={(e) => setValue("skills_required", e.target.value)}
                placeholder="Ej: Excel avanzado, atención al cliente, experiencia en créditos, manejo de caja..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Disponibilidad requerida"
                fullWidth
                value={form.availability_required}
                onChange={(e) =>
                  setValue("availability_required", e.target.value)
                }
                placeholder="Ej: Inmediata, 15 días, horario flexible"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Idiomas requeridos"
                fullWidth
                value={form.languages_required}
                onChange={(e) => setValue("languages_required", e.target.value)}
                placeholder="Ej: Español, Inglés básico"
              />
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.requires_driver_license}
                      onChange={(e) =>
                        setValue("requires_driver_license", e.target.checked)
                      }
                    />
                  }
                  label="Requiere licencia"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={form.requires_vehicle}
                      onChange={(e) =>
                        setValue("requires_vehicle", e.target.checked)
                      }
                    />
                  }
                  label="Requiere vehículo"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={form.requires_travel}
                      onChange={(e) =>
                        setValue("requires_travel", e.target.checked)
                      }
                    />
                  }
                  label="Requiere viajar"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={form.allows_relocation}
                      onChange={(e) =>
                        setValue("allows_relocation", e.target.checked)
                      }
                    />
                  }
                  label="Permite reubicación"
                />
              </Stack>
            </Grid>
          </Grid>

          <Stack direction="row" justifyContent="flex-end" spacing={1} pt={1}>
            <Button onClick={onClose} disabled={loading}>
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
              sx={{ bgcolor: primary }}
            >
              {loading ? "Guardando..." : "Guardar vacante"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}