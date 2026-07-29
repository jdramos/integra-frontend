import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import EventIcon from "@mui/icons-material/Event";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import PlaceIcon from "@mui/icons-material/Place";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import InterviewDetailDialog from "./components/InterviewDetailDialog";

import {
  deleteInterview,
  getCompanyInterviews,
  updateInterviewStatus,
} from "../../api/interviews";

import InterviewFormDialog from "./components/InterviewFormDialog";

const statusMap = {
  SCHEDULED: { label: "Programada", color: "info", calendarColor: "#0284C7" },
  CONFIRMED: { label: "Confirmada", color: "success", calendarColor: "#16A34A" },
  CANCELLED: { label: "Cancelada", color: "error", calendarColor: "#DC2626" },
  COMPLETED: { label: "Realizada", color: "primary", calendarColor: "#0057B8" },
  NO_SHOW: { label: "No asistió", color: "warning", calendarColor: "#D97706" },
};

const typeMap = {
  VIRTUAL: "Virtual",
  PRESENCIAL: "Presencial",
  TELEFONICA: "Telefónica",
};

export default function CompanyInterviewsPage() {
  const [rows, setRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [openForm, setOpenForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedInterview, setSelectedInterview] = useState(null);
const [openDetail, setOpenDetail] = useState(false);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCompanyInterviews();
      setRows(data || []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las entrevistas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const byStatus = statusFilter ? item.status === statusFilter : true;
      const byDate = dateFilter
        ? item.interview_date?.slice(0, 10) === dateFilter
        : true;

      return byStatus && byDate;
    });
  }, [rows, statusFilter, dateFilter]);

  const calendarEvents = useMemo(() => {
    return filteredRows.map((item) => {
      const status = statusMap[item.status] || statusMap.SCHEDULED;

      return {
        id: String(item.id),
        title: `${item.candidate_name || "Candidato"} · ${item.job_title || item.title}`,
        start: `${item.interview_date?.slice(0, 10)}T${item.start_time}`,
        end: `${item.interview_date?.slice(0, 10)}T${item.end_time}`,
        backgroundColor: status.calendarColor,
        borderColor: status.calendarColor,
        extendedProps: item,
      };
    });
  }, [filteredRows]);

  const handleStatus = async (id, status) => {
    try {
      setMessage("");
      setError("");

      await updateInterviewStatus(id, status);
      setMessage("Estado actualizado correctamente.");
      await loadInterviews();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el estado.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("¿Deseas eliminar esta entrevista?");
    if (!confirmed) return;

    try {
      setMessage("");
      setError("");

      await deleteInterview(id);
      setMessage("Entrevista eliminada correctamente.");
      await loadInterviews();
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la entrevista.");
    }
  };

  const handleEventClick = (info) => {
  setSelectedInterview(info.event.extendedProps);
  setOpenDetail(true);
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
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
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
              <EventIcon />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={900}>
                Calendario de entrevistas
              </Typography>
              <Typography color="text.secondary">
                Programa, confirma y da seguimiento a las entrevistas de tus candidatos.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 800,
              bgcolor: "#0057B8",
            }}
          >
            Programar entrevista
          </Button>
        </Stack>
      </Paper>

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

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 4,
          border: "1px solid #E5E7EB",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Estado"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="SCHEDULED">Programadas</MenuItem>
              <MenuItem value="CONFIRMED">Confirmadas</MenuItem>
              <MenuItem value="CANCELLED">Canceladas</MenuItem>
              <MenuItem value="COMPLETED">Realizadas</MenuItem>
              <MenuItem value="NO_SHOW">No asistió</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Fecha"
              InputLabelProps={{ shrink: true }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                height: 40,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 800,
              }}
              onClick={() => {
                setStatusFilter("");
                setDateFilter("");
              }}
            >
              Limpiar filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 4,
              border: "1px solid #E5E7EB",
              overflow: "hidden",

              "& .fc": {
                fontFamily: "inherit",
              },
              "& .fc-toolbar-title": {
                fontWeight: 900,
                fontSize: "1.35rem",
              },
              "& .fc-button": {
                borderRadius: "10px !important",
                textTransform: "none !important",
                fontWeight: "800 !important",
              },
              "& .fc-button-primary": {
                backgroundColor: "#0057B8 !important",
                borderColor: "#0057B8 !important",
              },
              "& .fc-event": {
                borderRadius: "8px",
                border: "none",
                padding: "2px 4px",
                fontWeight: 700,
                cursor: "pointer",
              },
              "& .fc-daygrid-day-number": {
                fontWeight: 700,
                color: "#334155",
              },
            }}
          >
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="es"
              height="auto"
              events={calendarEvents}
              eventClick={handleEventClick}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              buttonText={{
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
              }}
            />
          </Paper>

          <Typography variant="h6" fontWeight={900} mb={2}>
            Entrevistas programadas
          </Typography>

          {filteredRows.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: "center",
                borderRadius: 4,
                border: "1px dashed #CBD5E1",
              }}
            >
              <Typography fontWeight={900}>No hay entrevistas para mostrar</Typography>
              <Typography color="text.secondary">
                Cuando programes entrevistas aparecerán aquí.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredRows.map((item) => {
                const status = statusMap[item.status] || statusMap.SCHEDULED;

                return (
                  <Grid item xs={12} md={6} lg={4} key={item.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.2,
                        borderRadius: 4,
                        border: "1px solid #E5E7EB",
                        height: "100%",
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Chip
                            size="small"
                            label={status.label}
                            color={status.color}
                            sx={{ fontWeight: 800 }}
                          />

                          <Chip
                            size="small"
                            variant="outlined"
                            label={typeMap[item.interview_type] || item.interview_type}
                            sx={{ fontWeight: 700 }}
                          />
                        </Stack>

                        <Box>
                          <Typography fontWeight={900} fontSize={17}>
                            {item.title}
                          </Typography>

                          <Typography color="text.secondary" fontSize={14}>
                            {item.job_title}
                          </Typography>
                        </Box>

                        <Divider />

                        <Stack spacing={0.5}>
                          <Typography fontWeight={800}>
                            {item.candidate_name}
                          </Typography>

                          <Typography color="text.secondary" fontSize={14}>
                            {item.candidate_email}
                          </Typography>
                        </Stack>

                        <Stack spacing={0.8}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <EventIcon fontSize="small" color="primary" />
                            <Typography fontSize={14}>
                              {item.interview_date?.slice(0, 10)} ·{" "}
                              {item.start_time?.slice(0, 5)} -{" "}
                              {item.end_time?.slice(0, 5)}
                            </Typography>
                          </Stack>

                          {item.interview_type === "VIRTUAL" && item.meeting_url && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <VideoCameraFrontIcon fontSize="small" color="primary" />
                              <Typography
                                component="a"
                                href={item.meeting_url}
                                target="_blank"
                                rel="noreferrer"
                                fontSize={14}
                                sx={{ color: "#0057B8", fontWeight: 800 }}
                              >
                                Abrir reunión
                              </Typography>
                            </Stack>
                          )}

                          {item.location && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <PlaceIcon fontSize="small" color="primary" />
                              <Typography fontSize={14}>{item.location}</Typography>
                            </Stack>
                          )}
                        </Stack>

                        {item.notes && (
                          <Typography
                            fontSize={13}
                            color="text.secondary"
                            sx={{
                              bgcolor: "#F8FAFC",
                              p: 1.2,
                              borderRadius: 3,
                            }}
                          >
                            {item.notes}
                          </Typography>
                        )}

                        <Divider />

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Confirmar">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleStatus(item.id, "CONFIRMED")}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Realizada">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleStatus(item.id, "COMPLETED")}
                              >
                                <DoneAllIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="No asistió">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleStatus(item.id, "NO_SHOW")}
                              >
                                <PersonOffIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Cancelar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleStatus(item.id, "CANCELLED")}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>

                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(item.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}

      <InterviewFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={async () => {
          setMessage("Entrevista programada correctamente.");
          await loadInterviews();
        }}
      />

      <InterviewDetailDialog
        open={openDetail}
        interview={selectedInterview}
        onClose={() => {
            setOpenDetail(false);
            setSelectedInterview(null);
        }}
        onStatusChange={async (id, status) => {
            await handleStatus(id, status);
            setOpenDetail(false);
            setSelectedInterview(null);
        }}
        />
    </Box>
  );
}