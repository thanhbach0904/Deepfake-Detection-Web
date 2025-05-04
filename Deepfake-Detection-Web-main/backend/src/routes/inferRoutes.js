const express = require('express');
const router = express.Router(); 
const upload = require('../middlewares/uploadMiddleware');
const { spawn } = require('child_process');
const path = require('path');

const backendDir = path.resolve(__dirname, '../../');

router.post('/image', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
  
    // Call the Python inference script for images
    const pythonProcess = spawn('python', ['image_infer.py', filePath]);
  
    pythonProcess.stdout.on('data', (data) => {
      const result = JSON.parse(data.toString());
      res.json({ result });
    });
  
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
      res.status(500).send('Error processing image');
    });
});

router.post('/video', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    
    const pythonProcess = spawn('python', [path.join(backendDir, 'inference/video_infer.py'), filePath]);
  
    pythonProcess.stdout.on('data', (data) => {
      const result = JSON.parse(data.toString());
      res.json({ result });
    });
  
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
      res.status(500).send('Error processing video');
    });
});

module.exports = router;