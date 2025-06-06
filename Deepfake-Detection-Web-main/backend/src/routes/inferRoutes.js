const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { spawn } = require('child_process');
const path = require('path');
const { saveHistoryController } = require('../controllers/historyControllers');
const History = require('../models/historyModel'); // Added missing import
const historyService = require('../services/historyService')
const backendDir = path.resolve(__dirname, '../../');

router.post('/image', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const userId = req.body.userId;

  // Call the Python inference script for images
  const pythonProcess = spawn('python', ['inference/image_infer.py', filePath]);

  pythonProcess.stdout.on('data', (data) => {
      try {
          const result = JSON.parse(data.toString());
          const detectionResult = result.fake_probability > result.real_probability ? 'deepfake' : 'authentic';
          
          // Send response directly to client first
          res.status(201).json({
              success: true,
              result: {
                  ...result,
                  detectionResult
              }
          });
          
          //due to error in the way this file send res to frontend and save, 
          //i will save the result directly without passing to the controllers
          historyService.saveHistory(userId, filePath, detectionResult)
              .then(() => {
                  console.log('History saved successfully');
              })
              .catch(err => {
                  console.error('Error saving history:', err);
              });
              
      } catch (err) {
          console.error('Error processing detection:', err);
          res.status(500).json({ error: 'Error processing image' });
      }
  });

  pythonProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
      res.status(500).send('Error processing image');
  });
});

router.post('/video', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const userId = req.body.userId || req.user?.id; // Extract userId from body or authenticated user

  if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
  }

  const pythonProcess = spawn('python', [path.join(backendDir, 'inference/video_infer.py'), filePath]);

  pythonProcess.stdout.on('data', (data) => {
      try {
          const result = JSON.parse(data.toString());
          const detectionResult = result.fake_probability > result.real_probability ? 'deepfake' : 'authentic';

          // Pass userId and detectionResult to saveHistoryController
          saveHistoryController(req, res, { userId, filePath, detectionResult });
      } catch (err) {
          console.error('Error parsing Python output:', err);
          res.status(500).send('Error processing video');
      }
  });

  pythonProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
      res.status(500).send('Error processing video');
  });
});

router.post('/feedback', async (req, res) => {
  const { userId, feedback } = req.body;
  console.log('Feedback request:', { userId, feedback });
  //check the input request
  if (!userId || !feedback) {
    return res.status(400).json({ message: 'User ID and feedback are required' });
  }

  try {
    //find the lastest detection history of given user
    const history = await History.findOne({ user_id: userId }).sort({ detection_time: -1 });

    if (!history) {
      return res.status(404).json({ message: 'No history found for the user' });
    }

    //update the feedback
    history.user_feedback = feedback;
    await history.save();

    res.status(200).json({ message: 'Feedback saved successfully' });
  } catch (err) {
    console.error('Error saving feedback:', err);
    res.status(500).json({ message: 'Error saving feedback' });
  }
});


module.exports = router;