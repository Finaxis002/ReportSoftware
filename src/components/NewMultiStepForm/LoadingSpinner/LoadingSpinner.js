import React from "react";
import "../LoadingSpinner/LoadingSpinner.css"

const LoadingSpinner = () => {
  return (
    <div className="spinner">
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
