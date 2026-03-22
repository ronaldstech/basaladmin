import React, { useState, useMemo } from 'react';
import { Edit2, Trash, ArrowDown2, ArrowUp2, Add } from 'iconsax-react';

const DataTable = ({ title, columns, data, onEdit, onDelete, onAdd }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="card-table">
      <div className="table-header">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
        {onAdd && (
          <button 
            className="action-btn" 
            style={{ 
              padding: '0.625rem 1.25rem', 
              fontSize: '0.875rem', 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              gap: '0.5rem'
            }}
            onClick={onAdd}
          >
            <Add size={18} />
            <span>Add New</span>
          </button>
        )}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  onClick={() => requestSort(col.key)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {col.label}
                    <div style={{ display: 'flex', flexDirection: 'column', color: sortConfig.key === col.key ? '#6366f1' : '#9ca3af' }}>
                      {sortConfig.key === col.key && sortConfig.direction === 'asc' ? (
                        <ArrowUp2 size={14} variant="Bold" />
                      ) : sortConfig.key === col.key && sortConfig.direction === 'desc' ? (
                        <ArrowDown2 size={14} variant="Bold" />
                      ) : (
                        <div style={{ opacity: 0.3 }}><ArrowDown2 size={14} /></div>
                      )}
                    </div>
                  </div>
                </th>
              ))}
              <th style={{ width: '80px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, idx) => (
              <tr key={item.id || idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="action-btn" onClick={() => onEdit && onEdit(item)}>
                      <Edit2 size={16} color="currentColor" />
                    </button>
                    <button className="action-btn" onClick={() => onDelete && onDelete(item)}>
                      <Trash size={16} color="currentColor" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
