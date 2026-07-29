import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
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
  billing_email: "",
  billing_cycle: "MONTHLY",
  amount: "",
  admin_name: "",
  admin_email: "",
  tax_condition: "GRAVADO",
  applies_withholding: false,
  withholding_rate: 2,
  personnel_payroll_enabled: false,
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
        billing_email: company.billing_email || "",
        billing_cycle: company.billing_cycle || "MONTHLY",
        amount: company.amount || "",
        admin_name: "",
        admin_email: "",
        tax_condition: company.tax_condition || "GRAVADO",
        applies_withholding: Boolean(company.applies_withholding),
        withholding_rate: company.withholding_rate ?? 2,
        personnel_payroll_enabled: Boolean(company.personnel_payroll_enabled),
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
    if (!isEdit && !form.admin_email.trim()) return;

    onSave({
      ...form,
      name: form.name.trim(),
      nit: form.nit.trim(),
      website: form.website.trim(),
      location: form.location.trim(),
      logo_url: form.logo_url.trim(),
      description: form.description.trim(),
      admin_name: form.admin_name.trim(),
      admin_email: form.admin_email.trim().toLowerCase(),
      plan_id: form.plan_id ? Number(form.plan_id) : null,
      amount: form.amount === "" ? null : Number(form.amount),
      applies_withholding: Boolean(form.applies_withholding),
      withholding_rate: form.withholding_rate === "" ? 0 : Number(form.withholding_rate),
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

          {!isEdit && <>
            <Grid item xs={12}>
              <Typography fontWeight={900} mt={1}>Administrador principal</Typography>
              <Typography color="text.secondary" fontSize={13}>Se creará su cuenta y recibirá la notificación de registro en este correo.</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Nombre del administrador" value={form.admin_name} onChange={(e) => setValue("admin_name", e.target.value)} fullWidth disabled={loading} placeholder="Nombre completo" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Correo del administrador principal" type="email" value={form.admin_email} onChange={(e) => setValue("admin_email", e.target.value)} fullWidth required disabled={loading} />
            </Grid>
          </>}

          {form.plan_id && <>
            <Grid item xs={12} md={6}>
              <TextField label="Correo de facturación" type="email" value={form.billing_email} onChange={(e) => setValue("billing_email", e.target.value)} fullWidth required disabled={loading} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select label="Período de facturación" value={form.billing_cycle} onChange={(e) => setValue("billing_cycle", e.target.value)} fullWidth disabled={loading}>
                <MenuItem value="MONTHLY">Mensual</MenuItem><MenuItem value="QUARTERLY">Trimestral</MenuItem><MenuItem value="SEMIANNUAL">Semestral</MenuItem><MenuItem value="YEARLY">Anual</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label={isEdit ? "Monto del cobro (USD)" : "Monto del primer cobro (USD)"} type="number" value={form.amount} onChange={(e) => setValue("amount", e.target.value)} fullWidth disabled={loading} helperText="Déjalo vacío para usar el precio del plan." inputProps={{ min: 0, step: "0.01" }} />
            </Grid>
          </>}

          <Grid item xs={12}>
            <Typography fontWeight={900} mt={1}>Datos fiscales</Typography>
            <Typography color="text.secondary" fontSize={13}>
              Determina si se le cobra IVA (15%) en sus facturas y si aplica retención de impuestos sobre los pagos.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Condición fiscal"
              value={form.tax_condition}
              onChange={(e) => setValue("tax_condition", e.target.value)}
              fullWidth
              disabled={loading}
            >
              <MenuItem value="GRAVADO">Gravado (paga IVA 15%)</MenuItem>
              <MenuItem value="EXENTO">Exento (no paga IVA)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: "flex", alignItems: "center" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.applies_withholding}
                  onChange={(e) => setValue("applies_withholding", e.target.checked)}
                  disabled={loading}
                />
              }
              label="Aplica retención"
            />
          </Grid>

          {form.applies_withholding && (
            <Grid item xs={12} md={4}>
              <TextField
                label="% Retención"
                type="number"
                value={form.withholding_rate}
                onChange={(e) => setValue("withholding_rate", e.target.value)}
                fullWidth
                disabled={loading}
                inputProps={{ min: 0, max: 100, step: "0.1" }}
                helperText="Usualmente 2%"
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography fontWeight={900} mt={1}>Módulos adicionales</Typography>
            <Typography color="text.secondary" fontSize={13}>Controla las funcionalidades independientes disponibles para esta empresa.</Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={form.personnel_payroll_enabled} onChange={(e) => setValue("personnel_payroll_enabled", e.target.checked)} disabled={loading} />}
              label="Activar módulo de Administración de personal y planilla"
            />
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
          disabled={loading || !form.name.trim() || (!isEdit && !form.admin_email.trim())}
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
