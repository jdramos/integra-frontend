import React from "react";
import { Button, Grid, Stack, TextField, Typography, Chip } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";

const primary = "#0057B8";

export default function CompanyProfileTab({ company, setCompany }) {
  const setValue = (field, value) => {
    setCompany((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <BusinessIcon sx={{ color: primary }} />
        <Typography variant="h6" fontWeight={900}>
          InformaciÃ³n de la empresa
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
          <TextField fullWidth size="small" label="UbicaciÃ³n" value={company.location || ""} onChange={(e) => setValue("location", e.target.value)} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" label="Sitio web" value={company.website || ""} onChange={(e) => setValue("website", e.target.value)} />
        </Grid>

        <Grid item xs={12}>
          <TextField fullWidth multiline minRows={4} label="DescripciÃ³n" value={company.description || ""} onChange={(e) => setValue("description", e.target.value)} />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1} mt={3}>
        <Button variant="contained" sx={{ bgcolor: primary }}>
          Guardar cambios
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
