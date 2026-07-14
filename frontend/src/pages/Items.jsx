import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList } from 'react-window';

const PAGE_SIZE = 100;
const ROW_HEIGHT = 32;
const LIST_HEIGHT = 480;

function Row({ index, style, data }) {
  const item = data[index];
  return (
    <div style={style}>
      <Link to={'/items/' + item.id}>{item.name}</Link>
    </div>
  );
}

function Items() {
  const { items, page, totalPages, fetchItems } = useData();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Debounce the search input so we don't fire a request per keystroke
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  // A new search term always restarts pagination at page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchItems({ q: debouncedSearch, page: currentPage, pageSize: PAGE_SIZE }, controller.signal)
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      })
      .finally(() => {
        // Ignore requests that were cancelled by a newer search/page change
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [fetchItems, debouncedSearch, currentPage]);

  return (
    <div style={{ padding: 16 }}>
      <input
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: 8, width: '100%', maxWidth: 320, marginBottom: 16 }}
      />

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <FixedSizeList
          height={LIST_HEIGHT}
          width="100%"
          itemCount={items.length}
          itemSize={ROW_HEIGHT}
          itemData={items}
        >
          {Row}
        </FixedSizeList>
      )}

      <div style={{ marginTop: 16 }}>
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
          Prev
        </button>
        <span style={{ margin: '0 12px' }}>Page {page} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default Items;
