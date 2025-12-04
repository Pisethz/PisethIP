import React, { useState } from 'react';
import { lookupIP, isValidIP } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const IPLookup = () => {
    const [ip, setIp] = useState('');
    const [ipData, setIpData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLookup = async (e) => {
        e.preventDefault();

        if (!ip.trim()) {
            setError('Please enter an IP address');
            return;
        }

        if (!isValidIP(ip.trim())) {
            setError('Please enter a valid IP address');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await lookupIP(ip.trim());
            setIpData(data);
        } catch (err) {
            setError('Failed to lookup IP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ip-lookup-container fade-in">
            <div className="glass-card">
                <h2 className="section-title">🔍 IP Address Lookup</h2>
                <p className="section-subtitle">
                    Enter an IP address to get detailed information about its location and network
                </p>

                <form onSubmit={handleLookup} className="lookup-form">
                    <div className="input-group">
                        <label className="input-label">IP Address</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g., 8.8.8.8"
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Looking up...' : 'Lookup IP'}
                    </button>
                </form>

                {error && (
                    <div className="error-message fade-in">
                        <span className="error-icon">⚠️</span> {error}
                    </div>
                )}
            </div>

            {loading && <LoadingSpinner />}

            {ipData && !loading && (
                <div className="results-container scale-in" style={{ marginTop: '2rem' }}>
                    <div className="glass-card">
                        <div className="result-header">
                            <h3 className="result-title">IP Information</h3>
                            <span className="badge badge-info">{ipData.ip}</span>
                        </div>

                        <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
                            <div className="result-card">
                                <div className="result-label">🌍 Country</div>
                                <div className="result-value">{ipData.country_name || 'N/A'}</div>
                            </div>

                            <div className="result-card">
                                <div className="result-label">🏙️ City</div>
                                <div className="result-value">{ipData.city || 'N/A'}</div>
                            </div>

                            <div className="result-card">
                                <div className="result-label">📍 Region</div>
                                <div className="result-value">{ipData.region || 'N/A'}</div>
                            </div>

                            <div className="result-card">
                                <div className="result-label">📮 Postal Code</div>
                                <div className="result-value">{ipData.postal || 'N/A'}</div>
                            </div>

                            <div className="result-card">
                                <div className="result-label">🌐 Coordinates</div>
                                <div className="result-value">
                                    {ipData.latitude}, {ipData.longitude}
                                </div>
                            </div>

                            <div className="result-card">
                                <div className="result-label">🕐 Timezone</div>
                                <div className="result-value">{ipData.timezone || 'N/A'}</div>
                            </div>

                            <div className="result-card">
                                <div className="result-label">🏢 ISP</div>
                                <div className="result-value">{ipData.org || 'N/A'}</div>
                            </div>

                            <div className="result-card">
                                <div className="result-label">🔢 ASN</div>
                                <div className="result-value">{ipData.asn || 'N/A'}</div>
                            </div>

                            <div className="result-card">
                                <div className="result-label">💱 Currency</div>
                                <div className="result-value">{ipData.currency || 'N/A'}</div>
                            </div>

                            <div className="result-card">
                                <div className="result-label">🗣️ Languages</div>
                                <div className="result-value">{ipData.languages || 'N/A'}</div>
                            </div>

                            <div className="result-card">
                                <div className="result-label">📞 Calling Code</div>
                                <div className="result-value">{ipData.country_calling_code || 'N/A'}</div>
                            </div>

                            <div className="result-card">
                                <div className="result-label">🌏 Continent</div>
                                <div className="result-value">{ipData.continent_code || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IPLookup;
