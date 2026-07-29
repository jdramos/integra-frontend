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
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";

import {
  getBillingInvoices,
  getBillingSummary,
  markInvoicePaid,
  resendInvoiceNotice,
  voidInvoice,
  runBillingReminders,
  createManualInvoice,
  getAdminCompanies,
} from "../../api/admin";

const money = (value) => new Intl.NumberFormat("es-NI", { style: "currency", currency: "USD" }).format(Number(value || 0));
const labels = { PENDING: "Por cobrar", OVERDUE: "Vencida", PAID: "Pagada", CANCELLED: "Anulada" };
const colors = { PENDING: "warning", OVERDUE: "error", PAID: "success", CANCELLED: "default" };
const cycleLabels = { MONTHLY: "Mensual", QUARTERLY: "Trimestral", SEMIANNUAL: "Semestral", YEARLY: "Anual" };

const EMPTY_FORM = { company_id: "", amount: "", due_date: "", notes: "" };

function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function calculateTaxPreview(subtotal, company) {
  const base = round2(subtotal);
  const taxCondition = company?.tax_condition === "EXENTO" ? "EXENTO" : "GRAVADO";
  const ivaAmount = taxCondition === "GRAVADO" ? round2((base * 15) / 100) : 0;
  const grossTotal = round2(base + ivaAmount);
  const withholdingRate = company?.applies_withholding ? Number(company.withholding_rate || 0) : 0;
  const withholdingAmount = withholdingRate > 0 ? round2((base * withholdingRate) / 100) : 0;
  const netAmount = round2(grossTotal - withholdingAmount);
  return { subtotal: base, taxCondition, ivaAmount, grossTotal, withholdingRate, withholdingAmount, netAmount };
}

