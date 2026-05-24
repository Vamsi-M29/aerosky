import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudSun, RefreshCw, AlertTriangle } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { CurrentWeatherCard } from './CurrentWeatherCard';
import { WeatherStatsGrid } from './WeatherStatsGrid';
import { ForecastWidget } from './ForecastWidget';
import { WeatherBackground } from './WeatherBackground';
import { fetchWeatherData, getWeatherMeta } from '../utils/weatherApi';
import type { Location, WeatherData } from '../utils/weatherApi';

// Default premium starting city: London
const DEFAULT_LOCATION: Location = {
  id: 2643743,
  name: 'London',
  latitude: 51.5085,
  longitude: -0.1257,
  country: 'United Kingdom',
  admin1: 'England',
  country_code: 'GB',
};

export const WeatherDashboard: React.FC = () => {
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCelsius, setIsCelsius] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getWeatherData = async (loc: Location, refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchWeatherData(loc);
      setWeatherData(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve weather data. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch weather on location change
  useEffect(() => {
    getWeatherData(location);
  }, [location]);

  // Set the data-theme attribute on the document body dynamically
  useEffect(() => {
    if (weatherData) {
      const meta = getWeatherMeta(weatherData.current.weatherCode, weatherData.current.isDay);
      document.body.setAttribute('data-theme', meta.theme);
    } else {
      document.body.setAttribute('data-theme', 'clear-day');
    }
  }, [weatherData]);

  const handleRefresh = () => {
    getWeatherData(location, true);
  };

  const activeTheme = weatherData 
    ? getWeatherMeta(weatherData.current.weatherCode, weatherData.current.isDay).theme
    : 'clear-day';

  return (
    <div style={{ minHeight: '100vh', width: '100%', padding: '40px 16px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      {/* Background layer */}
      <WeatherBackground theme={activeTheme} />

      {/* Centering wrapper */}
      <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Header Container */}
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {/* Branding Logo & Controls */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--theme-accent)',
                }}
              >
                <CloudSun size={24} />
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '-0.75px',
                  color: 'var(--theme-text-primary)',
                }}
              >
                AeroSky
              </span>
            </div>

            {/* Unit Toggle and Refresh button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '10px',
                  color: 'var(--theme-text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                className="glass-card-btn"
              >
                <RefreshCw
                  size={16}
                  style={{
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                  }}
                />
              </button>

              {/* Toggle unit C / F */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '3px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <button
                  onClick={() => setIsCelsius(true)}
                  style={{
                    background: isCelsius ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: 'none',
                    borderRadius: '9px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isCelsius ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  °C
                </button>
                <button
                  onClick={() => setIsCelsius(false)}
                  style={{
                    background: !isCelsius ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: 'none',
                    borderRadius: '9px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: !isCelsius ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  °F
                </button>
              </div>
            </div>
          </div>

          {/* Live Search Bar */}
          <SearchBar onSelectLocation={setLocation} />
        </header>

        {/* Main Content Layout */}
        <main style={{ width: '100%' }}>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '3px solid rgba(255,255,255,0.06)',
                    borderTopColor: 'var(--theme-accent)',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <p style={{ color: 'var(--theme-text-secondary)', fontSize: '15px', fontWeight: 500 }}>
                  Tracking weather conditions...
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '48px',
                  textAlign: 'center',
                  maxWidth: '500px',
                  margin: '80px auto 0',
                  gap: '16px',
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                }}
              >
                <AlertTriangle size={48} style={{ color: '#ef4444' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Unable to Retrieve Weather</h3>
                <p style={{ color: 'var(--theme-text-secondary)', fontSize: '14px' }}>{error}</p>
                <button
                  onClick={() => getWeatherData(location)}
                  style={{
                    background: 'var(--theme-accent)',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '8px',
                  }}
                >
                  Try Again
                </button>
              </motion.div>
            ) : weatherData ? (
              <motion.div
                key="dashboard-content"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
              >
                {/* Primary Cards Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '24px',
                    width: '100%',
                  }}
                  className="desktop-layout-grid"
                >
                  <CurrentWeatherCard data={weatherData} isCelsius={isCelsius} />
                  <ForecastWidget data={weatherData} isCelsius={isCelsius} />
                </div>

                {/* Stats Cards Section */}
                <div style={{ width: '100%' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      fontWeight: 700,
                      marginBottom: '16px',
                      textAlign: 'left',
                      color: 'var(--theme-text-primary)',
                    }}
                  >
                    Conditions Details
                  </h3>
                  <WeatherStatsGrid data={weatherData} />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-card-btn:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
        @media (min-width: 900px) {
          .desktop-layout-grid {
            grid-template-columns: 380px minmax(0, 1fr) !important;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};
