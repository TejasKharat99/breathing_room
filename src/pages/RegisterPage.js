import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5001';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    // If already logged in, redirect to home/dashboard
    if (token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate('/login'), 1500);
      return () => clearTimeout(timer);
    }
    if (alreadyRegistered) {
      const timer = setTimeout(() => navigate('/login'), 1800);
      return () => clearTimeout(timer);
    }
  }, [success, alreadyRegistered, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');
    setAlreadyRegistered(false);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone, email, password, role })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      setSuccess(true);
    } catch (err) {
      // If error is due to existing user, show message then redirect
      if (err.message && err.message.toLowerCase().includes('already')) {
        setAlreadyRegistered(true);
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="centered-form">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
        <input type="tel" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="user">Regular User</option>
          <option value="venue_owner">Venue Owner</option>
        </select>
        <button type="submit" style={{ marginTop: 16, alignSelf: 'stretch' }}>Register</button>
      </form>
      {success && <div className="success">Registration successful! Redirecting to login...</div>}
      {alreadyRegistered && <div className="error">Already registered as user. Redirecting to login...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
