import React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import { Link as RouterLink } from "react-router-dom";
import EventIcon from "@mui/icons-material/Event";
import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import PlaceIcon from "@mui/icons-material/Place";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PersonOffIcon from "@mui/icons-material/PersonOff";

const statusMap = {
  SCHEDULED: { label: "Programada", color: "info" },
  CONFIRMED: { label: "Confirmada", color: "success" },
  CANCELLED: { label: "Cancelada", color: "error" },
  COMPLETED: { label: "Realizada", color: "primary" },
  NO_SHOW: { label: "No asistió", color: "warning" },
};

const typeMap = {
  VIRTUAL: "Virtual",
  PRESENCIAL: "Presencial",
  TELEFONICA: "Telefónica",
};

export default function InterviewDetailDialog({
  open,
  interview,
  onClose,
  onStatusChange,
}) {
  if (!interview) return null;

  const status = statusMap[interview.status] || statusMap.SCHEDULED;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>
        Detalle de entrevista
        <Typography color="text.secondary" fontSize={14}>
          Información completa de la entrevista programada.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.2}>
          <Box
            sx={{
              p: 2,
              borderRadius: 4,
              background:
                "linear-gradient(135deg, rgba(0,87,184,0.10), rgba(255,255,255,1))",
              border: "1px solid #E5E7EB",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 54,
                  height: 54,
                  bgcolor: "#0057B8",
                  fontWeight: 900,
                }}
              >
                {interview.candidate_name?.charAt(0) || "C"}
              </Avatar>

              <Box flex={1}>
                <Typography
                  fontWeight={900}
                  fontSize={18}
                  component={interview.candidate_id ? RouterLink : "p"}
                  to={interview.candidate_id ? `/company/candidates/${interview.candidate_id}` : undefined}
                  sx={
                    interview.candidate_id
                      ? { color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } }
                      : undefined
                  }
                >
                  {interview.candidate_name || "Candidato"}
                </Typography>

                <Typography color="text.secondary" fontSize={14}>
                  {interview.candidate_email || "Sin correo"}
                </Typography>
              </Box>

              <Chip label={status.label} color={status.color} sx={{ fontWeight: 800 }} />
            </Stack>
          </Box>

          <Stack spacing={1.3}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <WorkIcon color="primary" fontSize="small" />
              <Box>
                <Typography fontWeight={900}>{interview.job_title}</Typography>
                <Typography color="text.secondary" fontSize={13}>
                  {interview.title}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.2} alignItems="center">
              <EventIcon color="primary" fontSize="small" />
              <Typography>
                {interview.interview_date?.slice(0, 10)} ·{" "}
                {interview.start_time?.slice(0, 5)} -{" "}
                {interview.end_time?.slice(0, 5)}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.2} alignItems="center">
              <PersonIcon color="primary" fontSize="small" />
              <Typography>{typeMap[interview.interview_type] || interview.interview_type}</Typography>
            </Stack>

            {interview.interview_type === "VIRTUAL" && interview.meeting_url && (
              <Stack direction="row" spacing={1.2} alignItems="center">
                <VideoCameraFrontIcon color="primary" fontSize="small" />
                <Typography
                  component="a"
                  href={interview.meeting_url}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ color: "#0057B8", fontWeight: 800 }}
                >
                  Abrir reunión
                </Typography>
              </Stack>
            )}

            {interview.location && (
              <Stack direction="row" spacing={1.2} alignItems="center">
                <PlaceIcon color="primary" fontSize="small" />
                <Typography>{interview.location}</Typography>
              </Stack>
            )}
          </Stack>

          {interview.notes && (
            <>
              <Divider />
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E5E7EB",
                }}
              >
                <Typography fontWeight={900} mb={0.5}>
                  Notas
                </Typography>
                <Typography color="text.secondary">{interview.notes}</Typography>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => onStatusChange(interview.id, "CONFIRMED")}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            Confirmar
          </Button>

          <Button
            size="small"
            color="primary"
            startIcon={<DoneAllIcon />}
            onClick={() => onStatusChange(interview.id, "COMPLETED")}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            Realizada
          </Button>

          <Button
            size="small"
            color="warning"
            startIcon={<PersonOffIcon />}
            onClick={() => onStatusChange(interview.id, "NO_SHOW")}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            No asistió
          </Button>

          <Button
            size="small"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => onStatusChange(interview.id, "CANCELLED")}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            Cancelar
          </Button>
        </Stack>

        <Button
          onClick={onClose}
          variant="contained"
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