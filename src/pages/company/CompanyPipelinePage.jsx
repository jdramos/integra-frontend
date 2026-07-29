import React, { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WorkIcon from "@mui/icons-material/Work";

import {
  DragDropContext,
  Draggable,
  Droppable,
} from "@hello-pangea/dnd";

import {
  getCompanyJobsList,
  getJobPipeline,
  getPipelineStats
} from "../../api/jobs";

import {
  updateApplicationStatus,
} from "../../api/applications";

import CandidatePipelineDialog from "./components/CandidatePipelineDialog";
import InterviewFormDialog from "./components/InterviewFormDialog";


const columns = [
  {
    key: "APPLIED",
    title: "Postulados",
    color: "#0EA5E9",
  },
  {
    key: "SCREENING",
    title: "Screening",
    color: "#8B5CF6",
  },
  {
    key: "INTERVIEW",
    title: "Entrevista RH",
    color: "#F59E0B",
  },
  {
    key: "TECHNICAL",
    title: "Técnica",
    color: "#EC4899",
  },
  {
    key: "OFFER",
    title: "Oferta",
    color: "#14B8A6",
  },
  {
    key: "HIRED",
    title: "Contratado",
    color: "#22C55E",
  },
  {
    key: "REJECTED",
    title: "Rechazado",
    color: "#EF4444",
  },
];

export default function CompanyPipelinePage() {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");

  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openCandidateDialog, setOpenCandidateDialog] = useState(false);

  const [openInterviewDialog, setOpenInterviewDialog] = useState(false);
  const [interviewCandidate, setInterviewCandidate] = useState(null);

  const [stats, setStats] = useState({});

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (jobId) {
      loadPipeline(jobId);
    }
  }, [jobId]);

  const loadJobs = async () => {
    try {
      const data = await getCompanyJobsList();
      setJobs(data || []);

      if (data?.length) {
        setJobId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las vacantes.");
    }
  };

  const loadPipeline = async (id) => {
    try {
      setLoading(true);
      setError("");

      const data = await getJobPipeline(id);

      setPipeline(data || {});

      const statsData = await getPipelineStats(id);
      setStats(statsData || {});

    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el pipeline.");
    } finally {
      setLoading(false);
    }
  };

  const selectedJob = useMemo(() => {
    return jobs.find((j) => String(j.id) === String(jobId));
  }, [jobs, jobId]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceColumn = result.source.droppableId;
    const destinationColumn = result.destination.droppableId;

    if (sourceColumn === destinationColumn) return;

    const sourceItems = [...(pipeline[sourceColumn] || [])];
    const destinationItems = [...(pipeline[destinationColumn] || [])];

    const [movedItem] = sourceItems.splice(result.source.index, 1);

    movedItem.status = destinationColumn;

    destinationItems.splice(result.destination.index, 0, movedItem);

    const updatedPipeline = {
      ...pipeline,
      [sourceColumn]: sourceItems,
      [destinationColumn]: destinationItems,
    };

    setPipeline(updatedPipeline);

    try {
      await updateApplicationStatus(
        movedItem.application_id,
        destinationColumn
      );

      setMessage("Pipeline actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el pipeline.");
      await loadPipeline(jobId);
    }
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          border: "1px solid #E5E7EB",
          background:
            "linear-gradient(135deg, rgba(0,87,184,0.10), rgba(255,255,255,1) 55%)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "#0057B8",
                color: "#fff",
              }}
            >
              <WorkIcon />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={900}>
                Recruitment Pipeline
              </Typography>

              <Typography color="text.secondary">
                Gestiona candidatos por etapas del proceso de contratación.
              </Typography>
            </Box>
          </Stack>

          <TextField
            select
            size="small"
            label="Vacante"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            sx={{
              minWidth: 280,
              bgcolor: "#fff",
            }}
          >
            {jobs.map((job) => (
              <MenuItem key={job.id} value={job.id}>
                {job.title}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
  <Grid item xs={12} md={3}>
    <StatsCard
      title="Candidatos"
      value={stats.total_candidates || 0}
      icon={<GroupsIcon />}
      color="#0EA5E9"
    />
  </Grid>

  <Grid item xs={12} md={3}>
    <StatsCard
      title="Entrevistas"
      value={stats.interviews || 0}
      icon={<EventIcon />}
      color="#F59E0B"
    />
  </Grid>

  <Grid item xs={12} md={3}>
    <StatsCard
      title="Contratados"
      value={stats.hired || 0}
      icon={<CheckCircleIcon />}
      color="#22C55E"
    />
  </Grid>

  <Grid item xs={12} md={3}>
    <StatsCard
      title="Rechazados"
      value={stats.rejected || 0}
      icon={<CancelIcon />}
      color="#EF4444"
    />
  </Grid>
</Grid>

<PipelineFunnel stats={stats} />

      {selectedJob && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 4,
            border: "1px solid #E5E7EB",
          }}
        >
          <Typography fontWeight={900}>
            {selectedJob.title}
          </Typography>

          <Typography color="text.secondary" fontSize={14}>
            {selectedJob.location || "Ubicación no especificada"}
          </Typography>
        </Paper>

        
      )}

      {message && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack alignItems="center" py={8}>
          <CircularProgress />
        </Stack>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              pb: 2,
            }}
          >
            {columns.map((column) => {
              const items = pipeline[column.key] || [];

              return (
                <Paper
                  key={column.key}
                  elevation={0}
                  sx={{
                    minWidth: 320,
                    width: 320,
                    borderRadius: 4,
                    border: "1px solid #E5E7EB",
                    bgcolor: "#F8FAFC",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: column.color,
                      color: "#fff",
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography fontWeight={900}>
                        {column.title}
                      </Typography>

                      <Box
                        sx={{
                          px: 1.2,
                          py: 0.3,
                          borderRadius: 999,
                          bgcolor: "rgba(255,255,255,0.22)",
                          fontWeight: 900,
                          fontSize: 13,
                        }}
                      >
                        {items.length}
                      </Box>
                    </Stack>
                  </Box>

                  <Droppable droppableId={column.key}>
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          p: 1.5,
                          minHeight: "70vh",
                        }}
                      >
                        <Stack spacing={1.5}>
                          {items.map((candidate, index) => (
                            <Draggable
                              key={candidate.application_id}
                              draggableId={String(candidate.application_id)}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Paper
                                   onClick={() => {
                                    setSelectedCandidate(candidate);
                                    setOpenCandidateDialog(true);
                                  }}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    borderRadius: 4,
                                    border: "1px solid #E5E7EB",
                                    cursor: "pointer",
                                    transition: "0.2s",
                                    bgcolor: snapshot.isDragging
                                      ? "#EFF6FF"
                                      : "#fff",

                                    "&:hover": {
                                      borderColor: "#0B66C3",
                                      transform: "translateY(-2px)",
                                    },
                                  }}
                                >
                                  <Stack spacing={1.5}>
                                    <Stack
                                      direction="row"
                                      spacing={1.5}
                                      alignItems="center"
                                    >
                                      <Avatar
                                        sx={{
                                          bgcolor: column.color,
                                          fontWeight: 900,
                                        }}
                                      >
                                        {candidate.candidate_name?.charAt(0)}
                                      </Avatar>

                                      <Box flex={1}>
                                        <Typography
                                          fontWeight={900}
                                          fontSize={15}
                                        >
                                          {candidate.candidate_name}
                                        </Typography>

                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {candidate.candidate_email}
                                        </Typography>
                                      </Box>
                                    </Stack>

                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Aplicación #{candidate.application_id}
                                    </Typography>
                                  </Stack>
                                </Paper>
                              )}
                            </Draggable>
                          ))}

                          {provided.placeholder}
                        </Stack>
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              );
            })}

            <CandidatePipelineDialog
              open={openCandidateDialog}
              candidate={selectedCandidate}
              onClose={() => {
                setOpenCandidateDialog(false);
                setSelectedCandidate(null);
              }}
              onScheduleInterview={(candidate) => {
                setInterviewCandidate(candidate);

                setOpenCandidateDialog(false);

                setOpenInterviewDialog(true);
              }}
              onMoveStatus={async (candidate, status) => {
                try {
                  await updateApplicationStatus(
                    candidate.application_id,
                    status
                  );

                  setMessage("Estado actualizado correctamente.");

                  setOpenCandidateDialog(false);
                  setSelectedCandidate(null);

                  await loadPipeline(jobId);
                } catch (err) {
                  console.error(err);
                  setError("No se pudo actualizar el estado.");
                }
              }}
            />

            <InterviewFormDialog
              open={openInterviewDialog}
              onClose={() => {
                setOpenInterviewDialog(false);
                setInterviewCandidate(null);
              }}
              onSaved={async () => {
                setMessage("Entrevista programada correctamente.");

                setOpenInterviewDialog(false);
                setInterviewCandidate(null);
              }}
              defaultJobId={jobId}
              defaultCandidateId={
                interviewCandidate?.candidate_id || interviewCandidate?.candidate_user_id
              }
              defaultApplicationId={interviewCandidate?.application_id}
            />

          </Box>
        </DragDropContext>
      )}
    </Box>
  );
}

