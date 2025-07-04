import React, { useEffect, useRef, useState } from 'react';
import './MasonryGrid.css';

const MasonryGrid = ({ pins, onPinClick }) => {
  const gridRef = useRef(null);
  const [columns, setColumns] = useState(4);
  
  // Determine number of columns based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setColumns(1);
      } else if (width < 768) {
        setColumns(2);
      } else if (width < 1200) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Function to arrange pins into column arrays
  const arrangeInColumns = () => {
    // Create an array of column arrays
    const columnArrays = Array.from({ length: columns }, () => []);
    
    // Distribute pins across columns by height
    pins.forEach((pin, index) => {
      // Place pin in the shortest column
      const shortestColumnIndex = columnArrays
        .map(column => column.reduce((height, pin) => height + pin.height || 300, 0))
        .reduce((shortestIndex, height, index, heights) => 
          height < heights[shortestIndex] ? index : shortestIndex, 0);
      
      columnArrays[shortestColumnIndex].push(pin);
    });
    
    return columnArrays;
  };
  
  const columnArrays = arrangeInColumns();
  
  return (
    <div className="masonry-grid" ref={gridRef} style={{ '--columns': columns }}>
      {columnArrays.map((column, columnIndex) => (
        <div key={`column-${columnIndex}`} className="masonry-column">
          {column.map(pin => (
            <div
              key={pin._id}
              className="masonry-item"
              onClick={() => onPinClick(pin)}
            >
              {pin.aiDetection?.isAIGenerated && (
                <div className="ai-badge">AI</div>
              )}
              
              <img
                src={pin.imageUrl}
                alt={pin.title}
                className="masonry-image"
                loading="lazy"
              />
              
              <div className="masonry-overlay">
                <div style={{ color: 'white' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {pin.title}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    By {pin.author?.username || 'Anonymous'}
                  </div>
                </div>
              </div>

              <div className="masonry-content">
                <h4 className="masonry-title">{pin.title}</h4>
                
                {pin.tags && pin.tags.length > 0 && (
                  <div className="masonry-tags">
                    {pin.aiDetection?.isAIGenerated && (
                      <span className="masonry-tag ai-tag">AI</span>
                    )}
                    {pin.tags.map((tag, index) => (
                      <span key={index} className="masonry-tag">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="masonry-meta">
                  <span className="masonry-author">
                    {pin.author?.username || 'Anonymous'}
                  </span>
                  <span className="masonry-date">
                    {new Date(pin.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="masonry-stats">
                  <span className="masonry-stat">
                    👁️ {pin.views || 0}
                  </span>
                  <span className="masonry-stat">
                    ❤️ {pin.likes || 0}
                  </span>
                  {pin.aiDetection?.isAIGenerated && (
                    <span className="masonry-stat">
                      
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid;