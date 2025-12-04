import React, { useState } from 'react';
import { dnsLookup, isValidDomain } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const DNSLookup = () => {
    const [domain, setDomain] = useState('');
    const [recordType, setRecordType] = useState('A');
    const [dnsData, setDnsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const recordTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'PTR'];

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
            const data = await dnsLookup(domain.trim(), recordType);
            setDnsData(data);
        } catch (err) {
            setError('Failed to lookup DNS records. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dns-lookup-container fade-in">
            <div className="glass-card">
                <h2 className="section-title">🔧 DNS Lookup</h2>
                <p className="section-subtitle">
                    Query DNS records for any domain (A, AAAA, MX, TXT, NS, CNAME, SOA, PTR)
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

                    <div className="input-group">
                        <label className="input-label">Record Type</label>
                        <select
                            className="input-field"
                            value={recordType}
                            onChange={(e) => setRecordType(e.target.value)}
                        >
                            {recordTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Looking up...' : 'Lookup DNS'}
                    </button>
                </form>

                {error && (
                    <div className="error-message fade-in">
                        <span className="error-icon">⚠️</span> {error}
                    </div>
                )}
            </div>

            {loading && <LoadingSpinner />}

            {dnsData && !loading && (
                <div className="results-container scale-in" style={{ marginTop: '2rem' }}>
                    <div className="glass-card">
                        <div className="result-header">
                            <h3 className="result-title">DNS Records</h3>
                            <div>
                                <span className="badge badge-info">{domain}</span>
                                <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>
                                    {recordType}
                                </span>
                            </div>
                        </div>

                        {dnsData.Answer && dnsData.Answer.length > 0 ? (
                            <div className="dns-records" style={{ marginTop: '1.5rem' }}>
                                {dnsData.Answer.map((record, index) => (
                                    <div key={index} className="result-card slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                        <div className="dns-record-header">
                                            <span className="badge badge-info">{record.type}</span>
                                            <span className="dns-ttl">TTL: {record.TTL}s</span>
                                        </div>
                                        <div className="result-value" style={{ marginTop: '0.5rem' }}>
                                            {record.data}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="info-box" style={{ marginTop: '1.5rem' }}>
                                <p className="info-text">ℹ️ No {recordType} records found for this domain</p>
                            </div>
                        )}

                        {dnsData.Question && (
                            <div className="dns-question" style={{ marginTop: '1.5rem' }}>
                                <h4 className="result-label">Query Information</h4>
                                <div className="result-card">
                                    <p><strong>Name:</strong> {dnsData.Question[0]?.name}</p>
                                    <p><strong>Type:</strong> {dnsData.Question[0]?.type}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DNSLookup;
