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
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SchoolIcon from "@mui/icons-material/School";

import {
  getCandidateEducation,
  createCandidateEducation,
  updateCandidateEducation,
  deleteCandidateEducation,
} from "../../../../api/candidate";

const EMPTY_FORM = {
  institution: "",
  degree: "",
  field_of_study: "",
  start_date: "",
  end_date: "",
  is_current: false,
  description: "",
};

function formatDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function formatRange(item) {
  const start = item.start_date ? String(item.start_date).slice(0, 7) : "?";
  const end = item.is_current ? "Actualidad" : item.end_date ? String(item.end_date).slice(0, 7) : "?";
  return `${start} — ${end}`;
}

export default function CandidateEducationTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");
      const rows = await getCandidateEducation();
      setItems(rows);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cargar tu educación.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const setValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingId(item.id);
    setForm({
      institution: item.institution || "",
      degree: item.degree || "",
      field_of_study: item.field_of_study || "",
      start_date: formatDate(item.start_date),
      end_date: formatDate(item.end_date),
      is_current: Boolean(item.is_current),
      description: item.description || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.institution.trim() || !form.degree.trim()) {
      setError("Institución y título son requeridos.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        await updateCandidateEducation(editingId, form);
        setMessage("Educación actualizada.");
      } else {
        await createCandidateEducation(form);
        setMessage("Educación agregada.");
      }

      setDialogOpen(false);
      await loadItems();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo guardar la educación.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("¿Eliminar esta formación académica?");
    if (!confirmed) return;

    try {
      setError("");
      setMessage("");
      await deleteCandidateEducation(id);
      setMessage("Educación eliminada.");
      await loadItems();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo eliminar la educación.");
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" fontWeight={900}>
            Educación
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Agrega tu formación académica, empezando por la más reciente.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{ borderRadius: 3, fontWeight: 800, textTransform: "none" }}
        >
          Agregar
        </Button>
      </Stack>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {!items.length && (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Aún no has agregado formación académica.
        </Alert>
      )}

      <Stack spacing={2}>
        {items.map((item) => (
          <Paper key={item.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
                <SchoolIcon color="primary" sx={{ mt: 0.3 }} />

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={800}>{item.degree}</Typography>
                  <Typography color="text.secondary">{item.institution}</Typography>
                  {item.field_of_study && (
                    <Typography variant="body2" color="text.secondary">
                      {item.field_of_study}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {formatRange(item)}
                    </Typography>
                    {Boolean(item.is_current) && (
                      <Chip size="small" color="success" label="En curso" sx={{ fontWeight: 700 }} />
                    )}
                  </Stack>

                  {item.description && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {item.description}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Stack direction="row">
                <IconButton size="small" onClick={() => openEditDialog(item)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={900}>
          {editingId ? "Editar educación" : "Agregar educación"}
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Título / grado"
                  placeholder="Ej: Ingeniería en Sistemas"
                  value={form.degree}
                  onChange={(e) => setValue("degree", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Institución"
                  value={form.institution}
                  onChange={(e) => setValue("institution", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Área de estudio"
                  placeholder="Ej: Ciencias de la computación"
                  value={form.field_of_study}
                  onChange={(e) => setValue("field_of_study", e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Fecha de inicio"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setValue("start_date", e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Fecha de fin"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setValue("end_date", e.target.value)}
                  fullWidth
                  disabled={form.is_current}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.is_current}
                      onChange={(e) => setValue("is_current", e.target.checked)}
                    />
                  }
                  label="Estudio actualmente aquí"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Descripción"
                  multiline
                  minRows={3}
                  value={form.description}
                  onChange={(e) => setValue("description", e.target.value)}
                  fullWidth
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
    </Stack>
  );
}
