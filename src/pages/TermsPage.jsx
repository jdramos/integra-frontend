import React from 'react';
import { Paper, Stack, Typography } from '@mui/material';
export default function TermsPage(){return <Paper sx={{p:{xs:3,md:5},maxWidth:900,mx:'auto'}}><Stack spacing={2}>
  <Typography variant="h3">Términos de uso</Typography><Typography>Última actualización: 14 de julio de 2026.</Typography>
  <Typography variant="h5">Uso permitido</Typography><Typography>Los usuarios deben proporcionar información legítima, proteger sus credenciales y usar la plataforma exclusivamente para actividades profesionales y de selección autorizadas.</Typography>
  <Typography variant="h5">Vacantes y candidatos</Typography><Typography>Las empresas son responsables de sus anuncios y decisiones de contratación. Está prohibida la discriminación, el fraude, la extracción masiva de datos y la publicación de contenido ilícito.</Typography>
  <Typography variant="h5">Planes y pagos</Typography><Typography>Los límites, períodos, importes y vencimientos se muestran antes de contratar. La suspensión por mora no elimina obligaciones pendientes.</Typography>
  <Typography variant="body2" color="text.secondary">Este documento debe ser revisado por asesoría legal antes del lanzamiento público.</Typography>
  </Stack></Paper>}
