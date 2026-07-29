import React from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VerifiedIcon from "@mui/icons-material/Verified";

export default function AdminDashboardHeader({ loading, onRefresh }) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: 1,
        borderRadius: 5,
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
          width: 280,
          height: 280,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.08)",
          top: -100,
          right: -80,
        }}
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={1}
        sx={{ position: "relative", zIndex: 2 }}
      >
        <Box>
          <Chip
            icon={<VerifiedIcon />}
            label="Administrador SaaS"
            sx={{
              mb: 1,
              bgcolor: "rgba(255,255,255,0.16)",
              color: "white",
              fontWeight: 800,
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          />

          <Typography variant="h4" fontWeight={900}>
            Panel administrador
          </Typography>

          <Typography sx={{ color: "rgba(255,255,255,0.82)", mt: 0 }}>
            Control general de empresas, candidatos, vacantes y postulaciones.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
          sx={{
            bgcolor: "white",
            color: "primary.main",
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 900,
            px: 3,
            "&:hover": {
              bgcolor: "#f3f6fb",
            },
          }}
        >
          Actualizar
        </Button>
      </Stack>
    </Paper>
  );
}