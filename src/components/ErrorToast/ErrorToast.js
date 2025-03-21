import React, { useEffect } from 'react';
import './ErrorToast.css';

function ErrorToast({ errors, onDismiss }) {
  // Auto-dismiss errors after a few seconds
  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        if (onDismiss) onDismiss(errors[0].errorId);
      }, 5000); // 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [errors, onDismiss]);

  if (!errors || errors.length === 0) return null;

  return (
    <div className="error-toast-container">
      {errors.map((error) => (
        <div key={error.errorId} className="error-toast">
          <div className="error-toast-content">
            <span className="error-toast-message">
              Failed to load sound: <strong>{error.id}</strong>
            </span>
          </div>
          <button 
            className="error-toast-dismiss" 
            onClick={() => onDismiss(error.errorId)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default ErrorToast;
