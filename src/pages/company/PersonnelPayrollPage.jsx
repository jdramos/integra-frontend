import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { createPersonnelEmployee, getPersonnelEmployees, getPersonnelOverview, updatePersonnelEmployee } from "../../api/company";

const EMPTY = { first_name:"",last_name:"",identity_number:"",inss_number:"",tax_residency:"RESIDENT",email:"",phone:"",address:"",birth_date:"",hire_date:"",department:"",position:"",status:"ACTIVE",contract_type:"INDEFINITE",contract_start_date:"",contract_end_date:"",salary:"",currency:"NIO",payment_frequency:"MONTHLY",change_reason:"" };
const statusLabel = { ACTIVE:"Activo",INACTIVE:"Inactivo",SUSPENDED:"Suspendido",TERMINATED:"Finalizado" };
const statusColor = { ACTIVE:"success",INACTIVE:"default",SUSPENDED:"warning",TERMINATED:"error" };
const money = (value,currency="NIO") => new Intl.NumberFormat("es-NI",{style:"currency",currency}).format(Number(value||0));

function EmployeeDialog({ open, employee, saving, onClose, onSave }) {
  const [form,setForm]=useState(EMPTY);
  useEffect(()=>setForm(employee?{...EMPTY,...employee,contract_start_date:employee.contract_start_date||employee.hire_date||"",contract_end_date:employee.contract_end_date||"",salary:employee.salary??""}:EMPTY),[employee,open]);
  const set=(key,value)=>setForm((prev)=>({...prev,[key]:value}));
  const valid=form.first_name.trim()&&form.last_name.trim()&&form.position.trim()&&form.hire_date&&Number(form.salary)>0;
  return <Dialog open={open} onClose={saving?undefined:onClose} fullWidth maxWidth="md">
    <DialogTitle fontWeight={900}>{employee?"Editar expediente":"Nuevo colaborador"}</DialogTitle>
    <DialogContent dividers><Grid container spacing={2}>
      <Grid item xs={12}><Typography fontWeight={900}>Datos personales</Typography></Grid>
      <Grid item xs={12} md={6}><TextField label="Nombres" value={form.first_name} onChange={(e)=>set("first_name",e.target.value)} required fullWidth /></Grid>
      <Grid item xs={12} md={6}><TextField label="Apellidos" value={form.last_name} onChange={(e)=>set("last_name",e.target.value)} required fullWidth /></Grid>
      <Grid item xs={12} md={4}><TextField label="Cédula / identificación" value={form.identity_number} onChange={(e)=>set("identity_number",e.target.value)} fullWidth /></Grid>
      <Grid item xs={12} md={4}><TextField label="Número INSS" value={form.inss_number} onChange={(e)=>set("inss_number",e.target.value)} fullWidth /></Grid>
      <Grid item xs={12} md={4}><TextField select label="Residencia fiscal" value={form.tax_residency} onChange={(e)=>set("tax_residency",e.target.value)} fullWidth><MenuItem value="RESIDENT">Residente fiscal</MenuItem><MenuItem value="NONRESIDENT">No residente (20% definitivo)</MenuItem></TextField></Grid>
      <Grid item xs={12} md={4}><TextField label="Fecha de nacimiento" type="date" value={form.birth_date||""} onChange={(e)=>set("birth_date",e.target.value)} InputLabelProps={{shrink:true}} fullWidth /></Grid>
      <Grid item xs={12} md={6}><TextField label="Correo" type="email" value={form.email} onChange={(e)=>set("email",e.target.value)} fullWidth /></Grid>
      <Grid item xs={12} md={6}><TextField label="Teléfono" value={form.phone} onChange={(e)=>set("phone",e.target.value)} fullWidth /></Grid>
      <Grid item xs={12}><TextField label="Dirección" value={form.address} onChange={(e)=>set("address",e.target.value)} fullWidth /></Grid>
      <Grid item xs={12}><Typography fontWeight={900} mt={1}>Datos laborales y contrato</Typography></Grid>
      <Grid item xs={12} md={4}><TextField label="Fecha de contratación" type="date" value={form.hire_date||""} onChange={(e)=>{set("hire_date",e.target.value);if(!form.contract_start_date)set("contract_start_date",e.target.value)}} InputLabelProps={{shrink:true}} required fullWidth /></Grid>
      <Grid item xs={12} md={4}><TextField label="Área / departamento" value={form.department} onChange={(e)=>set("department",e.target.value)} fullWidth /></Grid>
      <Grid item xs={12} md={4}><TextField label="Cargo" value={form.position} onChange={(e)=>set("position",e.target.value)} required fullWidth /></Grid>
      <Grid item xs={12} md={4}><TextField select label="Estado" value={form.status} onChange={(e)=>set("status",e.target.value)} fullWidth>{Object.entries(statusLabel).map(([v,l])=><MenuItem value={v} key={v}>{l}</MenuItem>)}</TextField></Grid>
      <Grid item xs={12} md={4}><TextField select label="Tipo de contrato" value={form.contract_type} onChange={(e)=>set("contract_type",e.target.value)} fullWidth><MenuItem value="INDEFINITE">Tiempo indeterminado</MenuItem><MenuItem value="FIXED_TERM">Tiempo determinado</MenuItem><MenuItem value="SERVICES">Servicios</MenuItem></TextField></Grid>
      <Grid item xs={12} md={4}><TextField label="Inicio de contrato" type="date" value={form.contract_start_date||""} onChange={(e)=>set("contract_start_date",e.target.value)} InputLabelProps={{shrink:true}} fullWidth /></Grid>
      {form.contract_type==="FIXED_TERM"&&<Grid item xs={12} md={4}><TextField label="Fin de contrato" type="date" value={form.contract_end_date||""} onChange={(e)=>set("contract_end_date",e.target.value)} InputLabelProps={{shrink:true}} fullWidth /></Grid>}
      <Grid item xs={12} md={4}><TextField label="Salario ordinario" type="number" value={form.salary} onChange={(e)=>set("salary",e.target.value)} inputProps={{min:0.01,step:"0.01"}} required fullWidth /></Grid>
      <Grid item xs={12} md={4}><TextField select label="Moneda" value={form.currency} onChange={(e)=>set("currency",e.target.value)} fullWidth><MenuItem value="NIO">Córdoba (NIO)</MenuItem><MenuItem value="USD">Dólar (USD)</MenuItem></TextField></Grid>
      <Grid item xs={12} md={4}><TextField select label="Frecuencia de pago" value={form.payment_frequency} onChange={(e)=>set("payment_frequency",e.target.value)} fullWidth><MenuItem value="WEEKLY">Semanal</MenuItem><MenuItem value="BIWEEKLY">Quincenal</MenuItem><MenuItem value="MONTHLY">Mensual</MenuItem></TextField></Grid>
      {employee&&<Grid item xs={12}><TextField label="Motivo del cambio contractual" value={form.change_reason} onChange={(e)=>set("change_reason",e.target.value)} helperText="Si cambia salario, moneda, frecuencia o tipo de contrato, se guardará una nueva versión en el historial." fullWidth /></Grid>}
    </Grid></DialogContent>
    <DialogActions sx={{p:2}}><Button onClick={onClose} disabled={saving}>Cancelar</Button><Button variant="contained" onClick={()=>onSave({...form,salary:Number(form.salary)})} disabled={saving||!valid}>{saving?"Guardando...":"Guardar expediente"}</Button></DialogActions>
  </Dialog>;
}

