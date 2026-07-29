import React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CompanyUsersPanel from "./CompanyUsersPanel";

export default function CompanyDetailDialog({
  open,
  loading,
  company,
  onClose,
  onChangeStatus,
  actionLoading,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 900 }}>
        Detalle de empresa
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" py={5}>
            <CircularProgress />
            <Typography color="text.secondary" mt={2}>
              Cargando detalle...
            </Typography>
          </Stack>
        ) : !company ? (
          <Typography color="text.secondary">
            No hay información para mostrar.
          </Typography>
        ) : (
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={company.logo_url || ""}
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: "primary.main",
                  fontWeight: 900,
                  fontSize: 28,
                }}
              >
                {company.name?.charAt(0) || "E"}
              </Avatar>

              <Box>
                <Typography variant="h5" fontWeight={900}>
                  {company.name || "Empresa sin nombre"}
                </Typography>

                <Stack direction="row" spacing={1} mt={1}>
                  <Chip
                    label={getStatusLabel(company.status)}
                    color={getStatusColor(company.status)}
                    sx={{ fontWeight: 800 }}
                  />

                  <Chip
                    label={company.plan_name || "Sin plan"}
                    color={company.plan_name ? "primary" : "default"}
                    variant={company.plan_name ? "filled" : "outlined"}
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>
              </Box>
            </Stack>

            <Divider />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <InfoBox
                  label="Ubicación"
                  value={company.location || "Sin ubicación"}
                  icon={<LocationOnIcon />}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <InfoBox
                  label="Sitio web"
                  value={company.website || "No registrado"}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <InfoBox
                  label="Plan"
                  value={company.plan_name || "Sin plan"}
                  icon={<WorkspacePremiumIcon />}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <InfoBox
                  label="Estado suscripción"
                  value={company.subscription_status || "Sin suscripción"}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <InfoBox
                  label="Vacantes publicadas"
                  value={company.total_jobs || 0}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <InfoBox
                  label="Postulaciones"
                  value={company.total_applications || 0}
                />
              </Grid>

              <Grid item xs={12}>
                <InfoBox
                  label="Descripción"
                  value={company.description || "Sin descripción"}
                />
              </Grid>
            </Grid>
          </Stack>
        )}

        {company?.id && <CompanyUsersPanel companyId={company.id} />}
        
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "none", fontWeight: 800 }}
        >
          Cerrar
        </Button>

        {company && company.status === "ACTIVE" && (
          <Button
            color="error"
            variant="contained"
            disabled={actionLoading}
            onClick={() => onChangeStatus(company.id, "SUSPENDED")}
            sx={{ borderRadius: 3, fontWeight: 800 }}
          >
            Suspender
          </Button>
        )}

        {company && company.status !== "ACTIVE" && (
          <Button
            color="success"
            variant="contained"
            disabled={actionLoading}
            onClick={() => onChangeStatus(company.id, "ACTIVE")}
            sx={{ borderRadius: 3, fontWeight: 800 }}
          >
            Activar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function InfoBox({ label, value, icon }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: "#fafcff",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {icon && <Box sx={{ color: "primary.main" }}>{icon}</Box>}
        <Typography variant="body2" color="text.secondary" fontWeight={700}>
          {label}
        </Typography>
      </Stack>

      <Typography fontWeight={900} sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}

function getStatusLabel(status) {
  const s = String(status || "").toUpperCase();
  if (s === "ACTIVE") return "Activa";
  if (s === "PENDING") return "Pendiente";
  if (s === "SUSPENDED") return "Suspendida";
  if (s === "INACTIVE") return "Inactiva";
  return "N/D";
}

function getStatusColor(status) {
  const s = String(status || "").toUpperCase();
  if (s === "ACTIVE") return "success";
  if (s === "PENDING") return "warning";
  if (s === "SUSPENDED") return "error";
  if (s === "INACTIVE") return "default";
  return "primary";
}