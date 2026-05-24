import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { getWeatherMeta } from '../utils/weatherApi';
import type { WeatherData } from '../utils/weatherApi';

interface ForecastWidgetProps {
  data: WeatherData;
  isCelsius: boolean;
}

type TabType = 'hourly' | 'daily';

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({ data, isCelsius }) => {
  const [activeTab, setActiveTab] = useState<TabType>('hourly');
  const { hourly, daily, current } = data;

  // Find start index for hourly data (current hour)
  const currentHourStr = current.time.substring(0, 13) + ':00';
  let startIndex = hourly.time.findIndex((t) => t.startsWith(currentHourStr));
  if (startIndex === -1) startIndex = 0;

  // Slice next 24 hours
  const hourlyTimes = hourly.time.slice(startIndex, startIndex + 24);
  const hourlyTemps = hourly.temperature2m.slice(startIndex, startIndex + 24);
  const hourlyCodes = hourly.weatherCode.slice(startIndex, startIndex + 24);
  const hourlyPrecip = hourly.precipitationProbability.slice(startIndex, startIndex + 24);

  const convertTemp = (temp: number) => {
    return isCelsius ? temp : (temp * 9) / 5 + 32;
  };

  // Format hour (e.g. "15:00" -> "3 PM")
  const formatHour = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour} ${ampm}`;
  };

  // Format day name (e.g. "2026-05-23" -> "Saturday")
  const formatDayName = (isoString: string, index: number) => {
    if (index === 0) return 'Today';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Calculate daily scale for range bars
  // We need the absolute min/max temp over the 7 days to scale correctly
  const convertedMinTemps = daily.temperature2mMin.map(convertTemp);
  const convertedMaxTemps = daily.temperature2mMax.map(convertTemp);
  const absoluteMin = Math.min(...convertedMinTemps);
  const absoluteMax = Math.max(...convertedMaxTemps);
  const absoluteRange = absoluteMax - absoluteMin;

  // Render SVG Line Chart for Hourly temperatures
  const renderHourlyChart = () => {
    const width = 1600;
    const height = 160;
    const padding = 15;
    const paddingTop = 30;
    const paddingBottom = 20;
    
    const temps = hourlyTemps.map(convertTemp);
    const minVal = Math.min(...temps);
    const maxVal = Math.max(...temps);
    const range = maxVal - minVal || 1;

    const points = temps.map((temp, index) => {
      const x = (index / (temps.length - 1)) * (width - padding * 2) + padding;
      // Invert Y axis: higher temperature is at the top (low Y coordinate)
      const y = height - ((temp - minVal) / range) * (height - paddingTop - paddingBottom) - paddingBottom;
      return { x, y, temp };
    });

    // Generate SVG path using bezier curves for smooth lines
    const linePath = points.reduce((path, p, i, arr) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      // Control points for cubic bezier curves
      const cpX1 = arr[i - 1].x + (p.x - arr[i - 1].x) / 3;
      const cpY1 = arr[i - 1].y;
      const cpX2 = arr[i - 1].x + (2 * (p.x - arr[i - 1].x)) / 3;
      const cpY2 = p.y;
      return `${path} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }, '');

    // Area path for gradient fill under the line
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
      <div style={{ position: 'relative', marginTop: '16px', overflowX: 'auto', width: '100%', paddingBottom: '20px' }}>
        <div style={{ width: `${width}px`, height: `${height + 35}px`, position: 'relative' }}>
          <svg width={width} height={height} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--theme-accent)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--theme-accent)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Filled area path */}
            <motion.path
              d={areaPath}
              fill="url(#chartGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />

            {/* Stroke path */}
            <motion.path
              d={linePath}
              fill="none"
              stroke="var(--theme-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />

            {/* Value nodes and labels */}
            {points.map((p, index) => {
              if (index % 2 !== 0 && index !== 0 && index !== points.length - 1) return null; // limit labels to prevent crowding
              return (
                <g key={`point-${index}`}>
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="var(--theme-text-primary)"
                    stroke="var(--theme-accent)"
                    strokeWidth="1.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.02 }}
                  />
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    fill="var(--theme-text-primary)"
                    fontSize="11px"
                    fontWeight="600"
                    fontFamily="var(--font-display)"
                  >
                    {p.temp.toFixed(0)}°
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Corresponding timeline indicators under chart */}
          <div style={{ display: 'flex', position: 'absolute', bottom: '4px', left: `${padding}px`, right: `${padding}px`, justifyContent: 'space-between', color: 'var(--theme-text-secondary)', fontSize: '11px', fontWeight: 500 }}>
            {points.map((p, index) => {
              if (index % 2 !== 0 && index !== 0 && index !== points.length - 1) return null;
              return (
                <div key={`lbl-${index}`} style={{ width: '60px', textAlign: 'center', transform: 'translateX(-50%)', position: 'absolute', left: `${((p.x - padding) / (width - padding * 2)) * 100}%` }}>
                  {formatHour(hourlyTimes[index])}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="glass-panel"
      style={{
        padding: '32px',
        width: '100%',
        boxShadow: 'var(--shadow-premium)',
      }}
    >
      {/* Header and custom slide-pill tab selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
          Forecast
        </h2>

        {/* Tab pill selector */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.04)', position: 'relative' }}>
          {(['hourly', 'daily'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: activeTab === tab ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)',
                borderRadius: '8px',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1,
                outline: 'none',
                textTransform: 'capitalize',
                transition: 'color 0.2s ease',
              }}
            >
              {tab === 'hourly' ? 'Hourly (24h)' : 'Daily (7d)'}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabPill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    zIndex: -1,
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Render Panel */}
      <AnimatePresence mode="wait">
        {activeTab === 'hourly' ? (
          <motion.div
            key="hourly-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%' }}
          >
            {/* Scrollable list of weather indicators */}
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'thin' }}>
              {hourlyTimes.map((time, idx) => {
                const temp = convertTemp(hourlyTemps[idx]);
                const code = hourlyCodes[idx];
                const rainProb = hourlyPrecip[idx];
                const meta = getWeatherMeta(code, new Date(time).getHours() >= 6 && new Date(time).getHours() < 18);
                const Icon = (Icons as any)[meta.icon] || Icons.Cloud;

                return (
                  <motion.div
                    key={time}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02, type: 'spring', stiffness: 200, damping: 20 }}
                    style={{
                      flex: '0 0 84px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '16px 10px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.03)',
                      borderRadius: '14px',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--theme-text-secondary)', fontWeight: 500 }}>
                      {idx === 0 ? 'Now' : formatHour(time)}
                    </span>
                    
                    <span style={{ color: 'var(--theme-accent)', margin: '10px 0', display: 'flex', alignItems: 'center' }}>
                      <Icon size={24} />
                    </span>
                    
                    <span style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}>
                      {temp.toFixed(0)}°
                    </span>
                    
                    {rainProb > 0 ? (
                      <span style={{ fontSize: '9px', fontWeight: 600, color: '#38bdf8', marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <Icons.Droplets size={8} /> {rainProb}%
                      </span>
                    ) : (
                      <span style={{ fontSize: '9px', color: 'transparent', marginTop: '6px' }}>0%</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            {/* Visual SVG chart below */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', margin: '8px 0 0 4px' }}>
                <Icons.Activity size={14} style={{ color: 'var(--theme-accent)' }} />
                <span>Temperature Trend</span>
              </div>
              {renderHourlyChart()}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="daily-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {daily.time.map((time, idx) => {
              const min = convertedMinTemps[idx];
              const max = convertedMaxTemps[idx];
              const code = daily.weatherCode[idx];
              const rainSum = daily.precipitationSum[idx];
              const meta = getWeatherMeta(code, true);
              const Icon = (Icons as any)[meta.icon] || Icons.Cloud;

              // Apple Weather Range Bar calculations
              const leftPercent = ((min - absoluteMin) / absoluteRange) * 100;
              const rightPercent = ((absoluteMax - max) / absoluteRange) * 100;
              const barWidth = 100 - leftPercent - rightPercent;

              return (
                <motion.div
                  key={time}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 150px minmax(100px, 1fr)',
                    alignItems: 'center',
                    padding: '18px 20px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.02)',
                    gap: '16px',
                  }}
                >
                  {/* Day name */}
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--theme-text-primary)', textAlign: 'left' }}>
                    {formatDayName(time, idx)}
                  </span>

                  {/* Icon and Description */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                    <span style={{ color: 'var(--theme-accent)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <Icon size={18} />
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--theme-text-secondary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {meta.label}
                    </span>
                  </div>

                  {/* Range Meter Bar (Min - Range Track - Max) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
                    {/* Rain Sum Indicator if any rain is forecasted */}
                    {rainSum > 0 && (
                      <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginRight: '6px' }}>
                        <Icons.Droplets size={10} /> {rainSum.toFixed(1)}mm
                      </span>
                    )}

                    <span style={{ width: '28px', fontSize: '13px', fontWeight: 500, color: 'var(--theme-text-secondary)', textAlign: 'right' }}>
                      {min.toFixed(0)}°
                    </span>

                    {/* Apple Style Range Progress Bar */}
                    <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', position: 'relative' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: `${leftPercent}%`,
                          width: `${barWidth}%`,
                          height: '100%',
                          background: 'linear-gradient(to right, #60a5fa, #fbbf24)',
                          borderRadius: '2px',
                        }}
                      />
                    </div>

                    <span style={{ width: '28px', fontSize: '13px', fontWeight: 600, color: 'var(--theme-text-primary)', textAlign: 'left' }}>
                      {max.toFixed(0)}°
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
