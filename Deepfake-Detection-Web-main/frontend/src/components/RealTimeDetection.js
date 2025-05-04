import React, { useState, useEffect, useRef } from 'react';
import './RealTimeDetection.css';

const RealTimeDetection = ({ onResults }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [detection, setDetection] = useState(null);
  const wsRef = useRef(null);

  // Setup webcam
  const setupWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      return true;
    } catch (err) {
      console.error("Error accessing webcam:", err);
      return false;
    }
  };

  // Connect to WebSocket
  const connectWebSocket = () => {
    wsRef.current = new WebSocket('ws://localhost:8000/ws/detect');
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setDetection(data.result);
      onResults({
        ...data.result,
        fileType: 'realtime'
      });
    };
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  };
  
  // Send frames to WebSocket
  const sendFrame = () => {
    if (!isActive || !isConnected || !wsRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob and send through WebSocket
    canvas.toBlob((blob) => {
      wsRef.current.send(blob);
      
      // Request next frame
      requestAnimationFrame(sendFrame);
    }, 'image/jpeg', 0.8);
  };

  useEffect(() => {
    setupWebcam();
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Toggle detection
  const toggleDetection = () => {
    if (!isActive) {
      setIsActive(true);
      requestAnimationFrame(sendFrame);
    } else {
      setIsActive(false);
    }
  };

  return (
    <div className="realtime-container">
      <h2>Real-time DeepFake Detection</h2>
      
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="video-feed"
        />
        
        <canvas 
          ref={canvasRef}
          width={640}
          height={480}
          style={{ display: 'none' }}
        />
        
        {detection && (
          <div 
            className={`detection-overlay ${detection.is_deepfake ? 'deepfake' : 'authentic'}`}
          >
            {detection.is_deepfake ? 'DEEPFAKE DETECTED' : 'NO DEEPFAKE'}
            <div className="confidence">
              Confidence: {Math.round(detection.confidence * 100)}%
            </div>
          </div>
        )}
      </div>
      
      <button
        className={`detection-button ${isActive ? 'active' : ''}`}
        onClick={toggleDetection}
        disabled={!isConnected}
      >
        {isActive ? 'Stop Detection' : 'Start Detection'}
      </button>
      
      {!isConnected && (
        <div className="connection-status">
          Connecting to server...
        </div>
      )}
    </div>
  );
};

export default RealTimeDetection;