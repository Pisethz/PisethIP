import React, { useState, useEffect } from 'react';
import { fetchPublicIP } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from './LoadingSpinner';

const PublicIP = () => {
    const { t } = useLanguage();
    const [ipData, setIpData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadIPData();
    }, []);

    const loadIPData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchPublicIP();
            setIpData(data);
        } catch (err) {
            setError('Failed to fetch IP information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="error-container fade-in">
                <div className="error-icon">⚠️</div>
                <p className="error-text">{error}</p>
                <button className="btn btn-primary" onClick={loadIPData}>
                    {t('retry')}
                </button>
            </div>
        );
    }

    return (
        <div className="public-ip-container fade-in">
            <div className="ip-hero glass-card card-3d">
                <div className="card-3d-inner">
                    <div className="ip-icon">🌐</div>
                    <h2 className="ip-title">{t('yourIp')}</h2>
                    <div className="ip-address glow" style={{ wordBreak: 'break-all' }}>
                        {ipData?.ip || 'N/A'}
                    </div>
                    <p className="ip-subtitle">IPv{ipData?.version || '4'}</p>
                </div>
            </div>

            <div className="grid grid-2" style={{ marginTop: '2rem' }}>
                <div className="result-card slide-in">
                    <div className="result-label">🌍 {t('location')}</div>
                    <div className="result-value">
                        {ipData?.city}, {ipData?.region}, {ipData?.country_name}
                    </div>
                </div>

                <div className="result-card slide-in" style={{ animationDelay: '0.1s' }}>
                    <div className="result-label">📍 {t('coordinates')}</div>
                    <div className="result-value">
                        {ipData?.latitude}, {ipData?.longitude}
                    </div>
                </div>

                <div className="result-card slide-in" style={{ animationDelay: '0.2s' }}>
                    <div className="result-label">🏢 {t('isp')}</div>
                    <div className="result-value">{ipData?.org || 'N/A'}</div>
                </div>

                <div className="result-card slide-in" style={{ animationDelay: '0.3s' }}>
                    <div className="result-label">🕐 {t('timezone')}</div>
                    <div className="result-value">{ipData?.timezone || 'N/A'}</div>
                </div>

                <div className="result-card slide-in" style={{ animationDelay: '0.4s' }}>
                    <div className="result-label">📞 {t('postal')}</div>
                    <div className="result-value">{ipData?.postal || 'N/A'}</div>
                </div>

                <div className="result-card slide-in" style={{ animationDelay: '0.5s' }}>
                    <div className="result-label">🔢 {t('asn')}</div>
                    <div className="result-value">{ipData?.asn || 'N/A'}</div>
                </div>
            </div>

            <div className="info-section" style={{ marginTop: '2rem' }}>
                <div className="glass-card">
                    <h3 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>
                        📊 {t('additionalInfo')}
                    </h3>
                    <div className="grid grid-2">
                        <div>
                            <p className="result-label">{t('countryCode')}</p>
                            <p className="result-value">{ipData?.country_code || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="result-label">{t('currency')}</p>
                            <p className="result-value">{ipData?.currency || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="result-label">{t('capital')}</p>
                            <p className="result-value">{ipData?.capital || ipData?.country_capital || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="result-label">{t('continent')}</p>
                            <p className="result-value">{ipData?.continent_code || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicIP;
