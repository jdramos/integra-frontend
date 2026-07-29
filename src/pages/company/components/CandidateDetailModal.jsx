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
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import PsychologyIcon from "@mui/icons-material/Psychology";

import {
  getCandidateByIdForCompany,
  saveCandidateForCompany,
} from "../../../api/company";

const primary = "#0057B8";

const labels = {
  skills: "Habilidades",
  experience: "Experiencia",
  education: "Escolaridad",
  location: "Ubicación",
  workMode: "Modalidad",
  jobType: "Tipo empleo",
  salary: "Salario",
};

export default function CandidateDetailModal({ open, onClose, candidate }) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const candidateId = candidate?.id;

  const loadDetail = async () => {
    if (!candidateId) return;

    try {
      setLoading(true);
      setError("");

      const data = await getCandidateByIdForCompany(candidateId);

      setDetail({
        ...(candidate || {}),
        ...(data || {}),
        matchedSkills: candidate?.matchedSkills || data?.matchedSkills || [],
        missingSkills: candidate?.missingSkills || data?.missingSkills || [],
        scoreBreakdown:
          candidate?.scoreBreakdown || data?.scoreBreakdown || null,
        match_score:
          candidate?.match_score ||
          candidate?.score ||
          candidate?.match ||
          data?.match_score ||
          data?.score ||
          data?.match ||
          0,
      });

      setSaved(Boolean(data?.is_saved));
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "No se pudo cargar el perfil"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && candidateId) {
      loadDetail();
    }

    if (!open) {
      setDetail(null);
      setError("");
      setSaved(false);
    }
  }, [open, candidateId]);

  const handleSave = async () => {
    try {
      await saveCandidateForCompany(candidateId);
      setSaved(true);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "No se pudo guardar el candidato"
      );
    }
  };

  const data = detail || candidate || {};

  const matchScore =
    data.match_score || data.score || data.match || data.compatibility || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <PersonIcon sx={{ color: primary }} />

          <Box>
            <Typography variant="h6" fontWeight={900}>
              Perfil del candidato
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Información profesional, experiencia y compatibilidad.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" py={5} spacing={2}>
            <CircularProgress />
            <Typography>Cargando perfil...</Typography>
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Stack spacing={2}>
            <Paper
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
                  <Avatar
                    src={data.photo_url || ""}
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: "#EAF2FF",
                      color: primary,
                      fontWeight: 900,
                      fontSize: 28,
                    }}
                  >
                    {data.name?.[0] || "C"}
                  </Avatar>

                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      {data.name || "Candidato"}
                    </Typography>

                    <Typography color="text.secondary">
                      {data.headline ||
                        data.title ||
                        data.last_position ||
                        "Perfil profesional"}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={`${matchScore}% match`}
                        color={
                          Number(matchScore) >= 85
                            ? "success"
                            : Number(matchScore) >= 70
                            ? "primary"
                            : "warning"
                        }
                        sx={{ fontWeight: 800 }}
                      />

                      <Chip
                        size="small"
                        label={data.location || "Sin ubicación"}
                      />

                      <Chip
                        size="small"
                        label={`${
                          data.experience_years || data.experience || 0
                        } años exp.`}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Button
                  variant={saved ? "outlined" : "contained"}
                  startIcon={<BookmarkIcon />}
                  disabled={saved || !candidateId}
                  onClick={handleSave}
                  sx={{ bgcolor: saved ? undefined : primary }}
                >
                  {saved ? "Guardado" : "Guardar candidato"}
                </Button>
              </Stack>
            </Paper>

            {(data.matchedSkills?.length > 0 ||
              data.missingSkills?.length > 0 ||
              data.scoreBreakdown) && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  border: "1px solid #E5EAF2",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <PsychologyIcon sx={{ color: primary }} />
                  <Box>
                    <Typography fontWeight={900}>
                      Matching contra la vacante
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Coincidencias y factores usados para calcular el score.
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Habilidades coincidentes
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {data.matchedSkills?.length > 0 ? (
                        data.matchedSkills.map((skill) => (
                          <Chip
                            key={skill}
                            size="small"
                            color="success"
                            label={skill}
                            sx={{ mb: 1, fontWeight: 700 }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Sin coincidencias registradas.
                        </Typography>
                      )}
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Habilidades faltantes
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {data.missingSkills?.length > 0 ? (
                        data.missingSkills.map((skill) => (
                          <Chip
                            key={skill}
                            size="small"
                            color="warning"
                            label={skill}
                            sx={{ mb: 1, fontWeight: 700 }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No hay faltantes importantes.
                        </Typography>
                      )}
                    </Stack>
                  </Grid>

                  {data.scoreBreakdown && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Desglose del score
                      </Typography>

                      <Grid container spacing={1}>
                        {Object.entries(data.scoreBreakdown).map(
                          ([key, value]) => (
                            <Grid item xs={6} md={3} key={key}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 3,
                                  bgcolor: "#F6F8FB",
                                  border: "1px solid #E5EAF2",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {labels[key] || key}
                                </Typography>

                                <Typography fontWeight={900}>
                                  {value} pts
                                </Typography>
                              </Paper>
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    border: "1px solid #E5EAF2",
                    height: "100%",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <WorkIcon sx={{ color: primary }} />
                    <Typography fontWeight={900}>Experiencia</Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    Último cargo
                  </Typography>

                  <Typography fontWeight={800}>
                    {data.last_position || "No especificado"}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="body2" color="text.secondary">
                    Última empresa
                  </Typography>

                  <Typography fontWeight={800}>
                    {data.last_company || "No especificada"}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="body2" color="text.secondary">
                    Área profesional
                  </Typography>

                  <Typography fontWeight={800}>
                    {data.professional_area || "No especificada"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    border: "1px solid #E5EAF2",
                    height: "100%",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <SchoolIcon sx={{ color: primary }} />
                    <Typography fontWeight={900}>Perfil laboral</Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    Escolaridad
                  </Typography>

                  <Typography fontWeight={800}>
                    {data.education_level ||
                      data.education ||
                      "No especificada"}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="body2" color="text.secondary">
                    Salario esperado
                  </Typography>

                  <Typography fontWeight={800}>
                    C${" "}
                    {Number(
                      data.expected_salary || data.expectedSalary || 0
                    ).toLocaleString()}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="body2" color="text.secondary">
                    Disponibilidad
                  </Typography>

                  <Typography fontWeight={800}>
                    {data.availability || "No especificada"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    border: "1px solid #E5EAF2",
                  }}
                >
                  <Typography fontWeight={900} mb={1}>
                    Habilidades
                  </Typography>

                  <Typography color="text.secondary">
                    {data.skills || "No se han registrado habilidades."}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    border: "1px solid #E5EAF2",
                  }}
                >
                  <Typography fontWeight={900} mb={1}>
                    Resumen profesional
                  </Typography>

                  <Typography color="text.secondary">
                    {data.summary ||
                      "No se ha registrado resumen profesional."}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}