import React, { useEffect, useRef, useState } from 'react';
import './pinDetailModal.css';
import { useAuth } from '../context/AuthContext';

const PinDetailModal = ({ pin, onClose }) => {
  const modalRef = useRef(null);
  const [pinData, setPinData] = useState(pin);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const { getAuthHeaders, user } = useAuth();
  
  useEffect(() => {
    // Handle escape key to close modal
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    // Handle clicking outside to close modal
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  
  // Update state when pin prop changes
  useEffect(() => {
    setPinData(pin);
    setHasLiked(pin.hasLiked || false);
    
    // Check if the current user has liked this pin
    if (user && pin.likes) {
      setHasLiked(pin.likedBy?.includes(user._id) || false);
    }

    // Check bookmark status and count when pin changes
    if (pin && user) {
      checkBookmarkStatus();
      getBookmarkCount();
    }
  }, [pin, user]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/bookmarks/status/${pinData._id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        setHasBookmarked(result.data.isBookmarked);
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const getBookmarkCount = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/bookmarks/count/${pinData._id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        setBookmarkCount(result.data.count);
      }
    } catch (error) {
      console.error('Error getting bookmark count:', error);
    }
  };
  
  const handleImageClick = async () => {
    try {
      const response = await fetch(`/api/pinterest/pins/${pinData._id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const updatedPin = await response.json();
        setPinData(prevData => ({
          ...prevData,
          views: (prevData.views || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };
  
  const handleLikeClick = async () => {
    try {
      const endpoint = hasLiked ? 
        `http://localhost:3000/api/pinterest/pins/${pinData._id}/unlike` : 
        `http://localhost:3000/api/pinterest/pins/${pinData._id}/like`;
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Toggle like status
        const newLikeStatus = !hasLiked;
        setHasLiked(newLikeStatus);
        
        // Update like count locally
        const updatedPin = {
          ...pinData,
          likes: newLikeStatus ? (pinData.likes || 0) + 1 : (pinData.likes || 1) - 1,
          hasLiked: newLikeStatus
        };
        
        setPinData(updatedPin);
        
        // If the parent has a function to update pins, call it
        if (window.updatePinInParent) {
          window.updatePinInParent(updatedPin);
        }
      }
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleBookmarkClick = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/bookmarks/toggle/${pinData._id}`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const newBookmarkStatus = result.data.bookmarked;
        
        setHasBookmarked(newBookmarkStatus);
        
        // Update bookmark count locally
        setBookmarkCount(prevCount => 
          newBookmarkStatus ? prevCount + 1 : Math.max(0, prevCount - 1)
        );
        
        // Show success message (you can implement a toast notification here)
        console.log(result.message);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };
  
  if (!pinData) return null;
  
  return (
    <div className="modal-backdrop">
      <div className="pin-modal" ref={modalRef}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        
        <div className="pin-modal-content">
          <div className="pin-modal-image">
            <img 
              src={pinData.imageUrl} 
              alt={pinData.title} 
              onClick={handleImageClick}
              style={{ cursor: 'pointer' }}
            />
            
            {pinData.aiDetection?.isAIGenerated && (
              <div className="ai-badge modal-badge">This image is likely AI-Generated</div>
            )}
          </div>
          
          <div className="pin-modal-details">
            <h2 className="pin-modal-title">{pinData.title}</h2>
            
            <div className="pin-modal-meta">
              <div className="pin-modal-author">
                Posted by {pinData.author?.username || 'Anonymous'}
              </div>
              <div className="pin-modal-date">
                {new Date(pinData.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            {pinData.tags && pinData.tags.length > 0 && (
              <div className="pin-modal-tags">
                {pinData.tags.map((tag, index) => (
                  <span key={index} className="pin-tag">#{tag}</span>
                ))}
              </div>
            )}
            
            <div className="pin-modal-actions">
              <button 
                className={`action-button like-button ${hasLiked ? 'liked' : ''}`}
                onClick={handleLikeClick}
              >
                <span className="action-icon">❤️</span>
                <span className="action-text">
                  {hasLiked ? 'Liked' : 'Like'} ({pinData.likes || 0})
                </span>
              </button>
              
              <button 
                className={`action-button bookmark-button ${hasBookmarked ? 'bookmarked' : ''}`}
                onClick={handleBookmarkClick}
              >
                <span className="action-icon">🔖</span>
                <span className="action-text">
                  {hasBookmarked ? 'Bookmarked' : 'Bookmark'} ({bookmarkCount})
                </span>
              </button>
            </div>
            
            <div className="pin-modal-stats">
              <div className="pin-stat">
                👁️ {pinData.views || 0} views
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinDetailModal;