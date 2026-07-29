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
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import {
  getCandidateExperiences,
  createCandidateExperience,
  updateCandidateExperience,
  deleteCandidateExperience,
} from "../../../../api/candidate";

const EMPTY_FORM = {
  company_name: "",
  position: "",
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

export default function CandidateExperienceTab() {
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
      const rows = await getCandidateExperiences();
      setItems(rows);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cargar tu experiencia.");
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
      company_name: item.company_name || "",
      position: item.position || "",
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

    if (!form.company_name.trim() || !form.position.trim()) {
      setError("Empresa y cargo son requeridos.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        await updateCandidateExperience(editingId, form);
        setMessage("Experiencia actualizada.");
      } else {
        await createCandidateExperience(form);
        setMessage("Experiencia agregada.");
      }

      setDialogOpen(false);
      await loadItems();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo guardar la experiencia.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("¿Eliminar esta experiencia laboral?");
    if (!confirmed) return;

    try {
      setError("");
      setMessage("");
      await deleteCandidateExperience(id);
      setMessage("Experiencia eliminada.");
      await loadItems();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo eliminar la experiencia.");
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
            Experiencia laboral
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Agrega los trabajos que has tenido, empezando por el más reciente.
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
          Aún no has agregado experiencia laboral.
        </Alert>
      )}

      <Stack spacing={2}>
        {items.map((item) => (
          <Paper key={item.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
                <BusinessCenterIcon color="primary" sx={{ mt: 0.3 }} />

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={800}>{item.position}</Typography>
                  <Typography color="text.secondary">{item.company_name}</Typography>

                  <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {formatRange(item)}
                    </Typography>
                    {Boolean(item.is_current) && (
                      <Chip size="small" color="success" label="Actual" sx={{ fontWeight: 700 }} />
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
          {editingId ? "Editar experiencia" : "Agregar experiencia"}
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Cargo"
                  value={form.position}
                  onChange={(e) => setValue("position", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Empresa"
                  value={form.company_name}
                  onChange={(e) => setValue("company_name", e.target.value)}
                  fullWidth
                  required
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
                  label="Trabajo actualmente aquí"
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
