import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";

import CandidateHeader from "./CandidateHeader";
import CandidateTabs from "./CanidateTabs";

import CandidateInformationTab from "./tabs/CandidateInformationTab";
import CandidateExperienceTab from "./tabs/CandidateExperienceTab";
import CandidateEducationTab from "./tabs/CandidateEducationTab";
import CandidateCertificatesTab from "./tabs/CandidateCertificatesTab";
import CandidateCvTab from "./tabs/CandidateCvTab";
import CandidatePreferencesTab from "./tabs/CandidatePreferencesTab";
import CandidateProfileViewsTab from "./tabs/CandidateProfileViewsTab";

import {
  getMyProfile,
  getMyProfileViews,
  updateMyProfile,
  uploadCandidatePhoto,
  uploadCandidateCover,
} from "../../../api/candidate";

const INITIAL_FORM = {
  name: "",
  headline: "",
  summary: "",
  location: "",
  experience_years: "",
  education_level: "",
  skills: "",
  cv_url: "",
  cv_original_name: "",
  photo_url: "",
  photo_key: "",
  cover_url: "",
  cover_key: "",

  birth_date: "",
  availability: "",
  job_type: "",
  work_mode: "",
  expected_salary: "",
  experience_level: "",
  professional_area: "",
  languages: "",
  has_driver_license: false,
  license_type: "",
  has_vehicle: false,
  willing_to_travel: false,
  willing_to_relocate: false,
  last_position: "",
  last_company: "",
  profile_status: "ACTIVE",
};

export default function CandidateProfilePage() {
  const [tab, setTab] = useState(0);

  const [form, setForm] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileViews, setProfileViews] = useState([]);
  const [viewsLoading, setViewsLoading] = useState(false);
  const [viewsLoaded, setViewsLoaded] = useState(false);

  const splitValue = (value) =>
    String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const skillsArray = useMemo(
    () => splitValue(form.skills),
    [form.skills]
  );

  const languagesArray = useMemo(
    () => splitValue(form.languages),
    [form.languages]
  );

  const setValue = (field, value) => {
    setMessage("");
    setError("");

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyProfile();

        setForm({
          ...INITIAL_FORM,
          ...data,

          experience_years: data?.experience_years ?? "",
          expected_salary: data?.expected_salary ?? "",

          birth_date: data?.birth_date
            ? String(data.birth_date).slice(0, 10)
            : "",

          has_driver_license:
            Number(data?.has_driver_license || 0) === 1,

          has_vehicle:
            Number(data?.has_vehicle || 0) === 1,

          willing_to_travel:
            Number(data?.willing_to_travel || 0) === 1,

          willing_to_relocate:
            Number(data?.willing_to_relocate || 0) === 1,
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "No se pudo cargar tu perfil."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (tab !== 6 || viewsLoaded) return;

    const loadViews = async () => {
      try {
        setViewsLoading(true);
        setError("");
        setProfileViews(await getMyProfileViews());
        setViewsLoaded(true);
      } catch (err) {
        setError(err?.response?.data?.message || "No se pudieron cargar las visitas a tu perfil.");
      } finally {
        setViewsLoading(false);
      }
    };

    loadViews();
  }, [tab, viewsLoaded]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      await updateMyProfile({
        ...form,

        experience_years:
          form.experience_years === ""
            ? 0
            : Number(form.experience_years),

        expected_salary:
          form.expected_salary === ""
            ? null
            : Number(form.expected_salary),

        has_driver_license:
          form.has_driver_license ? 1 : 0,

        has_vehicle:
          form.has_vehicle ? 1 : 0,

        willing_to_travel:
          form.willing_to_travel ? 1 : 0,

        willing_to_relocate:
          form.willing_to_relocate ? 1 : 0,

        license_type:
          form.has_driver_license
            ? form.license_type
            : "",
      });

      setMessage("Perfil actualizado correctamente.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo actualizar el perfil."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploadingPhoto(true);
      setError("");
      setMessage("");

      const data = await uploadCandidatePhoto(file);

      setForm((prev) => ({
        ...prev,
        photo_url: data.photo_url || "",
        photo_key: data.photo_key || prev.photo_key,
      }));

      setMessage("Foto de perfil actualizada.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo subir la foto."
      );
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploadingCover(true);
      setError("");
      setMessage("");

      const data = await uploadCandidateCover(file);

      setForm((prev) => ({
        ...prev,
        cover_url: data.cover_url || "",
        cover_key: data.cover_key || prev.cover_key,
      }));

      setMessage("Foto de portada actualizada.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo subir la portada."
      );
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <Paper
        sx={{
          p: 5,
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        <CircularProgress />

        <Typography mt={2} color="text.secondary">
          Cargando tu perfil...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CandidateHeader
        form={form}
        skills={skillsArray}
        uploadingPhoto={uploadingPhoto}
        uploadingCover={uploadingCover}
        onPhotoUpload={handlePhotoUpload}
        onCoverUpload={handleCoverUpload}
      />

      <CandidateTabs
        value={tab}
        onChange={setTab}
      />

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {tab === 0 && (
          <CandidateInformationTab
            form={form}
            setValue={setValue}
            skillsArray={skillsArray}
            languagesArray={languagesArray}
            saving={saving}
            onSave={handleSave}
          />
        )}

        {tab === 1 && (
          <CandidateExperienceTab
            form={form}
          />
        )}

        {tab === 2 && (
          <CandidateEducationTab
            form={form}
          />
        )}

        {tab === 3 && (
          <CandidateCertificatesTab />
        )}

        {tab === 4 && (
          <CandidateCvTab
            form={form}
            setForm={setForm}
            setMessage={setMessage}
            setError={setError}
          />
        )}

        {tab === 5 && (
          <CandidatePreferencesTab
            form={form}
            setValue={setValue}
            saving={saving}
            onSave={handleSave}
          />
        )}

        {tab === 6 && (
          <CandidateProfileViewsTab views={profileViews} loading={viewsLoading} />
        )}
      </Box>
    </Paper>
  );
}
