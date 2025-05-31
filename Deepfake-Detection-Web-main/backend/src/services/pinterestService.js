const PinterestPin = require('../models/pinterestModel');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinaryConfig');
const fs = require('fs');


const uploadToCloudinary = async (filePath) => {
    try {
      // Upload the image to the "pinterest-pins" folder in Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'pinterest-pins'
      });
      
      // Delete the local file after uploading to Cloudinary
      fs.unlinkSync(filePath);
      
      return result;
    } catch (error) {
      // Make sure to delete the local file even if upload fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
};
// Create a new pin
const createPin = async (pinData) => {
  try {
    const pin = await PinterestPin.create(pinData);
    return pin;
  } catch (error) {
    console.error('Error creating pin:', error);
    throw error;
  }
};

// Get pins with optional filtering
const getPins = async (filters = {}) => {
  try {
    let query = PinterestPin.find();
    
    // Apply filters
    if (filters.hideAI) {
      query = query.where('aiDetection.isAIGenerated').equals(false);
    }
    
    if (filters.showOnlyAI) {
      query = query.where('aiDetection.isAIGenerated').equals(true);
    }
    
    if (filters.tag) {
      query = query.where('tags').in([filters.tag]);
    }
    
    // Apply sorting
    if (filters.sortBy === 'newest') {
      query = query.sort({ createdAt: -1 });
    } else if (filters.sortBy === 'oldest') {
      query = query.sort({ createdAt: 1 });
    } else if (filters.sortBy === 'popular') {
      query = query.sort({ likes: -1 });
    }
    
    // Populate author information
    query = query.populate('author', 'username');
    
    const pins = await query.exec();
    return pins;
  } catch (error) {
    console.error('Error fetching pins:', error);
    throw error;
  }
};

// Get a single pin by ID
const getPinById = async (pinId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      throw new Error('Invalid pin ID');
    }
    
    const pin = await PinterestPin.findById(pinId).populate('author', 'username');
    if (!pin) {
      throw new Error('Pin not found');
    }
    
    return pin;
  } catch (error) {
    console.error('Error fetching pin:', error);
    throw error;
  }
};

// Get pins by user ID
const getPinsByUserId = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }
    
    const pins = await PinterestPin.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'username');
      
    return pins;
  } catch (error) {
    console.error('Error fetching user pins:', error);
    throw error;
  }
};

// Update pin view count
const incrementPinViews = async (pinId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      throw new Error('Invalid pin ID');
    }
    
    const pin = await PinterestPin.findByIdAndUpdate(
      pinId,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!pin) {
      throw new Error('Pin not found');
    }
    
    return pin;
  } catch (error) {
    console.error('Error incrementing views:', error);
    throw error;
  }
};
const viewPin = async (pinId) =>{
  try{
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      throw new Error('Invalid pin ID');
    }
    
    const pin = await PinterestPin.findByIdAndUpdate(
      pinId,
      { $inc: { views: 1} },
      { new: true }
    );
    
    if (!pin) {
      throw new Error('Pin not found');
    }
    
    return pin;
  }
  catch(error){
    console.error("Error when view the pin: ", error);
    throw error;
  }
};
// Like/unlike a pin
const togglePinLike = async (pinId, increment = true) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      throw new Error('Invalid pin ID');
    }
    
    const pin = await PinterestPin.findByIdAndUpdate(
      pinId,
      { $inc: { likes: increment ? 1 : -1 } },
      { new: true }
    );
    
    if (!pin) {
      throw new Error('Pin not found');
    }
    
    return pin;
  } catch (error) {
    console.error('Error toggling pin like:', error);
    throw error;
  }
};

// Delete a pin
const deletePin = async (pinId, userId, isAdmin = false) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      throw new Error('Invalid pin ID');
    }
    
    // If user is not admin, ensure they own the pin
    const query = isAdmin 
      ? { _id: pinId }
      : { _id: pinId, author: userId };
    
    const pin = await PinterestPin.findOneAndDelete(query);
    
    if (!pin) {
      throw new Error('Pin not found or you do not have permission to delete it');
    }
    
    return { message: 'Pin deleted successfully' };
  } catch (error) {
    console.error('Error deleting pin:', error);
    throw error;
  }
};

module.exports = {
    createPin,
    getPins,
    getPinById,
    getPinsByUserId,
    incrementPinViews,
    viewPin,
    togglePinLike,
    deletePin,
    uploadToCloudinary 
  };