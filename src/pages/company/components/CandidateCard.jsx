import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import MatchChip from "./MatchChip";

const primary = "#0057B8";

export default function CandidateCard({
  candidate,
  compact = false,
  onView,
  onSave,
}) {
  const Wrapper = compact ? Paper : Card;

  const match = Number(
    candidate.match ||
      candidate.match_score ||
      candidate.score ||
      candidate.compatibility ||
      0
  );

  const matchedSkills = candidate.matchedSkills || [];
  const missingSkills = candidate.missingSkills || [];

  return (
    <Wrapper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #E5EAF2",
        overflow: "hidden",
      }}
    >
      <CardContent component={compact ? Box : undefined}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" spacing={2} flex={1}>
            <Avatar
              src={candidate.photo_url || ""}
              sx={{
                bgcolor: "#EAF2FF",
                color: primary,
                width: 52,
                height: 52,
                fontWeight: 900,
              }}
            >
              {candidate.name?.[0] || "C"}
            </Avatar>

            <Box flex={1}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Typography fontWeight={900}>
                  {candidate.name || "Candidato"}
                </Typography>

                <MatchChip value={match} />
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {candidate.title ||
                  candidate.headline ||
                  candidate.last_position ||
                  "Perfil profesional"}{" "}
                · {candidate.location || "Sin ubicación"}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {candidate.experience ||
                  candidate.experience_years ||
                  0}{" "}
                años experiencia ·{" "}
                {candidate.education ||
                  candidate.education_level ||
                  "No especificada"}{" "}
                · C${" "}
                {Number(
                  candidate.expectedSalary ||
                    candidate.expected_salary ||
                    0
                ).toLocaleString()}
              </Typography>

              <Box mt={1.5}>
                <LinearProgress
                  variant="determinate"
                  value={match}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    bgcolor: "#E8EEF7",
                  }}
                />
              </Box>

              {(matchedSkills.length > 0 || missingSkills.length > 0) && (
                <Stack spacing={1} mt={1.5}>
                  {matchedSkills.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {matchedSkills.slice(0, 5).map((skill) => (
                        <Chip
                          key={skill}
                          size="small"
                          color="success"
                          label={skill}
                          sx={{ mb: 0.5, fontWeight: 700 }}
                        />
                      ))}

                      {matchedSkills.length > 5 && (
                        <Chip
                          size="small"
                          label={`+${matchedSkills.length - 5} más`}
                        />
                      )}
                    </Stack>
                  )}

                  {missingSkills.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {missingSkills.slice(0, 4).map((skill) => (
                        <Chip
                          key={skill}
                          size="small"
                          color="warning"
                          variant="outlined"
                          label={`Falta: ${skill}`}
                          sx={{ mb: 0.5, fontWeight: 700 }}
                        />
                      ))}

                      {missingSkills.length > 4 && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`+${missingSkills.length - 4} faltantes`}
                        />
                      )}
                    </Stack>
                  )}
                </Stack>
              )}
            </Box>
          </Stack>

          <Stack
            alignItems={{ xs: "stretch", md: "flex-end" }}
            spacing={1}
            minWidth={{ xs: "100%", md: 150 }}
          >
            {candidate.risk && (
              <Chip
                size="small"
                label={`Riesgo: ${candidate.risk}`}
                color={candidate.risk === "Bajo" ? "success" : "warning"}
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            )}

            {onView && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => onView(candidate)}
              >
                Ver perfil
              </Button>
            )}

            {onSave && (
              <Button
                size="small"
                startIcon={<BookmarkIcon />}
                onClick={() => onSave(candidate)}
              >
                Guardar
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Wrapper>
  );
}