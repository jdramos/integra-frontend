import React from "react";
import { Avatar, Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";

const formatDate = (value) => value
  ? new Date(value).toLocaleString("es-NI", { dateStyle: "medium", timeStyle: "short" })
  : "";

export default function CandidateProfileViewsTab({ views = [], loading = false }) {
  if (loading) {
    return <Stack alignItems="center" py={5}><CircularProgress /></Stack>;
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6" fontWeight={900}>Empresas que han visto tu perfil</Typography>
        <Typography color="text.secondary">
          Aquí aparecen las empresas que consultaron tu perfil profesional.
        </Typography>
      </Box>

      {views.map((view) => (
        <Paper key={view.company_id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={view.logo_url || ""} sx={{ width: 52, height: 52, bgcolor: "primary.main" }}>
              {!view.logo_url && <BusinessIcon />}
            </Avatar>
            <Box flex={1}>
              <Typography fontWeight={900}>{view.company_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {view.location || "Ubicación no especificada"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Última visita: {formatDate(view.last_viewed_at)}
                {Number(view.view_count) > 1 ? ` · ${view.view_count} visitas` : ""}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      ))}

      {!views.length && (
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
          <BusinessIcon sx={{ fontSize: 42, color: "text.disabled" }} />
          <Typography fontWeight={800} mt={1}>Aún no hay visitas</Typography>
          <Typography color="text.secondary">Cuando una empresa vea tu perfil aparecerá aquí.</Typography>
        </Paper>
      )}
    </Stack>
  );
}
