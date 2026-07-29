import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "COMPANY_USER",
  active: 1,
};

export default function CompanyUserFormDialog({
  open,
  user,
  loading,
  onClose,
  onSave,
}) {
  const isEdit = Boolean(user?.id);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "COMPANY_USER",
        active: Number(user.active ?? 1),
      });
    } else {
      setForm(initialForm);
    }
  }, [user, open]);

  const setValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (!isEdit && !form.password.trim()) return;

    onSave({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
      role: form.role,
      active: Number(form.active),
    });
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>
        {isEdit ? "Editar usuario" : "Nuevo usuario"}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12}>
            <TextField
              label="Nombre"
              value={form.name}
              onChange={(e) => setValue("name", e.target.value)}
              fullWidth
              required
              size="small"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Correo"
              type="email"
              value={form.email}
              onChange={(e) => setValue("email", e.target.value)}
              fullWidth
              required
              size="small"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label={isEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
              type="password"
              value={form.password}
              onChange={(e) => setValue("password", e.target.value)}
              fullWidth
              required={!isEdit}
              size="small"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Rol"
              value={form.role}
              onChange={(e) => setValue("role", e.target.value)}
              fullWidth
              size="small"
              disabled={loading}
            >
              <MenuItem value="COMPANY_ADMIN">Administrador empresa</MenuItem>
              <MenuItem value="COMPANY_USER">Reclutador</MenuItem>
              <MenuItem value="COMPANY">Empresa antiguo</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Estado"
              value={form.active}
              onChange={(e) => setValue("active", Number(e.target.value))}
              fullWidth
              size="small"
              disabled={loading}
            >
              <MenuItem value={1}>Activo</MenuItem>
              <MenuItem value={0}>Inactivo</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none", fontWeight: 800 }}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            loading ||
            !form.name.trim() ||
            !form.email.trim() ||
            (!isEdit && !form.password.trim())
          }
          sx={{ textTransform: "none", fontWeight: 900, borderRadius: 2 }}
        >
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear usuario"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}