import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import './ListingDetails.css';

const API_BASE_URL = 'http://localhost:5001';

export default function ListingDetails() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchVenue() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/venues/${id}`);
        if (!res.ok) throw new Error('Venue not found');
        const data = await res.json();
        setVenue(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchVenue();
  }, [id]);

  if (!user) {
    return (
      <div className="listing-details">
        <h2>Venue Details</h2>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>You must register as a regular user to book this venue.</span>
          <button onClick={() => navigate('/register')}>Register</button>
          <span>Already registered?</span>
          <button onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
    );
  }
  if (user.role === 'admin' || user.role === 'venue_owner') {
    return (
      <div className="listing-details">
        <h2>Venue Details</h2>
        <div>Only regular users can book venues. Please log in as a regular user.</div>
      </div>
    );
  }
  // Regular user: show booking UI
  if (loading) {
    return <div className="listing-details"><h2>Venue Details</h2><div>Loading...</div></div>;
  }
  if (error) {
    return <div className="listing-details"><h2>Venue Details</h2><div style={{color:'red'}}>{error}</div></div>;
  }
  if (!venue) {
    return <div className="listing-details"><h2>Venue Details</h2><div>No venue found.</div></div>;
  }
  return (
    <div className="listing-details">
      <h2>{venue.name}</h2>
      {venue.image && (
        <img src={venue.image} alt={venue.name} style={{ maxWidth: 320, maxHeight: 180, borderRadius: 10, marginBottom: 16, background:'#eee' }} onError={e => e.target.style.display='none'} />
      )}
      <div style={{marginBottom:8}}><b>Location:</b> {venue.location}</div>
      <div style={{marginBottom:8}}><b>Capacity:</b> {venue.capacity}</div>
      <div style={{marginBottom:8}}><b>Price:</b> ₹{venue.pricePerHour}/hr, ₹{venue.pricePerDay}/day</div>
      {venue.amenities && venue.amenities.length > 0 && (
        <div style={{marginBottom:8}}><b>Amenities:</b> {venue.amenities.join(', ')}</div>
      )}
      {venue.description && (
        <div style={{marginBottom:8}}><b>Description:</b> <span style={{whiteSpace:'pre-line'}}>{venue.description}</span></div>
      )}
      <button onClick={() => navigate(`/venues/book/${venue._id}`)}>Book Now</button>
    </div>
  );
}
