import React from "react";
import { Avatar, Box, Paper, Stack, Typography } from "@mui/material";

const primary = "#0057B8";

export default function CompanyStatCard({ icon, title, value, subtitle }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: "1px solid #E5EAF2",
        height: "100%",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: "#EAF2FF", color: primary }}>
          {icon}
        </Avatar>

        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>

          <Typography variant="h5" fontWeight={900}>
            {value}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
