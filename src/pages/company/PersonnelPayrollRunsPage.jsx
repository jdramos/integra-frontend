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
  MenuItem,
  Paper,
  Stack,
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
  approvePersonnelPayrollRun,
  createPersonnelPayrollRun,
  createPersonnelPayrollMovement,
  cancelPersonnelPayrollMovement,
  getPersonnelEmployees,
  getPersonnelPayrollMovements,
  getPersonnelPayrollRun,
  getPersonnelPayrollRunEvents,
  getPersonnelPayrollRuns,
  markPersonnelPayrollRunPaid,
  updatePersonnelPayrollItem,
  voidPersonnelPayrollRun,
} from "../../api/company";

const EMPTY = {
  name: "",
  frequency: "MONTHLY",
  period_start: "",
  period_end: "",
  payment_date: "",
};
const frequencyLabel = {
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
};
const paymentMethods = {
  BANK_TRANSFER: "Transferencia bancaria",
  CHECK: "Cheque",
  CASH: "Efectivo",
  OTHER: "Otro",
};
const EMPTY_PAYMENT = {
  paid_at: new Date().toISOString().slice(0, 10),
  payment_method: "BANK_TRANSFER",
  payment_reference: "",
  payment_notes: "",
};
const EMPTY_MOVEMENT={employee_id:"",direction:"DEDUCTION",concept:"",tax_behavior:"NON_TAXABLE",total_amount:"",installments_total:1,start_date:new Date().toISOString().slice(0,10),notes:""};
const money = (value) =>
  new Intl.NumberFormat("es-NI", { style: "currency", currency: "NIO" }).format(
    Number(value || 0),
  );
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>'"]/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        char
      ],
  );

