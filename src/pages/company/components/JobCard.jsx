import React from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import MatchChip from "./MatchChip";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";

export default function JobCard({
  job,
  onEdit,
  onApplicants,
  onToggleStatus,
  onPipeline,
}) {
  const isOpen = job.status === "OPEN";

  return (
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
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography fontWeight={900}>{job.title}</Typography>

            <Chip
              size="small"
              label={isOpen ? "Abierta" : "Cerrada"}
              color={isOpen ? "success" : "default"}
              sx={{ fontWeight: 800 }}
            />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {job.location} · {job.modality || job.work_mode}
          </Typography>

          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            <Chip size="small" label={`${job.applicants || 0} postulantes`} />
            <Chip size="small" label={`${job.matched || 0} compatibles`} />
            <MatchChip value={job.score || 0} />
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => onApplicants?.(job)}
          >
            Postulantes
          </Button>

          <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit?.(job)}>
            Editar
          </Button>

          <Button
            size="small"
            color={isOpen ? "warning" : "success"}
            startIcon={isOpen ? <LockIcon /> : <LockOpenIcon />}
            onClick={() => onToggleStatus?.(job)}
          >
            {isOpen ? "Cerrar" : "Abrir"}
          </Button>

        <Button
          size="small"
          variant="outlined"
          startIcon={<ViewKanbanIcon />}
          onClick={() => onPipeline?.(job)}
        >
          Pipeline
        </Button>

        </Stack>
      </Stack>
    </Paper>
  );
}