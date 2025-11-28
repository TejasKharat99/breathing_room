import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5001';

export default function VenueOwnerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Call backend login API
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      // Check for venue_owner role
      if (data.user.role !== 'venue_owner') {
        throw new Error('Only venue owners can login here');
      }
      login(data.token);
      navigate('/venues/my');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="centered-form">
      <h2>Venue Owner Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <input type="email" placeholder="Venue Owner Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" style={{ marginTop: 16, alignSelf: 'stretch' }}>Login as Venue Owner</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
