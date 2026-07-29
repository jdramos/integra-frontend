import React, { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { createInterview } from "../../../api/interviews";
import {
  getCompanyJobsList,
  getJobApplicantsForInterview,
} from "../../../api/jobs";

const initialForm = {
  job_id: "",
  candidate_id: "",
  application_id: "",
  title: "",
  interview_type: "VIRTUAL",
  interview_date: "",
  start_time: "",
  end_time: "",
  location: "",
  meeting_url: "",
  notes: "",
};

export default function InterviewFormDialog({
  open,
  onClose,
  onSaved,
  defaultJobId = "",
  defaultCandidateId = "",
  defaultApplicationId = "",
}) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);

  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

useEffect(() => {
  if (open) {
    initDialog();
  }
}, [open, defaultJobId, defaultCandidateId, defaultApplicationId]);

const initDialog = async () => {
  try {
    setError("");
    setSelectedJob(null);
    setSelectedApplicant(null);
    setApplicants([]);

    const jobsData = await getCompanyJobsList();
    setJobs(jobsData || []);

    const foundJob = jobsData?.find(
      (job) => String(job.id) === String(defaultJobId)
    );

    setSelectedJob(foundJob || null);

    setForm({
      ...initialForm,
      job_id: defaultJobId || "",
      candidate_id: defaultCandidateId || "",
      application_id: defaultApplicationId || "",
      title: foundJob?.title ? `Entrevista - ${foundJob.title}` : "",
    });

    if (defaultJobId) {
      const applicantsData = await getJobApplicantsForInterview(defaultJobId);
      setApplicants(applicantsData || []);

      const foundApplicant = applicantsData?.find(
        (applicant) =>
          String(applicant.candidate_id) === String(defaultCandidateId)
      );

      setSelectedApplicant(foundApplicant || null);
    }
  } catch (err) {
    console.error(err);
    setError("No se pudo cargar la información inicial.");
  }
};

  const setValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleJobChange = async (_, value) => {
    setSelectedJob(value);
    setSelectedApplicant(null);
    setApplicants([]);

    setForm((prev) => ({
      ...prev,
      job_id: value?.id || "",
      candidate_id: "",
      application_id: "",
      title: value?.title ? `Entrevista - ${value.title}` : "",
    }));

    if (!value?.id) return;

    try {
      const data = await getJobApplicantsForInterview(value.id);
      setApplicants(data || []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los candidatos postulados.");
    }
  };

  const handleApplicantChange = (_, value) => {
    setSelectedApplicant(value);

    setForm((prev) => ({
      ...prev,
      candidate_id: value?.candidate_id || "",
      application_id: value?.application_id || "",
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      if (
        !form.job_id ||
        !form.candidate_id ||
        !form.title ||
        !form.interview_date ||
        !form.start_time ||
        !form.end_time
      ) {
        setError("Completa los campos obligatorios.");
        return;
      }

      const payload = {
        ...form,
        application_id: form.application_id || null,
        location: form.location || null,
        meeting_url: form.meeting_url || null,
        notes: form.notes || null,
      };

      await createInterview(payload);

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError("No se pudo programar la entrevista.");
    } finally {
      setSaving(false);
    }
  };

  const selectedApplicantInfo = selectedApplicant
    ? {
        name: selectedApplicant.candidate_name,
        email: selectedApplicant.candidate_email,
        score: selectedApplicant.score,
        status: selectedApplicant.application_status,
      }
    : null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 900 }}>
        Programar entrevista
        <Typography color="text.secondary" fontSize={14}>
          Selecciona una vacante, el candidato postulado y define la fecha de entrevista.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                options={jobs}
                value={selectedJob}
                onChange={handleJobChange}
                getOptionLabel={(option) => option?.title || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} label="Vacante" required size="small" />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={applicants}
                value={selectedApplicant}
                onChange={handleApplicantChange}
                disabled={!form.job_id}
                getOptionLabel={(option) =>
                  option?.candidate_name
                    ? `${option.candidate_name} - ${option.candidate_email}`
                    : ""
                }
                isOptionEqualToValue={(option, value) =>
                  option.application_id === value.application_id
                }
                renderOption={(props, option) => (
                  <li {...props}>
                    <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
                      <Avatar sx={{ bgcolor: "#0B66C3" }}>
                        {option.candidate_name?.charAt(0)}
                      </Avatar>

                      <Box flex={1}>
                        <Typography fontWeight={800}>
                          {option.candidate_name}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {option.candidate_email}
                        </Typography>
                      </Box>

                      {option.score !== null && option.score !== undefined && (
                        <Typography fontWeight={900} color="primary">
                          {option.score}%
                        </Typography>
                      )}
                    </Stack>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Candidato"
                    required
                    size="small"
                    helperText={
                      form.job_id
                        ? "Selecciona un candidato postulado a esta vacante"
                        : "Primero selecciona una vacante"
                    }
                  />
                )}
              />
            </Grid>

            {selectedApplicantInfo && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "#F8FAFC",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: "#0B66C3" }}>
                      {selectedApplicantInfo.name?.charAt(0)}
                    </Avatar>

                    <Box flex={1}>
                      <Typography fontWeight={900}>
                        {selectedApplicantInfo.name}
                      </Typography>

                      <Typography color="text.secondary" fontSize={14}>
                        {selectedApplicantInfo.email}
                      </Typography>
                    </Box>

                    {selectedApplicantInfo.score !== null &&
                      selectedApplicantInfo.score !== undefined && (
                        <Typography fontWeight={900} color="primary">
                          Score {selectedApplicantInfo.score}%
                        </Typography>
                      )}
                  </Stack>
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                size="small"
                label="Título"
                placeholder="Ej. Entrevista inicial - Analista contable"
                value={form.title}
                onChange={(e) => setValue("title", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                required
                size="small"
                label="Tipo"
                value={form.interview_type}
                onChange={(e) => setValue("interview_type", e.target.value)}
              >
                <MenuItem value="VIRTUAL">Virtual</MenuItem>
                <MenuItem value="PRESENCIAL">Presencial</MenuItem>
                <MenuItem value="TELEFONICA">Telefónica</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                size="small"
                type="date"
                label="Fecha"
                InputLabelProps={{ shrink: true }}
                value={form.interview_date}
                onChange={(e) => setValue("interview_date", e.target.value)}
              />
            </Grid>

            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                required
                size="small"
                type="time"
                label="Inicio"
                InputLabelProps={{ shrink: true }}
                value={form.start_time}
                onChange={(e) => setValue("start_time", e.target.value)}
              />
            </Grid>

            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                required
                size="small"
                type="time"
                label="Fin"
                InputLabelProps={{ shrink: true }}
                value={form.end_time}
                onChange={(e) => setValue("end_time", e.target.value)}
              />
            </Grid>

            {form.interview_type === "VIRTUAL" && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="URL de reunión"
                  placeholder="https://meet.google.com/..."
                  value={form.meeting_url}
                  onChange={(e) => setValue("meeting_url", e.target.value)}
                />
              </Grid>
            )}

            {form.interview_type === "PRESENCIAL" && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Ubicación"
                  placeholder="Dirección de la empresa o sala de entrevista"
                  value={form.location}
                  onChange={(e) => setValue("location", e.target.value)}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                size="small"
                label="Notas"
                value={form.notes}
                onChange={(e) => setValue("notes", e.target.value)}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          disabled={saving}
          onClick={handleSave}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 900,
            bgcolor: "#0057B8",
          }}
        >
          {saving ? "Guardando..." : "Programar entrevista"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}