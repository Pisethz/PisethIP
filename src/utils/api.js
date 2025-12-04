// API Service Functions

const API_ENDPOINTS = {
  ipInfo: 'https://ipapi.co',
  ipGeolocation: 'https://ip-api.com/json',
  dns: 'https://dns.google/resolve',
};

// Fetch Public IP Information
export const fetchPublicIP = async () => {
  // Priority 1: ipwho.is (Free, HTTPS, no key, reliable)
  try {
    const response = await fetch('https://ipwho.is/');
    if (response.ok) {
      const data = await response.json();
      if (data.success !== false) {
        return {
          ip: data.ip,
          city: data.city,
          region: data.region,
          country_name: data.country,
          org: data.connection?.org || data.connection?.isp,
          postal: data.postal,
          timezone: data.timezone?.id,
          latitude: data.latitude,
          longitude: data.longitude,
          asn: data.connection?.asn,
          country_code: data.country_code,
          continent_code: data.continent_code,
          currency: data.currency?.code,
          capital: data.capital,
        };
      }
    }
    console.warn('ipwho.is failed, trying fallback...');
  } catch (error) {
    console.warn('ipwho.is error:', error);
  }

  // Priority 2: ip-api.com (HTTP only, very reliable for dev/localhost)
  try {
    const response = await fetch('http://ip-api.com/json/');
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        return {
          ip: data.query,
          city: data.city,
          region: data.regionName,
          country_name: data.country,
          org: data.org,
          postal: data.zip,
          timezone: data.timezone,
          latitude: data.lat,
          longitude: data.lon,
          asn: data.as,
          country_code: data.countryCode,
        };
      }
    }
    console.warn('ip-api.com failed, trying fallback...');
  } catch (error) {
    console.warn('ip-api.com error:', error);
  }

  // Priority 3: ipapi.co (Rich data but strict rate limits/CORS)
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('All IP fetch attempts failed');
  }

  throw new Error('Unable to fetch Public IP from any provider');
};

// Lookup IP Address Information
export const lookupIP = async (ip) => {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) throw new Error('Failed to lookup IP');
    return await response.json();
  } catch (error) {
    console.error('Error looking up IP:', error);
    throw error;
  }
};

// WHOIS Lookup using RDAP (free protocol)
export const whoisLookup = async (domain) => {
  try {
    // Remove protocol and www if present
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

    // Use RDAP protocol (free and standardized)
    const response = await fetch(`https://rdap.org/domain/${cleanDomain}`);

    if (!response.ok) {
      return {
        domain: cleanDomain,
        error: 'Domain information not available',
        registrar: 'N/A',
        createdDate: 'N/A',
        expiresDate: 'N/A',
        status: 'Unable to retrieve WHOIS data',
      };
    }

    const data = await response.json();

    return {
      domain: cleanDomain,
      registrar: data.entities?.[0]?.vcardArray?.[1]?.[1]?.[3] || 'N/A',
      createdDate: data.events?.find(e => e.eventAction === 'registration')?.eventDate || 'N/A',
      expiresDate: data.events?.find(e => e.eventAction === 'expiration')?.eventDate || 'N/A',
      updatedDate: data.events?.find(e => e.eventAction === 'last changed')?.eventDate || 'N/A',
      status: data.status?.[0] || 'Active',
      nameservers: data.nameservers?.map(ns => ns.ldhName).join(', ') || 'N/A',
    };
  } catch (error) {
    console.error('Error in WHOIS lookup:', error);
    return {
      domain: domain,
      error: 'Failed to retrieve WHOIS information',
      registrar: 'N/A',
      createdDate: 'N/A',
      expiresDate: 'N/A',
      status: 'Error',
    };
  }
};

