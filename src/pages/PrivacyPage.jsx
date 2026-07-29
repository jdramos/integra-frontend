import React from 'react';
import { Paper, Stack, Typography } from '@mui/material';
export default function PrivacyPage(){return <Paper sx={{p:{xs:3,md:5},maxWidth:900,mx:'auto'}}><Stack spacing={2}>
  <Typography variant="h3">Política de privacidad</Typography><Typography>Última actualización: 14 de julio de 2026.</Typography>
  <Typography variant="h5">Datos tratados</Typography><Typography>Integra RH trata datos de cuenta, perfil profesional, currículum, postulaciones, entrevistas, actividad y datos técnicos necesarios para prestar y proteger el servicio.</Typography>
  <Typography variant="h5">Finalidades</Typography><Typography>Los datos se usan para conectar candidatos y empresas, administrar procesos de selección, facturación, seguridad, soporte y comunicaciones solicitadas.</Typography>
  <Typography variant="h5">Acceso y conservación</Typography><Typography>Las empresas acceden únicamente a la información autorizada por el candidato y su plan. Conservamos los datos mientras la cuenta permanezca activa y durante los plazos legales aplicables.</Typography>
  <Typography variant="h5">Derechos</Typography><Typography>Puedes solicitar acceso, corrección, exportación o eliminación escribiendo al correo de privacidad indicado por la organización.</Typography>
  <Typography variant="body2" color="text.secondary">Este documento debe ser revisado por asesoría legal antes del lanzamiento público.</Typography>
  </Stack></Paper>}
