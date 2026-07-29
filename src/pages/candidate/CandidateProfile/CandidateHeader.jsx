import React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PersonIcon from "@mui/icons-material/Person";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

import useCatalog from "../../../hooks/useCatalog";

const STATUS_COLORS = {
  ACTIVE: "success",
  OPEN_TO_OFFERS: "primary",
  NOT_AVAILABLE: "default",
};

export default function CandidateHeader({
  form,
  skills = [],
  uploadingPhoto,
  uploadingCover,
  onPhotoUpload,
  onCoverUpload,
}) {
  const { items: profileStatusOptions } = useCatalog("profile_status");

  const statusOption = profileStatusOptions.find(
    (item) => item.value === form.profile_status
  );

  const status = {
    label: statusOption?.label || "Buscando empleo",
    color: STATUS_COLORS[form.profile_status] || "default",
  };

  return (
    <Box>
      <Box
        sx={{
          height: { xs: 130, sm: 155, md: 175 },
          position: "relative",
          background: form.cover_url
            ? `url("${form.cover_url}") center/cover no-repeat`
            : "linear-gradient(135deg, #0F172A 0%, #1D4ED8 100%)",
        }}
      >
        <Button
          component="label"
          variant="contained"
          size="small"
          disabled={uploadingCover}
          startIcon={
            uploadingCover ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <CameraAltIcon />
            )
          }
          sx={{
            position: "absolute",
            right: 16,
            bottom: 16,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 800,
            bgcolor: "rgba(15, 23, 42, 0.88)",
            "&:hover": {
              bgcolor: "rgba(15, 23, 42, 1)",
            },
          }}
        >
          {uploadingCover ? "Subiendo..." : "Cambiar portada"}

          <input
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onCoverUpload}
          />
        </Button>
      </Box>

      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          pb: 3,
          position: "relative",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
        >
          <Box
            sx={{
              position: "relative",
              mt: { xs: -6, sm: -7 },
              flexShrink: 0,
            }}
          >
            <Avatar
              src={form.photo_url}
              sx={{
                width: { xs: 112, sm: 132 },
                height: { xs: 112, sm: 132 },
                bgcolor: "primary.main",
                border: "5px solid",
                borderColor: "background.paper",
                boxShadow: 4,
              }}
            >
              <PersonIcon sx={{ fontSize: 60 }} />
            </Avatar>

            <Tooltip title="Cambiar foto de perfil">
              <IconButton
                component="label"
                disabled={uploadingPhoto}
                sx={{
                  position: "absolute",
                  right: 5,
                  bottom: 5,
                  width: 38,
                  height: 38,
                  bgcolor: "primary.main",
                  color: "#fff",
                  boxShadow: 3,
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                {uploadingPhoto ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <PhotoCameraIcon fontSize="small" />
                )}

                <input
                  hidden
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onPhotoUpload}
                />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, pb: { sm: 1 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={1.5}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  sx={{
                    lineHeight: 1.15,
                    wordBreak: "break-word",
                  }}
                >
                  {form.name || "Tu nombre"}
                </Typography>

                <Typography
                  color="primary"
                  fontWeight={800}
                  sx={{ mt: 0.5 }}
                >
                  {form.headline || "Titular profesional"}
                </Typography>

                <Typography variant="body2" color="text.secondary" mt={0.3}>
                  {form.location || "Ubicación"}
                </Typography>
              </Box>

              <Chip
                color={status.color}
                label={status.label}
                sx={{
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              />
            </Stack>

            {skills.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                mt={1.5}
              >
                {skills.slice(0, 8).map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}