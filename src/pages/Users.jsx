import React from 'react';
import DataTable from '../components/common/DataTable';
import { users } from '../data/mockData';

const UsersPage = () => {
  const columns = [
    { 
      key: 'avatar', 
      label: 'Avatar',
      render: (val) => <img src={val} className="avatar-img" alt="avatar" />
    },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'joinedDate', label: 'Joined' },
  ];

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.875rem', textAlign: 'left', margin: '0 0 1.5rem' }}>User Management</h1>
      <DataTable 
        title="All Users" 
        columns={columns} 
        data={users} 
      />
    </div>
  );
};

export default UsersPage;
