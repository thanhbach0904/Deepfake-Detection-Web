import React, { useEffect, useState, useRef } from 'react';
import './Results.css';

const Results = ({ results, onClose }) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
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

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
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
        {!feedbackSubmitted ? (
          <form onSubmit={handleFeedbackSubmit}>
            <p>Was this result correct?</p>
            <button type="submit" className="feedback-button">
              Yes
            </button>
            <button type="submit" className="feedback-button">
              No
            </button>
          </form>
        ) : (
          <p className="appreciation-message">Thank you so much for your feedback!</p>
        )}
      </div>
    </div>
  );
};

export default Results;