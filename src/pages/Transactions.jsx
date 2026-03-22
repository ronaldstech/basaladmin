import React from 'react';
import DataTable from '../components/common/DataTable';
import { transactions } from '../data/mockData';

const TransactionsPage = () => {
  const columns = [
    { key: 'id', label: 'Transaction ID' },
    { key: 'user', label: 'User' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Date' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <span className={`badge badge-${val.toLowerCase()}`}>{val}</span>
      )
    },
    { key: 'method', label: 'Method' },
  ];

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.875rem', textAlign: 'left', margin: '0 0 1.5rem' }}>Transactions</h1>
      <DataTable 
        title="Payment History" 
        columns={columns} 
        data={transactions} 
      />
    </div>
  );
};

export default TransactionsPage;
