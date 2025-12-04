import React, { useState } from 'react';
import { checkBlacklist, isValidIP } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const BlacklistCheck = () => {
    const [ip, setIp] = useState('');
    const [blacklistData, setBlacklistData] = useState(null);
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
            const data = await checkBlacklist(ip.trim());
            setBlacklistData(data);
        } catch (err) {
            setError('Failed to check blacklist. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="blacklist-check-container fade-in">
            <div className="glass-card">
                <h2 className="section-title">🛡️ Blacklist Check</h2>
                <p className="section-subtitle">
                    Check if an IP address is listed on major DNS blacklists (DNSBL)
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
                        {loading ? 'Checking...' : 'Check Blacklist'}
                    </button>
                </form>

                {error && (
                    <div className="error-message fade-in">
                        <span className="error-icon">⚠️</span> {error}
                    </div>
                )}
            </div>

            {loading && <LoadingSpinner />}

            {blacklistData && !loading && (
                <div className="results-container scale-in" style={{ marginTop: '2rem' }}>
                    <div className="glass-card">
                        <div className="result-header">
                            <h3 className="result-title">Blacklist Status</h3>
                            <span className={`badge ${blacklistData.status === 'clean' ? 'badge-success' : 'badge-danger'}`}>
                                {blacklistData.status === 'clean' ? '✓ Clean' : '⚠ Listed'}
                            </span>
                        </div>

                        <div className="status-summary" style={{ marginTop: '1.5rem' }}>
                            <div className="glass-card" style={{ background: 'rgba(67, 233, 123, 0.1)' }}>
                                <h4 className="result-label">Summary</h4>
                                <p className="result-value">
                                    {blacklistData.totalListed} of {blacklistData.totalChecked} blacklists
                                </p>
                                <p className="result-label" style={{ marginTop: '0.5rem' }}>
                                    IP: {blacklistData.ip}
                                </p>
                            </div>
                        </div>

                        <div className="blacklist-results" style={{ marginTop: '1.5rem' }}>
                            <h4 className="result-label" style={{ marginBottom: '1rem' }}>
                                Blacklist Details
                            </h4>
                            {blacklistData.blacklists.map((blacklist, index) => (
                                <div
                                    key={index}
                                    className="result-card slide-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div className="result-value">{blacklist.name}</div>
                                            <div className="result-label">
                                                {blacklist.checked ? 'Checked' : 'Not Checked'}
                                            </div>
                                        </div>
                                        <span className={`badge ${blacklist.listed ? 'badge-danger' : 'badge-success'}`}>
                                            {blacklist.listed ? '⚠ Listed' : '✓ Clean'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="info-box" style={{ marginTop: '1.5rem' }}>
                            <p className="info-text">
                                ℹ️ This is a simulated blacklist check. For production use, integrate with actual
                                DNSBL services like Spamhaus, Barracuda, or similar providers.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlacklistCheck;
