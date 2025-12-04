import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../assets/logo-new.png';
import './Navbar.css';

const Navbar = ({ activeView, onNavigate }) => {
    const { t, language, switchLanguage } = useLanguage();
    const { theme, setTheme, themes } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const navItems = [
        { id: 'home', icon: '🏠', label: t('home') },
        { id: 'publicip', icon: '🌐', label: t('publicIp') },
        { id: 'iplookup', icon: '🔍', label: t('ipLookup') },
        { id: 'whois', icon: '📋', label: t('whois') },
        { id: 'dns', icon: '🔧', label: t('dns') },
        { id: 'blacklist', icon: '🛡️', label: t('blacklist') },
        { id: 'breach', icon: '🔒', label: t('breach') },
        { id: 'proxy', icon: '🔍', label: t('proxy') },
        { id: 'email', icon: '📧', label: t('email') },
        { id: 'subnet', icon: '🔢', label: 'Subnet Calc' },
        { id: 'speedtest', icon: '⚡', label: t('speedTest') },
        { id: 'weather', icon: '☁️', label: t('weather') },
    ];

    const handleNavigate = (id) => {
        onNavigate(id);
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => handleNavigate('home')}>
                    <img src={logo} alt="PisethIP" className="nav-logo-img" />
                    <span className="nav-title">PisethIP</span>
                </div>

                {/* Desktop Navigation */}
                <div className="navbar-desktop">
                    {navItems.slice(0, 5).map((item) => (
                        <button
                            key={item.id}
                            className={`nav-link ${activeView === item.id ? 'active' : ''}`}
                            onClick={() => handleNavigate(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}

                    {/* More Dropdown for remaining items */}
                    <div className="nav-dropdown-container">
                        <button
                            className="nav-link"
                            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                        >
                            More ▼
                        </button>
                        {isMoreMenuOpen && (
                            <div className="nav-dropdown-menu glass-card">
                                {navItems.slice(5).map((item) => (
                                    <button
                                        key={item.id}
                                        className={`dropdown-item ${activeView === item.id ? 'active' : ''}`}
                                        onClick={() => {
                                            handleNavigate(item.id);
                                            setIsMoreMenuOpen(false);
                                        }}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="navbar-controls">
                    {/* Language Switcher */}
                    <div className="lang-switch">
                        <button
                            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                            onClick={() => switchLanguage('en')}
                        >
                            EN
                        </button>
                        <span className="divider">|</span>
                        <button
                            className={`lang-btn ${language === 'km' ? 'active' : ''}`}
                            onClick={() => switchLanguage('km')}
                        >
                            KH
                        </button>
                    </div>

                    {/* Theme Switcher */}
                    <div className="theme-switch-container">
                        <button
                            className="theme-btn"
                            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                            title="Change Theme"
                        >
                            🎨
                        </button>
                        {isThemeMenuOpen && (
                            <div className="theme-menu glass-card">
                                {Object.entries(themes).map(([key, value]) => (
                                    <button
                                        key={key}
                                        className={`theme-option ${theme === key ? 'active' : ''}`}
                                        onClick={() => {
                                            setTheme(key);
                                            setIsThemeMenuOpen(false);
                                        }}
                                    >
                                        <span className="theme-preview" style={{ background: value.colors['--primary'] }}></span>
                                        {value.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="mobile-menu glass-card slide-in">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`mobile-nav-item ${activeView === item.id ? 'active' : ''}`}
                            onClick={() => handleNavigate(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
