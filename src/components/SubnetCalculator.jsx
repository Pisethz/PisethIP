import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchPublicIP } from '../utils/api';
import './SubnetCalculator.css';

const SubnetCalculator = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('subnet');

    // --- Subnet Calculator State ---
    const [ipAddress, setIpAddress] = useState('');
    const [subnetMask, setSubnetMask] = useState('');
    const [cidr, setCidr] = useState('24');
    const [useCidr, setUseCidr] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // --- IP Converter State ---
    const [convertInput, setConvertInput] = useState('');
    const [convertResult, setConvertResult] = useState(null);

    // --- VLSM State ---
    const [vlsmNetwork, setVlsmNetwork] = useState('');
    const [vlsmCidr, setVlsmCidr] = useState('24');
    const [subnets, setSubnets] = useState([{ name: 'Subnet A', hosts: '' }]);
    const [vlsmResult, setVlsmResult] = useState(null);
    const [vlsmError, setVlsmError] = useState(null);

    // --- NAT & Local IP State ---
    const [localIP, setLocalIP] = useState('Detecting...');
    const [publicIP, setPublicIP] = useState('Loading...');
    const [checkIP, setCheckIP] = useState('');
    const [ipTypeResult, setIpTypeResult] = useState(null);

    // --- Helper Functions ---
    const ipToBinary = (ip) => ip.split('.').map(octet => parseInt(octet).toString(2).padStart(8, '0')).join('.');
    const ipToLong = (ip) => ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    const longToIp = (long) => [long >>> 24, (long >> 16) & 255, (long >> 8) & 255, long & 255].join('.');

    const cidrToMask = (cidr) => {
        const mask = [];
        for (let i = 0; i < 4; i++) {
            const n = Math.min(cidr, 8);
            mask.push(256 - Math.pow(2, 8 - n));
            cidr -= n;
        }
        return mask.join('.');
    };

    const maskToCidr = (mask) => mask.split('.').map(octet => parseInt(octet).toString(2)).join('').split('1').length - 1;

    const getNetworkAddress = (ip, mask) => {
        const ipParts = ip.split('.').map(Number);
        const maskParts = mask.split('.').map(Number);
        return ipParts.map((part, i) => part & maskParts[i]).join('.');
    };

    const getBroadcastAddress = (ip, mask) => {
        const ipParts = ip.split('.').map(Number);
        const maskParts = mask.split('.').map(Number);
        return ipParts.map((part, i) => part | (255 - maskParts[i])).join('.');
    };

    const isValidIP = (ip) => {
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        return parts.every(part => {
            const num = parseInt(part);
            return num >= 0 && num <= 255 && part === num.toString();
        });
    };

    const isValidMask = (mask) => {
        if (!isValidIP(mask)) return false;
        const binary = mask.split('.').map(octet => parseInt(octet).toString(2).padStart(8, '0')).join('');
        return /^1*0*$/.test(binary);
    };

    // --- Subnet Calculator Logic ---
    const handleCalculate = (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);

        if (!isValidIP(ipAddress)) {
            setError('Invalid IP address format');
            return;
        }

        let mask;
        let cidrValue;

        if (useCidr) {
            const cidrNum = parseInt(cidr);
            if (cidrNum < 0 || cidrNum > 32) {
                setError('CIDR must be between 0 and 32');
                return;
            }
            mask = cidrToMask(cidrNum);
            cidrValue = cidrNum;
        } else {
            if (!isValidMask(subnetMask)) {
                setError('Invalid subnet mask');
                return;
            }
            mask = subnetMask;
            cidrValue = maskToCidr(mask);
        }

        const networkAddr = getNetworkAddress(ipAddress, mask);
        const broadcastAddr = getBroadcastAddress(ipAddress, mask);
        const totalHosts = Math.pow(2, 32 - cidrValue);

        // First/Last Usable
        const netParts = networkAddr.split('.').map(Number);
        netParts[3] += 1;
        const firstUsable = netParts.join('.');

        const broadParts = broadcastAddr.split('.').map(Number);
        broadParts[3] -= 1;
        const lastUsable = broadParts.join('.');

        setResult({
            ipAddress,
            ipBinary: ipToBinary(ipAddress),
            subnetMask: mask,
            maskBinary: ipToBinary(mask),
            cidr: cidrValue,
            networkAddress: networkAddr,
            broadcastAddress: broadcastAddr,
            firstUsable: totalHosts > 2 ? firstUsable : 'N/A',
            lastUsable: totalHosts > 2 ? lastUsable : 'N/A',
            totalHosts,
            usableHosts: totalHosts > 2 ? totalHosts - 2 : 0,
            ipClass: getIpClass(ipAddress),
            isPrivate: isPrivateIP(ipAddress),
            wildcardMask: mask.split('.').map(octet => 255 - parseInt(octet)).join('.')
        });
    };

    const getIpClass = (ip) => {
        const first = parseInt(ip.split('.')[0]);
        if (first >= 1 && first <= 126) return 'A';
        if (first >= 128 && first <= 191) return 'B';
        if (first >= 192 && first <= 223) return 'C';
        if (first >= 224 && first <= 239) return 'D (Multicast)';
        return 'E (Reserved)';
    };

    const isPrivateIP = (ip) => {
        const parts = ip.split('.').map(Number);
        return (parts[0] === 10) ||
            (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
            (parts[0] === 192 && parts[1] === 168);
    };

    // --- IP Converter Logic ---
    const handleConvert = (val) => {
        setConvertInput(val);
        if (isValidIP(val)) {
            const long = ipToLong(val);
            setConvertResult({
                decimal: val,
                binary: ipToBinary(val),
                hex: val.split('.').map(p => parseInt(p).toString(16).toUpperCase().padStart(2, '0')).join('.'),
                integer: long
            });
        } else {
            setConvertResult(null);
        }
    };

    // --- VLSM Logic ---
    const addSubnet = () => setSubnets([...subnets, { name: `Subnet ${String.fromCharCode(65 + subnets.length)}`, hosts: '' }]);
    const removeSubnet = (idx) => setSubnets(subnets.filter((_, i) => i !== idx));
    const updateSubnet = (idx, field, val) => {
        const newSubnets = [...subnets];
        newSubnets[idx][field] = val;
        setSubnets(newSubnets);
    };

    const calculateVLSM = (e) => {
        e.preventDefault();
        setVlsmError(null);
        setVlsmResult(null);

        if (!isValidIP(vlsmNetwork)) {
            setVlsmError('Invalid Major Network IP');
            return;
        }

        // Sort subnets by hosts needed (descending)
        const sortedSubnets = [...subnets]
            .map(s => ({ ...s, hosts: parseInt(s.hosts) || 0 }))
            .sort((a, b) => b.hosts - a.hosts);

        let currentIpLong = ipToLong(vlsmNetwork);
        const results = [];

        for (const subnet of sortedSubnets) {
            // Find smallest power of 2 that fits hosts + 2 (network + broadcast)
            let needed = subnet.hosts + 2;
            let power = 0;
            while (Math.pow(2, power) < needed) power++;

            const newCidr = 32 - power;
            const size = Math.pow(2, power);

            // Check if fits in major network
            // (Simplified check, assumes major network is large enough for now)

            const networkAddr = longToIp(currentIpLong);
            const broadcastLong = currentIpLong + size - 1;
            const broadcastAddr = longToIp(broadcastLong);
            const mask = cidrToMask(newCidr);

            results.push({
                name: subnet.name,
                needed: subnet.hosts,
                allocated: size - 2,
                address: networkAddr,
                cidr: newCidr,
                mask: mask,
                range: `${longToIp(currentIpLong + 1)} - ${longToIp(broadcastLong - 1)}`,
                broadcast: broadcastAddr
            });

            currentIpLong += size;
        }

        setVlsmResult(results);
    };

    // --- NAT & Local IP Logic ---
    const detectLocalIP = async () => {
        try {
            const rtc = new RTCPeerConnection({ iceServers: [] });
            rtc.createDataChannel('');
            rtc.createOffer().then(offer => rtc.setLocalDescription(offer));

            rtc.onicecandidate = (event) => {
                if (event && event.candidate && event.candidate.candidate) {
                    const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                    const match = event.candidate.candidate.match(ipRegex);
                    if (match) {
                        setLocalIP(match[1]);
                        rtc.close();
                    }
                }
            };

            // Fallback if WebRTC fails or takes too long
            setTimeout(() => {
                if (localIP === 'Detecting...') setLocalIP('Hidden by Browser (Privacy)');
            }, 3000);

        } catch (e) {
            console.error(e);
            setLocalIP('Hidden by Browser');
        }
    };

    const loadPublicIP = async () => {
        try {
            const data = await fetchPublicIP();
            setPublicIP(data.ip);
        } catch (e) {
            setPublicIP('Error Fetching');
        }
    };

    const checkIPType = (e) => {
        e.preventDefault();
        if (!isValidIP(checkIP)) {
            setIpTypeResult({ type: 'Invalid', message: 'Please enter a valid IP address.' });
            return;
        }

        if (isPrivateIP(checkIP)) {
            const first = parseInt(checkIP.split('.')[0]);
            let range = '';
            if (first === 10) range = 'Class A (10.0.0.0 - 10.255.255.255)';
            else if (first === 172) range = 'Class B (172.16.0.0 - 172.31.255.255)';
            else if (first === 192) range = 'Class C (192.168.0.0 - 192.168.255.255)';

            setIpTypeResult({
                type: 'Private (Local)',
                class: range,
                icon: '🔒',
                message: 'This IP is used within a local network (LAN) and is NOT directly accessible from the internet. It sits behind a NAT (Network Address Translation) device.'
            });
        } else {
            setIpTypeResult({
                type: 'Public (Internet)',
                class: 'Global Internet',
                icon: '🌐',
                message: 'This IP is a public address routable on the global internet. It can be accessed directly from anywhere in the world (unless blocked by firewalls).'
            });
        }
    };

    // Load IPs when tab is active
    React.useEffect(() => {
        if (activeTab === 'nat') {
            detectLocalIP();
            loadPublicIP();
        }
    }, [activeTab]);

    return (
        <div className="subnet-calculator-container fade-in">
            {/* Tabs */}
            <div className="calculator-tabs">
                <button
                    className={`tab-btn ${activeTab === 'subnet' ? 'active' : ''}`}
                    onClick={() => setActiveTab('subnet')}
                >
                    🔢 Subnet Calc
                </button>
                <button
                    className={`tab-btn ${activeTab === 'converter' ? 'active' : ''}`}
                    onClick={() => setActiveTab('converter')}
                >
                    🔄 IP Converter
                </button>
                <button
                    className={`tab-btn ${activeTab === 'cidr' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cidr')}
                >
                    📋 CIDR Table
                </button>
                <button
                    className={`tab-btn ${activeTab === 'vlsm' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vlsm')}
                >
                    📐 VLSM Calc
                </button>
                <button
                    className={`tab-btn ${activeTab === 'nat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('nat')}
                >
                    🏠 NAT & Local IP
                </button>
            </div>

            {/* Subnet Calculator Tab */}
            {activeTab === 'subnet' && (
                <div className="glass-card tab-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '2rem' }}>🔢</span>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>IP Subnet Calculator</h2>
                    </div>
                    <p className="section-subtitle">Calculate network information from IP address and subnet mask</p>

                    <form onSubmit={handleCalculate} className="lookup-form">
                        <div className="input-group">
                            <label className="input-label">IP Address</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g., 192.168.1.100"
                                value={ipAddress}
                                onChange={(e) => setIpAddress(e.target.value)}
                                required
                            />
                        </div>

                        <div className="subnet-toggle">
                            <button
                                type="button"
                                className={`toggle-btn ${useCidr ? 'active' : ''}`}
                                onClick={() => setUseCidr(true)}
                            >
                                CIDR Notation
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${!useCidr ? 'active' : ''}`}
                                onClick={() => setUseCidr(false)}
                            >
                                Subnet Mask
                            </button>
                        </div>

                        {useCidr ? (
                            <div className="input-group">
                                <label className="input-label">CIDR (0-32)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="e.g., 24"
                                    value={cidr}
                                    onChange={(e) => setCidr(e.target.value)}
                                    min="0"
                                    max="32"
                                    required
                                />
                            </div>
                        ) : (
                            <div className="input-group">
                                <label className="input-label">Subnet Mask</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g., 255.255.255.0"
                                    value={subnetMask}
                                    onChange={(e) => setSubnetMask(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="btn btn-primary">Calculate Subnet</button>
                    </form>

                    {result && (
                        <div className="subnet-results">
                            <h3 className="results-title">📊 Calculation Results</h3>
                            <div className="result-section">
                                <h4 className="result-section-title">Network Information</h4>
                                <div className="result-grid">
                                    <div className="result-item highlight">
                                        <span className="result-label">Network Address:</span>
                                        <span className="result-value">{result.networkAddress}</span>
                                    </div>
                                    <div className="result-item highlight">
                                        <span className="result-label">Broadcast Address:</span>
                                        <span className="result-value">{result.broadcastAddress}</span>
                                    </div>
                                    <div className="result-item">
                                        <span className="result-label">CIDR:</span>
                                        <span className="result-value">/{result.cidr}</span>
                                    </div>
                                    <div className="result-item">
                                        <span className="result-label">Subnet Mask:</span>
                                        <span className="result-value">{result.subnetMask}</span>
                                    </div>
                                    <div className="result-item">
                                        <span className="result-label">Usable Hosts:</span>
                                        <span className="result-value">{result.usableHosts.toLocaleString()}</span>
                                    </div>
                                    <div className="result-item">
                                        <span className="result-label">IP Class:</span>
                                        <span className="result-value">{result.ipClass}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick CIDR Converter (Inside Subnet Tab) */}
                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>⚡</span>
                            <h3 className="section-title" style={{ fontSize: '1.25rem', marginBottom: 0 }}>Quick CIDR Converter</h3>
                        </div>
                        <div className="input-group">
                            <input
                                type="number"
                                className="input-field"
                                placeholder="Enter CIDR (e.g., 22)"
                                min="0"
                                max="32"
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val >= 0 && val <= 32) {
                                        e.target.nextElementSibling.innerText = `Subnet Mask: ${cidrToMask(val)}`;
                                        e.target.nextElementSibling.style.display = 'block';
                                    } else {
                                        e.target.nextElementSibling.style.display = 'none';
                                    }
                                }}
                            />
                            <div className="result-value highlight" style={{ marginTop: '1rem', display: 'none', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', textAlign: 'center' }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* IP Converter Tab */}
            {activeTab === 'converter' && (
                <div className="glass-card tab-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '2rem' }}>🔄</span>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>IP Converter</h2>
                    </div>
                    <p className="section-subtitle">Convert IP addresses between Decimal, Binary, Hexadecimal, and Integer formats.</p>

                    <div className="input-group">
                        <label className="input-label">IP Address</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g., 192.168.1.1"
                            value={convertInput}
                            onChange={(e) => handleConvert(e.target.value)}
                        />
                    </div>

                    {convertResult && (
                        <div className="result-grid" style={{ marginTop: '2rem' }}>
                            <div className="result-item">
                                <span className="result-label">Decimal</span>
                                <span className="result-value">{convertResult.decimal}</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">Binary</span>
                                <span className="result-value binary">{convertResult.binary}</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">Hexadecimal</span>
                                <span className="result-value">{convertResult.hex}</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">Integer</span>
                                <span className="result-value">{convertResult.integer}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CIDR Reference Table Tab */}
            {activeTab === 'cidr' && (
                <div className="glass-card tab-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '2rem' }}>📋</span>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>CIDR Reference Table</h2>
                    </div>
                    <p className="section-subtitle">Quick reference for Subnet Masks and Host Counts.</p>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>CIDR</th>
                                    <th>Subnet Mask</th>
                                    <th>Total Hosts</th>
                                    <th>Usable Hosts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 33 }).map((_, i) => {
                                    const hosts = Math.pow(2, 32 - i);
                                    return (
                                        <tr key={i}>
                                            <td className="highlight">/{i}</td>
                                            <td className="mono">{cidrToMask(i)}</td>
                                            <td>{hosts.toLocaleString()}</td>
                                            <td>{hosts > 2 ? (hosts - 2).toLocaleString() : 0}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* VLSM Calculator Tab */}
            {activeTab === 'vlsm' && (
                <div className="glass-card tab-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '2rem' }}>📐</span>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>VLSM Calculator</h2>
                    </div>
                    <p className="section-subtitle">Variable Length Subnet Mask Calculator for optimal subnet allocation.</p>

                    <form onSubmit={calculateVLSM}>
                        <div className="input-group">
                            <label className="input-label">Major Network IP (e.g., 192.168.1.0)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={vlsmNetwork}
                                onChange={(e) => setVlsmNetwork(e.target.value)}
                                placeholder="192.168.1.0"
                                required
                            />
                        </div>

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Subnets Required</h3>

                        {subnets.map((subnet, idx) => (
                            <div key={idx} className="vlsm-input-row">
                                <div className="input-group">
                                    <label className="input-label">Subnet Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={subnet.name}
                                        onChange={(e) => updateSubnet(idx, 'name', e.target.value)}
                                        placeholder="Name"
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Hosts Needed</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={subnet.hosts}
                                        onChange={(e) => updateSubnet(idx, 'hosts', e.target.value)}
                                        placeholder="Size"
                                        required
                                        min="1"
                                    />
                                </div>
                                {subnets.length > 1 && (
                                    <button type="button" className="remove-btn" onClick={() => removeSubnet(idx)}>
                                        🗑️
                                    </button>
                                )}
                            </div>
                        ))}

                        <button type="button" className="add-subnet-btn" onClick={addSubnet}>
                            + Add Another Subnet
                        </button>

                        {vlsmError && <div className="error-message">{vlsmError}</div>}

                        <button type="submit" className="btn btn-primary">Calculate Allocation</button>
                    </form>

                    {vlsmResult && (
                        <div className="subnet-results">
                            <h3 className="results-title">📊 VLSM Allocation</h3>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Subnet Name</th>
                                            <th>Needed</th>
                                            <th>Allocated</th>
                                            <th>Network Address</th>
                                            <th>CIDR</th>
                                            <th>Range</th>
                                            <th>Broadcast</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vlsmResult.map((res, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{res.name}</td>
                                                <td>{res.needed}</td>
                                                <td>{res.allocated}</td>
                                                <td className="mono">{res.address}</td>
                                                <td>/{res.cidr}</td>
                                                <td className="mono" style={{ fontSize: '0.85rem' }}>{res.range}</td>
                                                <td className="mono">{res.broadcast}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* NAT & Local IP Tab */}
            {activeTab === 'nat' && (
                <div className="glass-card tab-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '2rem' }}>🏠</span>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>NAT & Local IP Checker</h2>
                    </div>
                    <p className="section-subtitle">Understand the difference between your Local (Private) IP and Public IP.</p>

                    <div className="result-grid" style={{ marginBottom: '2rem' }}>
                        <div className="result-item highlight">
                            <span className="result-label">Your Local IP (Private)</span>
                            <span className="result-value" style={{ fontSize: '1.5rem', color: '#60a5fa' }}>{localIP}</span>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                {localIP.includes('Hidden')
                                    ? "Modern browsers hide this for privacy. To see it: Open Terminal/CMD and type 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)."
                                    : "Assigned by your router. Only visible inside your home/office network."}
                            </p>
                        </div>
                        <div className="result-item highlight">
                            <span className="result-label">Your Public IP (Internet)</span>
                            <span className="result-value" style={{ fontSize: '1.5rem', color: '#34d399' }}>{publicIP}</span>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                Assigned by your ISP. Visible to the entire internet.
                            </p>
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>🔍 Check IP Type</h3>
                        <form onSubmit={checkIPType} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label className="input-label">Enter any IP Address</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g., 192.168.1.50"
                                    value={checkIP}
                                    onChange={(e) => setCheckIP(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Check</button>
                        </form>

                        {ipTypeResult && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{ipTypeResult.icon}</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{ipTypeResult.type}</span>
                                </div>
                                {ipTypeResult.class && <div style={{ color: '#60a5fa', marginBottom: '0.5rem', fontWeight: 600 }}>{ipTypeResult.class}</div>}
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ipTypeResult.message}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubnetCalculator;
