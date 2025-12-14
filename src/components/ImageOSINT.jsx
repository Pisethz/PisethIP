import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import * as exifr from 'exifr';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from './LoadingSpinner';
import './ImageOSINT.css';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ImageOSINT = () => {
    const { t } = useLanguage();
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [exifData, setExifData] = useState(null);
    const [gpsData, setGpsData] = useState(null);
    const [locationData, setLocationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Convert decimal degrees to DMS (Degrees, Minutes, Seconds)
    const convertToDMS = (decimal, isLatitude) => {
        const absolute = Math.abs(decimal);
        const degrees = Math.floor(absolute);
        const minutesNotTruncated = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesNotTruncated);
        const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

        const direction = isLatitude
            ? (decimal >= 0 ? 'N' : 'S')
            : (decimal >= 0 ? 'E' : 'W');

        return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
    };

    // Reverse geocode coordinates to get address
    const reverseGeocode = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'PisethIP-ImageOSINT/1.0'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
        }
        return null;
    };

    // Process uploaded image
    const processImage = async (file) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file');
            return;
        }

        setLoading(true);
        setError(null);
        setExifData(null);
        setGpsData(null);
        setLocationData(null);

        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);

            // Extract EXIF data
            const exif = await exifr.parse(file, {
                tiff: true,
                exif: true,
                gps: true,
                interop: true,
                ifd0: true,
                ifd1: true,
                iptc: true,
                jfif: true,
                ihdr: true,
            });

            if (!exif) {
                setError('No EXIF data found in this image');
                setLoading(false);
                return;
            }

            setExifData(exif);

            // Extract GPS data if available
            if (exif.latitude && exif.longitude) {
                const gps = {
                    latitude: exif.latitude,
                    longitude: exif.longitude,
                    altitude: exif.GPSAltitude || null,
                    latitudeDMS: convertToDMS(exif.latitude, true),
                    longitudeDMS: convertToDMS(exif.longitude, false),
                };
                setGpsData(gps);

                // Get location name
                const location = await reverseGeocode(exif.latitude, exif.longitude);
                setLocationData(location);
            }

            setImage(file);
        } catch (err) {
            console.error('Error processing image:', err);
            setError('Failed to process image. Please try another file.');
        } finally {
            setLoading(false);
        }
    };

    // Handle file drop
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processImage(e.dataTransfer.files[0]);
        }
    };

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    // Handle file input change
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            processImage(e.target.files[0]);
        }
    };

    // Copy text to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    // Format EXIF value for display
    const formatExifValue = (key, value) => {
        if (value === null || value === undefined) return 'N/A';

        if (typeof value === 'object' && !(value instanceof Date)) {
            return JSON.stringify(value);
        }

        if (value instanceof Date) {
            return value.toLocaleString();
        }

        return String(value);
    };

    // Export data as JSON
    const exportData = () => {
        const data = {
            filename: image?.name,
            exif: exifData,
            gps: gpsData,
            location: locationData,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${image?.name || 'image'}_osint_analysis.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="image-osint-container">
            <div className="tool-header">
                <div className="header-icon">📸</div>
                <div className="header-content">
                    <h1 className="tool-title">Image OSINT Analysis</h1>
                    <p className="tool-description">
                        Upload an image to extract GPS coordinates, EXIF metadata, and location details
                    </p>
                </div>
            </div>

            {/* Upload Section */}
            <div className="glass-card">
                <div
                    className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                    onDrop={handleDrop}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <div className="upload-icon">🖼️</div>
                    <h3>Drop an image here or click to browse</h3>
                    <p>Supports JPEG, PNG, HEIC, and other image formats</p>
                </div>

                {loading && (
                    <div className="loading-container">
                        <LoadingSpinner />
                        <p>Analyzing image...</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}
            </div>

            {/* Results Section */}
            {imagePreview && exifData && (
                <div className="results-container">
                    {/* Image Preview */}
                    <div className="glass-card">
                        <h2 className="section-title">📷 Image Preview</h2>
                        <div className="image-preview-container">
                            <img src={imagePreview} alt="Uploaded" className="image-preview" />
                            <div className="image-info">
                                <p><strong>Filename:</strong> {image?.name}</p>
                                <p><strong>Size:</strong> {(image?.size / 1024).toFixed(2)} KB</p>
                                <p><strong>Type:</strong> {image?.type}</p>
                            </div>
                        </div>
                    </div>

                    {/* GPS Data */}
                    {gpsData && (
                        <div className="glass-card">
                            <h2 className="section-title">🗺️ GPS Location Data</h2>

                            <div className="gps-coordinates">
                                <div className="coordinate-item">
                                    <label>Latitude (Decimal):</label>
                                    <div className="coordinate-value">
                                        <span>{gpsData.latitude.toFixed(6)}</span>
                                        <button
                                            className="copy-btn"
                                            onClick={() => copyToClipboard(gpsData.latitude.toString())}
                                            title="Copy to clipboard"
                                        >
                                            📋
                                        </button>
                                    </div>
                                </div>

                                <div className="coordinate-item">
                                    <label>Longitude (Decimal):</label>
                                    <div className="coordinate-value">
                                        <span>{gpsData.longitude.toFixed(6)}</span>
                                        <button
                                            className="copy-btn"
                                            onClick={() => copyToClipboard(gpsData.longitude.toString())}
                                            title="Copy to clipboard"
                                        >
                                            📋
                                        </button>
                                    </div>
                                </div>

                                <div className="coordinate-item">
                                    <label>Latitude (DMS):</label>
                                    <div className="coordinate-value">
                                        <span>{gpsData.latitudeDMS}</span>
                                    </div>
                                </div>

                                <div className="coordinate-item">
                                    <label>Longitude (DMS):</label>
                                    <div className="coordinate-value">
                                        <span>{gpsData.longitudeDMS}</span>
                                    </div>
                                </div>

                                {gpsData.altitude && (
                                    <div className="coordinate-item">
                                        <label>Altitude:</label>
                                        <div className="coordinate-value">
                                            <span>{gpsData.altitude.toFixed(2)} meters</span>
                                        </div>
                                    </div>
                                )}

                                <div className="coordinate-item">
                                    <label>Google Maps Link:</label>
                                    <div className="coordinate-value">
                                        <a
                                            href={`https://www.google.com/maps?q=${gpsData.latitude},${gpsData.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="maps-link"
                                        >
                                            Open in Google Maps 🔗
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Map */}
                            <div className="map-container">
                                <MapContainer
                                    center={[gpsData.latitude, gpsData.longitude]}
                                    zoom={13}
                                    style={{ height: '400px', width: '100%', borderRadius: '12px' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={[gpsData.latitude, gpsData.longitude]}>
                                        <Popup>
                                            <strong>Image Location</strong><br />
                                            {gpsData.latitude.toFixed(6)}, {gpsData.longitude.toFixed(6)}
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>

                            {/* Location Details */}
                            {locationData && (
                                <div className="location-details">
                                    <h3>📍 Location Details</h3>
                                    <div className="location-info">
                                        {locationData.display_name && (
                                            <p><strong>Address:</strong> {locationData.display_name}</p>
                                        )}
                                        {locationData.address && (
                                            <>
                                                {locationData.address.road && <p><strong>Road:</strong> {locationData.address.road}</p>}
                                                {locationData.address.city && <p><strong>City:</strong> {locationData.address.city}</p>}
                                                {locationData.address.state && <p><strong>State:</strong> {locationData.address.state}</p>}
                                                {locationData.address.country && <p><strong>Country:</strong> {locationData.address.country}</p>}
                                                {locationData.address.postcode && <p><strong>Postcode:</strong> {locationData.address.postcode}</p>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Camera & Image Details */}
                    <div className="glass-card">
                        <h2 className="section-title">📸 Camera & Image Details</h2>
                        <div className="metadata-grid">
                            {exifData.Make && (
                                <div className="metadata-item">
                                    <label>Camera Make:</label>
                                    <span>{exifData.Make}</span>
                                </div>
                            )}
                            {exifData.Model && (
                                <div className="metadata-item">
                                    <label>Camera Model:</label>
                                    <span>{exifData.Model}</span>
                                </div>
                            )}
                            {exifData.DateTimeOriginal && (
                                <div className="metadata-item">
                                    <label>Date Taken:</label>
                                    <span>{new Date(exifData.DateTimeOriginal).toLocaleString()}</span>
                                </div>
                            )}
                            {exifData.ExposureTime && (
                                <div className="metadata-item">
                                    <label>Shutter Speed:</label>
                                    <span>{exifData.ExposureTime}s</span>
                                </div>
                            )}
                            {exifData.FNumber && (
                                <div className="metadata-item">
                                    <label>Aperture:</label>
                                    <span>f/{exifData.FNumber}</span>
                                </div>
                            )}
                            {exifData.ISO && (
                                <div className="metadata-item">
                                    <label>ISO:</label>
                                    <span>{exifData.ISO}</span>
                                </div>
                            )}
                            {exifData.FocalLength && (
                                <div className="metadata-item">
                                    <label>Focal Length:</label>
                                    <span>{exifData.FocalLength}mm</span>
                                </div>
                            )}
                            {exifData.ImageWidth && (
                                <div className="metadata-item">
                                    <label>Dimensions:</label>
                                    <span>{exifData.ImageWidth} × {exifData.ImageHeight}</span>
                                </div>
                            )}
                            {exifData.Orientation && (
                                <div className="metadata-item">
                                    <label>Orientation:</label>
                                    <span>{exifData.Orientation}</span>
                                </div>
                            )}
                            {exifData.Software && (
                                <div className="metadata-item">
                                    <label>Software:</label>
                                    <span>{exifData.Software}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* All EXIF Data */}
                    <div className="glass-card">
                        <div className="section-header">
                            <h2 className="section-title">🔍 Complete EXIF Metadata</h2>
                            <button className="export-btn" onClick={exportData}>
                                💾 Export JSON
                            </button>
                        </div>
                        <div className="exif-table-container">
                            <table className="exif-table">
                                <thead>
                                    <tr>
                                        <th>Property</th>
                                        <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(exifData)
                                        .sort(([a], [b]) => a.localeCompare(b))
                                        .map(([key, value]) => (
                                            <tr key={key}>
                                                <td className="exif-key">{key}</td>
                                                <td className="exif-value">{formatExifValue(key, value)}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {!gpsData && (
                        <>
                            <div className="glass-card warning-card">
                                <div className="warning-icon">⚠️</div>
                                <h3>No GPS Data Found</h3>
                                <p>This image does not contain GPS location information. This is common for:</p>
                                <ul>
                                    <li><strong>Social media images</strong> - Facebook, Instagram, Twitter automatically strip GPS data</li>
                                    <li><strong>Screenshots</strong> and edited images</li>
                                    <li><strong>Privacy-protected images</strong> - Metadata removed for security</li>
                                    <li><strong>Photos with location disabled</strong> - Camera settings turned off</li>
                                </ul>
                            </div>

                            {/* Alternative OSINT Methods */}
                            <div className="glass-card osint-methods-card">
                                <h2 className="section-title">🔍 Alternative OSINT Investigation Methods</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                    When GPS data is unavailable, use these alternative techniques to find the location:
                                </p>

                                {/* Reverse Image Search */}
                                <div className="osint-section">
                                    <h3 className="osint-subtitle">🌐 Reverse Image Search</h3>
                                    <p className="osint-description">
                                        Upload this image to reverse image search engines to find where else it appears online:
                                    </p>
                                    <div className="reverse-search-buttons">
                                        <a
                                            href={`https://www.google.com/searchbyimage?image_url=${encodeURIComponent(imagePreview)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="search-btn google-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                window.open('https://images.google.com/', '_blank');
                                            }}
                                        >
                                            <span className="btn-icon">🔍</span>
                                            Google Images
                                        </a>
                                        <a
                                            href="https://yandex.com/images/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="search-btn yandex-btn"
                                        >
                                            <span className="btn-icon">🔎</span>
                                            Yandex (Best for locations)
                                        </a>
                                        <a
                                            href="https://tineye.com/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="search-btn tineye-btn"
                                        >
                                            <span className="btn-icon">👁️</span>
                                            TinEye
                                        </a>
                                        <a
                                            href="https://www.bing.com/visualsearch"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="search-btn bing-btn"
                                        >
                                            <span className="btn-icon">🔍</span>
                                            Bing Visual Search
                                        </a>
                                    </div>
                                </div>

                                {/* Visual Clues Checklist */}
                                <div className="osint-section">
                                    <h3 className="osint-subtitle">👁️ Visual Clues to Look For</h3>
                                    <p className="osint-description">
                                        Analyze the image for these location indicators:
                                    </p>
                                    <div className="visual-clues-grid">
                                        <div className="clue-item">
                                            <span className="clue-icon">🏛️</span>
                                            <div>
                                                <strong>Landmarks & Buildings</strong>
                                                <p>Unique architecture, monuments, or famous structures</p>
                                            </div>
                                        </div>
                                        <div className="clue-item">
                                            <span className="clue-icon">🚏</span>
                                            <div>
                                                <strong>Street Signs & Addresses</strong>
                                                <p>Road names, building numbers, postal codes</p>
                                            </div>
                                        </div>
                                        <div className="clue-item">
                                            <span className="clue-icon">🏪</span>
                                            <div>
                                                <strong>Business Names & Logos</strong>
                                                <p>Store names, brands, company signage</p>
                                            </div>
                                        </div>
                                        <div className="clue-item">
                                            <span className="clue-icon">🚗</span>
                                            <div>
                                                <strong>License Plates</strong>
                                                <p>Vehicle plates can indicate country/region</p>
                                            </div>
                                        </div>
                                        <div className="clue-item">
                                            <span className="clue-icon">🗣️</span>
                                            <div>
                                                <strong>Language on Signs</strong>
                                                <p>Text language, alphabet, writing system</p>
                                            </div>
                                        </div>
                                        <div className="clue-item">
                                            <span className="clue-icon">🌳</span>
                                            <div>
                                                <strong>Vegetation & Climate</strong>
                                                <p>Plants, trees, weather conditions</p>
                                            </div>
                                        </div>
                                        <div className="clue-item">
                                            <span className="clue-icon">🏗️</span>
                                            <div>
                                                <strong>Architecture Style</strong>
                                                <p>Building design, construction materials</p>
                                            </div>
                                        </div>
                                        <div className="clue-item">
                                            <span className="clue-icon">☀️</span>
                                            <div>
                                                <strong>Shadow Analysis</strong>
                                                <p>Sun position can indicate time and hemisphere</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Media Context */}
                                <div className="osint-section">
                                    <h3 className="osint-subtitle">📱 Check Social Media Context</h3>
                                    <p className="osint-description">
                                        If this image came from social media, look for location clues in:
                                    </p>
                                    <ul className="context-list">
                                        <li>📍 <strong>Tagged location</strong> - Many posts have location tags separate from image metadata</li>
                                        <li>#️⃣ <strong>Hashtags</strong> - Location-specific hashtags (#NYC, #Paris, etc.)</li>
                                        <li>📝 <strong>Post caption</strong> - Text descriptions mentioning places</li>
                                        <li>💬 <strong>Comments</strong> - Users may mention the location</li>
                                        <li>👤 <strong>User profile</strong> - Check poster's location or bio</li>
                                        <li>🕐 <strong>Post timestamp</strong> - Time posted vs time zone</li>
                                    </ul>
                                </div>

                                {/* Advanced Techniques */}
                                <div className="osint-section">
                                    <h3 className="osint-subtitle">🎯 Advanced OSINT Techniques</h3>
                                    <ul className="context-list">
                                        <li>🗺️ <strong>Google Street View</strong> - Match visual features with street view imagery</li>
                                        <li>🛰️ <strong>Satellite imagery</strong> - Use Google Earth to find distinctive patterns</li>
                                        <li>📐 <strong>Sun position calculators</strong> - Tools like SunCalc.org for time/location</li>
                                        <li>🌍 <strong>GeoGuessr skills</strong> - Practice geographic deduction</li>
                                        <li>🔍 <strong>Specialized search</strong> - Search for unique text visible in the image</li>
                                        <li>👥 <strong>OSINT communities</strong> - Ask r/OSINT or GeoGuessr communities</li>
                                    </ul>
                                </div>

                                {/* Pro Tip */}
                                <div className="pro-tip">
                                    <div className="tip-icon">💡</div>
                                    <div>
                                        <strong>Pro Tip:</strong> Combine multiple techniques for best results.
                                        Even small details like the style of power lines, road markings, or
                                        architectural features can narrow down the location significantly.
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageOSINT;
