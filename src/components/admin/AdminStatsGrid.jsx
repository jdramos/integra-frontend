import React from "react";
import { Grid } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import StatCard from "../common/StatCard";

export default function AdminStatsGrid({ stats }) {
  return (
    <Grid container spacing={1} sx={{ mb: 1 }}>
      <Grid item xs={12} md={3}>
        <StatCard
          title="Empresas"
          value={stats?.companies || 0}
          icon={<BusinessIcon color="primary" fontSize="large" />}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <StatCard
          title="Candidatos"
          value={stats?.candidates || 0}
          icon={<PeopleIcon color="primary" fontSize="large" />}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <StatCard
          title="Vacantes"
          value={stats?.jobs || 0}
          icon={<WorkIcon color="primary" fontSize="large" />}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <StatCard
          title="Postulaciones"
          value={stats?.applications || 0}
          icon={<AssignmentIcon color="primary" fontSize="large" />}
        />
      </Grid>
    </Grid>
  );
}