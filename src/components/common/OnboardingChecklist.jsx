import React from "react";
import { Box, Button, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function OnboardingChecklist({ title, description, steps = [] }) {
  const completed = steps.filter((step) => step.complete).length;
  const progress = steps.length ? Math.round((completed / steps.length) * 100) : 0;

  if (!steps.length || progress === 100) return null;

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 4, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
      <Stack spacing={2}>
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="h6" fontWeight={900}>{title}</Typography>
            <Typography variant="body2" color="primary.main" fontWeight={800}>{progress}%</Typography>
          </Stack>
          {description && <Typography variant="body2" color="text.secondary">{description}</Typography>}
          <LinearProgress variant="determinate" value={progress} sx={{ mt: 1.5, height: 8, borderRadius: 8 }} />
        </Box>

        <Stack spacing={1}>
          {steps.map((step) => (
            <Stack key={step.label} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={1} sx={{ py: 0.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                {step.complete ? <CheckCircleIcon color="success" fontSize="small" /> : <RadioButtonUncheckedIcon color="disabled" fontSize="small" />}
                <Typography variant="body2" fontWeight={step.complete ? 500 : 700} color={step.complete ? "text.secondary" : "text.primary"}>{step.label}</Typography>
              </Stack>
              {!step.complete && (
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={step.onClick} href={step.to || undefined} sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}>
                  Completar
                </Button>
              )}
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
