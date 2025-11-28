import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <ul>
        <li>Overview of active listings</li>
        <li>User subscriptions & inquiries</li>
        <li>Analytics: views, inquiries, subscriptions</li>
        <li>Manage property listings</li>
        <li>Approve/verify listings</li>
        <li>Handle user disputes</li>
      </ul>
      <div className="coming-soon">(Functionality coming soon)</div>
    </div>
  );
}
