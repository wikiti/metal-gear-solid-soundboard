import React from 'react';
import audioService from '../../services/audioService';
import './SfxButtons.css';

function SfxButtons({ sfxList }) {
  const handleSfxClick = (sfx) => {
    audioService.playSfx(sfx);
  };

  return (
    <div className="sfx-buttons">
      {sfxList.map((sfx) => (
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
