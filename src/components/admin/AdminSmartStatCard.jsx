import React from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";

export default function AdminSmartStatCard({
  title,
  value = 0,
  icon,
  trend = 0,
  helper = "",
}) {
  const isPositive = Number(trend) > 0;
  const isNegative = Number(trend) < 0;

  const trendLabel =
    Number(trend) === 0 ? "Sin cambio" : `${isPositive ? "+" : ""}${trend}%`;

  const TrendIcon = isPositive
    ? TrendingUpIcon
    : isNegative
      ? TrendingDownIcon
      : RemoveIcon;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.25,
        borderRadius: 3,
        bgcolor: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.18)",
        backdropFilter: "blur(10px)",
        color: "white",
        height: "100%",
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(255,255,255,0.16)",
          }}
        >
          {icon}
        </Box>

        <Chip
          size="small"
          icon={<TrendIcon sx={{ fontSize: 15 }} />}
          label={trendLabel}
          sx={{
            height: 22,
            color: "white",
            fontWeight: 800,
            bgcolor: isPositive
              ? "rgba(46, 204, 113, 0.28)"
              : isNegative
                ? "rgba(231, 76, 60, 0.28)"
                : "rgba(255,255,255,0.14)",
            "& .MuiChip-icon": {
              color: "white",
            },
          }}
        />
      </Stack>

      <Typography fontSize={13} sx={{ mt: 1, opacity: 0.82 }}>
        {title}
      </Typography>

      <Typography variant="h5" fontWeight={950} lineHeight={1.1}>
        {Number(value || 0).toLocaleString("es-NI")}
      </Typography>

      {helper && (
        <Typography fontSize={12} sx={{ mt: 0.4, opacity: 0.72 }}>
          {helper}
        </Typography>
      )}
    </Paper>
  );
}