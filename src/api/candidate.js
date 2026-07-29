import api from './axios';

export const getMyProfile = async () => {
  const { data } = await api.get('/candidate/me');
  return data.data;
};

export const getMyProfileViews = async () => {
  const { data } = await api.get('/candidate/me/profile-views');
  return data.data || [];
};

export const updateMyProfile = async (payload) => {
  const { data } = await api.put('/candidate/me', payload);
  return data.data;
};

export const uploadCandidateCv = async (file) => {
  const formData = new FormData();
  formData.append("cv", file);

  const res = await api.post("/candidate/me/cv", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data?.data || res.data;
};

export const getCandidateCvViewUrl = async () => {
  const res = await api.get("/candidate/me/cv/view");
  return res.data?.data || res.data;
};

export const getCandidateProfile = async (id) => {
  const res = await api.get(`/candidate/${id}/profile`);
  return res.data?.data || null;
};

export const getCandidateCvViewUrlForCompany = async (id) => {
  const res = await api.get(`/candidate/${id}/cv/view`);
  return res.data?.data || res.data;
};

export const getCandidateNotes = async (candidateId) => {
  const res = await api.get(`/candidates/${candidateId}/notes`);
  return res.data?.data || [];
};

export const createCandidateNote = async (candidateId, payload) => {
  const res = await api.post(
    `/candidates/${candidateId}/notes`,
    payload
  );

  return res.data?.data;
};

export const applyToJob = async (jobId) => {
  const res = await api.post(`/candidate/jobs/${jobId}/apply`);
  return res.data?.data || res.data;
};

export const deleteCandidateCv = async () => {
  const response = await api.delete("/candidate/me/cv");
  return response.data?.data || response.data;
};

export const uploadCandidatePhoto = async (file) => {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await api.post("/candidate/me/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.data || response.data;
};

export const uploadCandidateCover = async (file) => {
  const formData = new FormData();
  formData.append("cover", file);

  const response = await api.post("/candidate/me/cover", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.data || response.data;
};

export const parseCandidateCv = async () => {
  const response = await api.get("/candidate/me/cv/parse");
  return response.data?.data || response.data;
};

// Experiencia

export const getCandidateExperiences = async () => {
  const response = await api.get("/candidate/me/experiences");
  return response.data?.data || [];
};

export const createCandidateExperience = async (payload) => {
  const response = await api.post("/candidate/me/experiences", payload);
  return response.data?.data;
};

export const updateCandidateExperience = async (id, payload) => {
  const response = await api.put(`/candidate/me/experiences/${id}`, payload);
  return response.data?.data;
};

export const deleteCandidateExperience = async (id) => {
  const response = await api.delete(`/candidate/me/experiences/${id}`);
  return response.data?.data;
};

// Educación

export const getCandidateEducation = async () => {
  const response = await api.get("/candidate/me/education");
  return response.data?.data || [];
};

export const createCandidateEducation = async (payload) => {
  const response = await api.post("/candidate/me/education", payload);
  return response.data?.data;
};

export const updateCandidateEducation = async (id, payload) => {
  const response = await api.put(`/candidate/me/education/${id}`, payload);
  return response.data?.data;
};

export const deleteCandidateEducation = async (id) => {
  const response = await api.delete(`/candidate/me/education/${id}`);
  return response.data?.data;
};

// Certificaciones

export const getCandidateCertificates = async () => {
  const response = await api.get("/candidate/me/certificates");
  return response.data?.data || [];
};

export const createCandidateCertificate = async (payload) => {
  const response = await api.post("/candidate/me/certificates", payload);
  return response.data?.data;
};

export const updateCandidateCertificate = async (id, payload) => {
  const response = await api.put(`/candidate/me/certificates/${id}`, payload);
  return response.data?.data;
};

export const deleteCandidateCertificate = async (id) => {
  const response = await api.delete(`/candidate/me/certificates/${id}`);
  return response.data?.data;
};
