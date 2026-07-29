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
import DownloadIcon from "@mui/icons-material/Download";
import {
  getPersonnelAnnualIrReconciliation,
  getPersonnelPayrollObligations,
  getPersonnelPayrollReport,
  getPersonnelPayrollReportItems,
  savePersonnelIrOpeningBalance,
} from "../../api/company";

const today = new Date().toISOString().slice(0, 10),
  yearStart = `${today.slice(0, 4)}-01-01`;
const money = (v) =>
  new Intl.NumberFormat("es-NI", { style: "currency", currency: "NIO" }).format(
    Number(v || 0),
  );
const csv = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>'"]/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        char
      ],
  );
function saveCsv(filename, headers, keys, rows) {
  const content = [
      headers.map(csv).join(","),
      ...rows.map((r) => keys.map((k) => csv(r[k])).join(",")),
    ].join("\r\n"),
    blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PersonnelReportsPage() {
  const [filters, setFilters] = useState({
      date_from: yearStart,
      date_to: today,
    }),
    [year, setYear] = useState(Number(today.slice(0, 4))),
    [report, setReport] = useState({ runs: [], totals: {} }),
    [obligations, setObligations] = useState({
      rows: [],
      missing: {},
      totals: {},
    }),
    [annual, setAnnual] = useState({ rows: [], totals: {} }),
    [opening, setOpening] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      setError("");
      const [r, o] = await Promise.all([
        getPersonnelPayrollReport(filters),
        getPersonnelPayrollObligations(filters),
      ]);
      setReport(r);
      setObligations(o);
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo generar el reporte.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [filters.date_from, filters.date_to]);
  useEffect(() => {
    getPersonnelAnnualIrReconciliation(year)
      .then(setAnnual)
      .catch((e) =>
        setError(
          e?.response?.data?.message ||
            "No se pudo generar la conciliación anual IR.",
        ),
      );
  }, [year]);
  const downloadDetail = async () => {
    try {
      const rows = await getPersonnelPayrollReportItems(filters);
      saveCsv(
        `reporte-planilla-${filters.date_from}-${filters.date_to}.csv`,
        [
          "Planilla",
          "Fecha de pago",
          "Período inicial",
          "Período final",
          "Código",
          "Colaborador",
          "Bruto",
          "Otros ingresos",
          "INSS laboral",
          "INSS patronal",
          "IR",
          "Otras deducciones",
          "Neto",
          "Moneda original",
          "Tipo de cambio",
        ],
        [
          "payroll_name",
          "payment_date",
          "period_start",
          "period_end",
          "employee_code",
          "employee_name",
          "gross_pay",
          "other_income",
          "employee_inss",
          "employer_inss",
          "income_tax",
          "other_deductions",
          "net_pay",
          "original_currency",
          "exchange_rate",
        ],
        rows,
      );
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo exportar el reporte.");
    }
  };
  const downloadInss = () =>
    saveCsv(
      `conciliacion-inss-${filters.date_from}-${filters.date_to}.csv`,
      [
        "Código",
        "Número INSS",
        "Colaborador",
        "Salario reportado",
        "Aporte laboral",
        "Aporte patronal",
        "Total aportes",
      ],
      [
        "employee_code",
        "inss_number",
        "employee_name",
        "gross_income",
        "employee_inss",
        "employer_inss",
        "total_inss",
      ],
      obligations.rows.map((r) => ({
        ...r,
        total_inss: Number(r.employee_inss) + Number(r.employer_inss),
      })),
    );
  const downloadDgi = () =>
    saveCsv(
      `preparacion-retenciones-dgi-${filters.date_from}-${filters.date_to}.csv`,
      [
        "Identificación/RUC",
        "Nombre y apellidos",
        "Ingresos brutos",
        "Cotización INSS",
        "Fondo de pensiones/ahorro",
        "Base imponible",
        "Valor retenido",
        "Código de retención",
      ],
      [
        "identity_number",
        "employee_name",
        "gross_income",
        "employee_inss",
        "pension_fund",
        "taxable_base",
        "income_tax",
        "retention_code",
      ],
      obligations.rows.map((r) => ({
        ...r,
        pension_fund: 0,
        retention_code: 11,
      })),
    );
  const downloadAnnual = () =>
    saveCsv(
      `conciliacion-ir-anual-${year}.csv`,
      [
        "Código",
        "Identificación",
        "Colaborador",
        "Ingresos brutos",
        "INSS",
        "Renta neta",
        "IR causado",
        "IR retenido",
        "Diferencia",
        "Estado",
      ],
      [
        "employee_code",
        "identity_number",
        "employee_name",
        "gross_income",
        "employee_inss",
        "taxable_income",
        "tax_due",
        "tax_withheld",
        "difference",
        "status",
      ],
      annual.rows || [],
    );
  const editOpening = (r) =>
    setOpening({
      employee_id: r.employee_id,
      employee_name: r.employee_name,
      fiscal_year: year,
      prior_gross_income: r.prior_gross_income || 0,
      prior_employee_inss: r.prior_employee_inss || 0,
      prior_taxable_income: r.prior_taxable_income || 0,
      prior_tax_withheld: r.prior_tax_withheld || 0,
      source: r.opening_source || "Constancia del empleador anterior",
      notes: "",
    });
  const saveOpening = async () => {
    try {
      await savePersonnelIrOpeningBalance(opening.employee_id, opening);
      setOpening(null);
      setAnnual(await getPersonnelAnnualIrReconciliation(year));
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "No se pudieron guardar los saldos anteriores.",
      );
    }
  };
  const printAnnualCertificate = (r) => {
    const popup = window.open("", "_blank", "width=820,height=900");
    if (!popup) return;
    const company = annual.company || {};
    popup.document.write(
      `<!doctype html><html><head><title>Constancia IR ${escapeHtml(year)} - ${escapeHtml(r.employee_name)}</title><style>body{font-family:Arial,sans-serif;padding:48px;color:#172033}h1{font-size:24px;margin-bottom:4px}.muted{color:#667085}.row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #ddd}.section{margin-top:24px}.total{font-size:18px;font-weight:700}.sign{margin-top:70px;width:280px;border-top:1px solid #333;padding-top:8px}@media print{button{display:none}}</style></head><body><h1>Constancia anual de ingresos y retenciones</h1><p class="muted">Período fiscal ${escapeHtml(year)}</p><div class="section"><b>${escapeHtml(company.name || "Empresa")}</b><br><span class="muted">RUC/NIT: ${escapeHtml(company.nit || "No registrado")}</span></div><div class="section"><h2>${escapeHtml(r.employee_name)}</h2><p class="muted">Identificación: ${escapeHtml(r.identity_number || "No registrada")} · Código: ${escapeHtml(r.employee_code || "—")}<br>Fecha de ingreso: ${escapeHtml(String(r.hire_date).slice(0, 10))}</p></div><div class="section"><div class="row"><span>Ingresos brutos en esta empresa</span><b>${money(r.company_gross_income)}</b></div><div class="row"><span>Ingresos brutos anteriores informados</span><b>${money(r.prior_gross_income)}</b></div><div class="row"><span>INSS laboral total</span><b>${money(r.employee_inss)}</b></div><div class="row"><span>Renta neta anual</span><b>${money(r.taxable_income)}</b></div><div class="row total"><span>IR retenido total</span><span>${money(r.tax_withheld)}</span></div></div><p class="muted section">Documento generado con los datos de planillas aprobadas y las constancias fiscales anteriores registradas. Debe ser revisado y firmado por la persona autorizada de la empresa.</p><div class="sign">Firma autorizada y sello</div><button onclick="window.print()">Imprimir</button></body></html>`,
    );
    popup.document.close();
  };
  const t = report.totals || {},
    missing = obligations.missing || {};
  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Reportes de nómina
          </Typography>
          <Typography color="text.secondary">
            Consolidado de planillas aprobadas y obligaciones laborales.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={downloadDetail}
          disabled={!report.runs?.length}
        >
          Exportar detalle CSV
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Alert severity="info" sx={{ mb: 2, position: "static" }}>
        Los archivos INSS y DGI son auxiliares de conciliación y preparación.
        Deben revisarse contra el formato oficial vigente antes de cargarlos o
        declarar.
      </Alert>
      {(missing.identity > 0 || missing.inss > 0) && (
        <Alert severity="warning" sx={{ mb: 2, position: "static" }}>
          Datos pendientes: {missing.identity || 0} colaborador(es) sin
          identificación y {missing.inss || 0} sin número INSS. Completa sus
          expedientes antes de declarar.
        </Alert>
      )}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <TextField
          label="Desde"
          type="date"
          value={filters.date_from}
          onChange={(e) =>
            setFilters({ ...filters, date_from: e.target.value })
          }
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Hasta"
          type="date"
          value={filters.date_to}
          onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={downloadInss}
          disabled={!obligations.rows?.length}
        >
          Conciliación INSS
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={downloadDgi}
          disabled={!obligations.rows?.length}
        >
          Preparación DGI
        </Button>
      </Stack>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        {[
          ["Salario bruto", t.gross],
          ["INSS laboral", t.employee_inss],
          ["INSS patronal", t.employer_inss],
          ["IR retenido", t.income_tax],
          ["Neto pagado", t.net],
        ].map(([l, v]) => (
          <Paper key={l} sx={{ p: 2, flex: 1 }}>
            <Typography color="text.secondary">{l}</Typography>
            <Typography variant="h6" fontWeight={900}>
              {money(v)}
            </Typography>
          </Paper>
        ))}
      </Stack>
      <Paper sx={{ overflow: "auto" }}>
        {loading ? (
          <Stack alignItems="center" p={5}>
            <CircularProgress />
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Planilla</TableCell>
                <TableCell>Pago</TableCell>
                <TableCell align="right">Colaboradores</TableCell>
                <TableCell align="right">Bruto</TableCell>
                <TableCell align="right">INSS laboral</TableCell>
                <TableCell align="right">INSS patronal</TableCell>
                <TableCell align="right">IR</TableCell>
                <TableCell align="right">Neto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.runs?.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.name}
                    <Typography variant="caption" display="block">
                      {r.period_start} al {r.period_end}
                    </Typography>
                  </TableCell>
                  <TableCell>{r.payment_date}</TableCell>
                  <TableCell align="right">{r.employee_count}</TableCell>
                  <TableCell align="right">{money(r.gross_total)}</TableCell>
                  <TableCell align="right">
                    {money(r.employee_inss_total)}
                  </TableCell>
                  <TableCell align="right">
                    {money(r.employer_inss_total)}
                  </TableCell>
                  <TableCell align="right">
                    {money(r.income_tax_total)}
                  </TableCell>
                  <TableCell align="right">
                    <b>{money(r.net_total)}</b>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
      <Paper sx={{ p: 2, mt: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
          mb={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={900}>
              Conciliación anual del IR
            </Typography>
            <Typography color="text.secondary">
              Compara el impuesto anual causado con las retenciones realizadas.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <TextField
              label="Año"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              inputProps={{ min: 2000, max: 2100 }}
              size="small"
            />
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadAnnual}
              disabled={!annual.rows?.length}
            >
              Exportar
            </Button>
          </Stack>
        </Stack>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
          {[
            ["Renta neta", annual.totals?.taxable],
            ["IR causado", annual.totals?.tax_due],
            ["IR retenido", annual.totals?.withheld],
            ["Diferencia", annual.totals?.difference],
          ].map(([l, v]) => (
            <Box
              key={l}
              sx={{ flex: 1, p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}
            >
              <Typography variant="caption" color="text.secondary">
                {l}
              </Typography>
              <Typography fontWeight={900}>{money(v)}</Typography>
            </Box>
          ))}
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Colaborador</TableCell>
              <TableCell>Ingreso</TableCell>
              <TableCell align="right">Renta neta</TableCell>
              <TableCell align="right">IR causado</TableCell>
              <TableCell align="right">Retenido</TableCell>
              <TableCell align="right">Diferencia</TableCell>
              <TableCell>Resultado</TableCell>
              <TableCell align="right">Constancia</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {annual.rows?.map((r) => (
              <TableRow key={r.employee_id}>
                <TableCell>
                  {r.employee_name}
                  <Typography variant="caption" display="block">
                    {r.identity_number || "Sin identificación"}
                  </Typography>
                </TableCell>
                <TableCell>
                  {String(r.hire_date).slice(0, 10)}
                  {r.incomplete_fiscal_period && (
                    <Typography
                      variant="caption"
                      display="block"
                      color="warning.main"
                    >
                      Período incompleto
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">{money(r.taxable_income)}</TableCell>
                <TableCell align="right">{money(r.tax_due)}</TableCell>
                <TableCell align="right">{money(r.tax_withheld)}</TableCell>
                <TableCell align="right">{money(r.difference)}</TableCell>
                <TableCell>
                  <Stack alignItems="flex-start" spacing={0.5}>
                    <Chip
                      size="small"
                      color={
                        r.status === "BALANCED"
                          ? "success"
                          : r.status === "PENDING_WITHHOLDING"
                            ? "warning"
                            : "error"
                      }
                      label={
                        r.status === "REQUIRES_PRIOR_INFO"
                          ? "Verificar renta anterior"
                          : r.status === "BALANCED"
                            ? "Cuadrado"
                            : r.status === "PENDING_WITHHOLDING"
                              ? "Pendiente de retener"
                              : "Exceso retenido"
                      }
                    />
                    {r.incomplete_fiscal_period && (
                      <Button size="small" onClick={() => editOpening(r)}>
                        Saldos anteriores
                      </Button>
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => printAnnualCertificate(r)}>
                    Imprimir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Alert severity="warning" sx={{ mt: 2, position: "static" }}>
          Para ingresos posteriores al 1 de enero, registra la constancia del
          empleador anterior. Sin esa información el resultado se marca para
          verificación y no se considera conciliado.
        </Alert>
      </Paper>
      <Dialog
        open={Boolean(opening)}
        onClose={() => setOpening(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Saldos fiscales anteriores — {opening?.employee_name}
        </DialogTitle>
        <DialogContent dividers>
          {opening && (
            <Stack spacing={2}>
              <Alert severity="info" sx={{ position: "static" }}>
                Registra los valores certificados por el empleador anterior
                dentro del mismo año fiscal. Si no tuvo otro empleo, conserva
                los montos en cero y deja constancia en la fuente o notas.
              </Alert>
              <TextField
                label="Ingresos brutos anteriores"
                type="number"
                value={opening.prior_gross_income}
                onChange={(e) =>
                  setOpening({ ...opening, prior_gross_income: e.target.value })
                }
              />
              <TextField
                label="INSS laboral anterior"
                type="number"
                value={opening.prior_employee_inss}
                onChange={(e) =>
                  setOpening({
                    ...opening,
                    prior_employee_inss: e.target.value,
                  })
                }
              />
              <TextField
                label="Renta neta anterior"
                type="number"
                value={opening.prior_taxable_income}
                onChange={(e) =>
                  setOpening({
                    ...opening,
                    prior_taxable_income: e.target.value,
                  })
                }
              />
              <TextField
                label="IR retenido anteriormente"
                type="number"
                value={opening.prior_tax_withheld}
                onChange={(e) =>
                  setOpening({ ...opening, prior_tax_withheld: e.target.value })
                }
              />
              <TextField
                label="Fuente o constancia"
                value={opening.source}
                onChange={(e) =>
                  setOpening({ ...opening, source: e.target.value })
                }
              />
              <TextField
                label="Notas"
                value={opening.notes}
                onChange={(e) =>
                  setOpening({ ...opening, notes: e.target.value })
                }
                multiline
                minRows={2}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpening(null)}>Cancelar</Button>
          <Button variant="contained" onClick={saveOpening}>
            Guardar y recalcular
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
