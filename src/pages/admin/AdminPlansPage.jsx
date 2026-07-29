import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import {
  getAdminPlansAll,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan,
} from "../../api/admin";

const EMPTY_FORM = {
  code: "",
  name: "",
  description: "",
  price: 0,
  billing_cycle: "MONTHLY",
  max_jobs: 1,
  max_users: 1,
  can_post_jobs: true,
  can_view_candidate_contact: false,
  active: true,
};

const money = (value) =>
  new Intl.NumberFormat("es-NI", { style: "currency", currency: "USD" }).format(Number(value || 0));

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
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
      const data = await getAdminPlansAll();
      setPlans(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar los planes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (plan) => {
    setEditingId(plan.id);
    setForm({
      code: plan.code,
      name: plan.name,
      description: plan.description || "",
      price: plan.price,
      billing_cycle: plan.billing_cycle,
      max_jobs: plan.max_jobs,
      max_users: plan.max_users,
      can_post_jobs: Boolean(plan.can_post_jobs),
      can_view_candidate_contact: Boolean(plan.can_view_candidate_contact),
      active: Boolean(plan.active),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const setValue = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || (!editingId && !form.code.trim())) {
      setError("Nombre y código son requeridos.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        await updateAdminPlan(editingId, form);
        setMessage("Plan actualizado.");
      } else {
        await createAdminPlan(form);
        setMessage("Plan creado.");
      }

      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo guardar el plan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`¿Eliminar el plan "${plan.name}"? Si tiene empresas suscritas, solo se desactivará.`)) return;

    try {
      setError("");
      setMessage("");
      const result = await deleteAdminPlan(plan.id);
      setMessage(result?.message || "Plan eliminado.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo eliminar el plan.");
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      setError("");
      await updateAdminPlan(plan.id, {
        name: plan.name,
        description: plan.description,
        price: plan.price,
        billing_cycle: plan.billing_cycle,
        max_jobs: plan.max_jobs,
        max_users: plan.max_users,
        can_post_jobs: Boolean(plan.can_post_jobs),
        can_view_candidate_contact: Boolean(plan.can_view_candidate_contact),
        active: !plan.active,
      });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo actualizar el plan.");
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={900} mb={0.5}>
            Planes
          </Typography>
          <Typography color="text.secondary">
            Define qué incluye cada plan: precio, límite de vacantes, de usuarios y si permite ver el contacto de los candidatos.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{ borderRadius: 2, fontWeight: 800, textTransform: "none", whiteSpace: "nowrap" }}
        >
          Nuevo plan
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
                <TableCell>Plan</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Vacantes</TableCell>
                <TableCell>Usuarios</TableCell>
                <TableCell>Publicar vacantes</TableCell>
                <TableCell>Ver contacto candidato</TableCell>
                <TableCell>Activo</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id} sx={{ opacity: plan.active ? 1 : 0.5 }}>
                  <TableCell>
                    <Typography fontWeight={800}>{plan.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {plan.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {money(plan.price)} / {plan.billing_cycle === "YEARLY" ? "año" : "mes"}
                  </TableCell>
                  <TableCell>{Number(plan.max_jobs) > 0 ? plan.max_jobs : "Ilimitadas"}</TableCell>
                  <TableCell>{Number(plan.max_users) > 0 ? plan.max_users : "Ilimitados"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={plan.can_post_jobs ? "Sí" : "No"}
                      color={plan.can_post_jobs ? "success" : "default"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={plan.can_view_candidate_contact ? "Sí" : "No"}
                      color={plan.can_view_candidate_contact ? "success" : "default"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch size="small" checked={Boolean(plan.active)} onChange={() => handleToggleActive(plan)} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEditDialog(plan)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(plan)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {!plans.length && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Alert severity="info">Todavía no hay planes creados.</Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={900}>{editingId ? "Editar plan" : "Nuevo plan"}</DialogTitle>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} mt={0}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Código"
                  value={form.code}
                  onChange={(e) => setValue("code", e.target.value)}
                  fullWidth
                  required
                  disabled={Boolean(editingId)}
                  helperText={editingId ? "El código no se puede cambiar." : "Ej: PRO, ENTERPRISE"}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre"
                  value={form.name}
                  onChange={(e) => setValue("name", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Descripción"
                  value={form.description}
                  onChange={(e) => setValue("description", e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Precio"
                  type="number"
                  value={form.price}
                  onChange={(e) => setValue("price", e.target.value)}
                  fullWidth
                  inputProps={{ min: 0, step: "0.01" }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Ciclo de facturación"
                  value={form.billing_cycle}
                  onChange={(e) => setValue("billing_cycle", e.target.value)}
                  fullWidth
                >
                  <MenuItem value="MONTHLY">Mensual</MenuItem>
                  <MenuItem value="YEARLY">Anual</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Máximo de vacantes activas"
                  type="number"
                  value={form.max_jobs}
                  onChange={(e) => setValue("max_jobs", e.target.value)}
                  fullWidth
                  helperText="0 = ilimitadas"
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Máximo de usuarios"
                  type="number"
                  value={form.max_users}
                  onChange={(e) => setValue("max_users", e.target.value)}
                  fullWidth
                  helperText="0 = ilimitados"
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.can_post_jobs}
                      onChange={(e) => setValue("can_post_jobs", e.target.checked)}
                    />
                  }
                  label="Permite publicar vacantes"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.can_view_candidate_contact}
                      onChange={(e) => setValue("can_view_candidate_contact", e.target.checked)}
                    />
                  }
                  label="Permite ver contacto del candidato"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch checked={form.active} onChange={(e) => setValue("active", e.target.checked)} />
                  }
                  label="Plan activo (visible para asignar a empresas)"
                />
              </Grid>
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
