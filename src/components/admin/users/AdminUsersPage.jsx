import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import PersonAddIcon from "@mui/icons-material/PersonAdd";

import {
  getAdminCompanies,
  getAdminCompanyUsers,
  createAdminCompanyUser,
  updateAdminCompanyUser,
} from "../../../api/admin";

import CompanyUserFormDialog from "../../../components/admin/CompanyUserFormDialog";

export default function AdminUsersPage() {
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (companyId) {
      loadUsers(companyId);
    } else {
      setUsers([]);
    }
  }, [companyId]);

  const loadCompanies = async () => {
    try {
      setCompaniesLoading(true);
      setError("");

      const data = await getAdminCompanies();
      const rows = Array.isArray(data) ? data : [];

      setCompanies(rows);

      if (rows.length > 0) {
        setCompanyId(rows[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las empresas.");
    } finally {
      setCompaniesLoading(false);
    }
  };

  const loadUsers = async (selectedCompanyId = companyId) => {
    if (!selectedCompanyId) return;

    try {
      setLoading(true);
      setError("");

      const data = await getAdminCompanyUsers(selectedCompanyId);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleSaveUser = async (payload) => {
    try {
      setSaving(true);
      setError("");

      if (editingUser?.id) {
        await updateAdminCompanyUser(editingUser.id, payload);
      } else {
        await createAdminCompanyUser(companyId, payload);
      }

      setFormOpen(false);
      setEditingUser(null);
      await loadUsers(companyId);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "No se pudo guardar el usuario."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={1.5}
        mb={1.5}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            Usuarios de empresas
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            Administra usuarios internos por empresa.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <TextField
            select
            size="small"
            label="Empresa"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            disabled={companiesLoading}
            sx={{ minWidth: { xs: "100%", md: 280 } }}
          >
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleCreateUser}
            disabled={!companyId || saving}
            sx={{ textTransform: "none", fontWeight: 900, borderRadius: 2 }}
          >
            Agregar usuario
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 1.5, borderRadius: 3 }}>
        {loading || companiesLoading ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress size={26} />
            <Typography fontSize={13} color="text.secondary" mt={1}>
              Cargando usuarios...
            </Typography>
          </Stack>
        ) : users.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography fontWeight={900}>No hay usuarios registrados</Typography>
            <Typography fontSize={13} color="text.secondary">
              Agrega el primer usuario para esta empresa.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0.75}>
            {users.map((u) => (
              <Paper
                key={u.id}
                variant="outlined"
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f8fbff" },
                }}
                onClick={() => handleEditUser(u)}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1}
                >
                  <Box>
                    <Typography fontWeight={900}>
                      {u.name || "Usuario sin nombre"}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      {u.email}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0.75}>
                    <Chip
                      size="small"
                      label={getRoleLabel(u.role)}
                      color={u.role === "COMPANY_ADMIN" ? "primary" : "default"}
                      sx={{ fontWeight: 800 }}
                    />

                    <Chip
                      size="small"
                      label={Number(u.active) === 1 ? "Activo" : "Inactivo"}
                      color={Number(u.active) === 1 ? "success" : "default"}
                      sx={{ fontWeight: 800 }}
                    />
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      <CompanyUserFormDialog
        open={formOpen}
        user={editingUser}
        loading={saving}
        onClose={() => {
          if (!saving) {
            setFormOpen(false);
            setEditingUser(null);
          }
        }}
        onSave={handleSaveUser}
      />
    </Box>
  );
}

function getRoleLabel(role) {
  if (role === "COMPANY_ADMIN") return "Admin empresa";
  if (role === "COMPANY_USER") return "Reclutador";
  if (role === "COMPANY") return "Empresa";
  return role || "N/D";
}