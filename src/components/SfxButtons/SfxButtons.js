import React, { useState, useEffect } from 'react';
import audioService from '../../services/audioService';
import './SfxButtons.css';

function SfxButtons({ sfxList }) {
  const [visibleButtons, setVisibleButtons] = useState([]);

  // Update visible buttons whenever the override state changes
  useEffect(() => {
    const updateVisibleButtons = () => {
      const filtered = sfxList.filter(sfx => {
        // If no show_if condition, always show
        if (!sfx.show_if) return true;
        
        // Otherwise use our filtering service
        return audioService.isSfxAvailable(sfx.show_if);
      });

      setVisibleButtons(filtered);
    };
    
    // Initial filter
    updateVisibleButtons();
    
    // Set up an interval to periodically update the visible buttons
    // This will catch any changes to the active override
    const intervalId = setInterval(updateVisibleButtons, 500);
    
    return () => clearInterval(intervalId);
  }, [sfxList]);

  const handleSfxClick = (sfx) => {
    audioService.playSfx(sfx);
  };

  return (
    <div className="sfx-buttons">
      {visibleButtons.map((sfx) => (
        <button
          key={sfx.id}
          className="sfx-button"
          onClick={() => handleSfxClick(sfx)}
        >
          {sfx.label}
        </button>
      ))}
    </div>
  );
}

export default SfxButtons;
