import React from 'react';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="homepage-container">
      <h1 className="homepage-title">Conference Space Rental Platform</h1>
      <p className="homepage-tagline">Find, List, and Inquire about Conference Spaces with Ease</p>
      <div className="homepage-info">
        <h2>Welcome to Breathing Room</h2>
        <p>
          Breathing Room is a modern web platform designed for individuals, companies, and venue owners who want to <b>find</b>, <b>list</b>, or <b>rent</b> conference spaces for meetings, events, and gatherings.<br/><br/>
          <b>For Users:</b> Effortlessly search for venues by location, budget, capacity, and amenities. Browse detailed listings, view photos, and send inquiries directly to venue owners. Booking is available for registered users only.<br/><br/>
          <b>For Venue Owners:</b> List your property, manage details and availability, and respond to inquiries from potential renters. All listings are verified to ensure authenticity.<br/><br/>
          <b>Why Choose Us?</b> <ul><li>Advanced search & filters</li><li>Secure, role-based access</li><li>Modern, user-friendly design</li><li>Transparent inquiry and booking system</li></ul>
        </p>
      </div>
    </div>
  );
}
