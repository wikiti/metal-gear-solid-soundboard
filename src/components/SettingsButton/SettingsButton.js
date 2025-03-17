import React, { useState, useEffect } from 'react';
import './SettingsButton.css';

const SettingsButton = ({ soundboardData, onUpdateData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [isModified, setIsModified] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Initialize JSON content when soundboardData changes
  useEffect(() => {
    if (soundboardData) {
      setJsonContent(JSON.stringify(soundboardData, null, 2));
    }
  }, [soundboardData]);

  const toggleSettings = () => {
    setIsOpen(!isOpen);
  };

  const handleJsonChange = (e) => {
    const newContent = e.target.value;
    setJsonContent(newContent);
    
    // Check if content has changed from original
    const isChanged = JSON.stringify(soundboardData, null, 2) !== newContent;
    setIsModified(isChanged);
    
    // Clear validation error when user starts editing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSave = () => {
    try {
      const parsedJson = JSON.parse(jsonContent);
      
      // Basic validation to ensure required structure exists
      if (!parsedJson.sources || !parsedJson.stages || 
          !parsedJson['stage-overrides'] || !parsedJson.sfx) {
        throw new Error('JSON is missing required sections: sources, stages, stage-overrides, or sfx');
      }
      
      // Update parent component with new data
      onUpdateData(parsedJson);
      
      // Mark as not modified since we've saved
      setIsModified(false);
      setValidationError(null);
    } catch (err) {
      setValidationError(`Invalid JSON: ${err.message}`);
    }
  };

  const handleReset = () => {
    // Clear localStorage and reload
    localStorage.removeItem('mgs-soundboard-data');
    window.location.reload();
  };

  return (
    <div className="settings-container">
      <button className="settings-toggle" onClick={toggleSettings} title="Advanced Settings">
        Advanced settings
      </button>
      
      {isOpen && (
        <div className="settings-panel">
          <h3>Advanced Settings</h3>
          <p className="settings-warning">
            Warning: Modifying this JSON directly can break the app. Proceed with caution.
          </p>
          
          {validationError && (
            <div className="validation-error">
              {validationError}
            </div>
          )}
          
          <textarea
            className="json-editor"
            value={jsonContent}
            onChange={handleJsonChange}
            rows="15"
            spellCheck="false"
          />
          
          <div className="settings-actions">
            <button 
              className="settings-save" 
              onClick={handleSave}
              disabled={!isModified}
            >
              Save Changes
            </button>
            
            <buttont className="settings-close" onClick={toggleSettings}>Close</buttont>
            
            <button className="settings-reset" onClick={handleReset}>
              Reset to Default
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsButton;
