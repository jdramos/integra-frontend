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
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import {
  getCatalogCategories,
  getCatalogItems,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
} from "../../api/catalogs";

const CATEGORY_LABELS = {
  nicaragua_departments: "Ubicación (departamentos de Nicaragua)",
  skills: "Habilidades",
  languages: "Idiomas",
  professional_areas: "Áreas profesionales",
  education_levels: "Niveles educativos (candidato)",
  experience_levels: "Niveles de experiencia (candidato)",
  availability_options: "Disponibilidad",
  job_types_candidate: "Tipo de jornada (candidato)",
  work_modes_candidate: "Modalidad preferida (candidato)",
  license_types: "Tipos de licencia",
  profile_status: "Estado del perfil",
  job_modality: "Modalidad de vacante",
  job_types_posting: "Tipo de empleo (vacante)",
  experience_levels_posting: "Nivel de experiencia (vacante)",
  job_status: "Estado de vacante",
  application_status: "Estado de postulación",
};

const EMPTY_FORM = { value: "", label: "", sort_order: 0, active: true };

export default function AdminCatalogsPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [items, setItems] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await getCatalogCategories();
      setCategories(data);
      if (!selectedCategory && data.length) {
        setSelectedCategory(data[0].category);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar las categorías.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadItems = async (category) => {
    if (!category) return;

    try {
      setLoadingItems(true);
      setError("");
      const data = await getCatalogItems(category);
      setItems(data);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar los ítems.");
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) loadItems(selectedCategory);
  }, [selectedCategory]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, sort_order: items.length });
    setDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingId(item.id);
    setForm({
      value: item.value,
      label: item.label,
      sort_order: item.sort_order,
      active: Boolean(item.active),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.value.trim() || !form.label.trim()) {
      setError("Valor y etiqueta son requeridos.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        await updateCatalogItem(editingId, form);
        setMessage("Ítem actualizado.");
      } else {
        await createCatalogItem(selectedCategory, form);
        setMessage("Ítem agregado.");
      }

      setDialogOpen(false);
      await loadItems(selectedCategory);
      await loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo guardar el ítem.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmMessage = item.is_system
      ? `"${item.label}" es un valor original del sistema. Si lo eliminas y ya está en uso en registros existentes, esos registros quedarán con un valor huérfano. ¿Eliminar de todas formas?`
      : `¿Eliminar "${item.label}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setError("");
      setMessage("");
      await deleteCatalogItem(item.id);
      setMessage("Ítem eliminado.");
      await loadItems(selectedCategory);
      await loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo eliminar el ítem.");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      setError("");
      await updateCatalogItem(item.id, {
        value: item.value,
        label: item.label,
        sort_order: item.sort_order,
        active: !item.active,
      });
      await loadItems(selectedCategory);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo actualizar el ítem.");
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={900} mb={0.5}>
        Catálogos
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Gestiona las listas de opciones que aparecen en los formularios de candidatos y empresas.
      </Typography>

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

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
            {loadingCategories ? (
              <Stack alignItems="center" py={4}>
                <CircularProgress size={24} />
              </Stack>
            ) : (
              <List dense disablePadding>
                {categories.map((cat) => (
                  <ListItemButton
                    key={cat.category}
                    selected={cat.category === selectedCategory}
                    onClick={() => setSelectedCategory(cat.category)}
                  >
                    <ListItemText
                      primary={CATEGORY_LABELS[cat.category] || cat.category}
                      secondary={`${cat.active_total} activos de ${cat.total}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={800}>
                {CATEGORY_LABELS[selectedCategory] || selectedCategory || "Selecciona una categoría"}
              </Typography>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateDialog}
                disabled={!selectedCategory}
                sx={{ borderRadius: 2, fontWeight: 800, textTransform: "none" }}
              >
                Agregar
              </Button>
            </Stack>

            {loadingItems ? (
              <Stack alignItems="center" py={4}>
                <CircularProgress size={24} />
              </Stack>
            ) : (
              <Stack spacing={1}>
                {items.map((item) => (
                  <Paper
                    key={item.id}
                    variant="outlined"
                    sx={{ p: 1.5, borderRadius: 2, opacity: item.active ? 1 : 0.5 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box flex={1} minWidth={0}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Typography fontWeight={700}>{item.label}</Typography>
                          {item.value !== item.label && (
                            <Typography variant="caption" color="text.secondary">
                              ({item.value})
                            </Typography>
                          )}
                          {Boolean(item.is_system) && (
                            <Chip size="small" label="Sistema" variant="outlined" />
                          )}
                        </Stack>
                      </Box>

                      <Switch
                        size="small"
                        checked={Boolean(item.active)}
                        onChange={() => handleToggleActive(item)}
                        title="Activo / inactivo"
                      />

                      <IconButton size="small" onClick={() => openEditDialog(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>

                      <IconButton size="small" color="error" onClick={() => handleDelete(item)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}

                {!items.length && (
                  <Alert severity="info">Esta categoría no tiene ítems todavía.</Alert>
                )}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={900}>
          {editingId ? "Editar ítem" : "Agregar ítem"}
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Etiqueta (lo que ve el usuario)"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                fullWidth
                required
              />

              <TextField
                label="Valor interno"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                fullWidth
                required
                helperText="El código que se guarda en la base de datos. Cámbialo con cuidado si ya está en uso."
              />

              <TextField
                label="Orden"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                fullWidth
              />
            </Stack>
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
