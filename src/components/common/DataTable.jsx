import React, { useState, useMemo } from 'react';
import { Edit2, Trash, ArrowDown2, ArrowUp2, Add } from 'iconsax-react';

const DataTable = ({ title, columns, data, onEdit, onDelete, onAdd }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    let items = [...data];
    if (sortConfig.key) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="card-table">
      {/* Header */}
      <div className="table-header">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
        {onAdd && (
          <button
            onClick={onAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1.1rem', borderRadius: '0.6rem', border: 'none',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            <Add size={17} />
            <span>Add New</span>
          </button>
        )}
      </div>

      {/* Sort bar (shown on mobile above cards) */}
      {sortedData.length > 0 && (
        <div className="sort-bar">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</span>
          {columns.map(col => (
            <button
              key={col.key}
              onClick={() => requestSort(col.key)}
              style={{
                padding: '0.3rem 0.7rem', borderRadius: '999px', border: '1px solid',
                borderColor: sortConfig.key === col.key ? 'var(--primary)' : 'var(--glass-border)',
                background: sortConfig.key === col.key ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: sortConfig.key === col.key ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}
            >
              {col.label}
              {sortConfig.key === col.key && (
                sortConfig.direction === 'asc' ? <ArrowUp2 size={11} /> : <ArrowDown2 size={11} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="desktop-table">
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => requestSort(col.key)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {col.label}
                      <span style={{ color: sortConfig.key === col.key ? 'var(--primary)' : 'var(--text-muted)', opacity: sortConfig.key === col.key ? 1 : 0.4 }}>
                        {sortConfig.key === col.key && sortConfig.direction === 'asc'
                          ? <ArrowUp2 size={12} variant="Bold" />
                          : <ArrowDown2 size={12} variant="Bold" />}
                      </span>
                    </div>
                  </th>
                ))}
                {(onEdit || onDelete) && <th style={{ width: '80px' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, idx) => (
                <tr key={item.id || idx}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(item[col.key], item) : (item[col.key] ?? '—')}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {onEdit && (
                          <button className="action-btn" onClick={() => onEdit(item)}>
                            <Edit2 size={15} color="currentColor" />
                          </button>
                        )}
                        {onDelete && (
                          <button className="action-btn" onClick={() => onDelete(item)}>
                            <Trash size={15} color="currentColor" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards">
        {sortedData.map((item, idx) => (
          <div key={item.id || idx} className="data-card">
            {columns.map((col) => (
              <div key={col.key} className="data-card-row">
                <span className="data-card-label">{col.label}</span>
                <span className="data-card-value">
                  {col.render ? col.render(item[col.key], item) : (item[col.key] ?? '—')}
                </span>
              </div>
            ))}
            {(onEdit || onDelete) && (
              <div className="data-card-actions">
                {onEdit && (
                  <button className="action-btn" onClick={() => onEdit(item)} style={{ flex: 1, justifyContent: 'center', gap: '0.4rem', padding: '0.5rem' }}>
                    <Edit2 size={15} color="currentColor" /> <span style={{ fontSize: '0.8rem' }}>Edit</span>
                  </button>
                )}
                {onDelete && (
                  <button className="action-btn" onClick={() => onDelete(item)} style={{ flex: 1, justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}>
                    <Trash size={15} color="currentColor" /> <span style={{ fontSize: '0.8rem' }}>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {sortedData.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No records found
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
