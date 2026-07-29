import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  LinearProgress,
  Chip,
} from "@mui/material";

import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  Tooltip,
  LabelList,
} from "recharts";

import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GroupsIcon from "@mui/icons-material/Groups";
import EventIcon from "@mui/icons-material/Event";
import HandshakeIcon from "@mui/icons-material/Handshake";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import api from "../../api/api";

const stageConfig = {
  APPLIED: {
    label: "Aplicados",
    icon: <WorkOutlineIcon />,
  },
  REVIEWED: {
    label: "Revisados",
    icon: <VisibilityIcon />,
  },
  SHORTLISTED: {
    label: "Preseleccionados",
    icon: <GroupsIcon />,
  },
  INTERVIEW: {
    label: "Entrevistas",
    icon: <EventIcon />,
  },
  OFFER: {
    label: "Ofertas",
    icon: <HandshakeIcon />,
  },
  HIRED: {
    label: "Contratados",
    icon: <CheckCircleIcon />,
  },
  REJECTED: {
    label: "Rechazados",
    icon: <CancelIcon />,
  },
};

export default function CompanyPipelineAnalytics() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/company/analytics/pipeline");
      setRows(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const normalizedData = useMemo(() => {
    return Object.keys(stageConfig).map((status) => {
      const found = rows.find((r) => r.status === status);

      return {
        status,
        label: stageConfig[status].label,
        total: Number(found?.total || 0),
      };
    });
  }, [rows]);

  const totalApplicants = normalizedData.reduce(
    (acc, item) => acc + item.total,
    0
  );

  const hired =
    normalizedData.find((i) => i.status === "HIRED")?.total || 0;

  const conversionRate =
    totalApplicants > 0
      ? ((hired / totalApplicants) * 100).toFixed(1)
      : 0;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            Pipeline ATS
          </Typography>

          <Typography color="text.secondary">
            Seguimiento de candidatos por etapa
          </Typography>
        </Box>

        <Chip
          label={`${conversionRate}% contratación`}
          color="primary"
        />
      </Stack>

      <Grid container spacing={2}>
        {normalizedData.map((item) => {
          const config = stageConfig[item.status];

          const progress =
            totalApplicants > 0
              ? (item.total / totalApplicants) * 100
              : 0;

          return (
            <Grid item xs={12} sm={6} md={3} key={item.status}>
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
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>{config.icon}</Box>

                    <Typography
                      variant="h5"
                      fontWeight={900}
                    >
                      {item.total}
                    </Typography>
                  </Stack>

                  <Box>
                    <Typography fontWeight={700}>
                      {config.label}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {progress.toFixed(1)}% del pipeline
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: 999,
                    }}
                  />
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          height: 450,
        }}
      >
        <Typography variant="h6" fontWeight={800} mb={3}>
          Funnel de Reclutamiento
        </Typography>

        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip />

            <Funnel
              dataKey="total"
              data={normalizedData}
              isAnimationActive
            >
              <LabelList
                position="right"
                fill="#000"
                stroke="none"
                dataKey="label"
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}