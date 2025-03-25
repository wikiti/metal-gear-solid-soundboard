import React, { useEffect, useState } from 'react';
import audioService from '../../services/audioService';
import './OverrideButtons.css';

function OverrideButtons({ overrides }) {
  const [visibleButtons, setVisibleButtons] = useState([]);

  // Update visible buttons whenever the override state changes
  useEffect(() => {
    const updateVisibleButtons = () => {
      const filtered = overrides.filter(override => {
        // If no show_if condition, always show
        if (!override.show_if) return true;
        
        // Otherwise use our filtering service
        return audioService.isAudioAvaible(override.show_if);
      });

      setVisibleButtons(filtered);
    };
    
    // Initial filter
    updateVisibleButtons();
    
    // Set up an interval to periodically update the visible buttons
    // This will catch any changes to the active override
    const intervalId = setInterval(updateVisibleButtons, 500);
    
    return () => clearInterval(intervalId);
  }, [overrides]);

  const handleOverrideClick = (override) => {
    audioService.playOverride(override);
  };

  return (
    <div className="override-buttons">
      {visibleButtons.map((override) => (
        <button
          key={override.id}
          className="override-button"
          onClick={() => handleOverrideClick(override)}
        >
          {override.label}
        </button>
      ))}
    </div>
  );
}

export default OverrideButtons;
