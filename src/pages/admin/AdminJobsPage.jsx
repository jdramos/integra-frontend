import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { getAdminJobs, createAdminJob, updateAdminJob, deleteAdminJob, getAdminCompanies } from "../../api/admin";
import JobFormModal from "../company/components/JobFormModal";

const STATUS_LABELS = { DRAFT: "Borrador", OPEN: "Abierta", PAUSED: "Pausada", CLOSED: "Cerrada" };
const STATUS_COLORS = { DRAFT: "default", OPEN: "success", PAUSED: "warning", CLOSED: "default" };

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [companyId, setCompanyId] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminJobs({ q, status, company_id: companyId });
      setJobs(data);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar las vacantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminCompanies().then(setCompanies).catch(() => setCompanies([]));
  }, []);

  useEffect(() => {
    const delay = setTimeout(loadJobs, 350);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, companyId]);

  const openCreate = () => {
    setEditingJob(null);
    setModalOpen(true);
  };

  const openEdit = (job) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const handleSaved = async () => {
    setMessage(editingJob ? "Vacante actualizada." : "Vacante creada.");
    await loadJobs();
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`¿Eliminar la vacante "${job.title}"?`)) return;

    try {
      setError("");
      setMessage("");
      const result = await deleteAdminJob(job.id);
      setMessage(result?.message || "Vacante eliminada.");
      await loadJobs();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo eliminar la vacante.");
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2} flexWrap="wrap" rowGap={2}>
        <Box>
          <Typography variant="h4" fontWeight={900} mb={0.5}>
            Vacantes
          </Typography>
          <Typography color="text.secondary">
            Administra todas las vacantes publicadas por las empresas.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ borderRadius: 2, fontWeight: 800, textTransform: "none", whiteSpace: "nowrap" }}
        >
          Nueva vacante
        </Button>
      </Stack>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <TextField
          label="Buscar por título o empresa"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          fullWidth
        />

        <TextField select label="Estado" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="OPEN">Abierta</MenuItem>
          <MenuItem value="PAUSED">Pausada</MenuItem>
          <MenuItem value="CLOSED">Cerrada</MenuItem>
          <MenuItem value="DRAFT">Borrador</MenuItem>
        </TextField>

        <TextField select label="Empresa" value={companyId} onChange={(e) => setCompanyId(e.target.value)} sx={{ minWidth: 220 }}>
          <MenuItem value="">Todas</MenuItem>
          {companies.map((company) => (
            <MenuItem key={company.id} value={String(company.id)}>
              {company.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Paper sx={{ overflow: "auto", borderRadius: 3 }}>
        {loading ? (
          <Stack alignItems="center" p={5}>
            <CircularProgress size={24} />
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vacante</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Postulaciones</TableCell>
                <TableCell>Creada</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Typography fontWeight={800}>{job.title}</Typography>
                  </TableCell>
                  <TableCell>{job.company_name}</TableCell>
                  <TableCell>{job.location || "—"}</TableCell>
                  <TableCell>
                    <Chip size="small" label={STATUS_LABELS[job.status] || job.status} color={STATUS_COLORS[job.status] || "default"} />
                  </TableCell>
                  <TableCell>{job.applications_count}</TableCell>
                  <TableCell>{String(job.created_at).slice(0, 10)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(job)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(job)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {!jobs.length && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Alert severity="info">No hay vacantes que coincidan con los filtros.</Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <JobFormModal
        open={modalOpen}
        editingJob={editingJob}
        companies={companies}
        createFn={createAdminJob}
        updateFn={updateAdminJob}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </Box>
  );
}
