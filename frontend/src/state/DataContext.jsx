import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = useCallback(async ({ q = '', page = 1, pageSize = 10 } = {}, signal) => {
    const params = new URLSearchParams({ page, pageSize });
    if (q) params.set('q', q);

    const res = await fetch(`/api/items?${params}`, { signal });
    const json = await res.json();

    setItems(json.items);
    setTotal(json.total);
    setPage(json.page);
    setTotalPages(json.totalPages);
  }, []);

  return (
    <DataContext.Provider value={{ items, total, page, pageSize, totalPages, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
