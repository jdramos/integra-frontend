import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  getPersonnelExchangeRates,
  getPersonnelInssSettings,
  getPersonnelIrSettings,
  getPersonnelPayrollPolicy,
  savePersonnelExchangeRate,
  savePersonnelInssSetting,
  savePersonnelIrSetting,
  updatePersonnelPayrollPolicy,
} from "../../api/company";

const today = new Date().toISOString().slice(0, 10),
  EMPTY_RATE = {
    effective_date: today,
    currency: "USD",
    rate_to_nio: "",
    source: "BCN",
    notes: "",
  },
  EMPTY_INSS = {
    effective_date: today,
    regime: "INTEGRAL",
    employer_size: "UNDER_50",
    notes: "",
  },
  EMPTY_IR = { effective_date: today, source: "Ley 822, Art. 23", notes: "" };
const regimes = { INTEGRAL: "Integral", IVM_RP: "IVM-RP" },
  sizes = {
    UNDER_50: "Menos de 50 trabajadores",
    FIFTY_OR_MORE: "50 trabajadores o más",
  };
const pct = (v) => `${(Number(v || 0) * 100).toFixed(2)}%`;

export default function PersonnelSettingsPage() {
  const [rates, setRates] = useState([]),
    [inss, setInss] = useState([]),
    [ir, setIr] = useState([]),
    [policy, setPolicy] = useState({ dual_approval_enabled: false }),
    [rateOpen, setRateOpen] = useState(false),
    [inssOpen, setInssOpen] = useState(false),
    [irOpen, setIrOpen] = useState(false),
    [rateForm, setRateForm] = useState(EMPTY_RATE),
    [inssForm, setInssForm] = useState(EMPTY_INSS),
    [irForm, setIrForm] = useState(EMPTY_IR),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const load = async () => {
    try {
      const [r, i, t, p] = await Promise.all([
        getPersonnelExchangeRates(),
        getPersonnelInssSettings(),
        getPersonnelIrSettings(),
        getPersonnelPayrollPolicy(),
      ]);
      setRates(r);
      setInss(i);
      setIr(t);
      setPolicy(p || { dual_approval_enabled: false });
    } catch (e) {
      setError(
        e?.response?.data?.message || "No se pudo cargar la configuración.",
      );
    }
  };
  useEffect(() => {
    load();
  }, []);
  const saveRate = async () => {
    try {
      setSaving(true);
      await savePersonnelExchangeRate({
        ...rateForm,
        rate_to_nio: Number(rateForm.rate_to_nio),
      });
      setMessage("Tipo de cambio guardado.");
      setRateOpen(false);
      setRateForm(EMPTY_RATE);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };
  const saveInss = async () => {
    try {
      setSaving(true);
      await savePersonnelInssSetting(inssForm);
      setMessage("Parámetros INSS guardados.");
      setInssOpen(false);
      setInssForm(EMPTY_INSS);
      await load();
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "No se pudo guardar la configuración INSS.",
      );
    } finally {
      setSaving(false);
    }
  };
  const saveIr = async () => {
    try {
      setSaving(true);
      await savePersonnelIrSetting(irForm);
      setMessage("Tabla progresiva IR registrada.");
      setIrOpen(false);
      setIrForm(EMPTY_IR);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo guardar la tabla IR.");
    } finally {
      setSaving(false);
    }
  };
  const toggleDualControl = async (enabled) => {
    try {
      setSaving(true);
      const updated = await updatePersonnelPayrollPolicy({
        dual_approval_enabled: enabled,
      });
      setPolicy(updated);
      setMessage(
        enabled
          ? "Doble control activado para las aprobaciones."
          : "Doble control desactivado.",
      );
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo actualizar la política.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={900}>
          Configuración de nómina
        </Typography>
        <Typography color="text.secondary">
          Parámetros legales y monetarios con vigencia e historial.
        </Typography>
      </Box>
      {message && (
        <Alert severity="success" onClose={() => setMessage("")} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
          alignItems={{ sm: "center" }}
        >
          <Box>
            <Typography variant="h6" fontWeight={900}>
              Doble control de aprobación
            </Typography>
            <Typography color="text.secondary">
              Impide que la persona que generó una planilla pueda aprobarla.
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(policy.dual_approval_enabled)}
                onChange={(e) => toggleDualControl(e.target.checked)}
                disabled={saving}
              />
            }
            label={policy.dual_approval_enabled ? "Activado" : "Desactivado"}
          />
        </Stack>
        <Alert severity="warning" sx={{ mt: 2, position: "static" }}>
          Actívalo únicamente si la empresa tiene al menos dos personas con
          acceso administrativo al módulo; de lo contrario no podrá aprobar sus
          propias planillas.
        </Alert>
      </Paper>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
          mb={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={900}>
              Régimen INSS
            </Typography>
            <Typography color="text.secondary">
              La planilla usa la configuración vigente en su fecha de pago y
              conserva las tasas aplicadas.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setInssOpen(true)}
          >
            Registrar parámetros
          </Button>
        </Stack>
        <Alert severity="warning" sx={{ mb: 2, position: "static" }}>
          Confirma el régimen y tamaño patronal con la inscripción del empleador
          ante el INSS. No dependen únicamente de la cantidad de expedientes en
          la aplicación.
        </Alert>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vigente desde</TableCell>
              <TableCell>Régimen</TableCell>
              <TableCell>Tamaño patronal</TableCell>
              <TableCell align="right">Laboral</TableCell>
              <TableCell align="right">Patronal</TableCell>
              <TableCell>Notas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inss.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.effective_date}</TableCell>
                <TableCell>{regimes[r.regime]}</TableCell>
                <TableCell>{sizes[r.employer_size]}</TableCell>
                <TableCell align="right">{pct(r.employee_rate)}</TableCell>
                <TableCell align="right">
                  <b>{pct(r.employer_rate)}</b>
                </TableCell>
                <TableCell>{r.notes || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
          mb={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={900}>
              Tipos de cambio
            </Typography>
            <Typography color="text.secondary">
              Conversión a córdobas para contratos pactados en USD.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setRateOpen(true)}
          >
            Registrar tipo de cambio
          </Button>
        </Stack>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vigente desde</TableCell>
              <TableCell>Moneda</TableCell>
              <TableCell align="right">Córdobas por unidad</TableCell>
              <TableCell>Fuente</TableCell>
              <TableCell>Notas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rates.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.effective_date}</TableCell>
                <TableCell>{r.currency}</TableCell>
                <TableCell align="right">
                  <b>{Number(r.rate_to_nio).toFixed(6)}</b>
                </TableCell>
                <TableCell>{r.source}</TableCell>
                <TableCell>{r.notes || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog
        open={inssOpen}
        onClose={() => !saving && setInssOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Registrar parámetros INSS</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Vigente desde"
              type="date"
              value={inssForm.effective_date}
              onChange={(e) =>
                setInssForm({ ...inssForm, effective_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Régimen de afiliación"
              value={inssForm.regime}
              onChange={(e) =>
                setInssForm({ ...inssForm, regime: e.target.value })
              }
            >
              {Object.entries(regimes).map(([v, l]) => (
                <MenuItem key={v} value={v}>
                  {l}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Tamaño patronal"
              value={inssForm.employer_size}
              onChange={(e) =>
                setInssForm({ ...inssForm, employer_size: e.target.value })
              }
            >
              {Object.entries(sizes).map(([v, l]) => (
                <MenuItem key={v} value={v}>
                  {l}
                </MenuItem>
              ))}
            </TextField>
            <Alert severity="info" sx={{ position: "static" }}>
              {inssForm.regime === "INTEGRAL"
                ? `Tasas: laboral 7%; patronal ${inssForm.employer_size === "FIFTY_OR_MORE" ? "22.5%" : "21.5%"}.`
                : `Tasas: laboral 5%; patronal ${inssForm.employer_size === "FIFTY_OR_MORE" ? "16.5%" : "15.5%"}.`}
            </Alert>
            <TextField
              label="Notas o soporte"
              value={inssForm.notes}
              onChange={(e) =>
                setInssForm({ ...inssForm, notes: e.target.value })
              }
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInssOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={saveInss}
            disabled={saving || !inssForm.effective_date}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={rateOpen}
        onClose={() => !saving && setRateOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Registrar tipo de cambio</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Vigente desde"
              type="date"
              value={rateForm.effective_date}
              onChange={(e) =>
                setRateForm({ ...rateForm, effective_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField label="Moneda" value="USD" disabled />
            <TextField
              label="Córdobas por USD"
              type="number"
              value={rateForm.rate_to_nio}
              onChange={(e) =>
                setRateForm({ ...rateForm, rate_to_nio: e.target.value })
              }
              inputProps={{ min: 0.000001, step: "0.000001" }}
            />
            <TextField
              label="Fuente"
              value={rateForm.source}
              onChange={(e) =>
                setRateForm({ ...rateForm, source: e.target.value })
              }
            />
            <TextField
              label="Notas"
              value={rateForm.notes}
              onChange={(e) =>
                setRateForm({ ...rateForm, notes: e.target.value })
              }
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRateOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={saveRate}
            disabled={
              saving ||
              !rateForm.effective_date ||
              Number(rateForm.rate_to_nio) <= 0
            }
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
      <Paper sx={{ p: 2, mt: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
          mb={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={900}>
              Tabla progresiva IR
            </Typography>
            <Typography color="text.secondary">
              Versiones aplicables a rentas del trabajo según la fecha de pago.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setIrOpen(true)}
          >
            Registrar tabla oficial
          </Button>
        </Stack>
        <Alert severity="info" sx={{ mb: 2, position: "static" }}>
          Esquema vigente: C$100,000 exentos; tramos de 15%, 20%, 25% y 30%. Los
          porcentajes están bloqueados para evitar modificaciones accidentales.
        </Alert>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vigente desde</TableCell>
              <TableCell>Versión</TableCell>
              <TableCell>Fuente</TableCell>
              <TableCell>Notas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ir.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.effective_date}</TableCell>
                <TableCell>{r.schedule_name}</TableCell>
                <TableCell>{r.source}</TableCell>
                <TableCell>{r.notes || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog
        open={irOpen}
        onClose={() => !saving && setIrOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Registrar tabla IR oficial</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Vigente desde"
              type="date"
              value={irForm.effective_date}
              onChange={(e) =>
                setIrForm({ ...irForm, effective_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
            <Alert severity="info" sx={{ position: "static" }}>
              Se registrará la tarifa progresiva del artículo 23 de la Ley 822:
              exento hasta C$100,000 anuales y tasas de 15%, 20%, 25% y 30%.
            </Alert>
            <TextField
              label="Fuente"
              value={irForm.source}
              onChange={(e) => setIrForm({ ...irForm, source: e.target.value })}
            />
            <TextField
              label="Notas"
              value={irForm.notes}
              onChange={(e) => setIrForm({ ...irForm, notes: e.target.value })}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIrOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={saveIr}
            disabled={saving || !irForm.effective_date || !irForm.source.trim()}
          >
            {saving ? "Guardando..." : "Registrar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
