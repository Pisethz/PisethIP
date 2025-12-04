import React, { useState } from 'react';
import { checkProxy, isValidIP } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const ProxyCheck = () => {
    const [ip, setIp] = useState('');
    const [proxyData, setProxyData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCheck = async (e) => {
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
            const data = await checkProxy(ip.trim());
            setProxyData(data);
        } catch (err) {
            setError('Failed to check proxy. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'high':
                return 'badge-danger';
            case 'medium':
                return 'badge-warning';
            case 'low':
                return 'badge-success';
            default:
                return 'badge-info';
        }
    };

    return (
        <div className="proxy-check-container fade-in">
            <div className="glass-card">
                <h2 className="section-title">🔍 Proxy/VPN Detection</h2>
                <p className="section-subtitle">
                    Detect if an IP address is using a proxy, VPN, or Tor network
                </p>

                <form onSubmit={handleCheck} className="lookup-form">
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
                        {loading ? 'Checking...' : 'Check Proxy'}
                    </button>
                </form>

                {error && (
                    <div className="error-message fade-in">
                        <span className="error-icon">⚠️</span> {error}
                    </div>
                )}
            </div>

            {loading && <LoadingSpinner />}

            {proxyData && !loading && (
                <div className="results-container scale-in" style={{ marginTop: '2rem' }}>
                    <div className="glass-card">
                        <div className="result-header">
                            <h3 className="result-title">Proxy Detection Result</h3>
                            <span className={`badge ${proxyData.isProxy ? 'badge-warning' : 'badge-success'}`}>
                                {proxyData.isProxy ? '⚠ Proxy Detected' : '✓ Direct Connection'}
                            </span>
                        </div>

                        <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
                            <div className="result-card slide-in">
                                <div className="result-label">🌐 IP Address</div>
                                <div className="result-value">{proxyData.ip}</div>
                            </div>

                            <div className="result-card slide-in" style={{ animationDelay: '0.1s' }}>
                                <div className="result-label">🔧 Connection Type</div>
                                <div className="result-value">{proxyData.type}</div>
                            </div>

                            <div className="result-card slide-in" style={{ animationDelay: '0.2s' }}>
                                <div className="result-label">⚠️ Risk Level</div>
                                <div>
                                    <span className={`badge ${getRiskColor(proxyData.risk)}`}>
                                        {proxyData.risk}
                                    </span>
                                </div>
                            </div>

                            <div className="result-card slide-in" style={{ animationDelay: '0.3s' }}>
                                <div className="result-label">🛡️ Status</div>
                                <div className="result-value">
                                    {proxyData.isProxy ? 'Proxy/VPN/Hosting' : 'Residential IP'}
                                </div>
                            </div>
                        </div>

                        <div className="info-box" style={{ marginTop: '1.5rem' }}>
                            <h4 className="result-label" style={{ marginBottom: '0.5rem' }}>
                                What does this mean?
                            </h4>
                            <p className="info-text">
                                {proxyData.isProxy
                                    ? '⚠️ This IP address appears to be from a proxy, VPN, hosting provider, or datacenter. This could indicate the user is masking their real location or using a service that routes traffic through servers.'
                                    : '✓ This IP address appears to be a residential connection, indicating a direct connection from an ISP to an end user.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProxyCheck;
