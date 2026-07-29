import React from "react";
import { Tabs, Tab, Box } from "@mui/material";

export default function CandidateTabs({
  value,
  onChange,
}) {
  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Tabs
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Información" />
        <Tab label="Experiencia" />
        <Tab label="Educación" />
        <Tab label="Certificaciones" />
        <Tab label="CV" />
        <Tab label="Preferencias" />
        <Tab label="Quién vio mi perfil" />
      </Tabs>
    </Box>
  );
}
