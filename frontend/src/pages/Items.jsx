import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList } from 'react-window';

const PAGE_SIZE = 100;
const ROW_HEIGHT = 32;
const LIST_HEIGHT = 480;
const SKELETON_ROWS = 8;

function Row({ index, style, data }) {
  const item = data[index];
  return (
    <div style={style}>
      <Link to={'/items/' + item.id} className="item-row">{item.name}</Link>
    </div>
  );
}

function Items() {
  const { items, total, page, totalPages, fetchItems } = useData();
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
    <div className="page">
      <label htmlFor="item-search" className="visually-hidden">Search items</label>
      <input
        id="item-search"
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
      />

      {/* Announced to screen readers whenever the result count changes */}
      <p className="status-text" role="status" aria-live="polite">
        {loading ? 'Searching…' : `${total} item${total === 1 ? '' : 's'} found`}
      </p>

      {loading ? (
        <div aria-hidden="true">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <div className="skeleton-row" key={i}>
              <div className="skeleton-bar" style={{ animationDelay: `${i * 0.05}s` }} />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="empty-state">No items found.</p>
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

      <nav className="pagination" aria-label="Pagination">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
          Prev
        </button>
        <span className="pagination__status">Page {page} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
          Next
        </button>
      </nav>
    </div>
  );
}

export default Items;
