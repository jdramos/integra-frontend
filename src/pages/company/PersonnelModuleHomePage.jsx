import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PaymentsIcon from "@mui/icons-material/Payments";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import DescriptionIcon from "@mui/icons-material/Description";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RedeemIcon from "@mui/icons-material/Redeem";
import { useNavigate } from "react-router-dom";
import { getPersonnelOverview } from "../../api/company";

const cards = [
  {
    title: "Colaboradores",
    description: "Expedientes, cargos, contratos e historial salarial.",
    icon: <GroupsIcon color="primary" />,
    path: "/company/personnel/employees",
    active: true,
  },
  {
    title: "Planillas",
    description: "Cálculo, revisión, aprobación y comprobantes de pago.",
    icon: <PaymentsIcon color="primary" />,
    path: "/company/personnel/payroll",
    active: true,
  },
  {
    title: "Vacaciones y permisos",
    description: "Saldos, solicitudes, ausencias y calendario laboral.",
    icon: <BeachAccessIcon color="primary" />,
    path: "/company/personnel/leave",
    active: true,
  },
  {
    title: "Documentos laborales",
    description: "Contratos, constancias y documentos con vencimiento.",
    icon: <DescriptionIcon color="primary" />,
    path: "/company/personnel/documents",
    active: true,
  },
  {
    title: "Asistencia e incidencias",
    description: "Jornadas, tardanzas, ausencias y horas extraordinarias.",
    icon: <AccessTimeIcon color="primary" />,
    path: "/company/personnel/attendance",
    active: true,
  },
  {
    title: "Prestaciones laborales",
    description: "Aguinaldo, acumulados y futuras liquidaciones.",
    icon: <RedeemIcon color="primary" />,
    path: "/company/personnel/benefits",
    active: true,
  },
];

export default function PersonnelModuleHomePage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPersonnelOverview()
      .then(setOverview)
      .catch((err) =>
        setError(
          err?.response?.data?.message ||
            "No se pudo cargar el resumen del módulo.",
        ),
      );
  }, []);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Personal y planilla
          </Typography>
          <Typography color="text.secondary">
            Administración integral del ciclo laboral de la empresa.
          </Typography>
        </Box>
        <Chip
          label="Módulo activo"
          color="success"
          sx={{ alignSelf: "flex-start", fontWeight: 800 }}
        />
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {!overview && !error ? (
        <Stack alignItems="center" p={4}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, borderRadius: 3 }}>
                <Typography color="text.secondary">Colaboradores</Typography>
                <Typography variant="h4" fontWeight={900}>
                  {overview?.employees || 0}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, borderRadius: 3 }}>
                <Typography color="text.secondary">
                  Colaboradores activos
                </Typography>
                <Typography variant="h4" fontWeight={900}>
                  {overview?.active_employees || 0}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, borderRadius: 3 }}>
                <Typography color="text.secondary">
                  Planillas procesadas
                </Typography>
                <Typography variant="h4" fontWeight={900}>
                  {overview?.payrolls || 0}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2, borderRadius: 3 }}>
                <Typography color="text.secondary">
                  Solicitudes pendientes
                </Typography>
                <Typography variant="h4" fontWeight={900}>
                  {overview?.pending_requests || 0}
                </Typography>
              </Card>
            </Grid>
          </Grid>
          <Stack spacing={1.5} mb={3}>
            {Number(overview?.draft_payrolls || 0) > 0 && (
              <Alert
                severity="warning"
                sx={{ position: "static" }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => navigate("/company/personnel/payroll")}
                  >
                    Revisar
                  </Button>
                }
              >
                Hay {overview.draft_payrolls} planilla(s) en borrador pendientes
                de revisión o aprobación.
              </Alert>
            )}
            {Number(overview?.pending_disbursements || 0) > 0 && (
              <Alert
                severity="info"
                sx={{ position: "static" }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => navigate("/company/personnel/payroll")}
                  >
                    Ver planillas
                  </Button>
                }
              >
                Hay {overview.pending_disbursements} planilla(s) aprobadas sin
                desembolso registrado.
              </Alert>
            )}
            {(Number(overview?.missing_identity || 0) > 0 ||
              Number(overview?.missing_inss || 0) > 0) && (
              <Alert
                severity="warning"
                sx={{ position: "static" }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => navigate("/company/personnel/employees")}
                  >
                    Completar
                  </Button>
                }
              >
                Expedientes activos incompletos: {overview.missing_identity || 0}
                sin identificación y {overview.missing_inss || 0} sin número
                INSS.
              </Alert>
            )}
            {(!overview?.inss_configured || !overview?.ir_configured) && (
              <Alert
                severity="error"
                sx={{ position: "static" }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => navigate("/company/personnel/settings")}
                  >
                    Configurar
                  </Button>
                }
              >
                Configuración pendiente:
                {!overview?.inss_configured ? " régimen INSS" : ""}
                {!overview?.inss_configured && !overview?.ir_configured
                  ? " y"
                  : ""}
                {!overview?.ir_configured ? " tabla IR" : ""}.
              </Alert>
            )}
          </Stack>
          <Typography variant="h6" fontWeight={900} mb={2}>
            Secciones del módulo
          </Typography>
          <Grid container spacing={2}>
            {cards.map((card) => (
              <Grid item xs={12} md={6} key={card.title}>
                <Card sx={{ height: "100%", borderRadius: 3 }}>
                  <CardActionArea
                    disabled={!card.active}
                    onClick={() => card.path && navigate(card.path)}
                    sx={{ height: "100%" }}
                  >
                    <CardContent>
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="flex-start"
                      >
                        {card.icon}
                        <Box flex={1}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Typography variant="h6" fontWeight={900}>
                              {card.title}
                            </Typography>
                            {!card.active && (
                              <Chip label="Próximamente" size="small" />
                            )}
                          </Stack>
                          <Typography color="text.secondary">
                            {card.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
}
