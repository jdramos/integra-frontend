import React, { useEffect, useState } from "react";
import { Alert, Box, Snackbar, Stack } from "@mui/material";

import CompanyFormDialog from "../../components/admin/CompanyFormDialog";

import {
  getAdminCompanies,
  getAdminDashboard,
  getAdminCompanyById,
  updateAdminCompanyStatus,
  createAdminCompany,
  updateAdminCompany,
} from "../../api/admin";


import AdminDashboardHeaderStats from "../../components/admin/AdminDashboardHeaderStats";
import CompaniesTable from "../../components/admin/CompaniesTable";
import CompanyDetailDialog from "../../components/admin/CompanyDetailDialog";
import CompanyStatusConfirmDialog from "../../components/admin/CompanyStatusConfirmDialog";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmReason, setConfirmReason] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardData, companiesData] = await Promise.all([
        getAdminDashboard(),
        getAdminCompanies(),
      ]);

      setStats(dashboardData || {});
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información del panel administrador.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewCompany = async (companyId) => {
    try {
      setDetailLoading(true);
      setDetailOpen(true);
      setSelectedCompany(null);

      const data = await getAdminCompanyById(companyId);
      setSelectedCompany(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el detalle de la empresa.");
    } finally {
      setDetailLoading(false);
    }
  };

  const openConfirm = (companyId, status) => {
    setConfirmAction({ companyId, status });
    setConfirmReason("");
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    if (confirmAction.status === "SUSPENDED" && !confirmReason.trim()) {
      setSnackbar({
        open: true,
        severity: "warning",
        message: "Debes indicar el motivo de suspensión.",
      });
      return;
    }

    await handleChangeCompanyStatus(
      confirmAction.companyId,
      confirmAction.status,
      confirmReason
    );

    setConfirmOpen(false);
    setConfirmAction(null);
    setConfirmReason("");
  };

  const handleCreateCompany = () => {
    setEditingCompany(null);
    setFormOpen(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setFormOpen(true);
  };

  const handleSaveCompany = async (payload) => {
    try {
      setFormLoading(true);

      if (editingCompany?.id) {
        await updateAdminCompany(editingCompany.id, payload);
        setSnackbar({
          open: true,
          severity: "success",
          message: "Empresa actualizada correctamente.",
        });
      } else {
        await createAdminCompany(payload);
        setSnackbar({
          open: true,
          severity: "success",
          message: "Empresa creada correctamente.",
        });
      }

      setFormOpen(false);
      setEditingCompany(null);
      await loadData();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        severity: "error",
        message: "No se pudo guardar la empresa.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleChangeCompanyStatus = async (companyId, status, reason = "") => {
    try {
      setActionLoading(true);

      await updateAdminCompanyStatus(companyId, status, reason);

      setSnackbar({
        open: true,
        severity: "success",
        message:
          status === "SUSPENDED"
            ? "Empresa suspendida correctamente."
            : "Estado de empresa actualizado correctamente.",
      });

      await loadData();

      if (detailOpen && selectedCompany?.id === companyId) {
        const data = await getAdminCompanyById(companyId);
        setSelectedCompany(data);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        severity: "error",
        message: "No se pudo cambiar el estado de la empresa.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ py: 0.5 }}>
      <Stack spacing={1.5}>

        {error && (
          <Alert severity="error" sx={{ borderRadius: 2, py: 0.5 }}>
            {error}
          </Alert>
        )}

        <AdminDashboardHeaderStats
          loading={loading}
          onRefresh={loadData}
          stats={stats}
        />


        <CompaniesTable
          companies={companies}
          loading={loading}
          actionLoading={actionLoading}
          onViewCompany={handleViewCompany}
          onChangeStatus={openConfirm}
          onCreateCompany={handleCreateCompany}
          onEditCompany={handleEditCompany}
        />
      </Stack>

      <CompanyFormDialog
        open={formOpen}
        company={editingCompany}
        loading={formLoading}
        onClose={() => {
          if (!formLoading) {
            setFormOpen(false);
            setEditingCompany(null);
          }
        }}
        onSave={handleSaveCompany}
      />

      <CompanyDetailDialog
        open={detailOpen}
        loading={detailLoading}
        company={selectedCompany}
        actionLoading={actionLoading}
        onClose={() => {
          setDetailOpen(false);
          setSelectedCompany(null);
        }}
        onChangeStatus={openConfirm}
      />

      <CompanyStatusConfirmDialog
        open={confirmOpen}
        action={confirmAction}
        reason={confirmReason}
        loading={actionLoading}
        onReasonChange={setConfirmReason}
        onClose={() => {
          if (!actionLoading) setConfirmOpen(false);
        }}
        onConfirm={handleConfirm}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}