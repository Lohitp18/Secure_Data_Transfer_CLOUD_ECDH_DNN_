import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { SecureUpload } from './pages/SecureUpload';
import { TransferStatus } from './pages/TransferStatus';
import { Logs } from './pages/Logs';

interface User {
  id: string;
  email: string;
  name: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token on app load
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, you'd validate the token with the server
      setIsAuthenticated(true);
      // Mock user data - in real app, decode from token or fetch from API
      setUser({
        id: '1',
        email: 'user@example.com',
        name: 'Demo User',
      });
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (token: string, userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          isAuthenticated={isAuthenticated}
          user={user || undefined}
          onLogout={handleLogout}
        />
        
        <Routes>
          <Route 
            path="/" 
            element={<Home isAuthenticated={isAuthenticated} />} 
          />
          
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/upload" replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          
          <Route 
            path="/upload" 
            element={
              isAuthenticated ? 
                <SecureUpload /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          <Route 
            path="/status" 
            element={
              isAuthenticated ? 
                <TransferStatus /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          <Route 
            path="/logs" 
            element={
              isAuthenticated ? 
                <Logs /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;