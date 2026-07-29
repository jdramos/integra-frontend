import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { getJobApplicants, updateApplicationStatus } from "../../../api/company";

const primary = "#0057B8";

const stages = [
  { key: "PENDING", label: "Postulado", color: "warning" },
  { key: "REVIEWING", label: "En revisión", color: "info" },
  { key: "INTERVIEW", label: "Entrevista", color: "primary" },
  { key: "TEST", label: "Prueba", color: "secondary" },
  { key: "ACCEPTED", label: "Aprobado", color: "success" },
  { key: "REJECTED", label: "Rechazado", color: "error" },
];

export default function RecruitmentPipelineModal({ open, onClose, job }) {
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
          "No se pudo cargar el pipeline"
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

  const grouped = useMemo(() => {
    return stages.reduce((acc, stage) => {
      acc[stage.key] = applicants.filter(
        (a) => (a.status || "PENDING") === stage.key
      );
      return acc;
    }, {});
  }, [applicants]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const applicationId = draggableId;
    const nextStatus = destination.droppableId;
    const previousStatus = source.droppableId;

    const oldApplicants = applicants;

    setApplicants((prev) =>
      prev.map((item) =>
        String(item.application_id || item.id) === String(applicationId)
          ? { ...item, status: nextStatus }
          : item
      )
    );

    try {
      await updateApplicationStatus(applicationId, nextStatus);
    } catch (err) {
      console.error(err);

      setApplicants(oldApplicants);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          `No se pudo mover de ${previousStatus} a ${nextStatus}`
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ViewKanbanIcon sx={{ color: primary }} />

          <Box>
            <Typography variant="h6" fontWeight={900}>
              Pipeline de reclutamiento
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {job?.title || "Vacante"} · Arrastra candidatos entre etapas
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "#F6F8FB" }}>
        {loading ? (
          <Stack py={6} alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography color="text.secondary">Cargando pipeline...</Typography>
          </Stack>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Grid container spacing={2}>
              {stages.map((stage) => (
                <Grid item xs={12} md={4} lg={2} key={stage.key}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 4,
                      border: "1px solid #E5EAF2",
                      minHeight: 520,
                      bgcolor: "white",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" mb={1.5}>
                      <Chip
                        size="small"
                        color={stage.color}
                        label={stage.label}
                        sx={{ fontWeight: 900 }}
                      />

                      <Chip
                        size="small"
                        label={grouped[stage.key]?.length || 0}
                        variant="outlined"
                      />
                    </Stack>

                    <Droppable droppableId={stage.key}>
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{
                            minHeight: 440,
                            borderRadius: 3,
                            p: 0.5,
                            bgcolor: snapshot.isDraggingOver
                              ? "#EAF2FF"
                              : "transparent",
                            transition: "background-color 0.2s ease",
                          }}
                        >
                          {(grouped[stage.key] || []).length === 0 && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 2, textAlign: "center" }}
                            >
                              Arrastra aquí
                            </Typography>
                          )}

                          <Stack spacing={1.5}>
                            {(grouped[stage.key] || []).map((applicant, index) => {
                              const applicationId = String(
                                applicant.application_id || applicant.id
                              );

                              return (
                                <Draggable
                                  key={applicationId}
                                  draggableId={applicationId}
                                  index={index}
                                >
                                  {(dragProvided, dragSnapshot) => (
                                    <Paper
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                      elevation={dragSnapshot.isDragging ? 6 : 0}
                                      sx={{
                                        p: 1.5,
                                        borderRadius: 3,
                                        border: "1px solid #E5EAF2",
                                        bgcolor: dragSnapshot.isDragging
                                          ? "#FFFFFF"
                                          : "#FBFCFF",
                                        cursor: "pointer",
                                        transform: dragSnapshot.isDragging
                                          ? "rotate(1deg)"
                                          : "none",
                                      }}
                                    >
                                      <Stack spacing={1}>
                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          alignItems="center"
                                        >
                                          <Avatar
                                            sx={{
                                              width: 34,
                                              height: 34,
                                              bgcolor: "#EAF2FF",
                                              color: primary,
                                              fontSize: 14,
                                              fontWeight: 900,
                                            }}
                                          >
                                            {
                                              (
                                                applicant.name ||
                                                applicant.candidate_name ||
                                                "C"
                                              )[0]
                                            }
                                          </Avatar>

                                          <Box minWidth={0}>
                                            <Typography
                                              fontWeight={900}
                                              fontSize={13}
                                              noWrap
                                            >
                                              {applicant.name ||
                                                applicant.candidate_name ||
                                                "Candidato"}
                                            </Typography>

                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              noWrap
                                              display="block"
                                            >
                                              {applicant.title ||
                                                applicant.headline ||
                                                applicant.last_position ||
                                                "Perfil profesional"}
                                            </Typography>
                                          </Box>
                                        </Stack>

                                        <Stack
                                          direction="row"
                                          spacing={0.7}
                                          flexWrap="wrap"
                                        >
                                          <Chip
                                            size="small"
                                            label={`${
                                              applicant.match_score ||
                                              applicant.score ||
                                              0
                                            }% match`}
                                            color="primary"
                                            sx={{ fontWeight: 800 }}
                                          />

                                          <Chip
                                            size="small"
                                            label={
                                              applicant.location || "Sin ubicación"
                                            }
                                          />
                                        </Stack>
                                      </Stack>
                                    </Paper>
                                  )}
                                </Draggable>
                              );
                            })}

                            {provided.placeholder}
                          </Stack>
                        </Box>
                      )}
                    </Droppable>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </DragDropContext>
        )}
      </DialogContent>
    </Dialog>
  );
}