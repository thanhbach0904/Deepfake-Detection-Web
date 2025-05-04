// frontend/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import FileUpload from './components/FileUpload';
import RealTimeDetection from './components/RealTimeDetection';
import Results from './components/Results';
import Login from './components/Login';
import Register from './components/Register';
import History from './components/History';
import { AuthProvider, useAuth } from './context/AuthContext';

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

function AppContent() {
  const [results, setResults] = useState(null);
  const { user, login, logout } = useAuth();

  const handleResults = (newResults) => {
    setResults(newResults);
  };

  //clear the results after detected
  const handleCloseResults = () => {
    setResults(null);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>DeepFake Detector</h1>
        <nav>
          <Link to="/">Upload Files</Link>
          <Link to="/realtime">Real-time Detection</Link>
          {user && <Link to="/history">History</Link>}
          {user ? (
            <div className="user-menu">
              <span className="username">{user.username}</span>
              <button onClick={logout} className="logout-button">Logout</button>
            </div>
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
              <FileUpload onResults={handleResults} />
            </ProtectedRoute>
          } />
          
          <Route path="/realtime" element={
            <ProtectedRoute>
              <RealTimeDetection onResults={handleResults} />
            </ProtectedRoute>
          } />
          
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
        </Routes>

        {/* Pass the onClose function to the Results component */}
        {results && <Results results={results} onClose={handleCloseResults} />}
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
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;