import React from "react";
import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import {
  deleteCandidateCv,
  getCandidateCvViewUrl,
  uploadCandidateCv,
  parseCandidateCv,
} from "../../../../api/candidate";
import CvSuggestionsDialog from "./CvSuggestionsDialog";

export default function CandidateCvTab({
  form,
  setForm,
  setMessage,
  setError,
}) {
  const [uploadingCv, setUploadingCv] = useState(false);
  const [deletingCv, setDeletingCv] = useState(false);
  const [loadingCvView, setLoadingCvView] = useState(false);
  const [parsingCv, setParsingCv] = useState(false);

  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [cvViewUrl, setCvViewUrl] = useState("");
  const [cvMimeType, setCvMimeType] = useState("");

  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const getFileNameFromUrl = (url = "") => {
    if (!url) return "";

    try {
      const cleanUrl = url.split("?")[0];

      return decodeURIComponent(
        cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1)
      );
    } catch {
      return "";
    }
  };

  const cvFileName = useMemo(() => {
    return (
      form.cv_original_name ||
      getFileNameFromUrl(form.cv_url) ||
      ""
    );
  }, [form.cv_original_name, form.cv_url]);

  const handleCvUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Solo se permiten archivos PDF, DOC o DOCX.");
      event.target.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("El CV no puede superar los 8 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingCv(true);
      setError("");
      setMessage("");

      const data = await uploadCandidateCv(file);

      const cvUrl =
        data.file_url ||
        data.cv_url ||
        data.url ||
        data.location ||
        "";

      const originalName =
        data.original_name ||
        data.cv_original_name ||
        data.file_name ||
        file.name;

      setForm((prev) => ({
        ...prev,
        cv_url: cvUrl,
        cv_original_name: originalName,
      }));

      setCvViewUrl("");
      setCvMimeType("");

      setMessage("CV subido correctamente.");

      await tryAutoFillFromCv();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo subir el CV."
      );
    } finally {
      setUploadingCv(false);
      event.target.value = "";
    }
  };

  const handleOpenCvModal = async () => {
    try {
      setLoadingCvView(true);
      setError("");

      const data = await getCandidateCvViewUrl();

      setCvViewUrl(data.url || "");
      setCvMimeType(data.mime_type || "");
      setCvModalOpen(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo abrir el CV."
      );
    } finally {
      setLoadingCvView(false);
    }
  };

  const handleDeleteCv = async () => {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar tu CV actual?"
    );

    if (!confirmed) return;

    try {
      setDeletingCv(true);
      setError("");
      setMessage("");

      await deleteCandidateCv();

      setForm((prev) => ({
        ...prev,
        cv_url: "",
        cv_original_name: "",
      }));

      setCvViewUrl("");
      setCvMimeType("");
      setCvModalOpen(false);

      setMessage("CV eliminado correctamente.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo eliminar el CV."
      );
    } finally {
      setDeletingCv(false);
    }
  };

  const tryAutoFillFromCv = async () => {
    try {
      setParsingCv(true);

      const result = await parseCandidateCv();

      if (result?.supported && result?.suggestions) {
        setSuggestions(result.suggestions);
        setSuggestionsOpen(true);
      } else {
        setMessage(
          "CV subido correctamente. No se pudo autocompletar el perfil automáticamente; puedes completarlo manualmente."
        );
      }
    } catch (err) {
      // El autocompletado es un extra: si falla, el candidato sigue pudiendo
      // completar el perfil manualmente sin bloquear el flujo de subida del CV.
      setMessage((prev) => prev || "CV subido correctamente.");
    } finally {
      setParsingCv(false);
    }
  };

  const handleSuggestionsApplied = ({ mergedFields, createdCounts }) => {
    setForm((prev) => ({ ...prev, ...mergedFields }));

    const addedTotal =
      (createdCounts?.experiences || 0) +
      (createdCounts?.education || 0) +
      (createdCounts?.certificates || 0);

    setMessage(
      addedTotal > 0
        ? `Perfil actualizado desde tu CV y se agregaron ${addedTotal} registro(s) nuevos.`
        : "Perfil actualizado desde tu CV."
    );

    setSuggestionsOpen(false);
  };

  return (
    <>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" fontWeight={900}>
            Currículum vitae
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Adjunta tu CV para que las empresas puedan revisar tu
            experiencia profesional.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          component="label"
          fullWidth
          disabled={uploadingCv || parsingCv}
          startIcon={
            uploadingCv || parsingCv ? (
              <CircularProgress size={18} />
            ) : (
              <CloudUploadIcon />
            )
          }
          sx={{
            py: 1.4,
            borderRadius: 3,
            fontWeight: 800,
            textTransform: "none",
          }}
        >
          {uploadingCv
            ? "Subiendo CV..."
            : parsingCv
              ? "Analizando CV..."
              : form.cv_url
                ? "Reemplazar CV"
                : "Subir CV"}

          <input
            hidden
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleCvUpload}
          />
        </Button>

        {form.cv_url ? (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "success.50",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ minWidth: 0 }}
              >
                <DescriptionIcon color="primary" />

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    component="button"
                    type="button"
                    onClick={handleOpenCvModal}
                    disabled={loadingCvView}
                    color="primary"
                    fontWeight={800}
                    sx={{
                      border: 0,
                      background: "transparent",
                      p: 0,
                      cursor: loadingCvView
                        ? "default"
                        : "pointer",
                      textAlign: "left",
                      maxWidth: { xs: 250, sm: 500 },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                      "&:hover": {
                        textDecoration: loadingCvView
                          ? "none"
                          : "underline",
                      },
                    }}
                  >
                    {loadingCvView
                      ? "Abriendo CV..."
                      : cvFileName || "CV cargado"}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={0.7}
                    alignItems="center"
                  >
                    <CheckCircleIcon
                      color="success"
                      sx={{ fontSize: 16 }}
                    />

                    <Typography
                      variant="caption"
                      color="success.main"
                      fontWeight={800}
                    >
                      Disponible para empresas
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Chip
                  size="small"
                  color="success"
                  label="Disponible"
                  sx={{ fontWeight: 800 }}
                />

                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleOpenCvModal}
                  disabled={loadingCvView}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 800,
                    textTransform: "none",
                  }}
                >
                  Ver
                </Button>

                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  disabled={deletingCv}
                  onClick={handleDeleteCv}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 800,
                    textTransform: "none",
                  }}
                >
                  {deletingCv ? "Eliminando..." : "Eliminar"}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ) : (
          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            Aún no has subido tu CV.
          </Alert>
        )}
      </Stack>

      <Dialog
        open={cvModalOpen}
        onClose={() => setCvModalOpen(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography fontWeight={900}>
              {cvFileName || "CV del candidato"}
            </Typography>

            <Stack direction="row" spacing={1}>
              {cvViewUrl && (
                <>
                  <Tooltip title="Abrir en otra pestaña">
                    <IconButton
                      component="a"
                      href={cvViewUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Descargar">
                    <IconButton
                      component="a"
                      href={cvViewUrl}
                      download={cvFileName || "cv"}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              <IconButton onClick={() => setCvModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ height: "80vh", p: 0 }}>
          {cvMimeType === "application/pdf" ? (
            <iframe
              src={cvViewUrl}
              title="CV"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          ) : (
            <Stack
              alignItems="center"
              justifyContent="center"
              height="100%"
              spacing={2}
              sx={{ p: 3 }}
            >
              <DescriptionIcon
                color="primary"
                sx={{ fontSize: 60 }}
              />

              <Typography fontWeight={800} textAlign="center">
                Este tipo de archivo no se puede previsualizar
                directamente.
              </Typography>

              <Button
                variant="contained"
                component="a"
                href={cvViewUrl}
                download={cvFileName || "cv"}
                startIcon={<DownloadIcon />}
              >
                Descargar CV
              </Button>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      <CvSuggestionsDialog
        open={suggestionsOpen}
        suggestions={suggestions}
        onClose={() => setSuggestionsOpen(false)}
        onApplied={handleSuggestionsApplied}
      />
    </>
  );
}
