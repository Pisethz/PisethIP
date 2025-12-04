import React, { useState } from 'react';
import { checkBreach, isValidEmail } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';

const BreachCheck = () => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [breachData, setBreachData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCheck = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Please enter an email address');
            return;
        }

        if (!isValidEmail(email.trim())) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await checkBreach(email.trim());
            setBreachData(data);
        } catch (err) {
            setError('Failed to check breaches. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="breach-check-container fade-in">
            <div className="glass-card">
                <div className="section-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="section-title">
                        <span className="gradient-text">{t('breach')}</span>
                    </h1>
                    <p className="section-subtitle">
                        Check if your email has been compromised in a data breach
                    </p>
                </div>

                <form onSubmit={handleCheck} className="lookup-form">
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="e.g., example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Checking...' : 'Check Breaches'}
                    </button>
                </form>

                {error && (
                    <div className="error-message fade-in">
                        <span className="error-icon">⚠️</span> {error}
                    </div>
                )}
            </div>

            {loading && <LoadingSpinner />}

            {breachData && !loading && (
                <div className="results-container scale-in" style={{ marginTop: '2rem' }}>
                    <div className="glass-card">
                        <div className="result-header">
                            <h3 className="result-title">Breach Status</h3>
                            <span className={`badge ${breachData.breached ? 'badge-danger' : 'badge-success'}`}>
                                {breachData.breached ? '⚠ Breached' : '✓ Safe'}
                            </span>
                        </div>

                        <div className="status-summary" style={{ marginTop: '1.5rem' }}>
                            <div className="glass-card" style={{ background: breachData.breached ? 'rgba(236, 72, 153, 0.1)' : 'rgba(67, 233, 123, 0.1)' }}>
                                <h4 className="result-label">Email</h4>
                                <p className="result-value">{breachData.email}</p>
                                {breachData.breached && (
                                    <p className="result-label" style={{ marginTop: '0.5rem', color: 'var(--secondary)' }}>
                                        Found in {breachData.breaches.length} breach(es)
                                    </p>
                                )}
                            </div>
                        </div>

                        {breachData.message && (
                            <div className="info-box" style={{ marginTop: '1.5rem' }}>
                                <p className="info-text">ℹ️ {breachData.message}</p>
                                <p className="info-subtext" style={{ marginTop: '1rem' }}>
                                    To enable full breach checking functionality, sign up for a free API key at
                                    <a href="https://haveibeenpwned.com/API/v3" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)', marginLeft: '0.25rem' }}>
                                        HaveIBeenPwned
                                    </a> and configure it in the api.js file.
                                </p>
                            </div>
                        )}

                        {breachData.breaches && breachData.breaches.length > 0 && (
                            <div className="breach-results" style={{ marginTop: '1.5rem' }}>
                                <h4 className="result-label" style={{ marginBottom: '1rem' }}>
                                    Breach Details
                                </h4>
                                {breachData.breaches.map((breach, index) => (
                                    <div
                                        key={index}
                                        className="result-card slide-in"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="result-value">{breach.name}</div>
                                        <div className="result-label">Date: {breach.date}</div>
                                        <div className="result-label">Compromised Data: {breach.dataClasses?.join(', ')}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BreachCheck;
