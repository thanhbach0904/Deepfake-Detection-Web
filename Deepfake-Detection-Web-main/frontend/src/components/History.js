import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './History.css';

const History = () => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, getAuthHeaders } = useAuth();
  const [effectiveUserId, setEffectiveUserId] = useState(null);
  //function to return type of the content: video or image
  const getContentType = (filePath) => {
    if (!filePath) return 'Unknown';
    
    const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || '';
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'];
    
    if (imageExtensions.includes(extension)) {
      return 'Image';
    } else {
      return 'Video';
    }
  };
  useEffect(() => {
    let idToSet = null;
    if (user) {
      if (user.id) {
        idToSet = user.id;
      } else if (user._id) {
        idToSet = user._id;
      } else if (user.data && user.data._id) {
        idToSet = user.data._id;
      }
    }

    if (!idToSet) {
      const storedUserString = localStorage.getItem('user');
      if (storedUserString) {
        try {
          const parsedUser = JSON.parse(storedUserString);
          if (parsedUser && parsedUser.data && parsedUser.data._id) {
            idToSet = parsedUser.data._id;
          } 
        } catch (e) {
          console.error("History.js: Failed to parse user from localStorage:", e);
        }
      }
    }
    setEffectiveUserId(idToSet);
  }, [user]);
  
  useEffect(() => {
    const fetchDetections = async (userIdToUse) => {
      try {
        const response = await fetch(`http://localhost:3000/api/roles/users/${userIdToUse}/history`, {
          headers: {
            ...getAuthHeaders()
          }
        });
        
        if (!response.ok) {
          let errorMsg = `Failed to fetch detection history (Status: ${response.status})`;
          try {
            const errorResult = await response.json();
            if (errorResult && errorResult.message) {
              errorMsg = errorResult.message;
            }
          } catch (e) { 
            // Ignore if response is not JSON or error parsing
          }
          throw new Error(errorMsg);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setDetections(result.data);
        } else {
          setDetections([]);
          if (result.message === 'This user has no history.') {
            console.log('No history found for user:', userIdToUse);
          } else {
            throw new Error(result.message || 'Failed to get history data');
          }
        }
      } catch (err) {
        console.error('History fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (effectiveUserId) {
      setLoading(true);
      setError(null);
      fetchDetections(effectiveUserId);
    } else {
      setDetections([]);
      setLoading(false);
      
      if (user && !effectiveUserId) {
        setError('User data is incomplete. Cannot fetch history.');
      } else if (!user && !localStorage.getItem('user')) {
        setError('Please log in to view your detection history.');
      } else {
        setError('User ID not available. Unable to fetch history.');
      }
    }
  }, [effectiveUserId, getAuthHeaders]);
  
  if (loading) {
    return <div className="history-loading">Loading detection history...</div>;
  }
  
  if (error) {
    return <div className="history-error">{error}</div>;
  }
  
  return (
    <div className="history-container">
      <h2>Your Detection History</h2>
      
      {detections.length === 0 ? (
        <p className="no-history">You haven't performed any detections yet.</p>
      ) : (
        <div className="history-list">
          {detections.map((detection) => (
            <div 
              key={detection._id} 
              className={`history-item ${detection.detection_result === 'deepfake' ? 'deepfake' : 'authentic'}`}
            >
              <div className="history-item-header">
                <h3>{getContentType(detection.content_uploaded)}&nbsp;</h3> 
                <span className="detection-date">
                  {new Date(detection.detection_time).toLocaleString()}
                </span>
              </div>
              
              <div className="history-item-content">
                <div className="history-result">
                  <span className="result-label">Result:</span>
                  <span className="result-value">
                    {detection.detection_result.toUpperCase()}
                  </span>
                </div>
                
                {detection.user_feedback && (
                  <div className="history-feedback">
                    <span className="feedback-label">Feedback:</span>
                    <span className="feedback-value">
                      {detection.user_feedback}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
