import React, { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import { Link as RouterLink } from "react-router-dom";
import { getJobApplicants, updateApplicationStatus } from "../../../api/company";

const primary = "#0057B8";

function StatusChip({ status }) {
  const map = {
    PENDING: "warning",
    REVIEWING: "info",
    INTERVIEW: "primary",
    REJECTED: "error",
    ACCEPTED: "success",
  };

  return (
    <Chip
      size="small"
      label={status || "PENDING"}
      color={map[status] || "default"}
      sx={{ fontWeight: 800 }}
    />
  );
}

export default function ApplicantsModal({ open, onClose, job }) {
  const [loading, setLoading] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [error, setError] = useState("");

  const loadApplicants = async () => {
    if (!job?.id) return;

    try {
      setLoading(true);
      setError("");

      const data = await getJobApplicants(job.id);
      setApplicants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "No se pudieron cargar postulantes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && job?.id) {
      loadApplicants();
    }
  }, [open, job?.id]);

  const changeStatus = async (applicationId, status) => {
    try {
      await updateApplicationStatus(applicationId, status);

      setApplicants((prev) =>
        prev.map((a) =>
          a.application_id === applicationId ? { ...a, status } : a
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "No se pudo actualizar el estado"
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <PeopleIcon sx={{ color: primary }} />

          <Box>
            <Typography variant="h6" fontWeight={900}>
              Postulantes
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {job?.title || "Vacante"}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Stack py={5} alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography>Cargando postulantes...</Typography>
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : applicants.length === 0 ? (
          <Alert severity="info">No hay postulantes todavía.</Alert>
        ) : (
          <Stack spacing={2}>
            {applicants.map((item) => (
              <Paper
                key={item.application_id || item.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  border: "1px solid #E5EAF2",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Stack direction="row" spacing={2}>
                    <Avatar sx={{ bgcolor: "#EAF2FF", color: primary }}>
                      {item.name?.[0] || "C"}
                    </Avatar>

                    <Box>
                      <Typography
                        fontWeight={900}
                        component={item.candidate_user_id ? RouterLink : "p"}
                        to={item.candidate_user_id ? `/company/candidates/${item.candidate_user_id}` : undefined}
                        sx={
                          item.candidate_user_id
                            ? { color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } }
                            : undefined
                        }
                      >
                        {item.name || item.candidate_name || "Candidato"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {item.title || item.profession || "Perfil profesional"}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {item.location || "Sin ubicación"} ·{" "}
                        {item.education || item.education_level || "Sin escolaridad"} ·{" "}
                        {item.experience || item.experience_years || 0} años experiencia
                      </Typography>

                      <Divider sx={{ my: 1 }} />

                      <Stack direction="row" spacing={1}>
                        <Chip
                          size="small"
                          label={`${item.match_score || item.score || 0}% match`}
                          color="primary"
                        />

                        <StatusChip status={item.status} />
                      </Stack>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        changeStatus(item.application_id || item.id, "INTERVIEW")
                      }
                    >
                      Entrevista
                    </Button>

                    <Button
                      size="small"
                      color="success"
                      variant="contained"
                      onClick={() =>
                        changeStatus(item.application_id || item.id, "ACCEPTED")
                      }
                    >
                      Aprobar
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() =>
                        changeStatus(item.application_id || item.id, "REJECTED")
                      }
                    >
                      Rechazar
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}