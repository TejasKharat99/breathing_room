import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './VenueOwnerDashboard.css';

const API_BASE_URL = 'http://localhost:5001';
// Unified list of amenities matching SearchVenues.js
const AMENITIES_LIST = [
  'Projector',
  'Wi-Fi',
  'Catering',
  'Parking',
  'White Board',
  'Coffee',
  'Sound System',
  'Air Conditioning',
  'Video Conferencing',
  'Wheelchair Access',
  'Drinking Water'
];

export default function VenueOwnerDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({ name: '', location: '', capacity: '', amenities: [], pricePerHour: '', pricePerDay: '', description: '' });
  const [message, setMessage] = useState('');
  const [editingVenue, setEditingVenue] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (token) fetchMyVenues();
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (venues && venues.length > 0) {
      venues.forEach(v => {
        // Debug: log each venue's image field
        console.log(`Venue: ${v.name} | Image: ${v.image}`);
      });
    }
  }, [venues]);

  const fetchMyVenues = async () => {
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/venues/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setVenues([]);
        setMessage(data.error || 'Failed to load venues');
      } else {
        setVenues(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setMessage('Failed to load venues');
      setVenues([]);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAmenityChange = e => {
    const amenity = e.target.value;
    if (e.target.checked) {
      setForm({ ...form, amenities: [...form.amenities, amenity] });
    } else {
      setForm({ ...form, amenities: form.amenities.filter(a => a !== amenity) });
    }
  };

  const handleImageUrlChange = e => {
    setImageUrl(e.target.value);
  };

  const handleEditClick = (venue) => {
    setEditingVenue(venue._id);
    setForm({
      name: venue.name,
      location: venue.location,
      capacity: venue.capacity,
      amenities: venue.amenities || [],
      pricePerHour: venue.pricePerHour,
      pricePerDay: venue.pricePerDay,
      description: venue.description || ''
    });
    setMessage('Editing venue: ' + venue.name);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      let res, data;
      const payload = {
        ...form,
        image: imageUrl
      };
      if (editingVenue) {
        res = await fetch(`${API_BASE_URL}/api/venues/${editingVenue}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/venues`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }
      data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save venue');
      setMessage(editingVenue ? 'Venue updated successfully!' : 'Venue added successfully!');
      setForm({ name: '', location: '', capacity: '', amenities: [], pricePerHour: '', pricePerDay: '', description: '' });
      setEditingVenue(null);
      setImageUrl('');
      fetchMyVenues();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Delete venue
  const handleDeleteVenue = async (venueId) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/venues/${venueId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete venue');
      setMessage('Venue deleted successfully!');
      fetchMyVenues();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav className="dashboard-navbar">
        <span className="dashboard-title">Venue Owner Dashboard</span>
        {/* Removed the logout button from the dashboard navbar */}
      </nav>
      <div className="dashboard dashboard-flex">
        <div className="venue-form-section">
          <h2>Add a New Venue</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: 400, gap: 8 }}>
            <input name="name" placeholder="Venue Name" value={form.name} onChange={handleChange} required />
            <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
            <input name="capacity" placeholder="Capacity" type="number" value={form.capacity} onChange={handleChange} required />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Amenities:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px' }}>
                {AMENITIES_LIST.map(amenity => (
                  <label key={amenity} style={{ fontWeight: 400 }}>
                    <input
                      type="checkbox"
                      value={amenity}
                      checked={form.amenities.includes(amenity)}
                      onChange={handleAmenityChange}
                      style={{ marginRight: 4 }}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>
            <input name="pricePerHour" placeholder="Price Per Hour" type="number" value={form.pricePerHour} onChange={handleChange} required />
            <input name="pricePerDay" placeholder="Price Per Day" type="number" value={form.pricePerDay} onChange={handleChange} required />
            <input
              type="text"
              placeholder="Image URL (https://...)"
              value={imageUrl}
              onChange={handleImageUrlChange}
              style={{marginBottom:8}}
            />
            {imageUrl && (
              <img src={imageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 180, marginBottom: 8, borderRadius: 8 }} onError={e => e.target.style.display='none'} />
            )}
            <button
              className="edit-venue-btn"
              type="submit"
            >
              {editingVenue ? 'Update Venue' : 'Add Venue'}
            </button>
            {editingVenue && (
              <button
                className="cancel-venue-btn"
                type="button"
                style={{marginTop:4,background:'#bbb',color:'#222'}}
                onClick={() => { setEditingVenue(null); setForm({ name: '', location: '', capacity: '', amenities: [], pricePerHour: '', pricePerDay: '', description: '' }); setImageUrl(''); setMessage(''); }}
              >
                Cancel
              </button>
            )}
          </form>
          {message && <div style={{ margin: '12px 0', color: message.includes('success') ? 'green' : 'red' }}>{message}</div>}
        </div>
        <div className="venue-list-section">
          <h2>My Venues</h2>
          <ul>
            {venues.length === 0 && <li>No venues found.</li>}
            {venues.map(v => (
              <li key={v._id} style={{marginBottom:24, display:'flex', alignItems:'flex-start', gap:18, background:'#f8f9fd', borderRadius:10, boxShadow:'0 2px 8px rgba(60,80,120,0.06)', padding:'16px 14px'}}>
                {v.image && (
                  <img src={v.image} alt={v.name} style={{ maxWidth: 120, maxHeight: 90, borderRadius: 8, marginRight: 8, flexShrink:0, background:'#eee' }} onError={e => e.target.style.display='none'} />
                )}
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontWeight:700, fontSize:'1.15rem', color:'#283593', marginBottom:4}}>{v.name}</div>
                  <div style={{color:'#444', fontSize:'0.98rem', marginBottom:2}}><b>Location:</b> {v.location}</div>
                  <div style={{color:'#444', fontSize:'0.98rem', marginBottom:2}}><b>Capacity:</b> {v.capacity}</div>
                  <div style={{color:'#444', fontSize:'0.98rem', marginBottom:2}}><b>Price:</b> ₹{v.pricePerHour}/hr, ₹{v.pricePerDay}/day</div>
                  {v.amenities && v.amenities.length > 0 && (
                    <div style={{color:'#555', fontSize:'0.96rem', marginBottom:8, marginTop:8, display:'flex', flexWrap:'wrap', gap:'8px 10px', alignItems:'center'}}>
                      <b style={{marginRight:8}}>Amenities:</b>
                      {v.amenities.map((a, i) => (
                        <span key={i} style={{background:'#e3f2fd', color:'#1976d2', borderRadius:6, padding:'3px 10px', marginRight:3, fontWeight:500, fontSize:'0.95rem'}}>{a}</span>
                      ))}
                    </div>
                  )}
                  {v.description && (
                    <div style={{color:'#555', fontSize:'0.97rem', margin:'8px 0 4px 0', padding:'10px 12px', background:'#f6f8fa', borderRadius:7, whiteSpace:'pre-line'}}>
                      <b>Description:</b><br/>{v.description}
                    </div>
                  )}
                  <div style={{marginTop:8, display:'flex', justifyContent:'flex-end'}}>
                    <button style={{marginRight: 8}} onClick={() => handleEditClick(v)}>Edit</button>
                    <button className="delete-venue-btn" onClick={() => handleDeleteVenue(v._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
