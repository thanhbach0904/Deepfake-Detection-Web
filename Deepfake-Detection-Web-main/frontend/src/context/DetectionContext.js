import React, { createContext, useState, useContext, useEffect } from 'react';

const DetectionContext = createContext();

export const DetectionProvider = ({ children }) => {
  // Get initial state from both localStorage and sessionStorage
  const [results, setResults] = useState(() => {
    // Try to get from sessionStorage first (for tab switching)
    const sessionResults = sessionStorage.getItem('detectionResults');
    if (sessionResults) {
      return JSON.parse(sessionResults);
    }
    
    // Fall back to localStorage (for page reloads/new sessions)
    const localResults = localStorage.getItem('detectionResults');
    return localResults ? JSON.parse(localResults) : null;
  });

  // Add event listener for page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible again, check sessionStorage
        const sessionResults = sessionStorage.getItem('detectionResults');
        if (sessionResults) {
          setResults(JSON.parse(sessionResults));
        }
      }
    };

    // Add event listener for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Save results to both localStorage and sessionStorage when they change
  useEffect(() => {
    if (results) {
      localStorage.setItem('detectionResults', JSON.stringify(results));
      sessionStorage.setItem('detectionResults', JSON.stringify(results));
    } else {
      localStorage.removeItem('detectionResults');
      sessionStorage.removeItem('detectionResults');
    }
  }, [results]);

  // Handle window beforeunload to ensure data is saved
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (results) {
        sessionStorage.setItem('detectionResults', JSON.stringify(results));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [results]);

  const handleResults = (newResults) => {
    setResults(newResults);
  };

  const clearResults = () => {
    setResults(null);
  };

  return (
    <DetectionContext.Provider value={{ results, handleResults, clearResults }}>
      {children}
    </DetectionContext.Provider>
  );
};

// Custom hook to use the detection context
export const useDetection = () => useContext(DetectionContext);