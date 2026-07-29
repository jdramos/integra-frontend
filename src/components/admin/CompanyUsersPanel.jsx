import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import {
  getAdminCompanyUsers,
  createAdminCompanyUser,
  updateAdminCompanyUser,
  updateAdminCompanyUserStatus,
} from "../../api/admin";

import CompanyUserFormDialog from "./CompanyUserFormDialog";

export default function CompanyUsersPanel({ companyId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError("");

      const data = await getAdminCompanyUsers(companyId);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los usuarios de la empresa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [companyId]);

  const handleCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleSave = async (payload) => {
    try {
      setActionLoading(true);

      if (editingUser?.id) {
        await updateAdminCompanyUser(editingUser.id, payload);
      } else {
        await createAdminCompanyUser(companyId, payload);
      }

      setFormOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "No se pudo guardar el usuario.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = async (user) => {
    try {
      setActionLoading(true);
      await updateAdminCompanyUserStatus(user.id, Number(user.active) === 1 ? 0 : 1);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("No se pudo cambiar el estado del usuario.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 3,
        bgcolor: "#fbfcff",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1.5}
      >
        <Box>
          <Typography fontWeight={900}>Usuarios de la empresa</Typography>
          <Typography fontSize={13} color="text.secondary">
            {users.length} usuario(s) registrado(s)
          </Typography>
        </Box>

        <Button
          size="small"
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleCreate}
          disabled={actionLoading}
          sx={{ textTransform: "none", fontWeight: 900, borderRadius: 2 }}
        >
          Usuario
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack alignItems="center" py={3}>
          <CircularProgress size={24} />
          <Typography fontSize={13} color="text.secondary" mt={1}>
            Cargando usuarios...
          </Typography>
        </Stack>
      ) : users.length === 0 ? (
        <Box
          sx={{
            py: 3,
            textAlign: "center",
            border: "1px dashed #ccd6e3",
            borderRadius: 2,
          }}
        >
          <Typography fontWeight={800}>No hay usuarios</Typography>
          <Typography fontSize={13} color="text.secondary">
            Agrega el primer usuario de esta empresa.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={0.75}>
          {users.map((user) => (
            <Paper
              key={user.id}
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 2,
                border: "1px solid #edf1f7",
                bgcolor: "white",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
              >
                <Box>
                  <Typography fontWeight={900} fontSize={14}>
                    {user.name || "Usuario sin nombre"}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Chip
                    size="small"
                    label={getRoleLabel(user.role)}
                    color={user.role === "COMPANY_ADMIN" ? "primary" : "default"}
                    variant={user.role === "COMPANY_ADMIN" ? "filled" : "outlined"}
                    sx={{ fontWeight: 800, height: 22 }}
                  />

                  <Chip
                    size="small"
                    label={Number(user.active) === 1 ? "Activo" : "Inactivo"}
                    color={Number(user.active) === 1 ? "success" : "default"}
                    sx={{ fontWeight: 800, height: 22 }}
                  />

                  <Tooltip title="Editar usuario">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleEdit(user)}
                      disabled={actionLoading}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={Number(user.active) === 1 ? "Inactivar" : "Activar"}>
                    <IconButton
                      size="small"
                      color={Number(user.active) === 1 ? "error" : "success"}
                      onClick={() => handleChangeStatus(user)}
                      disabled={actionLoading}
                    >
                      {Number(user.active) === 1 ? (
                        <BlockIcon fontSize="small" />
                      ) : (
                        <CheckCircleOutlineIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <CompanyUserFormDialog
        open={formOpen}
        user={editingUser}
        loading={actionLoading}
        onClose={() => {
          if (!actionLoading) {
            setFormOpen(false);
            setEditingUser(null);
          }
        }}
        onSave={handleSave}
      />
    </Paper>
  );
}

function getRoleLabel(role) {
  if (role === "COMPANY_ADMIN") return "Admin empresa";
  if (role === "COMPANY_USER") return "Reclutador";
  if (role === "COMPANY") return "Empresa";
  return role || "N/D";
}