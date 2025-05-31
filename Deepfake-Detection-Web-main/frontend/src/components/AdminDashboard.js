import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { getAuthHeaders } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'deepfake', 'authentic'
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Fetch system stats and users
  useEffect(() => {
    const fetchDataForAdmin = async () => {
      try {
        // Fetch system stats
        const statsResponse = await fetch('http://localhost:3000/api/roles/stats', {
          headers: {
            ...getAuthHeaders()
          }
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch system statistics');
        }
        
        const statsData = await statsResponse.json();
        setSystemStats(statsData.data);
        
        // Fetch all users
        const usersResponse = await fetch('http://localhost:3000/api/roles/users', {
          headers: {
            ...getAuthHeaders()
          }
        });
        
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const usersData = await usersResponse.json();
        setUsers(usersData.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDataForAdmin();
  }, []);

  // Fetch selected user's history
  useEffect(() => {
    if (selectedUser) {
      const fetchUserHistory = async () => {
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:3000/api/roles/users/${selectedUser._id}/history`, {
            headers: {
              ...getAuthHeaders()
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch user history');
          }
          
          const data = await response.json();
          setUserHistory(data.data || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserHistory();
    }
  }, [selectedUser]);

  // Filter history based on criteria
  const getFilteredHistory = () => {
    let filtered = [...userHistory];
    
    // Filter by detection result
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.detection_result === filter);
    }
    
    // Filter by date range
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      filtered = filtered.filter(item => new Date(item.detection_time) >= fromDate);
    }
    
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999); // Set to end of day
      filtered = filtered.filter(item => new Date(item.detection_time) <= toDate);
    }
    
    return filtered;
  };

  if (loading && !selectedUser) {
    return <div className="admin-loading">Loading user data...</div>;
  }

  if (error && !selectedUser) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        {systemStats && (
          <div className="system-stats">
            <div className="stat-item">
              <span className="stat-label">Total Users:</span>
              <span className="stat-value">{systemStats.users.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Users:</span>
              <span className="stat-value">{systemStats.users.active}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Detections:</span>
              <span className="stat-value">{systemStats.detections.total}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="admin-content">
        <div className="user-list-container">
          <h3>System Users</h3>
          <div className="user-list">
            {users.map(user => (
              <div 
                key={user._id} 
                className={`user-list-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="user-list-name">{user.username}</div>
                <div className="user-list-role">{user.role}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="user-history-container">
          {selectedUser ? (
            <>
              <div className="user-history-header">
                <h3>History for {selectedUser.username}</h3>
                <div className="history-filters">
                  <div className="filter-group">
                    <label>Result:</label>
                    <select 
                      value={filter} 
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="deepfake">Deepfake</option>
                      <option value="authentic">Authentic</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>From:</label>
                    <input 
                      type="date" 
                      value={dateRange.from} 
                      onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                    />
                  </div>
                  
                  <div className="filter-group">
                    <label>To:</label>
                    <input 
                      type="date" 
                      value={dateRange.to} 
                      onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="history-loading">Loading history...</div>
              ) : (
                <div className="user-history-list">
                  {getFilteredHistory().length === 0 ? (
                    <p className="no-history">No history found matching the criteria.</p>
                  ) : (
                    getFilteredHistory().map(item => (
                      <div key={item._id} className={`history-item ${item.detection_result}`}>
                        <div className="history-item-header">
                          <span className="history-date">{new Date(item.detection_time).toLocaleString()}</span>
                          <span className={`history-result ${item.detection_result}`}>
                            {item.detection_result.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="history-item-details">
                          <div className="history-content">
                            <span>Content: {item.content_uploaded}</span>
                          </div>
                          
                          {item.user_feedback && (
                            <div className="history-feedback">
                              <span>Feedback: {item.user_feedback}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="select-user-prompt">
              <p>Select a user to view their detection history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;