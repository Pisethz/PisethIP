import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './SpeedTest.css';

const SpeedTest = () => {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    React.useEffect(() => {
        // Detect mobile device
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    return (
        <div className="speedtest-container fade-in">
            <div className="speedtest-header">
                <div className="speedtest-icon-container glass-card scale-in">
                    <span className="speedtest-icon">⚡</span>
                </div>
                <h1 className="page-title">
                    <span className="gradient-text">{t('speedTest') || 'Speed Test'}</span>
                </h1>
                <p className="page-description">
                    Test your internet connection speed and measure download, upload, and ping performance
                </p>
                <div className="speedtest-features">
                    <div className="feature-badge">
                        <span className="badge-icon">📊</span>
                        <span>Real-time Metrics</span>
                    </div>
                    <div className="feature-badge">
                        <span className="badge-icon">🌍</span>
                        <span>Global Servers</span>
                    </div>
                    <div className="feature-badge">
                        <span className="badge-icon">🚀</span>
                        <span>Instant Results</span>
                    </div>
                </div>
            </div>

            {/* Mobile Notice */}
            {isMobile && (
                <div className="mobile-notice glass-card" style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '2px solid rgba(251, 191, 36, 0.5)'
                }}>
                    <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>
                        📱 <strong>Mobile Tip:</strong> For the best speed test experience on mobile, open in full screen:
                    </p>
                    <a
                        href="https://openspeedtest.com/speedtest"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ display: 'inline-block', textDecoration: 'none' }}
                    >
                        🚀 Open Full Screen Speed Test
                    </a>
                </div>
            )}

            <div className="speedtest-frame-wrapper">
                {isLoading && (
                    <div className="speedtest-loading">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Loading Speed Test...</p>
                    </div>
                )}
                <div className={`speedtest-frame-container glass-card ${isLoading ? 'loading' : 'loaded'}`}>
                    <iframe
                        src="https://openspeedtest.com/speedtest"
                        title="OpenSpeedTest"
                        className="speedtest-iframe"
                        frameBorder="0"
                        allowFullScreen
                        onLoad={handleIframeLoad}
                        data-testid="speedtest-iframe"
                    />
                </div>
            </div>
        </div>
    );
};

export default SpeedTest;
