const pinterestService = require('../services/pinterestService');

// Create a new pin
const createPin = async (req, res) => {
  try {
    const { title, tags, imageUrl, imageId, aiDetection } = req.body;
    
    if (!title || !imageUrl || !imageId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const pinData = {
      title,
      imageUrl,
      imageId,
      tags: tags || [],
      aiDetection,
      author: req.user._id // Assuming user info is attached by auth middleware
    };

    const pin = await pinterestService.createPin(pinData);
    
    res.status(201).json({
      success: true,
      data: pin
    });
  } catch (error) {
    console.error('Controller error creating pin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating pin'
    });
  }
};

// Get all pins with optional filtering
const getPins = async (req, res) => {
  try {
    const filters = {
      hideAI: req.query.hideAI === 'true',
      showOnlyAI: req.query.showOnlyAI === 'true',
      sortBy: req.query.sortBy || 'newest',
      tag: req.query.tag
    };

    const pins = await pinterestService.getPins(filters);
    
    res.status(200).json({
      success: true,
      count: pins.length,
      data: pins
    });
  } catch (error) {
    console.error('Controller error fetching pins:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching pins'
    });
  }
};

const uploadAndCreatePin = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
  
      const { title, tags } = req.body;
      let aiDetection = null;
      
      if (req.body.aiDetection) {
        try {
          aiDetection = JSON.parse(req.body.aiDetection);
        } catch (err) {
          console.error('Error parsing AI detection data:', err);
        }
      }
      
      // Upload file to Cloudinary
      const result = await pinterestService.uploadToCloudinary(req.file.path);
      
      // Create pin with Cloudinary data
      const pinData = {
        title,
        imageUrl: result.secure_url,
        imageId: result.public_id,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        aiDetection,
        author: req.user._id
      };
  
      const pin = await pinterestService.createPin(pinData);
      
      res.status(201).json({
        success: true,
        data: pin
      });
    } catch (error) {
      console.error('Controller error uploading and creating pin:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error uploading and creating pin'
      });
    }
};

// Get a single pin by ID
const getPinById = async (req, res) => {
  try {
    const { id } = req.params;
    const pin = await pinterestService.getPinById(id);
    
    // Increment view count when a pin is viewed
    await pinterestService.incrementPinViews(id);
    
    res.status(200).json({
      success: true,
      data: pin
    });
  } catch (error) {
    console.error('Controller error fetching pin:', error);
    
    if (error.message === 'Invalid pin ID' || error.message === 'Pin not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching pin'
    });
  }
};

// Get pins by user ID
const getUserPins = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const pins = await pinterestService.getPinsByUserId(userId);
    
    res.status(200).json({
      success: true,
      count: pins.length,
      data: pins
    });
  } catch (error) {
    console.error('Controller error fetching user pins:', error);
    
    if (error.message === 'Invalid user ID') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user pins'
    });
  }
};
//view a pin
const viewPin = async (req, res) => {
  try {
    const { id } = req.params;
    const pin = await pinterestService.viewPin(id);
    
    res.status(200).json({
      success: true,
      data: pin
    });
  } catch (error) {
    console.error('Controller error when view pin:', error);
    
    if (error.message === 'Invalid pin ID' || error.message === 'Pin not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error view pin'
    });
  }
};
// Like a pin
const likePin = async (req, res) => {
  try {
    const { id } = req.params;
    const pin = await pinterestService.togglePinLike(id, true);
    
    res.status(200).json({
      success: true,
      data: pin
    });
  } catch (error) {
    console.error('Controller error liking pin:', error);
    
    if (error.message === 'Invalid pin ID' || error.message === 'Pin not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error liking pin'
    });
  }
};

// Unlike a pin
const unlikePin = async (req, res) => {
  try {
    const { id } = req.params;
    const pin = await pinterestService.togglePinLike(id, false);
    
    res.status(200).json({
      success: true,
      data: pin
    });
  } catch (error) {
    console.error('Controller error unliking pin:', error);
    
    if (error.message === 'Invalid pin ID' || error.message === 'Pin not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error unliking pin'
    });
  }
};

// Delete a pin
const deletePin = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';
    
    await pinterestService.deletePin(id, req.user._id, isAdmin);
    
    res.status(200).json({
      success: true,
      message: 'Pin deleted successfully'
    });
  } catch (error) {
    console.error('Controller error deleting pin:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting pin'
    });
  }
};

module.exports = {
    createPin,
    getPins,
    getPinById,
    getUserPins,
    viewPin,
    likePin,
    unlikePin,
    deletePin,
    uploadAndCreatePin  
  };