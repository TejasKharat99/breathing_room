import React from 'react';
import LoginPage from './LoginPage';
import AdminLoginPage from './AdminLoginPage';
import VenueOwnerLoginPage from './VenueOwnerLoginPage';
import './CombinedLoginPage.css';

export default function CombinedLoginPage() {
  return (
    <div className="combined-login-container">
      <div className="login-card-wrapper">
        <LoginPage />
      </div>
      <div className="login-card-wrapper">
        <VenueOwnerLoginPage />
      </div>
      <div className="login-card-wrapper">
        <AdminLoginPage />
      </div>
    </div>
  );
}
