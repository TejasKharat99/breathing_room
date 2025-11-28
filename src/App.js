import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import VenueOwnerDashboard from './pages/venueOwner/VenueOwnerDashboard';
import SearchVenues from './pages/user/SearchVenues';
import MyListings from './pages/venueOwner/MyListings';
import ListingDetails from './pages/user/ListingDetails';
import NotFound from './pages/NotFound';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import CombinedLoginPage from './pages/CombinedLoginPage';
import PaymentPage from './pages/user/PaymentPage';

function RoleRedirector() {
  const { user } = useAuth();
  if (!user) return <HomePage />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'venue_owner') return <Navigate to="/venues/my" />;
  return <Navigate to="/venues/find" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<RoleRedirector />} />
          <Route path="/login" element={<CombinedLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/venues/my" element={<VenueOwnerDashboard />} />
          <Route path="/venues/find" element={<SearchVenues />} />
          <Route path="/venues/listings/:id" element={<ListingDetails />} />
          <Route path="/venues/my-listings" element={<MyListings />} />
          <Route path="/venues/book/:id" element={<PaymentPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
