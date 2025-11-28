import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './PaymentPage.css';

const API_BASE_URL = 'http://localhost:5001';

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingType, setBookingType] = useState('hour');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [days, setDays] = useState(1);
  const [total, setTotal] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [bookingRecord, setBookingRecord] = useState(null);
  const receiptRef = useRef();

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

  useEffect(() => {
    if (!venue) return;
    if (bookingType === 'hour' && startTime && endTime) {
      // Calculate hours
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      let hours = endH + endM/60 - (startH + startM/60);
      if (hours < 0) hours = 0;
      setTotal(Math.ceil(hours * venue.pricePerHour));
    } else if (bookingType === 'day' && date && endDate) {
      // Calculate days between dates (inclusive)
      const d1 = new Date(date);
      const d2 = new Date(endDate);
      const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
      setDays(diff > 0 ? diff : 1);
      setTotal((diff > 0 ? diff : 1) * venue.pricePerDay);
    }
  }, [bookingType, startTime, endTime, days, venue, date, endDate]);

  async function handlePayment() {
    // Save booking to backend
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          venueId: venue._id,
          bookingType,
          date,
          endDate: bookingType === 'day' ? endDate : undefined,
          startTime: bookingType === 'hour' ? startTime : undefined,
          endTime: bookingType === 'hour' ? endTime : undefined,
          days: bookingType === 'day' ? days : undefined,
          hours: bookingType === 'hour' && startTime && endTime ? Math.ceil(((parseInt(endTime.split(':')[0]) + parseInt(endTime.split(':')[1])/60) - (parseInt(startTime.split(':')[0]) + parseInt(startTime.split(':')[1])/60))) : undefined,
          total
        })
      });
      if (!res.ok) throw new Error('Booking failed');
      const booking = await res.json();
      setBookingRecord(booking);
      setShowReceipt(true);
    } catch (e) {
      alert('Booking failed. Please try again.');
    }
  }

  function handlePrint() {
    if (receiptRef.current) {
      const printContents = receiptRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  }

  if (loading) return <div className="booking-container"><h2>Book Venue</h2><div>Loading...</div></div>;
  if (error) return <div className="booking-container"><h2>Book Venue</h2><div style={{color:'red'}}>{error}</div></div>;
  if (!venue) return <div className="booking-container"><h2>Book Venue</h2><div>No venue found.</div></div>;

  if (showReceipt) {
    return (
      <div className="booking-container" style={{textAlign:'center'}}>
        <div ref={receiptRef} style={{background:'#f7f8fa',padding:24,borderRadius:12,marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10}}>
            <span style={{fontWeight:800,fontSize:'2rem',color:'#1976d2',letterSpacing:'1px',marginRight:8}}>Breathing Room</span>
            <span style={{fontSize:'1.5rem',color:'#64b5f6',fontWeight:700}}>&#9670;</span>
          </div>
          <h2 style={{color:'#1a237e'}}>Payment Receipt</h2>
          <div style={{marginBottom:8}}><b>Venue:</b> {venue.name}</div>
          <div style={{marginBottom:8}}><b>Location:</b> {venue.location}</div>
          <div style={{marginBottom:8}}><b>Booking Type:</b> {bookingType === 'hour' ? 'By Hour' : 'By Day'}</div>
          {bookingType === 'hour' ? (
            <>
              <div><b>Date:</b> {date}</div>
              <div><b>Time:</b> {startTime} - {endTime}</div>
              <div><b>Hours:</b> {startTime && endTime ? Math.ceil(((parseInt(endTime.split(':')[0]) + parseInt(endTime.split(':')[1])/60) - (parseInt(startTime.split(':')[0]) + parseInt(startTime.split(':')[1])/60))) : ''}</div>
            </>
          ) : (
            <>
              <div><b>Start Date:</b> {date}</div>
              <div><b>End Date:</b> {endDate}</div>
              <div><b>Total Days:</b> {days}</div>
            </>
          )}
          <div style={{margin:'12px 0',fontWeight:600,fontSize:'1.1rem'}}><b>Total Paid:</b> ₹{total}</div>
          <div style={{margin:'8px 0',fontSize:'0.97rem',color:'#888'}}>Thank you for your booking!</div>
        </div>
        <button className="proceed-btn" onClick={handlePrint} style={{width:'auto',padding:'10px 28px'}}>Print Receipt</button>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <h2>Book {venue.name}</h2>
      <div className="booking-details">
        <b>Location:</b> {venue.location} <br/>
        <b>Capacity:</b> {venue.capacity} <br/>
        <b>Price:</b> ₹{venue.pricePerHour}/hr, ₹{venue.pricePerDay}/day
      </div>
      <div className="booking-type-group">
        <label>
          <input type="radio" name="bookingType" value="hour" checked={bookingType === 'hour'} onChange={() => setBookingType('hour')} /> Book by Hour
        </label>
        <label>
          <input type="radio" name="bookingType" value="day" checked={bookingType === 'day'} onChange={() => setBookingType('day')} /> Book by Day
        </label>
      </div>
      <form className="booking-form" onSubmit={e => { e.preventDefault(); handlePayment(); }}>
        {bookingType === 'hour' && (
          <>
            <label>
              Date: <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </label>
            <div style={{marginBottom:8}}>
              <label>Start Time: <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required /></label>
              <label style={{marginLeft:16}}>End Time: <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required /></label>
            </div>
          </>
        )}
        {bookingType === 'day' && (
          <>
            <label>
              Start Date: <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </label>
            <label style={{marginLeft:16}}>
              End Date: <input type="date" value={endDate} min={date} onChange={e => setEndDate(e.target.value)} required />
            </label>
            <div style={{marginTop:6, color:'#1565c0', fontWeight:500}}>
              {date && endDate && days > 0 && `Total Days: ${days}`}
            </div>
          </>
        )}
        <div className="total-amount">Total Amount: ₹{total}</div>
        <button
          className="proceed-btn"
          type="submit"
          disabled={total === 0 || (bookingType==='hour' && (!date || !startTime || !endTime)) || (bookingType==='day' && (!date || !endDate || days < 1))}
        >
          Proceed to Payment
        </button>
      </form>
    </div>
  );
}
