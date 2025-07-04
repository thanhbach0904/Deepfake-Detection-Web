const bookmarkService = require('../services/bookmarkService');

// Add a bookmark
const addBookmark = async (req, res) => {
  try {
    const { pinId } = req.params;
    const userId = req.user._id;

    const bookmark = await bookmarkService.addBookmark(userId, pinId);
    
    res.status(201).json({
      success: true,
      message: 'Bookmark added successfully',
      data: bookmark
    });
  } catch (error) {
    console.error('Controller error adding bookmark:', error);
    
    if (error.message === 'Invalid pin ID' || error.message === 'Pin not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'Pin already bookmarked') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding bookmark'
    });
  }
};

// Remove a bookmark
const removeBookmark = async (req, res) => {
  try {
    const { pinId } = req.params;
    const userId = req.user._id;

    const result = await bookmarkService.removeBookmark(userId, pinId);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Controller error removing bookmark:', error);
    
    if (error.message === 'Invalid pin ID' || error.message === 'Bookmark not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing bookmark'
    });
  }
};

// Get user's bookmarks
const getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user._id;
    const filters = {
      sortBy: req.query.sortBy || 'newest'
    };

    const bookmarks = await bookmarkService.getUserBookmarks(userId, filters);
    
    res.status(200).json({
      success: true,
      count: bookmarks.length,
      data: bookmarks
    });
  } catch (error) {
    console.error('Controller error fetching bookmarks:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching bookmarks'
    });
  }
};

// Check if a pin is bookmarked
const checkBookmarkStatus = async (req, res) => {
  try {
    const { pinId } = req.params;
    const userId = req.user._id;

    const isBookmarked = await bookmarkService.isBookmarked(userId, pinId);
    
    res.status(200).json({
      success: true,
      data: {
        isBookmarked
      }
    });
  } catch (error) {
    console.error('Controller error checking bookmark status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error checking bookmark status'
    });
  }
};

// Toggle bookmark
const toggleBookmark = async (req, res) => {
  try {
    const { pinId } = req.params;
    const userId = req.user._id;

    const result = await bookmarkService.toggleBookmark(userId, pinId);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        bookmarked: result.bookmarked
      }
    });
  } catch (error) {
    console.error('Controller error toggling bookmark:', error);
    
    if (error.message === 'Invalid pin ID' || error.message === 'Pin not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error toggling bookmark'
    });
  }
};

// Get bookmark count for a pin
const getBookmarkCount = async (req, res) => {
  try {
    const { pinId } = req.params;

    const count = await bookmarkService.getBookmarkCount(pinId);
    
    res.status(200).json({
      success: true,
      data: {
        count
      }
    });
  } catch (error) {
    console.error('Controller error getting bookmark count:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting bookmark count'
    });
  }
};

module.exports = {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  checkBookmarkStatus,
  toggleBookmark,
  getBookmarkCount
};