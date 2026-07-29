import React from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";
import RefreshIcon from "@mui/icons-material/Refresh";
import VerifiedIcon from "@mui/icons-material/Verified";

import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";

import AdminSmartStatCard from "./AdminSmartStatCard";

export default function AdminDashboardHeaderStats({
  loading,
  onRefresh,
  stats,
}) {

    const navigate = useNavigate();


  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, md: 2.25 },
        mb: 1,
        borderRadius: 4,
        color: "white",
        background:
          "linear-gradient(135deg, #071a52 0%, #123c8c 50%, #1976d2 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 240,
          height: 240,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.08)",
          top: -80,
          right: -60,
        }}
      />

      <Stack spacing={1.5} sx={{ position: "relative", zIndex: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1}
        >
          <Box>
            <Chip
              icon={<VerifiedIcon />}
              label="Administrador SaaS"
              size="small"
              sx={{
                mb: 0.5,
                bgcolor: "rgba(255,255,255,0.16)",
                color: "white",
                fontWeight: 800,
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            />

            <Typography variant="h5" fontWeight={900} lineHeight={1.15}>
              Panel administrador
            </Typography>

            <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
              Control general de empresas, candidatos, vacantes y postulaciones.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
                variant="outlined"
                size="small"
                startIcon={<GroupIcon />}
                onClick={() => navigate("/admin/users")}
                sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.4)",
                textTransform: "none",
                fontWeight: 800,
                borderRadius: 2,
                "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                },
                }}
            >
                Usuarios
            </Button>

            <Button
                variant="contained"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
                disabled={loading}
                sx={{
                bgcolor: "white",
                color: "primary.main",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 900,
                px: 2,
                "&:hover": {
                    bgcolor: "#f3f6fb",
                },
                }}
            >
                Actualizar
            </Button>
</Stack>
        </Stack>

        <Grid container spacing={1}>
          <Grid item xs={6} md={3}>
            <AdminSmartStatCard
              title="Empresas"
              value={stats?.companies || 0}
              trend={stats?.companies_trend || 0}
              helper="Total registradas"
              icon={<BusinessIcon fontSize="small" />}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <AdminSmartStatCard
              title="Candidatos"
              value={stats?.candidates || 0}
              trend={stats?.candidates_trend || 0}
              helper="Perfiles activos"
              icon={<PeopleIcon fontSize="small" />}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <AdminSmartStatCard
              title="Vacantes"
              value={stats?.jobs || 0}
              trend={stats?.jobs_trend || 0}
              helper="Publicaciones totales"
              icon={<WorkIcon fontSize="small" />}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <AdminSmartStatCard
              title="Postulaciones"
              value={stats?.applications || 0}
              trend={stats?.applications_trend || 0}
              helper="Aplicaciones recibidas"
              icon={<AssignmentIcon fontSize="small" />}
            />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
}