function StatsCard({ title, value, icon, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid #E5E7EB",
        height: "100%",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography
            color="text.secondary"
            fontSize={14}
            fontWeight={700}
          >
            {title}
          </Typography>

          <Typography
            fontSize={30}
            fontWeight={900}
          >
            {value}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            bgcolor: `${color}15`,
            color,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

function PipelineFunnel({ stats }) {
  const total = Number(stats.total_candidates || 0);

  const items = [
    { label: "Postulados", value: Number(stats.applied || 0), color: "#0EA5E9" },
    { label: "Screening", value: Number(stats.screening || 0), color: "#8B5CF6" },
    { label: "Entrevistas", value: Number(stats.interviews || 0), color: "#F59E0B" },
    { label: "Técnica", value: Number(stats.technical || 0), color: "#EC4899" },
    { label: "Oferta", value: Number(stats.offer || 0), color: "#14B8A6" },
    { label: "Contratados", value: Number(stats.hired || 0), color: "#22C55E" },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 4,
        border: "1px solid #E5E7EB",
      }}
    >
      <Typography fontWeight={900} mb={2}>
        Funnel de conversión
      </Typography>

      <Stack spacing={1.6}>
        {items.map((item) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;

          return (
            <Box key={item.label}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={0.6}
              >
                <Typography fontWeight={800} fontSize={14}>
                  {item.label}
                </Typography>

                <Typography color="text.secondary" fontSize={14}>
                  {item.value} candidatos · {percent}%
                </Typography>
              </Stack>

              <Box
                sx={{
                  height: 10,
                  borderRadius: 999,
                  bgcolor: "#E5E7EB",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${percent}%`,
                    height: "100%",
                    bgcolor: item.color,
                    borderRadius: 999,
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}