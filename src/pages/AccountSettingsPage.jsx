import React, { useState } from 'react';
import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { changePasswordRequest, deactivateAccountRequest, exportAccountRequest } from '../api/auth';
import useAuth from '../auth/AuthContext';

export default function AccountSettingsPage(){
  const { logout }=useAuth(); const [form,setForm]=useState({current_password:'',new_password:''}); const [message,setMessage]=useState(''); const [error,setError]=useState('');
  const run=async(fn)=>{setError('');setMessage('');try{await fn();}catch(e){setError(e?.response?.data?.message||'No se pudo completar la operación')}};
  const exportData=()=>run(async()=>{const blob=await exportAccountRequest();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='integra-rh-datos.json';a.click();URL.revokeObjectURL(url);setMessage('Exportación generada')});
  return <Paper sx={{p:4,maxWidth:650,mx:'auto'}}><Stack spacing={2}><Typography variant="h4">Seguridad y cuenta</Typography>{message&&<Alert severity="success">{message}</Alert>}{error&&<Alert severity="error">{error}</Alert>}
    <TextField type="password" label="Contraseña actual" value={form.current_password} onChange={e=>setForm({...form,current_password:e.target.value})}/><TextField type="password" label="Nueva contraseña" helperText="Mínimo 8 caracteres" value={form.new_password} onChange={e=>setForm({...form,new_password:e.target.value})}/>
    <Button variant="contained" onClick={()=>run(async()=>{await changePasswordRequest(form);setMessage('Contraseña actualizada')})}>Cambiar contraseña</Button>
    <Button onClick={exportData}>Exportar mis datos</Button><Button color="error" onClick={()=>run(async()=>{if(!window.confirm('¿Desactivar tu cuenta?'))return;await deactivateAccountRequest(form.current_password);await logout()})}>Desactivar cuenta</Button>
  </Stack></Paper>
}
