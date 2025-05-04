import React, { useState, useEffect } from 'react';
import './FileUpload.css';

const FileUpload = ({ onResults }) => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('image');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Retrieve userId from localStorage
    const storedUser = localStorage.getItem('user'); // Retrieve the full user object saved in localStorage
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.data._id); // See the response logged when logging in for more details
    } else {
      setError('User is not logged in');
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 16 * 1024 * 1024) {
        setError('File size exceeds 16MB limit.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
      setFileType(selectedFile.type.startsWith('image/') ? 'image' : 'video');
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }
    if (!userId) {
      setError('User ID is missing');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    try {
      const endpoint = fileType === 'image' ? '/detect/image' : '/detect/video';
      const response = await fetch(`http://localhost:3000/api${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await response.json();
      const resultData = {
        ...data.result,
        fileUrl: URL.createObjectURL(file),
        fileType,
      };
      
      setResult(resultData);
      onResults(resultData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Files for DeepFake Detection</h2>
      <form onSubmit={handleSubmit}>
        <div className="file-input-wrapper">
          <label htmlFor="file-upload" className="file-label">
            {file ? file.name : 'Choose File'}
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>
        <div className="file-type-selector">
          <label>
            <input
              type="radio"
              value="image"
              checked={fileType === 'image'}
              onChange={() => setFileType('image')}
            />
            Image
          </label>
          <label>
            <input
              type="radio"
              value="video"
              checked={fileType === 'video'}
              onChange={() => setFileType('video')}
            />
            Video
          </label>
        </div>
        <button type="submit" className="submit-button" disabled={!file || isLoading}>
          {isLoading ? <div className="spinner"></div> : 'Detect DeepFake'}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FileUpload;