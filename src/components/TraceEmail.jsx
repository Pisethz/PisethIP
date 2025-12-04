import React, { useState } from 'react';
import { parseEmailHeaders } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const TraceEmail = () => {
    const [headers, setHeaders] = useState('');
    const [emailData, setEmailData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTrace = async (e) => {
        e.preventDefault();

        if (!headers.trim()) {
            setError('Please paste email headers');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = parseEmailHeaders(headers);
            setEmailData(data);
        } catch (err) {
            setError('Failed to parse email headers. Please check the format.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="trace-email-container fade-in">
            <div className="glass-card">
                <h2 className="section-title">📧 Trace Email</h2>
                <p className="section-subtitle">
                    Parse email headers to trace the path and origin of an email message
                </p>

                <form onSubmit={handleTrace} className="lookup-form">
                    <div className="input-group">
                        <label className="input-label">Email Headers</label>
                        <textarea
                            className="input-field"
                            placeholder="Paste full email headers here..."
                            value={headers}
                            onChange={(e) => setHeaders(e.target.value)}
                            rows={10}
                            style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Parsing...' : 'Trace Email'}
                    </button>
                </form>

                {error && (
                    <div className="error-message fade-in">
                        <span className="error-icon">⚠️</span> {error}
                    </div>
                )}

                <div className="info-box" style={{ marginTop: '1.5rem' }}>
                    <h4 className="result-label" style={{ marginBottom: '0.5rem' }}>
                        How to get email headers:
                    </h4>
                    <ul className="info-list">
                        <li><strong>Gmail:</strong> Open email → Click three dots → Show original</li>
                        <li><strong>Outlook:</strong> Open email → File → Properties → Internet headers</li>
                        <li><strong>Yahoo:</strong> Open email → More → View raw message</li>
                    </ul>
                </div>
            </div>

            {loading && <LoadingSpinner />}

            {emailData && !loading && (
                <div className="results-container scale-in" style={{ marginTop: '2rem' }}>
                    <div className="glass-card">
                        <div className="result-header">
                            <h3 className="result-title">Email Trace Results</h3>
                            <span className="badge badge-info">Parsed</span>
                        </div>

                        <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
                            <div className="result-card slide-in">
                                <div className="result-label">📤 From</div>
                                <div className="result-value">{emailData.from || 'N/A'}</div>
                            </div>

                            <div className="result-card slide-in" style={{ animationDelay: '0.1s' }}>
                                <div className="result-label">📥 To</div>
                                <div className="result-value">{emailData.to || 'N/A'}</div>
                            </div>

                            <div className="result-card slide-in" style={{ animationDelay: '0.2s' }}>
                                <div className="result-label">📋 Subject</div>
                                <div className="result-value">{emailData.subject || 'N/A'}</div>
                            </div>

                            <div className="result-card slide-in" style={{ animationDelay: '0.3s' }}>
                                <div className="result-label">📅 Date</div>
                                <div className="result-value">{emailData.date || 'N/A'}</div>
                            </div>

                            <div className="result-card slide-in" style={{ animationDelay: '0.4s' }}>
                                <div className="result-label">🆔 Message ID</div>
                                <div className="result-value" style={{ fontSize: '0.85rem' }}>
                                    {emailData.messageId || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {emailData.received && emailData.received.length > 0 && (
                            <div className="received-path" style={{ marginTop: '1.5rem' }}>
                                <h4 className="result-label" style={{ marginBottom: '1rem' }}>
                                    📍 Email Path (Received Headers)
                                </h4>
                                <div className="path-container">
                                    {emailData.received.map((hop, index) => (
                                        <div
                                            key={index}
                                            className="result-card slide-in"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <div className="path-step">
                                                <span className="badge badge-info">Hop {index + 1}</span>
                                                <div className="result-value" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                                    {hop}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="info-box" style={{ marginTop: '1.5rem' }}>
                            <p className="info-text">
                                ℹ️ The "Received" headers show the path the email took from sender to recipient.
                                Read from bottom to top to trace the email's journey.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TraceEmail;
