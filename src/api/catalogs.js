import api from './axios';

export const getCatalog = async (category) => {
  const { data } = await api.get(`/catalogs/${category}`);
  return data.data || [];
};

export const createCompanyCatalogItem = async (category, label) => {
  const { data } = await api.post(`/catalogs/${category}/items`, { label });
  return data.data;
};

// Admin

export const getCatalogCategories = async () => {
  const { data } = await api.get('/admin/catalogs');
  return data.data || [];
};

export const getCatalogItems = async (category) => {
  const { data } = await api.get(`/admin/catalogs/${category}`);
  return data.data || [];
};

export const createCatalogItem = async (category, payload) => {
  const { data } = await api.post(`/admin/catalogs/${category}`, payload);
  return data;
};

export const updateCatalogItem = async (id, payload) => {
  const { data } = await api.put(`/admin/catalogs/items/${id}`, payload);
  return data;
};

export const deleteCatalogItem = async (id) => {
  const { data } = await api.delete(`/admin/catalogs/items/${id}`);
  return data;
};
