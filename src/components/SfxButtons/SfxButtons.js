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
        return audioService.isAudioAvaible(sfx.show_if);
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

  const humanize = (str) => {
    return str.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  const categorizedButtons = visibleButtons.reduce((acc, sfx) => {
    const category = sfx.category || 'default';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(sfx);
    return acc;
  }, {});

  return Object.keys(categorizedButtons).map(
    (category) => (
      <details className="sfx-buttons-wrapper" open key={category}>
        <summary>
          {humanize(category)}
        </summary>

        <div className="sfx-buttons">
          {categorizedButtons[category].map((sfx) => (
            <button
              key={sfx.id}
              className="sfx-button"
              onClick={() => handleSfxClick(sfx)}
            >
              {sfx.label}
            </button>
          ))}
        </div>
      </details>
    ))
}

export default SfxButtons;
