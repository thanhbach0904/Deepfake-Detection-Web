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
  const [userPins, setUserPins] = useState([]);
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pinsLoading, setPinsLoading] = useState(true);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('posted'); // 'posted' or 'bookmarks'

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

    const fetchUserPins = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/pinterest/my-pins', {
          headers: {
            ...getAuthHeaders()
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user pins');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setUserPins(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch pins data');
        }
      } catch (err) {
        console.error('Pins fetch error:', err);
        // Don't set main error for pins, just log it
      } finally {
        setPinsLoading(false);
      }
    };

    const fetchUserBookmarks = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/bookmarks', {
          headers: {
            ...getAuthHeaders()
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user bookmarks');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setUserBookmarks(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch bookmarks data');
        }
      } catch (err) {
        console.error('Bookmarks fetch error:', err);
        // Don't set main error for bookmarks, just log it
      } finally {
        setBookmarksLoading(false);
      }
    };
    
    fetchUserProfile();
    fetchUserPins();
    fetchUserBookmarks();
  }, [getAuthHeaders]);

  const handleImageClick = (pin) => {
    setSelectedImage(pin);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const handleRemoveBookmark = async (pinId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/bookmarks/${pinId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Remove from local state
        setUserBookmarks(prevBookmarks => 
          prevBookmarks.filter(bookmark => bookmark.pin._id !== pinId)
        );
        
        // Close modal if it's showing the removed bookmark
        if (selectedImage && selectedImage._id === pinId) {
          closeImageModal();
        }
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

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

      {/* Images Section with Tabs */}
      <div className="profile-images-section">
        <div className="images-tabs">
          <button 
            className={`tab-button ${activeTab === 'posted' ? 'active' : ''}`}
            onClick={() => setActiveTab('posted')}
          >
            My Posted Images ({userPins.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            My Bookmarks ({userBookmarks.length})
          </button>
        </div>

        <div className="images-content">
          {activeTab === 'posted' && (
            <div className="posted-images-container">
              {pinsLoading ? (
                <p>Loading posted images...</p>
              ) : userPins.length === 0 ? (
                <div className="empty-state">
                  <p>No images posted yet.</p>
                  <p>Start sharing your images with the community!</p>
                </div>
              ) : (
                <div className="images-grid">
                  {userPins.map((pin) => (
                    <div
                      key={pin._id}
                      className="image-item"
                      onClick={() => handleImageClick(pin)}
                    >
                      {pin.aiDetection?.isAIGenerated && (
                        <div className="ai-badge">AI</div>
                      )}
                      <img
                        src={pin.imageUrl}
                        alt={pin.title}
                        className="grid-image"
                        loading="lazy"
                      />
                      <div className="image-overlay">
                        <div className="image-title">{pin.title}</div>
                        <div className="image-stats">
                          <span>👁️ {pin.views || 0}</span>
                          <span>❤️ {pin.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="bookmarks-container">
              {bookmarksLoading ? (
                <p>Loading bookmarked images...</p>
              ) : userBookmarks.length === 0 ? (
                <div className="empty-state">
                  <p>No bookmarks yet.</p>
                  <p>Start bookmarking images you like to see them here!</p>
                </div>
              ) : (
                <div className="images-grid">
                  {userBookmarks.map((bookmark) => (
                    <div
                      key={bookmark._id}
                      className="image-item bookmark-item"
                      onClick={() => handleImageClick(bookmark.pin)}
                    >
                      {bookmark.pin.aiDetection?.isAIGenerated && (
                        <div className="ai-badge">AI</div>
                      )}
                      <div className="bookmark-badge">🔖</div>
                      <img
                        src={bookmark.pin.imageUrl}
                        alt={bookmark.pin.title}
                        className="grid-image"
                        loading="lazy"
                      />
                      <div className="image-overlay">
                        <div className="image-title">{bookmark.pin.title}</div>
                        <div className="image-stats">
                          <span>👁️ {bookmark.pin.views || 0}</span>
                          <span>❤️ {bookmark.pin.likes || 0}</span>
                          <span>By {bookmark.pin.author?.username}</span>
                        </div>
                        <button
                          className="remove-bookmark-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBookmark(bookmark.pin._id);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={e => e.stopPropagation()}>
            <button className="image-modal-close" onClick={closeImageModal}>×</button>
            <img src={selectedImage.imageUrl} alt={selectedImage.title} className="image-modal-img" />
            <div className="image-modal-info">
              <h4>{selectedImage.title}</h4>
              <div className="image-modal-stats">
                <span>👁️ {selectedImage.views || 0} views</span>
                <span>❤️ {selectedImage.likes || 0} likes</span>
                <span>📅 {new Date(selectedImage.createdAt).toLocaleDateString()}</span>
                {selectedImage.author && (
                  <span>👤 By {selectedImage.author.username}</span>
                )}
              </div>
              {selectedImage.tags && selectedImage.tags.length > 0 && (
                <div className="image-modal-tags">
                  {selectedImage.tags.map((tag, index) => (
                    <span key={index} className="image-modal-tag">#{tag}</span>
                  ))}
                </div>
              )}
              {selectedImage.aiDetection?.isAIGenerated && (
                <div className="image-modal-ai-info">
                  <span className="ai-indicator">🤖 AI Generated ({Math.round(selectedImage.aiDetection.confidence * 100)}% confidence)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;