import React from 'react';

function ProgressBar({ status, isLoading }) {
  return (
    <div className="progress-bar">
      {isLoading && <div className="progress loading"></div>}
    </div>
  );
}

export default ProgressBar;
