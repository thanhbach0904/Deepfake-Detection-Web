import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import MasonryGrid from './MasonryGrid';
import PinDetailModal from './pinDetailModal';
import './PinterestFeed.css';

const PinterestFeed = () => {
  const { user, getAuthHeaders } = useAuth();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  // Upload form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [aiDetectionStatus, setAiDetectionStatus] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [userFeedback, setUserFeedback] = useState(null); // 'yes', 'no', or null
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [userDisputedAI, setUserDisputedAI] = useState(false);
  // Filter state
  const [filters, setFilters] = useState({
    hideAI: false,
    showOnlyAI: false,
    sortBy: 'newest', // newest, oldest, popular
    tagFilter: ''
  });
  
  // Modal state
  const [selectedPin, setSelectedPin] = useState(null);
  
  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    fetchPins();
    
    // Create a global function to allow pinDetailModal to update pins
    window.updatePinInParent = (updatedPin) => {
      setPins(prevPins => prevPins.map(p => p._id === updatedPin._id ? updatedPin : p));
    };
  }, [filters]);

  const fetchPins = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.hideAI) queryParams.append('hideAI', 'true');
      if (filters.showOnlyAI) queryParams.append('showOnlyAI', 'true');
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.tagFilter) queryParams.append('tag', filters.tagFilter);

      const response = await fetch(`http://localhost:3000/api/pinterest/pins?${queryParams}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pins');
      }

      const data = await response.json();
      setPins(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (16MB limit)
    if (file.size > 16 * 1024 * 1024) {
      setError('Image size must be less than 16MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    
    // Run AI detection
    runAIDetection(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, []);
  const getUserId = () => {
    if (user?.data?._id) return user.data._id;
    if (user?._id) return user._id;
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser?.data?._id;
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
      }
    }
    return null;
};
  const runAIDetection = async (file) => {
    try {
      setAiDetectionStatus('checking');
      setDetectionResult(null);
      setShowFeedback(false);
      setUserFeedback(null);
      setShowConfirmationMessage(false);
      setUserDisputedAI(false);

      const userId = getUserId();
      if (!userId) {
        setError('User ID not found');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const response = await fetch('http://localhost:3000/api/detect/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('AI detection failed');
      }

      const data = await response.json();
      const result = data.result;
      
      setDetectionResult(result);
      
      // Determine if content is AI-generated
      const isAIGenerated = result.fake_probability > result.real_probability;
      setAiDetectionStatus(isAIGenerated ? 'ai-generated' : 'authentic');
      
      // Show feedback if AI is detected
      if (isAIGenerated) {
        setShowFeedback(true);
      }
      
    } catch (err) {
      console.error('AI detection error:', err);
      setAiDetectionStatus('error');
      setError('Failed to analyze image for AI content');
    }
  };

  const handleFeedback = (response) => {
    setUserFeedback(response);
    setShowFeedback(false);
    
    if (response === 'no') {
      setUserDisputedAI(true);
      setAiDetectionStatus('disputed'); // New status for disputed AI detection
    }
  };

// ... existing code ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile || !title.trim()) {
      setError('Please provide both an image and a title');
      return;
    }

    // Show confirmation message if user disputed AI detection
    if (userDisputedAI) {
      setShowConfirmationMessage(true);
      // Hide message after 3 seconds
      setTimeout(() => {
        setShowConfirmationMessage(false);
      }, 3000);
    }
  
    setUploading(true);
    setError(null);
  
    try {
      // Create form data to send to backend
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      formData.append('tags', tags);
      
      // Add AI detection data if available
      if (detectionResult) {
        formData.append('aiDetection', JSON.stringify({
          isAIGenerated: userDisputedAI ? false : aiDetectionStatus === 'ai-generated',
          confidence: Math.max(detectionResult.fake_probability, detectionResult.real_probability),
          fakeProbability: detectionResult.fake_probability,
          realProbability: detectionResult.real_probability,
          userDisputed: userDisputedAI
        }));
      }
  
      //backend handle the Cloudinary upload
      const response = await fetch('http://localhost:3000/api/pinterest/pins/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create pin');
      }
  
      // Clear form and refresh pins
      clearForm();
      await fetchPins();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const clearForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle('');
    setTags('');
    setAiDetectionStatus(null);
    setDetectionResult(null);
    setShowFeedback(false);
    setUserFeedback(null);
    setShowConfirmationMessage(false);
    setUserDisputedAI(false);
    setError(null);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterType]: value };
      
      // Ensure hideAI and showOnlyAI are mutually exclusive
      if (filterType === 'hideAI' && value) {
        newFilters.showOnlyAI = false;
      } else if (filterType === 'showOnlyAI' && value) {
        newFilters.hideAI = false;
      }
      
      return newFilters;
    });
  };

  const handlePinClick = async (pin) => {
    // First set the pin to show modal immediately
    setSelectedPin(pin);
    
    // Increment view count when modal opens
    try {
      const response = await fetch(`http://localhost:3000/api/pinterest/pins/${pin._id}/view`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        // Update both the selected pin and the pin in the pins array
        const updatedPin = {...pin, views: (pin.views || 0) + 1};
        setSelectedPin(updatedPin);
        
        // Update the pin in the main pins array
        setPins(prevPins => prevPins.map(p => 
          p._id === pin._id ? updatedPin : p
        ));
      }
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };
  
  const closeModal = () => {
    setSelectedPin(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDetectionStatusText = (status) => {
    switch (status) {
      case 'checking': return 'Please wait for content analyze ...';
      case 'ai-generated': return 'AI-Generated Content Detected';
      case 'authentic': return 'Original Content';
      case 'error': return 'Could not analyze content';
      default: return '';
    }
  };

  if (loading && pins.length === 0) {
    return (
      <div className="pinterest-container">
        <div className="loading-grid">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pinterest-container">
      {/* Header */}
      <div className="pinterest-header">
        <h1 className="pinterest-title">Image Gallery</h1>
        <div className="header-controls">
          <span>📊 {pins.length} pins</span>
        </div>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <h2 className="upload-title">Share Your Image</h2>
        <form onSubmit={handleSubmit} className="upload-form">
          <div
            className={`file-drop-zone ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="preview-image" />
            ) : (
              <div>
                <p>📁 Drag & drop an image here or click to select</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  Supports: JPG, PNG, GIF (max 16MB)
                </p>
              </div>
            )}
          </div>
          
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />

{aiDetectionStatus && (
            <div className={`ai-detection-status ${aiDetectionStatus}`}>
              {getDetectionStatusText(aiDetectionStatus)}
              {detectionResult && aiDetectionStatus === 'ai-generated' && (
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Confidence: {Math.round(detectionResult.fake_probability * 100)}%
                </div>
              )}
            </div>
          )}

          {/* Feedback System */}
          {showFeedback && (
            <div className="feedback-container">
              <div className="feedback-question">
                <h4>AI Detection Feedback</h4>
                <p>Our system detected this image as AI-generated. Is this correct?</p>
              </div>
              <div className="feedback-buttons">
                <button 
                  className="feedback-btn feedback-yes"
                  onClick={() => handleFeedback('yes')}
                >
                  Yes
                </button>
                <button 
                  className="feedback-btn feedback-no"
                  onClick={() => handleFeedback('no')}
                >
                  No, my image is not AI
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Message */}
          {showConfirmationMessage && (
            <div className="confirmation-message">
              <div className="confirmation-content">
                <h4>Thank you for your feedback</h4>
                <p>Sorry for the inconvenience, we will check your image again and give you the result as soon as possible.</p>
              </div>
            </div>
          )}

          <div className="upload-input-group">
            <input
              type="text"
              placeholder="Give your image a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="upload-input"
              required
            />
          </div>

          <input
            type="text"
            placeholder="Add tags (comma separated) - e.g., nature, photography, sunset"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="tags-input"
          />

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="upload-button"
            disabled={uploading || !selectedFile || !title.trim()}
          >
            {uploading ? 'Uploading...' : 'Post !'}
          </button>
        </form>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <h3 className="filter-title">🔍 Filter & Sort</h3>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Content Type</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <label
                className={`filter-toggle ${filters.hideAI ? 'active' : ''}`}
                onClick={() => handleFilterChange('hideAI', !filters.hideAI)}
              >
                <input
                  type="checkbox"
                  checked={filters.hideAI}
                  onChange={() => {}}
                  className="filter-checkbox"
                />
                Hide AI Content
              </label>
              
              <label
                className={`filter-toggle ${filters.showOnlyAI ? 'active' : ''}`}
                onClick={() => handleFilterChange('showOnlyAI', !filters.showOnlyAI)}
              >
                <input
                  type="checkbox"
                  checked={filters.showOnlyAI}
                  onChange={() => {}}
                  className="filter-checkbox"
                />
                AI Only
              </label>
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Tag</label>
            <input
              type="text"
              placeholder="Enter tag..."
              value={filters.tagFilter}
              onChange={(e) => handleFilterChange('tagFilter', e.target.value)}
              className="filter-select"
              style={{ minWidth: '200px' }}
            />
          </div>
        </div>
      </div>

      {/* Pinterest Grid */}
      {loading ? (
        <div className="loading-grid">
          <div className="spinner"></div>
        </div>
      ) : pins.length === 0 ? (
        <div className="empty-state">
          <h3>🖼️ No pins found</h3>
          <p>Be the first to share an image or adjust your filters!</p>
        </div>
      ) : (
        <MasonryGrid pins={pins} onPinClick={handlePinClick} />
      )}
      
      {/* Pin Detail Modal */}
      {selectedPin && (
        <PinDetailModal pin={selectedPin} onClose={closeModal} />
      )}
    </div>
  );
};

export default PinterestFeed;