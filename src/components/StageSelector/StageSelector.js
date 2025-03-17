import React from 'react';
import audioService from '../../services/audioService';
import './StageSelector.css';

function StageSelector({ stages, selectedStage, setSelectedStage }) {
  const handleStageChange = (e) => {
    const stageId = e.target.value;
    setSelectedStage(stageId);
    
    if (stageId) {
      audioService.playStage(stageId, stages);
    } else {
      audioService.stopAllMusic();
    }
  };

  return (
    <div className="stage-selector">
      <select 
        value={selectedStage} 
        onChange={handleStageChange}
        className="stage-select"
      >
        <option value="">Select a stage...</option>
        {stages.filter(stage => stage.id).map((stage) => (
          <option key={stage.id} value={stage.id}>
            {stage.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default StageSelector;
