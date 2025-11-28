import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5001/api/admin';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState({ userCount: 0, venueCount: 0 });
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tab === 'analytics') fetchAnalytics();
    if (tab === 'users') fetchUsers();
    if (tab === 'venues') fetchVenues();
    if (tab === 'bookings') fetchBookings();
    // eslint-disable-next-line
  }, [tab]);

  async function fetchWithAuth(url) {
    const res = await fetch(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    return res.json();
  }

  async function fetchAnalytics() {
    setLoading(true); setError('');
    try {
      const data = await fetchWithAuth(`${API_BASE}/analytics`);
      console.log('Fetched analytics:', data);
      setAnalytics({
        userCount: typeof data.userCount === 'number' ? data.userCount : 0,
        venueCount: typeof data.venueCount === 'number' ? data.venueCount : 0
      });
    } catch (e) { setError('Failed to load analytics'); }
    setLoading(false);
  }
  async function fetchUsers() {
    setLoading(true); setError('');
    try {
      const data = await fetchWithAuth(`${API_BASE}/users`);
      console.log('Fetched users:', data);
      setUsers(Array.isArray(data) ? data : []);
      if (!Array.isArray(data)) setError('Failed to load users: Invalid data format');
    } catch (e) { setError('Failed to load users'); }
    setLoading(false);
  }
  async function fetchVenues() {
    setLoading(true); setError('');
    try {
      const data = await fetchWithAuth(`${API_BASE}/venues`);
      console.log('Fetched venues:', data);
      setVenues(Array.isArray(data) ? data : []);
      if (!Array.isArray(data)) setError('Failed to load venues: Invalid data format');
    } catch (e) { setError('Failed to load venues'); }
    setLoading(false);
  }
  async function fetchBookings() {
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:5001/api/admin/bookings', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
      if (!Array.isArray(data)) setError('Failed to load bookings: Invalid data format');
    } catch (e) { setError('Failed to load bookings'); }
    setLoading(false);
  }
  async function handleDeleteUser(id) {
    if (!window.confirm('Delete this user?')) return;
    await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    fetchUsers();
  }
  async function handleDeleteVenue(id) {
    if (!window.confirm('Delete this venue?')) return;
    await fetch(`${API_BASE}/venues/${id}`, { method: 'DELETE', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
    fetchVenues();
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="admin-tabs">
        <button onClick={() => setTab('analytics')} className={tab==='analytics'?'active':''}>Analytics</button>
        <button onClick={() => setTab('users')} className={tab==='users'?'active':''}>Users</button>
        <button onClick={() => setTab('venues')} className={tab==='venues'?'active':''}>Venues</button>
        <button onClick={() => setTab('bookings')} className={tab==='bookings'?'active':''}>Bookings</button>
      </div>
      <div className="admin-tab-content">
        {tab === 'analytics' && (
          <div className="analytics-section">
            <h2>Analytics</h2>
            {loading ? <p>Loading...</p> : (
              <div className="analytics-cards">
                <div className="card">Total Users: {analytics.userCount}</div>
                <div className="card">Total Venues: {analytics.venueCount}</div>
              </div>
            )}
            {error && <div className="error">{error}</div>}
          </div>
        )}
        {tab === 'users' && (
          <div className="users-section">
            <h2>All Users</h2>
            {loading ? <p>Loading...</p> : (
              Array.isArray(users) && users.length > 0 ? (
                <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>{u.firstName} {u.lastName}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td><button onClick={() => handleDeleteUser(u._id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody></table>
              ) : (
                <p>No users found.</p>
              )
            )}
            {error && <div className="error">{error}</div>}
          </div>
        )}
        {tab === 'venues' && (
          <div className="venues-section">
            <h2>All Venues</h2>
            {loading ? <p>Loading...</p> : (
              Array.isArray(venues) && venues.length > 0 ? (
                <table><thead><tr><th>Name</th><th>Location</th><th>Owner</th><th>Actions</th></tr></thead><tbody>
                  {venues.map(v => (
                    <tr key={v._id}>
                      <td>{v.name}</td>
                      <td>{v.location}</td>
                      <td>{v.owner || '-'}</td>
                      <td><button onClick={() => handleDeleteVenue(v._id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody></table>
              ) : (
                <p>No venues found.</p>
              )
            )}
            {error && <div className="error">{error}</div>}
          </div>
        )}
        {tab === 'bookings' && (
          <div className="bookings-section">
            <h2>All Bookings</h2>
            {loading ? <p>Loading...</p> : (
              Array.isArray(bookings) && bookings.length > 0 ? (
                <table><thead><tr>
                  <th>User</th>
                  <th>Venue</th>
                  <th>Type</th>
                  <th>Date(s)</th>
                  <th>Time/Days</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr></thead><tbody>
                  {bookings.map(b => (
                    <tr key={b._id} style={b.conflict ? {background:'#ffebee', color:'#b71c1c'} : {}}>
                      <td data-label="User">{b.user && (b.user.firstName ? `${b.user.firstName} ${b.user.lastName}` : b.user.email)}</td>
                      <td data-label="Venue">{b.venue && b.venue.name}</td>
                      <td data-label="Type">{b.bookingType === 'hour' ? 'By Hour' : 'By Day'}</td>
                      <td data-label="Date(s)">{b.bookingType === 'hour' ? b.date : `${b.date} to ${b.endDate}`}</td>
                      <td data-label="Time/Days">{b.bookingType === 'hour' ? `${b.startTime} - ${b.endTime} (${b.hours||''} hr)` : `${b.days||''} days`}</td>
                      <td data-label="Amount">₹{b.total}</td>
                      <td data-label="Status">{b.conflict ? <b style={{color:'#b71c1c'}}>CONFLICT</b> : 'OK'}</td>
                    </tr>
                  ))}
                </tbody></table>
              ) : (
                <p>No bookings found.</p>
              )
            )}
            {error && <div className="error">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
