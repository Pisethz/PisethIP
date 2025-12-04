import React, { useState, useEffect } from 'react';
import { getWeather, searchCity, fetchPublicIP } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import './WeatherCheck.css';

const WeatherCheck = () => {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const [weather, setWeather] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        // Auto-load weather for user's IP location on mount
        loadUserLocationWeather();
    }, []);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (showResults && !event.target.closest('.lookup-form')) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showResults]);

    // Auto-search as user types (debounced)
    useEffect(() => {
        // Only search if query has at least 2 characters
        if (query.trim().length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        // Debounce the search to avoid too many API calls
        const timeoutId = setTimeout(async () => {
            console.log('🔍 Auto-searching for:', query);
            try {
                setLoading(true);
                setError(null);
                const results = await searchCity(query);
                console.log('✅ Auto-search results:', results);
                setSearchResults(results);
                setShowResults(results.length > 0);
                if (results.length === 0) {
                    setError('No cities found');
                } else {
                    setError(null);
                }
            } catch (err) {
                console.error('❌ Auto-search error:', err);
                setError('Failed to search city');
                setSearchResults([]);
                setShowResults(false);
            } finally {
                setLoading(false);
            }
        }, 500); // Wait 500ms after user stops typing

        // Cleanup timeout if query changes before timeout completes
        return () => clearTimeout(timeoutId);
    }, [query]);

    const loadUserLocationWeather = async () => {
        try {
            setLoading(true);
            const ipData = await fetchPublicIP();
            if (ipData && ipData.latitude && ipData.longitude) {
                const locationData = {
                    name: ipData.city,
                    country: ipData.country_name,
                    latitude: ipData.latitude,
                    longitude: ipData.longitude
                };
                setLocation(locationData);
                const weatherData = await getWeather(ipData.latitude, ipData.longitude);
                setWeather(weatherData);
            }
        } catch (err) {
            console.error('Failed to load initial weather:', err);
            // Don't show error for auto-load, just let user search
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        console.log('🔍 Searching for:', query);
        try {
            setLoading(true);
            setError(null);
            const results = await searchCity(query);
            console.log('✅ Search results:', results);
            setSearchResults(results);
            setShowResults(true);
            console.log('📋 Dropdown should now be visible with', results.length, 'results');
            if (results.length === 0) {
                setError('No cities found');
            } else {
                setError(null);
            }
        } catch (err) {
            console.error('❌ Search error:', err);
            setError('Failed to search city');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const selectCity = async (city) => {
        try {
            setLoading(true);
            setQuery('');
            setShowResults(false);
            setSearchResults([]);
            setLocation(city);
            const weatherData = await getWeather(city.latitude, city.longitude);
            setWeather(weatherData);
            setError(null);
        } catch (err) {
            setError('Failed to fetch weather data');
        } finally {
            setLoading(false);
        }
    };

    const getWeatherIcon = (code) => {
        // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
        const icons = {
            0: '☀️', // Clear sky
            1: '🌤️', // Mainly clear
            2: '⛅', // Partly cloudy
            3: '☁️', // Overcast
            45: '🌫️', // Fog
            48: '🌫️', // Depositing rime fog
            51: 'DRIZZLE', 53: 'DRIZZLE', 55: 'DRIZZLE', // Drizzle
            61: '🌧️', 63: '🌧️', 65: '🌧️', // Rain
            71: '❄️', 73: '❄️', 75: '❄️', // Snow fall
            77: '❄️', // Snow grains
            80: '🌦️', 81: '🌦️', 82: '🌦️', // Rain showers
            85: '🌨️', 86: '🌨️', // Snow showers
            95: '⛈️', // Thunderstorm
            96: '⛈️', 99: '⛈️', // Thunderstorm with hail
        };

        // Map ranges or specific codes
        if (icons[code]) {
            if (icons[code] === 'DRIZZLE') return 'Vm'; // Drizzle icon placeholder
            return icons[code];
        }
        return '❓';
    };

    const getWeatherDescription = (code) => {
        const descriptions = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow fall',
            73: 'Moderate snow fall',
            75: 'Heavy snow fall',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail',
        };
        return descriptions[code] || 'Unknown';
    };

    return (
        <div className="weather-container fade-in">
            <div className="glass-card">
                <h2 className="section-title">☁️ Weather Checker</h2>
                <p className="section-subtitle">
                    Check current weather and forecast for any city
                </p>

                <form onSubmit={handleSearch} className="lookup-form">
                    <div className="input-group" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search city (e.g., Phnom Penh, London)..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{ paddingRight: '120px' }}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                padding: '0.5rem 1.5rem',
                                margin: 0
                            }}
                        >
                            Search
                        </button>
                    </div>

                    {/* Helpful hint */}
                    {!showResults && !weather && (
                        <p style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.5rem',
                            textAlign: 'center'
                        }}>
                            💡 Type a city name and click Search. Then select from the dropdown results.
                        </p>
                    )}

                    {showResults && searchResults.length > 0 && (
                        <div className="search-results-dropdown glass-card">
                            {searchResults.map((city) => (
                                <div
                                    key={city.id}
                                    className="search-result-item"
                                    onClick={() => selectCity(city)}
                                >
                                    <span className="city-name">{city.name}</span>
                                    <span className="city-country">
                                        {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                                    </span>
                                    {city.country_code && (
                                        <img
                                            src={`https://flagcdn.com/24x18/${city.country_code.toLowerCase()}.png`}
                                            alt={city.country}
                                            className="country-flag"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </form>

                {error && (
                    <div className="error-message fade-in">
                        <span className="error-icon">⚠️</span> {error}
                    </div>
                )}
            </div>

            {loading && !weather && <LoadingSpinner />}

            {weather && location && (
                <div className="weather-display scale-in">
                    {/* Current Weather */}
                    <div className="current-weather glass-card">
                        <div className="weather-header">
                            <div>
                                <h2 className="city-title">{location.name}</h2>
                                <p className="country-subtitle">{location.country}</p>
                            </div>
                            <div className="current-date">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>

                        <div className="weather-main">
                            <div className="weather-icon-large">
                                {getWeatherIcon(weather.current.weather_code)}
                            </div>
                            <div className="temperature-container">
                                <span className="temperature">{Math.round(weather.current.temperature_2m)}°</span>
                                <span className="weather-desc">{getWeatherDescription(weather.current.weather_code)}</span>
                            </div>
                            <div className="weather-details-grid">
                                <div className="weather-detail-item">
                                    <span className="detail-label">Humidity</span>
                                    <span className="detail-value">{weather.current.relative_humidity_2m}%</span>
                                </div>
                                <div className="weather-detail-item">
                                    <span className="detail-label">Wind</span>
                                    <span className="detail-value">{weather.current.wind_speed_10m} km/h</span>
                                </div>
                                <div className="weather-detail-item">
                                    <span className="detail-label">Feels Like</span>
                                    <span className="detail-value">{Math.round(weather.current.apparent_temperature)}°</span>
                                </div>
                                <div className="weather-detail-item">
                                    <span className="detail-label">UV Index</span>
                                    <span className="detail-value">{weather.daily.uv_index_max[0]}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hourly Forecast - Next 24 Hours */}
                    {weather.hourly && (
                        <div className="hourly-forecast-container">
                            <h3 className="section-title" style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>
                                📅 Hourly Forecast (Next 24 Hours)
                            </h3>
                            <div className="hourly-forecast-scroll">
                                {weather.hourly.time.slice(0, 24).map((time, index) => {
                                    const date = new Date(time);
                                    const hour = date.getHours();
                                    const isNow = index === 0;

                                    return (
                                        <div key={time} className={`hourly-card glass-card ${isNow ? 'current-hour' : ''}`}>
                                            <div className="hourly-time">
                                                {isNow ? 'Now' : `${hour}:00`}
                                            </div>
                                            <div className="hourly-date">
                                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="hourly-icon">
                                                {getWeatherIcon(weather.hourly.weather_code[index])}
                                            </div>
                                            <div className="hourly-temp">
                                                {Math.round(weather.hourly.temperature_2m[index])}°
                                            </div>
                                            <div className="hourly-details">
                                                <div className="hourly-detail-item">
                                                    💧 {weather.hourly.precipitation_probability[index]}%
                                                </div>
                                                <div className="hourly-detail-item">
                                                    💨 {Math.round(weather.hourly.wind_speed_10m[index])} km/h
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 7-Day Forecast */}
                    <div className="forecast-container">
                        <h3 className="section-title" style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>7-Day Forecast</h3>
                        <div className="forecast-grid">
                            {weather.daily.time.map((date, index) => (
                                <div key={date} className="forecast-card glass-card">
                                    <div className="forecast-date">
                                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </div>
                                    <div className="forecast-icon">
                                        {getWeatherIcon(weather.daily.weather_code[index])}
                                    </div>
                                    <div className="forecast-temp">
                                        <span className="max-temp">{Math.round(weather.daily.temperature_2m_max[index])}°</span>
                                        <span className="min-temp">{Math.round(weather.daily.temperature_2m_min[index])}°</span>
                                    </div>
                                    <div className="forecast-rain">
                                        💧 {weather.daily.precipitation_probability_max[index]}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherCheck;
