import React from "react";
import { Button, Grid, Stack, TextField, Typography, Chip } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import Alert from "@mui/material/Alert";
import { updateMyCompany } from "../../api/company";

const primary = "#0057B8";

export default function CompanyProfileTab({ company, setCompany }) {
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState(null);

  const setValue = (field, value) => {
    setCompany((prev) => ({ ...prev, [field]: value }));
  };

  const saveCompany = async () => {
    try {
      setSaving(true);
      setFeedback(null);
      await updateMyCompany(company);
      setFeedback({ severity: "success", message: "Perfil de empresa actualizado correctamente." });
    } catch (error) {
      setFeedback({ severity: "error", message: error?.response?.data?.message || "No se pudo guardar el perfil de empresa." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <BusinessIcon sx={{ color: primary }} />
        <Typography variant="h6" fontWeight={900}>
          Información de la empresa
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" label="Nombre comercial" value={company.name || ""} onChange={(e) => setValue("name", e.target.value)} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" label="Industria" value={company.industry || ""} onChange={(e) => setValue("industry", e.target.value)} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" label="Ubicación" value={company.location || ""} onChange={(e) => setValue("location", e.target.value)} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" label="Sitio web" value={company.website || ""} onChange={(e) => setValue("website", e.target.value)} />
        </Grid>

        <Grid item xs={12}>
          <TextField fullWidth size="small" label="URL del logotipo" value={company.logo_url || ""} onChange={(e) => setValue("logo_url", e.target.value)} helperText="Usa una dirección HTTPS pública para mostrar el logotipo de la empresa." />
        </Grid>

        <Grid item xs={12}>
          <TextField fullWidth multiline minRows={4} label="Descripción" value={company.description || ""} onChange={(e) => setValue("description", e.target.value)} />
        </Grid>
      </Grid>

      {feedback && <Alert severity={feedback.severity} sx={{ mt: 2 }}>{feedback.message}</Alert>}

      <Stack direction="row" spacing={1} mt={3}>
        <Button variant="contained" sx={{ bgcolor: primary }} onClick={saveCompany} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>

        <Chip label={company.plan || "Plan actual"} color="primary" />

        <Chip
          label={company.status === "ACTIVE" ? "Activa" : "Inactiva"}
          color={company.status === "ACTIVE" ? "success" : "default"}
        />
      </Stack>
    </>
  );
}
