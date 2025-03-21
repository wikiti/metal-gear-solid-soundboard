import React, { useState, useEffect } from 'react';
import audioService from '../../services/audioService';
import './VolumeControl.css';

function VolumeControl() {
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isMuted, setIsMuted] = useState(false);
  
  // Initialize component state from service
  useEffect(() => {
    const volumeState = audioService.getVolumeState();
    setVolume(volumeState.volume);
    setIsMuted(volumeState.isMuted);
  }, []);
  
  const handleVolumeChange = (e) => {
    setPreviousVolume(volume);
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  useEffect(() => {
    audioService.setMute(isMuted);
    audioService.setVolume(volume);
  }, [isMuted, volume]);

  const handleMuteToggle = () => {
    const newMuteState = !isMuted;

    setIsMuted(newMuteState);

    if (!newMuteState) {
      setVolume(previousVolume < 0.1 ? 0.1 : previousVolume);
    }
    else {
      setVolume(0);
    }
  };
  
  return (
    <div className="volume-control">
      <button 
        className="mute-button" 
        onClick={handleMuteToggle}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        className="volume-slider"
        title={`Volume: ${Math.round(volume * 100)}%`}
      />
    </div>
  );
}

export default VolumeControl;
