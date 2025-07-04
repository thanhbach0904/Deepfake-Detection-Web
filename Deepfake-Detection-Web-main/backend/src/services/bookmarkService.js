const Bookmark = require('../models/bookmarkModel');
const PinterestPin = require('../models/pinterestModel');
const mongoose = require('mongoose');

// Add a bookmark
const addBookmark = async (userId, pinId) => {
  try {
    // Validate pin ID
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      throw new Error('Invalid pin ID');
    }

    // Check if pin exists
    const pin = await PinterestPin.findById(pinId);
    if (!pin) {
      throw new Error('Pin not found');
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({ user: userId, pin: pinId });
    if (existingBookmark) {
      throw new Error('Pin already bookmarked');
    }

    // Create bookmark
    const bookmark = await Bookmark.create({
      user: userId,
      pin: pinId
    });

    return bookmark;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    throw error;
  }
};

// Remove a bookmark
const removeBookmark = async (userId, pinId) => {
  try {
    // Validate pin ID
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      throw new Error('Invalid pin ID');
    }

    // Find and delete bookmark
    const bookmark = await Bookmark.findOneAndDelete({ user: userId, pin: pinId });
    
    if (!bookmark) {
      throw new Error('Bookmark not found');
    }

    return { message: 'Bookmark removed successfully' };
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
};

// Get user's bookmarks with pin details
const getUserBookmarks = async (userId, filters = {}) => {
  try {
    let query = Bookmark.find({ user: userId });

    // Apply sorting
    if (filters.sortBy === 'oldest') {
      query = query.sort({ createdAt: 1 });
    } else {
      query = query.sort({ createdAt: -1 }); // Default: newest first
    }

    // Populate pin details and author information
    query = query.populate({
      path: 'pin',
      populate: {
        path: 'author',
        select: 'username'
      }
    });

    const bookmarks = await query.exec();
    
    // Filter out bookmarks where pin might have been deleted
    const validBookmarks = bookmarks.filter(bookmark => bookmark.pin);
    
    return validBookmarks;
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    throw error;
  }
};

// Check if a pin is bookmarked by user
const isBookmarked = async (userId, pinId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      return false;
    }

    const bookmark = await Bookmark.findOne({ user: userId, pin: pinId });
    return !!bookmark;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
};

// Get bookmark count for a pin
const getBookmarkCount = async (pinId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      return 0;
    }

    const count = await Bookmark.countDocuments({ pin: pinId });
    return count;
  } catch (error) {
    console.error('Error getting bookmark count:', error);
    return 0;
  }
};

// Toggle bookmark (add if not exists, remove if exists)
const toggleBookmark = async (userId, pinId) => {
  try {
    const isCurrentlyBookmarked = await isBookmarked(userId, pinId);
    
    if (isCurrentlyBookmarked) {
      await removeBookmark(userId, pinId);
      return { bookmarked: false, message: 'Bookmark removed' };
    } else {
      await addBookmark(userId, pinId);
      return { bookmarked: true, message: 'Bookmark added' };
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
};

module.exports = {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  isBookmarked,
  getBookmarkCount,
  toggleBookmark
};