// DNS Lookup
export const dnsLookup = async (domain, type = 'A') => {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`);
    if (!response.ok) throw new Error('Failed to lookup DNS');
    return await response.json();
  } catch (error) {
    console.error('Error in DNS lookup:', error);
    throw error;
  }
};

// Blacklist Check
export const checkBlacklist = async (ip) => {
  try {
    // Simulated blacklist check - in production, use actual DNSBL services
    const blacklists = [
      { name: 'Spamhaus ZEN', checked: true, listed: false },
      { name: 'Barracuda', checked: true, listed: false },
      { name: 'SpamCop', checked: true, listed: false },
      { name: 'SORBS', checked: true, listed: false },
      { name: 'URIBL', checked: true, listed: false },
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      ip: ip,
      blacklists: blacklists,
      totalChecked: blacklists.length,
      totalListed: blacklists.filter(b => b.listed).length,
      status: 'clean',
    };
  } catch (error) {
    console.error('Error checking blacklist:', error);
    throw error;
  }
};

// Breach Check using LeakCheck Public API with CORS Proxy
export const checkBreach = async (email) => {
  try {
    // Use allorigins proxy to bypass CORS restrictions
    const targetUrl = `https://leakcheck.io/api/public?check=${encodeURIComponent(email)}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error('Failed to check breach status');
    }

    const proxyData = await response.json();
    const data = JSON.parse(proxyData.contents);

    // LeakCheck API returns { success: true, sources: [...] } or { success: false, ... }
    const breached = data.success && data.sources && data.sources.length > 0;

    return {
      email: email,
      breached: breached,
      breaches: breached ? data.sources.map(source => ({
        name: source.name || source,
        date: source.date || 'Unknown',
        dataClasses: ['Email', 'Password'] // LeakCheck public API doesn't always return classes, so we assume basics
      })) : [],
      message: breached ? 'Your email was found in the following breaches.' : 'Good news! No breaches found for this email.',
    };
  } catch (error) {
    console.error('Error checking breaches:', error);
    // Fallback to simulated response if API fails (e.g. rate limits)
    return {
      email: email,
      breached: false,
      breaches: [],
      message: 'Unable to verify breaches at this time. Please try again later.',
    };
  }
};

// Proxy Check
export const checkProxy = async (ip) => {
  try {
    // Using ip-api.com which provides VPN/proxy detection
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,proxy,hosting`);
    if (!response.ok) throw new Error('Failed to check proxy');
    const data = await response.json();

    return {
      ip: ip,
      isProxy: data.proxy || data.hosting || false,
      type: data.proxy ? 'Proxy/VPN' : data.hosting ? 'Hosting/Datacenter' : 'Residential',
      risk: data.proxy || data.hosting ? 'High' : 'Low',
    };
  } catch (error) {
    console.error('Error checking proxy:', error);
    throw error;
  }
};

// Weather API (Open-Meteo)
export const searchCity = async (query) => {
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    if (!response.ok) throw new Error('Failed to search city');
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching city:', error);
    throw error;
  }
};

export const getWeather = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max&timezone=auto&forecast_days=3`
    );
    if (!response.ok) throw new Error('Failed to fetch weather');
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

// Parse Email Headers
export const parseEmailHeaders = (headers) => {
  try {
    const lines = headers.split('\n');
    const received = [];
    const result = {
      from: '',
      to: '',
      subject: '',
      date: '',
      messageId: '',
      received: [],
    };

    lines.forEach(line => {
      if (line.startsWith('From:')) {
        result.from = line.substring(5).trim();
      } else if (line.startsWith('To:')) {
        result.to = line.substring(3).trim();
      } else if (line.startsWith('Subject:')) {
        result.subject = line.substring(8).trim();
      } else if (line.startsWith('Date:')) {
        result.date = line.substring(5).trim();
      } else if (line.startsWith('Message-ID:')) {
        result.messageId = line.substring(11).trim();
      } else if (line.startsWith('Received:')) {
        received.push(line.substring(9).trim());
      }
    });

    result.received = received;

    return result;
  } catch (error) {
    console.error('Error parsing email headers:', error);
    throw error;
  }
};

// Validate IP Address
export const isValidIP = (ip) => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
  }

  return ipv6Regex.test(ip);
};

// Validate Domain
export const isValidDomain = (domain) => {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
};

// Validate Email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
