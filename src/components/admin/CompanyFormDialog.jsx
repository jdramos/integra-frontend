import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { getAdminPlans } from "../../api/admin";

const initialForm = {
  name: "",
  description: "",
  nit: "",
  website: "",
  location: "",
  logo_url: "",
  status: "ACTIVE",
  plan_id: "",
};

export default function CompanyFormDialog({
  open,
  company,
  loading,
  onClose,
  onSave,
}) {
  const isEdit = Boolean(company?.id);

  const [form, setForm] = useState(initialForm);
  const [plans, setPlans] = useState([]);
  const [plansError, setPlansError] = useState("");

  useEffect(() => {
    if (!open) return;

    const loadPlans = async () => {
      try {
        setPlansError("");
        const data = await getAdminPlans();
        setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setPlansError("No se pudieron cargar los planes.");
      }
    };

    loadPlans();
  }, [open]);

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || "",
        description: company.description || "",
        nit: company.nit || "",
        website: company.website || "",
        location: company.location || "",
        logo_url: company.logo_url || "",
        status: company.status || "ACTIVE",
        plan_id: company.plan_id || "",
      });
    } else {
      setForm(initialForm);
    }
  }, [company, open]);

  const setValue = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;

    onSave({
      ...form,
      name: form.name.trim(),
      nit: form.nit.trim(),
      website: form.website.trim(),
      location: form.location.trim(),
      logo_url: form.logo_url.trim(),
      description: form.description.trim(),
      plan_id: form.plan_id ? Number(form.plan_id) : null,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ fontWeight: 900 }}>
        {isEdit ? "Editar empresa" : "Nueva empresa"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1} mb={3}>
          <Typography fontWeight={900}>Información general</Typography>
          <Typography color="text.secondary">
            Completa los datos principales de la empresa.
          </Typography>
        </Stack>

        {plansError && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            {plansError}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              label="Nombre de la empresa"
              value={form.name}
              onChange={(e) => setValue("name", e.target.value)}
              fullWidth
              required
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Estado"
              value={form.status}
              onChange={(e) => setValue("status", e.target.value)}
              fullWidth
              disabled={loading}
            >
              <MenuItem value="ACTIVE">Activa</MenuItem>
              <MenuItem value="PENDING">Pendiente</MenuItem>
              <MenuItem value="SUSPENDED">Suspendida</MenuItem>
              <MenuItem value="INACTIVE">Inactiva</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="NIT"
              value={form.nit}
              onChange={(e) => setValue("nit", e.target.value)}
              fullWidth
              disabled={loading}
              placeholder="Número RUC / NIT"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Sitio web"
              value={form.website}
              onChange={(e) => setValue("website", e.target.value)}
              fullWidth
              disabled={loading}
              placeholder="https://empresa.com"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Plan"
              value={form.plan_id}
              onChange={(e) => setValue("plan_id", e.target.value)}
              fullWidth
              disabled={loading}
            >
              <MenuItem value="">Sin plan</MenuItem>

              {plans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name} - {plan.billing_cycle}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Dirección"
              value={form.location}
              onChange={(e) => setValue("location", e.target.value)}
              fullWidth
              disabled={loading}
              placeholder="Managua, Nicaragua"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Logo URL"
              value={form.logo_url}
              onChange={(e) => setValue("logo_url", e.target.value)}
              fullWidth
              disabled={loading}
              placeholder="https://..."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Descripción"
              value={form.description}
              onChange={(e) => setValue("description", e.target.value)}
              fullWidth
              multiline
              minRows={4}
              disabled={loading}
              placeholder="Describe brevemente la empresa..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ textTransform: "none", fontWeight: 800 }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !form.name.trim()}
          sx={{ textTransform: "none", fontWeight: 900, borderRadius: 3 }}
        >
          {loading
            ? "Guardando..."
            : isEdit
              ? "Guardar cambios"
              : "Crear empresa"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}