export default function PersonnelPayrollRunsPage() {
  const [runs, setRuns] = useState([]),
    [loading, setLoading] = useState(true),
    [open, setOpen] = useState(false),
    [form, setForm] = useState(EMPTY),
    [saving, setSaving] = useState(false),
    [detail, setDetail] = useState(null),
    [events, setEvents] = useState([]),
    [movements,setMovements]=useState([]),
    [employees,setEmployees]=useState([]),
    [movementOpen,setMovementOpen]=useState(false),
    [movementForm,setMovementForm]=useState(EMPTY_MOVEMENT),
    [adjustItem, setAdjustItem] = useState(null),
    [adjustment, setAdjustment] = useState({
      other_income: "",
      taxable_other_income: "",
      exempt_income: "",
      in_kind_income: "",
      education_health_deduction: "",
      pension_savings_deduction: "",
      other_deductions: "",
      ir_adjustment: "",
      ir_adjustment_reason: "",
    }),
    [payOpen, setPayOpen] = useState(false),
    [payment, setPayment] = useState(EMPTY_PAYMENT),
    [voidOpen, setVoidOpen] = useState(false),
    [voidReason, setVoidReason] = useState(""),
    [filters, setFilters] = useState({ search: "", status: "ALL", payment: "ALL" }),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const filteredRuns = runs.filter((run) => {
    const search = filters.search.trim().toLowerCase();
    return (
      (!search || String(run.name || "").toLowerCase().includes(search)) &&
      (filters.status === "ALL" || run.status === filters.status) &&
      (filters.payment === "ALL" ||
        (filters.payment === "NOT_APPLICABLE"
          ? run.status === "VOIDED"
          : run.status !== "VOIDED" && run.payment_status === filters.payment))
    );
  });
  const load = async () => {
    setLoading(true);
    try {
      setError("");
      const [runRows,movementRows,employeeRows]=await Promise.all([getPersonnelPayrollRuns(),getPersonnelPayrollMovements(),getPersonnelEmployees()]);
      setRuns(runRows);setMovements(movementRows);setEmployees(employeeRows.filter(e=>e.status==='ACTIVE'));
    } catch (e) {
      setError(
        e?.response?.data?.message || "No se pudieron cargar las planillas.",
      );
    } finally {
      setLoading(false);
    }
  };
  const createMovement=async()=>{try{setSaving(true);setError("");await createPersonnelPayrollMovement({...movementForm,employee_id:Number(movementForm.employee_id),total_amount:Number(movementForm.total_amount),installments_total:Number(movementForm.installments_total)});setMovementOpen(false);setMovementForm(EMPTY_MOVEMENT);setMessage("Movimiento programado correctamente.");await load()}catch(e){setError(e?.response?.data?.message||"No se pudo programar el movimiento.")}finally{setSaving(false)}};
  const cancelMovement=async(id)=>{try{setSaving(true);await cancelPersonnelPayrollMovement(id);setMessage("Movimiento cancelado; las cuotas aplicadas se conservaron.");await load()}catch(e){setError(e?.response?.data?.message||"No se pudo cancelar el movimiento.")}finally{setSaving(false)}};
  useEffect(() => {
    load();
  }, []);
  const create = async () => {
    try {
      setSaving(true);
      setError("");
      const result = await createPersonnelPayrollRun(form);
      setMessage(`Planilla generada con ${result.employees} colaborador(es).`);
      setOpen(false);
      setForm(EMPTY);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo generar la planilla.");
    } finally {
      setSaving(false);
    }
  };
  const view = async (id) => {
    try {
      setError("");
      const [run, history] = await Promise.all([
        getPersonnelPayrollRun(id),
        getPersonnelPayrollRunEvents(id),
      ]);
      setDetail(run);
      setEvents(history);
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo cargar el detalle.");
    }
  };
  const approve = async () => {
    try {
      setSaving(true);
      await approvePersonnelPayrollRun(detail.id);
      setMessage("Planilla aprobada y cerrada.");
      setDetail(null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo aprobar la planilla.");
    } finally {
      setSaving(false);
    }
  };
  const markPaid = async () => {
    try {
      setSaving(true);
      setError("");
      await markPersonnelPayrollRunPaid(detail.id, payment);
      setMessage("Desembolso registrado correctamente.");
      setPayOpen(false);
      setPayment(EMPTY_PAYMENT);
      setDetail(null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo registrar el pago.");
    } finally {
      setSaving(false);
    }
  };
  const voidRun = async () => {
    try {
      setSaving(true);
      await voidPersonnelPayrollRun(detail.id, voidReason);
      setMessage("Planilla anulada con trazabilidad.");
      setVoidOpen(false);
      setVoidReason("");
      setDetail(null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo anular la planilla.");
    } finally {
      setSaving(false);
    }
  };
  const saveAdjustment = async () => {
    try {
      setSaving(true);
      setError("");
      await updatePersonnelPayrollItem(adjustItem.id, {
        other_income: Number(adjustment.other_income || 0),
        taxable_other_income: Number(adjustment.taxable_other_income || 0),
        exempt_income: Number(adjustment.exempt_income || 0),
        in_kind_income: Number(adjustment.in_kind_income || 0),
        education_health_deduction: Number(adjustment.education_health_deduction || 0),
        pension_savings_deduction: Number(adjustment.pension_savings_deduction || 0),
        other_deductions: Number(adjustment.other_deductions || 0),
        ir_adjustment: Number(adjustment.ir_adjustment || 0),
        ir_adjustment_reason: adjustment.ir_adjustment_reason,
      });
      setDetail(await getPersonnelPayrollRun(detail.id));
      setEvents(await getPersonnelPayrollRunEvents(detail.id));
      setAdjustItem(null);
      setMessage("Ajustes aplicados y totales recalculados.");
      await load();
    } catch (e) {
      setError(
        e?.response?.data?.message || "No se pudieron guardar los ajustes.",
      );
    } finally {
      setSaving(false);
    }
  };
  const printReceipt = (item) => {
    const popup = window.open("", "_blank", "width=760,height=820");
    if (!popup) return;
    const movementRows=(item.movements||[]).map(m=>`<div class="row"><span>${escapeHtml(m.concept)} · cuota ${m.installment_number}/${m.installments_total}</span><b>${m.direction==='DEDUCTION'?'-':'+'}${money(m.amount)}</b></div>`).join('');
    popup.document.write(
      `<!doctype html><html><head><title>Comprobante ${escapeHtml(item.employee_code)}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#172033}h1{font-size:24px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd}.total{font-size:20px;font-weight:700;margin-top:12px}.muted{color:#667085}@media print{button{display:none}}</style></head><body><h1>Comprobante de pago</h1><p><b>${escapeHtml(detail.name)}</b><br><span class="muted">Período: ${escapeHtml(detail.period_start)} al ${escapeHtml(detail.period_end)} · Pago: ${escapeHtml(detail.payment_date)}</span></p><h2>${escapeHtml(item.employee_name)}</h2><p class="muted">Código: ${escapeHtml(item.employee_code)}</p><div class="row"><span>Salario bruto</span><b>${money(item.gross_pay)}</b></div>${movementRows}<div class="row"><span>INSS laboral</span><b>-${money(item.employee_inss)}</b></div><div class="row"><span>IR</span><b>-${money(item.income_tax)}</b></div><div class="row total"><span>Neto a pagar</span><span>${money(item.net_pay)}</span></div><h3>Vacaciones al corte</h3><div class="row"><span>Acumuladas</span><b>${Number(item.vacation_accrued_days||0).toFixed(2)} días</b></div><div class="row"><span>Utilizadas</span><b>${Number(item.vacation_used_days||0).toFixed(2)} días</b></div><div class="row"><span>Saldo al ${escapeHtml(item.vacation_balance_as_of||detail.period_end)}</span><b>${Number(item.vacation_balance_days||0).toFixed(2)} días</b></div><p class="muted">Documento generado por Integra RH.</p><button onclick="window.print()">Imprimir</button></body></html>`,
    );
    popup.document.close();
  };
  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Planillas de pago
          </Typography>
          <Typography color="text.secondary">
            Generación, revisión y aprobación de pagos.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}><Button variant="outlined" onClick={()=>setMovementOpen(true)}>Nuevo movimiento</Button><Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Generar planilla</Button></Stack>
      </Stack>
      <Alert severity="warning" sx={{ mb: 2, position: "static" }}>
        Los cálculos son una proyección basada en salario ordinario, INSS e IR.
        Antes del cierre deben revisarse incidencias, ingresos y deducciones
        aplicables.
      </Alert>
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
      <Paper sx={{p:2,mb:2,borderRadius:3,overflow:"auto"}}><Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}><Box><Typography fontWeight={900}>Movimientos programados</Typography><Typography variant="body2" color="text.secondary">Ingresos, deducciones y préstamos por una o varias cuotas.</Typography></Box><Button size="small" onClick={()=>setMovementOpen(true)}>Agregar</Button></Stack><Table size="small"><TableHead><TableRow><TableCell>Colaborador</TableCell><TableCell>Concepto</TableCell><TableCell>Tipo</TableCell><TableCell align="right">Cuota</TableCell><TableCell align="right">Aplicado / total</TableCell><TableCell>Estado</TableCell><TableCell/></TableRow></TableHead><TableBody>{movements.slice(0,8).map(m=><TableRow key={m.id}><TableCell>{m.employee_name}</TableCell><TableCell>{m.concept}<Typography variant="caption" display="block">{m.applied_installments}/{m.installments_total} cuotas</Typography></TableCell><TableCell>{m.direction==='INCOME'?'Ingreso':'Deducción'}</TableCell><TableCell align="right">{money(m.installment_amount)}</TableCell><TableCell align="right">{money(m.applied_amount)} / {money(m.total_amount)}</TableCell><TableCell><Chip size="small" label={m.effective_status==='ACTIVE'?'Activo':m.effective_status==='COMPLETED'?'Completado':'Cancelado'} color={m.effective_status==='ACTIVE'?'primary':'default'}/></TableCell><TableCell>{m.effective_status==='ACTIVE'&&<Button size="small" color="error" onClick={()=>cancelMovement(m.id)} disabled={saving}>Cancelar</Button>}</TableCell></TableRow>)}{!movements.length&&<TableRow><TableCell colSpan={7}><Alert severity="info" sx={{position:"static"}}>No hay movimientos programados.</Alert></TableCell></TableRow>}</TableBody></Table></Paper>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
        <TextField
          label="Buscar planilla"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          size="small"
          sx={{ minWidth: 240 }}
        />
        <TextField
          select
          label="Estado"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          size="small"
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="ALL">Todos</MenuItem>
          <MenuItem value="DRAFT">Borradores</MenuItem>
          <MenuItem value="APPROVED">Aprobadas</MenuItem>
          <MenuItem value="VOIDED">Anuladas</MenuItem>
        </TextField>
        <TextField
          select
          label="Desembolso"
          value={filters.payment}
          onChange={(e) => setFilters({ ...filters, payment: e.target.value })}
          size="small"
          sx={{ minWidth: 190 }}
        >
          <MenuItem value="ALL">Todos</MenuItem>
          <MenuItem value="PENDING">Pendiente</MenuItem>
          <MenuItem value="PAID">Pagada</MenuItem>
          <MenuItem value="NOT_APPLICABLE">No aplica</MenuItem>
        </TextField>
      </Stack>
      <Paper sx={{ overflow: "auto", borderRadius: 3 }}>
        {loading ? (
          <Stack alignItems="center" p={5}>
            <CircularProgress />
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Planilla</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Frecuencia</TableCell>
                <TableCell align="right">Bruto</TableCell>
                <TableCell align="right">INSS laboral</TableCell>
                <TableCell align="right">IR</TableCell>
                <TableCell align="right">Neto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Desembolso</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRuns.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Typography fontWeight={800}>{r.name}</Typography>
                    <Typography variant="caption">
                      Pago: {r.payment_date}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {r.period_start} al {r.period_end}
                  </TableCell>
                  <TableCell>{frequencyLabel[r.frequency]}</TableCell>
                  <TableCell align="right">{money(r.gross_total)}</TableCell>
                  <TableCell align="right">
                    -{money(r.employee_inss_total)}
                  </TableCell>
                  <TableCell align="right">
                    -{money(r.income_tax_total)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={900} color="success.main">
                      {money(r.net_total)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={r.status === "APPROVED" ? "success" : r.status === "VOIDED" ? "error" : "warning"}
                      label={r.status === "APPROVED" ? "Aprobada" : r.status === "VOIDED" ? "Anulada" : "Borrador"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant={r.payment_status === "PAID" ? "filled" : "outlined"}
                      color={
                        r.status === "VOIDED" ? "default" : r.payment_status === "PAID" ? "success" : "default"
                      }
                      label={
                        r.status === "VOIDED" ? "No aplica" : r.payment_status === "PAID" ? "Pagada" : "Pendiente"
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => view(r.id)}>
                      Revisar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!filteredRuns.length && (
                <TableRow>
                  <TableCell colSpan={10}>
                    <Alert severity="info" sx={{ position: "static" }}>
                      No hay planillas que coincidan con los filtros.
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
      <Dialog
        open={open}
        onClose={() => !saving && setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle fontWeight={900}>Generar planilla</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Planilla julio 2026"
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Frecuencia"
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value })
                }
                fullWidth
              >
                {Object.entries(frequencyLabel).map(([v, l]) => (
                  <MenuItem key={v} value={v}>
                    {l}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Inicio del período"
                type="date"
                value={form.period_start}
                onChange={(e) =>
                  setForm({ ...form, period_start: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fin del período"
                type="date"
                value={form.period_end}
                onChange={(e) =>
                  setForm({ ...form, period_end: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha de pago"
                type="date"
                value={form.payment_date}
                onChange={(e) =>
                  setForm({ ...form, payment_date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={create}
            disabled={
              saving ||
              !form.name.trim() ||
              !form.period_start ||
              !form.period_end ||
              !form.payment_date
            }
          >
            {saving ? "Calculando..." : "Generar borrador"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(detail)}
        onClose={() => !saving && setDetail(null)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle fontWeight={900}>{detail?.name}</DialogTitle>
        <DialogContent dividers>
          {detail && (
            <>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
                {[
                  ["Bruto + otros ingresos", detail.gross_total],
                  ["INSS laboral", detail.employee_inss_total],
                  ["INSS patronal", detail.employer_inss_total],
                  ["IR", detail.income_tax_total],
                  ["Neto", detail.net_total],
                ].map(([l, v]) => (
                  <Paper key={l} sx={{ p: 1.5, flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {l}
                    </Typography>
                    <Typography fontWeight={900}>{money(v)}</Typography>
                  </Paper>
                ))}
              </Stack>
              {detail.payment_status === "PAID" && (
                <Alert severity="success" sx={{ mb: 2, position: "static" }}>
                  Pagada el {String(detail.paid_at).slice(0, 10)} mediante{" "}
                  {paymentMethods[detail.payment_method]}. Referencia:{" "}
                  {detail.payment_reference || "No aplica"}.
                </Alert>
              )}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Colaborador</TableCell>
                    <TableCell align="right">Bruto</TableCell>
                    <TableCell align="right">Otros ingresos</TableCell>
                    <TableCell align="right">INSS</TableCell>
                    <TableCell align="right">IR</TableCell>
                    <TableCell align="right">Deducciones</TableCell>
                    <TableCell align="right">Neto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detail.items?.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>
                        {i.employee_name}
                        <Typography variant="caption" display="block">
                          {i.employee_code}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{money(i.gross_pay)}</TableCell>
                      <TableCell align="right">
                        {money(i.other_income)}
                      </TableCell>
                      <TableCell align="right">
                        -{money(i.employee_inss)}
                      </TableCell>
                      <TableCell align="right">
                        -{money(i.income_tax)}
                      </TableCell>
                      <TableCell align="right">
                        -{money(i.other_deductions)}
                      </TableCell>
                      <TableCell align="right">
                        <b>{money(i.net_pay)}</b>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box mt={3}>
                <Typography variant="h6" fontWeight={900} mb={1}>
                  Historial de la planilla
                </Typography>
                <Stack spacing={1}>
                  {events.map((event) => (
                    <Paper key={event.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Box>
                          <Typography fontWeight={800}>
                            {event.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Por {event.created_by_name}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(event.created_at).toLocaleString("es-NI")}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                  {!events.length && (
                    <Typography color="text.secondary">
                      Esta planilla todavía no tiene eventos registrados.
                    </Typography>
                  )}
                </Stack>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetail(null)}>Cerrar</Button>
          {detail?.items?.length > 0 && (
            <Button
              onClick={() => {
                const item = detail.items[0];
                setAdjustItem(item);
                setAdjustment({
                  other_income: item.other_income || "",
                  taxable_other_income: item.taxable_other_income || "",
                  exempt_income: item.exempt_income || "",
                  in_kind_income: item.in_kind_income || "",
                  education_health_deduction: item.education_health_deduction || "",
                  pension_savings_deduction: item.pension_savings_deduction || "",
                  other_deductions: item.other_deductions || "",
                  ir_adjustment: item.ir_adjustment || "",
                  ir_adjustment_reason: item.ir_adjustment_reason || "",
                });
              }}
            >
              Ajustes y comprobantes
            </Button>
          )}
          {detail?.status === "APPROVED" &&
            detail?.payment_status !== "PAID" && (
              <Button variant="contained" onClick={() => setPayOpen(true)}>
                Registrar pago
              </Button>
            )}
          {detail?.status !== "VOIDED" &&
            detail?.payment_status !== "PAID" && (
              <Button color="error" onClick={() => setVoidOpen(true)}>
                Anular planilla
              </Button>
            )}
          {detail?.status === "DRAFT" && (
            <Button
              variant="contained"
              color="success"
              onClick={approve}
              disabled={saving || !detail?.items?.length}
            >
              {saving ? "Aprobando..." : "Aprobar y cerrar"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Dialog
        open={voidOpen}
        onClose={() => !saving && setVoidOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Anular planilla</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert severity="warning" sx={{ position: "static" }}>
              La planilla permanecerá en el historial y dejará de formar parte
              de reportes fiscales. Esta acción no aplica a planillas pagadas.
            </Alert>
            <TextField
              label="Motivo de anulación"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              multiline
              minRows={3}
              required
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVoidOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={voidRun}
            disabled={saving || voidReason.trim().length < 5}
          >
            {saving ? "Anulando..." : "Confirmar anulación"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={payOpen}
        onClose={() => !saving && setPayOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle fontWeight={900}>Registrar desembolso</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert severity="info" sx={{ position: "static" }}>
              Confirma que se desembolsaron {money(detail?.net_total)}. Este
              registro no modifica los cálculos aprobados.
            </Alert>
            <TextField
              label="Fecha del pago"
              type="date"
              value={payment.paid_at}
              onChange={(e) =>
                setPayment({ ...payment, paid_at: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              select
              label="Método"
              value={payment.payment_method}
              onChange={(e) =>
                setPayment({ ...payment, payment_method: e.target.value })
              }
              fullWidth
            >
              {Object.entries(paymentMethods).map(([v, l]) => (
                <MenuItem key={v} value={v}>
                  {l}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Referencia bancaria o número de cheque"
              value={payment.payment_reference}
              onChange={(e) =>
                setPayment({ ...payment, payment_reference: e.target.value })
              }
              required={payment.payment_method !== "CASH"}
              fullWidth
            />
            <TextField
              label="Notas"
              value={payment.payment_notes}
              onChange={(e) =>
                setPayment({ ...payment, payment_notes: e.target.value })
              }
              multiline
              minRows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={markPaid}
            disabled={
              saving ||
              !payment.paid_at ||
              (payment.payment_method !== "CASH" &&
                !payment.payment_reference.trim())
            }
          >
            {saving ? "Registrando..." : "Confirmar pago"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(adjustItem)}
        onClose={() => !saving && setAdjustItem(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle fontWeight={900}>Ajustes y comprobante</DialogTitle>
        <DialogContent dividers>
          {adjustItem && (
            <Stack spacing={2}>
              <TextField
                select
                label="Colaborador"
                value={adjustItem.id}
                onChange={(e) => {
                  const item = detail.items.find(
                    (x) => x.id === Number(e.target.value),
                  );
                  setAdjustItem(item);
                  setAdjustment({
                    other_income: item.other_income || "",
                    taxable_other_income: item.taxable_other_income || "",
                    exempt_income: item.exempt_income || "",
                    in_kind_income: item.in_kind_income || "",
                    education_health_deduction: item.education_health_deduction || "",
                    pension_savings_deduction: item.pension_savings_deduction || "",
                    other_deductions: item.other_deductions || "",
                    ir_adjustment: item.ir_adjustment || "",
                    ir_adjustment_reason: item.ir_adjustment_reason || "",
                  });
                }}
                fullWidth
              >
                {detail?.items?.map((item) => (
                  <MenuItem value={item.id} key={item.id}>
                    {item.employee_name}
                  </MenuItem>
                ))}
              </TextField>
              <Alert severity="info" sx={{ position: "static" }}>
                Otros ingresos se consideran no salariales y no modifican INSS
                ni IR. Las deducciones reducen directamente el neto.
              </Alert>
              <TextField
                label="Otros ingresos no salariales"
                type="number"
                value={adjustment.other_income}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, other_income: e.target.value })
                }
                inputProps={{ min: 0, step: "0.01" }}
                disabled={detail?.status !== "DRAFT"}
                fullWidth
              />
              <TextField
                label="Otras deducciones"
                type="number"
                value={adjustment.other_deductions}
                onChange={(e) =>
                  setAdjustment({
                    ...adjustment,
                    other_deductions: e.target.value,
                  })
                }
                inputProps={{ min: 0, step: "0.01" }}
                disabled={detail?.status !== "DRAFT"}
                fullWidth
              />
              {[['taxable_other_income','Bonos, comisiones y otros ingresos gravados'],['exempt_income','Ingresos exentos con soporte'],['in_kind_income','Remuneración en especie (valor de mercado)'],['education_health_deduction','Deducción soportada educación/salud (máx. anual C$20,000)'],['pension_savings_deduction','Aportes a fondos autorizados de ahorro/pensión']].map(([key,label])=><TextField key={key} label={label} type="number" value={adjustment[key]||""} onChange={(e)=>setAdjustment({...adjustment,[key]:e.target.value})} inputProps={{min:0,step:"0.01"}} disabled={detail?.status!=="DRAFT"} fullWidth />)}
              <TextField
                label="Ajuste anual de IR"
                type="number"
                value={adjustment.ir_adjustment}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, ir_adjustment: e.target.value })
                }
                helperText="Positivo: retención adicional. Negativo: devolución o compensación."
                inputProps={{ step: "0.01" }}
                disabled={detail?.status !== "DRAFT"}
                fullWidth
              />
              <TextField
                label="Motivo o referencia del ajuste IR"
                value={adjustment.ir_adjustment_reason}
                onChange={(e) =>
                  setAdjustment({
                    ...adjustment,
                    ir_adjustment_reason: e.target.value,
                  })
                }
                required={Number(adjustment.ir_adjustment || 0) !== 0}
                disabled={detail?.status !== "DRAFT"}
                multiline
                minRows={2}
                fullWidth
              />
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={900}>Neto actual</Typography>
                <Typography fontWeight={900} color="success.main">
                  {money(adjustItem.net_pay)}
                </Typography>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => printReceipt(adjustItem)}>
            Imprimir comprobante
          </Button>
          <Button onClick={() => setAdjustItem(null)}>Cerrar</Button>
          {detail?.status === "DRAFT" && (
            <Button
              variant="contained"
              onClick={saveAdjustment}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar ajustes"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={movementOpen} onClose={()=>!saving&&setMovementOpen(false)} fullWidth maxWidth="sm"><DialogTitle fontWeight={900}>Programar movimiento de nómina</DialogTitle><DialogContent dividers><Grid container spacing={2}><Grid item xs={12}><TextField select label="Colaborador" value={movementForm.employee_id} onChange={e=>setMovementForm({...movementForm,employee_id:e.target.value})} required fullWidth>{employees.map(e=><MenuItem key={e.id} value={e.id}>{e.first_name} {e.last_name} — {e.employee_code}</MenuItem>)}</TextField></Grid><Grid item xs={12} sm={6}><TextField select label="Tipo" value={movementForm.direction} onChange={e=>setMovementForm({...movementForm,direction:e.target.value,tax_behavior:e.target.value==='DEDUCTION'?'NON_TAXABLE':movementForm.tax_behavior})} fullWidth><MenuItem value="INCOME">Ingreso</MenuItem><MenuItem value="DEDUCTION">Deducción / préstamo</MenuItem></TextField></Grid><Grid item xs={12} sm={6}><TextField label="Concepto" value={movementForm.concept} onChange={e=>setMovementForm({...movementForm,concept:e.target.value})} required fullWidth/></Grid>{movementForm.direction==='INCOME'&&<Grid item xs={12}><TextField select label="Tratamiento fiscal" value={movementForm.tax_behavior} onChange={e=>setMovementForm({...movementForm,tax_behavior:e.target.value})} fullWidth><MenuItem value="TAXABLE">Ingreso gravado</MenuItem><MenuItem value="EXEMPT">Ingreso exento</MenuItem><MenuItem value="NON_TAXABLE">No salarial / no gravado</MenuItem></TextField></Grid>}<Grid item xs={12} sm={4}><TextField label="Monto total" type="number" value={movementForm.total_amount} onChange={e=>setMovementForm({...movementForm,total_amount:e.target.value})} inputProps={{min:.01,step:.01}} required fullWidth/></Grid><Grid item xs={12} sm={4}><TextField label="Número de cuotas" type="number" value={movementForm.installments_total} onChange={e=>setMovementForm({...movementForm,installments_total:e.target.value})} inputProps={{min:1,max:240,step:1}} required fullWidth/></Grid><Grid item xs={12} sm={4}><TextField label="Primera aplicación" type="date" value={movementForm.start_date} onChange={e=>setMovementForm({...movementForm,start_date:e.target.value})} InputLabelProps={{shrink:true}} required fullWidth/></Grid><Grid item xs={12}><Alert severity="info" sx={{position:"static"}}>Cuota estimada: {money(Number(movementForm.total_amount||0)/Math.max(1,Number(movementForm.installments_total||1)))}. La última cuota se ajusta automáticamente al saldo pendiente.</Alert></Grid><Grid item xs={12}><TextField label="Notas / referencia" value={movementForm.notes} onChange={e=>setMovementForm({...movementForm,notes:e.target.value})} multiline minRows={2} fullWidth/></Grid></Grid></DialogContent><DialogActions sx={{p:2}}><Button onClick={()=>setMovementOpen(false)} disabled={saving}>Cancelar</Button><Button variant="contained" onClick={createMovement} disabled={saving||!movementForm.employee_id||!movementForm.concept.trim()||Number(movementForm.total_amount)<=0||Number(movementForm.installments_total)<1}>{saving?'Guardando...':'Programar movimiento'}</Button></DialogActions></Dialog>
    </Box>
  );
}
