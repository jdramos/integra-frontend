import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import {
  createCandidateExperience,
  createCandidateEducation,
  createCandidateCertificate,
} from "../../../../api/candidate";

const MAIN_FIELDS = [
  { key: "name", label: "Nombre completo" },
  { key: "headline", label: "Titular profesional" },
  { key: "summary", label: "Resumen profesional", multiline: true },
  { key: "education_level", label: "Nivel académico" },
  { key: "experience_years", label: "Años de experiencia" },
  { key: "skills", label: "Habilidades (separadas por coma)" },
  { key: "languages", label: "Idiomas (separados por coma)" },
];

function buildInitialMainState(suggestions) {
  const state = {};

  MAIN_FIELDS.forEach(({ key }) => {
    let value = suggestions?.[key];

    if (Array.isArray(value)) {
      value = value.join(", ");
    }

    state[key] = {
      checked: Boolean(value),
      value: value ?? "",
    };
  });

  return state;
}

export default function CvSuggestionsDialog({ open, suggestions, onClose, onApplied }) {
  const [mainFields, setMainFields] = useState(() => buildInitialMainState(suggestions));
  const [experienceChecks, setExperienceChecks] = useState([]);
  const [educationChecks, setEducationChecks] = useState([]);
  const [certificateChecks, setCertificateChecks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const experiences = useMemo(() => suggestions?.experiences || [], [suggestions]);
  const education = useMemo(() => suggestions?.education || [], [suggestions]);
  const certificates = useMemo(() => suggestions?.certificates || [], [suggestions]);

  useEffect(() => {
    if (!open) return;

    setMainFields(buildInitialMainState(suggestions));
    setExperienceChecks(experiences.map(() => true));
    setEducationChecks(education.map(() => true));
    setCertificateChecks(certificates.map(() => true));
    setError("");
  }, [open, suggestions]);

  const setMainField = (key, patch) => {
    setMainFields((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const toggleAt = (setter) => (index, checked) => {
    setter((prev) => prev.map((value, i) => (i === index ? checked : value)));
  };

  const handleApply = async () => {
    try {
      setSaving(true);
      setError("");

      const mergedFields = {};

      MAIN_FIELDS.forEach(({ key }) => {
        if (mainFields[key]?.checked) {
          mergedFields[key] = mainFields[key].value;
        }
      });

      const experiencesToCreate = experiences.filter((_, i) => experienceChecks[i]);
      const educationToCreate = education.filter((_, i) => educationChecks[i]);
      const certificatesToCreate = certificates.filter((_, i) => certificateChecks[i]);

      await Promise.all([
        ...experiencesToCreate.map((item) => createCandidateExperience(item)),
        ...educationToCreate.map((item) => createCandidateEducation(item)),
        ...certificatesToCreate.map((item) => createCandidateCertificate(item)),
      ]);

      onApplied({
        mergedFields,
        createdCounts: {
          experiences: experiencesToCreate.length,
          education: educationToCreate.length,
          certificates: certificatesToCreate.length,
        },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudieron aplicar todos los datos detectados. Intenta de nuevo."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <AutoAwesomeIcon color="primary" />
          <Typography fontWeight={900}>Revisa los datos detectados en tu CV</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          Extraje esta información automáticamente de tu CV. Revísala, corrige lo
          que haga falta y desmarca lo que no quieras aplicar antes de confirmar.
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle1" fontWeight={800} mb={1.5}>
          Información principal
        </Typography>

        <Grid container spacing={2} mb={3}>
          {MAIN_FIELDS.map(({ key, label, multiline }) => {
            const field = mainFields[key];
            if (!field) return null;

            const hasValue = String(field.value || "").trim() !== "";

            return (
              <Grid item xs={12} md={multiline ? 12 : 6} key={key}>
                <Stack direction="row" spacing={1} alignItems={multiline ? "flex-start" : "center"}>
                  <Checkbox
                    checked={field.checked}
                    disabled={!hasValue}
                    onChange={(e) => setMainField(key, { checked: e.target.checked })}
                    sx={{ mt: multiline ? 1 : 0 }}
                  />

                  <TextField
                    label={label}
                    value={field.value}
                    onChange={(e) => setMainField(key, { value: e.target.value, checked: true })}
                    fullWidth
                    multiline={multiline}
                    minRows={multiline ? 3 : undefined}
                    placeholder={hasValue ? "" : "No detectado"}
                  />
                </Stack>
              </Grid>
            );
          })}
        </Grid>

        {experiences.length > 0 && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" fontWeight={800} mb={1}>
              Experiencia detectada
            </Typography>

            <Stack spacing={1} mb={3}>
              {experiences.map((item, index) => (
                <FormControlLabel
                  key={`exp-${index}`}
                  control={
                    <Checkbox
                      checked={experienceChecks[index] || false}
                      onChange={(e) => toggleAt(setExperienceChecks)(index, e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={700}>
                        {item.position} — {item.company_name}
                      </Typography>
                      {item.description && (
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              ))}
            </Stack>
          </>
        )}

        {education.length > 0 && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" fontWeight={800} mb={1}>
              Educación detectada
            </Typography>

            <Stack spacing={1} mb={3}>
              {education.map((item, index) => (
                <FormControlLabel
                  key={`edu-${index}`}
                  control={
                    <Checkbox
                      checked={educationChecks[index] || false}
                      onChange={(e) => toggleAt(setEducationChecks)(index, e.target.checked)}
                    />
                  }
                  label={
                    <Typography fontWeight={700}>
                      {item.degree} — {item.institution}
                    </Typography>
                  }
                />
              ))}
            </Stack>
          </>
        )}

        {certificates.length > 0 && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" fontWeight={800} mb={1}>
              Certificaciones detectadas
            </Typography>

            <Stack spacing={1}>
              {certificates.map((item, index) => (
                <FormControlLabel
                  key={`cert-${index}`}
                  control={
                    <Checkbox
                      checked={certificateChecks[index] || false}
                      onChange={(e) => toggleAt(setCertificateChecks)(index, e.target.checked)}
                    />
                  }
                  label={
                    <Typography fontWeight={700}>
                      {item.name} {item.issuer ? `— ${item.issuer}` : ""}
                    </Typography>
                  }
                />
              ))}
            </Stack>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Descartar
        </Button>

        <Button
          variant="contained"
          onClick={handleApply}
          disabled={saving}
          sx={{ borderRadius: 2, fontWeight: 800, textTransform: "none" }}
        >
          {saving ? "Aplicando..." : "Confirmar y aplicar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
