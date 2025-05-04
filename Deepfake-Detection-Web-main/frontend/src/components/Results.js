import React, { useEffect, useState, useRef } from 'react';
import './Results.css';

const Results = ({ results, onClose }) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null); // Create a reference for the results container

  if (!results) return null;

  const { fake_probability, real_probability, fileUrl, fileType } = results;

  const fakeProbabilityPercent = Math.round(fake_probability * 100);
  const realProbabilityPercent = Math.round(real_probability * 100);

  // Automatically close the results window when the user switches tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onClose();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onClose]);

  // Scroll to the results container when results are updated
  useEffect(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results]);

  const isDeepfake = fakeProbabilityPercent > realProbabilityPercent;

  const saveFeedback = async (feedback) => {
    // Get userId from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('User is not logged in');
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    const userId = parsedUser.data._id;
    
    try {
      console.log(`Sending feedback: ${feedback} for user: ${userId}`);
      
      const response = await fetch('http://localhost:3000/api/detect/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, feedback }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save feedback');
      }
  
      setFeedbackSubmitted(true);
      console.log('Feedback saved successfully');
    } catch (err) {
      console.error('Error saving feedback:', err);
      setError(`Failed to save feedback: ${err.message}`);
    }
  };

  const handleFeedbackSubmit = (feedback) => {
    saveFeedback(feedback);
  };

  return (
    <div
      ref={resultsRef} // Attach the reference to the results container
      className={`results-container ${isDeepfake ? 'deepfake' : 'authentic'}`}
    >
      <button className="close-button" onClick={onClose}>
        Close
      </button>
      <h2>Detection Results</h2>

      <div className="result-summary">
        <div className={`result-verdict ${isDeepfake ? 'deepfake' : 'authentic'}`}>
          {isDeepfake ? 'DEEPFAKE DETECTED' : 'AUTHENTIC CONTENT'}
        </div>
        <div className="confidence-meter">
          <div className="meter-bar">
            <div
              className="meter-fill"
              style={{ width: `${realProbabilityPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {fileUrl && fileType === 'image' && (
        <div className="media-preview">
          <img src={fileUrl} alt="Analyzed content" />
        </div>
      )}

      {fileUrl && fileType === 'video' && (
        <div className="media-preview">
          <video src={fileUrl} controls />
        </div>
      )}

      <div className="feedback-section">
        {error && <p className="error-message">{error}</p>}
        
        {!feedbackSubmitted ? (
          <div>
            <p>Was this result correct?</p>
            <button 
              onClick={() => handleFeedbackSubmit('correct')} 
              className="feedback-button"
            >
              Yes
            </button>
            <button 
              onClick={() => handleFeedbackSubmit('incorrect')} 
              className="feedback-button"
            >
              No
            </button>
          </div>
        ) : (
          <p className="appreciation-message">Thank you so much for your feedback!</p>
        )}
      </div>
    </div>
  );
};

export default Results;