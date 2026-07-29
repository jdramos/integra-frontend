import React, { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { createCompanyCatalogItem } from "../../api/catalogs";

export default function CreatableCatalogField({ category, options = [], value, onChange, label, multiple = false, required = false }) {
  const [localOptions, setLocalOptions] = useState(options);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setLocalOptions((current) => [...new Set([...options, ...current])]), [options]);

  const persist = async (candidate) => {
    const clean = String(candidate || "").trim();
    if (!clean) return "";
    const existing = localOptions.find((item) => item.toLowerCase() === clean.toLowerCase());
    if (existing) return existing;
    setSaving(true); setError("");
    try {
      const item = await createCompanyCatalogItem(category, clean);
      const saved = item?.label || clean;
      setLocalOptions((current) => [...new Set([...current, saved])]);
      return saved;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo agregar al catálogo");
      return "";
    } finally { setSaving(false); }
  };

  const handleChange = async (_, next) => {
    if (multiple) {
      const resolved = [];
      for (const item of next) { const saved = await persist(item); if (saved) resolved.push(saved); }
      onChange([...new Set(resolved)]);
    } else {
      onChange(next ? await persist(next) : "");
    }
  };

  return <Autocomplete freeSolo multiple={multiple} options={localOptions} value={value}
    onChange={handleChange} disabled={saving}
    renderInput={(params) => <TextField {...params} label={label} required={required}
      error={Boolean(error)} helperText={error || "Selecciona una opción o escribe una nueva y presiona Enter"}
      InputProps={{ ...params.InputProps, endAdornment: <>{saving && <CircularProgress size={18} />}{params.InputProps.endAdornment}</> }} />} />;
}
