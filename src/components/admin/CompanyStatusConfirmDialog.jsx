import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function CompanyStatusConfirmDialog({
  open,
  action,
  reason,
  loading,
  onReasonChange,
  onClose,
  onConfirm,
}) {
  const isSuspending = action?.status === "SUSPENDED";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 900 }}>
        {isSuspending ? "Suspender empresa" : "Activar empresa"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Typography color="text.secondary">
            {isSuspending
              ? "¿Estás seguro que deseas suspender esta empresa? No podrá publicar ni operar en la plataforma."
              : "¿Deseas activar esta empresa nuevamente?"}
          </Typography>

          {isSuspending && (
            <TextField
              label="Motivo de suspensión"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              multiline
              minRows={3}
              fullWidth
              required
              placeholder="Ejemplo: falta de pago, incumplimiento de políticas, revisión administrativa..."
            />
          )}
        </Stack>
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
          color={isSuspending ? "error" : "success"}
          onClick={onConfirm}
          disabled={loading}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            borderRadius: 3,
          }}
        >
          {loading
            ? "Procesando..."
            : isSuspending
            ? "Sí, suspender"
            : "Sí, activar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}