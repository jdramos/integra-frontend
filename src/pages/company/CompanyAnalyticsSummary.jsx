import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
} from "@mui/material";

import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import HandshakeIcon from "@mui/icons-material/Handshake";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { getCompanyAnalyticsSummary } from "../../api/company";

const cards = [
  {
    key: "total_jobs",
    label: "Vacantes",
    icon: <WorkIcon />,
  },
  {
    key: "total_applications",
    label: "Aplicaciones",
    icon: <PeopleIcon />,
  },
  {
    key: "interviews",
    label: "Entrevistas",
    icon: <EventIcon />,
  },
  {
    key: "offers",
    label: "Ofertas",
    icon: <HandshakeIcon />,
  },
  {
    key: "hired",
    label: "Contratados",
    icon: <CheckCircleIcon />,
  },
  {
    key: "conversion_rate",
    label: "Conversión",
    icon: <TrendingUpIcon />,
    suffix: "%",
  },
];

export default function CompanyAnalyticsSummary() {
  const [data, setData] = useState({});

  const loadData = async () => {
    try {
      const result = await getCompanyAnalyticsSummary();
      setData(result || {});
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Box mb={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            Resumen ATS
          </Typography>

          <Typography color="text.secondary">
            Indicadores principales de reclutamiento
          </Typography>
        </Box>

        <Chip
          label={`${data.active_jobs || 0} vacantes activas`}
          color="primary"
        />
      </Stack>

      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={card.key}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 3,
                    bgcolor: "primary.main",
                    color: "white",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {card.icon}
                </Box>

                <Typography variant="h5" fontWeight={900}>
                  {data[card.key] || 0}
                  {card.suffix || ""}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}