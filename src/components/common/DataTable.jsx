import { Edit2, Trash } from 'iconsax-react';

const DataTable = ({ title, columns, data, onEdit, onDelete }) => {
  return (
    <div className="card-table">
      <div className="table-header">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
        <button className="nav-item active" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          Add New
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th style={{ width: '80px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
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
