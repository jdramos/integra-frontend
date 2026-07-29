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
import useCatalog from "../../../hooks/useCatalog";
import CreatableCatalogField from "../../../components/common/CreatableCatalogField";

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
  is_company_confidential: false,
  screening_questions: [],
  expires_at: "",
};

export default function JobFormModal({
  open,
  onClose,
  onSaved,
  editingJob = null,
  companies = null,
  createFn = createCompanyJob,
  updateFn = updateCompanyJob,
}) {
  const [form, setForm] = useState(initialState);
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { items: modalityOptions } = useCatalog("job_modality");
  const { items: jobTypeOptions } = useCatalog("job_types_posting");
  const { labels: experienceLevelOptions } = useCatalog("experience_levels");
  const { labels: departments } = useCatalog("nicaragua_departments");
  const { labels: professionalAreas } = useCatalog("professional_areas");
  const { labels: educationLevels } = useCatalog("education_levels");
  const { labels: availabilityOptions } = useCatalog("availability_options");
  const { labels: languageOptions } = useCatalog("languages");
  const { labels: skillOptions } = useCatalog("skills");

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
        is_company_confidential: Boolean(editingJob.is_company_confidential),
        screening_questions: Array.isArray(editingJob.screening_questions)
          ? editingJob.screening_questions.map((question) => ({
              question_text: question.question_text || "",
              question_type: question.question_type || "TEXT",
            }))
          : [],
        expires_at: editingJob.expires_at ? String(editingJob.expires_at).slice(0, 10) : "",
      });
    } else {
      setForm(initialState);
    }

    setCompanyId(editingJob?.company_id ? String(editingJob.company_id) : "");
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
      if (!form.expires_at || form.expires_at < new Date().toISOString().slice(0, 10)) {
        setError("Indica una fecha de vencimiento válida");
        return;
      }

      if (companies && !companyId) {
        setError("Selecciona la empresa dueña de la vacante");
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
        ...(companies ? { company_id: Number(companyId) } : {}),
      };

      if (editingJob?.id) {
        await updateFn(editingJob.id, payload);
      } else {
        await createFn(payload);
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
            {companies && (
              <Grid item xs={12}>
                <TextField
                  select
                  label="Empresa"
                  fullWidth
                  required
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={String(company.id)}>
                      {company.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="Título de la vacante"
                fullWidth
                required
                value={form.title}
                onChange={(e) => setValue("title", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Fecha de vencimiento" type="date" fullWidth required value={form.expires_at}
                onChange={(e) => setValue("expires_at", e.target.value)} InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().slice(0, 10) }} />
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
              <CreatableCatalogField category="nicaragua_departments" label="Ubicación" options={departments}
                value={form.location} onChange={(value) => setValue("location", value)} />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Modalidad"
                fullWidth
                value={modalityOptions.some((item)=>item.value===form.modality) ? form.modality : ''}
                onChange={(e) => {
                  setValue("modality", e.target.value);
                  setValue("work_mode", e.target.value);
                }}
              >
                {modalityOptions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
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
                {jobTypeOptions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <CreatableCatalogField category="professional_areas" label="Área profesional" options={professionalAreas}
                value={form.professional_area} onChange={(value) => setValue("professional_area", value)} />
            </Grid>

            <Grid item xs={12} md={3}>
              <CreatableCatalogField category="experience_levels" label="Nivel experiencia" options={experienceLevelOptions}
                value={form.experience_level} onChange={(value) => setValue("experience_level", value)} />
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
              <CreatableCatalogField category="education_levels" label="Escolaridad requerida" options={educationLevels}
                value={form.education_level} onChange={(value) => setValue("education_level", value)} />
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
              <CreatableCatalogField multiple category="skills" label="Habilidades / requisitos" options={skillOptions}
                value={form.skills_required ? form.skills_required.split(",").map((item) => item.trim()).filter(Boolean) : []}
                onChange={(values) => setValue("skills_required", values.join(", "))} />
            </Grid>

            <Grid item xs={12} md={6}>
              <CreatableCatalogField category="availability_options" label="Disponibilidad requerida" options={availabilityOptions}
                value={form.availability_required} onChange={(value) => setValue("availability_required", value)} />
            </Grid>

            <Grid item xs={12} md={6}>
              <CreatableCatalogField multiple category="languages" label="Idiomas requeridos" options={languageOptions}
                value={form.languages_required ? form.languages_required.split(",").map((item) => item.trim()).filter(Boolean) : []}
                onChange={(values) => setValue("languages_required", values.join(", "))} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box>
                    <Typography fontWeight={900}>Preguntas para los candidatos</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Se solicitarán obligatoriamente al enviar la postulación (máximo 10).
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    disabled={form.screening_questions.length >= 10}
                    onClick={() => setValue("screening_questions", [
                      ...form.screening_questions,
                      { question_text: "", question_type: "TEXT" },
                    ])}
                  >
                    Agregar pregunta
                  </Button>
                </Stack>

                <Stack spacing={1.5}>
                  {form.screening_questions.map((question, index) => (
                    <Stack key={index} direction={{ xs: "column", md: "row" }} spacing={1}>
                      <TextField
                        fullWidth
                        required
                        label={`Pregunta ${index + 1}`}
                        value={question.question_text}
                        inputProps={{ maxLength: 500 }}
                        onChange={(e) => {
                          const next = [...form.screening_questions];
                          next[index] = { ...next[index], question_text: e.target.value };
                          setValue("screening_questions", next);
                        }}
                      />
                      <TextField
                        select
                        label="Tipo"
                        value={question.question_type}
                        sx={{ minWidth: 150 }}
                        onChange={(e) => {
                          const next = [...form.screening_questions];
                          next[index] = { ...next[index], question_type: e.target.value };
                          setValue("screening_questions", next);
                        }}
                      >
                        <MenuItem value="TEXT">Texto</MenuItem>
                        <MenuItem value="YES_NO">Sí / No</MenuItem>
                      </TextField>
                      <Button
                        color="error"
                        onClick={() => setValue("screening_questions", form.screening_questions.filter((_, itemIndex) => itemIndex !== index))}
                      >
                        Eliminar
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: "grey.50" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.is_company_confidential}
                      onChange={(e) => setValue("is_company_confidential", e.target.checked)}
                    />
                  }
                  label="Publicar como empresa confidencial"
                />
                <Typography variant="body2" color="text.secondary">
                  Si activas esta opción, los candidatos no verán el nombre, logotipo, descripción ni sitio web de tu empresa en esta vacante.
                </Typography>
              </Box>
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
