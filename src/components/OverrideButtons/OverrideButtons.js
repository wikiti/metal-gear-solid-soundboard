import React from 'react';
import audioService from '../../services/audioService';
import './OverrideButtons.css';

function OverrideButtons({ overrides }) {
  const handleOverrideClick = (override) => {
    audioService.playOverride(override);
  };

  return (
    <div className="override-buttons">
      {overrides.map((override) => (
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
