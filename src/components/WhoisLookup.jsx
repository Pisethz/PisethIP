import React, { useState } from 'react';
import { whoisLookup, isValidDomain } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const WhoisLookup = () => {
    const [domain, setDomain] = useState('');
    const [whoisData, setWhoisData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLookup = async (e) => {
        e.preventDefault();

        if (!domain.trim()) {
            setError('Please enter a domain name');
            return;
        }

        if (!isValidDomain(domain.trim())) {
            setError('Please enter a valid domain name');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await whoisLookup(domain.trim());
            setWhoisData(data);
        } catch (err) {
            setError('Failed to lookup WHOIS information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="whois-lookup-container fade-in">
            <div className="glass-card">
                <h2 className="section-title">📋 WHOIS Lookup</h2>
                <p className="section-subtitle">
                    Get domain registration information, registrar details, and nameservers
                </p>

                <form onSubmit={handleLookup} className="lookup-form">
                    <div className="input-group">
                        <label className="input-label">Domain Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g., google.com"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Looking up...' : 'Lookup WHOIS'}
                    </button>
                </form>

                {error && (
                    <div className="error-message fade-in">
                        <span className="error-icon">⚠️</span> {error}
                    </div>
                )}
            </div>

            {loading && <LoadingSpinner />}

            {whoisData && !loading && (
                <div className="results-container scale-in" style={{ marginTop: '2rem' }}>
                    <div className="glass-card">
                        <div className="result-header">
                            <h3 className="result-title">WHOIS Information</h3>
                            <span className="badge badge-info">{whoisData.domain || domain}</span>
                        </div>

                        {whoisData.error ? (
                            <div className="info-box" style={{ marginTop: '1.5rem' }}>
                                <p className="info-text">ℹ️ {whoisData.error}</p>
                            </div>
                        ) : (
                            <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
                                <div className="result-card">
                                    <div className="result-label">🏢 Registrar</div>
                                    <div className="result-value">{whoisData.registrar || 'N/A'}</div>
                                </div>

                                <div className="result-card">
                                    <div className="result-label">📅 Created Date</div>
                                    <div className="result-value">
                                        {whoisData.createdDate ? new Date(whoisData.createdDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>

                                <div className="result-card">
                                    <div className="result-label">📅 Expires Date</div>
                                    <div className="result-value">
                                        {whoisData.expiresDate ? new Date(whoisData.expiresDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>

                                <div className="result-card">
                                    <div className="result-label">🔄 Updated Date</div>
                                    <div className="result-value">
                                        {whoisData.updatedDate ? new Date(whoisData.updatedDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>

                                <div className="result-card">
                                    <div className="result-label">📊 Status</div>
                                    <div className="result-value">{whoisData.status || 'N/A'}</div>
                                </div>

                                <div className="result-card">
                                    <div className="result-label">🌐 Nameservers</div>
                                    <div className="result-value" style={{ fontSize: '0.85rem' }}>
                                        {whoisData.nameservers || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhoisLookup;