export default function PersonnelPayrollPage(){
  const [employees,setEmployees]=useState([]),[overview,setOverview]=useState({}),[loading,setLoading]=useState(true),[dialog,setDialog]=useState(false),[selected,setSelected]=useState(null),[saving,setSaving]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
  const load=async()=>{setLoading(true);try{setError("");const [rows,stats]=await Promise.all([getPersonnelEmployees(),getPersonnelOverview()]);setEmployees(rows);setOverview(stats)}catch(e){setError(e?.response?.data?.message||"No se pudo cargar el módulo de personal.")}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);
  const totals=useMemo(()=>({active:employees.filter((e)=>e.status==="ACTIVE").length,payroll:employees.filter((e)=>e.status==="ACTIVE").reduce((sum,e)=>sum+Number(e.salary||0),0)}),[employees]);
  const save=async(payload)=>{try{setSaving(true);setError("");if(selected)await updatePersonnelEmployee(selected.id,payload);else await createPersonnelEmployee(payload);setMessage(selected?"Expediente actualizado.":"Colaborador registrado.");setDialog(false);setSelected(null);await load()}catch(e){setError(e?.response?.data?.message||"No se pudo guardar el expediente.")}finally{setSaving(false)}};
  return <Box><Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between" spacing={2} mb={3}><Box><Typography variant="h4" fontWeight={900}>Administración de personal y planilla</Typography><Typography color="text.secondary">Expedientes, contratos e historial salarial.</Typography></Box><Button variant="contained" startIcon={<AddIcon/>} onClick={()=>{setSelected(null);setDialog(true)}}>Nuevo colaborador</Button></Stack>
    {message&&<Alert severity="success" onClose={()=>setMessage("")} sx={{mb:2}}>{message}</Alert>}{error&&<Alert severity="error" onClose={()=>setError("")} sx={{mb:2}}>{error}</Alert>}
    <Stack direction={{xs:"column",md:"row"}} spacing={2} mb={3}>{[["Colaboradores",overview.employees||0],["Activos",totals.active],["Salario mensual registrado",money(totals.payroll)]].map(([l,v])=><Paper key={l} sx={{p:2,flex:1,borderRadius:3}}><Typography color="text.secondary">{l}</Typography><Typography variant="h5" fontWeight={900}>{v}</Typography></Paper>)}</Stack>
    <Paper sx={{overflow:"auto",borderRadius:3}}>{loading?<Stack alignItems="center" p={5}><CircularProgress/></Stack>:<Table><TableHead><TableRow><TableCell>Código</TableCell><TableCell>Colaborador</TableCell><TableCell>Área / cargo</TableCell><TableCell>Ingreso</TableCell><TableCell>Contrato</TableCell><TableCell align="right">Salario</TableCell><TableCell>Estado</TableCell><TableCell align="right">Acciones</TableCell></TableRow></TableHead><TableBody>{employees.map((e)=><TableRow key={e.id}><TableCell>{e.employee_code}</TableCell><TableCell><Typography fontWeight={800}>{e.first_name} {e.last_name}</Typography><Typography variant="caption">{e.identity_number||e.email||"Sin identificación"}</Typography></TableCell><TableCell>{e.department||"—"}<Typography variant="caption" display="block">{e.position}</Typography></TableCell><TableCell>{e.hire_date}</TableCell><TableCell>{e.contract_type==="FIXED_TERM"?"Determinado":e.contract_type==="SERVICES"?"Servicios":"Indeterminado"}</TableCell><TableCell align="right" sx={{fontWeight:800}}>{money(e.salary,e.currency)}</TableCell><TableCell><Chip size="small" color={statusColor[e.status]} label={statusLabel[e.status]}/></TableCell><TableCell align="right"><Button size="small" onClick={()=>{setSelected(e);setDialog(true)}}>Editar</Button></TableCell></TableRow>)}{!employees.length&&<TableRow><TableCell colSpan={8}><Alert severity="info" sx={{position:"static"}}>Todavía no hay colaboradores registrados.</Alert></TableCell></TableRow>}</TableBody></Table>}</Paper>
    <EmployeeDialog open={dialog} employee={selected} saving={saving} onClose={()=>{setDialog(false);setSelected(null)}} onSave={save}/></Box>;
}
