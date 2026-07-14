import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setItem(null);
    fetch('/api/items/' + id)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setItem)
      .catch(() => navigate('/'));
  }, [id, navigate]);

  return (
    <div className="page">
      <Link to="/" className="back-link">&larr; Back to items</Link>

      {!item ? (
        <div className="detail-card" aria-busy="true" aria-live="polite">
          <div className="skeleton-bar" style={{ width: '40%', height: 22, marginBottom: 16 }} />
          <div className="skeleton-bar" style={{ width: '60%', marginBottom: 8 }} />
          <div className="skeleton-bar" style={{ width: '30%' }} />
        </div>
      ) : (
        <div className="detail-card">
          <h2>{item.name}</h2>
          <p><strong>Category:</strong> {item.category}</p>
          <p><strong>Price:</strong> ${item.price}</p>
        </div>
      )}
    </div>
  );
}

export default ItemDetail;
