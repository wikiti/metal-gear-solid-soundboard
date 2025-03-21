import React, { useState, useEffect } from 'react';
import StageSelector from './components/StageSelector/StageSelector';
import OverrideButtons from './components/OverrideButtons/OverrideButtons';
import SfxButtons from './components/SfxButtons/SfxButtons';
import SettingsButton from './components/SettingsButton/SettingsButton';
import audioService from './services/audioService';
import './App.css';

function App() {
  const [soundboardData, setSoundboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStage, setSelectedStage] = useState('');

  useEffect(() => {
    // Try to load from localStorage first
    const savedData = localStorage.getItem('mgs-soundboard-data');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setSoundboardData(parsedData);
        audioService.loadSounds(parsedData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to parse saved data, loading default', err);
        loadDefaultData();
      }
    } else {
      loadDefaultData();
    }
  }, []);

  const loadDefaultData = () => {
    import('./data/metal-gear-solid-soundboard.json')
      .then(data => {
        setSoundboardData(data.default);
        audioService.loadSounds(data.default);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load soundboard data');
        console.error(err);
        setLoading(false);
      });
  };

  const handleUpdateData = (newData) => {
    // Update state with new data
    setSoundboardData(newData);
    
    // Save to localStorage
    localStorage.setItem('mgs-soundboard-data', JSON.stringify(newData));
    
    // Reload audio service with new data
    audioService.loadSounds(newData);
  };

  if (loading) return <div className="loading">Loading soundboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!soundboardData) return null;

  return (
    <div className="soundboard-container">
      <h1>Metal Gear Solid Soundboard</h1>
      
      <div className="stage-section">
        <h2>Stage</h2>
        <StageSelector stages={soundboardData.stages} selectedStage={selectedStage} setSelectedStage={setSelectedStage} />
        <button 
          className="resume-button"
          onClick={() => audioService.playStage(selectedStage, soundboardData.stages)}
        >
          Restart
        </button>
      </div>
      
      <div className="override-section">
        <h2>Triggers</h2>
        <OverrideButtons overrides={soundboardData['stage-overrides']} />
      </div>
      
      <div className="sfx-section">
        <h2>Sound Effects</h2>
        <SfxButtons sfxList={soundboardData.sfx} />
      </div>

      <div className="settings-wrapper">
        <SettingsButton
          soundboardData={soundboardData}
          onUpdateData={handleUpdateData}
        />
      </div>

      <div className="disclaimer warning">
        <p>
          <strong>Disclaimer:</strong> This soundboard does not store or host any audio files on this server. 
          All sounds are streamed directly from external sources (archives, etc). 
          This app is designed for personal use during tabletop gaming sessions and 
          operates as a reference tool only. All Metal Gear Solid audio content, 
          characters, and related media are property of Konami. 
          This is an unofficial fan project not affiliated with or endorsed by Konami.
        </p>
      </div>

      <div className="disclaimer">
        <p>
          This web app was developed by <a target="_blank" href="https://github.com/wikiti" rel="noreferrer">Daniel @wikiti</a>, with the help of <a target="_blank" href="https://boardgamegeek.com/user/Zypzu" rel="noreferrer">Eric @Zypzu</a> and other BGG community members.
        </p>
      </div>
    </div>
  );
}

export default App;
