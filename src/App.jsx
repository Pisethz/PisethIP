import { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PublicIP from './components/PublicIP';
import IPLookup from './components/IPLookup';
import WhoisLookup from './components/WhoisLookup';
import DNSLookup from './components/DNSLookup';
import BlacklistCheck from './components/BlacklistCheck';
import BreachCheck from './components/BreachCheck';
import ProxyCheck from './components/ProxyCheck';
import TraceEmail from './components/TraceEmail';
import SpeedTest from './components/SpeedTest';
import WeatherCheck from './components/WeatherCheck';
import SubnetCalculator from './components/SubnetCalculator';
import ImageOSINT from './components/ImageOSINT';
import './App.css';

function AppContent() {
  const [activeView, setActiveView] = useState('home');

  const renderView = () => {
    switch (activeView) {
      case 'home': return <Home onNavigate={setActiveView} />;
      case 'publicip': return <PublicIP />;
      case 'iplookup': return <IPLookup />;
      case 'whois': return <WhoisLookup />;
      case 'dns': return <DNSLookup />;
      case 'blacklist': return <BlacklistCheck />;
      case 'breach': return <BreachCheck />;
      case 'proxy': return <ProxyCheck />;
      case 'email': return <TraceEmail />;
      case 'speedtest': return <SpeedTest />;
      case 'weather': return <WeatherCheck />;
      case 'subnet': return <SubnetCalculator />;
      case 'imageosint': return <ImageOSINT />;
      default: return <Home onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="app">
      <Navbar activeView={activeView} onNavigate={setActiveView} />
      <main className="app-container">
        <div className="view-content">
          {renderView()}
        </div>
      </main>
      <div className="particles"></div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
