import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user, getAuthHeaders } = useAuth();
  const [profileData, setProfileData] = useState({
    statistics: { totalDetections: 0, deepfakeDetections: 0, authenticDetections: 0 },
    recentHistory: []
  });
  const [effectiveUser, setEffectiveUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //Do the same thing as the approach in History.js
  useEffect(() => {
    let userToSet = null;
    
    if (user) {
      // Check if user data is directly available
      if (user.username || user.email) {
        userToSet = user;
      } else if (user.data) {
        // User data is nested under 'data' field
        userToSet = user.data;
      }
    }

    // look at localStorage if auth context doesn't have complete user data
    if (!userToSet) {
      const storedUserString = localStorage.getItem('user');
      if (storedUserString) {
        try {
          const parsedUser = JSON.parse(storedUserString);
          if (parsedUser && parsedUser.data) {
            userToSet = parsedUser.data;
          } else if (parsedUser && (parsedUser.username || parsedUser.email)) {
            userToSet = parsedUser;
          }
        } catch (e) {
          console.error("UserProfile.js: Failed to parse user from localStorage:", e);
        }
      }
    }
    
    setEffectiveUser(userToSet);
  }, [user]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/profile/me', {
          headers: {
            ...getAuthHeaders()
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setProfileData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch profile data');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [getAuthHeaders]); // Removed effectiveUser dependency

  if (loading) {
    return <div className="profile-loading">Loading user profile...</div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  const { statistics, recentHistory } = profileData;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>User Profile</h2>
      </div>
      
      <div className="profile-details">
        <div className="profile-info">
          <h3>Account Information</h3>
          <p><strong>Username:</strong> {effectiveUser?.username || 'Loading...'}</p>
          <p><strong>Email:</strong> {effectiveUser?.email || 'Loading...'}</p>
          <p><strong>Role:</strong> {effectiveUser?.role || 'Loading...'}</p>
          {effectiveUser?.created_at && (
            <p><strong>Member since:</strong> {new Date(effectiveUser.created_at).toLocaleDateString()}</p>
          )}
        </div>
        
        <div className="profile-stats">
          <h3>Detection Statistics</h3>
          <p><strong>Total detections:</strong> {statistics.totalDetections}</p>
          <p><strong>Deepfakes detected:</strong> {statistics.deepfakeDetections}</p>
          <p><strong>Authentics detected:</strong> {statistics.authenticDetections}</p>
        </div>
      </div>
      
      <div className="profile-history">
        <h3>Recent Detection History</h3>
        {(!recentHistory || recentHistory.length === 0) ? (
          <p>No detection history found.</p>
        ) : (
          <div className="history-list">
            {recentHistory.map((item) => (
              <div key={item._id} className={`history-item ${item.detection_result}`}>
                <span className="history-date">{new Date(item.detection_time).toLocaleString()}</span>
                <span className="history-result">{item.detection_result.toUpperCase()}</span>
                <span className="history-feedback">
                  {item.user_feedback ? `Feedback: ${item.user_feedback}` : 'No feedback provided'}
                </span>
              </div>
            ))}
            <Link to="/history" className="view-all-link">View All History</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;