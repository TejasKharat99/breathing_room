import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchVenues.css';

const API_BASE_URL = 'http://localhost:5001';

const AMENITIES = [
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

export default function SearchVenues() {
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [capacity, setCapacity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Preload all venues, but don't show until search
    const fetchVenues = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/venues`);
        const data = await res.json();
        setVenues(data);
      } catch (err) {
        setError('Failed to load venues');
      }
      setLoading(false);
    };
    fetchVenues();
  }, []);

  // Compute unique locations for dropdown
  const locationOptions = Array.from(new Set(venues.map(v => v.location).filter(Boolean)));

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSearch = () => {
    setSearchPerformed(true);
    let results = venues;
    if (location.trim()) {
      results = results.filter(v => v.location && v.location.toLowerCase().includes(location.trim().toLowerCase()));
    }
    if (budget) {
      results = results.filter(v => v.pricePerHour <= Number(budget) || v.pricePerDay <= Number(budget));
    }
    if (capacity) {
      results = results.filter(v => v.capacity >= Number(capacity));
    }
    if (selectedAmenities.length > 0) {
      results = results.filter(v => selectedAmenities.every(a => (v.amenities || []).includes(a)));
    }
    setFilteredVenues(results);
  };

  return (
    <div className="search-page-ui">
      <h1 className="search-title">Find Conference Spaces</h1>
      <div className="filters-ui">
        {/* Location Dropdown */}
        <select
          className="input-ui"
          value={location}
          onChange={e => setLocation(e.target.value)}
          style={{ minWidth: 180 }}
        >
          <option value="">Select Location</option>
          {locationOptions.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <input className="input-ui" placeholder="Budget (₹)" type="number" value={budget} onChange={e => setBudget(e.target.value)} />
        <input className="input-ui" placeholder="Capacity" type="number" value={capacity} onChange={e => setCapacity(e.target.value)} />
        <div className="amenities-group">
          <span className="amenities-label">Amenities:</span>
          <div className="amenities-checkboxes">
            {AMENITIES.map(amenity => (
              <label key={amenity} className="amenity-checkbox">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
        </div>
        <button className="search-btn" onClick={handleSearch}>Search</button>
      </div>
      <div className="results-ui">
        {loading && <div>Loading venues...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && searchPerformed && filteredVenues.length === 0 && <div>No venues found.</div>}
        {!loading && !error && !searchPerformed && <div style={{color:'#888'}}>Please enter your search criteria and click Search.</div>}
        {!loading && !error && searchPerformed && (
          <ul style={{listStyle:'none', padding:0, margin:0}}>
            {filteredVenues.map(v => (
              <li
                key={v._id}
                style={{marginBottom:24, display:'flex', alignItems:'flex-start', gap:18, background:'#f8f9fd', borderRadius:10, boxShadow:'0 2px 8px rgba(60,80,120,0.06)', padding:'16px 14px', cursor:'pointer', transition:'box-shadow 0.2s'}}
                onClick={() => navigate(`/venues/listings/${v._id}`)}
                onKeyDown={e => { if (e.key === 'Enter') navigate(`/venues/listings/${v._id}`); }}
                tabIndex={0}
                aria-label={`View details for ${v.name}`}
              >
                {v.image && (
                  <img src={v.image} alt={v.name} style={{ maxWidth: 120, maxHeight: 90, borderRadius: 8, marginRight: 8, flexShrink:0, background:'#eee' }} onError={e => e.target.style.display='none'} />
                )}
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontWeight:700, fontSize:'1.15rem', color:'#283593', marginBottom:4}}>{v.name}</div>
                  <div style={{color:'#444', fontSize:'0.98rem', marginBottom:2}}><b>Location:</b> {v.location}</div>
                  {v.description && (
                    <div style={{color:'#555', fontSize:'0.96rem', margin:'6px 0 6px 0', whiteSpace:'pre-line'}}>{v.description}</div>
                  )}
                  <div style={{color:'#444', fontSize:'0.98rem', marginBottom:2}}><b>Capacity:</b> {v.capacity}</div>
                  <div style={{color:'#444', fontSize:'0.98rem', marginBottom:2}}><b>Price:</b> ₹{v.pricePerHour}/hr, ₹{v.pricePerDay}/day</div>
                  {v.amenities && v.amenities.length > 0 && (
                    <div style={{color:'#555', fontSize:'0.96rem', marginBottom:2}}><b>Amenities:</b> {v.amenities.join(', ')}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
