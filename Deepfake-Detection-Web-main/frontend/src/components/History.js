import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './History.css';

const History = () => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeaders } = useAuth();
  
  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const response = await fetch('http://localhost:8000/detections/me', {
          headers: {
            ...getAuthHeaders()
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch detection history');
        }
        
        const data = await response.json();
        setDetections(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetections();
  }, []);
  
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
              key={detection.id} 
              className={`history-item ${detection.result.is_deepfake ? 'deepfake' : 'authentic'}`}
            >
              <div className="history-item-header">
                <h3>{detection.filename}</h3>
                <span className="detection-date">
                  {new Date(detection.created_at).toLocaleString()}
                </span>
              </div>
              
              <div className="history-item-content">
                <div className="history-result">
                  <span className="result-label">Result:</span>
                  <span className="result-value">
                    {detection.result.is_deepfake ? 'DEEPFAKE' : 'AUTHENTIC'}
                  </span>
                </div>
                
                <div className="history-probability">
                  <span className="probability-label">Probability:</span>
                  <span className="probability-value">
                    {Math.round(detection.result.deepfake_probability * 100)}%
                  </span>
                </div>
                
                <div className="history-confidence">
                  <span className="confidence-label">Confidence:</span>
                  <span className="confidence-value">
                    {Math.round(detection.result.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
