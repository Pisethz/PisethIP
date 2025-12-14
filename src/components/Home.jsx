import React, { useState, useEffect } from 'react';
import { fetchPublicIP } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import logo from '../assets/logo-new.png';
import './Home.css';

const Home = ({ onNavigate }) => {
    const { t } = useLanguage();
    const [ipData, setIpData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFeature, setSelectedFeature] = useState(null);

    useEffect(() => {
        const loadIP = async () => {
            try {
                const data = await fetchPublicIP();
                setIpData(data);
            } catch (error) {
                console.error('Failed to load IP', error);
            } finally {
                setLoading(false);
            }
        };
        loadIP();
    }, []);

    const features = [
        {
            id: 'publicip',
            icon: '🌐',
            title: t('publicIp'),
            description: 'Instantly discover your public IP address and detailed location information',
            details: 'Our Public IP tool gives you immediate access to your current IP address along with precise geolocation data including city, region, country, and ISP. Perfect for verifying your VPN connection or troubleshooting network issues.',
            gradient: 'var(--gradient-primary)',
        },
        {
            id: 'iplookup',
            icon: '🔍',
            title: t('ipLookup'),
            description: 'Search any IP address for comprehensive geolocation and network details',
            details: 'Investigate any IP address to uncover its origin. Get detailed reports including location coordinates, timezone, ISP organization, and connection type. Essential for security analysis and network administration.',
            gradient: 'var(--gradient-accent)',
        },
        {
            id: 'whois',
            icon: '📋',
            title: t('whois'),
            description: 'Get domain registration information, registrar details, and nameservers',
            details: 'Perform deep WHOIS lookups to find out who owns a domain, when it was registered, and when it expires. View registrar information, nameservers, and contact details for any domain name.',
            gradient: 'var(--gradient-secondary)',
        },
        {
            id: 'dns',
            icon: '🔧',
            title: t('dns'),
            description: 'Query DNS records including A, AAAA, MX, TXT, NS, CNAME, and more',
            details: 'A powerful DNS propagation and lookup tool. Check all major DNS record types (A, MX, NS, TXT, etc.) to verify your domain configuration and troubleshoot email deliverability or website availability issues.',
            gradient: 'var(--gradient-success)',
        },
        {
            id: 'blacklist',
            icon: '🛡️',
            title: t('blacklist'),
            description: 'Check if an IP address is listed on major DNS blacklists (DNSBL)',
            details: 'Protect your reputation by checking if your IP or domain is blacklisted on over 50 major anti-spam databases (DNSBLs). Crucial for email server administrators and security professionals.',
            gradient: 'var(--gradient-warning)',
        },
        {
            id: 'breach',
            icon: '🔒',
            title: t('breach'),
            description: 'Verify if an email address has been compromised in known data breaches',
            details: 'Secure your digital identity by checking if your email address has appeared in any known data breaches. We search through a vast database of compromised credentials to alert you of potential risks.',
            gradient: 'var(--gradient-dark)',
        },
        {
            id: 'proxy',
            icon: '🔍',
            title: t('proxy'),
            description: 'Detect if an IP address is using a proxy, VPN, or Tor network',
            details: 'Advanced detection capabilities to identify if an IP address is masked behind a Proxy, VPN, or Tor exit node. Useful for fraud prevention and content restriction compliance.',
            gradient: 'var(--gradient-primary)',
        },
        {
            id: 'email',
            icon: '📧',
            title: t('email'),
            description: 'Parse email headers to trace the origin and routing path of messages',
            details: 'Analyze raw email headers to trace the path of an email from sender to recipient. Visualize the hops, identify delays, and verify the authenticity of the sender to prevent phishing attacks.',
            gradient: 'var(--gradient-accent)',
        },
        {
            id: 'subnet',
            icon: '🔢',
            title: 'Subnet Calculator',
            description: 'Calculate subnet masks, network addresses, and IP ranges.',
            details: 'Advanced subnet calculator for network engineers. Perform CIDR conversions, VLSM calculations, and plan your network addressing with ease. Includes IP class detection and binary conversion.',
            gradient: 'var(--gradient-success)',
        },
        {
            id: 'speedtest',
            icon: '⚡',
            title: t('speedTest'),
            description: 'Test your internet connection speed and latency.',
            details: 'Measure your download and upload speeds, ping, and jitter. Get accurate insights into your network performance to diagnose connectivity issues or verify your ISP\'s promised speeds.',
            gradient: 'var(--gradient-warning)',
        },
        {
            id: 'weather',
            icon: '☁️',
            title: t('weather'),
            description: 'Check current weather conditions and forecasts.',
            details: 'Get real-time weather updates for any location. View temperature, humidity, wind speed, and detailed forecasts to plan your day or monitor conditions in remote locations.',
            gradient: 'var(--gradient-primary)',
        },
        {
            id: 'imageosint',
            icon: '📸',
            title: t('imageOsint'),
            description: 'Extract GPS coordinates and metadata from images.',
            details: 'Upload any image to extract EXIF metadata including GPS location, camera settings, date taken, and more. View the location on an interactive map with reverse geocoding to get detailed address information. Perfect for OSINT investigations and digital forensics.',
            gradient: 'var(--gradient-accent)',
        },
    ];

    return (
        <div className="home-container fade-in">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-icon-container scale-in">
                        <img src={logo} alt="PisethIP Logo" className="hero-logo-img" />
                    </div>
                    <h1 className="hero-title">
                        {t('welcome')} <span className="gradient-text">PisethIP Checker</span>
                    </h1>

                    {/* Public IP Display */}
                    <div className="home-ip-display glass-card scale-in">
                        {loading ? (
                            <div className="ip-loading">
                                <div className="spinner-small"></div>
                                <span>{t('detecting')}</span>
                            </div>
                        ) : ipData ? (
                            <div className="ip-info-compact">
                                <div className="ip-label">{t('yourIp')}</div>
                                <div className="ip-value-large">{ipData.ip}</div>
                                <div className="ip-details-row">
                                    <span className="ip-detail">📍 {ipData.city}, {ipData.country_name}</span>
                                    <span className="ip-detail">🏢 {ipData.org}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="ip-error">{t('errorIp')}</div>
                        )}
                    </div>

                    {/* Quick CIDR Converter */}
                    <div className="glass-card scale-in" style={{ marginTop: '1.5rem', maxWidth: '600px', margin: '1.5rem auto 0' }}>
                        <h3 className="feature-title" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>⚡ Quick CIDR to Subnet Mask</h3>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="Enter CIDR (e.g., 22)"
                                min="0"
                                max="32"
                                style={{ textAlign: 'center' }}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    const resultDiv = document.getElementById('home-cidr-result');
                                    if (!isNaN(val) && val >= 0 && val <= 32) {
                                        const mask = [];
                                        let c = val;
                                        for (let i = 0; i < 4; i++) {
                                            const n = Math.min(c, 8);
                                            mask.push(256 - Math.pow(2, 8 - n));
                                            c -= n;
                                        }
                                        resultDiv.innerText = mask.join('.');
                                        resultDiv.parentElement.style.display = 'block';
                                    } else {
                                        resultDiv.parentElement.style.display = 'none';
                                    }
                                }}
                            />
                            <div style={{ display: 'none', marginTop: '1rem', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Subnet Mask: </span>
                                <span id="home-cidr-result" style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.1rem', marginLeft: '0.5rem' }}></span>
                            </div>
                        </div>
                    </div>

                    <p className="hero-subtitle">
                        {t('subtitle')}
                    </p>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <div className="stat-number">12</div>
                            <div className="stat-label">{t('tools')}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">100%</div>
                            <div className="stat-label">{t('free')}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">{t('available')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about-section">
                <div className="about-content glass-card slide-in">
                    <h2 className="section-heading" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                        About <span className="gradient-text">PisethIP</span>
                    </h2>
                    <p className="about-text">
                        PisethIP is your ultimate companion for network analysis and security. We provide a comprehensive suite of free, professional-grade tools designed to help you understand, secure, and optimize your digital presence.
                    </p>
                    <p className="about-text">
                        Whether you're a developer debugging network issues, a security professional investigating threats, or just curious about your internet connection, PisethIP delivers accurate, real-time data with a focus on privacy and ease of use.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features-section">
                <h2 className="section-heading">
                    <span className="gradient-text">{t('explore')}</span>
                </h2>
                <p className="section-description">
                    {t('exploreDesc')}
                </p>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div
                            key={feature.id}
                            className="feature-card glass-card card-3d scale-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                            onClick={() => onNavigate(feature.id)}
                        >
                            <div className="card-3d-inner">
                                <div className="feature-icon" style={{ background: feature.gradient }}>
                                    {feature.icon}
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                                <div
                                    className="feature-actions"
                                    style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', position: 'relative', zIndex: 2 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        className="feature-button"
                                        onClick={() => onNavigate(feature.id)}
                                    >
                                        {t('tryNow')} <span className="arrow">→</span>
                                    </button>
                                    <button
                                        className="feature-button btn-secondary"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
                                        onClick={() => setSelectedFeature(feature)}
                                    >
                                        Read More
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Feature Details Modal */}
            {selectedFeature && (
                <div className="modal-overlay" onClick={() => setSelectedFeature(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedFeature(null)}>×</button>
                        <div className="modal-icon" style={{ background: selectedFeature.gradient }}>
                            {selectedFeature.icon}
                        </div>
                        <h3 className="modal-title">{selectedFeature.title}</h3>
                        <p className="modal-description">{selectedFeature.details}</p>
                        <div className="modal-actions">
                            <button
                                className="feature-button"
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => {
                                    onNavigate(selectedFeature.id);
                                    setSelectedFeature(null);
                                }}
                            >
                                {t('tryNow')} <span className="arrow">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Section */}
            <section className="info-section">
                <div className="info-grid">
                    <div className="info-card glass-card slide-in">
                        <div className="info-icon">⚡</div>
                        <h3>{t('fast')}</h3>
                        <p>{t('fastDesc')}</p>
                    </div>
                    <div className="info-card glass-card slide-in" style={{ animationDelay: '0.1s' }}>
                        <div className="info-icon">🔒</div>
                        <h3>{t('secure')}</h3>
                        <p>{t('secureDesc')}</p>
                    </div>
                    <div className="info-card glass-card slide-in" style={{ animationDelay: '0.2s' }}>
                        <div className="info-icon">🎨</div>
                        <h3>{t('modern')}</h3>
                        <p>{t('modernDesc')}</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
