import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
    return (
        <div className="loading-container">
            <div className="spinner-3d">
                <div className="spinner-inner"></div>
                <div className="spinner-inner"></div>
                <div className="spinner-inner"></div>
            </div>
            <p className="loading-text">Loading...</p>
        </div>
    );
};

export default LoadingSpinner;
