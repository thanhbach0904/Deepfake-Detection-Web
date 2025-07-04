// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import FileUpload from './components/FileUpload';
import RealTimeDetection from './components/RealTimeDetection';
import Results from './components/Results';
import Login from './components/Login';
import Register from './components/Register';
import History from './components/History';
import UserProfile from './components/UserProfile'; 
import AdminDashboard from './components/AdminDashboard';
import PinterestFeed from './components/PinterestFeed';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DetectionProvider, useDetection } from './context/DetectionContext';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function AppContent() {
  const { user, logout } = useAuth();
  const { results, clearResults } = useDetection();

  return (
    <div className="app">
      <header className="header">
        <h1>Pinterest with AI DETECTION</h1>
        <nav>
          {user && <Link to="/pinterest">Pinterest Feed</Link>}
          {user && <Link to="/">Single File Detection</Link>}
          {/*<Link to="/realtime">Real-time Detection</Link>*/}
          {user && <Link to="/history">History</Link>}
          {user && <Link to="/profile">Profile</Link>}
          {user && user.role === 'admin' && <Link to="/admin">Admin</Link>}
          {user ? (
            <Link to="#" onClick={logout} className="nav-link logout-link">Logout</Link>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <FileUpload />
            </ProtectedRoute>
          } />
          
          <Route path="/pinterest" element={
            <ProtectedRoute>
              <PinterestFeed />
            </ProtectedRoute>
          } />
          
          <Route path="/realtime" element={
            <ProtectedRoute>
              <RealTimeDetection />
            </ProtectedRoute>
          } />
          
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Routes>

        {results && <Results results={results} onClose={clearResults} />}
      </main>

      <footer className="footer">
        <p>Deepfake Detection Web - An application for HUST Project 2 course - By NTT | Contact: 0915160546</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DetectionProvider>
          <AppContent />
        </DetectionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;