function TaxPreview({ amount, company }) {
  const tax = calculateTaxPreview(amount, company);
  return (
    <Alert severity="info" icon={false} sx={{ position: "static", zIndex: "auto", boxShadow: "none", animation: "none", "& .MuiAlert-message": { width: "100%" } }}>
      <Stack spacing={0.5}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">Subtotal</Typography>
          <Typography variant="body2">{money(tax.subtotal)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">IVA (15%) {tax.taxCondition === "EXENTO" && "— cliente exento"}</Typography>
          <Typography variant="body2">{money(tax.ivaAmount)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" fontWeight={800}>Total factura</Typography>
          <Typography variant="body2" fontWeight={800}>{money(tax.grossTotal)}</Typography>
        </Stack>
        {tax.withholdingAmount > 0 && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">Retención ({tax.withholdingRate}%)</Typography>
            <Typography variant="body2">-{money(tax.withholdingAmount)}</Typography>
          </Stack>
        )}
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" fontWeight={800} color="success.main">Neto a recibir</Typography>
          <Typography variant="body2" fontWeight={800} color="success.main">{money(tax.netAmount)}</Typography>
        </Stack>
      </Stack>
    </Alert>
  );
}

export default function AdminBillingPage() {
  const [tab, setTab] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [viewInvoice, setViewInvoice] = useState(null);
  const [confirmPayInvoice, setConfirmPayInvoice] = useState(null);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paying, setPaying] = useState(false);

  const [voidTarget, setVoidTarget] = useState(null);
  const [voidReason, setVoidReason] = useState("");
  const [voiding, setVoiding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setError("");
      const [rows, totals] = await Promise.all([getBillingInvoices(), getBillingSummary()]);
      setInvoices(rows || []);
      setSummary(totals || {});
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cargar la información de facturación.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const notice = async (invoice) => {
    if (!invoice || !["PENDING", "OVERDUE"].includes(invoice.status)) return;
    await resendInvoiceNotice(invoice.id);
    setMessage("Recordatorio enviado correctamente.");
  };

  const openPay = (invoice) => {
    if (!["PENDING", "OVERDUE"].includes(invoice.status)) return;
    setError("");
    setReceivedAmount(String(invoice.net_amount ?? invoice.amount ?? ""));
    setPaymentReference("");
    setConfirmPayInvoice(invoice);
  };

  const confirmPay = async () => {
    if (!confirmPayInvoice) return;
    try {
      setPaying(true);
      setError("");
      const numericAmount = Number(receivedAmount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        setError("El monto recibido debe ser mayor a cero.");
        return;
      }
      await markInvoicePaid(confirmPayInvoice.id, { received_amount: numericAmount, payment_reference: paymentReference });
      setMessage("Pago registrado correctamente.");
      setConfirmPayInvoice(null);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo registrar el pago.");
    } finally {
      setPaying(false);
    }
  };

  const openVoid = (invoice) => {
    setError("");
    setVoidReason("");
    setVoidTarget(invoice);
  };

  const confirmVoid = async () => {
    if (!voidTarget) return;
    try {
      setVoiding(true);
      setError("");
      const result = await voidInvoice(voidTarget.id, voidReason);
      setMessage(result?.notice_sent ? "Factura anulada y aviso enviado por correo." : "Factura anulada. No se pudo enviar el aviso por correo.");
      setVoidTarget(null);
      setViewInvoice(null);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo anular la factura.");
    } finally {
      setVoiding(false);
    }
  };

  const runNow = async () => {
    setRunning(true);
    try {
      const result = await runBillingReminders();
      setMessage(`Proceso ejecutado: ${result?.sent ?? 0} correo(s) enviado(s).`);
      await load();
    } finally {
      setRunning(false);
    }
  };

  const openCreate = async () => {
    setForm(EMPTY_FORM);
    setError("");
    setCreateOpen(true);
    if (!companies.length) {
      try { setCompanies(await getAdminCompanies()); } catch { setCompanies([]); }
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.company_id || !form.amount) {
      setError("Empresa y monto son requeridos.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const result = await createManualInvoice({
        company_id: Number(form.company_id),
        amount: Number(form.amount),
        due_date: form.due_date || undefined,
        notes: form.notes,
      });
      setMessage(result?.notice_sent ? "Factura creada y aviso enviado por correo." : "Factura creada. No se pudo enviar el aviso por correo.");
      setCreateOpen(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear la factura.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedCompanyForCreate = companies.find((c) => String(c.id) === String(form.company_id));

  const paidInvoices = invoices
    .filter((i) => i.status === "PAID")
    .sort((a, b) => new Date(b.paid_at || b.due_date) - new Date(a.paid_at || a.due_date));

  const paymentsTotals = paidInvoices.reduce(
    (acc, i) => ({
      gross: acc.gross + Number(i.amount || 0),
      iva: acc.iva + Number(i.iva_amount || 0),
      withholding: acc.withholding + Number(i.withholding_amount || 0),
      net: acc.net + Number(i.received_amount ?? i.net_amount ?? i.amount ?? 0),
    }),
    { gross: 0, iva: 0, withholding: 0, net: 0 }
  );

  return (
    <Box>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={900}>Cuentas por cobrar</Typography>
            <Typography color="text.secondary">Seguimiento de facturas pendientes, vencidas y pagadas. Las renovaciones y recordatorios corren automáticamente todos los días.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={runNow} disabled={running} sx={{ whiteSpace: "nowrap", borderRadius: 2, fontWeight: 800, textTransform: "none" }}>
              {running ? "Ejecutando..." : "Ejecutar ahora"}
            </Button>
            <Button variant="contained" onClick={openCreate} sx={{ whiteSpace: "nowrap", borderRadius: 2, fontWeight: 800, textTransform: "none" }}>
              Nueva factura
            </Button>
          </Stack>
        </Stack>

        {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
        {error && !createOpen && !confirmPayInvoice && !voidTarget && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {[["Por cobrar", summary.receivable], ["Cobrado", summary.collected], ["Vencidas", summary.overdue_count], ["Pagadas", summary.paid_count]].map(([label, value]) => (
            <Paper key={label} sx={{ p: 2, flex: 1, borderRadius: 3 }}>
              <Typography color="text.secondary">{label}</Typography>
              <Typography variant="h5" fontWeight={900}>{label.includes("Cobrar") || label === "Cobrado" ? money(value) : Number(value || 0)}</Typography>
            </Paper>
          ))}
        </Stack>

        <Tabs value={tab} onChange={(e, value) => setTab(value)} sx={{ minHeight: 36 }}>
          <Tab label="Facturas" sx={{ minHeight: 36, textTransform: "none", fontWeight: 800 }} />
          <Tab label="Pagos recibidos" sx={{ minHeight: 36, textTransform: "none", fontWeight: 800 }} />
        </Tabs>

        {tab === 0 ? (
          <Paper sx={{ overflow: "auto", borderRadius: 3 }}>
            {loading ? (
              <Stack alignItems="center" p={5}><CircularProgress /></Stack>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Factura</TableCell>
                    <TableCell>Empresa</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Vencimiento</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>{i.invoice_number}</TableCell>
                      <TableCell>
                        <Typography fontWeight={800}>{i.company_name}</Typography>
                        <Typography variant="caption">{i.billing_email}</Typography>
                      </TableCell>
                      <TableCell>{money(i.amount)}</TableCell>
                      <TableCell>{String(i.due_date).slice(0, 10)}</TableCell>
                      <TableCell><Chip size="small" color={colors[i.status]} label={labels[i.status]} /></TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => setViewInvoice(i)}>Ver</Button>
                        <Button size="small" onClick={() => notice(i)} disabled={!['PENDING', 'OVERDUE'].includes(i.status)}>Enviar aviso</Button>
                        <Button size="small" variant="contained" onClick={() => openPay(i)} disabled={!['PENDING', 'OVERDUE'].includes(i.status)}>Marcar pagada</Button>
                        <Button size="small" color="error" onClick={() => openVoid(i)} disabled={i.status === "CANCELLED"}>Anular</Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!invoices.length && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Alert severity="info">Todavía no hay facturas.</Alert>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Paper>
        ) : (
          <>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              {[
                ["Total bruto cobrado", paymentsTotals.gross],
                ["IVA recaudado", paymentsTotals.iva],
                ["Retenciones aplicadas", paymentsTotals.withholding],
                ["Neto recibido", paymentsTotals.net],
              ].map(([label, value]) => (
                <Paper key={label} sx={{ p: 2, flex: 1, borderRadius: 3 }}>
                  <Typography color="text.secondary">{label}</Typography>
                  <Typography variant="h5" fontWeight={900}>{money(value)}</Typography>
                </Paper>
              ))}
            </Stack>

            <Paper sx={{ overflow: "auto", borderRadius: 3 }}>
              {loading ? (
                <Stack alignItems="center" p={5}><CircularProgress /></Stack>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha de pago</TableCell>
                      <TableCell>Factura</TableCell>
                      <TableCell>Empresa</TableCell>
                      <TableCell>Condición fiscal</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="right">IVA</TableCell>
                      <TableCell align="right">Total factura</TableCell>
                      <TableCell align="right">Retención</TableCell>
                      <TableCell align="right">Neto recibido</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paidInvoices.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell>{i.paid_at ? String(i.paid_at).slice(0, 10) : "—"}</TableCell>
                        <TableCell>{i.invoice_number}</TableCell>
                        <TableCell>
                          <Typography fontWeight={800}>{i.company_name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" variant="outlined" label={i.tax_condition === "EXENTO" ? "Exento" : "Gravado"} />
                        </TableCell>
                        <TableCell align="right">{money(i.subtotal ?? i.amount)}</TableCell>
                        <TableCell align="right">{money(i.iva_amount)}</TableCell>
                        <TableCell align="right">{money(i.amount)}</TableCell>
                        <TableCell align="right">{Number(i.withholding_amount) > 0 ? `-${money(i.withholding_amount)}` : "—"}</TableCell>
                        <TableCell align="right"><Typography fontWeight={800} color="success.main">{money(i.received_amount ?? i.net_amount ?? i.amount)}</Typography></TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => setViewInvoice(i)}>Ver</Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!paidInvoices.length && (
                      <TableRow>
                        <TableCell colSpan={10}>
                          <Alert severity="info">Todavía no hay pagos recibidos.</Alert>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Paper>
          </>
        )}
      </Stack>

      <Dialog open={createOpen} onClose={() => !saving && setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={900}>Nueva factura manual</DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Empresa"
                  value={form.company_id}
                  onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                  fullWidth
                  required
                >
                  {companies.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}{c.billing_email ? "" : " (sin correo de facturación)"}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Monto (subtotal, sin impuestos)"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  fullWidth
                  required
                  inputProps={{ min: 0.01, step: "0.01" }}
                />
              </Grid>

              {selectedCompanyForCreate && form.amount && (
                <Grid item xs={12}>
                  <TaxPreview amount={form.amount} company={selectedCompanyForCreate} />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de vencimiento"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  helperText="Vacío = 15 días desde hoy"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Concepto / servicio"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="Ej: Publicación destacada, soporte adicional, etc."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateOpen(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving} sx={{ borderRadius: 2, fontWeight: 800, textTransform: "none" }}>
              {saving ? "Creando..." : "Crear factura"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(viewInvoice)} onClose={() => setViewInvoice(null)} fullWidth maxWidth="md">
        <DialogContent sx={{ p: 0 }}>
          {viewInvoice && (
            <Box className="invoice-print-area" sx={{ bgcolor: "#fff", color: "#1a1a1a" }}>
              <style>{`
                @media print {
                  body * { visibility: hidden; }
                  .invoice-print-area, .invoice-print-area * { visibility: visible; }
                  .invoice-print-area { position: fixed; inset: 0; padding: 0; }
                }
              `}</style>

              <Box
                sx={{
                  background: "linear-gradient(135deg, #0057B8 0%, #003E8A 100%)",
                  color: "#fff",
                  px: 4,
                  py: 3,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h5" fontWeight={900}>Integra RH</Typography>
                    <Typography sx={{ opacity: 0.85 }} fontSize={13}>Bolsa de empleo · Integra RH Nicaragua</Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h5" fontWeight={900} letterSpacing={1}>FACTURA</Typography>
                    <Typography sx={{ opacity: 0.9 }} fontSize={13}>{viewInvoice.invoice_number}</Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ px: 4, py: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" rowGap={2}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={800}>Facturar a</Typography>
                    <Typography fontWeight={900} fontSize={16}>{viewInvoice.company_name}</Typography>
                    {viewInvoice.company_nit && <Typography variant="body2" color="text.secondary">NIT: {viewInvoice.company_nit}</Typography>}
                    {viewInvoice.company_location && <Typography variant="body2" color="text.secondary">{viewInvoice.company_location}</Typography>}
                    <Typography variant="body2" color="text.secondary">{viewInvoice.billing_email}</Typography>
                  </Box>

                  <Stack spacing={0.5} textAlign="right">
                    <Chip color={colors[viewInvoice.status]} label={labels[viewInvoice.status]} sx={{ fontWeight: 800, alignSelf: "flex-end" }} />
                    <Typography variant="body2" color="text.secondary" mt={1}>Fecha de emisión: <strong>{String(viewInvoice.issued_at).slice(0, 10)}</strong></Typography>
                    <Typography variant="body2" color="text.secondary">Fecha de vencimiento: <strong>{String(viewInvoice.due_date).slice(0, 10)}</strong></Typography>
                    {viewInvoice.paid_at && <Typography variant="body2" color="success.main">Pagada el: <strong>{String(viewInvoice.paid_at).slice(0, 10)}</strong></Typography>}
                  </Stack>
                </Stack>

                <Table size="small" sx={{ mb: 3 }}>
                  <TableHead>
                    <TableRow sx={{ "& th": { fontWeight: 900, borderBottom: "2px solid #0057B8" } }}>
                      <TableCell>Descripción</TableCell>
                      <TableCell align="right">Monto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        {viewInvoice.plan_name
                          ? `Suscripción - Plan ${viewInvoice.plan_name}${viewInvoice.billing_cycle ? ` (${cycleLabels[viewInvoice.billing_cycle] || viewInvoice.billing_cycle})` : ""}`
                          : viewInvoice.notes || "Servicio Integra RH"}
                      </TableCell>
                      <TableCell align="right">{money(viewInvoice.subtotal ?? viewInvoice.amount)}</TableCell>
                    </TableRow>
                    {viewInvoice.plan_name && viewInvoice.notes && (
                      <TableRow>
                        <TableCell sx={{ color: "text.secondary", fontStyle: "italic" }}>{viewInvoice.notes}</TableCell>
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <Stack alignItems="flex-end" mb={3}>
                  <Box sx={{ width: { xs: "100%", sm: 300 } }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
                      <Typography color="text.secondary">Subtotal</Typography>
                      <Typography>{money(viewInvoice.subtotal ?? viewInvoice.amount)}</Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
                      <Typography color="text.secondary">
                        IVA ({viewInvoice.iva_rate ?? 15}%){viewInvoice.tax_condition === "EXENTO" && " — cliente exento"}
                      </Typography>
                      <Typography>{money(viewInvoice.iva_amount)}</Typography>
                    </Stack>

                    <Divider />

                    <Stack direction="row" justifyContent="space-between" sx={{ py: 1 }}>
                      <Typography variant="h6" fontWeight={900}>Total factura</Typography>
                      <Typography variant="h6" fontWeight={900} color="primary.main">{money(viewInvoice.amount)}</Typography>
                    </Stack>

                    {Number(viewInvoice.withholding_amount) > 0 && (
                      <>
                        <Divider />
                        <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
                          <Typography color="text.secondary">Retención ({viewInvoice.withholding_rate}%)</Typography>
                          <Typography>-{money(viewInvoice.withholding_amount)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
                          <Typography fontWeight={800} color="success.main">Neto a recibir</Typography>
                          <Typography fontWeight={800} color="success.main">{money(viewInvoice.net_amount)}</Typography>
                        </Stack>
                      </>
                    )}
                  </Box>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2" color="text.secondary">
                  Gracias por confiar en Integra RH. Si ya realizaste el pago de esta factura, puedes ignorar este documento.
                  Para consultas sobre tu facturación, escríbenos a <strong>info@integrarhni.com</strong>.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setViewInvoice(null)}>Cerrar</Button>
          {["PENDING", "OVERDUE"].includes(viewInvoice?.status) && (
            <Button onClick={() => notice(viewInvoice)}>Reenviar por correo</Button>
          )}
          {viewInvoice?.status !== "CANCELLED" && (
            <Button color="error" onClick={() => openVoid(viewInvoice)}>Anular</Button>
          )}
          <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ borderRadius: 2, fontWeight: 800, textTransform: "none" }}>
            Imprimir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(confirmPayInvoice)} onClose={() => !paying && setConfirmPayInvoice(null)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={900}>Confirmar pago</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
          <Typography mb={2}>Confirma el pago de la factura <strong>{confirmPayInvoice?.invoice_number}</strong> de <strong>{confirmPayInvoice?.company_name}</strong>.</Typography>
          <Stack spacing={0.75} mb={2} sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Valor de la factura</Typography><Typography variant="body2" fontWeight={800}>{money(confirmPayInvoice?.amount)}</Typography></Stack>
            <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Retención ({Number(confirmPayInvoice?.withholding_rate || 0)}%)</Typography><Typography variant="body2">-{money(confirmPayInvoice?.withholding_amount)}</Typography></Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between"><Typography variant="body2" fontWeight={800}>Neto esperado</Typography><Typography variant="body2" fontWeight={800}>{money(confirmPayInvoice?.net_amount ?? confirmPayInvoice?.amount)}</Typography></Stack>
          </Stack>
          <TextField label="Monto recibido" type="number" value={receivedAmount} onChange={(e) => setReceivedAmount(e.target.value)} fullWidth required inputProps={{ min: 0.01, step: "0.01" }} helperText="Puedes editarlo si el depósito recibido difiere del neto esperado." />
          <TextField label="Referencia de pago (opcional)" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} fullWidth sx={{ mt: 2 }} inputProps={{ maxLength: 120 }} />
          <Typography variant="body2" color="text.secondary" mt={1}>
            Esta acción marcará la factura como pagada y no se puede deshacer desde aquí.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmPayInvoice(null)} disabled={paying}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={confirmPay} disabled={paying} sx={{ borderRadius: 2, fontWeight: 800, textTransform: "none" }}>
            {paying ? "Confirmando..." : "Confirmar pago"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(voidTarget)} onClose={() => !voiding && setVoidTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={900}>Anular factura</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
          <Typography>
            ¿Confirmas que quieres anular la factura <strong>{voidTarget?.invoice_number}</strong> de{" "}
            <strong>{voidTarget?.company_name}</strong> por <strong>{money(voidTarget?.amount)}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1} mb={2}>
            Se marcará como anulada y se notificará por correo a la empresa. Esta acción no se puede deshacer desde aquí.
          </Typography>
          <TextField
            label="Motivo (opcional)"
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            placeholder="Ej: Factura duplicada, monto incorrecto, etc."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setVoidTarget(null)} disabled={voiding}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmVoid} disabled={voiding} sx={{ borderRadius: 2, fontWeight: 800, textTransform: "none" }}>
            {voiding ? "Anulando..." : "Anular factura"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
