import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import JobCard from "./components/JobCard";
import JobFormModal from "./components/JobFormModal";
import ApplicantsModal from "./components/ApplicantsModal";
import { updateJobStatus } from "../../api/company";
import RecruitmentPipelineModal from "./components/RecruitmentPipelineModal";

const primary = "#0057B8";

export default function CompanyJobsTab({ jobs = [], onReload }) {
  const [openModal, setOpenModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [openApplicants, setOpenApplicants] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [jobToToggle, setJobToToggle] = useState(null);

  const [openPipeline, setOpenPipeline] = useState(false);
  const [pipelineJob, setPipelineJob] = useState(null);


  const handleCreate = () => {
    setEditingJob(null);
    setOpenModal(true);
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setOpenModal(true);
  };

  const handleApplicants = (job) => {
    setSelectedJob(job);
    setOpenApplicants(true);
  };

  const handleSaved = async () => {
    await onReload?.();
  };

const handleToggleStatus = (job) => {
  setJobToToggle(job);
  setConfirmOpen(true);
};

const handlePipeline = (job) => {
  setPipelineJob(job);
  setOpenPipeline(true);
};

const confirmToggleStatus = async () => {
  if (!jobToToggle) return;

  const newStatus = jobToToggle.status === "OPEN" ? "CLOSED" : "OPEN";

  await updateJobStatus(jobToToggle.id, newStatus);
  await onReload?.();

  setConfirmOpen(false);
  setJobToToggle(null);
};

  return (
    <>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
        mb={2}
      >
        <Box>
          <Typography variant="h6" fontWeight={900}>
            Vacantes publicadas
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Administra las oportunidades laborales de tu empresa.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ bgcolor: primary }}
          onClick={handleCreate}
        >
          Agregar vacante
        </Button>
      </Stack>

      <Stack spacing={2}>
        {jobs.length === 0 ? (
          <Alert severity="info">Todavía no has creado vacantes.</Alert>
        ) : (
          jobs.map((job) => (
         <JobCard
            key={job.id}
            job={job}
            onEdit={handleEdit}
            onApplicants={handleApplicants}
            onToggleStatus={handleToggleStatus}
            onPipeline={handlePipeline}
          />
          ))
        )}
      </Stack>

      <JobFormModal
        open={openModal}
        editingJob={editingJob}
        onClose={() => setOpenModal(false)}
        onSaved={handleSaved}
      />

      <ApplicantsModal
        open={openApplicants}
        job={selectedJob}
        onClose={() => setOpenApplicants(false)}
      />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle fontWeight={900}>
          {jobToToggle?.status === "OPEN" ? "Cerrar vacante" : "Reabrir vacante"}
        </DialogTitle>

        <DialogContent>
          <Typography>
            {jobToToggle?.status === "OPEN"
              ? "¿Seguro que deseas cerrar esta vacante? Ya no recibirá nuevas postulaciones."
              : "¿Seguro que deseas reabrir esta vacante? Volverá a estar visible para candidatos."}
          </Typography>

          <Typography mt={2} fontWeight={800}>
            {jobToToggle?.title}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            color={jobToToggle?.status === "OPEN" ? "warning" : "success"}
            onClick={confirmToggleStatus}
          >
            {jobToToggle?.status === "OPEN" ? "Sí, cerrar" : "Sí, reabrir"}
          </Button>
        </DialogActions>
      </Dialog>

      <RecruitmentPipelineModal
        open={openPipeline}
        job={pipelineJob}
        onClose={() => setOpenPipeline(false)}
      />

    </>
  );
}