// Base URL for API requests
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Default API request headers
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
});

// Helper function for API requests
export const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getDefaultHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};
