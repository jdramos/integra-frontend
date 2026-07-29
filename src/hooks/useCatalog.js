import { useEffect, useState } from 'react';
import { getCatalog } from '../api/catalogs';

// Devuelve los ítems {value, label} de una categoría de catálogo.
// labels: array de solo las etiquetas (útil para Autocomplete con value=label).
export default function useCatalog(category) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    setLoading(true);

    getCatalog(category)
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category]);

  const labels = items.map((item) => item.label);

  return { items, labels, loading };
}
