import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";

import useAuth from "../../auth/AuthContext";
import {
  getAdminStaff,
  createAdminStaff,
  updateAdminStaff,
  updateAdminStaffStatus,
} from "../../api/admin";

const EMPTY_FORM = { name: "", email: "", password: "", is_super_admin: false, permissions: [] };

export default function AdminStaffPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [permissionKeys, setPermissionKeys] = useState([]);
  const [permissionLabels, setPermissionLabels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminStaff();
      setStaff(data?.staff || []);
      setPermissionKeys(data?.permissionKeys || []);
      setPermissionLabels(data?.permissionLabels || {});
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar los administradores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (person) => {
    setEditingId(person.id);
    setForm({
      name: person.name,
      email: person.email,
      password: "",
      is_super_admin: Boolean(person.is_super_admin),
      permissions: person.permissions || [],
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const togglePermission = (key) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((k) => k !== key)
        : [...prev.permissions, key],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || (!editingId && !form.email.trim())) {
      setError("Nombre y correo son requeridos.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        await updateAdminStaff(editingId, {
          name: form.name,
          is_super_admin: form.is_super_admin,
          permissions: form.permissions,
        });
        setMessage("Administrador actualizado.");
      } else {
        await createAdminStaff(form);
        setMessage("Administrador creado. Se envió un correo para establecer su contraseña.");
      }

      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo guardar el administrador.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (person) => {
    try {
      setError("");
      await updateAdminStaffStatus(person.id, !person.active);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo actualizar el estado.");
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2} flexWrap="wrap" rowGap={2}>
        <Box>
          <Typography variant="h4" fontWeight={900} mb={0.5}>
            Administradores
          </Typography>
          <Typography color="text.secondary">
            Crea cuentas de administrador con acceso total o a secciones específicas.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ borderRadius: 2, fontWeight: 800, textTransform: "none", whiteSpace: "nowrap" }}
        >
          Nuevo administrador
        </Button>
      </Stack>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Paper sx={{ overflow: "auto", borderRadius: 3 }}>
        {loading ? (
          <Stack alignItems="center" p={5}>
            <CircularProgress size={24} />
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Administrador</TableCell>
                <TableCell>Permisos</TableCell>
                <TableCell>Activo</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {staff.map((person) => (
                <TableRow key={person.id} sx={{ opacity: person.active ? 1 : 0.5 }}>
                  <TableCell>
                    <Typography fontWeight={800}>{person.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {person.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {person.is_super_admin ? (
                      <Chip size="small" color="primary" label="Super administrador (todos los permisos)" />
                    ) : person.permissions?.length ? (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {person.permissions.map((key) => (
                          <Chip key={key} size="small" variant="outlined" label={permissionLabels[key] || key} />
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">Sin permisos asignados</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      size="small"
                      checked={Boolean(person.active)}
                      disabled={person.id === user?.id}
                      onChange={() => handleToggleActive(person)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(person)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {!staff.length && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Alert severity="info">Todavía no hay administradores registrados.</Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={900}>{editingId ? "Editar administrador" : "Nuevo administrador"}</DialogTitle>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Correo"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  fullWidth
                  required
                  disabled={Boolean(editingId)}
                  helperText={editingId ? "El correo no se puede cambiar." : ""}
                />
              </Grid>

              {!editingId && (
                <Grid item xs={12}>
                  <TextField
                    label="Contraseña temporal"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    fullWidth
                    required
                    helperText="El administrador podrá cambiarla luego desde 'Olvidé mi contraseña'."
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.is_super_admin}
                      onChange={(e) => setForm({ ...form, is_super_admin: e.target.checked })}
                    />
                  }
                  label="Super administrador (acceso a todo, sin restricciones)"
                />
              </Grid>

              {!form.is_super_admin && (
                <Grid item xs={12}>
                  <Typography fontWeight={700} mb={0.5}>
                    Permisos por sección
                  </Typography>
                  <FormGroup>
                    <Grid container>
                      {permissionKeys.map((key) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={form.permissions.includes(key)}
                                onChange={() => togglePermission(key)}
                              />
                            }
                            label={permissionLabels[key] || key}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </FormGroup>
                </Grid>
              )}
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDialog} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ borderRadius: 2, fontWeight: 800, textTransform: "none" }}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
