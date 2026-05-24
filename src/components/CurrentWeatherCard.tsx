import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import * as Icons from 'lucide-react';
import { getWeatherMeta } from '../utils/weatherApi';
import type { WeatherData } from '../utils/weatherApi';

interface CurrentWeatherCardProps {
  data: WeatherData;
  isCelsius: boolean;
}

// Custom component to animate numbers to 1 decimal place
const AnimatedTemp: React.FC<{ value: number }> = ({ value }) => {
  const count = useMotionValue(value - 5); // start slightly below the target for a nice rising effect
  const displayValue = useTransform(count, (latest) => latest.toFixed(1));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [value, count]);

  return <motion.span>{displayValue}</motion.span>;
};

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({ data, isCelsius }) => {
  const { current, location, daily } = data;
  const meta = getWeatherMeta(current.weatherCode, current.isDay);
  
  // Dynamic Lucide Icon picker
  const IconComponent = (Icons as any)[meta.icon] || Icons.Cloud;

  // Convert temperature to Fahrenheit if selected
  const convertTemp = (temp: number) => {
    return isCelsius ? temp : (temp * 9) / 5 + 32;
  };

  const currentTemp = convertTemp(current.temperature);
  const highTemp = convertTemp(daily.temperature2mMax[0]);
  const lowTemp = convertTemp(daily.temperature2mMin[0]);
  
  // Format current time
  const formatLocalTime = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel dashboard-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        boxShadow: 'var(--shadow-premium)',
      }}
    >
      {/* Decorative floating glow bubble */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--theme-accent-rgb), 0.12) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(15px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ zIndex: 1, width: '100%' }}>
        {/* City and Country */}
        <motion.h1
          key={location.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: '32px',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            margin: '0 0 4px',
            color: 'var(--theme-text-primary)',
            letterSpacing: '-0.5px',
          }}
        >
          {location.name}
        </motion.h1>
        
        {/* Country/State and Date */}
        <p style={{ color: 'var(--theme-text-secondary)', fontSize: '14px', fontWeight: 500, marginBottom: '24px' }}>
          {[location.admin1, location.country].filter(Boolean).join(', ')} • {formatLocalTime()}
        </p>

        {/* Weather Icon and Main Temperature */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '32px', margin: '16px 0 24px' }}>
          {/* Rotating and hovering Weather Icon container */}
          <motion.div
            key={current.weatherCode + String(current.isDay)}
            initial={{ scale: 0.7, rotate: -15, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="current-icon-container animate-float"
          >
            <IconComponent strokeWidth={1.5} />
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', fontFamily: 'var(--font-display)' }}>
              <span className="main-temp-text">
                <AnimatedTemp key={currentTemp} value={currentTemp} />
              </span>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  marginTop: '8px',
                  color: 'var(--theme-accent)',
                }}
              >
                °{isCelsius ? 'C' : 'F'}
              </span>
            </div>
            
            {/* Condition Label */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--theme-text-primary)',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {meta.label}
            </motion.div>
          </div>
        </div>

        {/* High / Low & Feels Like */}
        <div className="temp-stats-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--theme-text-secondary)' }}>
            <Icons.ArrowUp size={16} style={{ color: '#ef4444' }} />
            <span>High: </span>
            <strong style={{ color: 'var(--theme-text-primary)' }}>{highTemp.toFixed(0)}°</strong>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--theme-text-secondary)' }}>
            <Icons.ArrowDown size={16} style={{ color: '#60a5fa' }} />
            <span>Low: </span>
            <strong style={{ color: 'var(--theme-text-primary)' }}>{lowTemp.toFixed(0)}°</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--theme-text-secondary)' }}>
            <Icons.Thermometer size={16} style={{ color: 'var(--theme-accent)' }} />
            <span>Feels like: </span>
            <strong style={{ color: 'var(--theme-text-primary)' }}>{convertTemp(current.apparentTemperature).toFixed(0)}°</strong>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
