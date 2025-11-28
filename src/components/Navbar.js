import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function hasRole(user, role) {
  if (!user) return false;
  if (Array.isArray(user.roles)) return user.roles.includes(role);
  return user.roles === role;
}

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/">Breathing Room</Link>
      <div className="nav-links">
        {user ? (
          <>
            {hasRole(user, 'admin') && <Link to="/admin/dashboard">Admin Dashboard</Link>}
            {hasRole(user, 'venue_owner') && <Link to="/venues/my">My Venues</Link>}
            <Link to="/venues/find">Find Venues</Link>
            <button className="delete-venue-btn" onClick={() => { logout(); window.location.href = '/login'; }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/venues/find">Find Venues</Link>
          </>
        )}
      </div>
    </nav>
  );
}
