import React from "react";
import { Chip } from "@mui/material";

export default function MatchChip({ value = 0 }) {
  const color = value >= 90 ? "success" : value >= 80 ? "primary" : "warning";

  return (
    <Chip
      size="small"
      color={color}
      label={`${value}% ajuste`}
      sx={{ fontWeight: 800 }}
    />
  );
}
