import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ApartmentIcon from "@mui/icons-material/Apartment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export default function CompaniesTable({
  companies = [],
  loading = false,
  actionLoading = false,
  onViewCompany,
  onChangeStatus,
  onCreateCompany,
  onEditCompany,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");

  const plans = useMemo(
    () => [...new Set(companies.map((c) => c.plan_name).filter(Boolean))],
    [companies]
  );

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase();

    return companies.filter((company) => {
      const matchSearch =
        !term ||
        company.name?.toLowerCase().includes(term) ||
        company.location?.toLowerCase().includes(term) ||
        company.plan_name?.toLowerCase().includes(term) ||
        company.status?.toLowerCase().includes(term);

      const matchStatus = !statusFilter || company.status === statusFilter;
      const matchPlan = !planFilter || company.plan_name === planFilter;

      return matchSearch && matchStatus && matchPlan;
    });
  }, [companies, search, statusFilter, planFilter]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 3,
        border: "1px solid #e5eaf2",
        bgcolor: "white",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={1.25}
        mb={1.5}
      >
        <Box>
          <Typography variant="h6" fontWeight={900} lineHeight={1.1}>
            Empresas registradas
          </Typography>
          <Typography color="text.secondary" fontSize={13}>
            {filteredCompanies.length} empresa(s) encontradas
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            size="small"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: "100%", md: 220 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            size="small"
            label="Estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: { xs: "100%", md: 135 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="ACTIVE">Activas</MenuItem>
            <MenuItem value="PENDING">Pendientes</MenuItem>
            <MenuItem value="SUSPENDED">Suspendidas</MenuItem>
            <MenuItem value="INACTIVE">Inactivas</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Plan"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            sx={{ width: { xs: "100%", md: 145 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            {plans.map((plan) => (
              <MenuItem key={plan} value={plan}>
                {plan}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            size="medium"
            startIcon={<AddBusinessIcon />}
            onClick={onCreateCompany}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 900,
              whiteSpace: "nowrap",
              minHeight: 40,
              px: 1.75,
            }}
          >
            Nueva
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Stack alignItems="center" py={3}>
          <CircularProgress size={26} />
          <Typography color="text.secondary" mt={1} fontSize={13}>
            Cargando empresas...
          </Typography>
        </Stack>
      ) : filteredCompanies.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 3,
            textAlign: "center",
            bgcolor: "#fafcff",
          }}
        >
          <ApartmentIcon sx={{ fontSize: 36, color: "text.secondary" }} />
          <Typography fontWeight={900} mt={0.5}>
            No hay empresas para mostrar
          </Typography>
          <Typography color="text.secondary" fontSize={13}>
            Intenta cambiar los filtros de búsqueda.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            borderRadius: 2.5,
            overflow: "hidden",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f6f8fc" }}>
                <TableCell sx={{ fontWeight: 900 }}>Empresa</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Ubicación</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Estado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        src={company.logo_url || ""}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "primary.main",
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        {company.name?.charAt(0) || "E"}
                      </Avatar>

                      <Box>
                        <Typography fontWeight={900} fontSize={14}>
                          {company.name || "Empresa sin nombre"}
                        </Typography>
                        <Typography fontSize={12} color="text.secondary">
                          NIT {company.nit}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ fontSize: 13 }}>
                    {company.location || "Sin ubicación"}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={company.plan_name || "Sin plan"}
                      size="small"
                      color={company.plan_name ? "primary" : "default"}
                      variant={company.plan_name ? "filled" : "outlined"}
                      sx={{ fontWeight: 800, height: 22 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={getStatusLabel(company.status)}
                      size="small"
                      color={getStatusColor(company.status)}
                      sx={{ fontWeight: 800, height: 22 }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                      <Tooltip title="Ver detalle">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onViewCompany(company.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {company.status === "ACTIVE" ? (
                        <Tooltip title="Suspender empresa">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={actionLoading}
                              onClick={() =>
                                onChangeStatus(company.id, "SUSPENDED")
                              }
                            >
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Activar empresa">
                          <span>
                            <IconButton
                              size="small"
                              color="success"
                              disabled={actionLoading}
                              onClick={() =>
                                onChangeStatus(company.id, "ACTIVE")
                              }
                            >
                              <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}

                      <Tooltip title="Editar empresa">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => onEditCompany(company)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

export function getStatusLabel(status) {
  const value = String(status || "").toUpperCase();

  if (value === "ACTIVE") return "Activa";
  if (value === "PENDING") return "Pendiente";
  if (value === "SUSPENDED") return "Suspendida";
  if (value === "INACTIVE") return "Inactiva";

  return status || "N/D";
}

export function getStatusColor(status) {
  const value = String(status || "").toUpperCase();

  if (value === "ACTIVE") return "success";
  if (value === "PENDING") return "warning";
  if (value === "SUSPENDED") return "error";
  if (value === "INACTIVE") return "default";

  return "primary";
}