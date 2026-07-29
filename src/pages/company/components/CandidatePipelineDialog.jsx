import React, { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
  TextField,
} from "@mui/material";

import { Link as RouterLink } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import EventIcon from "@mui/icons-material/Event";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  getCandidateNotes,
  createCandidateNote,
  getCandidateCvViewUrlForCompany,
} from "../../../api/candidate";

import { getCandidateProfile } from "../../../api/candidate";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const getFileUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
};

const statusLabels = {
  APPLIED: "Postulado",
  SCREENING: "Screening",
  INTERVIEW: "Entrevista",
  TECHNICAL: "Técnica",
  OFFER: "Oferta",
  HIRED: "Contratado",
  REJECTED: "Rechazado",
};

export default function CandidatePipelineDialog({
  open,
  candidate,
  onClose,
  onScheduleInterview,
  onMoveStatus,
}) {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [loadingCv, setLoadingCv] = useState(false);
  const [cvError, setCvError] = useState("");

const candidateId =
  candidate?.candidate_id ||
  candidate?.candidate_user_id ||
  candidate?.user_id ||
  candidate?.id;

useEffect(() => {

  if (open && candidateId) {
    loadProfile();
  }
}, [open, candidateId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setData(null);

      const res = await getCandidateProfile(candidateId);
      setData(res);
    
      const notesData = await getCandidateNotes(candidateId);
      setNotes(notesData || []);

    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el perfil del candidato.");
    } finally {
      setLoading(false);
    }
  };

  if (!candidate) return null;

  const user = data?.user || {};
  const profile = data?.profile || {};
  const applications = data?.applications || [];
  const interviews = data?.interviews || [];
  const cvUrl = getFileUrl(profile.cv_url);

  const handleOpenCv = async () => {
    try {
      setLoadingCv(true);
      setCvError("");
      const result = await getCandidateCvViewUrlForCompany(candidateId);
      window.open(result.url, "_blank", "noreferrer");
    } catch (err) {
      setCvError(err?.response?.data?.message || "No se pudo abrir el CV.");
    } finally {
      setLoadingCv(false);
    }
  };

  const handleDownloadCv = async () => {
    try {
      setLoadingCv(true);
      setCvError("");
      const result = await getCandidateCvViewUrlForCompany(candidateId);
      const link = document.createElement("a");
      link.href = result.url;
      link.download = result.original_name || "cv";
      link.click();
    } catch (err) {
      setCvError(err?.response?.data?.message || "No se pudo descargar el CV.");
    } finally {
      setLoadingCv(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 900 }}>
        Perfil del candidato
        <Typography color="text.secondary" fontSize={14}>
          Información del candidato dentro del proceso de reclutamiento.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {error}
          </Alert>
        ) : (
          <Stack spacing={2.5}>
            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                border: "1px solid #E5E7EB",
                background:
                  "linear-gradient(135deg, rgba(0,87,184,0.10), rgba(255,255,255,1))",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={getFileUrl(profile.photo_url) || undefined}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "#0057B8",
                    fontWeight: 900,
                    fontSize: 24,
                  }}
                >
                  {(user.name || candidate.candidate_name)?.charAt(0)}
                </Avatar>

                <Box flex={1}>
                  <Typography
                    fontWeight={900}
                    fontSize={20}
                    component={RouterLink}
                    to={`/company/candidates/${candidateId}`}
                    sx={{ color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                  >
                    {user.name || candidate.candidate_name}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmailIcon fontSize="small" color="primary" />
                    <Typography color="text.secondary" fontSize={14}>
                      {user.email || candidate.candidate_email}
                    </Typography>
                  </Stack>
                </Box>

                <Chip
                  label={statusLabels[candidate.status] || candidate.status || "Postulado"}
                  color={candidate.status === "REJECTED" ? "error" : "primary"}
                  sx={{ fontWeight: 900 }}
                />
              </Stack>
            </Box>

            <Tabs value={tab} onChange={(_, value) => setTab(value)}>
              <Tab label="Perfil" />
              <Tab label="Postulaciones" />
              <Tab label="Entrevistas" />
              <Tab label="Notas" />
            </Tabs>

            <Divider />

            {tab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    icon={<PersonIcon color="primary" />}
                    title="Información general"
                    rows={[
                      [
                        "Nombre",
                        <RouterLink
                          key="name-link"
                          to={`/company/candidates/${candidateId}`}
                          style={{ color: "inherit" }}
                        >
                          {user.name || candidate.candidate_name}
                        </RouterLink>,
                      ],
                      ["Correo", user.email || candidate.candidate_email],
                      ["Teléfono", profile.phone || "No registrado"],
                      ["Ubicación", profile.location || "No registrada"],
                    ]}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <InfoCard
                    icon={<WorkIcon color="primary" />}
                    title="Perfil profesional"
                    rows={[
                      ["Headline", profile.headline || "No registrado"],
                      ["Área", profile.professional_area || "No registrada"],
                      ["Experiencia", profile.experience_level || "No registrada"],
                      [
                        "Años experiencia",
                        profile.experience_years
                          ? `${profile.experience_years} años`
                          : "No registrados",
                      ],
                      ["Educación", profile.education_level || "No registrada"],
                      ["Modalidad", profile.work_mode || "No registrada"],
                      ["Disponibilidad", profile.availability || "No registrada"],
                    ]}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      border: "1px solid #E5E7EB",
                      bgcolor: "#F8FAFC",
                    }}
                  >
                    <Typography fontWeight={900} mb={1}>
                      Resumen
                    </Typography>

                    <Typography color="text.secondary">
                      {profile.summary ||
                        profile.about ||
                        "Este candidato aún no tiene resumen profesional registrado."}
                    </Typography>
                  </Box>
                </Grid>

                {profile.skills && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 4,
                        border: "1px solid #E5E7EB",
                        bgcolor: "#fff",
                      }}
                    >
                      <Typography fontWeight={900} mb={1.5}>
                        Skills
                      </Typography>

                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {profile.skills
                          .split(",")
                          .map((skill) => skill.trim())
                          .filter(Boolean)
                          .map((skill) => (
                            <Chip
                              key={skill}
                              label={skill}
                              sx={{
                                borderRadius: 999,
                                fontWeight: 800,
                                bgcolor: "#EFF6FF",
                                color: "#0057B8",
                              }}
                            />
                          ))}
                      </Stack>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      border: "1px solid #E5E7EB",
                      bgcolor: "#fff",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={2}
                    >
                      <Box>
                        <Typography fontWeight={900}>Curriculum vitae</Typography>
                        <Typography color="text.secondary" fontSize={14}>
                          {cvUrl
                            ? "Documento cargado por el candidato."
                            : "Este candidato no tiene CV cargado."}
                        </Typography>
                      </Box>

                      {cvUrl && (
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            onClick={handleOpenCv}
                            disabled={loadingCv}
                            sx={{
                              borderRadius: 3,
                              textTransform: "none",
                              fontWeight: 800,
                            }}
                          >
                            {loadingCv ? "Abriendo..." : "Abrir CV"}
                          </Button>

                          <Button
                            variant="contained"
                            onClick={handleDownloadCv}
                            disabled={loadingCv}
                            sx={{
                              borderRadius: 3,
                              textTransform: "none",
                              fontWeight: 900,
                              bgcolor: "#0057B8",
                            }}
                          >
                            Descargar CV
                          </Button>
                        </Stack>
                      )}
                    </Stack>

                    {cvError && (
                      <Alert severity="error" sx={{ mt: 1.5, borderRadius: 3 }}>
                        {cvError}
                      </Alert>
                    )}
                  </Box>
                </Grid>
              </Grid>
            )}

            {tab === 1 && (
              <Stack spacing={1.5}>
                {applications.length === 0 ? (
                  <EmptyText text="No hay postulaciones registradas." />
                ) : (
                  applications.map((app) => (
                    <PaperItem key={app.id || app.application_id}>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Box>
                          <Typography fontWeight={900}>
                            {app.job_title || "Vacante"}
                          </Typography>
                          <Typography color="text.secondary" fontSize={14}>
                            Estado: {statusLabels[app.status] || app.status}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={statusLabels[app.status] || app.status}
                          sx={{ fontWeight: 800 }}
                        />
                      </Stack>
                    </PaperItem>
                  ))
                )}
              </Stack>
            )}

            {tab === 2 && (
              <Stack spacing={1.5}>
                {interviews.length === 0 ? (
                  <EmptyText text="No hay entrevistas registradas." />
                ) : (
                  interviews.map((item) => (
                    <PaperItem key={item.id}>
                      <Stack spacing={0.8}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EventIcon color="primary" fontSize="small" />
                          <Typography fontWeight={900}>
                            {item.title || "Entrevista"}
                          </Typography>
                        </Stack>

                        <Typography color="text.secondary" fontSize={14}>
                          {item.job_title || "Vacante"} ·{" "}
                          {item.interview_date?.slice(0, 10)} ·{" "}
                          {item.start_time?.slice(0, 5)} -{" "}
                          {item.end_time?.slice(0, 5)}
                        </Typography>

                        <Chip
                          size="small"
                          label={item.status}
                          sx={{ width: "fit-content", fontWeight: 800 }}
                        />
                      </Stack>
                    </PaperItem>
                  ))
                )}
              </Stack>
            )}

            {tab === 3 && (
  <Stack spacing={2}>
    <Box
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid #E5E7EB",
        bgcolor: "#fff",
      }}
    >
      <Typography fontWeight={900} mb={2}>
        Agregar nota
      </Typography>

      <Stack spacing={2}>
        <TextField
          multiline
          minRows={4}
          placeholder="Escribe observaciones internas sobre este candidato..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />

        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            disabled={!newNote.trim() || savingNote}
            onClick={async () => {
              try {
                setSavingNote(true);

                await createCandidateNote(candidateId, {
                  note: newNote,
                  application_id: candidate?.application_id,
                });

                const notesData = await getCandidateNotes(candidateId);

                setNotes(notesData || []);
                setNewNote("");
              } catch (err) {
                console.error(err);
              } finally {
                setSavingNote(false);
              }
            }}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 900,
              bgcolor: "#0057B8",
            }}
          >
            Guardar nota
          </Button>
        </Stack>
      </Stack>
    </Box>

    <Stack spacing={1.5}>
      {notes.length === 0 ? (
        <EmptyText text="No hay notas registradas." />
      ) : (
        notes.map((note) => (
          <Box
            key={note.id}
            sx={{
              p: 2,
              borderRadius: 4,
              border: "1px solid #E5E7EB",
              bgcolor: "#fff",
            }}
          >
            <Stack spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight={900}>
                  {note.created_by_name || "Recruiter"}
                </Typography>

                <Typography
                  color="text.secondary"
                  fontSize={13}
                >
                  {note.created_at?.slice(0, 10)}
                </Typography>
              </Stack>

              <Typography color="text.secondary">
                {note.note}
              </Typography>
            </Stack>
          </Box>
        ))
      )}
    </Stack>
  </Stack>
)}

          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<EventIcon />}
            variant="outlined"
            onClick={() => onScheduleInterview?.(candidate)}
            sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800 }}
          >
            Programar entrevista
          </Button>

          <Button
            startIcon={<CheckCircleIcon />}
            color="success"
            variant="outlined"
            onClick={() => onMoveStatus?.(candidate, "HIRED")}
            sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800 }}
          >
            Contratar
          </Button>

          <Button
            startIcon={<CancelIcon />}
            color="error"
            variant="outlined"
            onClick={() => onMoveStatus?.(candidate, "REJECTED")}
            sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800 }}
          >
            Rechazar
          </Button>
        </Stack>

        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 900,
            bgcolor: "#0057B8",
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function InfoCard({ icon, title, rows }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid #E5E7EB",
        height: "100%",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
        {icon}
        <Typography fontWeight={900}>{title}</Typography>
      </Stack>

      <Stack spacing={1}>
        {rows.map(([label, value]) => (
          <Stack key={label} direction="row" justifyContent="space-between" spacing={2}>
            <Typography color="text.secondary" fontSize={14}>
              {label}
            </Typography>
            <Typography fontWeight={800} fontSize={14} textAlign="right">
              {value || "No registrado"}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

function PaperItem({ children }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid #E5E7EB",
        bgcolor: "#fff",
      }}
    >
      {children}
    </Box>
  );
}

function EmptyText({ text }) {
  return (
    <Box
      sx={{
        p: 4,
        textAlign: "center",
        borderRadius: 4,
        border: "1px dashed #CBD5E1",
      }}
    >
      <Typography fontWeight={900}>{text}</Typography>
    </Box>
  );
}