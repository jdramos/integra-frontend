// src/components/company/ApplicationTimeline.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";

import { getApplicationHistory } from "../../../api/jobs";

const statusLabels = {
  APPLIED: "Aplicado",
  REVIEWED: "Revisado",
  SHORTLISTED: "Preseleccionado",
  INTERVIEW: "Entrevista",
  OFFER: "Oferta",
  HIRED: "Contratado",
  REJECTED: "Rechazado",
};

export default function ApplicationTimeline({ applicationId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getApplicationHistory(applicationId);
      setRows(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      loadHistory();
    }
  }, [applicationId]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="h6" fontWeight={900} mb={2}>
        Historial del candidato
      </Typography>

      {loading ? (
        <Stack alignItems="center" py={3}>
          <CircularProgress size={28} />
        </Stack>
      ) : rows.length === 0 ? (
        <Typography color="text.secondary">
          Aún no hay movimientos registrados.
        </Typography>
      ) : (
        <Timeline position="right" sx={{ p: 0, m: 0 }}>
          {rows.map((item, index) => (
            <TimelineItem key={item.id}>
              <TimelineOppositeContent
                sx={{
                  flex: 0.25,
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                {new Date(item.changed_at).toLocaleDateString("es-NI")}
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color="primary" />
                {index < rows.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent>
                <Box>
                  <Typography fontWeight={800}>
                    {statusLabels[item.new_status] || item.new_status}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    De{" "}
                    {statusLabels[item.old_status] ||
                      item.old_status ||
                      "Inicio"}{" "}
                    a {statusLabels[item.new_status] || item.new_status}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Por {item.changed_by_name || "Sistema"}
                  </Typography>
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Paper>
  );
}