import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wind, 
  Droplets, 
  Sun, 
  Gauge, 
  Compass, 
  Cloud 
} from 'lucide-react';
import { getUvDescription, getAqiMeta } from '../utils/weatherApi';
import type { WeatherData } from '../utils/weatherApi';

interface WeatherStatsGridProps {
  data: WeatherData;
}

export const WeatherStatsGrid: React.FC<WeatherStatsGridProps> = ({ data }) => {
  const { current, daily, airQuality } = data;

  const aqiMeta = getAqiMeta(airQuality.aqi);
  const uvVal = daily.uvIndexMax[0] || 0;
  const uvDesc = getUvDescription(uvVal);

  // Dynamic wind speed rotation speed
  // Speed is in km/h. Let's convert to animation duration:
  // High wind = fast rotation (0.8s duration), low wind = slow (6s duration)
  const getWindSpeedDuration = (speed: number) => {
    if (speed <= 0) return 0;
    return Math.max(0.5, 20 / speed); // Inverse relation
  };

  const windDuration = getWindSpeedDuration(current.windSpeed);

  // Animation variants for staggered grid items
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
  };

  const statItems = [
    {
      title: 'Wind Speed',
      value: `${current.windSpeed.toFixed(1)} km/h`,
      icon: (
        <motion.div
          animate={windDuration > 0 ? { rotate: 360 } : {}}
          transition={
            windDuration > 0
              ? { repeat: Infinity, duration: windDuration, ease: 'linear' }
              : {}
          }
          style={{ display: 'inline-block', color: 'var(--theme-accent)', transformOrigin: 'center' }}
        >
          <Wind size={22} />
        </motion.div>
      ),
      description: 'Current speed of wind gusts',
      footer: (
        <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)', marginTop: '8px' }}>
          Wind direction: Auto-adjusting
        </div>
      ),
    },
    {
      title: 'Humidity',
      value: `${current.relativeHumidity}%`,
      icon: <Droplets size={22} style={{ color: '#38bdf8' }} />,
      description: 'The amount of moisture in the air',
      footer: (
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', height: '4px', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${current.relativeHumidity}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: '#38bdf8', borderRadius: '2px' }}
          />
        </div>
      ),
    },
    {
      title: 'Air Quality Index',
      value: airQuality.aqi,
      icon: <Gauge size={22} style={{ color: aqiMeta.color }} />,
      description: aqiMeta.label,
      footer: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: aqiMeta.color, boxShadow: `0 0 8px ${aqiMeta.color}`, display: 'inline-block' }} />
            <span style={{ fontSize: '11px', color: 'var(--theme-text-secondary)', lineHeight: 1.2 }}>{aqiMeta.description}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'UV Index',
      value: uvVal.toFixed(1),
      icon: <Sun size={22} style={{ color: '#fbbf24' }} />,
      description: uvDesc,
      footer: (
        <div style={{ width: '100%', marginTop: '12px' }}>
          {/* Custom scale tracker */}
          <div style={{ position: 'relative', height: '4px', background: 'linear-gradient(to right, #10b981 0%, #eab308 40%, #f97316 75%, #ef4444 100%)', borderRadius: '2px' }}>
            <motion.div
              initial={{ left: '0%' }}
              animate={{ left: `${Math.min(100, (uvVal / 12) * 100)}%` }}
              transition={{ duration: 1, type: 'spring' as const }}
              style={{
                position: 'absolute',
                top: '-3px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid #000000',
                boxShadow: '0 0 4px rgba(0,0,0,0.5)',
                transform: 'translateX(-50%)'
              }}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Pressure',
      value: `${current.pressure.toFixed(0)} hPa`,
      icon: <Compass size={22} style={{ color: '#a855f7' }} />,
      description: current.pressure > 1013 ? 'High Pressure System' : 'Low Pressure System',
      footer: (
        <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)', marginTop: '8px' }}>
          Standard pressure is 1013.25 hPa
        </div>
      ),
    },
    {
      title: 'Cloud Cover',
      value: `${current.cloudCover}%`,
      icon: <Cloud size={22} style={{ color: '#94a3b8' }} />,
      description: current.cloudCover <= 10 ? 'Clear conditions' : current.cloudCover <= 50 ? 'Partly Cloudy' : 'Overcast Sky',
      footer: (
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', height: '4px', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${current.cloudCover}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: '#cbd5e1', borderRadius: '2px' }}
          />
        </div>
      ),
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="stats-grid"
      style={{
        display: 'grid',
        gap: '20px',
        width: '100%',
      }}
    >
      {statItems.map((item) => (
        <motion.div
          key={item.title}
          variants={itemVariants}
          className="glass-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            textAlign: 'left',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--theme-text-secondary)' }}>
                {item.title}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </span>
            </div>
            
            <div style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
              {item.value}
            </div>
            
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--theme-text-secondary)', marginTop: '2px' }}>
              {item.description}
            </div>
          </div>
          
          {item.footer}
        </motion.div>
      ))}
    </motion.div>
  );
};
