import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import {
  getCandidateCertificates,
  createCandidateCertificate,
  updateCandidateCertificate,
  deleteCandidateCertificate,
} from "../../../../api/candidate";

const EMPTY_FORM = {
  name: "",
  issuer: "",
  issue_date: "",
  expiration_date: "",
  credential_url: "",
};

function formatDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function formatMonthYear(value) {
  return value ? String(value).slice(0, 7) : "";
}

export default function CandidateCertificatesTab() {
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
      const rows = await getCandidateCertificates();
      setItems(rows);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar tus certificaciones.");
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
      name: item.name || "",
      issuer: item.issuer || "",
      issue_date: formatDate(item.issue_date),
      expiration_date: formatDate(item.expiration_date),
      credential_url: item.credential_url || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("El nombre de la certificación es requerido.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        await updateCandidateCertificate(editingId, form);
        setMessage("Certificación actualizada.");
      } else {
        await createCandidateCertificate(form);
        setMessage("Certificación agregada.");
      }

      setDialogOpen(false);
      await loadItems();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo guardar la certificación.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("¿Eliminar esta certificación?");
    if (!confirmed) return;

    try {
      setError("");
      setMessage("");
      await deleteCandidateCertificate(id);
      setMessage("Certificación eliminada.");
      await loadItems();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo eliminar la certificación.");
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
            Certificaciones
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Agrega cursos y certificaciones que respalden tu perfil.
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
          Aún no has agregado certificaciones.
        </Alert>
      )}

      <Stack spacing={2}>
        {items.map((item) => (
          <Paper key={item.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
                <WorkspacePremiumIcon color="primary" sx={{ mt: 0.3 }} />

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={800}>{item.name}</Typography>
                  {item.issuer && (
                    <Typography color="text.secondary">{item.issuer}</Typography>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    {item.issue_date && `Emitido: ${formatMonthYear(item.issue_date)}`}
                    {item.expiration_date && ` · Vence: ${formatMonthYear(item.expiration_date)}`}
                  </Typography>

                  {item.credential_url && (
                    <Box mt={0.5}>
                      <Link
                        href={item.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontWeight: 700 }}
                      >
                        Ver credencial <OpenInNewIcon sx={{ fontSize: 14 }} />
                      </Link>
                    </Box>
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
          {editingId ? "Editar certificación" : "Agregar certificación"}
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre de la certificación"
                  value={form.name}
                  onChange={(e) => setValue("name", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Emitido por"
                  placeholder="Ej: AWS, Microsoft, Universidad..."
                  value={form.issuer}
                  onChange={(e) => setValue("issuer", e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Fecha de emisión"
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => setValue("issue_date", e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Fecha de vencimiento"
                  type="date"
                  value={form.expiration_date}
                  onChange={(e) => setValue("expiration_date", e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="URL de la credencial"
                  placeholder="https://..."
                  value={form.credential_url}
                  onChange={(e) => setValue("credential_url", e.target.value)}
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
